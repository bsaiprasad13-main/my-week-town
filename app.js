// Cat Check: the town, the walk and the screens. Data lives in data.js.
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
  game.pos = 0; game.busy = false;
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

// Walk between two neighbouring points. Forward draws that leg's trail; backward erases it (and is a bit quicker).
function walk(fromIdx, toIdx, done) {
  var a = game.path[fromIdx], b = game.path[toIdx], my = (a.y + b.y) / 2, back = toIdx < fromIdx;
  var ms = reduceMotion ? 1 : Math.max(back ? 800 : 1200, Math.hypot(b.x - a.x, b.y - a.y) * (back ? 6 : 10));
  var legIdx = back ? toIdx : fromIdx;
  game.busy = true;
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
      var tr = game.trail && game.trail[legIdx];
      if (tr) tr.el.style.strokeDashoffset = tr.len * (back ? t : 1 - t);
      if (t < 1) nextFrame(step);
      else { cat.mode = "idle"; cat.idleTicks = 0; game.pos = toIdx; game.busy = false; done(); }
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
// game.stops: always the same 6 questions, one per area. A stop is { type: "choice", evIds } (the agent acted in that area lately) or { type: "check" }.
// The user ranks as many options as they like, plus "Something else".
function stopsFrom(qs) {
  return qs.map(function (q) {
    var area = SCN[q.scn].area;
    return Object.assign({ area: area, agentKey: profile()[area].order[0], icon: pickIcon(SCN[q.scn].icon), place: AREAS[area].place }, q);
  });
}
function stopQ(st) { return st.ai ? st.ai.q : SCN[st.scn].q; }
// Options: the AI's reworded ones (if on) or the fixed ones, plus own priorities the user sent before
function stopOpts(st) {
  if (!st.ai) return optionsFor(st.scn);
  return st.ai.options.concat(optionsFor(st.scn).filter(function (o) { return o.k.indexOf("custom:") === 0; }));
}
function stopOptText(st, k) {
  if (k.indexOf("custom:") === 0) return k.slice(7);
  var o = stopOpts(st).filter(function (x) { return x.k === k; })[0];
  return o ? o.t : optionText(st.scn, k);
}
function aiOn() { return !!(window.MWT_AI && MWT_AI.settings().enabled); }

function inGame() { return game && game.playing && !game.done; }

// Home: the cat sleeps
function start() {
  game = { stops: [], i: 0, results: [], draft: {}, playing: false };
  game.L = layout(0);
  finale.hidden = true;
  drawTown();
  cat.mode = "sleeping";
  document.getElementById("zz").classList.add("on");
  window.scrollTo(0, 0);
  statusEl.textContent = "";
  // Reminder: when the AI made choices since the last game, the cat says questions are waiting (the tab title shows the count too)
  var w = waiting();
  document.title = w ? "(" + w + ") Cat Check" : "Cat Check";
  openSheet(
    "<h1>Let's see what <span class=\"hl\">you like</span>.</h1>" +
    (w ? '<div class="remind" id="remind">' + ico("speech") + "<div><b>The cat has new questions for you!</b><span>Your AI made " + w + " choice" + (w === 1 ? "" : "s") + " since you last played.</span></div></div>"
      : '<p class="lead">The cat has a few questions for you.</p>') +
    '<button class="btn" id="go">' + ico("sparkles") + "Wake up the cat</button>", true);
  document.getElementById("go").addEventListener("click", syncing);
  setBack(null);
}

// Leave the game from anywhere (Home button). Unanswered questions come back next time.
function goHome() {
  if (inGame() && !confirm("Leave this game? Unanswered questions will come back next time.")) return;
  if (inGame()) returnUnanswered(game.stops.filter(function (s, k) { return s.type === "choice" && !game.results[k]; }).reduce(function (all, s) { return all.concat(s.evIds); }, []));
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
    if (aiOn()) thinking(plan); else ready(plan);
  }, reduceMotion ? 50 : 1200);
}

