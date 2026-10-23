// My Week Town
// Every Sunday your week becomes a town. A cat walks to each big thing your agent did.
// Each stop quietly checks one skill that can fade when an agent does everything for you.
// Sample data stands in for the AI agent. The number of stops comes from the week's data.

// The skills that can fade (from our analysis)
var SKILLS = {
  value:       { part: "💰", name: "Judging value" },
  taste:       { part: "🪞", name: "Knowing what I like" },
  memory:      { part: "🧠", name: "Memory" },
  money:       { part: "💰", name: "Knowing where money goes" },
  questioning: { part: "🧠", name: "Questioning" },
  people:      { part: "🤝", name: "Personal effort in relationships" },
  bargain:     { part: "🛠️", name: "Bargaining and speaking up" },
  problems:    { part: "🪞", name: "Handling problems" },
  newthings:   { part: "🪞", name: "Trying new things" },
  daily:       { part: "🛠️", name: "Daily life skills" },
  thinking:    { part: "🧠", name: "Thinking through problems" }
};

// Each stop: what happened (context), a question about you, which answers show the skill is strong,
// what your agent did, and how to tell your agent when it wasn't how you'd do it.
var WEEKS = [
  {
    label: "Sunday, 10 March 2040",
    stops: [
      { icon: "📺", place: "Electronics store", skill: "value",
        context: "On Tuesday, your agent bought a 55-inch 4K TV for ₹45,000.",
        question: "Was that price cheap, fair or a rip-off?",
        options: [["cheap", "Cheap"], ["fair", "Fair"], ["rip", "A rip-off"], ["idk", "I have no idea"]],
        good: ["fair"],
        reveal: "TVs like this sell for ₹40,000 to ₹50,000. ₹45,000 was a fair price.",
        tip: "Before your agent buys something big, guess the price yourself first." },

      { icon: "🛋️", place: "Furniture market", skill: "taste",
        context: "Your agent ordered a new sofa: a grey fabric one on sale for ₹35,000, instead of a solid wood one for ₹42,000 that lasts 15 years.",
        question: "Which one would you have picked?",
        options: [["grey", "The grey sale sofa, ₹35,000"], ["wood", "The solid wood one, ₹42,000"], ["dontmind", "I don't mind"]],
        good: ["grey", "wood"], agent: "grey",
        reveal: "Your agent went with the grey sale sofa.",
        fix: "I'd pay a bit more for things that last", fixed: "It will check with you before choosing a sale over quality.",
        tip: "Pick one thing for your home yourself this week." },

      { icon: "🎂", place: "Mom's house", skill: "memory",
        context: "This week your agent sent Mom a birthday wish and booked her dinner.",
        question: "Without checking your phone: what date is Mom's birthday?",
        options: [["8", "8 March"], ["18", "18 March"], ["28", "28 March"], ["idk", "I don't remember"]],
        good: ["8"],
        reveal: "Mom's birthday was on Friday, 8 March.",
        tip: "Remember one birthday yourself, without your agent." },

      { icon: "🏦", place: "Bank", skill: "money",
        context: "Your agent paid for every food order you made this week.",
        question: "Roughly how much did you spend on food?",
        options: [["low", "Under ₹2,000"], ["mid", "₹2,000 to ₹5,000"], ["high", "Over ₹5,000"], ["idk", "No idea"]],
        good: ["high"],
        reveal: "You spent ₹6,800 on food this week, across 14 orders.",
        tip: "Look at your week's spending for one minute every Sunday." },

      { icon: "🏢", place: "Your office", skill: "questioning",
        context: "Your project has a fixed launch date. Your agent chose Vendor B because it's ₹40,000 cheaper. Vendor B missed 2 deadlines last year.",
        question: "Would you have signed Vendor B?",
        options: [["yes", "Yes, the saving is worth it"], ["no", "No, the deadline matters more"], ["dontmind", "I don't mind"]],
        good: ["no"], agent: "yes",
        reveal: "Your agent signed Vendor B to save ₹40,000.",
        fix: "At work, deadlines come before savings", fixed: "It will flag deadline risks to you before signing.",
        tip: "When your agent says \"cheaper\", ask what the catch is." },

      { icon: "💌", place: "Post office", skill: "people",
        context: "Your agent wrote and sent your best friend Arjun's birthday message.",
        question: "Do you know what it said?",
        options: [["yes", "Yes, I read it"], ["roughly", "Roughly"], ["no", "No, I didn't see it"]],
        good: ["yes", "roughly"],
        reveal: "It said: \"Happy birthday Arjun! Have a great year ahead 🎉\"",
        fix: "Let me write birthday wishes myself", fixed: "It will remind you, and you'll write the message.", fixWhen: ["no"],
        tip: "Write one message to a friend yourself this week." }
    ]
  },
  {
    label: "Sunday, 17 March 2040",
    stops: [
      { icon: "🪔", place: "Craft market", skill: "bargain",
        context: "A seller asked ₹2,400 for a handmade lamp. Similar lamps sell for ₹1,600 to ₹2,000.",
        question: "What would you have done?",
        options: [["pay", "Paid ₹2,400"], ["offer", "Offered about ₹1,800"], ["agent", "Let my agent handle it"]],
        good: ["offer"], agent: "pay",
        reveal: "Your agent paid ₹2,400 without asking.",
        fix: "Let me make the offer on handmade things", fixed: "It will let you bargain next time.",
        tip: "Ask for a better price once this week, in person." },

      { icon: "✈️", place: "Airport", skill: "problems",
        context: "Your 7 am flight to Delhi was cancelled, and your agent was offline for an hour.",
        question: "What would be your first move?",
        options: [["wait", "Wait for my agent to come back"], ["desk", "Ask the airline desk to rebook me"], ["home", "Go back home"]],
        good: ["desk"],
        reveal: "The airline desk could rebook you on the 9:30 am flight in 5 minutes.",
        tip: "Sort out one small problem this week without your agent." },

      { icon: "🍝", place: "Restaurant street", skill: "newthings",
        context: "Your agent booked your usual Italian place for Friday dinner, for the 9th time this year.",
        question: "Would you rather try somewhere new?",
        options: [["new", "Yes, let's try something new"], ["usual", "No, I love the usual"], ["dontmind", "I don't mind"]],
        good: ["new"], agent: "usual",
        reveal: "Your agent booked the usual place again.",
        fix: "Mix in new places now and then", fixed: "It will suggest one new place a month.",
        tip: "Try one new place, dish or route this week." },

      { icon: "🍳", place: "Your kitchen", skill: "daily",
        context: "This week your agent booked 6 cabs and ordered 11 meals for you.",
        question: "When did you last cook a meal or book a cab yourself?",
        options: [["week", "This week"], ["month", "This month"], ["cant", "I can't remember"]],
        good: ["week"],
        reveal: "Everything this week was done by your agent.",
        tip: "Cook one simple meal yourself this week." },

      { icon: "📶", place: "Your home Wi-Fi", skill: "thinking",
        context: "Your Wi-Fi stopped working on Wednesday. Your agent fixed it in 2 minutes.",
        question: "Do you know what was wrong?",
        options: [["router", "The router froze and needed a restart"], ["bill", "The bill wasn't paid"], ["idk", "No idea"]],
        good: ["router"],
        reveal: "The router had frozen. A restart fixed it.",
        tip: "Next time, try fixing it yourself for 5 minutes first." }
    ]
  }
];

