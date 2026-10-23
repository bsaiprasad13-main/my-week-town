// My Week Town: a character walks through last week's big choices.
// At each building it asks how YOU would choose, then shows what your agent did.
// Sample data stands in for the AI agent. The number of buildings comes from the week's data.

var WEEKS = [
  {
    label: "Sunday, 10 March 2040",
    stops: [
      { icon: "📺", place: "Electronics store", title: "A new TV",
        question: "This TV is 30% off. A better-reviewed one costs ₹6,000 more. Which would you take?",
        options: [{ key: "deal", text: "💸 The 30% off one", trait: "saving money now" },
                  { key: "better", text: "💎 Pay ₹6,000 more for the better one", trait: "quality" }],
        agent: "deal", agentLine: "Your agent bought the 30% off TV for ₹45,000." },
      { icon: "🏢", place: "Your office", title: "The office project vendor",
        question: "Two vendors for a ₹5 lakh project. Who gets it?",
        options: [{ key: "a", text: "🛡️ Vendor A: never late, ₹40,000 more", trait: "reliability" },
                  { key: "b", text: "🏷️ Vendor B: cheaper, missed 2 deadlines", trait: "saving money now" }],
        agent: "b", agentLine: "Your agent picked Vendor B to save ₹40,000." },
      { icon: "🩺", place: "Health centre", title: "Family health insurance",
        question: "Renewing your family's health insurance. What matters most to you?",
        options: [{ key: "claims", text: "⚡ Claims paid fast", trait: "reliability" },
                  { key: "cheap", text: "🏷️ Lowest yearly price", trait: "saving money now" },
                  { key: "brand", text: "™️ A big, famous brand", trait: "brand" }],
        agent: "claims", agentLine: "Your agent renewed the insurer that pays claims fastest." },
      { icon: "🍽️", place: "Restaurant street", title: "Mom's birthday dinner",
        question: "Where would you take Mom for her birthday?",
        options: [{ key: "quiet", text: "🕯️ A quiet family place", trait: "family time" },
                  { key: "rooftop", text: "🌆 The trendy rooftop", trait: "what's popular" }],
        agent: "quiet", agentLine: "Your agent booked the quiet family place." },
      { icon: "🛋️", place: "Furniture market", title: "A new sofa",
        question: "₹35,000 on sale, or ₹42,000 in solid wood that lasts 15 years?",
        options: [{ key: "sale", text: "💸 The ₹35,000 sale sofa", trait: "saving money now" },
                  { key: "wood", text: "🪵 Solid wood, ₹42,000", trait: "quality" }],
        agent: "sale", agentLine: "Your agent ordered the sale sofa." }
    ]
  },
  {
    label: "Sunday, 17 March 2040",
    stops: [
      { icon: "✈️", place: "Airport", title: "Diwali flights",
        question: "A direct flight costs ₹9,000 more than one with a 4-hour stop. Which one?",
        options: [{ key: "direct", text: "🛫 Direct, ₹9,000 more", trait: "family time" },
                  { key: "stop", text: "🏷️ One stop, cheaper", trait: "saving money now" }],
        agent: "direct", agentLine: "Your agent booked the direct flight. It remembered last week." },
      { icon: "🎨", place: "Riya's school", title: "Riya's weekend class",
        question: "Choosing Riya's weekend class. What matters most to you?",
        options: [{ key: "joy", text: "😊 What she enjoys", trait: "family time" },
                  { key: "skills", text: "🧠 Skills for her future", trait: "quality" },
                  { key: "near", text: "📍 Closest to home", trait: "convenience" }],
        agent: "near", agentLine: "Your agent picked the class closest to home." },
      { icon: "🏋️", place: "Gym street", title: "A new gym",
        question: "Gym near the office, or a yoga studio near home?",
        options: [{ key: "office", text: "🏢 Gym near the office", trait: "convenience" },
                  { key: "home", text: "🧘 Yoga near home", trait: "family time" }],
        agent: "office", agentLine: "Your agent joined the gym near the office." },
      { icon: "🧺", place: "Appliance store", title: "A washing machine",
        question: "₹32,000 on discount, or ₹36,000 with a 10-year warranty?",
        options: [{ key: "disc", text: "💸 ₹32,000 on discount", trait: "saving money now" },
                  { key: "warranty", text: "🛡️ ₹36,000 with the warranty", trait: "quality" }],
        agent: "warranty", agentLine: "Your agent chose the 10-year warranty." }
    ]
  }
];

