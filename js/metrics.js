// Metrics: north star, solution metrics and guardrails.
window.MWT = window.MWT || {};

MWT.metrics = (function () {
  var TARGETS = { playRate: 0.75, gapClosure: 0.5, ownWords: 0.6, minutes: 5, workload: 0.8, sadFeeling: 0.2 };
  var SAFE_LINE = 0.6;

  function ratio(a, b) { return b ? a / b : null; }
  function weekData(weekId) { return MWT.SAMPLE_WEEKS.filter(function (w) { return w.weekId === weekId; })[0]; }

  function computeWeek(weekId, state) {
    var r = state.results[weekId], week = weekData(weekId);
    var out = { weekId: weekId, played: !!(r && r.finished), workload: ratio(week.agentDecisions, week.totalDecisions) };
    if (!r || !r.plan) return out;
    var plan = r.plan, ans = r.answers || {};
    var byId = {};
    week.decisions.forEach(function (d) { byId[d.id] = d; });

    var lit = 0, done = 0, areaLit = {}, areaCount = {};
    plan.cards.forEach(function (c) {
      var a = ans[c.id];
      areaCount[c.area] = (areaCount[c.area] || 0) + 1;
      if (a) done++;
      if (a && a.result === "lit") { lit++; areaLit[c.area] = (areaLit[c.area] || 0) + 1; }
    });
    out.knew = lit; out.total = plan.cards.length; out.done = done;
    out.reasonMatch = ratio(lit, done);

    // Own words: "Other" answers that give a real reason
    var typed = plan.cards.map(function (c) { return ans[c.id]; }).filter(function (a) { return a && a.other !== undefined; });
    out.ownWords = typed.length ? typed.filter(function (a) { return a.ownPass; }).length / typed.length : null;

    // ⭐ North star estimate: each area weighted by its real share of my important choices
    var sum = 0, weight = 0, areaRate = {};
    Object.keys(plan.areaShare).forEach(function (area) {
      if (!areaCount[area]) return;
      areaRate[area] = (areaLit[area] || 0) / areaCount[area];
      sum += areaRate[area] * plan.areaShare[area];
      weight += plan.areaShare[area];
    });
    out.areaRate = areaRate;
    out.awareness = weight ? sum / weight : null;
    out.lowSample = plan.lowSample;
    out.minutes = r.startedAt && r.finishedAt ? (r.finishedAt - r.startedAt) / 60000 : null;

    // Gap closure: last week's missed reasons that came up again and are now known
    var idx = MWT.SAMPLE_WEEKS.indexOf(week);
    var prev = idx > 0 ? state.results[MWT.SAMPLE_WEEKS[idx - 1].weekId] : null;
    out.gapClosure = null;
    if (prev && prev.gap && prev.gap.gapReasonKeys.length) {
      var again = 0, closed = 0;
      plan.cards.forEach(function (c) {
        if (!byId[c.decisionId].realReasons.some(function (k) { return prev.gap.gapReasonKeys.indexOf(k) !== -1; })) return;
        again++;
        if (ans[c.id] && ans[c.id].result === "lit") closed++;
      });
      out.gapClosure = ratio(closed, again);
    }
    out.feeling = r.feeling || null;
    return out;
  }

  function summary(state) {
    var list = state.reached.map(function (i) { return computeWeek(MWT.SAMPLE_WEEKS[i].weekId, state); });
    var played = list.filter(function (m) { return m.played; });
    function avg(key) {
      var v = played.map(function (m) { return m[key]; }).filter(function (x) { return x !== null && x !== undefined; });
      return v.length ? v.reduce(function (a, b) { return a + b; }, 0) / v.length : null;
    }
    var mins = played.map(function (m) { return m.minutes; }).filter(function (x) { return x !== null; }).sort(function (a, b) { return a - b; });
    var feel = played.filter(function (m) { return m.feeling; });
    var vals = played.filter(function (m) { return !m.lowSample && m.awareness !== null; }).map(function (m) { return m.awareness; }).slice(-4);
    return {
      list: list,
      playRate: ratio(played.length, list.length),
      gapClosure: avg("gapClosure"),
      ownWords: avg("ownWords"),
      workload: avg("workload") === null && list.length ? list[list.length - 1].workload : avg("workload"),
      medianMinutes: mins.length ? mins[Math.floor(mins.length / 2)] : null,
      sadFeeling: feel.length ? feel.filter(function (m) { return m.feeling === "sad"; }).length / feel.length : null,
      trendAlert: vals.length === 4 && vals[1] < vals[0] && vals[2] < vals[1] && vals[3] < vals[2],
      safeLine: SAFE_LINE,
      targets: TARGETS
    };
  }

  function pct(v) { return v === null || v === undefined ? "—" : Math.round(v * 100) + "%"; }

  return { computeWeek: computeWeek, summary: summary, pct: pct };
})();
