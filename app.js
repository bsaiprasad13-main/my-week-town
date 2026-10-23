// My Week Town: the town, the walk and the screens. Data lives in data.js.
var W = 360, ROW = 132;
var mapEl = document.getElementById("map"), sheet = document.getElementById("sheet"), finale = document.getElementById("finale");
var statusEl = document.getElementById("status");
var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var game;

function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function pct(v, total) { return (v / total * 100) + "%"; }

/* ---------- The cat (oneko sprite sheet by adryd, MIT, 32 px frames) ---------- */
var SPRITES = {
  idle: [[-3, -3]], alert: [[-7, -3]], tired: [[-3, -2]],
  sleeping: [[-2, 0], [-2, -1]], scratch: [[-5, 0], [-6, 0], [-7, 0]],
  N: [[-1, -2], [-1, -3]], NE: [[0, -2], [0, -3]], E: [[-3, 0], [-3, -1]], SE: [[-5, -1], [-5, -2]],
  S: [[-6, -3], [-7, -2]], SW: [[-5, -3], [-6, -1]], W: [[-4, -2], [-4, -3]], NW: [[-1, 0], [-1, -1]]
};
var cat = { mode: "sleeping", frame: 0, idleTicks: 0 };

function setSprite(name, frame) {
  var el = document.getElementById("cat-sprite");
  if (!el) return;
  var set = SPRITES[name], f = set[frame % set.length];
  el.style.backgroundPosition = (f[0] * 32) + "px " + (f[1] * 32) + "px";
}

// 10 frames a second, like the original
setInterval(function () {
  cat.frame++;
  if (cat.mode === "idle") {
    cat.idleTicks++;
    var t = cat.idleTicks % 60; // scratches now and then while you answer
    setSprite(t > 40 && t < 52 ? "scratch" : "idle", cat.frame);
  } else if (cat.mode === "sleeping") {
    setSprite("sleeping", Math.floor(cat.frame / 4));
  } else {
    setSprite(cat.mode, cat.frame);
  }
}, 100);

function direction(dx, dy) {
  var d = Math.hypot(dx, dy) || 1, s = "";
  if (dy / d < -0.5) s += "N"; if (dy / d > 0.5) s += "S";
  if (dx / d > 0.5) s += "E"; if (dx / d < -0.5) s += "W";
  return s || "S";
}

/* ---------- The town ---------- */
function ico(name, cls) { return '<img class="ic ' + (cls || "") + '" src="icons/' + name + '.png" alt="">'; }

function layout(n) {
  var H = 190 + n * ROW + 160;
  var home = { x: 180, y: H - 110 }, hall = { x: 180, y: 90 }, spots = [];
  for (var i = 0; i < n; i++) spots.push({ x: i % 2 === 0 ? 100 : 260, y: H - 215 - i * ROW });
  return { H: H, home: home, hall: hall, spots: spots };
}

