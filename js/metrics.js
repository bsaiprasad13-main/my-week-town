// Metrics Tracker: every formula from docs/build/06-metrics-tracking.md
window.MWT = window.MWT || {};

MWT.metrics = (function () {
  var DEFAULT_THRESHOLD = 0.6;
  var TARGETS = { playRate: 0.75, gapClosure: 0.5, ownWords: 0.6, minutes: 5, skipRate: 0.15, workload: 0.8, sadFeeling: 0.2 };

  function weekData(weekId) {
    return MWT.SAMPLE_WEEKS.filter(function (w) { return w.weekId === weekId; })[0];
  }
  function decisionsById(week) {
    var map = {};
    week.decisions.forEach(function (d) { map[d.id] = d; });
    return map;
  }
  function ratio(a, b) { return b ? a / b : null; }

  // One week's numbers
  function computeWeek(weekId, state) {
    var r = state.results[weekId];
    var week = weekData(weekId);
    var out = { weekId: weekId, played: !!(r && r.finished), workload: ratio(week.agentDecisions, week.totalDecisions) };
    if (!r || !r.town) return out;

    var town = r.town, ans = r.answers || {}, byId = decisionsById(week);
    var lit = 0, answered = 0, skipped = 0, areaLit = {}, areaCount = {};
    town.buildings.forEach(function (b) {
      var a = ans[b.id];
      var res = a ? a.result : "skipped";
      areaCount[b.area] = (areaCount[b.area] || 0) + 1;
      if (res === "skipped") skipped++; else answered++;
      if (res === "lit") { lit++; areaLit[b.area] = (areaLit[b.area] || 0) + 1; }
    });

    // Reason Match Score: lit ÷ answered (skips left out)
    out.reasonMatch = ratio(lit, answered);
    out.skipRate = ratio(skipped, town.buildings.length);

    // Own-Words Score: answers typed in "Other" that give a real reason
    var typed = town.buildings.map(function (b) { return ans[b.id]; }).filter(function (a) { return a && a.other !== undefined; });
    out.ownWords = typed.length ? typed.filter(function (a) { return a.ownPass; }).length / typed.length : null;

    // North star estimate: weight each area by its real share of important choices
    var areaRate = {}, sum = 0, weight = 0;
    Object.keys(town.areaShare).forEach(function (area) {
      if (!areaCount[area]) return;
      areaRate[area] = (areaLit[area] || 0) / areaCount[area];
      sum += areaRate[area] * town.areaShare[area];
      weight += town.areaShare[area];
    });
    out.areaRate = areaRate;
    out.awareness = weight ? sum / weight : null;
    out.lowSample = town.lowSample;

    // Time per game, in minutes
    out.minutes = r.startedAt && r.finishedAt ? (r.finishedAt - r.startedAt) / 60000 : null;

    // Gap Closure Rate: last week's gap reasons that came up again and are now lit
    var idx = MWT.SAMPLE_WEEKS.indexOf(week);
    var prev = idx > 0 ? state.results[MWT.SAMPLE_WEEKS[idx - 1].weekId] : null;
    if (prev && prev.gap && prev.gap.gapReasonKeys.length) {
      var again = 0, closed = 0;
      town.buildings.forEach(function (b) {
        var d = byId[b.decisionId];
        var repeats = d.realReasons.some(function (k) { return prev.gap.gapReasonKeys.indexOf(k) !== -1; });
        if (!repeats) return;
        again++;
        if (ans[b.id] && ans[b.id].result === "lit") closed++;
      });
      out.gapClosure = ratio(closed, again);
      out.gapRepeats = again;
    } else {
      out.gapClosure = null;
    }

    out.feeling = r.feeling || null;
    return out;
  }

  // All weeks reached so far
  function series(state) {
    return state.reached.map(function (i) { return computeWeek(MWT.SAMPLE_WEEKS[i].weekId, state); });
  }

  function thresholds(list) {
    var played = list.filter(function (m) { return m.played && !m.lowSample; });
    var t = {};
    MWT.AREAS.forEach(function (area) {
      var first = played.slice(0, 4).map(function (m) { return m.areaRate && m.areaRate[area]; })
        .filter(function (v) { return v !== undefined && v !== null; });
      t[area] = played.length > 4 && first.length ? 0.9 * (first.reduce(function (a, b) { return a + b; }, 0) / first.length) : DEFAULT_THRESHOLD;
    });
    return t;
  }

  function trendAlert(list) {
    var vals = list.filter(function (m) { return m.played && !m.lowSample && m.awareness !== null; })
      .map(function (m) { return m.awareness; });
    if (vals.length < 4) return false;
    var last = vals.slice(-4);
    return last[1] < last[0] && last[2] < last[1] && last[3] < last[2];
  }

  function summary(state) {
    var list = series(state);
    var played = list.filter(function (m) { return m.played; });
    function avg(key) {
      var v = played.map(function (m) { return m[key]; }).filter(function (x) { return x !== null && x !== undefined; });
      return v.length ? v.reduce(function (a, b) { return a + b; }, 0) / v.length : null;
    }
    var feelings = played.filter(function (m) { return m.feeling; });
    var minutes = played.map(function (m) { return m.minutes; }).filter(function (x) { return x !== null; }).sort(function (a, b) { return a - b; });
    return {
      list: list,
      playRate: ratio(played.length, list.length),
      reasonMatch: avg("reasonMatch"),
      ownWords: avg("ownWords"),
      gapClosure: avg("gapClosure"),
      skipRate: avg("skipRate"),
      workload: avg("workload") === null ? (list.length ? list[list.length - 1].workload : null) : avg("workload"),
      medianMinutes: minutes.length ? minutes[Math.floor(minutes.length / 2)] : null,
      sadFeeling: feelings.length ? feelings.filter(function (m) { return m.feeling === "sad"; }).length / feelings.length : null,
      thresholds: thresholds(list),
      trendAlert: trendAlert(list),
      targets: TARGETS
    };
  }

  function pct(v) { return v === null || v === undefined ? "—" : Math.round(v * 100) + "%"; }

  return { computeWeek: computeWeek, series: series, summary: summary, thresholds: thresholds, pct: pct, TARGETS: TARGETS };
})();
