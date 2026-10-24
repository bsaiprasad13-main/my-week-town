// My Week Town admin: what the app fetched from the agent, how it built each game, and the model's instructions.
var app = document.getElementById("app");
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function ico(name) { return '<img class="ic" src="icons/' + name + '.png" alt="">'; }
function loadInstr() { return ST.get("instructions", null) || MODEL.text; }

function render() {
  var f = feed().slice().sort(function (a, b) { return b.at - a.at; });
  var last = ST.get("lastSync", null), syncs = ST.get("syncs", []).slice().reverse();
  var pending = ST.get("pending", []), asked = ST.get("askedEvents", []), rules = ST.get("rules", []).slice().reverse();
  var sessions = ST.get("sessions", []).slice().reverse(), p = profile();
  var totM = sessions.reduce(function (s, x) { return s + x.matched; }, 0), totN = sessions.reduce(function (s, x) { return s + x.total; }, 0);
  var waitingNew = f.filter(function (e) { return !e.routine && (!last || e.at > last); }).length;

  function status(e) {
    if (e.routine) return '<span class="tag skip">Skipped: ' + esc(e.skip) + "</span>";
    if (pending.indexOf(e.id) >= 0) return '<span class="tag wait">Fetched, waits for next game</span>';
    if (asked.indexOf(e.id) >= 0) return '<span class="tag asked">Asked in a game</span>';
    return '<span class="tag new">New, not fetched yet</span>';
  }

  app.innerHTML =
    '<div class="stats">' +
    '<div class="stat"><small>Last successful catch-up</small><b>' + (last ? esc(ago(last)) : "Never") + "</b><span>" + (last ? esc(when(last)) : "Runs when the user starts a game") + "</span></div>" +
    '<div class="stat"><small>New crucial choices</small><b>' + (waitingNew + pending.length) + "</b><span>" + waitingNew + " not fetched · " + pending.length + " waiting</span></div>" +
    '<div class="stat"><small>Updates received</small><b>' + rules.length + "</b><span>Sent by the user to their agent</span></div>" +
    '<div class="stat"><small>Priority Match Rate</small><b>' + (totN ? Math.round(totM / totN * 100) + "%" : "–") + "</b><span>" + (sessions[0] ? "Last game " + sessions[0].matched + "/" + sessions[0].total : "No games yet") + "</span></div>" +
    "</div>" +
    '<div class="actions">' +
    '<button class="btn" id="sim">' + ico("robot") + "Simulate new agent activity (3 choices)</button>" +
    '<a class="btn ghost" href="index.html" target="_blank">' + ico("home") + "Open the user app</a>" +
    '<button class="btn ghost" id="reset">Reset demo</button>' +
    "</div>" +
    '<div class="grid">' +

    '<section class="panel2 full"><h2>' + ico("calendar") + "Catch-up log</h2>" +
    '<p class="lead">Each time the user starts a game, the app fetches only what the agent did after the last successful catch-up.</p>' +
    (syncs.length ? '<div class="scroll"><table class="tbl"><thead><tr><th>When</th><th>Fetched from</th><th>Fetched</th><th>Crucial</th><th>Routine skipped</th><th>Game</th><th>Waiting</th><th>Status</th></tr></thead><tbody>' +
      syncs.map(function (s) {
        return "<tr><td>" + esc(when(s.at)) + '</td><td class="muted">' + (s.from ? esc(when(s.from)) : "Last 7 days (first run)") + "</td><td>" + s.fetched + "</td><td>" + s.crucial + "</td><td>" + s.routine +
          "</td><td>" + s.choices + " choice" + (s.choices === 1 ? "" : "s") + " + " + s.checks + " taste check" + (s.checks === 1 ? "" : "s") + "</td><td>" + s.carried + '</td><td><span class="tag asked">Success</span></td></tr>';
      }).join("") + "</tbody></table></div>" : '<p class="empty">No catch-ups yet. They appear when the user starts a game.</p>') +
    "</section>" +

    '<section class="panel2 full"><h2>' + ico("clipboard") + "Data from the user's agent</h2>" +
    '<p class="lead">Everything the agent shared, newest first, and what the app did with it.</p>' +
    '<div class="scroll"><table class="tbl"><thead><tr><th>When</th><th>Area</th><th>What the agent did</th><th>Agent\'s priority</th><th>Status</th></tr></thead><tbody>' +
    f.map(function (e) {
      return "<tr><td>" + esc(when(e.at)) + "</td><td>" + esc(e.routine ? e.label : AREAS[e.area].name) + "</td><td>" + esc(e.did) +
        (e.looked ? '<br><span class="muted">Also looked at: ' + esc(e.looked) + "</span>" : "") + "</td><td>" +
        (e.routine ? "–" : esc(labelOf(e.area, e.agentKey)) + (e.followedUpdate ? '<br><span class="muted">follows a user update</span>' : "")) + "</td><td>" + status(e) + "</td></tr>";
    }).join("") + "</tbody></table></div></section>" +

    '<section class="panel2"><h2>' + ico("search") + "The agent's picture of the user</h2>" +
    '<p class="lead">What the agent currently thinks matters most, per area. Changes when the user sends an update.</p>' +
    '<table class="tbl"><tbody>' + Object.keys(AREAS).map(function (a) {
      var pr = p[a];
      return "<tr><td><b>" + esc(AREAS[a].name) + '</b></td><td class="chain">' + pr.order.map(function (k) { return esc(labelOf(a, k)); }).join(" › ") +
        "</td><td class=\"muted\">" + (pr.updatedAt ? "Updated " + esc(ago(pr.updatedAt)) : "Default") + "</td></tr>";
    }).join("") + "</tbody></table></section>" +

    '<section class="panel2"><h2>' + ico("hand") + "Updates the user sent</h2>" +
    '<p class="lead">Only the ones the user ticked and sent.</p>' +
    (rules.length ? '<table class="tbl"><tbody>' + rules.map(function (r) {
      return "<tr><td>" + esc(when(r.at)) + "</td><td>" + esc(r.text) + '<br><span class="muted">Agent: “' + esc(r.reply) + "”</span></td></tr>";
    }).join("") + "</tbody></table>" : '<p class="empty">Nothing sent yet.</p>') +
    '<h2 style="margin-top:16px">' + ico("target") + "Games played</h2>" +
    (sessions.length ? '<table class="tbl"><tbody>' + sessions.map(function (s) {
      return "<tr><td>" + esc(when(s.at)) + "</td><td>" + s.matched + " of " + s.total + " made the user's way</td><td><b>" + Math.round(s.matched / s.total * 100) + "%</b></td></tr>";
    }).join("") + "</tbody></table>" : '<p class="empty">No games yet.</p>') +
    "</section>" +

    '<section class="panel2 full"><h2>' + ico("scroll") + "Model instructions</h2>" +
    '<p class="lead">' + esc(MODEL.intro) + " Edit them like project instructions.</p>" +
    '<div class="editor"><div class="ehead">' + ico("robot") + '<b>Instructions</b><span id="estate"></span></div>' +
    '<textarea id="instr" spellcheck="false" aria-label="Model instructions"></textarea>' +
    '<div class="eacts"><button class="btn small" id="esave">Save</button><button class="btn ghost small" id="ereset">Reset to default</button></div></div>' +
    "</section></div>";

  var ta = document.getElementById("instr"), stEl = document.getElementById("estate");
  ta.value = loadInstr();
  stEl.textContent = ta.value === MODEL.text ? "Default" : "Edited";
  ta.addEventListener("input", function () { stEl.textContent = "Not saved"; });
  document.getElementById("esave").addEventListener("click", function () { ST.set("instructions", ta.value === MODEL.text ? null : ta.value); stEl.textContent = ta.value === MODEL.text ? "Default" : "Saved ✓"; });
  document.getElementById("ereset").addEventListener("click", function () { ta.value = MODEL.text; ST.set("instructions", null); stEl.textContent = "Default"; });
  document.getElementById("sim").addEventListener("click", function () { simulateActivity(3); render(); });
  document.getElementById("reset").addEventListener("click", function () {
    if (confirm("Reset the demo? This clears the catch-up log, games and updates.")) { resetDemo(); render(); }
  });
}

render();
// Stay in sync when the user plays in another tab
window.addEventListener("storage", function (e) { if (e.key && e.key.indexOf("mwt-") === 0 && e.key !== "mwt-instructions") render(); });