function drawTown() {
  var L = game.L, n = game.week.stops.length, H = L.H;
  mapEl.style.aspectRatio = W + " / " + H;
  var pts = [{ x: L.home.x, y: L.home.y + 84 }]
    .concat(L.spots.map(function (s) { return { x: s.x, y: s.y + 82 }; }))
    .concat([{ x: L.hall.x, y: L.hall.y + 86 }]);
  game.path = pts;
  function leg(i) { var q = pts[i - 1], p = pts[i], my = (q.y + p.y) / 2; return "C" + q.x + " " + my + " " + p.x + " " + my + " " + p.x + " " + p.y; }
  var d = "M" + pts[0].x + " " + pts[0].y;
  for (var i = 1; i < pts.length; i++) d += " " + leg(i);

  var svg = "", deco = "";
  function img(name, x, y, size, cls, delay) {
    return '<image href="icons/' + name + '.png" x="' + x + '" y="' + y + '" width="' + size + '" height="' + size + '"' +
      (cls ? ' class="' + cls + '"' : "") + (delay ? ' style="animation-delay:' + delay + 's"' : "") + "/>";
  }
  function pad(x, y, rx, ry) {
    return '<ellipse cx="' + x + '" cy="' + (y + 5) + '" rx="' + rx + '" ry="' + ry + '" fill="rgba(70,90,70,.13)"/>' +
      '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="url(#pad)" stroke="#fbfaf5" stroke-width="2"/>';
  }

  // Ground: soft grass with tufts, light vignette
  svg += '<defs>' +
    '<radialGradient id="g" cx="50%" cy="45%" r="80%"><stop offset="0" stop-color="#e5eedd"/><stop offset="1" stop-color="#d2dfca"/></radialGradient>' +
    '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3ebf3"/><stop offset="1" stop-color="#e3ebf3" stop-opacity="0"/></linearGradient>' +
    '<radialGradient id="pad" cx="50%" cy="35%" r="70%"><stop offset="0" stop-color="#f6f4ec"/><stop offset="1" stop-color="#e4e1d4"/></radialGradient>' +
    '<radialGradient id="pond" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#dbe8ef"/><stop offset="1" stop-color="#b9cfdc"/></radialGradient>' +
    '<radialGradient id="vig" cx="50%" cy="50%" r="75%"><stop offset=".7" stop-color="#5a6e5a" stop-opacity="0"/><stop offset="1" stop-color="#5a6e5a" stop-opacity=".12"/></radialGradient>' +
    '<pattern id="tuft" width="26" height="22" patternUnits="userSpaceOnUse"><path d="M5 15 l2 -5 M8 15 l-1 -4 M18 7 l2 -4 M21 7 l-1 -3" stroke="#bfd0b6" stroke-width="1.2" stroke-linecap="round" opacity=".38"/></pattern>' +
    "</defs>";
  svg += '<rect width="' + W + '" height="' + H + '" fill="url(#g)"/><rect width="' + W + '" height="' + H + '" fill="url(#tuft)"/>';

  // Sky and rolling hills behind the town hall
  svg += '<rect width="' + W + '" height="170" fill="url(#sky)"/>' +
    '<path d="M0 120 C60 80 120 86 180 112 C240 86 300 78 360 110 L360 200 L0 200 Z" fill="#dce8d4" opacity=".9"/>' +
    '<path d="M0 150 C80 118 150 128 210 146 C270 126 320 124 360 142 L360 210 L0 210 Z" fill="#d5e2cc"/>';

  // Pond near home
  var py = H - 52;
  svg += '<ellipse cx="62" cy="' + py + '" rx="48" ry="20" fill="url(#pond)" stroke="#eef4f6" stroke-width="3"/>' +
    '<ellipse cx="50" cy="' + (py - 6) + '" rx="16" ry="4" fill="#fff" opacity=".45"/>' +
    '<ellipse class="ripple" cx="74" cy="' + (py + 3) + '" rx="6" ry="2.5" fill="none" stroke="#fff" stroke-width="1.2"/>' +
    img("herb", 98, py - 22, 22);

  // Road, the trail you've walked, and the centre line
  svg += '<path d="' + d + '" class="road-edge"/><path d="' + d + '" class="road"/>';
  for (i = 1; i < pts.length; i++) svg += '<path d="M' + pts[i - 1].x + " " + pts[i - 1].y + " " + leg(i) + '" class="trail" id="trail' + (i - 1) + '"/>';
  svg += '<path d="' + d + '" class="road-line"/>';

  // Platforms under every building, a plaza with flags and a fountain at the town hall
  svg += pad(L.home.x, L.home.y + 10, 48, 15) + pad(L.hall.x, L.hall.y + 10, 66, 18);
  L.spots.forEach(function (s) { svg += pad(s.x, s.y + 8, 44, 14); });
  [L.hall.x - 62, L.hall.x + 62].forEach(function (fx, k) {
    svg += '<line x1="' + fx + '" y1="' + (L.hall.y + 10) + '" x2="' + fx + '" y2="' + (L.hall.y - 34) + '" stroke="#a9b3ad" stroke-width="2"/>' +
      '<path class="flag" d="M' + fx + " " + (L.hall.y - 34) + " l16 5 l-16 5 Z" + '" fill="' + (k ? "#9ea3cf" : "#7895ab") + '"/>';
  });

  // Trees on both edges (they sway), little things next to each stop
  for (var y = 40; y < H - 60; y += 78) {
    if (y < H - 140) deco += img(y % 2 ? "tree1" : "tree2", y % 3 ? 4 : 14, y, 34, "tree", (y % 7) * 0.4);
    deco += img(y % 2 ? "tree2" : "tree1", y % 3 ? 322 : 312, y + 34, 34, "tree", (y % 5) * 0.5);
  }
  L.spots.forEach(function (s, k) {
    deco += img(["flower1", "flower2", "clover"][k % 3], s.x > 180 ? 140 : 196, s.y - 14, 22);
    deco += img(k % 2 ? "rock" : "mushroom", s.x > 180 ? s.x + 34 : s.x - 56, s.y + 2, 20);
  });
  deco += img("fountain", L.hall.x + 76, L.hall.y - 16, 30) + img("rock", L.hall.x - 100, L.hall.y + 4, 18);
  svg += deco + '<rect width="' + W + '" height="' + H + '" fill="url(#vig)" pointer-events="none"/>';

  mapEl.innerHTML =
    '<svg class="ground" viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="none" aria-hidden="true">' + svg + "</svg>" +
    ico("cloud", "cloud c1") + ico("cloud", "cloud c2") + ico("butterfly", "fly") +
    spot(L.hall, "hall", "hall", "Town hall", "") +
    spot(L.home, "home", "home", "Home", "") +
    game.week.stops.map(function (st, i) { return spot(L.spots[i], "b" + i, st.icon, st.place, "locked", i + 1); }).join("") +
    '<div class="cat" id="cat"><div class="cat-sprite" id="cat-sprite"></div><span class="zz" id="zz">z z</span></div>';

  // Trails start hidden and draw in as the cat walks
  game.trail = [];
  mapEl.querySelectorAll(".trail").forEach(function (p, k) {
    var len = p.getTotalLength();
    p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
    game.trail[k] = { el: p, len: len };
  });
  placeCat(pts[0].x, pts[0].y);
}

