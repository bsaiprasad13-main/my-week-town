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
  var L = game.L, n = game.stops.length, H = L.H;
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
    game.stops.map(function (st, i) { return spot(L.spots[i], "b" + i, st.icon, st.place, "locked", i + 1); }).join("") +
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
  return '<div class="kicker"><span class="kplace">' + ico(st.icon) + esc(st.place) + '</span><span class="count">' + (i + 1) + " of " + game.stops.length + "</span></div>";
}

/* ---------- Going back ---------- */
// Every screen sets what "back" means. The phone/browser back button does the same thing.
var backFn = null;
function setBack(fn) {
  backFn = fn;
  if (fn) { try { history.pushState({ mwt: 1 }, ""); } catch (e) {} }
}
window.addEventListener("popstate", function () { if (backFn && !document.body.classList.contains("in-admin")) backFn(); });
function navRow(items) {
  return '<div class="navrow">' + items.filter(Boolean).map(function (x) { return '<button class="back" id="' + x[0] + '">' + x[1] + "</button>"; }).join("") + "</div>";
}
function pick(list, seed) { return list[seed % list.length]; }

/* ---------- The game ---------- */
// game.stops: one per question. A stop is { type: "choice", ev } or { type: "rank", area }, plus icon and place.
function stopsFrom(qs) {
  return qs.map(function (q) {
    var area = q.type === "choice" ? q.ev.area : q.area;
    var icon = pickIcon(q.type === "choice" ? q.ev.icon : REFRESH[area].icon);
    return Object.assign({ icon: icon, place: AREAS[area].place }, q);
  });
}
function inGame() { return game && game.playing && !game.done; }

// Home: the cat sleeps
function start() {
  game = { stops: [], i: 0, results: [], playing: false };
  game.L = layout(0);
  finale.hidden = true;
  drawTown();
  cat.mode = "sleeping";
  document.getElementById("zz").classList.add("on");
  window.scrollTo(0, 0);
  statusEl.textContent = "";
  openSheet(
    "<h1>Let's see what <span class=\"hl\">you like</span>.</h1>" +
    '<p class="lead">The cat has a few questions for you.</p>' +
    '<button class="btn" id="go">' + ico("sparkles") + "Wake up the cat</button>", true);
  document.getElementById("go").addEventListener("click", syncing);
  setBack(null);
}

// Leave the game from anywhere (Home button). Unanswered questions come back next time.
function goHome() {
  if (inGame() && !confirm("Leave this game? Unanswered questions will come back next time.")) return;
  if (inGame()) returnUnanswered(game.stops.filter(function (s, k) { return s.type === "choice" && !game.results[k]; }).map(function (s) { return s.ev.id; }));
  if (game && game.plan && !game.playing) cancelCatchUp(game.plan);
  start();
}
document.getElementById("homebtn").addEventListener("click", goHome);

// The app catches up quietly while the cat wakes up. Nothing counts until the user starts.
function syncing() {
  cat.mode = "alert";
  document.getElementById("zz").classList.remove("on");
  openSheet("<h2>The cat is waking up…</h2><div class=\"dots\"><i></i><i></i><i></i></div>");
  setBack(null);
  setTimeout(function () {
    var plan = prepareCatchUp();
    game.plan = plan;
    game.stops = stopsFrom(plan.qs);
    game.L = layout(game.stops.length);
    drawTown();
    cat.mode = "idle";
    var n = game.stops.length;
    statusEl.textContent = n + " questions";
    openSheet("<h1>The cat has <span class=\"hl\">" + n + " questions</span>, it seems.</h1>" +
      '<p class="lead">' + (plan.choices ? "Some about your week, some just for fun." : "Nothing big happened, so these are just for fun.") + "</p>" +
      '<button class="btn" id="walk">' + ico("sparkles") + "Let's go</button>" + navRow([["cback", "← Back"]]));
    var back = function () { cancelCatchUp(plan); start(); };
    document.getElementById("cback").addEventListener("click", back);
    setBack(back);
    document.getElementById("walk").addEventListener("click", function () {
      commitCatchUp(plan);
      game.playing = true;
      closeSheet();
      setTimeout(next, 350);
    });
  }, reduceMotion ? 50 : 1200);
}

function next() {
  var i = game.i, n = game.stops.length;
  statusEl.textContent = i < n ? (i + 1) + " of " + n : "Done";
  walk(i, i + 1, function () {
    if (i >= n) return ending();
    if (game.results[i]) showReveal(i); else ask(i);
  });
}

// Jump straight to a stop (no walk), showing its answer if it has one
function goStop(k) {
  finale.hidden = true;
  game.done = false;
  game.i = k;
  var p = game.path[k + 1];
  placeCat(p.x, p.y);
  cat.mode = "idle";
  statusEl.textContent = (k + 1) + " of " + game.stops.length;
  game.stops.forEach(function (s, j) { document.getElementById("b" + j).classList.remove("here"); });
  if (game.results[k]) showReveal(k); else ask(k);
}
function prevItem(i) { return i > 0 ? ["prev", "← Previous"] : null; }
function wirePrev(i) {
  var b = document.getElementById("prev");
  if (b) b.addEventListener("click", function () { goStop(i - 1); });
}

