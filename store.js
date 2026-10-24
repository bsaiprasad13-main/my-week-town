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
var DAY = 864e5, MIN_Q = 4, MAX_Q = 6;
(function () {
  if (ST.get("dataVersion", 0) !== DATA_VERSION) {
    ["feed", "lastSync", "pending", "askedAreas", "askedEvents", "askedChecks", "syncs", "profile", "rules", "sessions", "simIdx"].forEach(function (k) {
      try { localStorage.removeItem("mwt-" + k); } catch (e) {}
    });
    ST.set("dataVersion", DATA_VERSION);
  }
})();

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
// Options for a question: the situation's 4 concrete choices, each standing for one priority
function optionsFor(scnId, agentKey) {
  var sc = SCN[scnId], items = sc.options.map(function (x) { return { k: x[0], t: x[1] }; });
  if (agentKey && agentKey.indexOf("custom:") === 0) items[3] = { k: agentKey, t: labelOf(sc.area, agentKey) };
  return items;
}
function optionText(scnId, k) {
  if (k.indexOf("custom:") === 0) return k.slice(7);
  var o = SCN[scnId].options.filter(function (x) { return x[0] === k; })[0];
  return o ? o[1] : k;
}
// A situation turned into an agent event
function fromScn(id, agentKey) {
  var sc = SCN[id];
  return { scn: id, area: sc.area, icon: sc.icon, question: sc.q, agentKey: agentKey, did: sc.did };
}

/* ---------- The agent's log ---------- */
function feed() {
  var f = ST.get("feed", null);
  if (!f) {
    var t = now();
    f = SEED.map(function (e, i) {
      var base = { id: "s" + i, at: Math.round(t - e.daysAgo * DAY) };
      return e.routine ? Object.assign(base, e) : Object.assign(base, fromScn(e.scn, e.agentKey));
    });
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
    var id = SIM[(idx + i) % SIM.length], area = SCN[id].area, pr = p[area], top = pr.order[0];
    var ev = Object.assign({ id: "n" + t + "-" + i, at: Math.max(after + 1 + i, Math.min(t, after + (i + 1) * 1000)), followedUpdate: pr.updatedAt || null }, fromScn(id, top));
    ev.did = "Chose: " + optionText(id, top) + ".";
    f.push(ev);
  }
  var r = SIM_ROUTINE[idx % SIM_ROUTINE.length];
  f.push(Object.assign({ id: "r" + t, at: Math.min(t, after + (count + 1) * 1000), routine: true }, r));
  ST.set("simIdx", idx + count);
  ST.set("feed", f);
}

/* ---------- Catch-up: runs every time the user starts a game ---------- */
// prepareCatchUp() fetches and plans the game without changing anything.
// commitCatchUp() runs when the user starts walking; cancelCatchUp() when they go back instead.
function prepareCatchUp() {
  var t = now(), last = ST.get("lastSync", null), f = feed();
  var from = last || t - 7 * DAY;
  var fetched = f.filter(function (e) { return e.at > from; });
  var fresh = fetched.filter(function (e) { return !e.routine; }).map(function (e) { return e.id; });
  var pending = ST.get("pending", []);
  var queue = pending.concat(fresh.filter(function (id) { return pending.indexOf(id) < 0; }));
  queue.sort(function (a, b) { return eventById(a).at - eventById(b).at; });
  var take = queue.slice(0, MAX_Q), carried = queue.slice(MAX_Q);

  var qs = take.map(function (id) { return { type: "choice", ev: eventById(id) }; });
  // Too little new? Top up with quick taste checks from areas not checked lately
  var checks = [];
  if (qs.length < MIN_Q) {
    var used = take.map(function (id) { return eventById(id).area; });
    var asked = ST.get("askedChecks", {});
    checks = CHECKS
      .filter(function (id) { return used.indexOf(SCN[id].area) < 0; })
      .sort(function (a, b) { return (asked[a] || 0) - (asked[b] || 0); })
      .filter(function (id, k, arr) { return arr.map(function (x) { return SCN[x].area; }).indexOf(SCN[id].area) === k; }) // one per area
      .slice(0, MIN_Q - qs.length);
    checks.forEach(function (id) { qs.push({ type: "check", scn: id }); });
  }
  return { at: t, last: last, qs: qs, take: take, carried: carried, checks: checks, fetched: fetched.length, fresh: fresh.length,
    choices: take.length };
}
function logRun(plan, status) {
  var log = ST.get("syncs", []);
  log.push({ at: plan.at, from: plan.last, fetched: plan.fetched, crucial: plan.fresh, routine: plan.fetched - plan.fresh,
    questions: plan.qs.length, choices: plan.take.length, checks: plan.checks.length, carried: plan.carried.length, status: status });
  ST.set("syncs", log);
}
function commitCatchUp(plan) {
  var asked = ST.get("askedChecks", {});
  plan.checks.forEach(function (id) { asked[id] = plan.at; });
  ST.set("askedChecks", asked);
  ST.set("askedEvents", ST.get("askedEvents", []).concat(plan.take));
  ST.set("pending", plan.carried);
  logRun(plan, "used");
  ST.set("lastSync", plan.at);
}
// The user went back before playing: nothing counts, the next game fetches the same window again
function cancelCatchUp(plan) { logRun(plan, "not played"); }
// The user left mid-game: choices they didn't answer go back to the front of the queue
function returnUnanswered(ids) {
  if (!ids.length) return;
  ST.set("pending", ids.concat(ST.get("pending", []).filter(function (id) { return ids.indexOf(id) < 0; })));
  ST.set("askedEvents", ST.get("askedEvents", []).filter(function (id) { return ids.indexOf(id) < 0; }));
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
  ["feed", "lastSync", "pending", "askedAreas", "askedEvents", "askedChecks", "syncs", "profile", "rules", "sessions", "simIdx"].forEach(function (k) {
    delete MEM[k];
    try { localStorage.removeItem("mwt-" + k); } catch (e) {}
  });
}

/* ---------- Icons and the cat's voice ---------- */
function iconKeys() { var k = []; Object.keys(ICONS).forEach(function (c) { k = k.concat(Object.keys(ICONS[c])); }); return k; }
function pickIcon(key) { return key && iconKeys().indexOf(key) >= 0 ? key : FALLBACK_ICON; }
function voice() { var v = ST.get("voice", "speaks"); return VOICES[v] ? v : "speaks"; }
