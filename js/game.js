// Game: welcome, town map, question, results. Kept to one simple flow.
window.MWT = window.MWT || {};

MWT.esc = function (s) {
  return String(s === undefined || s === null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
};
MWT.rupees = function (n) { return n ? "₹" + n.toLocaleString("en-IN") : ""; };
MWT.niceDate = function (iso) {
  var p = String(iso).split("-");
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return p.length === 3 ? parseInt(p[2], 10) + " " + months[parseInt(p[1], 10) - 1] : iso;
};

MWT.game = (function () {
  var esc = MWT.esc;
  // Map quarters: each district always sits in the same place
  var ZONES = [
    { area: "work", pos: "tl", color: "work" },
    { area: "money", pos: "tr", color: "money" },
    { area: "family", pos: "bl", color: "family" },
    { area: "self", pos: "br", color: "self" }
  ];
  var STATUS = { lit: "💡", cracked: "🧱", fog: "☁️" };

  function whoMade(d) {
    return d.madeBy === "me" ? "You decided" : d.madeBy === "approved" ? "Your agent picked it, you said yes" : "Your agent decided";
  }
  function shortName(d) { return (MWT.SHORT_NAMES && MWT.SHORT_NAMES[d.id]) || d.title; }

  function legend() {
    return '<div class="legend"><span>❓ Not visited</span><span>💡 You knew why</span><span>🧱 Different reason</span><span>☁️ Lost track</span></div>';
  }

  // The town map. Districts sit in four quarters, split by two roads.
  function mapHtml(ctx) {
    var r = ctx.result;
    var zones = ZONES.map(function (z) {
      var dist = r.town.districts.filter(function (d) { return d.area === z.area || (z.area === "self" && d.area === "friends"); })[0];
      var label = MWT.AREA_NAMES[z.area];
      if (!dist) {
        return '<div class="zone ' + z.pos + " " + z.color + ' empty"><span class="zone-label">' + label + '</span><div class="park">🌳🌳<br><span class="small">Quiet this week</span></div></div>';
      }
      var pins = dist.buildingIds.map(function (id) {
        var b = r.town.buildings.filter(function (x) { return x.id === id; })[0];
        var d = ctx.byId[b.decisionId], a = r.answers[id];
        var status = a ? a.result : "todo";
        return '<button type="button" class="pin ' + status + " " + b.size + '" data-b="' + id + '"' + (a ? "" : "") +
          ' aria-label="' + esc(shortName(d) + (a ? ": " + a.result : ": not visited")) + '">' +
          '<span class="pin-ico">' + d.icon + '</span><span class="pin-badge">' + (a ? STATUS[a.result] : "❓") + '</span>' +
          '<span class="pin-name">' + esc(shortName(d)) + "</span></button>";
      }).join("");
      var fog = dist.startFog > 0 && !r.finished ? '<span class="zone-fog">☁️ foggy from last week</span>' : "";
      return '<div class="zone ' + z.pos + " " + z.color + (dist.startFog > 0 && !r.finished ? " foggy" : "") + '"><span class="zone-label">' + label + "</span>" + fog +
        '<div class="pins">' + pins + "</div></div>";
    }).join("");
    return '<div class="map" role="group" aria-label="My Week Town map"><div class="road h"></div><div class="road v"></div><div class="roundabout">⛲</div>' + zones + "</div>";
  }

  function counts(r) {
    var c = { lit: 0, cracked: 0, fog: 0, done: 0 };
    r.town.buildings.forEach(function (b) { var a = r.answers[b.id]; if (a) { c[a.result]++; c.done++; } });
    return c;
  }

  // Welcome: says what this is and why it matters, in one look
  function renderHome(el, ctx) {
    var r = ctx.result, w = ctx.week;
    if (Object.keys(r.answers).length) { MWT.app.go("map"); return; }
    var important = w.decisions.filter(function (d) { return MWT.townBuilder.isImportant(d, ctx.settings); });
    var byAgent = important.filter(function (d) { return d.madeBy !== "me"; }).length;
    var foggy = r.town.districts.filter(function (d) { return d.startFog > 0; }).map(function (d) { return MWT.AREA_NAMES[d.area]; });
    var prev = ctx.prevMetrics;

    el.innerHTML =
      '<section class="hero"><p class="eyebrow">Your week of ' + MWT.niceDate(w.start) + " – " + MWT.niceDate(w.end) + ", 2040</p>" +
      "<h1>Your AI agent made <span class=\"hl\">" + byAgent + " of your " + important.length + "</span> big choices last week.<br>Do you still know <em>why</em>?</h1>" +
      '<p class="lead">My Week Town checks once a week whether you still know the reasons behind your own choices, so you can always explain them yourself.</p></section>' +

      '<div class="steps">' +
      '<div class="step"><span>🏘️</span><strong>1. Your week is a town</strong><p>Each big choice is a building on the map.</p></div>' +
      '<div class="step"><span>❓</span><strong>2. Pick the reason</strong><p>Tap a building and choose why it happened.</p></div>' +
      '<div class="step"><span>💡</span><strong>3. See if you knew</strong><p>Knew it: the building lights up. Didn\'t: it stays foggy.</p></div>' +
      "</div>" +

      (foggy.length ? '<p class="note">☁️ Last week you lost track in <strong>' + esc(foggy.join(" and ")) + "</strong>, so those parts of town start foggy this week.</p>" : "") +
      (prev && prev.played && prev.awareness !== null ? '<p class="muted center">Last week you knew the reason for <strong>' + MWT.metrics.pct(prev.awareness) + "</strong> of your choices.</p>" : "") +
      '<div class="center"><button class="btn big" data-go="map">Open my town map</button><p class="muted small">' + r.town.buildings.length + " buildings · about 2 minutes</p></div>";
  }

  function renderMap(el, ctx) {
    var r = ctx.result, c = counts(r), total = r.town.buildings.length;
    var top;
    if (r.finished) {
      var m = MWT.metrics.computeWeek(ctx.week.weekId, ctx.state);
      var cracked = r.town.buildings.filter(function (b) { return r.answers[b.id].result === "cracked"; });
      var fog = r.town.buildings.filter(function (b) { return r.answers[b.id].result === "fog"; });
      function chips(list) { return list.map(function (b) { var d = ctx.byId[b.decisionId]; return '<span class="chip">' + d.icon + " " + esc(shortName(d)) + "</span>"; }).join(" "); }
      var feel = ["happy", "ok", "sad"].map(function (f, i) {
        return '<button type="button" data-feel="' + f + '" aria-pressed="' + (r.feeling === f) + '" aria-label="' + f + '">' + ["🙂", "😐", "🙁"][i] + "</button>";
      }).join("");
      top = '<div class="card result-card"><div class="big-num">' + c.lit + "<span>/" + total + "</span></div>" +
        "<div><h2>You knew why for " + c.lit + " of " + total + " choices</h2>" +
        '<p class="muted">Your awareness this week: <strong>' + MWT.metrics.pct(m.awareness) + "</strong>" +
        (m.gapClosure !== null && m.gapClosure !== undefined ? " · last week's gaps you now know: <strong>" + MWT.metrics.pct(m.gapClosure) + "</strong>" : "") + "</p></div>" +
        (cracked.length ? '<div class="full"><p class="small"><strong>🧱 Your agent chose for a different reason:</strong></p>' + chips(cracked) + "</div>" : "") +
        (fog.length ? '<div class="full"><p class="small"><strong>☁️ You\'d lost track:</strong></p>' + chips(fog) + "</div>" : "") +
        '<div class="full row between"><span class="feel"><span class="small muted">How did that feel?</span> ' + feel + "</span>" +
        '<span class="row">' + (ctx.isLastWeek ? "" : '<button class="btn" data-next>Next week ▸</button>') + '<button class="btn secondary" data-go="progress">My progress</button></span></div></div>';
    } else {
      top = '<div class="map-head"><div><h1>' + r.town.theme.sky + " My Week Town</h1><p class=\"muted\">" + (c.done ? c.done + " of " + total + " visited · tap a ❓ building" : "Tap any ❓ building to start") + "</p></div>" +
        '<div class="meter" aria-label="' + c.done + " of " + total + ' visited"><span style="width:' + Math.round(c.done / total * 100) + '%"></span></div></div>';
    }
    el.innerHTML = top + mapHtml(ctx) + legend();

    el.querySelectorAll(".pin[data-b]").forEach(function (btn) {
      btn.addEventListener("click", function () { MWT.app.go("ask", btn.getAttribute("data-b")); });
    });
    el.querySelectorAll("[data-feel]").forEach(function (btn) {
      btn.addEventListener("click", function () { MWT.app.setFeeling(btn.getAttribute("data-feel")); });
    });
    var next = el.querySelector("[data-next]");
    if (next) next.addEventListener("click", MWT.app.nextWeek);
  }

  // The question: 3 reasons, then "Other" (own words) and "Not sure" last
  function renderAsk(el, ctx, bId) {
    var r = ctx.result;
    var b = r.town.buildings.filter(function (x) { return x.id === bId; })[0];
    var d = ctx.byId[b.decisionId];
    if (r.answers[bId]) { renderAnswer(el, ctx, b, d); return; }

    el.innerHTML = '<button class="back" data-go="map">← Map</button>' +
      '<div class="card ask"><div class="ask-head"><span class="ask-ico">' + d.icon + "</span><div><h2>" + esc(d.title) + '</h2><p class="muted small">' +
      [MWT.rupees(d.amount), whoMade(d), MWT.niceDate(d.date)].filter(Boolean).join(" · ") + "</p></div></div>" +
      '<div class="speech"><span class="who">' + b.character.icon + '</span><div class="bubble"><strong>' + esc(b.character.name) + " asks</strong>" + esc(b.prompt) + "</div></div>" +
      '<p class="q">What was the real reason?</p>' +
      '<div class="options">' + b.options.map(function (o) {
        return '<button type="button" class="option" data-k="' + esc(o.key) + '">' + esc(o.text) + "</button>";
      }).join("") +
      '<button type="button" class="option other" id="other-btn">✏️ Other reason (type it)</button>' +
      '<div class="other-box" id="other-box" hidden><input id="other-text" type="text" placeholder="The reason, in your own words" aria-label="The reason, in your own words">' +
      '<button class="btn" id="other-send" disabled>Check</button></div>' +
      '<button type="button" class="option notsure" data-notsure>🤷 Not sure</button></div></div>';

    function finish(answer) {
      var s = MWT.scoring.score(b, d, answer);
      answer.result = s.result; answer.ownPass = !!s.ownPass; answer.myReasonKey = s.myReasonKey || null;
      MWT.app.saveAnswer(b.id, answer);
      MWT.app.go("ask", b.id);
    }
    el.querySelectorAll(".option[data-k]").forEach(function (btn) {
      btn.addEventListener("click", function () { finish({ picked: btn.getAttribute("data-k") }); });
    });
    el.querySelector("[data-notsure]").addEventListener("click", function () { finish({ notSure: true }); });
    var box = el.querySelector("#other-box"), input = el.querySelector("#other-text"), send = el.querySelector("#other-send");
    el.querySelector("#other-btn").addEventListener("click", function () { box.hidden = false; input.focus(); });
    input.addEventListener("input", function () { send.disabled = input.value.trim().length === 0; });
    input.addEventListener("keydown", function (e) { if (e.key === "Enter" && input.value.trim()) send.click(); });
    send.addEventListener("click", function () { finish({ other: input.value.trim() }); });
  }

  var RESULT_TEXT = {
    lit: ["💡", "You knew why!", "This building lights up."],
    cracked: ["🧱", "Different reason", "Your agent chose this for a reason you didn't expect."],
    fog: ["☁️", "You'd lost track of this one", "That's okay. Now you know."]
  };

  function renderAnswer(el, ctx, b, d) {
    var r = ctx.result, a = r.answers[b.id];
    var t = RESULT_TEXT[a.result];
    var yours = a.notSure ? "Not sure" : a.picked ? MWT.reasonLabel(a.picked) : "“" + a.other + "”";
    var realWho = d.madeBy === "me" ? "Your reason at the time" : "Your agent's reason";
    var left = r.town.buildings.length - Object.keys(r.answers).length;
    var feedback = "";
    if (a.result === "cracked") {
      feedback = a.agreed === undefined
        ? '<div class="ask-ok"><p class="small"><strong>Is your agent\'s reason okay with you?</strong></p><div class="row">' +
          '<button class="btn secondary" data-agree="yes">Yes, that\'s fine</button><button class="btn secondary" data-agree="no">No, that\'s not my reason</button></div></div>'
        : '<p class="small done-tag">✔ ' + (a.agreed ? "Noted: the agent's reason is fine with you." : "Noted: that's not your reason. " + (ctx.settings.sendRepairsToAgent ? "Your agent will be told." : "Kept private.")) + "</p>";
    }
    el.innerHTML = '<button class="back" data-go="map">← Map</button>' +
      '<div class="card answer ' + a.result + '"><div class="answer-ico">' + t[0] + "</div><h2>" + t[1] + '</h2><p class="muted">' + t[2] + "</p>" +
      '<div class="compare"><div><strong>You said</strong>' + esc(yours) + "</div><div><strong>" + realWho + "</strong>" + esc(d.realReasons.map(MWT.reasonLabel).join(" · ")) + "</div></div>" +
      feedback +
      '<button class="btn big" data-go="map">' + (left ? "Back to map · " + left + " left" : "See my results") + "</button></div>";
    el.querySelectorAll("[data-agree]").forEach(function (btn) {
      btn.addEventListener("click", function () { MWT.app.saveAgreement(b.id, btn.getAttribute("data-agree") === "yes"); });
    });
  }

  return { renderHome: renderHome, renderMap: renderMap, renderAsk: renderAsk };
})();