var W = 360, ROW = 132;
var mapEl = document.getElementById("map"), sheet = document.getElementById("sheet"), finale = document.getElementById("finale");
var statusEl = document.getElementById("status");
var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var game;

function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

// Lay the town out from the data: home at the bottom, town hall at the top, buildings zig-zag in between
function layout(n) {
  var H = 170 + n * ROW + 140;
  var home = { x: 180, y: H - 70 };
  var hall = { x: 180, y: 90 };
  var spots = [];
  for (var i = 0; i < n; i++) spots.push({ x: i % 2 === 0 ? 96 : 264, y: H - 200 - i * ROW });
  return { H: H, home: home, hall: hall, spots: spots };
}

function pct(v, total) { return (v / total * 100) + "%"; }

function drawTown() {
  var L = game.L, n = game.week.stops.length;
  mapEl.style.aspectRatio = W + " / " + L.H;
  var pts = [{ x: L.home.x, y: L.home.y + 66 }].concat(L.spots.map(function (s) { return { x: s.x, y: s.y + 66 }; })).concat([{ x: L.hall.x, y: L.hall.y + 70 }]);
  game.path = pts;
  var d = pts.map(function (p, i) {
    if (!i) return "M" + p.x + " " + p.y;
    var q = pts[i - 1], my = (q.y + p.y) / 2;
    return "C" + q.x + " " + my + " " + p.x + " " + my + " " + p.x + " " + p.y;
  }).join(" ");

  // Trees and bushes along the edges, placed the same way every time
  var deco = "";
  for (var y = 60; y < L.H - 40; y += 74) {
    deco += '<text x="' + (y % 3 ? 20 : 30) + '" y="' + y + '" class="tree">' + (y % 2 ? "🌳" : "🌲") + "</text>";
    deco += '<text x="' + (y % 3 ? 322 : 312) + '" y="' + (y + 30) + '" class="tree">' + (y % 2 ? "🌲" : "🌳") + "</text>";
  }
  for (var k = 0; k < n; k++) {
    var s = L.spots[k];
    deco += '<text x="' + (s.x > 180 ? 150 : 192) + '" y="' + (s.y + 8) + '" class="bush">' + (k % 2 ? "🌷" : "🌼") + "</text>";
  }

  mapEl.innerHTML =
    '<svg class="ground" viewBox="0 0 ' + W + " " + L.H + '" preserveAspectRatio="none" aria-hidden="true">' +
    '<rect width="' + W + '" height="' + L.H + '" class="grass"/>' +
    '<path d="' + d + '" class="road"/><path d="' + d + '" class="road-line"/>' +
    '<path d="' + d + '" class="trail" id="trail"/>' + deco + "</svg>" +
    '<div class="cloud c1">☁️</div><div class="cloud c2">☁️</div>' +
    place(L.hall, "hall", "🏛️", "Town hall", "") +
    place(L.home, "home", "🏡", "Your home", "") +
    game.week.stops.map(function (st, i) { return place(L.spots[i], "b" + i, st.icon, st.place, "locked"); }).join("") +
    '<div class="walker" id="walker"><span class="shadow"></span><span class="body">🚶</span></div>';
  placeWalker(L.home.x, L.home.y + 66);
}

function place(p, id, icon, label, cls) {
  return '<div class="spot ' + cls + '" id="' + id + '" style="left:' + pct(p.x, W) + ";top:" + pct(p.y, game.L.H) + '">' +
    '<span class="badge"></span><span class="bldg">' + icon + '</span><span class="plate">' + esc(label) + "</span></div>";
}

function placeWalker(x, y) {
  var w = document.getElementById("walker");
  w.style.left = pct(x, W);
  w.style.top = pct(y, game.L.H);
}

