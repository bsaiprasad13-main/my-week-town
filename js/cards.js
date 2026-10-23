// Screens: welcome, one card at a time, results.
window.MWT = window.MWT || {};

MWT.esc = function (s) {
  return String(s === undefined || s === null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
};
MWT.rupees = function (n) { return n ? "₹" + n.toLocaleString("en-IN") : ""; };
MWT.niceDate = function (iso) {
  var p = String(iso).split("-");
  var m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return p.length === 3 ? parseInt(p[2], 10) + " " + m[parseInt(p[1], 10) - 1] : iso;
};

MWT.cards = (function () {
  var esc = MWT.esc;
  var RESULT = {
    lit: { icon: "✅", title: "You knew why", text: "Your reason matches the real one." },
    cracked: { icon: "🔀", title: "Different reason", text: "Your agent chose this for a reason you didn't expect." },
    fog: { icon: "❔", title: "You'd lost track", text: "That's okay. Now you know." }
  };

  function whoMade(d) {
    return d.madeBy === "me" ? "You decided" : d.madeBy === "approved" ? "Your agent picked, you said yes" : "Your agent decided";
  }
  function short(d) { return (MWT.SHORT_NAMES && MWT.SHORT_NAMES[d.id]) || d.title; }

  function dots(ctx, current) {
    return '<div class="dots" aria-hidden="true">' + ctx.result.plan.cards.map(function (c, i) {
      var a = ctx.result.answers[c.id];
      return '<span class="dot ' + (a ? a.result : i === current ? "now" : "") + '"></span>';
    }).join("") + "</div>";
  }

  // Welcome: what it is and why it matters, in one look
  function renderHome(el, ctx) {
    var r = ctx.result, w = ctx.week;
    if (r.finished) { MWT.app.go("results"); return; }
    var important = w.decisions.filter(function (d) { return MWT.cardBuilder.isImportant(d, ctx.settings); });
    var byAgent = important.filter(function (d) { return d.madeBy !== "me"; }).length;
    var done = Object.keys(r.answers).length;
    var prev = ctx.prevMetrics;
    var focus = r.plan.focusAreas.map(function (a) { return MWT.AREA_NAMES[a]; });

    el.innerHTML =
      '<section class="hero"><p class="eyebrow">Your week of ' + MWT.niceDate(w.start) + " – " + MWT.niceDate(w.end) + ", 2040</p>" +
      '<h1>Your AI agent made <span class="hl">' + byAgent + " of your " + important.length + "</span> big choices last week.<br>Do you still know <em>why</em>?</h1>" +
      '<p class="lead">Every Sunday, 5 quick cards check if you still know the reasons behind your own choices, so you can always explain them yourself.</p></section>' +
      '<ol class="steps">' +
      "<li><span>🃏</span><div><strong>5 cards from your week</strong><p>Each card is one big choice.</p></div></li>" +
      "<li><span>👆</span><div><strong>Pick the real reason</strong><p>Or type your own, or say you're not sure.</p></div></li>" +
      "<li><span>✅</span><div><strong>See what you knew</strong><p>Your score shows where you've lost track.</p></div></li>" +
      "</ol>" +
      (focus.length ? '<p class="note">Last week you lost track in <strong>' + esc(focus.join(" and ")) + "</strong>, so you'll see more of those cards this week.</p>" : "") +
      (prev && prev.played && prev.awareness !== null ? '<p class="muted center">Last week you knew <strong>' + MWT.metrics.pct(prev.awareness) + "</strong> of your reasons.</p>" : "") +
      '<div class="center"><button class="btn big" data-go="card">' + (done ? "Continue · card " + (done + 1) + " of " + r.plan.cards.length : "Start my " + r.plan.cards.length + " cards") +
      '</button><p class="muted small">About 2 minutes</p></div>';
  }

  // One card: question, or its answer if already answered
  function renderCard(el, ctx) {
    var r = ctx.result, cards = r.plan.cards;
    var idx = typeof ctx.param === "number" ? ctx.param : cards.findIndex(function (c) { return !r.answers[c.id]; });
    if (idx === -1) { MWT.app.go("results"); return; }
    var c = cards[idx], d = ctx.byId[c.decisionId], a = r.answers[c.id];
    var head = '<p class="count">Card ' + (idx + 1) + " of " + cards.length + "</p>" + dots(ctx, idx) +
      '<div class="card-face"><div class="choice"><span class="ico">' + d.icon + "</span><div><h2>" + esc(d.title) + '</h2><p class="muted small">' +
      [MWT.rupees(d.amount), whoMade(d), MWT.niceDate(d.date)].filter(Boolean).join(" · ") + "</p></div></div>" +
      '<div class="speech"><span class="who">' + c.asker.icon + '</span><div class="bubble"><strong>' + esc(c.asker.name) + " asks</strong>" + esc(c.prompt) + "</div></div>";

    if (!a) {
      el.innerHTML = head + '<p class="q">What was the real reason?</p><div class="options">' +
        c.options.map(function (o) { return '<button type="button" class="option" data-k="' + esc(o.key) + '">' + esc(o.text) + "</button>"; }).join("") +
        '<button type="button" class="option other" id="other-btn">✏️ Other reason (type it)</button>' +
        '<div class="other-box" id="other-box" hidden><input id="other-text" type="text" placeholder="The reason, in your own words" aria-label="The reason, in your own words"><button class="btn" id="other-send" disabled>Check</button></div>' +
        '<button type="button" class="option notsure" data-notsure>🤷 Not sure</button></div></div>';

      function finish(answer) {
        var s = MWT.scoring.score(c, d, answer);
        answer.result = s.result; answer.ownPass = !!s.ownPass;
        MWT.app.saveAnswer(c.id, answer);
        MWT.app.go("card", idx);
      }
      el.querySelectorAll(".option[data-k]").forEach(function (b) { b.addEventListener("click", function () { finish({ picked: b.getAttribute("data-k") }); }); });
      el.querySelector("[data-notsure]").addEventListener("click", function () { finish({ notSure: true }); });
      var box = el.querySelector("#other-box"), input = el.querySelector("#other-text"), send = el.querySelector("#other-send");
      el.querySelector("#other-btn").addEventListener("click", function () { box.hidden = false; input.focus(); });
      input.addEventListener("input", function () { send.disabled = !input.value.trim(); });
      input.addEventListener("keydown", function (e) { if (e.key === "Enter" && input.value.trim()) send.click(); });
      send.addEventListener("click", function () { finish({ other: input.value.trim() }); });
      return;
    }

    var t = RESULT[a.result];
    var yours = a.notSure ? "Not sure" : a.picked ? MWT.reasonLabel(a.picked) : "“" + a.other + "”";
    var ask = "";
    if (a.result === "cracked") {
      ask = a.agreed === undefined
        ? '<div class="agree"><p class="small"><strong>Is your agent\'s reason okay with you?</strong></p><div class="row center-row">' +
          '<button class="btn secondary" data-agree="yes">Yes, that\'s fine</button><button class="btn secondary" data-agree="no">No, not my reason</button></div></div>'
        : '<p class="small done">✔ ' + (a.agreed ? "Noted: that reason is fine with you." : "Noted: not your reason. " + (ctx.settings.sendRepairsToAgent ? "Your agent will be told." : "Kept private.")) + "</p>";
    }
    var last = idx === cards.length - 1 || cards.every(function (x) { return r.answers[x.id]; });
    el.innerHTML = head + '<div class="verdict ' + a.result + '"><span class="v-ico">' + t.icon + "</span><div><strong>" + t.title + '</strong><p class="small">' + t.text + "</p></div></div>" +
      '<div class="compare"><div><strong>You said</strong>' + esc(yours) + "</div><div><strong>" + (d.madeBy === "me" ? "Your reason at the time" : "Your agent's reason") + "</strong>" +
      esc(d.realReasons.map(MWT.reasonLabel).join(" · ")) + "</div></div>" + ask + "</div>" +
      '<div class="center"><button class="btn big" id="next">' + (last ? "See my score" : "Next card →") + "</button></div>";
    el.querySelectorAll("[data-agree]").forEach(function (b) { b.addEventListener("click", function () { MWT.app.saveAgreement(c.id, b.getAttribute("data-agree") === "yes", idx); }); });
    el.querySelector("#next").addEventListener("click", function () { last ? MWT.app.go("results") : MWT.app.go("card"); });
  }

  function renderResults(el, ctx) {
    var r = ctx.result;
    if (!r.finished) { MWT.app.go("card"); return; }
    var m = MWT.metrics.computeWeek(ctx.week.weekId, ctx.state);
    var rows = r.plan.cards.map(function (c, i) {
      var d = ctx.byId[c.decisionId], a = r.answers[c.id];
      return '<li class="res ' + a.result + '"><button type="button" data-card="' + i + '"><span class="r-ico">' + RESULT[a.result].icon + '</span><span class="r-main"><strong>' + d.icon + " " + esc(short(d)) +
        '</strong><span class="small muted">Real reason: ' + esc(MWT.reasonLabel(d.realReasons[0])) + "</span></span></button></li>";
    }).join("");
    var feel = ["happy", "ok", "sad"].map(function (f, i) {
      return '<button type="button" data-feel="' + f + '" aria-pressed="' + (r.feeling === f) + '" aria-label="' + f + '">' + ["🙂", "😐", "🙁"][i] + "</button>";
    }).join("");
    var line = m.knew === m.total ? "You knew every reason this week." : m.knew >= m.total / 2 ? "Good. Look at the ones you missed below." : "Your agent is deciding a lot without you knowing why. Look at the ones you missed.";

    el.innerHTML = '<div class="score-card"><p class="eyebrow">This week</p><div class="score">' + m.knew + "<span>/" + m.total + "</span></div>" +
      "<h1>You knew why for " + m.knew + " of " + m.total + " choices</h1><p class=\"muted\">" + line + "</p>" +
      '<div class="mini"><div><strong>' + MWT.metrics.pct(m.awareness) + '</strong><span>Your awareness ⭐</span></div>' +
      (m.gapClosure !== null ? "<div><strong>" + MWT.metrics.pct(m.gapClosure) + "</strong><span>Last week's misses you now know</span></div>" : "") + "</div></div>" +
      '<ul class="results">' + rows + "</ul>" +
      '<div class="feel center"><span class="small muted">How did that feel?</span> ' + feel + "</div>" +
      '<div class="center row center-row">' + (ctx.isLastWeek ? "" : '<button class="btn big" data-next>Next week →</button>') +
      '<button class="btn secondary" data-go="progress">My progress</button></div>';

    el.querySelectorAll("[data-card]").forEach(function (b) { b.addEventListener("click", function () { MWT.app.go("card", parseInt(b.getAttribute("data-card"), 10)); }); });
    el.querySelectorAll("[data-feel]").forEach(function (b) { b.addEventListener("click", function () { MWT.app.setFeeling(b.getAttribute("data-feel")); }); });
    var next = el.querySelector("[data-next]");
    if (next) next.addEventListener("click", MWT.app.nextWeek);
  }

  return { renderHome: renderHome, renderCard: renderCard, renderResults: renderResults };
})();
