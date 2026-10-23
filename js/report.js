// Report and Alerts + Progress screen.
window.MWT = window.MWT || {};

MWT.report = (function () {
  var esc = MWT.esc, pct = MWT.metrics.pct;

  function stat(num, lbl) { return '<div class="stat"><div class="num">' + num + '</div><div class="lbl">' + lbl + "</div></div>"; }

  function renderReport(el, ctx) {
    var r = ctx.result;
    if (!r.finished) { el.innerHTML = '<div class="card"><p>Finish visiting your town first.</p><button class="btn" data-go="town">Back to town</button></div>'; return; }
    var m = MWT.metrics.computeWeek(ctx.week.weekId, ctx.state);
    var sum = MWT.metrics.summary(ctx.state);
    var counts = { lit: 0, cracked: 0, fog: 0 };
    r.town.buildings.forEach(function (b) { var res = r.answers[b.id].result; counts[res === "skipped" ? "fog" : res]++; });

    // Positive line, compared with last week if possible
    var prev = ctx.prevMetrics, prevLit = null;
    if (prev && prev.played) {
      var pr = ctx.state.results[prev.weekId];
      prevLit = pr.town.buildings.filter(function (b) { return pr.answers[b.id] && pr.answers[b.id].result === "lit"; }).length;
    }
    var positive = counts.lit + " building" + (counts.lit === 1 ? "" : "s") + " lit this week" +
      (prevLit !== null ? (counts.lit > prevLit ? ", " + (counts.lit - prevLit) + " more than last week." : counts.lit === prevLit ? ", same as last week." : ".") : ".");

    // District alerts
    var alerts = Object.keys(m.areaRate).map(function (area) {
      var rate = m.areaRate[area], thr = sum.thresholds[area];
      return rate < thr
        ? '<div class="alert">☁️ <strong>' + MWT.AREA_NAMES[area] + " district is getting foggy</strong>: " + pct(rate) + " lit (safe line " + pct(thr) + ").</div>"
        : '<div class="ok">💡 ' + MWT.AREA_NAMES[area] + " district: " + pct(rate) + " lit (safe line " + pct(thr) + ").</div>";
    }).join("");
    if (sum.trendAlert) alerts += '<div class="alert">📉 Your town has dimmed 3 weeks in a row.</div>';
    if (m.lowSample) alerts += '<div class="note">Quiet week: few choices, so this week isn\'t used for trend alerts.</div>';

    var feel = ["happy", "ok", "sad"].map(function (f, i) {
      return '<button type="button" data-feel="' + f + '" aria-pressed="' + (r.feeling === f) + '" aria-label="' + f + '">' + ["🙂", "😐", "🙁"][i] + "</button>";
    }).join(" ");

    el.innerHTML = '<div class="card"><h1>Your town report</h1><p>' + esc(positive) + "</p>" +
      '<div class="stats">' +
      stat(pct(m.awareness), "Choice awareness (your north star)") +
      stat(counts.lit + " / " + r.town.buildings.length, "Buildings lit") +
      stat(m.gapClosure === null ? "—" : pct(m.gapClosure), "Last week's gaps you now know") +
      stat(m.ownWords === null ? "—" : m.ownWords ? "✔" : "✘", "Explained in your own words") +
      "</div>" + alerts + "</div>" +
      MWT.game.legend() + MWT.game.townHtml(ctx, false) +
      '<div class="card" style="margin-top:16px"><h3>How did that feel?</h3><div class="feel row">' + feel + "</div></div>" +
      '<div class="row">' + (counts.cracked + counts.fog ? '<button class="btn" data-go="repair">Repair ' + (counts.cracked + counts.fog) + " buildings</button>" : "") +
      '<button class="btn secondary" data-go="progress">See my progress</button></div>';

    el.querySelectorAll("[data-feel]").forEach(function (btn) {
      btn.addEventListener("click", function () { MWT.app.setFeeling(btn.getAttribute("data-feel")); });
    });
  }

  // Simple line chart: north star by week, with the default safe line
  function chart(list) {
    var pts = list.map(function (m, i) { return { i: i, v: m.played ? m.awareness : null, label: "W" + (i + 1) }; });
    var W = 560, H = 200, L = 40, R = 16, T = 14, B = 30;
    var n = Math.max(pts.length, 2);
    function x(i) { return L + (W - L - R) * (n === 1 ? 0 : i / (n - 1)); }
    function y(v) { return T + (H - T - B) * (1 - v); }
    var grid = [0, 0.5, 1].map(function (v) {
      return '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(v) + '" y2="' + y(v) + '"/><text x="4" y="' + (y(v) + 4) + '">' + v * 100 + "%</text>";
    }).join("");
    var thr = '<line class="thr" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(0.6) + '" y2="' + y(0.6) + '"/>';
    var valid = pts.filter(function (p) { return p.v !== null && p.v !== undefined; });
    var path = valid.map(function (p, k) { return (k ? "L" : "M") + x(p.i) + " " + y(p.v); }).join(" ");
    var dots = valid.map(function (p) { return '<circle class="dot" r="5" cx="' + x(p.i) + '" cy="' + y(p.v) + '"/>'; }).join("");
    var labels = pts.map(function (p) { return '<text x="' + (x(p.i) - 10) + '" y="' + (H - 8) + '">' + p.label + "</text>"; }).join("");
    return '<svg class="chart" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Choice awareness by week">' + grid + thr +
      (valid.length ? '<path class="line" d="' + path + '"/>' : "") + dots + labels + "</svg>";
  }

  function check(value, target, lowerIsBetter) {
    if (value === null || value === undefined) return "—";
    return (lowerIsBetter ? value <= target : value >= target) ? "✅" : "⚠️";
  }

  function renderProgress(el, ctx) {
    var s = MWT.metrics.summary(ctx.state), T = s.targets;
    var rows = s.list.map(function (m, i) {
      return "<tr><td>Week " + (i + 1) + "</td><td>" + (m.played ? "Played" : "Missed") + "</td><td>" + pct(m.awareness) + "</td><td>" + pct(m.reasonMatch) +
        "</td><td>" + pct(m.gapClosure) + "</td><td>" + (m.ownWords === null || m.ownWords === undefined ? "—" : m.ownWords ? "✔" : "✘") +
        "</td><td>" + (m.minutes === null || m.minutes === undefined ? "—" : m.minutes.toFixed(1) + " min") + "</td><td>" + pct(m.workload) + "</td></tr>";
    }).join("");
    var thr = Object.keys(s.thresholds).filter(function (a) {
      return s.list.some(function (m) { return m.areaRate && m.areaRate[a] !== undefined; });
    }).map(function (a) { return MWT.AREA_NAMES[a] + ": " + pct(s.thresholds[a]); }).join(" · ");

    el.innerHTML = '<div class="card"><h1>My progress</h1>' +
      '<h3>⭐ Choice awareness by week (north star)</h3><p class="muted small">Share of last week\'s important choices whose real reason you knew, weighted by how much of your week each area was. Dashed line: the safe line (60% until week 5).</p>' +
      chart(s.list) + (s.trendAlert ? '<div class="alert">📉 3 weeks of decline in a row.</div>' : "") +
      '<p class="small muted">Safe lines per district: ' + esc(thr || "—") + "</p></div>" +

      '<div class="card"><h3>Is the game working?</h3><div class="table-wrap"><table><thead><tr><th>Metric</th><th>Now</th><th>Target</th><th></th></tr></thead><tbody>' +
      "<tr><td>Weekly play rate</td><td>" + pct(s.playRate) + "</td><td>≥ " + pct(T.playRate) + "</td><td>" + check(s.playRate, T.playRate) + "</td></tr>" +
      "<tr><td><strong>Gap closure rate</strong> (main solution metric)</td><td>" + pct(s.gapClosure) + "</td><td>≥ " + pct(T.gapClosure) + "</td><td>" + check(s.gapClosure, T.gapClosure) + "</td></tr>" +
      "<tr><td>Reason match score</td><td>" + pct(s.reasonMatch) + "</td><td>Rising</td><td></td></tr>" +
      "<tr><td>Own-words score</td><td>" + pct(s.ownWords) + "</td><td>≥ " + pct(T.ownWords) + "</td><td>" + check(s.ownWords, T.ownWords) + "</td></tr>" +
      "</tbody></table></div></div>" +

      '<div class="card"><h3>Guardrails</h3><div class="table-wrap"><table><thead><tr><th>Guardrail</th><th>Now</th><th>Healthy if</th><th></th></tr></thead><tbody>' +
      "<tr><td>Time per game (median)</td><td>" + (s.medianMinutes === null ? "—" : s.medianMinutes.toFixed(1) + " min") + "</td><td>≤ " + T.minutes + " min</td><td>" + check(s.medianMinutes, T.minutes, true) + "</td></tr>" +
      "<tr><td>Skip rate</td><td>" + pct(s.skipRate) + "</td><td>≤ " + pct(T.skipRate) + "</td><td>" + check(s.skipRate, T.skipRate, true) + "</td></tr>" +
      "<tr><td>Agent workload share</td><td>" + pct(s.workload) + "</td><td>≥ " + pct(T.workload) + "</td><td>" + check(s.workload, T.workload) + "</td></tr>" +
      "<tr><td>Weeks that felt bad 🙁</td><td>" + pct(s.sadFeeling) + "</td><td>≤ " + pct(T.sadFeeling) + "</td><td>" + check(s.sadFeeling, T.sadFeeling, true) + "</td></tr>" +
      "</tbody></table></div></div>" +

      '<div class="card"><h3>Week by week</h3><div class="table-wrap"><table><thead><tr><th>Week</th><th>Status</th><th>Awareness</th><th>Reason match</th><th>Gap closure</th><th>Own words</th><th>Time</th><th>Agent share</th></tr></thead><tbody>' +
      rows + "</tbody></table></div></div>";
  }

  return { renderReport: renderReport, renderProgress: renderProgress };
})();