// The cat asks, in the voice the admin picked
function catSays(i, text) {
  var v = voice(), opener = pick(VOICES[v].openers, i);
  if (v === "speaks") return '<div class="bubble"><span class="who"><span class="catface"></span></span><div><small>' + esc(opener) + "</small><h2>" + esc(text) + "</h2></div></div>";
  return '<p class="narr">' + esc(opener) + "</p><h2>" + esc(text) + "</h2>";
}
function stopHead(st, i) {
  return '<div class="kicker"><span class="kplace">' + ico(st.icon) + esc(st.place) + '</span><span class="count">' + (i + 1) + " of " + game.stops.length + "</span></div>";
}

function ask(i) {
  var st = game.stops[i], el = document.getElementById("b" + i);
  el.classList.remove("locked");
  el.classList.add("here");
  setBack(i > 0 ? function () { goStop(i - 1); } : goHome);
  if (st.type === "rank") return askRank(i);
  var ev = st.ev, opts = optionsFor(ev.area, ev.agentKey);
  openSheet(stopHead(st, i) + catSays(i, ev.question) +
    '<div class="opts grid2" id="opts">' +
    opts.map(function (o) { return '<button class="opt" data-k="' + esc(o.k) + '">' + esc(o.t) + "</button>"; }).join("") +
    '<button class="opt other" id="other">' + ico("thought") + "Something else</button></div>" +
    '<form class="own" id="own" hidden><div class="ownhead"><label for="ownin">What matters most to you?</label>' +
    '<button class="back" type="button" id="ownback">← Back</button></div>' +
    '<div class="ownrow"><input id="ownin" maxlength="40" placeholder="e.g. Eco-friendly" autocomplete="off"><button class="btn small" type="submit">Done</button></div></form>' +
    navRow([prevItem(i)]));
  wirePrev(i);
  sheet.querySelectorAll("[data-k]").forEach(function (b) {
    b.addEventListener("click", function () { answerChoice(i, b.getAttribute("data-k")); });
  });
  var form = document.getElementById("own"), input = document.getElementById("ownin");
  var closeOwn = function () { form.hidden = true; document.getElementById("opts").hidden = false; setBack(i > 0 ? function () { goStop(i - 1); } : goHome); keepCatVisible(); };
  document.getElementById("other").addEventListener("click", function () {
    document.getElementById("opts").hidden = true; form.hidden = false; input.focus(); keepCatVisible(); setBack(closeOwn);
  });
  document.getElementById("ownback").addEventListener("click", closeOwn);
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = input.value.trim();
    if (!v) { input.focus(); return; }
    answerChoice(i, "custom:" + v.charAt(0).toUpperCase() + v.slice(1));
  });
}

// Taste check: tap the 4 in order, most important first
function askRank(i) {
  var st = game.stops[i], a = AREAS[st.area], order = [];
  openSheet(stopHead(st, i) + catSays(i, REFRESH[st.area].q) +
    '<p class="hint">Tap them in order: most important first.</p><div class="opts grid2 rank" id="rk">' +
    a.items.map(function (x) { return '<button class="opt" data-r="' + x[0] + '"><span class="rn"></span>' + esc(x[1]) + "</button>"; }).join("") +
    "</div>" + navRow([prevItem(i), ["rkclear", "↺ Start over"]]));
  wirePrev(i);
  var clear = document.getElementById("rkclear");
  clear.hidden = true;
  sheet.querySelectorAll("[data-r]").forEach(function (b) {
    b.addEventListener("click", function () {
      var k = b.getAttribute("data-r");
      if (order.indexOf(k) >= 0) return;
      order.push(k);
      b.classList.add("picked");
      b.querySelector(".rn").textContent = order.length;
      clear.hidden = false;
      if (order.length === a.items.length) setTimeout(function () { answerRank(i, order); }, 350);
    });
  });
  clear.addEventListener("click", function () { askRank(i); });
}

function markStop(i, ok) {
  var el = document.getElementById("b" + i);
  el.classList.remove("here", "strong", "fading");
  el.classList.add(ok ? "strong" : "fading");
  el.querySelector(".badge").innerHTML = ico(ok ? "sparkles" : "thought");
}

function answerChoice(i, key) {
  var ev = game.stops[i].ev, a = AREAS[ev.area], mine = labelOf(ev.area, key), ok = key === ev.agentKey;
  game.results[i] = { ok: ok, you: mine, sent: false, declined: false,
    upd: ok ? null : { area: ev.area, key: key, fix: "For " + a.about + ", put “" + mine + "” first", fixed: "For " + a.about + ", “" + mine + "” comes first." } };
  markStop(i, ok);
  showReveal(i);
}