// The in-browser AI writes the questions. The user can skip and get the quick (pre-written) ones.
function thinking(plan) {
  var cancelled = false, n = game.stops.length;
  openSheet("<h2>The cat is thinking up questions…</h2>" +
    '<div class="bar"><i id="pbar"></i></div><p class="hint" id="ptext">Getting ready…</p>' +
    navRow([["skipai", "Use quick questions instead"]]));
  var bar = document.getElementById("pbar"), txt = document.getElementById("ptext");
  var onAI = function (e) {
    var s = e.detail;
    if (s.status === "loading") { bar.style.width = Math.round(s.progress * 100) + "%"; txt.textContent = "Getting the cat ready (first time only)… " + Math.round(s.progress * 100) + "%"; }
  };
  window.addEventListener("mwt-ai", onAI);
  var finish = function () {
    window.removeEventListener("mwt-ai", onAI);
    if (cancelled === "done") return;
    cancelled = "done";
    ready(plan);
  };
  document.getElementById("skipai").addEventListener("click", function () {
    cancelled = true;
    MWT_AI.interrupt();
    game.stops.forEach(function (s) { delete s.ai; s.icon = pickIcon(SCN[s.scn].icon); });
    finish();
  });
  setBack(null);
  MWT_AI.generate(game.stops, function (done, total) {
    if (cancelled) return;
    bar.style.width = Math.round(done / total * 100) + "%";
    txt.textContent = "Question " + Math.min(done + 1, total) + " of " + total + "…";
  }, function () { return !!cancelled; }).then(finish, finish);
}

function ready(plan) {
  if (game.plan !== plan) return;
  setTimeout(function () {
    game.L = layout(game.stops.length);
    drawTown();
    cat.mode = "idle";
    var n = game.stops.length;
    statusEl.textContent = n + " questions";
    openSheet("<h1>The cat has <span class=\"hl\">" + n + " questions</span>, it seems.</h1>" +
      '<p class="lead">Rank what matters to you. One, a few, or all.</p>' +
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
  }, 0);
}

function next() {
  var i = game.i, n = game.stops.length;
  statusEl.textContent = i < n ? (i + 1) + " of " + n : "Done";
  walk(i, i + 1, function () {
    if (i >= n) return ending();
    if (game.results[i]) showReveal(i); else ask(i);
  });
}

// Show only the trail the cat has really walked: legs before path point p drawn, the rest hidden
function setTrails(p) {
  (game.trail || []).forEach(function (tr, j) { tr.el.style.strokeDashoffset = j < p ? 0 : tr.len; });
}

// Go back to a stop. One step back: the cat runs back along the road and the trail erases behind it.
// Anything else: it moves there straight away, with the trail set to match.
function goStop(k) {
  if (game.busy) return;
  var target = k + 1;
  var show = function () {
    game.i = k;
    statusEl.textContent = (k + 1) + " of " + game.stops.length;
    if (game.results[k]) showReveal(k); else ask(k);
  };
  finale.hidden = true;
  game.done = false;
  game.stops.forEach(function (s, j) { document.getElementById("b" + j).classList.remove("here"); });
  if (!reduceMotion && game.pos === target + 1) {
    closeSheet();
    walk(game.pos, target, function () { setTimeout(show, 150); });
    return;
  }
  var p = game.path[target];
  placeCat(p.x, p.y);
  setTrails(target);
  game.pos = target;
  cat.mode = "idle";
  show();
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
  var backTo = i > 0 ? function () { goStop(i - 1); } : goHome;
  setBack(backTo);
  var draft = game.draft[i] || (game.draft[i] = { rank: [], extra: [] });
  var base = stopOpts(st);
  var opts = base.concat(draft.extra.filter(function (x) { return !base.some(function (o) { return o.k === x.k; }); }));
  openSheet(stopHead(st, i) + catSays(i, stopQ(st)) +
    // How to answer, highlighted so it isn't missed
    '<div id="pick"><div class="howto"><span class="steps"><i>1</i><i>2</i><i>3</i></span><div><b>Tap what matters most first, then the next.</b>' +
    "<span>Pick just one, or rank them all. Tap again to undo.</span></div></div>" +
    '<div class="opts rank" id="opts">' +
    opts.map(function (o) { return '<button class="opt" data-k="' + esc(o.k) + '"><span class="rn"></span>' + esc(o.t) + "</button>"; }).join("") +
    '<button class="opt other" id="other">' + ico("thought") + "Something else</button></div>" +
    '<button class="btn" id="done" disabled>Done</button></div>' +
    '<form class="own" id="own" hidden><div class="ownhead"><label for="ownin">What else matters to you?</label>' +
    '<button class="back" type="button" id="ownback">← Back</button></div>' +
    '<div class="ownrow"><input id="ownin" maxlength="40" placeholder="e.g. Eco-friendly" autocomplete="off"><button class="btn small" type="submit">Add</button></div></form>' +
    navRow([prevItem(i)]));
  wirePrev(i);
  var done = document.getElementById("done");
  function paint() {
    sheet.querySelectorAll("[data-k]").forEach(function (b) {
      var n = draft.rank.indexOf(b.getAttribute("data-k"));
      b.classList.toggle("picked", n >= 0);
      b.querySelector(".rn").textContent = n >= 0 ? n + 1 : "";
    });
    done.disabled = !draft.rank.length;
    done.textContent = draft.rank.length ? "Done (" + draft.rank.length + " ranked)" : "Done";
  }
  sheet.querySelectorAll("[data-k]").forEach(function (b) {
    b.addEventListener("click", function () {
      var k = b.getAttribute("data-k"), n = draft.rank.indexOf(k);
      if (n >= 0) draft.rank.splice(n, 1); else draft.rank.push(k);
      paint();
    });
  });
  paint();
  done.addEventListener("click", function () { if (draft.rank.length) answerRank(i, draft.rank.slice()); });
  var form = document.getElementById("own"), input = document.getElementById("ownin"), pickEl = document.getElementById("pick");
  var closeOwn = function () { form.hidden = true; pickEl.hidden = false; setBack(backTo); keepCatVisible(); };
  document.getElementById("other").addEventListener("click", function () {
    pickEl.hidden = true; form.hidden = false; input.focus(); keepCatVisible(); setBack(closeOwn);
  });
  document.getElementById("ownback").addEventListener("click", closeOwn);
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = input.value.trim();
    if (!v) { input.focus(); return; }
    v = v.charAt(0).toUpperCase() + v.slice(1);
    // Same as an existing option? Rank that one instead of adding a copy
    var same = opts.filter(function (o) { return o.t.toLowerCase() === v.toLowerCase(); })[0];
    var k = same ? same.k : "custom:" + v;
    if (!same) draft.extra.push({ k: k, t: v });
    if (draft.rank.indexOf(k) < 0) draft.rank.push(k);
    ask(i);
  });
}