function spot(p, id, icon, label, cls, num) {
  return '<div class="spot ' + cls + '" id="' + id + '" style="left:' + pct(p.x, W) + ";top:" + pct(p.y, game.L.H) + '">' +
    '<span class="badge">' + (num ? '<span class="num">' + num + "</span>" : "") + "</span>" + ico(icon, "bldg") + '<span class="plate">' + esc(label) + "</span></div>";
}

function placeCat(x, y) {
  var c = document.getElementById("cat");
  c.style.left = pct(x, W);
  c.style.top = pct(y, game.L.H);
}

// Next frame, with a timer backup so the walk never stalls in a background tab
function nextFrame(fn) {
  var called = false;
  function run() { if (!called) { called = true; fn(performance.now()); } }
  requestAnimationFrame(run);
  setTimeout(run, 50);
}

// Our own smooth scroll (the browser's one pauses in background tabs)
var scrollToken = 0;
function scrollPage(top, instant) {
  top = Math.max(0, Math.min(top, document.documentElement.scrollHeight - window.innerHeight));
  var my = ++scrollToken, from = window.scrollY, dist = top - from, ms = 650, t0 = performance.now();
  if (instant || reduceMotion || Math.abs(dist) < 2) { window.scrollTo(0, top); return; }
  (function step(now) {
    if (my !== scrollToken) return;
    var k = Math.min(1, (now - t0) / ms), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    window.scrollTo(0, from + dist * e);
    if (k < 1) nextFrame(step);
  })(t0);
}