// Next animation frame, with a timer backup so the walk never stalls in a background tab
function nextFrame(fn) {
  var called = false;
  function run() { if (!called) { called = true; fn(performance.now()); } }
  requestAnimationFrame(run);
  setTimeout(run, 50);
}

// Walk along the road from one stop to the next
function walk(fromIdx, toIdx, done) {
  var a = game.path[fromIdx], b = game.path[toIdx];
  var walker = document.getElementById("walker");
  var dist = Math.hypot(b.x - a.x, b.y - a.y);
  var ms = reduceMotion ? 1 : Math.max(900, dist * 9);
  var my = (a.y + b.y) / 2;
  walker.classList.add("walking");
  walker.classList.toggle("left", b.x < a.x);
  follow(b.y);
  var start = performance.now();
  function step(now) {
    var t = Math.min(1, (now - start) / ms);
    var e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    // Same curve as the road: a cubic from a to b with controls at the midpoint height
    var u = 1 - e;
    var x = u * u * u * a.x + 3 * u * u * e * a.x + 3 * u * e * e * b.x + e * e * e * b.x;
    var y = u * u * u * a.y + 3 * u * u * e * my + 3 * u * e * e * my + e * e * e * b.y;
    placeWalker(x, y);
    if (t < 1) nextFrame(step);
    else { walker.classList.remove("walking"); done(); }
  }
  nextFrame(step);
}

// Keep the walker in view as it moves up the town
function follow(y, instant) {
  var rect = mapEl.getBoundingClientRect();
  var target = window.scrollY + rect.top + rect.height * (y / game.L.H) - window.innerHeight * 0.38;
  window.scrollTo({ top: Math.max(0, target), behavior: reduceMotion || instant ? "auto" : "smooth" });
}

function openSheet(html) { sheet.innerHTML = html; sheet.classList.add("open"); }
function closeSheet() { sheet.classList.remove("open"); }

function start(weekIndex) {
  game = { wi: weekIndex, week: WEEKS[weekIndex], i: 0, answers: [], taught: false };
  game.L = layout(game.week.stops.length);
  finale.hidden = true;
  drawTown();
  window.scrollTo(0, 0);
  requestAnimationFrame(function () { follow(game.L.home.y, true); });
  statusEl.textContent = game.week.label;
  var n = game.week.stops.length;
  openSheet(
    '<p class="kicker">' + (weekIndex ? "One week later" : "It's 2040") + "</p>" +
    "<h1>" + (weekIndex ? "A new week, a new town." : "Your agent made <em>" + n + " big choices</em> for you this week.") + "</h1>" +
    '<p class="lead">' + (weekIndex
      ? "This week your agent made " + n + " big choices. Walk through them and see if it's choosing your way now."
      : "You approved them in seconds. Walk through your town and check each one was made <strong>your way</strong>.") + "</p>" +
    '<button class="btn" id="go">Start walking 🚶</button>');
  document.getElementById("go").addEventListener("click", function () { closeSheet(); setTimeout(next, 350); });
}

function next() {
  var i = game.i, n = game.week.stops.length;
  statusEl.textContent = i < n ? "Stop " + (i + 1) + " of " + n : "Town hall";
  walk(i, i + 1, function () {
    if (i < n) arrive(i); else ending();
  });
}

function arrive(i) {
  var st = game.week.stops[i], el = document.getElementById("b" + i);
  el.classList.remove("locked");
  el.classList.add("here");
  openSheet(
    '<p class="kicker">' + st.icon + " " + esc(st.place) + " · stop " + (i + 1) + " of " + game.week.stops.length + "</p>" +
    "<h2>" + esc(st.question) + '</h2><div class="opts">' +
    st.options.map(function (o) { return '<button class="opt" data-k="' + o.key + '">' + esc(o.text) + "</button>"; }).join("") +
    '<button class="opt quiet" data-k="unsure">🤷 I don\'t mind</button></div>');
  sheet.querySelectorAll("[data-k]").forEach(function (b) {
    b.addEventListener("click", function () { answer(i, b.getAttribute("data-k")); });
  });
}