var W = 360, ROW = 132;
var mapEl = document.getElementById("map"), sheet = document.getElementById("sheet"), finale = document.getElementById("finale");
var statusEl = document.getElementById("status");
var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var game;

function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function pct(v, total) { return (v / total * 100) + "%"; }

/* ---------- The cat (oneko sprite sheet, 32 px frames) ---------- */
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

  var deco = "";
  for (var y = 70; y < L.H - 40; y += 78) {
    deco += '<text x="' + (y % 3 ? 16 : 26) + '" y="' + y + '" class="tree">' + (y % 2 ? "🌳" : "🌲") + "</text>";
    deco += '<text x="' + (y % 3 ? 318 : 308) + '" y="' + (y + 34) + '" class="tree">' + (y % 2 ? "🌲" : "🌳") + "</text>";
  }
  for (var k = 0; k < n; k++) {
    var s = L.spots[k];
    deco += '<text x="' + (s.x > 180 ? 150 : 196) + '" y="' + (s.y + 4) + '" class="bush">' + ["🌼", "🌷", "🍀"][k % 3] + "</text>";
  }

  mapEl.innerHTML =
    '<svg class="ground" viewBox="0 0 ' + W + " " + L.H + '" preserveAspectRatio="none" aria-hidden="true">' +
    '<rect width="' + W + '" height="' + L.H + '" class="grass"/>' +
    '<path d="' + d + '" class="road-edge"/><path d="' + d + '" class="road"/><path d="' + d + '" class="road-line"/>' + deco + "</svg>" +
    '<div class="cloud c1">☁️</div><div class="cloud c2">☁️</div>' +
    spot(L.hall, "hall", "🏛️", "Town hall", "") +
    spot(L.home, "home", "🏡", "Home", "") +
    game.week.stops.map(function (st, i) { return spot(L.spots[i], "b" + i, st.icon, st.place, "locked"); }).join("") +
    '<div class="cat" id="cat"><div class="cat-sprite" id="cat-sprite"></div><span class="zz" id="zz">z z</span></div>';
  placeCat(pts[0].x, pts[0].y);
}