function walk(fromIdx, toIdx, done) {
  var a = game.path[fromIdx], b = game.path[toIdx], my = (a.y + b.y) / 2;
  var ms = reduceMotion ? 1 : Math.max(1200, Math.hypot(b.x - a.x, b.y - a.y) * 10);
  document.getElementById("zz").classList.remove("on");
  cat.mode = "alert";
  follow(b.y);
  setTimeout(function () {
    var start = performance.now(), prev = { x: a.x, y: a.y };
    function step(now) {
      var t = Math.min(1, (now - start) / ms), u = 1 - t;
      var x = u * u * u * a.x + 3 * u * u * t * a.x + 3 * u * t * t * b.x + t * t * t * b.x;
      var y = u * u * u * a.y + 3 * u * u * t * my + 3 * u * t * t * my + t * t * t * b.y;
      if (Math.hypot(x - prev.x, y - prev.y) > 0.3) cat.mode = direction(x - prev.x, y - prev.y);
      prev = { x: x, y: y };
      placeCat(x, y);
      var tr = game.trail && game.trail[fromIdx];
      if (tr) tr.el.style.strokeDashoffset = tr.len * (1 - t);
      if (t < 1) nextFrame(step);
      else { cat.mode = "idle"; cat.idleTicks = 0; done(); }
    }
    nextFrame(step);
  }, reduceMotion ? 0 : 300);
}

function follow(y, instant) {
  var rect = mapEl.getBoundingClientRect();
  var target = window.scrollY + rect.top + rect.height * (y / game.L.H) - window.innerHeight * 0.28;
  scrollPage(target, instant);
}

function openSheet(html, instant) { sheet.innerHTML = html; sheet.classList.add("open"); sheet.scrollTop = 0; keepCatVisible(instant); }

// Scroll so the cat sits just above the card (no empty gap, never hidden)
function keepCatVisible(instant) {
  setTimeout(function () {
    var c = document.getElementById("cat");
    if (!c) return;
    var r = c.getBoundingClientRect(), head = document.querySelector(".top").offsetHeight;
    var free = window.innerHeight - sheet.offsetHeight;          // where the card's top edge ends up
    var catTop = r.top - 34, catBottom = r.bottom + 14;           // room for the "z z" and the shadow
    var target = window.scrollY + catBottom - free + 6;          // put the cat just above the card
    if (catTop - (catBottom - free + 6) < head) target = window.scrollY + catTop - head - 8; // tall card: keep its head in view
    if (Math.abs(target - window.scrollY) > 4) scrollPage(target, instant);
  }, 30);
}
function closeSheet() { sheet.classList.remove("open"); }
function place(st, i) {
  return '<div class="kicker"><span class="kplace">' + ico(st.icon) + esc(st.place) + '</span><span class="count">' + (i + 1) + " of " + game.week.stops.length + "</span></div>";
}
function logFor(i) { return game.week.log.filter(function (x) { return x.stop === i; })[0]; }