function answerRank(i, order) {
  var st = game.stops[i], a = AREAS[st.area], agentOrder = profile()[st.area].order;
  var fmt = function (o) { return o.map(function (k) { return labelOf(st.area, k); }).join(" › "); };
  var ok = order.join() === agentOrder.join() || order[0] === agentOrder[0];
  game.results[i] = { ok: ok, you: fmt(order), sent: false, declined: false,
    upd: order.join() === agentOrder.join() ? null : { area: st.area, order: order, fix: "For " + a.about + ", my order is " + fmt(order), fixed: "For " + a.about + ": " + fmt(order) + "." } };
  markStop(i, ok);
  showReveal(i);
}

// After the answer: the cat reacts. If it's new, it asks whether to tell the user's AI.
function showReveal(i) {
  var r = game.results[i], last = i === game.stops.length - 1, st = game.stops[i];
  var line = r.ok && !r.upd ? pick(CAT_MATCH, i) : r.ok ? pick(CAT_MATCH, i) : pick(CAT_NEW, i);
  var askHtml = "";
  if (r.upd && r.sent) askHtml = '<p class="done">' + ico("check") + "Done! Your AI knows now.</p>";
  else if (r.upd && r.declined) askHtml = '<p class="done quiet">' + ico("thought") + "Okay, it stays between us.</p>";
  else if (r.upd) askHtml = '<div class="askai" id="askai"><p>Should I let your AI know?</p><div class="yn">' +
    '<button class="btn small" id="yes">Yes, tell it</button><button class="btn ghost small" id="no">No</button></div></div>';
  openSheet(stopHead(st, i) +
    '<div class="react ' + (r.upd && !r.ok ? "new" : "ok") + '"><span class="catface big"></span><div><b>' + esc(line) + "</b>" +
    (st.type === "rank" ? '<span class="mine">Your order: ' + esc(r.you) + "</span>" : '<span class="mine">You picked: ' + esc(r.you) + "</span>") + "</div></div>" + askHtml +
    '<button class="btn" id="on">' + (last ? "Finish" : "Next question") + "</button>" +
    navRow([prevItem(i), r.sent ? null : ["redo", "← Change my answer"]]));
  wirePrev(i);
  var redo = function () {
    game.results[i] = null;
    var el = document.getElementById("b" + i);
    el.classList.remove("strong", "fading");
    el.querySelector(".badge").innerHTML = '<span class="num">' + (i + 1) + "</span>";
    ask(i);
  };
  var rb = document.getElementById("redo");
  if (rb) rb.addEventListener("click", redo);
  setBack(r.sent ? (i > 0 ? function () { goStop(i - 1); } : goHome) : redo);
  var yes = document.getElementById("yes"), no = document.getElementById("no");
  if (yes) yes.addEventListener("click", function () { sendUpdates([r.upd]); r.sent = true; showReveal(i); });
  if (no) no.addEventListener("click", function () { r.declined = true; showReveal(i); });
  document.getElementById("on").addEventListener("click", function () { closeSheet(); game.i = i + 1; setTimeout(next, 300); });
}

function ending() {
  var r = game.results, n = r.length;
  var same = r.filter(function (x) { return x.ok; }).length;
  var sent = r.filter(function (x) { return x.sent; });
  if (!game.saved) { saveSession({ at: now(), matched: same, total: n }); game.saved = true; }
  game.done = true;
  closeSheet();
  document.getElementById("hall").classList.add("glow");
  cat.mode = "tired";
  setTimeout(function () { cat.mode = "sleeping"; document.getElementById("zz").classList.add("on"); }, 900);
  var back = function () { goStop(n - 1); };
  setBack(back);

  setTimeout(function () {
    finale.hidden = false;
    finale.innerHTML =
      '<div class="card">' + navRow([["fback", "← Back"]]) +
      '<div class="thanks"><span class="catface big"></span><h1>Thanks! That’s all for now.</h1>' +
      '<p class="lead">You answered ' + n + " questions. The cat " + (same === n ? "guessed every one right." : "guessed " + same + " of them right.") + "</p></div>" +
      (sent.length ? '<div class="tile wide"><h3>' + ico("robot") + "Your AI now knows</h3><ul class=\"plain\">" +
        sent.map(function (x) { return "<li>" + esc(x.upd.fixed) + "</li>"; }).join("") + "</ul></div>" : "") +
      '<button class="btn" id="again">' + ico("home") + "Back home</button></div>";
    document.getElementById("fback").addEventListener("click", back);
    document.getElementById("again").addEventListener("click", start);
    finale.scrollTop = 0;
  }, reduceMotion ? 0 : 1600);
}

window.addEventListener("storage", function (e) { if (e.key === "mwt-voice" && inGame() && game.stops[game.i] && !game.results[game.i]) ask(game.i); });

start();