function markStop(i, ok) {
  var el = document.getElementById("b" + i);
  el.classList.remove("here", "strong", "fading");
  el.classList.add(ok ? "strong" : "fading");
  el.querySelector(".badge").innerHTML = ico(ok ? "sparkles" : "thought");
}

// The user's ranking against the agent's order for this area
function answerRank(i, rank) {
  var st = game.stops[i], a = AREAS[st.area], order = profile()[st.area].order, ok = sameOrder(rank, order);
  var labels = rank.map(function (k) { return stopOptText(st, k); });
  var q = function (t) { return "“" + t + "”"; };
  game.results[i] = { ok: ok, rank: rank, you: labels.map(function (t, n) { return (n + 1) + ". " + t; }).join("  ·  "), sent: false, declined: false,
    upd: ok ? null : { area: st.area, order: mergedOrder(rank, order), fix: "For " + a.about + ": " + labels.join(" › "),
      fixed: "For " + a.about + ", " + q(labels[0]) + " comes first" + (labels.length > 1 ? ", then " + labels.slice(1).map(q).join(", ") : "") + "." } };
  markStop(i, ok);
  showReveal(i);
}

// After the answer: the cat reacts. If it's new, it asks whether to tell the user's AI.
function showReveal(i) {
  var r = game.results[i], last = i === game.stops.length - 1, st = game.stops[i];
  var line = r.ok && !r.upd ? pick(CAT_MATCH, i) : r.ok ? pick(CAT_MATCH, i) : pick(CAT_NEW, i);
  var askHtml = "";
  // After Yes or No: a clear confirmation, with Back to choose again
  if (r.upd && r.sent) askHtml = '<div class="confirm ok" id="confirm">' + ico("check") + '<div><b>Done! Your AI knows now.</b><span>' + esc(r.upd.fixed) + "</span>" +
    '<button class="back" id="undo">← Back</button></div></div>';
  else if (r.upd && r.declined) askHtml = '<div class="confirm quiet" id="confirm">' + ico("thought") + "<div><b>Okay, I won't tell your AI.</b><span>Your answer stays between us.</span>" +
    '<button class="back" id="undo">← Back</button></div></div>';
  else if (r.upd) askHtml = '<div class="askai" id="askai"><p>Should I let your AI know?</p><div class="yn">' +
    '<button class="btn small" id="yes">Yes, tell it</button><button class="btn ghost small" id="no">No</button></div></div>';
  openSheet(stopHead(st, i) +
    '<div class="react ' + (r.upd && !r.ok ? "new" : "ok") + '"><span class="catface big"></span><div><b>' + esc(line) + "</b>" +
    '<span class="mine">Your order: ' + esc(r.you) + "</span>" + "</div></div>" + askHtml +
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
  // Back from a confirmation returns to the Yes/No question (and takes a sent update back)
  var undo = function () {
    if (r.sent) { undoUpdate(r.undo); r.sent = false; r.undo = null; }
    r.declined = false;
    showReveal(i);
  };
  var ub = document.getElementById("undo");
  if (ub) ub.addEventListener("click", undo);
  setBack(r.sent || r.declined ? undo : redo);
  var yes = document.getElementById("yes"), no = document.getElementById("no");
  if (yes) yes.addEventListener("click", function () { r.undo = sendUpdates([r.upd]); r.sent = true; showReveal(i); });
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
  setTimeout(function () { if (!game.done) return; cat.mode = "sleeping"; document.getElementById("zz").classList.add("on"); }, 900);
  var back = function () { goStop(n - 1); };
  setBack(back);

  setTimeout(function () {
    finale.hidden = false;
    finale.innerHTML =
      '<div class="card">' + navRow([["fback", "← Back"]]) +
      '<div class="thanks"><span class="catface big"></span><h1>Thanks! That’s all for now.</h1>' +
      '<p class="lead">You answered ' + n + " questions. The cat " + (same === n ? "guessed every one right." : "guessed " + same + " of them right.") + "</p></div>" +
      (sent.length ? '<div class="tile wide"><h3>' + ico("robot") + "Your AI now knows</h3><ul class=\"plain\">" +
        sent.map(function (x) { return "<li>" + esc(x.upd.fixed) + "</li>"; }).join("") + "</ul>" +
        // Backup when the AI can't take updates from the app: copy them and paste into the AI's chat
        '<button class="btn ghost small" id="copyai">' + ico("clipboard") + "Copy for my AI</button>" +
        '<p class="hint copied" id="copied" hidden>Copied! Paste it into your AI\'s chat.</p></div>' : "") +
      '<button class="btn" id="again">' + ico("home") + "Back home</button></div>";
    var cb = document.getElementById("copyai");
    if (cb) cb.addEventListener("click", function () {
      copyText("My updated priorities:\n" + sent.map(function (x) { return "- " + x.upd.fixed; }).join("\n"));
      document.getElementById("copied").hidden = false;
      cb.innerHTML = ico("check") + "Copied";
    });
    document.getElementById("fback").addEventListener("click", back);
    document.getElementById("again").addEventListener("click", start);
    finale.scrollTop = 0;
  }, reduceMotion ? 0 : 1600);
}

// Copy text, with a fallback for browsers that block the clipboard API
function copyText(text) {
  var fallback = function () {
    var ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
  };
  try { navigator.clipboard.writeText(text).catch(fallback); } catch (e) { fallback(); }
}

// Redraw the home screen (fresh reminder) when nothing is in progress
function refreshHome() { if (game && !game.plan && !game.playing && !game.done) start(); }

window.addEventListener("storage", function (e) {
  if (e.key === "mwt-voice" && inGame() && game.stops[game.i] && !game.results[game.i]) ask(game.i);
  if (e.key === "mwt-feed" || e.key === "mwt-lastSync") refreshHome();
});

start();