/* ---------- Behind the town: what the agent shared, and our model's instructions ---------- */
var behind = document.getElementById("behind");
var INSTR_KEY = "mwt-instructions";
function loadInstr() { try { return localStorage.getItem(INSTR_KEY) || MODEL.text; } catch (e) { return MODEL.text; } }
function saveInstr(v) { try { if (v == null) localStorage.removeItem(INSTR_KEY); else localStorage.setItem(INSTR_KEY, v); } catch (e) {} }
function openBehind(tab) {
  var w = game.week, used = w.log.filter(function (x) { return x.stop != null; }).length;
  var rows = w.log.map(function (x) {
    var st = x.stop != null ? w.stops[x.stop] : null;
    return '<li class="' + (st ? "used" : "skipped") + '">' + ico(x.icon) +
      '<div><span class="when">' + esc(x.day) + " · " + esc(x.area) + "</span><b>" + esc(x.did) + "</b>" +
      (x.looked ? "<small>Also looked at: " + esc(x.looked) + "</small>" : "") +
      (x.why ? "<small>Agent's reason: " + esc(x.why) + "</small>" : "") +
      '<span class="pick">' + (st ? "→ Stop " + (x.stop + 1) + ": " + kindLabel(st) : "Skipped. " + esc(x.skip)) + "</span></div></li>";
  }).join("");
  behind.innerHTML =
    '<div class="panel"><div class="phead"><h2>Behind the town</h2><button class="x" id="bx" aria-label="Close">✕</button></div>' +
    '<div class="seg" role="tablist"><button data-t="log">' + ico("clipboard") + "Last week's log</button>" +
    '<button data-t="model">' + ico("robot") + "Model instructions</button></div>" +
    '<section data-p="log"><div class="flow"><span>' + ico("robot") + "<b>" + w.total + "</b> things your agent did last week</span><i>→</i>" +
    "<span>" + ico("search") + "<b>" + used + "</b> choices that matter</span><i>→</i><span>" + ico("hall") + "<b>" + used + "</b> stops in your town</span></div>" +
    '<p class="lead">Your agent shared this log of <b>last week (' + esc(w.period) + ")</b>. Our model kept the choices that matter and skipped the routine ones.</p>" +
    '<ul class="log">' + rows + '</ul><p class="more">+ ' + (w.total - w.log.length) + " more small tasks (reminders, replies, refills), all routine.</p></section>" +
    '<section data-p="model"><p class="lead">' + esc(MODEL.intro) + "</p>" +
    '<div class="editor"><div class="ehead">' + ico("scroll") + "<b>Instructions</b><span id=\"estate\"></span></div>" +
    '<textarea id="instr" spellcheck="false" aria-label="Model instructions"></textarea>' +
    '<div class="eacts"><button class="btn small" id="esave">Save</button><button class="btn ghost small" id="ereset">Reset to default</button></div></div>' +
    '<p class="note">Your edits are saved on this device. In the real app, they go to the model when it builds next Sunday\'s town.</p>' +
    "<h3>What it sends back for one stop</h3><pre>" + esc(MODEL.example) + "</pre></section></div>";
  behind.hidden = false;

  // Editable instructions, like project instructions
  var ta = document.getElementById("instr"), stateEl = document.getElementById("estate");
  ta.value = loadInstr();
  function mark(t) { stateEl.textContent = t; }
  mark(ta.value === MODEL.text ? "Default" : "Edited");
  ta.addEventListener("input", function () { mark("Not saved"); });
  document.getElementById("esave").addEventListener("click", function () { saveInstr(ta.value); mark(ta.value === MODEL.text ? "Default" : "Saved ✓"); });
  document.getElementById("ereset").addEventListener("click", function () { ta.value = MODEL.text; saveInstr(null); mark("Default"); });
  function show(t) {
    behind.querySelectorAll("[data-t]").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-t") === t); });
    behind.querySelectorAll("[data-p]").forEach(function (p) { p.hidden = p.getAttribute("data-p") !== t; });
    behind.scrollTop = 0;
  }
  behind.querySelectorAll("[data-t]").forEach(function (b) { b.addEventListener("click", function () { show(b.getAttribute("data-t")); }); });
  document.getElementById("bx").addEventListener("click", function () { behind.hidden = true; });
  show(tab || "log");
}
document.getElementById("behind-btn").addEventListener("click", function () { openBehind("log"); });
behind.addEventListener("click", function (e) { if (e.target === behind) behind.hidden = true; });

/* ---------- The game ---------- */
function optText(st, k) { return st.options.filter(function (o) { return o.k === k; })[0].t; }
function kindLabel() { return "Your priority"; }

function start(wi) {
  game = { wi: wi, week: WEEKS[wi], i: 0, results: [] };
  game.L = layout(game.week.stops.length);
  finale.hidden = true;
  drawTown();
  cat.mode = "sleeping";
  document.getElementById("zz").classList.add("on");
  window.scrollTo(0, 0);
  statusEl.textContent = game.week.label;
  var n = game.week.stops.length;
  openSheet(
    '<p class="kicker">It\'s 2040</p>' +
    '<h1>Last week, your agent did <span class="hl">' + game.week.total + " things</span> for you.</h1>" +
    '<p class="lead">' + n + " of them were crucial choices (" + esc(game.week.period) + "). Wake up the cat and check, choice by choice:</p>" +
    '<ul class="aims"><li>' + ico("target") + "<span><b>Does your agent still choose like you?</b> Your priority vs your agent's priority.</span></li></ul>" +
    '<button class="btn" id="go">' + ico("sparkles") + "Wake up the cat</button>" +
    '<button class="btn ghost" id="peek">' + ico("clipboard") + "See last week's log</button>", true);
  document.getElementById("go").addEventListener("click", function () { closeSheet(); setTimeout(next, 350); });
  document.getElementById("peek").addEventListener("click", function () { openBehind("log"); });
}