function answer(i, key) {
  var st = game.week.stops[i], el = document.getElementById("b" + i);
  var same = key === st.agent, unsure = key === "unsure";
  game.answers[i] = { key: key, same: same || unsure };
  el.classList.remove("here");
  el.classList.add(same || unsure ? "match" : "differ");
  el.querySelector(".badge").textContent = same || unsure ? "✨" : "🚩";
  var mine = st.options.filter(function (o) { return o.key === key; })[0];
  var theirs = st.options.filter(function (o) { return o.key === st.agent; })[0];
  var verdict = unsure
    ? '<div class="verdict ok"><b>👍 Fine either way</b><span>No surprise here for you.</span></div>'
    : same
    ? '<div class="verdict ok"><b>✨ Same as you</b><span>Your agent chose this one your way.</span></div>'
    : '<div class="verdict off"><b>🚩 Not your way</b><span>You value <strong>' + esc(mine.trait) + "</strong>. Your agent went for <strong>" + esc(theirs.trait) + "</strong>.</span></div>";
  var last = i === game.week.stops.length - 1;
  openSheet(
    '<p class="kicker">' + st.icon + " " + esc(st.place) + "</p>" +
    '<p class="agent">' + esc(st.agentLine) + "</p>" + verdict +
    '<button class="btn" id="on">' + (last ? "Walk to the town hall 🏛️" : "Keep walking 🚶") + "</button>");
  document.getElementById("on").addEventListener("click", function () { closeSheet(); game.i++; setTimeout(next, 300); });
}

function most(list) {
  var c = {}, best = null;
  list.forEach(function (x) { c[x] = (c[x] || 0) + 1; if (!best || c[x] > c[best]) best = x; });
  return best;
}

function ending() {
  var stops = game.week.stops, n = stops.length;
  var yours = 0, mineTraits = [], agentTraits = [];
  stops.forEach(function (st, i) {
    var a = game.answers[i];
    if (a.same) { yours++; return; }
    mineTraits.push(st.options.filter(function (o) { return o.key === a.key; })[0].trait);
    agentTraits.push(st.options.filter(function (o) { return o.key === st.agent; })[0].trait);
  });
  var you = most(mineTraits), it = most(agentTraits);
  closeSheet();
  document.getElementById("hall").classList.add("glow");
  setTimeout(function () {
    finale.hidden = false;
    finale.innerHTML =
      '<div class="finale-card"><p class="kicker">Your town this week</p>' +
      '<div class="big">' + yours + "<span>/" + n + "</span></div>" +
      "<h1>choices were made <em>your way</em>.</h1>" +
      (you ? '<p class="insight">Where your agent drifted: it went for <strong>' + esc(it) + "</strong>. You'd go for <strong>" + esc(you) + "</strong>.</p>"
           : '<p class="insight">Your agent is choosing just like you would. That\'s the goal.</p>') +
      '<h3>What you got from this walk</h3><ul class="gains">' +
      "<li><span>🗣️</span><p>You can now explain all " + n + " big choices from your week, if anyone asks <em>why</em>.</p></li>" +
      "<li><span>🧭</span><p>" + (you ? "You found exactly where your agent stops thinking like you." : "You know your agent still thinks like you.") + "</p></li>" +
      "<li><span>🎯</span><p>You made " + n + " decisions yourself, in under 2 minutes. Your judgement stays sharp.</p></li></ul>" +
      (you ? '<button class="btn ghost" id="teach">Teach my agent: ' + esc(you) + " first</button>" : "") +
      '<p class="closing">Your agent saves your time.<br><em>My Week Town keeps your judgement.</em></p>' +
      (game.wi < WEEKS.length - 1 ? '<button class="btn" id="again">Walk next Sunday\'s town ▸</button>' : '<button class="btn" id="again">Start over</button>') +
      "</div>";
    var teach = document.getElementById("teach");
    if (teach) teach.addEventListener("click", function () {
      teach.disabled = true;
      teach.textContent = "✔ Done. When " + you + " is at stake, your agent asks you first.";
    });
    document.getElementById("again").addEventListener("click", function () { start(game.wi < WEEKS.length - 1 ? game.wi + 1 : 0); });
    finale.scrollTop = 0;
  }, reduceMotion ? 0 : 700);
}

start(0);
