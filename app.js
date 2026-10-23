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
  var L = game.L, n = game.week.stops.length;
  mapEl.style.aspectRatio = W + " / " + L.H;
  var pts = [{ x: L.home.x, y: L.home.y + 84 }]
    .concat(L.spots.map(function (s) { return { x: s.x, y: s.y + 82 }; }))
    .concat([{ x: L.hall.x, y: L.hall.y + 86 }]);
  game.path = pts;
  var d = pts.map(function (p, i) {
    if (!i) return "M" + p.x + " " + p.y;
    var q = pts[i - 1], my = (q.y + p.y) / 2;
    return "C" + q.x + " " + my + " " + p.x + " " + my + " " + p.x + " " + p.y;
  }).join(" ");

  // Trees along both edges, flowers next to each stop
  var deco = "";
  function img(name, x, y, size) { deco += '<image href="icons/' + name + '.png" x="' + x + '" y="' + y + '" width="' + size + '" height="' + size + '"/>'; }
  for (var y = 40; y < L.H - 60; y += 78) {
    img(y % 2 ? "tree1" : "tree2", y % 3 ? 4 : 14, y, 34);
    img(y % 2 ? "tree2" : "tree1", y % 3 ? 322 : 312, y + 34, 34);
  }
  for (var k = 0; k < n; k++) {
    var s = L.spots[k];
    img(["flower1", "flower2", "clover"][k % 3], s.x > 180 ? 140 : 196, s.y - 14, 22);
  }

  mapEl.innerHTML =
    '<svg class="ground" viewBox="0 0 ' + W + " " + L.H + '" preserveAspectRatio="none" aria-hidden="true">' +
    '<defs><radialGradient id="g" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#e6eedf"/><stop offset="1" stop-color="#d3dfcb"/></radialGradient></defs>' +
    '<rect width="' + W + '" height="' + L.H + '" fill="url(#g)"/>' +
    '<path d="' + d + '" class="road-edge"/><path d="' + d + '" class="road"/><path d="' + d + '" class="road-line"/>' + deco + "</svg>" +
    ico("cloud", "cloud c1") + ico("cloud", "cloud c2") +
    spot(L.hall, "hall", "hall", "Town hall", "") +
    spot(L.home, "home", "home", "Home", "") +
    game.week.stops.map(function (st, i) { return spot(L.spots[i], "b" + i, st.icon, st.place, "locked"); }).join("") +
    '<div class="cat" id="cat"><div class="cat-sprite" id="cat-sprite"></div><span class="zz" id="zz">z z</span></div>';
  placeCat(pts[0].x, pts[0].y);
}

function spot(p, id, icon, label, cls) {
  return '<div class="spot ' + cls + '" id="' + id + '" style="left:' + pct(p.x, W) + ";top:" + pct(p.y, game.L.H) + '">' +
    '<span class="badge"></span>' + ico(icon, "bldg") + '<span class="plate">' + esc(label) + "</span></div>";
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
      if (t < 1) nextFrame(step);
      else { cat.mode = "idle"; cat.idleTicks = 0; done(); }
    }
    nextFrame(step);
  }, reduceMotion ? 0 : 300);
}

function follow(y, instant) {
  var rect = mapEl.getBoundingClientRect();
  var target = window.scrollY + rect.top + rect.height * (y / game.L.H) - window.innerHeight * 0.28;
  window.scrollTo({ top: Math.max(0, target), behavior: reduceMotion || instant ? "auto" : "smooth" });
}

function openSheet(html) { sheet.innerHTML = html; sheet.classList.add("open"); sheet.scrollTop = 0; }
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
      '<span class="pick">' + (st ? "→ Stop " + (x.stop + 1) + ": " + esc(SKILLS[st.skill].name) : "Skipped. " + esc(x.skip)) + "</span></div></li>";
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
function start(wi) {
  game = { wi: wi, week: WEEKS[wi], i: 0, results: [] };
  game.L = layout(game.week.stops.length);
  finale.hidden = true;
  drawTown();
  cat.mode = "sleeping";
  document.getElementById("zz").classList.add("on");
  window.scrollTo(0, 0);
  requestAnimationFrame(function () { follow(game.L.home.y, true); });
  statusEl.textContent = game.week.label;
  var n = game.week.stops.length;
  openSheet(
    '<p class="kicker">' + (wi ? "A week later" : "It's 2040") + "</p>" +
    '<h1>Last week, your agent did <span class="hl">' + game.week.total + " things</span> for you.</h1>" +
    '<p class="lead">' + n + " of them shaped you (" + esc(game.week.period) + "). The cat is asleep at home. Wake it up, and it will walk you to each one with a quick question.</p>" +
    '<button class="btn" id="go">' + ico("sparkles") + "Wake up the cat</button>" +
    '<button class="btn ghost" id="peek">' + ico("clipboard") + "See last week's log</button>");
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
    '<div class="chips"><span class="qtype">' + esc(SKILLS[st.skill].group) + " · " + esc(SKILLS[st.skill].name) + "</span>" +
    (lg ? '<span class="src">' + ico("clipboard") + "From last week's log · " + esc(lg.day) + "</span>" : "") + "</div>" +
    "<h2>" + esc(st.question) + '</h2><div class="opts">' +
    st.options.map(function (o) { return '<button class="opt" data-k="' + o.k + '">' + esc(o.t) + "</button>"; }).join("") + "</div>");
  sheet.querySelectorAll("[data-k]").forEach(function (b) {
    b.addEventListener("click", function () { answer(i, b.getAttribute("data-k")); });
  });
}