function next() {
  var i = game.i, n = game.week.stops.length;
  statusEl.textContent = i < n ? "Stop " + (i + 1) + " of " + n : "Town hall";
  walk(i, i + 1, function () { if (i < n) ask(i); else ending(); });
}

function ask(i) {
  var st = game.week.stops[i], el = document.getElementById("b" + i), lg = logFor(i);
  el.classList.remove("locked");
  el.classList.add("here");
  openSheet(place(st, i) +
    '<div class="chips"><span class="qtype">' + ico("target") + "Your priority</span>" +
    (lg ? '<span class="src">' + ico("clipboard") + "From last week's log · " + esc(lg.day) + "</span>" : "") + "</div>" +
    "<h2>" + esc(st.question) + '</h2><div class="opts grid2" id="opts">' +
    st.options.map(function (o) { return '<button class="opt" data-k="' + o.k + '">' + esc(o.t) + "</button>"; }).join("") +
    '<button class="opt other" id="other">' + ico("thought") + "Something else</button></div>" +
    '<form class="own" id="own" hidden><div class="ownhead"><label for="ownin">What matters most to you here?</label>' +
    '<button class="back" type="button" id="ownback">← Back</button></div>' +
    '<div class="ownrow"><input id="ownin" maxlength="40" placeholder="e.g. Eco-friendly" autocomplete="off"><button class="btn small" type="submit">Done</button></div></form>');
  sheet.querySelectorAll("[data-k]").forEach(function (b) {
    b.addEventListener("click", function () { answer(i, b.getAttribute("data-k")); });
  });
  // Your own priority, in your own words
  var form = document.getElementById("own"), input = document.getElementById("ownin");
  document.getElementById("other").addEventListener("click", function () {
    document.getElementById("opts").hidden = true; form.hidden = false; input.focus(); keepCatVisible();
  });
  document.getElementById("ownback").addEventListener("click", function () {
    form.hidden = true; document.getElementById("opts").hidden = false; keepCatVisible();
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = input.value.trim();
    if (!v) { input.focus(); return; }
    answer(i, "other", v.charAt(0).toUpperCase() + v.slice(1));
  });
}

function answer(i, key, own) {
  var st = game.week.stops[i], el = document.getElementById("b" + i);
  var o = key === "other"
    ? { k: "other", t: own, fix: "For " + st.about + ", my priority is: " + own.toLowerCase(),
        fixed: "It will put “" + own.toLowerCase() + "” first for " + st.about + "." }
    : st.options.filter(function (x) { return x.k === key; })[0];
  var ok = key === st.agent;
  game.results[i] = { choice: st.choice, icon: st.icon, ok: ok, you: o.t, other: optText(st, st.agent), fixed: false };
  el.classList.remove("here");
  el.classList.add(ok ? "strong" : "fading");
  el.querySelector(".badge").innerHTML = ico(ok ? "sparkles" : "differ");

  var compare = '<div class="vs"><div class="me"><small>Your priority</small><p>' + esc(o.t) + "</p></div>" +
    '<div class="ag"><small>' + ico("robot") + "Your agent's priority</small><p>" + esc(optText(st, st.agent)) + "</p></div></div>";
  var verdict = '<div class="verdict ' + (ok ? "ok" : "fade") + '">' + ico(ok ? "check" : "differ", "vi") + "<div><b>" +
    (ok ? "Same as you. Your agent chose your way." : "Different. Your agent didn't choose your way.") + "</b><span>" + esc(st.did) + "</span></div></div>";
  var fix = o.fix
    ? '<div class="fixbox" id="fixbox"><p>Want your agent to choose your way next time?</p>' +
      '<button class="btn soft" id="fix">' + ico("hand") + "<span>Tell my agent: " + esc(o.fix) + "</span></button></div>"
    : "";
  var last = i === game.week.stops.length - 1;
  openSheet(place(st, i) + compare + verdict + fix +
    '<button class="btn" id="on">' + (last ? "Walk to the town hall" : "Keep walking") + "</button>" +
    '<button class="back" id="redo">← Change my answer</button>');
  document.getElementById("redo").addEventListener("click", function () {
    game.results[i] = null;
    el.classList.remove("strong", "fading");
    el.querySelector(".badge").innerHTML = '<span class="num">' + (i + 1) + "</span>";
    ask(i);
  });
  var fb = document.getElementById("fix");
  if (fb) fb.addEventListener("click", function () {
    game.results[i].fixed = o.fixed;
    document.getElementById("fixbox").innerHTML = '<p class="done">' + ico("check") + "Told your agent. " + esc(o.fixed) + "</p>";
  });
  document.getElementById("on").addEventListener("click", function () { closeSheet(); game.i++; setTimeout(next, 300); });
}

