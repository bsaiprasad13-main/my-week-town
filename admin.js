// My Week Town: role switch, User | Admin tabs, and the admin section.
// The user section (the game) is visible to everyone. The admin section is visible only in the admin role.
(function () {
  var view = document.getElementById("adminview"), rolebox = document.getElementById("rolebox");
  var role = ST.get("role", "user"), tab = "user", detail = null;

  if (/[?&]role=admin\b/.test(location.search) || location.hash === "#admin") { role = "admin"; ST.set("role", role); tab = "admin"; }

  function esc2(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function icon(name) { return '<img class="ic" src="icons/' + name + '.png" alt="">'; }

  /* ---------- Header: role switch and tabs ---------- */
  function header() {
    if (role === "admin") {
      rolebox.innerHTML = '<span class="tabs" role="tablist">' +
        '<button data-tab="user" class="' + (tab === "user" ? "on" : "") + '">' + icon("home") + "User</button>" +
        '<button data-tab="admin" class="' + (tab === "admin" ? "on" : "") + '">' + icon("robot") + "Admin</button></span>" +
        '<button class="pill btnpill" id="roleout" title="Switch to user role">Exit admin</button>';
      rolebox.querySelectorAll("[data-tab]").forEach(function (b) { b.addEventListener("click", function () { show(b.getAttribute("data-tab")); }); });
      document.getElementById("roleout").addEventListener("click", function () { role = "user"; ST.set("role", role); show("user"); });
    } else {
      rolebox.innerHTML = '<button class="pill btnpill" id="rolein" title="Switch to admin role">' + icon("robot") + "Switch to admin</button>";
      document.getElementById("rolein").addEventListener("click", function () { role = "admin"; ST.set("role", role); show("admin"); });
    }
  }

  function show(t) {
    tab = role === "admin" ? t : "user";
    document.body.classList.toggle("in-admin", tab === "admin");
    view.hidden = tab !== "admin";
    if (tab === "admin") { detail = null; render(); window.scrollTo(0, 0); }
    header();
  }

  /* ---------- Admin section ---------- */
  function data() {
    var f = feed().slice().sort(function (a, b) { return b.at - a.at; });
    var sessions = ST.get("sessions", []).slice().reverse();
    return {
      f: f, last: ST.get("lastSync", null), syncs: ST.get("syncs", []).slice().reverse(),
      pending: ST.get("pending", []), asked: ST.get("askedEvents", []), rules: ST.get("rules", []).slice().reverse(),
      sessions: sessions, p: profile(),
      totM: sessions.reduce(function (s, x) { return s + x.matched; }, 0), totN: sessions.reduce(function (s, x) { return s + x.total; }, 0)
    };
  }

  var SECTIONS = [
    { id: "log", icon: "calendar", title: "Catch-up log", sum: function (d) { return d.syncs.length + " runs · last " + (d.last ? ago(d.last) : "never"); } },
    { id: "data", icon: "clipboard", title: "Data from the user's agent", sum: function (d) { return d.f.length + " items · " + d.f.filter(function (e) { return e.routine; }).length + " routine"; } },
    { id: "picture", icon: "search", title: "The agent's picture of the user", sum: function (d) { return Object.keys(d.p).filter(function (a) { return d.p[a].updatedAt; }).length + " of " + Object.keys(AREAS).length + " areas updated by the user"; } },
    { id: "updates", icon: "hand", title: "Updates and games", sum: function (d) { return d.rules.length + " updates · " + d.sessions.length + " games"; } },
    { id: "instr", icon: "scroll", title: "Model instructions", sum: function () { return (ST.get("instructions", null) ? "Edited" : "Default") + " · editable"; } }
  ];

  function status(e, d) {
    if (e.routine) return '<span class="tag skip">Skipped: ' + esc2(e.skip) + "</span>";
    if (d.pending.indexOf(e.id) >= 0) return '<span class="tag wait">Fetched, waits for next game</span>';
    if (d.asked.indexOf(e.id) >= 0) return '<span class="tag asked">Asked in a game</span>';
    return '<span class="tag new">New, not fetched yet</span>';
  }

  function body(id, d) {
    if (id === "log") return '<p class="lead">Each time the user starts a game, the app fetches only what the agent did after the last successful catch-up. A run the user backed out of doesn\'t move that time.</p>' +
      (d.syncs.length ? '<div class="scroll"><table class="tbl"><thead><tr><th>When</th><th>Fetched from</th><th>Fetched</th><th>Crucial</th><th>Routine skipped</th><th>Game</th><th>Waiting</th><th>Status</th></tr></thead><tbody>' +
        d.syncs.map(function (s) {
          var used = s.status !== "not played";
          return "<tr><td>" + esc2(when(s.at)) + '</td><td class="muted">' + (s.from ? esc2(when(s.from)) : "Last 7 days (first run)") + "</td><td>" + s.fetched + "</td><td>" + s.crucial + "</td><td>" + s.routine +
            "</td><td>" + s.choices + " choice" + (s.choices === 1 ? "" : "s") + " + " + s.checks + " taste check" + (s.checks === 1 ? "" : "s") + "</td><td>" + s.carried +
            '</td><td><span class="tag ' + (used ? "asked" : "wait") + '">' + (used ? "Success, played" : "Fetched, user went back") + "</span></td></tr>";
        }).join("") + "</tbody></table></div>" : '<p class="empty">No catch-ups yet. They appear when the user starts a game.</p>');
    if (id === "data") return '<p class="lead">Everything the agent shared, newest first, and what the app did with it. The user never sees this.</p>' +
      '<div class="scroll"><table class="tbl"><thead><tr><th>When</th><th>Area</th><th>What the agent did</th><th>Agent\'s priority</th><th>Status</th></tr></thead><tbody>' +
      d.f.map(function (e) {
        return "<tr><td>" + esc2(when(e.at)) + "</td><td>" + esc2(e.routine ? e.label : AREAS[e.area].name) + "</td><td>" + esc2(e.did) +
          (e.looked ? '<br><span class="muted">Also looked at: ' + esc2(e.looked) + "</span>" : "") + "</td><td>" +
          (e.routine ? "–" : esc2(labelOf(e.area, e.agentKey)) + (e.followedUpdate ? '<br><span class="muted">follows a user update</span>' : "")) + "</td><td>" + status(e, d) + "</td></tr>";
      }).join("") + "</tbody></table></div>";
    if (id === "picture") return '<p class="lead">What the agent currently thinks matters most to the user, per area. It changes only when the user sends an update.</p>' +
      '<table class="tbl"><tbody>' + Object.keys(AREAS).map(function (a) {
        var pr = d.p[a];
        return "<tr><td><b>" + esc2(AREAS[a].name) + '</b></td><td class="chain">' + pr.order.map(function (k) { return esc2(labelOf(a, k)); }).join(" › ") +
          '</td><td class="muted">' + (pr.updatedAt ? "Updated " + esc2(ago(pr.updatedAt)) : "Default") + "</td></tr>";
      }).join("") + "</tbody></table>";
    if (id === "updates") return '<h3 class="sub">Updates the user sent</h3><p class="lead">Only the ones the user ticked and sent.</p>' +
      (d.rules.length ? '<table class="tbl"><tbody>' + d.rules.map(function (r) {
        return "<tr><td>" + esc2(when(r.at)) + "</td><td>" + esc2(r.text) + '<br><span class="muted">Agent: “' + esc2(r.reply) + "”</span></td></tr>";
      }).join("") + "</tbody></table>" : '<p class="empty">Nothing sent yet.</p>') +
      '<h3 class="sub">Games played</h3>' +
      (d.sessions.length ? '<table class="tbl"><tbody>' + d.sessions.map(function (s) {
        return "<tr><td>" + esc2(when(s.at)) + "</td><td>" + s.matched + " of " + s.total + " made the user's way</td><td><b>" + Math.round(s.matched / s.total * 100) + "%</b></td></tr>";
      }).join("") + "</tbody></table>" : '<p class="empty">No games yet.</p>');
    if (id === "instr") return '<p class="lead">' + esc2(MODEL.intro) + " Edit them like project instructions.</p>" +
      '<div class="editor"><div class="ehead">' + icon("robot") + '<b>Instructions</b><span id="estate"></span></div>' +
      '<textarea id="instr" spellcheck="false" aria-label="Model instructions"></textarea>' +
      '<div class="eacts"><button class="btn small" id="esave">Save</button><button class="btn ghost small" id="ereset">Reset to default</button></div></div>';
    return "";
  }

  function render() {
    var d = data();
    if (detail) {
      var s = SECTIONS.filter(function (x) { return x.id === detail; })[0];
      view.innerHTML = '<div class="wrap"><div class="navrow"><button class="back" id="aback">← Back to overview</button></div>' +
        '<section class="panel2 full"><h2>' + icon(s.icon) + esc2(s.title) + "</h2>" + body(detail, d) + "</section></div>";
      document.getElementById("aback").addEventListener("click", function () { detail = null; render(); });
      if (detail === "instr") wireInstr();
      return;
    }
    view.innerHTML = '<div class="wrap">' +
      '<div class="stats">' +
      '<div class="stat"><small>Last successful catch-up</small><b>' + (d.last ? esc2(ago(d.last)) : "Never") + "</b><span>" + (d.last ? esc2(when(d.last)) : "Runs when the user starts a game") + "</span></div>" +
      '<div class="stat"><small>New crucial choices</small><b>' + (d.f.filter(function (e) { return !e.routine && (!d.last || e.at > d.last); }).length + d.pending.length) + "</b><span>Not fetched yet, or waiting</span></div>" +
      '<div class="stat"><small>Updates received</small><b>' + d.rules.length + "</b><span>Sent by the user to their agent</span></div>" +
      '<div class="stat"><small>Priority Match Rate</small><b>' + (d.totN ? Math.round(d.totM / d.totN * 100) + "%" : "–") + "</b><span>" + (d.sessions[0] ? "Last game " + d.sessions[0].matched + "/" + d.sessions[0].total : "No games yet") + "</span></div>" +
      "</div>" +
      '<div class="actions">' +
      '<button class="btn" id="sim">' + icon("robot") + "Simulate new agent activity (3 choices)</button>" +
      '<button class="btn ghost" id="touser">' + icon("home") + "Open the user section</button>" +
      '<button class="btn ghost" id="reset">Reset demo</button>' +
      '<button class="btn ghost" id="touserrole">Switch to user role</button>' +
      "</div>" +
      '<div class="cards">' + SECTIONS.map(function (s) {
        return '<button class="acard" data-sec="' + s.id + '">' + icon(s.icon) + "<span><b>" + esc2(s.title) + "</b><small>" + esc2(s.sum(d)) + '</small></span><i>Open →</i></button>';
      }).join("") + "</div></div>";
    view.querySelectorAll("[data-sec]").forEach(function (b) {
      b.addEventListener("click", function () { detail = b.getAttribute("data-sec"); render(); window.scrollTo(0, 0); try { history.pushState({ adm: 1 }, ""); } catch (e) {} });
    });
    document.getElementById("sim").addEventListener("click", function () { simulateActivity(3); render(); });
    document.getElementById("touser").addEventListener("click", function () { show("user"); });
    document.getElementById("touserrole").addEventListener("click", function () { role = "user"; ST.set("role", role); show("user"); });
    document.getElementById("reset").addEventListener("click", function () {
      if (confirm("Reset the demo? This clears the catch-up log, games and updates.")) { resetDemo(); render(); if (typeof start === "function") start(); }
    });
  }

  function wireInstr() {
    var ta = document.getElementById("instr"), stEl = document.getElementById("estate");
    ta.value = ST.get("instructions", null) || MODEL.text;
    stEl.textContent = ta.value === MODEL.text ? "Default" : "Edited";
    ta.addEventListener("input", function () { stEl.textContent = "Not saved"; });
    document.getElementById("esave").addEventListener("click", function () { ST.set("instructions", ta.value === MODEL.text ? null : ta.value); stEl.textContent = ta.value === MODEL.text ? "Default" : "Saved ✓"; });
    document.getElementById("ereset").addEventListener("click", function () { ta.value = MODEL.text; ST.set("instructions", null); stEl.textContent = "Default"; });
  }

  // Phone/browser back inside admin: detail → overview
  window.addEventListener("popstate", function () { if (tab === "admin" && detail) { detail = null; render(); } });
  // Stay current when the game is played in another tab
  window.addEventListener("storage", function (e) { if (tab === "admin" && e.key && e.key.indexOf("mwt-") === 0) render(); });

  show(tab);
})();