function spot(p, id, icon, label, cls) {
  return '<div class="spot ' + cls + '" id="' + id + '" style="left:' + pct(p.x, W) + ";top:" + pct(p.y, game.L.H) + '">' +
    '<span class="badge"></span><span class="bldg">' + icon + '</span><span class="plate">' + esc(label) + "</span></div>";
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
  var target = window.scrollY + rect.top + rect.height * (y / game.L.H) - window.innerHeight * 0.34;
  window.scrollTo({ top: Math.max(0, target), behavior: reduceMotion || instant ? "auto" : "smooth" });
}

function openSheet(html) { sheet.innerHTML = html; sheet.classList.add("open"); sheet.scrollTop = 0; }
function closeSheet() { sheet.classList.remove("open"); }
function place(st, i) {
  return '<p class="kicker">' + st.icon + " " + esc(st.place) + '<span class="count">' + (i + 1) + " of " + game.week.stops.length + "</span></p>";
}

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
    '<h1>Your agent handled <span class="hl">' + n + " things</span> for you this week.</h1>" +
    '<p class="lead">You barely noticed. Walk through your town and see what you still know, and what you\'d have done differently.</p>' +
    '<button class="btn" id="go">Wake up and walk</button>');
  document.getElementById("go").addEventListener("click", function () { closeSheet(); setTimeout(next, 350); });
}

function next() {
  var i = game.i, n = game.week.stops.length;
  statusEl.textContent = i < n ? "Stop " + (i + 1) + " of " + n : "Town hall";
  walk(i, i + 1, function () { if (i < n) ask(i); else ending(); });
}

function ask(i) {
  var st = game.week.stops[i], el = document.getElementById("b" + i);
  el.classList.remove("locked");
  el.classList.add("here");
  openSheet(place(st, i) +
    '<p class="context">' + esc(st.context) + "</p>" +
    "<h2>" + esc(st.question) + '</h2><div class="opts">' +
    st.options.map(function (o) { return '<button class="opt" data-k="' + o[0] + '">' + esc(o[1]) + "</button>"; }).join("") + "</div>");
  sheet.querySelectorAll("[data-k]").forEach(function (b) {
    b.addEventListener("click", function () { answer(i, b.getAttribute("data-k")); });
  });
}

