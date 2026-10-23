// App: holds state, switches screens, runs the weekly loop.
window.MWT = window.MWT || {};

MWT.app = (function () {
  var state = MWT.storage.load();
  var screenEl = document.getElementById("screen");

  function week() { return MWT.SAMPLE_WEEKS[state.weekIndex]; }

  // Latest gap report before this week (handles missed weeks)
  function lastGap(index) {
    for (var i = index - 1; i >= 0; i--) {
      var r = state.results[MWT.SAMPLE_WEEKS[i].weekId];
      if (r && r.gap) return r.gap;
    }
    return null;
  }

  // Build this week's cards once; the builder itself remembers nothing.
  function ensureResult() {
    var w = week();
    if (!state.results[w.weekId]) {
      state.results[w.weekId] = {
        weekId: w.weekId, plan: MWT.cardBuilder.buildWeek(w, lastGap(state.weekIndex), state.settings),
        answers: {}, finished: false, startedAt: null, finishedAt: null, feeling: null, gap: null
      };
      MWT.storage.save(state);
    }
    return state.results[w.weekId];
  }

  function ctx(param) {
    var w = week(), byId = {};
    w.decisions.forEach(function (d) { byId[d.id] = d; });
    var pos = state.reached.indexOf(state.weekIndex);
    return {
      state: state, settings: state.settings, week: w, result: ensureResult(), byId: byId, param: param,
      prevMetrics: pos > 0 ? MWT.metrics.computeWeek(MWT.SAMPLE_WEEKS[state.reached[pos - 1]].weekId, state) : null,
      isLastWeek: state.weekIndex >= MWT.SAMPLE_WEEKS.length - 1
    };
  }

  function go(name, param) {
    var c = ctx(param);
    if (name === "card" && !c.result.startedAt) { c.result.startedAt = Date.now(); MWT.storage.save(state); }
    var w = week();
    document.getElementById("week-label").textContent = "Week " + (state.weekIndex + 1) + " of " + MWT.SAMPLE_WEEKS.length + " · " + MWT.niceDate(w.start) + " – " + MWT.niceDate(w.end) + ", 2040";
    document.getElementById("next-week").hidden = c.isLastWeek;
    var views = { home: MWT.cards.renderHome, card: MWT.cards.renderCard, results: MWT.cards.renderResults, progress: MWT.progress.render, settings: MWT.settingsScreen.render };
    (views[name] || views.home)(screenEl, c);
    screenEl.querySelectorAll("[data-go]").forEach(function (b) { b.addEventListener("click", function () { go(b.getAttribute("data-go")); }); });
    window.scrollTo(0, 0);
  }

  function saveAnswer(cardId, answer) {
    var c = ctx(), r = c.result;
    r.answers[cardId] = answer;
    if (Object.keys(r.answers).length === r.plan.cards.length && !r.finished) {
      r.finished = true;
      r.finishedAt = Date.now();
      r.gap = MWT.scoring.gapReport(r.plan, r.answers, c.byId);
    }
    MWT.storage.save(state);
  }

  function saveAgreement(cardId, agreed, idx) {
    ensureResult().answers[cardId].agreed = agreed;
    MWT.storage.save(state);
    go("card", idx);
  }

  function setFeeling(f) { ensureResult().feeling = f; MWT.storage.save(state); go("results"); }
  function saveSettings(s) { state.settings = Object.assign(state.settings, s); MWT.storage.save(state); }

  function nextWeek() {
    if (state.weekIndex >= MWT.SAMPLE_WEEKS.length - 1) return;
    state.weekIndex++;
    if (state.reached.indexOf(state.weekIndex) === -1) state.reached.push(state.weekIndex);
    MWT.storage.save(state);
    go("home");
  }

  function resetAll() { state = MWT.storage.reset(); go("home"); }

  document.getElementById("go-home").addEventListener("click", function () { go("home"); });
  document.getElementById("go-progress").addEventListener("click", function () { go("progress"); });
  document.getElementById("go-settings").addEventListener("click", function () { go("settings"); });
  document.getElementById("next-week").addEventListener("click", nextWeek);
  document.getElementById("reset-demo").addEventListener("click", function () {
    if (window.confirm("Start the demo again from week 1?")) resetAll();
  });

  setTimeout(function () { go("home"); }, 0);

  return { go: go, saveAnswer: saveAnswer, saveAgreement: saveAgreement, setFeeling: setFeeling, saveSettings: saveSettings, nextWeek: nextWeek, resetAll: resetAll };
})();