function answer(i, key) {
  var st = game.week.stops[i], el = document.getElementById("b" + i);
  var o = st.options.filter(function (x) { return x.k === key; })[0];
  var strong = !o.fade;
  game.results[i] = { skill: st.skill, strong: strong, fixed: false, tip: st.tip, me: o.me };
  el.classList.remove("here");
  el.classList.add(strong ? "strong" : "fading");
  el.querySelector(".badge").innerHTML = ico(strong ? "sparkles" : "fog");

  // Your reason next to your agent's reason
  var same = st.agent && key === st.agent;
  var compare = '<div class="why"><div class="me"><small>You</small><p>' + esc(o.me || o.t) + "</p></div>" +
    '<div class="ag"><small>' + ico("robot") + "Your agent, last week</small><p>" + esc(st.reason) + "</p></div></div>" +
    (st.agent ? '<p class="match">' + (same ? "✔ Your agent chose for the same reason as you." : "Your agent chose for a different reason.") + "</p>" : "");

  var s = SKILLS[st.skill];
  var verdict = '<div class="verdict ' + (strong ? "ok" : "fade") + '">' + ico(s.part, "vi") + "<div><b>" + esc(s.name) + "</b><span>" +
    (strong ? "Still strong. You know what you want here." : "Starting to fade. Your agent is doing this for you.") + "</span></div></div>";
  var fix = o.fix
    ? '<div class="fixbox" id="fixbox"><p>Want your agent to do it your way?</p>' +
      '<button class="btn soft" id="fix">' + ico("hand") + "<span>Tell my agent: " + esc(o.fix) + "</span></button></div>"
    : "";
  var last = i === game.week.stops.length - 1;
  openSheet(place(st, i) + compare + verdict + fix +
    '<button class="btn" id="on">' + (last ? "Walk to the town hall" : "Keep walking") + "</button>");
  var fb = document.getElementById("fix");
  if (fb) fb.addEventListener("click", function () {
    game.results[i].fixed = o.fixed;
    document.getElementById("fixbox").innerHTML = '<p class="done">' + ico("check") + "Told your agent. " + esc(o.fixed) + "</p>";
  });
  document.getElementById("on").addEventListener("click", function () { closeSheet(); game.i++; setTimeout(next, 300); });
}

function ending() {
  var r = game.results, n = r.length;
  var strong = r.filter(function (x) { return x.strong; }).length;
  var fading = r.length - strong;
  var fixed = r.filter(function (x) { return x.fixed; });
  var mine = r.filter(function (x) { return x.me; });
  closeSheet();
  document.getElementById("hall").classList.add("glow");
  cat.mode = "tired";
  setTimeout(function () { cat.mode = "sleeping"; document.getElementById("zz").classList.add("on"); }, 900);

  setTimeout(function () {
    finale.hidden = false;
    var rows = r.map(function (x) {
      var s = SKILLS[x.skill];
      return '<li class="' + (x.strong ? "ok" : "fade") + '">' + ico(s.part) + "<div><strong>" + esc(s.name) + "</strong>" +
        (x.strong ? "" : "<small>Try: " + esc(x.tip) + "</small>") + '</div><span class="tag">' + (x.strong ? "Strong" : "Fading") + "</span></li>";
    }).join("");
    var ring = Math.round(strong / n * 100);
    finale.innerHTML =
      '<div class="card"><p class="kicker center">Your town · last week</p>' +
      '<div class="score"><div class="ring" style="--p:' + ring + '"><span>' + strong + "<small>/" + n + "</small></span></div>" +
      "<div><h1>skills still feel like yours</h1>" +
      '<p class="lead">' + (fading ? fading + " " + (fading === 1 ? "is" : "are") + " starting to fade because your agent does them for you. One small step each keeps them alive." : "Your agent helps you without taking over. Keep it that way.") + "</p></div></div>" +
      '<div class="bento">' +
      '<div class="tile wide"><h3>' + ico("brain") + "Your skills</h3><ul class=\"skills\">" + rows + "</ul></div>" +
      (mine.length ? '<div class="tile"><h3>' + ico("thought") + "What matters to you</h3><ul class=\"chiplist\">" +
        mine.map(function (x) { return "<li>" + esc(x.me) + "</li>"; }).join("") + "</ul></div>" : "") +
      (fixed.length ? '<div class="tile"><h3>' + ico("hand") + "You told your agent</h3><ul class=\"plain\">" +
        fixed.map(function (x) { return "<li>" + esc(x.fixed.replace(/^It will/, "Your agent will")) + "</li>"; }).join("") + "</ul></div>" : "") +
      '<div class="tile wide"><h3>' + ico("sparkles") + 'What you got from this walk</h3><ul class="gains">' +
      "<li>" + ico("speech") + "<span>You know why your agent did all " + n + " things, and whether that's your reason too.</span></li>" +
      "<li>" + ico("search") + "<span>You know which skills are slipping, before the day you need them.</span></li>" +
      "<li>" + ico("target") + "<span>" + (fixed.length ? "Your agent now works a little more like you." : "You made " + n + " calls yourself, in about 2 minutes.") + "</span></li>" +
      "</ul></div></div>" +
      '<p class="closing">Your agent saves your time.<br><span>My Week Town keeps you, you.</span></p>' +
      '<button class="btn" id="again">' + (game.wi < WEEKS.length - 1 ? "Walk next Sunday's town" : "Start over") + "</button>" +
      '<button class="btn ghost" id="peek2">' + ico("robot") + "How this town was made</button></div>";
    document.getElementById("again").addEventListener("click", function () { start(game.wi < WEEKS.length - 1 ? game.wi + 1 : 0); });
    document.getElementById("peek2").addEventListener("click", function () { openBehind("model"); });
    finale.scrollTop = 0;
  }, reduceMotion ? 0 : 1800);
}

start(0);