function answer(i, key) {
  var st = game.week.stops[i], el = document.getElementById("b" + i);
  var strong = st.good.indexOf(key) !== -1;
  // You'd have done it differently from your agent: offer to tell it
  var differs = !!st.fix && (st.fixWhen ? st.fixWhen.indexOf(key) !== -1 : key !== st.agent && strong);
  game.results[i] = { skill: st.skill, strong: strong, fixed: false, tip: st.tip };
  el.classList.remove("here");
  el.classList.add(strong ? "strong" : "fading");
  el.querySelector(".badge").textContent = strong ? "✨" : "☁️";

  var s = SKILLS[st.skill];
  var verdict = '<div class="verdict ' + (strong ? "ok" : "fade") + '"><span class="vi">' + s.part + "</span><div><b>" + esc(s.name) + "</b><span>" +
    (strong ? "Still strong" : "Starting to fade") + "</span></div></div>";
  var fix = differs
    ? '<div class="fixbox" id="fixbox"><p>Not how you\'d do it? Tell your agent.</p>' +
      '<button class="btn soft" id="fix">✋ Tell my agent: ' + esc(st.fix) + "</button></div>"
    : "";
  var last = i === game.week.stops.length - 1;
  openSheet(place(st, i) + '<p class="reveal">' + esc(st.reveal) + "</p>" + verdict + fix +
    '<button class="btn" id="on">' + (last ? "Walk to the town hall" : "Keep walking") + "</button>");
  var fb = document.getElementById("fix");
  if (fb) fb.addEventListener("click", function () {
    game.results[i].fixed = st.fixed;
    document.getElementById("fixbox").innerHTML = '<p class="done">✔ Told your agent. ' + esc(st.fixed) + "</p>";
  });
  document.getElementById("on").addEventListener("click", function () { closeSheet(); game.i++; setTimeout(next, 300); });
}

function ending() {
  var r = game.results, n = r.length;
  var strong = r.filter(function (x) { return x.strong; }).length;
  var fading = r.length - strong;
  var fixed = r.filter(function (x) { return x.fixed; });
  closeSheet();
  document.getElementById("hall").classList.add("glow");
  cat.mode = "tired";
  setTimeout(function () { cat.mode = "sleeping"; document.getElementById("zz").classList.add("on"); }, 900);

  setTimeout(function () {
    finale.hidden = false;
    var rows = r.map(function (x) {
      var s = SKILLS[x.skill];
      return '<li class="' + (x.strong ? "ok" : "fade") + '"><span class="ico">' + s.part + "</span><div><strong>" + esc(s.name) + "</strong>" +
        (x.strong ? "" : "<small>Try: " + esc(x.tip) + "</small>") + '</div><span class="tag">' + (x.strong ? "Strong" : "Fading") + "</span></li>";
    }).join("");
    finale.innerHTML =
      '<div class="card"><p class="kicker">Your town this week</p>' +
      '<div class="big">' + strong + "<span> of " + n + "</span></div>" +
      "<h1>skills still feel like yours.</h1>" +
      '<p class="lead">' + (fading ? fading + " " + (fading === 1 ? "is" : "are") + " starting to fade because your agent does them for you. One small step each keeps them alive." : "Your agent helps you without taking over. Keep it that way.") + "</p>" +
      '<ul class="skills">' + rows + "</ul>" +
      (fixed.length ? '<h3>You told your agent</h3><ul class="fixed">' + fixed.map(function (x) { return "<li>✋ " + esc(x.fixed.replace(/^It will/, "Your agent will")) + "</li>"; }).join("") + "</ul>" : "") +
      '<h3>What you got from this walk</h3><ul class="gains">' +
      "<li>🗣️ You can now explain all " + n + " things your agent did this week.</li>" +
      "<li>🔍 You know which skills are slipping, before the day you need them.</li>" +
      (fixed.length ? "<li>🎯 Your agent now works a little more like you.</li>" : "<li>🎯 You made " + n + " calls yourself, in about 2 minutes.</li>") +
      "</ul>" +
      '<p class="closing">Your agent saves your time.<br><span>My Week Town keeps you, you.</span></p>' +
      '<button class="btn" id="again">' + (game.wi < WEEKS.length - 1 ? "Walk next Sunday's town" : "Start over") + "</button></div>";
    document.getElementById("again").addEventListener("click", function () { start(game.wi < WEEKS.length - 1 ? game.wi + 1 : 0); });
    finale.scrollTop = 0;
  }, reduceMotion ? 0 : 1800);
}

start(0);
