// Game Runtime: home, week summary, town map, building visit, reveal.
window.MWT = window.MWT || {};

MWT.esc = function (s) {
  return String(s === undefined || s === null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
};
MWT.rupees = function (n) { return n ? "₹" + n.toLocaleString("en-IN") : ""; };
MWT.niceDate = function (iso) {
  var p = String(iso).split("-");
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return p.length === 3 ? parseInt(p[2], 10) + " " + months[parseInt(p[1], 10) - 1] + " " + p[0] : iso;
};

MWT.game = (function () {
  var esc = MWT.esc;

  function whoMade(d) {
    return d.madeBy === "me" ? "You decided" : d.madeBy === "approved" ? "Your agent picked, you approved" : "Your agent decided";
  }

  function buildingTile(b, d, res, foggy, clickable) {
    var cls = ["building", b.size, res ? res : "todo", !res && foggy ? "foggy" : ""].join(" ");
    var label = d.title + (res ? " (" + res + ")" : " (not visited)");
    return '<button type="button" class="' + cls + '" data-b="' + b.id + '"' + (clickable ? "" : " disabled") +
      ' aria-label="' + esc(label) + '"><span class="ico">' + d.icon + '</span><span class="name">' + esc(d.title) + "</span></button>";
  }

  // Draws districts with buildings. Used by the town map and the report.
  function townHtml(ctx, clickable) {
    var r = ctx.result, byId = ctx.byId;
    return '<div class="town">' + r.town.districts.map(function (dist) {
      var tag = dist.startFog > 0 ? '<span class="fog-tag">☁️ ' + Math.round(dist.startFog * 100) + "% fog from last week</span>" : "";
      var tiles = dist.buildingIds.map(function (id) {
        var b = r.town.buildings.filter(function (x) { return x.id === id; })[0];
        var a = r.answers[id];
        return buildingTile(b, byId[b.decisionId], a ? a.result : null, dist.startFog > 0, clickable && !a);
      }).join("");
      return '<section class="district"><h3>' + MWT.AREA_NAMES[dist.area] + " district " + tag + '</h3><div class="buildings">' + tiles + "</div></section>";
    }).join("") + "</div>";
  }

  function legend() {
    return '<div class="legend"><span>💡 Lit: you knew why</span><span>🧱 Cracked: different reasons</span><span>☁️ Fog: lost track</span></div>';
  }

  function renderHome(el, ctx) {
    var r = ctx.result, week = ctx.week;
    var prev = ctx.prevMetrics;
    var head;
    if (!r.town.buildings.length) {
      head = '<h1>Quiet week</h1><p>Nothing big happened last week, so there is no town this time. See you next Sunday.</p>';
    } else if (r.finished) {
      head = "<h1>This week's town is done</h1><p>You visited all " + r.town.buildings.length + " buildings.</p>" +
        '<div class="row"><button class="btn" data-go="report">See my town report</button><button class="btn secondary" data-go="repair">Repair buildings</button></div>';
    } else {
      var started = Object.keys(r.answers).length;
      head = "<h1>Your town is ready</h1><p>" + r.town.buildings.length + " buildings from your week of " + esc(MWT.niceDate(week.start)) + " to " + esc(MWT.niceDate(week.end)) + ". It takes a few minutes.</p>" +
        '<button class="btn" data-go="' + (started ? "town" : "summary") + '">' + (started ? "Continue my town" : "Enter my town") + "</button>";
    }
    var prevLine = prev && prev.played && prev.awareness !== null
      ? '<p class="muted">Last week your town was <strong>' + MWT.metrics.pct(prev.awareness) + "</strong> bright.</p>"
      : ctx.weekIndex === 0 ? '<p class="muted">Week 1 of 4: setting your starting level. There is no fog yet.</p>' : "";
    el.innerHTML = '<div class="card">' + head + prevLine + "</div>" +
      '<div class="card"><h2>How it works</h2><p>Every week, your last week becomes a small town. Each important choice is a building. ' +
      'Someone from your life asks <em>"why?"</em>. If you know why, the building lights up.</p>' + legend() + "</div>";
  }

  function renderSummary(el, ctx) {
    var t = ctx.result.town, week = ctx.week;
    var important = week.decisions.filter(function (d) { return MWT.townBuilder.isImportant(d, ctx.settings); });
    var byAgent = important.filter(function (d) { return d.madeBy !== "me"; }).length;
    var areaCount = {};
    important.forEach(function (d) { areaCount[d.area] = (areaCount[d.area] || 0) + 1; });
    var busiest = Object.keys(areaCount).sort(function (a, b) { return areaCount[b] - areaCount[a]; })[0];
    var VALUE_NAMES = { quiet: "quiet places", reliability: "reliability", quality: "quality", saving: "saving money", family_time: "family time" };
    var values = (week.myPreferences || []).map(function (k) { return VALUE_NAMES[k] || MWT.reasonLabel(k).toLowerCase(); });
    var foggy = t.districts.filter(function (d) { return d.startFog > 0; }).map(function (d) { return MWT.AREA_NAMES[d.area]; });
    el.innerHTML = '<div class="card"><h1>Here\'s what I understood about you last week</h1>' +
      '<p class="muted small">Built fresh this week from your agent\'s data. Nothing is remembered from before, except last week\'s gap report.</p>' +
      '<ul class="summary-list">' +
      "<li>You had <strong>" + important.length + " important choices</strong> (out of " + week.totalDecisions + " in total).</li>" +
      "<li>Your agent made <strong>" + byAgent + " of them</strong>; you made " + (important.length - byAgent) + ".</li>" +
      "<li>Your busiest area was <strong>" + MWT.AREA_NAMES[busiest] + "</strong>.</li>" +
      "<li>You've said you value: " + esc(values.join(", ")) + ".</li>" +
      (foggy.length ? "<li>Last week you lost track in <strong>" + esc(foggy.join(", ")) + "</strong>, so those districts start foggy and get more buildings.</li>" : "") +
      "</ul>" +
      '<button class="btn" data-go="town">Walk into my town</button></div>';
  }

  function renderTown(el, ctx) {
    var r = ctx.result, t = r.town;
    var done = Object.keys(r.answers).length;
    el.innerHTML = '<div class="theme-banner"><div><h1>' + t.theme.sky + " " + esc(t.theme.name) + '</h1><p class="muted">' +
      done + " of " + t.buildings.length + " buildings visited · tap any building</p></div>" +
      (r.finished ? '<button class="btn" data-go="report">See my town report</button>' : "") + "</div>" +
      legend() + townHtml(ctx, true);
    el.querySelectorAll(".building[data-b]").forEach(function (btn) {
      btn.addEventListener("click", function () { MWT.app.go("visit", btn.getAttribute("data-b")); });
    });
  }

  function challengeIntro(b) {
    if (b.challenge === "fake") return b.character.name + " gives three reasons. <strong>One is made up.</strong> Which one is fake?";
    if (b.challenge === "whatif") return "Imagine the same choice, but this was <strong>not true</strong>: “" + esc(b.whatIfText) + "”. Would you still choose it?";
    if (b.challenge === "ownwords") return "Answer <strong>in your own words</strong>.";
    return "Pick the reason you think is true.";
  }

  function renderVisit(el, ctx, bId) {
    var b = ctx.result.town.buildings.filter(function (x) { return x.id === bId; })[0];
    var d = ctx.byId[b.decisionId];
    var opened = Date.now();
    var body;
    if (b.challenge === "ownwords") {
      body = '<label class="field" for="why">Why?</label><textarea id="why" placeholder="In your own words…"></textarea>' +
        '<label class="field" for="not">One option you didn\'t pick</label><input id="not" type="text" placeholder="e.g. ' + esc(d.rejectedOptions[0] || "") + '">' +
        '<div class="row" style="margin-top:14px"><button class="btn" id="send" disabled>Answer</button></div>';
    } else {
      body = '<div class="options">' + b.options.map(function (o) {
        return '<button type="button" class="option" data-k="' + esc(o.key) + '">' + esc(o.text) + "</button>";
      }).join("") + "</div>";
    }
    el.innerHTML = '<div class="card"><div class="row" style="justify-content:space-between"><span class="chip">' +
      MWT.AREA_NAMES[b.area] + " district</span><span class=\"chip\">" + ({ pick: "Pick the reason", fake: "Spot the fake", whatif: "What if?", ownwords: "In my own words" })[b.challenge] + "</span></div>" +
      "<h2 style=\"margin-top:10px\">" + d.icon + " " + esc(d.title) + "</h2>" +
      '<p class="context">' + [MWT.rupees(d.amount), whoMade(d), esc(MWT.niceDate(d.date))].filter(Boolean).join(" · ") + "</p>" +
      '<div class="speech"><span class="who">' + b.character.icon + '</span><div class="bubble"><strong>' + esc(b.character.name) + "</strong>" + esc(b.prompt) + "</div></div>" +
      "<p>" + challengeIntro(b) + "</p>" + body +
      '<p style="margin-top:12px"><button type="button" class="btn secondary" id="skip">Skip this building</button></p></div>';

    function finish(answer) {
      answer.seconds = Math.round((Date.now() - opened) / 1000);
      var s = MWT.scoring.score(b, d, answer);
      answer.result = s.result; answer.ownPass = !!s.ownPass; answer.myReasonKey = s.myReasonKey || null;
      MWT.app.saveAnswer(b.id, answer);
      MWT.app.go("reveal", b.id);
    }
    el.querySelectorAll(".option").forEach(function (btn) {
      btn.addEventListener("click", function () { finish({ picked: btn.getAttribute("data-k") }); });
    });
    var why = el.querySelector("#why");
    if (why) {
      var send = el.querySelector("#send");
      why.addEventListener("input", function () { send.disabled = why.value.trim().length === 0; });
      send.addEventListener("click", function () { finish({ text: why.value, notPicked: el.querySelector("#not").value }); });
      why.focus();
    }
    el.querySelector("#skip").addEventListener("click", function () { finish({ skipped: true }); });
  }

  var MESSAGES = {
    lit: "💡 Lit up! You knew why.",
    cracked: "🧱 Cracked: your reason and the real reason were different.",
    fog: "☁️ Still foggy: you'd lost track of this one.",
    skipped: "☁️ Skipped: this building stays foggy."
  };

  function renderReveal(el, ctx, bId) {
    var r = ctx.result;
    var b = r.town.buildings.filter(function (x) { return x.id === bId; })[0];
    var d = ctx.byId[b.decisionId], a = r.answers[bId];
    var realWho = d.madeBy === "me" ? "Your reason at the time" : "Your agent's reason";
    var realText = d.realReasons.map(MWT.reasonLabel).join(" · ");
    var yours;
    if (a.skipped) yours = "Skipped";
    else if (b.challenge === "ownwords") yours = "“" + esc(a.text) + "”" + (a.notPicked ? "<br><span class=\"small\">Didn't pick: " + esc(a.notPicked) + "</span>" : "");
    else yours = esc((b.options.filter(function (o) { return o.key === a.picked; })[0] || {}).text);

    var extra = "";
    if (b.challenge === "fake" && !a.skipped) extra = "<p>The made-up reason was: <strong>" + esc(b.options.filter(function (o) { return o.key === b.fakeKey; })[0].text) + "</strong>.</p>";
    if (b.challenge === "whatif" && !a.skipped) {
      extra = d.realReasons[0] === d.whatIfFactor
        ? "<p>“" + esc(b.whatIfText) + "” was the main reason for this choice, so without it the choice would change.</p>"
        : "<p>“" + esc(b.whatIfText) + "” was only a small part of this choice.</p>";
    }
    if (b.challenge === "ownwords" && !a.skipped) {
      extra = a.ownPass
        ? '<p class="done-tag">✔ You gave a reason and named an option you didn\'t pick.</p>'
        : '<p class="muted">Tip: next time, also name one option you didn\'t pick.</p>';
    }
    var left = r.town.buildings.length - Object.keys(r.answers).length;
    el.innerHTML = '<div class="card"><h2>' + d.icon + " " + esc(d.title) + "</h2>" +
      '<div class="result-badge ' + a.result + '">' + MESSAGES[a.result] + "</div>" +
      '<div class="compare"><div><strong>Your answer</strong>' + yours + "</div><div><strong>" + realWho + "</strong>" + esc(realText) + "</div></div>" +
      extra +
      (a.result === "cracked" ? '<p class="muted small">Cracks aren\'t mistakes. They show where your agent chose for a reason that isn\'t yours. You can look at it in Repair.</p>' : "") +
      '<button class="btn" data-go="' + (left ? "town" : "report") + '">' + (left ? "Back to town (" + left + " left)" : "See my town report") + "</button></div>";
  }

  return { renderHome: renderHome, renderSummary: renderSummary, renderTown: renderTown, renderVisit: renderVisit, renderReveal: renderReveal, townHtml: townHtml, legend: legend };
})();
