// My Week Town: a free, open-source AI model that runs inside the browser (WebLLM + WebGPU).
// It writes each question from the agent's log and the admin's model instructions.
// Nothing leaves the device. If the device can't run it, or the output is broken, the app uses the pre-written questions.

const LIB_URL = "https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.85/+esm";

const AI = {
  state: { status: "idle", progress: 0, text: "", model: null },
  engine: null,
  lib: null,
  loading: null,

  settings() { return Object.assign({ enabled: false, model: AI_MODELS[1].id }, ST.get("ai", {})); },
  save(patch) { ST.set("ai", Object.assign(AI.settings(), patch)); AI.emit(); },

  emit() { window.dispatchEvent(new CustomEvent("mwt-ai", { detail: AI.state })); },
  set(patch) { Object.assign(AI.state, patch); AI.emit(); },

  async supported() {
    if (!navigator.gpu) return false;
    try { return !!(await navigator.gpu.requestAdapter()); } catch (e) { return false; }
  },

  // Download (first time) and start the chosen model. Later loads come from the browser cache.
  async load() {
    if (AI.broken) throw new Error("broken");
    const model = AI.settings().model;
    if (AI.engine && AI.state.model === model) return AI.engine;
    if (AI.loading) return AI.loading;
    AI.loading = (async () => {
      if (!(await AI.supported())) { AI.set({ status: "unsupported", text: "This device can't run the in-browser model (no WebGPU)." }); throw new Error("unsupported"); }
      AI.set({ status: "loading", progress: 0, text: "Loading the AI library…" });
      AI.lib = AI.lib || await import(LIB_URL);
      if (AI.engine) { try { await AI.engine.unload(); } catch (e) {} AI.engine = null; }
      AI.engine = await AI.lib.CreateMLCEngine(model, {
        initProgressCallback: function (r) { AI.set({ status: "loading", progress: r.progress || 0, text: r.text || "" }); }
      }, {
        // Small chunks keep each GPU job short, so built-in laptop GPUs don't time out (Windows resets a GPU busy for ~2 s)
        prefill_chunk_size: 128,
        context_window_size: 2048
      });
      AI.set({ status: "ready", progress: 1, text: "Ready", model: model });
      return AI.engine;
    })();
    try { return await AI.loading; }
    catch (e) { if (AI.state.status !== "unsupported") AI.set({ status: "error", text: String(e && e.message || e) }); throw e; }
    finally { AI.loading = null; }
  },

  // One question for one stop. Returns { q, options: [{k, t}], icon } or null if the output can't be used.
  async writeQuestion(st) {
    const area = AREAS[st.area];
    const prios = area.items.map(function (x) { return x[0] + " = " + x[1]; }).join("; ");
    // Small models write much better when they vary a tested situation than when they invent one from nothing.
    // The base is this stop's own situation; each option keeps the priority it stands for.
    const base = SCN[st.scn];
    const baseObj = { q: base.q, options: {} };
    base.options.forEach(function (o) { baseObj.options[o[0]] = o[1]; });
    const tplObj = { q: "...", options: {}, icon: "..." };
    area.items.forEach(function (x) { tplObj.options[x[0]] = "..."; });
    const context = st.type === "choice" ? "This week the user's agent did this: \"" + base.did + "\". " : "";
    const user = [
      "Area: " + area.name + " (" + area.about + "). " + context,
      "Here is an everyday question with 4 options: " + JSON.stringify(baseObj),
      "Write a FRESH variation of it: the same kind of everyday moment, but change small details (time, place, food, price, weather).",
      "The question speaks to the user as \"you\", is at most 22 words and ends with a question mark. Never mention AI, an agent or a cat.",
      "Keep each option's meaning: " + prios + ". Each option is a concrete choice of at most 9 words.",
      "Pick one icon from: " + AI.iconsFor(st) + ".",
      "Fill in this JSON and reply with it only: " + JSON.stringify(tplObj)
    ].join("\n");
    const instructions = ST.get("instructions", null) || MODEL.text;
    const t0 = performance.now();
    let raw = "";
    try {
      const engine = await AI.load();
      const res = await engine.chat.completions.create({
        messages: [{ role: "system", content: instructions + "\n\nReply with one JSON object only." }, { role: "user", content: user }],
        temperature: 0.7, max_tokens: 260,
      });
      raw = res.choices[0].message.content || "";
      const out = AI.validate(st, raw);
      AI.log({ area: area.name, type: st.type, ok: !!out, ms: Math.round(performance.now() - t0), raw: raw });
      return out;
    } catch (e) {
      const msg = String(e && e.message || e);
      AI.log({ area: area.name, type: st.type, ok: false, ms: Math.round(performance.now() - t0), raw: raw || msg });
      // A broken engine is restarted on the next call (the model itself stays cached)
      if (/disposed|deleted object|device|lost/i.test(msg)) { AI.broken = true; AI.engine = null; AI.set({ status: "error", text: "The model stopped working. Reload the page to restart it." }); }
      return null;
    }
  },

  // Keep only output the game can use: a real question and one option for each of the area's 4 priorities
  validate(st, raw) {
    let j;
    // Small models often wrap JSON in ``` fences or leave keys unquoted: tidy that up first
    raw = String(raw).replace(/```(json)?/gi, "").replace(/([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:/g, '$1"$2":');
    try { j = JSON.parse(raw); } catch (e) { const m = raw.match(/\{[\s\S]*\}/); if (!m) return null; try { j = JSON.parse(m[0]); } catch (e2) { return null; } }
    if (!j || typeof j.q !== "string" || j.q.trim().length < 10 || j.q.length > 240) return null;
    const items = AREAS[st.area].items, got = {};
    // Accept options as an object {key: text} or a list [{key, text}]; match near-miss keys ("comfortable" -> "comfy")
    const pairs = Array.isArray(j.options) ? j.options.map(function (o) { return o ? [o.key, o.text] : [null, null]; })
      : (j.options && typeof j.options === "object" ? Object.keys(j.options).map(function (k) { return [k, j.options[k]]; }) : []);
    pairs.forEach(function (pair) {
      const k = String(pair[0] || "").toLowerCase(), t = pair[1];
      if (!k || typeof t !== "string" || t.trim().length < 2 || t.length > 90 || t.trim() === "...") return;
      const hit = items.filter(function (x) { return x[0] === k || k.indexOf(x[0]) === 0 || x[0].indexOf(k) === 0 || x[1].toLowerCase().indexOf(k) >= 0; })[0];
      if (hit && !got[hit[0]]) got[hit[0]] = t.trim();
    });
    const have = items.filter(function (x) { return got[x[0]]; }).length;
    if (have < 3) return null;
    // Quality filter: no talk of AI/agents/cats, a real question, no repeated options
    const banned = /\b(ai|agent|agents|assistant|cat|cat's|chatbot)\b/i;
    const q = j.q.trim();
    if (banned.test(q) || q.indexOf("?") < 0 || q.length > 170) return null;
    const texts = items.map(function (x) { return (got[x[0]] || "").toLowerCase(); }).filter(Boolean);
    if (texts.some(function (t) { return banned.test(t); })) return null;
    if (new Set(texts).size !== texts.length) return null;
    // At most one missing option is filled in from the pre-written situation, for the same priority
    const opts = items.map(function (x) { return { k: x[0], t: got[x[0]] || optionText(st.scn, x[0]) }; });
    opts.sort(function () { return Math.random() - 0.5; }); // the agent's choice isn't always in the same place
    return { q: q, options: opts, icon: AI.iconsFor(st).split(", ").indexOf(j.icon) >= 0 ? j.icon : SCN[st.scn].icon, repaired: have < 4 };
  },

  // Write every question for a game, one by one. onStep(done, total) reports progress. Stops that fail keep pre-written text.
  async generate(stops, onStep, isCancelled) {
    const t0 = performance.now();
    let made = 0;
    for (let i = 0; i < stops.length; i++) {
      if (isCancelled && isCancelled()) break;
      const st = stops[i];
      if (st.agentKey && st.agentKey.indexOf("custom:") === 0) continue; // a typed priority can't be one of 4 fixed keys
      if (AI.broken) break;
      const out = await AI.writeQuestion(st);
      if (out) { st.ai = out; st.icon = pickIcon(out.icon); made++; }
      if (onStep) onStep(i + 1, stops.length);
    }
    const runs = ST.get("aiRuns", []);
    runs.push({ at: Date.now(), model: AI.state.model, questions: stops.length, made: made, ms: Math.round(performance.now() - t0) });
    ST.set("aiRuns", runs.slice(-30));
    return made;
  },

  // A short list of likely icons keeps the prompt small: the area's own group plus a few general ones
  iconsFor(st) {
    const groups = { food: "Food", groceries: "Food", commute: "Travel", weekend: "Health and fun", chores: "Home", fitness: "Health and fun", gifts: "People" };
    const keys = Object.keys(ICONS[groups[st.area]] || {});
    return keys.join(", ");
  },

  allKeys() {
    const k = [];
    Object.keys(AREAS).forEach(function (a) { AREAS[a].items.forEach(function (x) { if (k.indexOf(x[0]) < 0) k.push(x[0]); }); });
    return k;
  },

  interrupt() { try { AI.engine && AI.engine.interruptGenerate(); } catch (e) {} },

  log(entry) {
    const l = ST.get("aiLog", []);
    l.push(Object.assign({ at: Date.now() }, entry));
    ST.set("aiLog", l.slice(-40));
  }
};

window.MWT_AI = AI;
