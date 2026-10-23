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

// Each stop asks about YOU (never a fact you can't know): your priority, your reason, your feeling,
// or who should decide. Then it shows your agent's reason and compares.
// Option: k = key, t = text, me = what it says about you, fade = this answer shows the skill fading,
// fix = what you can tell your agent, fixed = what your agent will do next time.
var TYPES = {
  priority: "What matters to you",
  why: "Your reason",
  tradeoff: "Your trade-off",
  feel: "How you feel",
  who: "Who decides",
  self: "About you"
};

var WEEKS = [
  {
    label: "Sunday, 10 March 2040",
    stops: [
      { icon: "📺", place: "Electronics store", skill: "value", type: "priority",
        context: "Your old TV broke. On Tuesday, your agent bought a 55-inch TV for ₹45,000.",
        question: "When you buy a TV, what matters most to you?",
        agent: "price", reason: "It was the best deal: ₹6,000 below the usual price.",
        options: [
          { k: "picture", t: "A great picture, even if it costs more", me: "Picture quality over price",
            fix: "For TVs, picture quality comes first", fixed: "It will show you the best-picture option before buying." },
          { k: "price", t: "The best price for a decent TV", me: "A good deal on big buys" },
          { k: "lasts", t: "A brand that lasts for years", me: "Things that last",
            fix: "For big buys, pick brands that last", fixed: "It will weigh how long things last, not just the deal." },
          { k: "unsure", t: "I'm not sure. I've never really thought about it", fade: true }
        ],
        tip: "Before your agent buys something big, write down what matters most to you." },

      { icon: "🛋️", place: "Furniture market", skill: "taste", type: "tradeoff",
        context: "Your agent had two sofas to choose from: a grey one on sale for ₹35,000, or a solid wood one for ₹42,000 that lasts 15 years. It ordered the grey one.",
        question: "Why would you pick one over the other?",
        agent: "save", reason: "It saved ₹7,000 and arrives this week.",
        options: [
          { k: "save", t: "Saving ₹7,000 matters more right now", me: "Saving now over the long run" },
          { k: "last", t: "I'd rather pay more for one that lasts", me: "Paying more for things that last",
            fix: "I'd pay a bit more for things that last", fixed: "It will check with you before choosing a sale over quality." },
          { k: "look", t: "I'd pick the one I like the look of", me: "How things look and feel at home",
            fix: "Show me how home things look before buying", fixed: "It will show you photos of home items before ordering." },
          { k: "unsure", t: "Honestly, I don't know what I'd like", fade: true }
        ],
        tip: "Pick one thing for your home yourself this week." },

      { icon: "🎂", place: "Mom's house", skill: "memory", type: "self",
        context: "Mom's birthday was on Friday. Your agent reminded you that morning, sent her a wish and booked her dinner.",
        question: "Did you remember her birthday before your agent told you?",
        reason: "It reminds you of every family birthday on the day.",
        options: [
          { k: "yes", t: "Yes, I knew it was coming", me: "Family dates matter to you" },
          { k: "month", t: "I knew it was this month, not the day", fade: true,
            fix: "Remind me a week early, I'll plan it", fixed: "It will remind you a week before, so you plan it yourself." },
          { k: "no", t: "No, I'd forgotten", fade: true,
            fix: "Remind me a week early, I'll plan it", fixed: "It will remind you a week before, so you plan it yourself." }
        ],
        tip: "Remember one birthday yourself, without your agent." },

      { icon: "🏦", place: "Bank", skill: "money", type: "feel",
        context: "Your agent paid for 14 food orders this week: ₹6,800 in total, mostly late at night.",
        question: "Seeing ₹6,800 on food, how do you feel?",
        agent: "fine", reason: "It ordered whenever you were still working after 8 pm.",
        options: [
          { k: "fine", t: "That's fine. Food on busy days is worth it to me", me: "Comfort on busy days" },
          { k: "much", t: "That's more than I want to spend", me: "Keeping food spending in check",
            fix: "Tell me when food crosses ₹4,000 a week", fixed: "It will tell you when food spending crosses ₹4,000 a week." },
          { k: "surprised", t: "I had no idea I spent that much", fade: true,
            fix: "Show me my spending every Sunday", fixed: "It will show you a one-line spending summary every Sunday." }
        ],
        tip: "Look at your week's spending for one minute every Sunday." },

      { icon: "🏢", place: "Your office", skill: "questioning", type: "priority",
        context: "Your project has a fixed launch date. Your agent signed Vendor B: ₹40,000 cheaper, but it missed 2 deadlines last year.",
        question: "At work, what matters more to you here?",
        agent: "save", reason: "It saved ₹40,000 on the project budget.",
        options: [
          { k: "save", t: "Saving money, I'd take the risk", me: "Budget over risk at work" },
          { k: "deadline", t: "Meeting the deadline, even if it costs more", me: "Deadlines over savings at work",
            fix: "At work, deadlines come before savings", fixed: "It will flag deadline risks to you before signing." },
          { k: "ask", t: "I'd ask Vendor B about the missed deadlines first", me: "Asking before deciding",
            fix: "Check with me before signing vendors", fixed: "It will bring you the questions to ask before signing." },
          { k: "unsure", t: "I'd just trust my agent's pick", fade: true }
        ],
        tip: "When your agent says \"cheaper\", ask what the catch is." },

      { icon: "💌", place: "Post office", skill: "people", type: "why",
        context: "It was your best friend Arjun's birthday. Your agent sent him a message at midnight so you wouldn't miss it.",
        question: "For a close friend's birthday, what matters to you?",
        agent: "time", reason: "Sending it on time, so you never miss a birthday.",
        options: [
          { k: "time", t: "That it's sent on time, it doesn't matter who writes it", me: "Never missing a date" },
          { k: "write", t: "That I write it myself", me: "Your own words for close friends",
            fix: "Let me write wishes for close friends", fixed: "It will remind you, and you'll write the message." },
          { k: "call", t: "A call would mean more than a message", me: "Hearing a friend's voice",
            fix: "Remind me to call close friends on birthdays", fixed: "It will remind you to call close friends on their birthday." },
          { k: "unsure", t: "I've never really thought about it", fade: true }
        ],
        tip: "Write one message to a friend yourself this week." }
    ]
  },
  {
    label: "Sunday, 17 March 2040",
    stops: [
      { icon: "🪔", place: "Craft market", skill: "bargain", type: "why",
        context: "A seller asked ₹2,400 for a handmade lamp. Similar lamps sell for ₹1,600 to ₹2,000. Your agent paid the full price.",
        question: "What would you have done, and why?",
        agent: "full", reason: "It paid quickly to save you time.",
        options: [
          { k: "offer", t: "Offered ₹1,800. A fair price matters to me", me: "Paying a fair price",
            fix: "Let me make the offer on handmade things", fixed: "It will let you bargain next time." },
          { k: "full", t: "Paid in full. I like supporting the maker", me: "Supporting small makers" },
          { k: "shy", t: "Paid, because I'd feel awkward asking", fade: true,
            fix: "Let me try asking once next time", fixed: "It will step back and let you ask for the price yourself." },
          { k: "unsure", t: "I'd let my agent handle it", fade: true }
        ],
        tip: "Ask for a better price once this week, in person." },

      { icon: "✈️", place: "Airport", skill: "problems", type: "priority",
        context: "Your 7 am flight to Delhi was cancelled. Your agent rebooked you on the 2 pm flight, the cheapest one left.",
        question: "When a plan breaks, what matters most to you?",
        agent: "cheap", reason: "It picked the cheapest seat left.",
        options: [
          { k: "early", t: "Getting there early, even if it costs more", me: "Time over money when plans break",
            fix: "When plans break, time comes before price", fixed: "It will pick the earliest option when plans break." },
          { k: "cheap", t: "Paying the least", me: "Saving money, even in a rush" },
          { k: "myself", t: "Sorting it out myself at the desk", me: "Handling problems yourself",
            fix: "Let me handle it when I'm there", fixed: "It will tell you your options and let you choose." },
          { k: "unsure", t: "I wouldn't know what to do", fade: true }
        ],
        tip: "Sort out one small problem this week without your agent." },

      { icon: "🍝", place: "Restaurant street", skill: "newthings", type: "why",
        context: "Your agent booked your usual Italian place for Friday dinner, for the 9th time this year.",
        question: "Why do you keep going back there?",
        agent: "love", reason: "You rated it 5 stars, so it books it again.",
        options: [
          { k: "love", t: "I love it. It's my comfort place", me: "Comfort and favourites" },
          { k: "easy", t: "Honestly, it's just easy", fade: true,
            fix: "Mix in a new place once a month", fixed: "It will suggest one new place a month." },
          { k: "new", t: "I'd rather try somewhere new", me: "Trying new things",
            fix: "Mix in a new place once a month", fixed: "It will suggest one new place a month." },
          { k: "unsure", t: "I didn't know it was the 9th time", fade: true }
        ],
        tip: "Try one new place, dish or route this week." },

      { icon: "🍳", place: "Your kitchen", skill: "daily", type: "who",
        context: "This week your agent booked 6 cabs, ordered 11 meals and did your grocery shopping.",
        question: "Which of these do you still want to do yourself?",
        agent: "none", reason: "It does everything so you get more free time.",
        options: [
          { k: "cook", t: "Cook a meal now and then", me: "Cooking for yourself",
            fix: "Leave one dinner a week for me to cook", fixed: "It will leave one dinner a week for you to cook." },
          { k: "shop", t: "Pick my own groceries", me: "Choosing your own food",
            fix: "Let me pick the groceries", fixed: "It will make the list, and you'll pick the groceries." },
          { k: "none", t: "None, I'm happy it's all done for me", fade: true },
          { k: "unsure", t: "I'm not sure I still could", fade: true,
            fix: "Leave one dinner a week for me to cook", fixed: "It will leave one dinner a week for you to cook." }
        ],
        tip: "Cook one simple meal yourself this week." },

      { icon: "📶", place: "Your home Wi-Fi", skill: "thinking", type: "who",
        context: "Your Wi-Fi stopped working on Wednesday. Your agent fixed it in 2 minutes.",
        question: "Next time something breaks at home, what would you want?",
        agent: "fix", reason: "It fixes things fast and doesn't bother you.",
        options: [
          { k: "explain", t: "Fix it, then tell me what broke and why", me: "Understanding how things work",
            fix: "Tell me what you fixed and why", fixed: "It will explain each fix in one line." },
          { k: "try", t: "Let me try for 5 minutes first", me: "Figuring things out yourself",
            fix: "Give me 5 minutes to try first", fixed: "It will give you 5 minutes to try before it steps in." },
          { k: "fix", t: "Just fix it. I don't need to know", fade: true }
        ],
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
    '<span class="qtype">' + esc(TYPES[st.type]) + "</span>" +
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
  el.querySelector(".badge").textContent = strong ? "✨" : "☁️";

  // Your reason next to your agent's reason
  var same = st.agent && key === st.agent;
  var compare = '<div class="why"><div><small>You</small><p>' + esc(o.me || o.t) + "</p></div>" +
    "<div><small>Your agent</small><p>" + esc(st.reason) + "</p></div></div>" +
    (st.agent ? '<p class="match">' + (same ? "✔ Your agent chose for the same reason as you." : "Your agent chose for a different reason.") + "</p>" : "");

  var s = SKILLS[st.skill];
  var verdict = '<div class="verdict ' + (strong ? "ok" : "fade") + '"><span class="vi">' + s.part + "</span><div><b>" + esc(s.name) + "</b><span>" +
    (strong ? "Still strong. You know what you want here." : "Starting to fade. Your agent is doing this for you.") + "</span></div></div>";
  var fix = o.fix
    ? '<div class="fixbox" id="fixbox"><p>Want your agent to do it your way?</p>' +
      '<button class="btn soft" id="fix">✋ Tell my agent: ' + esc(o.fix) + "</button></div>"
    : "";
  var last = i === game.week.stops.length - 1;
  openSheet(place(st, i) + compare + verdict + fix +
    '<button class="btn" id="on">' + (last ? "Walk to the town hall" : "Keep walking") + "</button>");
  var fb = document.getElementById("fix");
  if (fb) fb.addEventListener("click", function () {
    game.results[i].fixed = o.fixed;
    document.getElementById("fixbox").innerHTML = '<p class="done">✔ Told your agent. ' + esc(o.fixed) + "</p>";
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
      (r.some(function (x) { return x.me; }) ? '<h3>What you said matters to you</h3><ul class="gains">' +
        r.filter(function (x) { return x.me; }).map(function (x) { return "<li>💭 " + esc(x.me) + "</li>"; }).join("") + "</ul>" : "") +
      (fixed.length ? '<h3>You told your agent</h3><ul class="fixed">' + fixed.map(function (x) { return "<li>✋ " + esc(x.fixed.replace(/^It will/, "Your agent will")) + "</li>"; }).join("") + "</ul>" : "") +
      '<h3>What you got from this walk</h3><ul class="gains">' +
      "<li>🗣️ You know why your agent did all " + n + " things this week, and whether that's your reason too.</li>" +
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
