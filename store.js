// My Week Town: shared logic for the user app and the admin page.
// Storage, the catch-up with the agent, building questions, and sending updates back to the agent.

var MEM = {}; // fallback when the browser blocks storage
var ST = {
  get: function (k, d) {
    try { var v = localStorage.getItem("mwt-" + k); return v == null ? d : JSON.parse(v); }
    catch (e) { return k in MEM ? MEM[k] : d; }
  },
  set: function (k, v) {
    MEM[k] = v;
    try { localStorage.setItem("mwt-" + k, JSON.stringify(v)); } catch (e) {}
  }
};
var DAY = 864e5, MIN_Q = 3, MAX_Q = 5;

function now() { return Date.now(); }
function ago(t) {
  if (!t) return "never";
  var s = Math.max(0, (now() - t) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return Math.round(s / 60) + " min ago";
  if (s < DAY / 1000) return Math.round(s / 3600) + " h ago";
  var d = Math.round(s * 1000 / DAY);
  return d + (d === 1 ? " day ago" : " days ago");
}
function when(t) {
  var d = new Date(t);
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" }) + ", " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

/* ---------- The agent's picture of the user ---------- */
function profile() {
  var p = ST.get("profile", null);
  if (!p) {
    p = {};
    Object.keys(AREAS).forEach(function (a) { p[a] = { order: AREAS[a].agent.slice(), custom: null, updatedAt: null }; });
    ST.set("profile", p);
  }
  return p;
}
function labelOf(area, k) {
  if (k.indexOf("custom:") === 0) return k.slice(7);
  var it = AREAS[area].items.filter(function (x) { return x[0] === k; })[0];
  return it ? it[1] : k;
}
// Options for a choice question: the area's 4 priorities (a custom one replaces the last if the agent now uses it)
function optionsFor(area, agentKey) {
  var items = AREAS[area].items.map(function (x) { return { k: x[0], t: x[1] }; });
  if (agentKey && agentKey.indexOf("custom:") === 0) items[3] = { k: agentKey, t: labelOf(area, agentKey) };
  return items;
}

/* ---------- The agent's log ---------- */
function feed() {
  var f = ST.get("feed", null);
  if (!f) {
    var t = now();
    f = SEED.map(function (e, i) { return Object.assign({ id: "s" + i, at: Math.round(t - e.daysAgo * DAY) }, e); });
    ST.set("feed", f);
  }
  return f;
}
function eventById(id) { return feed().filter(function (e) { return e.id === id; })[0]; }

// Admin: the agent does new things. It chooses by its current picture of the user.
function simulateActivity(count) {
  count = count || 3;
  var f = feed(), p = profile(), idx = ST.get("simIdx", 0), t = now();
  var after = Math.max(ST.get("lastSync", 0) || 0, t - 5 * 60000); // new activity always lands after the last catch-up
  for (var i = 0; i < count; i++) {
    var tpl = SIM[(idx + i) % SIM.length], pr = p[tpl.area], top = pr.order[0];
    f.push({ id: "n" + t + "-" + i, at: Math.min(t, after + (i + 1) * 1000), area: tpl.area, choice: tpl.choice, agentKey: top,
      did: tpl.did + " It went for " + labelOf(tpl.area, top).toLowerCase() + ".",
      question: tpl.question, followedUpdate: pr.updatedAt || null });
  }
  var r = SIM_ROUTINE[idx % SIM_ROUTINE.length];
  f.push(Object.assign({ id: "r" + t, at: Math.min(t, after + (count + 1) * 1000), routine: true }, r));
  ST.set("simIdx", idx + count);
  ST.set("feed", f);
}

/* ---------- Catch-up: runs every time the user starts a game ---------- */
function catchUp() {
  var t = now(), last = ST.get("lastSync", null), f = feed();
  var from = last || t - 7 * DAY;
  var fetched = f.filter(function (e) { return e.at > from && e.at <= t; });
  var fresh = fetched.filter(function (e) { return !e.routine; }).map(function (e) { return e.id; });
  var pending = ST.get("pending", []);
  var queue = pending.concat(fresh.filter(function (id) { return pending.indexOf(id) < 0; }));
  queue.sort(function (a, b) { return eventById(a).at - eventById(b).at; });
  var take = queue.slice(0, MAX_Q), carried = queue.slice(MAX_Q);

  var qs = take.map(function (id) { return { type: "choice", ev: eventById(id) }; });
  // Too little new? Top up with quick taste checks from areas not checked lately
  if (qs.length < MIN_Q) {
    var used = take.map(function (id) { return eventById(id).area; });
    var asked = ST.get("askedAreas", {});
    Object.keys(REFRESH)
      .filter(function (a) { return used.indexOf(a) < 0; })
      .sort(function (a, b) { return (asked[a] || 0) - (asked[b] || 0); })
      .slice(0, MIN_Q - qs.length)
      .forEach(function (a) { qs.push({ type: "rank", area: a }); asked[a] = t; });
    ST.set("askedAreas", asked);
  }

  var asked2 = ST.get("askedEvents", []);
  ST.set("askedEvents", asked2.concat(take));
  ST.set("pending", carried);
  var log = ST.get("syncs", []);
  log.push({ at: t, from: last, fetched: fetched.length, crucial: fresh.length, routine: fetched.length - fresh.length,
    questions: qs.length, choices: take.length, checks: qs.length - take.length, carried: carried.length, ok: true });
  ST.set("syncs", log);
  ST.set("lastSync", t);
  return { qs: qs, last: last, fresh: fresh.length, choices: take.length, carried: carried.length };
}

/* ---------- Sending the user's chosen updates to the agent ---------- */
function sendUpdates(list) {
  var p = profile(), rules = ST.get("rules", []), t = now();
  list.forEach(function (u) {
    var pr = p[u.area];
    if (u.order) pr.order = u.order.slice();
    else pr.order = [u.key].concat(pr.order.filter(function (k) { return k !== u.key; }));
    pr.updatedAt = t;
    rules.push({ at: t, area: u.area, text: u.fix, reply: u.fixed });
  });
  ST.set("profile", p);
  ST.set("rules", rules);
}
function saveSession(r) { var s = ST.get("sessions", []); s.push(r); ST.set("sessions", s); }
function resetDemo() {
  ["feed", "lastSync", "pending", "askedAreas", "askedEvents", "syncs", "profile", "rules", "sessions", "simIdx"].forEach(function (k) {
    delete MEM[k];
    try { localStorage.removeItem("mwt-" + k); } catch (e) {}
  });
}
