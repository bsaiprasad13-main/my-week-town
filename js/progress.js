// Progress: the north star over weeks, plus details for those who want them.
window.MWT = window.MWT || {};

MWT.progress = (function () {
  var pct = MWT.metrics.pct;

  function chart(list, safe) {
    var pts = list.map(function (m, i) { return { i: i, v: m.played ? m.awareness : null }; });
    var W = 560, H = 230, L = 52, R = 24, T = 16, B = 34, n = Math.max(pts.length, 2);
    function x(i) { return L + (W - L - R) * (i / (n - 1)); }
    function y(v) { return T + (H - T - B) * (1 - v); }
    var grid = [0, 0.5, 1].map(function (v) {
      return '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(v) + '" y2="' + y(v) + '"/><text x="4" y="' + (y(v) + 5) + '">' + v * 100 + "%</text>";
    }).join("");
    var line = '<line class="thr" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(safe) + '" y2="' + y(safe) + '"/><text x="' + (W - R - 80) + '" y="' + (y(safe) - 8) + '">safe line</text>';
    var valid = pts.filter(function (p) { return p.v !== null && p.v !== undefined; });
    var path = valid.map(function (p, k) { return (k ? "L" : "M") + x(p.i) + " " + y(p.v); }).join(" ");
    var dots = valid.map(function (p) { return '<circle class="pt" r="6" cx="' + x(p.i) + '" cy="' + y(p.v) + '"/>'; }).join("");
    var labels = pts.map(function (p) { return '<text x="' + (x(p.i) - 14) + '" y="' + (H - 6) + '">Wk ' + (p.i + 1) + "</text>"; }).join("");
    return '<svg class="chart" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Awareness by week">' + grid + line +
      (valid.length > 1 ? '<path class="ln" d="' + path + '"/>' : "") + dots + labels + "</svg>";
  }

  function mark(v, t, lower) { return v === null || v === undefined ? "" : (lower ? v <= t : v >= t) ? "✅" : "⚠️"; }

  function render(el, ctx) {
    var s = MWT.metrics.summary(ctx.state), T = s.targets;
    var played = s.list.filter(function (m) { return m.played; });
    var last = played.slice(-1)[0];
    var rows = s.list.map(function (m, i) {
      return "<tr><td>Week " + (i + 1) + "</td><td>" + (m.played ? m.knew + "/" + m.total : "Missed") + "</td><td>" + pct(m.awareness) + "</td><td>" + pct(m.gapClosure) +
        "</td><td>" + (m.minutes === null || m.minutes === undefined ? "—" : m.minutes.toFixed(1) + " min") + "</td></tr>";
    }).join("");

    el.innerHTML = '<div class="panel"><h1>My progress</h1><p class="muted">How well you know the reasons behind your own choices, week by week.</p>' +
      '<div class="stats"><div class="stat"><div class="num">' + (last ? pct(last.awareness) : "—") + '</div><div class="lbl">⭐ Awareness, latest week</div></div>' +
      '<div class="stat"><div class="num">' + pct(s.gapClosure) + '</div><div class="lbl">Misses you knew the next week</div></div>' +
      '<div class="stat"><div class="num">' + played.length + "/" + s.list.length + '</div><div class="lbl">Weeks played</div></div></div>' +
      chart(s.list, s.safeLine) + (s.trendAlert ? '<p class="alert">📉 Your awareness has dropped 3 weeks in a row.</p>' : "") + "</div>" +

      '<details class="panel"><summary><strong>More details</strong> <span class="muted small">(all metrics and guardrails)</span></summary>' +
      '<div class="table-wrap"><table><thead><tr><th>Measure</th><th>Now</th><th>Target</th><th></th></tr></thead><tbody>' +
      "<tr><td>⭐ Awareness (north star)</td><td>" + (last ? pct(last.awareness) : "—") + "</td><td>Above " + pct(s.safeLine) + ", rising</td><td>" + mark(last ? last.awareness : null, s.safeLine) + "</td></tr>" +
      "<tr><td>Misses known next week (main solution metric)</td><td>" + pct(s.gapClosure) + "</td><td>≥ " + pct(T.gapClosure) + "</td><td>" + mark(s.gapClosure, T.gapClosure) + "</td></tr>" +
      "<tr><td>Weeks played</td><td>" + pct(s.playRate) + "</td><td>≥ " + pct(T.playRate) + "</td><td>" + mark(s.playRate, T.playRate) + "</td></tr>" +
      "<tr><td>Own words (typed reasons)</td><td>" + pct(s.ownWords) + "</td><td>≥ " + pct(T.ownWords) + "</td><td>" + mark(s.ownWords, T.ownWords) + "</td></tr>" +
      "<tr><td>Guardrail: time per week</td><td>" + (s.medianMinutes === null ? "—" : s.medianMinutes.toFixed(1) + " min") + "</td><td>≤ " + T.minutes + " min</td><td>" + mark(s.medianMinutes, T.minutes, true) + "</td></tr>" +
      "<tr><td>Guardrail: agent still does the work</td><td>" + pct(s.workload) + "</td><td>≥ " + pct(T.workload) + "</td><td>" + mark(s.workload, T.workload) + "</td></tr>" +
      "<tr><td>Guardrail: weeks that felt bad 🙁</td><td>" + pct(s.sadFeeling) + "</td><td>≤ " + pct(T.sadFeeling) + "</td><td>" + mark(s.sadFeeling, T.sadFeeling, true) + "</td></tr>" +
      "</tbody></table></div>" +
      '<h3 style="margin-top:16px">Week by week</h3><div class="table-wrap"><table><thead><tr><th>Week</th><th>Knew</th><th>Awareness</th><th>Misses known</th><th>Time</th></tr></thead><tbody>' +
      rows + "</tbody></table></div></details>";
  }

  return { render: render };
})();
