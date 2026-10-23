// App: holds state, switches screens, runs the weekly loop.
window.MWT = window.MWT || {};

MWT.app = (function () {
  var state = MWT.storage.load();
  var screenEl = document.getElementById("screen");
  var current = { name: "home", param: null };

  function week() { return MWT.SAMPLE_WEEKS[state.weekIndex]; }

  // Last gap report available before this week (handles missed weeks: U2)
  function lastGap(index) {
    for (var i = index - 1; i >= 0; i--) {
      var r = state.results[MWT.SAMPLE_WEEKS[i].weekId];
      if (r && r.gap) return r.gap;
    }
    return null;
  }

  // Build this week's town once; the builder itself remembers nothing.
  function ensureResult() {
    var w = week();
    if (!state.results[w.weekId]) {
      state.results[w.weekId] = {
        weekId: w.weekId,
        town: MWT.townBuilder.buildTown(w, lastGap(state.weekIndex), state.settings),
        answers: {}, repairs: {}, finished: false, startedAt: null, finishedAt: null, feeling: null, gap: null
      };
      MWT.storage.save(state);
    }
    return state.results[w.weekId];
  }

  function ctx() {
    var w = week(), byId = {};
    w.decisions.forEach(function (d) { byId[d.id] = d; });
    var prevIdx = state.reached.indexOf(state.weekIndex) - 1;
    var prevMetrics = prevIdx >= 0 ? MWT.metrics.computeWeek(MWT.SAMPLE_WEEKS[state.reached[prevIdx]].weekId, state) : null;
    return { state: state, settings: state.settings, week: w, weekIndex: state.weekIndex, result: ensureResult(), byId: byId, prevMetrics: prevMetrics };
  }

  function header() {
    var w = week();
    document.getElementById("week-label").textContent = "Week " + (state.weekIndex + 1) + " of " + MWT.SAMPLE_WEEKS.length + " · " + MWT.niceDate(w.start) + " to " + MWT.niceDate(w.end);
    var next = document.getElementById("next-week");
    var last = state.weekIndex >= MWT.SAMPLE_WEEKS.length - 1;
    next.disabled = last;
    next.textContent = last ? "Last sample week" : "Next week ▸";
  }

  function go(name, param) {
    current = { name: name, param: param };
    var c = ctx();
    if ((name === "summary" || name === "town") && !c.result.startedAt) { c.result.startedAt = Date.now(); MWT.storage.save(state); }
    header();
    var views = {
      home: MWT.game.renderHome, summary: MWT.game.renderSummary, town: MWT.game.renderTown,
      visit: MWT.game.renderVisit, reveal: MWT.game.renderReveal, report: MWT.report.renderReport,
      repair: MWT.repair.renderRepair, progress: MWT.report.renderProgress, settings: MWT.settingsScreen.render
    };
    (views[name] || views.home)(screenEl, c, param);
    screenEl.querySelectorAll("[data-go]").forEach(function (btn) {
      btn.addEventListener("click", function () { go(btn.getAttribute("data-go")); });
    });
    window.scrollTo(0, 0);
  }

  function saveAnswer(bId, answer) {
    var c = ctx(), r = c.result;
    r.answers[bId] = answer;
    if (Object.keys(r.answers).length === r.town.buildings.length && !r.finished) {
      r.finished = true;
      r.finishedAt = Date.now();
      r.gap = MWT.scoring.gapReport(r.town, r.answers, c.byId);
    }
    MWT.storage.save(state);
  }

  function saveRepair(bId, repair) {
    ensureResult().repairs[bId] = repair;
    MWT.storage.save(state);
    go("repair");
  }

  function setFeeling(f) {
    ensureResult().feeling = f;
    MWT.storage.save(state);
    go("report");
  }

  function saveSettings(s) {
    state.settings = Object.assign(state.settings, s);
    MWT.storage.save(state);
  }

  function nextWeek() {
    if (state.weekIndex >= MWT.SAMPLE_WEEKS.length - 1) return;
    state.weekIndex++;
    if (state.reached.indexOf(state.weekIndex) === -1) state.reached.push(state.weekIndex);
    MWT.storage.save(state);
    go("home");
  }

  function resetAll() {
    state = MWT.storage.reset();
    go("home");
  }

  document.getElementById("go-home").addEventListener("click", function () { go("home"); });
  document.getElementById("go-progress").addEventListener("click", function () { go("progress"); });
  document.getElementById("go-settings").addEventListener("click", function () { go("settings"); });
  document.getElementById("next-week").addEventListener("click", nextWeek);
  document.getElementById("reset-demo").addEventListener("click", function () {
    if (window.confirm("Start the demo again from week 1?")) resetAll();
  });

  // Start once everything is defined
  setTimeout(function () { go("home"); }, 0);

  return { go: go, saveAnswer: saveAnswer, saveRepair: saveRepair, setFeeling: setFeeling, saveSettings: saveSettings, resetAll: resetAll };
})();