function ending() {
  var r = game.results, n = r.length;
  var same = r.filter(function (x) { return x.ok; }).length, diff = n - same;
  var fixed = r.filter(function (x) { return x.fixed; });
  closeSheet();
  document.getElementById("hall").classList.add("glow");
  cat.mode = "tired";
  setTimeout(function () { cat.mode = "sleeping"; document.getElementById("zz").classList.add("on"); }, 900);

  setTimeout(function () {
    finale.hidden = false;
    var rows = r.map(function (x) {
      return '<tr class="' + (x.ok ? "ok" : "fade") + '"><td>' + ico(x.icon) + esc(x.choice) + "</td><td>" + esc(x.you) + "</td><td>" + esc(x.other) +
        '</td><td class="m">' + (x.ok ? "✔" : "✗") + "</td></tr>";
    }).join("");
    var ring = Math.round(same / n * 100);
    finale.innerHTML =
      '<div class="card"><p class="kicker center">Your town · last week</p>' +
      '<div class="score"><div class="ring" style="--p:' + ring + '"><span>' + same + "<small>/" + n + "</small></span></div>" +
      "<div><h1>choices made your way</h1>" +
      '<p class="lead">' + (diff ? "In " + diff + " choice" + (diff === 1 ? "" : "s") + ", your agent went by a different priority than yours." : "Your agent still chooses like you.") + "</p></div></div>" +
      '<div class="bento">' +
      '<div class="tile wide"><h3>' + ico("target") + 'Your priorities vs your agent\'s</h3><table class="pt"><thead><tr><th>Choice</th><th>You</th><th>Agent</th><th></th></tr></thead><tbody>' + rows + "</tbody></table></div>" +
      (fixed.length ? '<div class="tile wide"><h3>' + ico("hand") + "You told your agent</h3><ul class=\"plain\">" +
        fixed.map(function (x) { return "<li>" + esc(x.fixed.replace(/^It will/, "Your agent will")) + "</li>"; }).join("") + "</ul></div>" : "") +
      '<div class="tile wide"><h3>' + ico("sparkles") + 'What you got from this walk</h3><ul class="gains">' +
      "<li>" + ico("speech") + "<span>You can explain why your agent made each choice last week.</span></li>" +
      "<li>" + ico("search") + "<span>You know where your agent's priorities differ from yours.</span></li>" +
      "<li>" + ico("target") + "<span>" + (fixed.length ? "Your agent now knows " + fixed.length + " of your priorities better." : "You made " + n + " calls yourself, in about 2 minutes.") + "</span></li>" +
      "</ul></div></div>" +
      '<p class="closing">Your agent saves your time.<br><span>My Week Town keeps you, you.</span></p>' +
      '<button class="btn" id="again">Walk the town again</button>' +
      '<button class="btn ghost" id="peek2">' + ico("robot") + "How this town was made</button></div>";
    document.getElementById("again").addEventListener("click", function () { start(0); });
    document.getElementById("peek2").addEventListener("click", function () { openBehind("model"); });
    finale.scrollTop = 0;
  }, reduceMotion ? 0 : 1800);
}

start(0);
