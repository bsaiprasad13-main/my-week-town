// Weekly Why Cards: a guided prototype of one Sunday check-in in 2040.
// Not a full product. Sample data stands in for the user's AI agent.

// What people look at when they choose
var CRITERIA = {
  quality:      { label: "Best quality",          icon: "💎" },
  fair_price:   { label: "Fair, mid-range price", icon: "⚖️" },
  lowest_price: { label: "Lowest price",          icon: "🏷️" },
  discount:     { label: "Biggest discount",      icon: "💸" },
  reliability:  { label: "Reliability",           icon: "🛡️" },
  safety:       { label: "Safety",                icon: "🦺" },
  reviews:      { label: "Good reviews",          icon: "⭐" },
  brand:        { label: "Well-known brand",      icon: "™️" },
  speed:        { label: "Speed",                 icon: "⚡" }
};

// Three of last week's big choices, as the agent reported them
var CARDS = [
  {
    icon: "📺", title: "Bought a 55-inch TV", meta: "₹45,000 · you approved it in 2 seconds",
    asker: "Your partner", question: "Why this TV?",
    agentTop: "discount", agentAlso: ["brand", "reviews"],
    agentNote: "It was 30% off. A better-reviewed model cost ₹6,000 more.",
    options: ["quality", "discount", "reviews"]
  },
  {
    icon: "🏢", title: "Picked Vendor B for the office project", meta: "₹5,00,000 · decided by your agent",
    asker: "Your boss", question: "Why Vendor B?",
    agentTop: "lowest_price", agentAlso: ["speed"],
    agentNote: "Vendor B was ₹40,000 cheaper. Vendor A has never missed a deadline.",
    options: ["reliability", "lowest_price", "reviews"]
  },
  {
    icon: "🩺", title: "Renewed the family health insurance", meta: "₹18,000 · auto-renewed by your agent",
    asker: "Your mom", question: "Why stay with this insurer?",
    agentTop: "reliability", agentAlso: ["reviews"],
    agentNote: "It settles claims the fastest, even though it costs ₹2,000 more.",
    options: ["lowest_price", "reliability", "brand"]
  }
];

// Words that count as each criterion when typed in "Something else"
var WORDS = {
  quality: ["quality", "well made", "durable", "lasts", "better made"],
  fair_price: ["mid range", "mid-range", "fair price", "reasonable", "value for money"],
  lowest_price: ["cheap", "cheapest", "lowest", "less money", "budget", "cost less"],
  discount: ["discount", "sale", "offer", "deal", "% off", "off"],
  reliability: ["reliab", "never late", "on time", "deadline", "trust", "claims", "dependable"],
  safety: ["safe", "safety", "secure"],
  reviews: ["review", "rating", "stars", "recommended"],
  brand: ["brand", "famous", "known"],
  speed: ["fast", "quick", "speed", "sooner"]
};
function matchTyped(text) {
  var t = text.toLowerCase();
  return Object.keys(WORDS).filter(function (k) { return WORDS[k].some(function (w) { return t.indexOf(w) !== -1; }); });
}

var state = { step: 0, priorities: [], answers: [], told: false };
var screen = document.getElementById("screen");

function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function crit(k) { return CRITERIA[k] ? CRITERIA[k].icon + " " + CRITERIA[k].label : k; }
function go(step) { state.step = step; render(); window.scrollTo(0, 0); }

// Steps: 0 intro · 1 priorities · 2 check-in · 3–5 cards · 6 report · 7 four weeks later
var TOTAL = 7;

function render() {
  document.getElementById("bar").style.width = Math.round(state.step / TOTAL * 100) + "%";
  var s = state.step;
  if (s === 0) intro();
  else if (s === 1) priorities();
  else if (s === 2) checkin();
  else if (s >= 3 && s <= 5) card(s - 3);
  else if (s === 6) report();
  else later();
}

function intro() {
  screen.innerHTML =
    '<section class="hero">' +
    '<p class="kicker">It\'s 2040</p>' +
    "<h1>Your agent makes your choices.<br><em>Do you still know why?</em></h1>" +
    '<p class="lead">Your AI agent shops, books and decides for you, and it\'s usually right. But one day someone asks <strong>"why did you choose this?"</strong> and you have no answer.</p>' +
    '<div class="promise"><span>☕</span><p><strong>Every Sunday, 3 cards. 2 minutes.</strong><br>See why your agent chose what it chose, and whether it chose <em>your</em> way.</p></div>' +
    '<button class="btn" data-next>Let\'s begin</button></section>';
}

function priorities() {
  var picked = state.priorities;
  var chips = Object.keys(CRITERIA).map(function (k) {
    var n = picked.indexOf(k);
    return '<button type="button" class="chip' + (n !== -1 ? " on" : "") + '" data-c="' + k + '">' +
      (n !== -1 ? '<b class="rank">' + (n + 1) + "</b>" : "") + crit(k) + "</button>";
  }).join("");
  screen.innerHTML =
    '<p class="kicker">Step 1 · Once</p>' +
    "<h2>How do <em>you</em> choose?</h2>" +
    '<p class="lead">Tap the <strong>3 things that matter most</strong> to you, in order. This is your yardstick for every choice your agent makes.</p>' +
    '<div class="chips">' + chips + "</div>" +
    '<p class="hint">' + (picked.length < 3 ? "Pick " + (3 - picked.length) + " more" : "Your yardstick: " + picked.map(function (k) { return CRITERIA[k].label; }).join(" → ")) + "</p>" +
    '<button class="btn" data-next' + (picked.length < 3 ? " disabled" : "") + ">Save my priorities</button>";
  screen.querySelectorAll("[data-c]").forEach(function (b) {
    b.addEventListener("click", function () {
      var k = b.getAttribute("data-c"), i = picked.indexOf(k);
      if (i !== -1) picked.splice(i, 1); else if (picked.length < 3) picked.push(k);
      render();
    });
  });
}

function checkin() {
  var list = CARDS.map(function (c) { return "<li><span>" + c.icon + "</span>" + esc(c.title) + "</li>"; }).join("");
  screen.innerHTML =
    '<p class="kicker">Step 2 · Sunday check-in</p>' +
    "<h2>Last week, your agent made <em>8 big choices</em> for you.</h2>" +
    '<p class="lead">You approved most of them in seconds. Here are 3 worth a second look.</p>' +
    '<ul class="preview">' + list + "</ul>" +
    '<button class="btn" data-next>Start the cards</button>';
}

function card(i) {
  var c = CARDS[i], a = state.answers[i];
  var head = '<p class="kicker">Card ' + (i + 1) + " of " + CARDS.length + "</p>" +
    '<div class="decision"><span class="d-ico">' + c.icon + "</span><div><h2>" + esc(c.title) + '</h2><p class="meta">' + esc(c.meta) + "</p></div></div>" +
    '<p class="asks"><span>' + esc(c.asker) + " asks</span>“" + esc(c.question) + "”</p>";

  if (!a) {
    screen.innerHTML = head + '<p class="q">Why do you think your agent picked it?</p><div class="options">' +
      c.options.map(function (k) { return '<button type="button" class="opt" data-k="' + k + '">' + crit(k) + "</button>"; }).join("") +
      '<button type="button" class="opt other" id="other">✏️ Something else</button>' +
      '<div class="other-box" id="box" hidden><input id="txt" type="text" placeholder="In your own words" aria-label="In your own words"><button class="btn small" id="send">OK</button></div>' +
      '<button type="button" class="opt unsure" data-k="unsure">🤷 Not sure</button></div>';
    screen.querySelectorAll("[data-k]").forEach(function (b) {
      b.addEventListener("click", function () { state.answers[i] = { pick: b.getAttribute("data-k") }; render(); });
    });
    screen.querySelector("#other").addEventListener("click", function () { screen.querySelector("#box").hidden = false; screen.querySelector("#txt").focus(); });
    screen.querySelector("#send").addEventListener("click", function () {
      var t = screen.querySelector("#txt").value.trim();
      // A typed reason that names the agent's real criterion counts as knowing why
      if (t) { state.answers[i] = { pick: matchTyped(t).indexOf(c.agentTop) !== -1 ? c.agentTop : "other", text: t }; render(); }
    });
    return;
  }

  // Reveal: did I know why? Was it chosen my way?
  var knew = a.pick === c.agentTop;
  var myWay = state.priorities.indexOf(c.agentTop) !== -1;
  var mine = a.pick === "unsure" ? "Not sure" : a.text ? "“" + a.text + "”" : crit(a.pick);
  screen.innerHTML = head +
    '<div class="reveal">' +
    '<div class="row2"><div><span class="lbl">You thought</span>' + esc(mine) + '</div><div><span class="lbl">Your agent actually looked at</span><strong>' + crit(c.agentTop) + "</strong></div></div>" +
    '<p class="note">' + esc(c.agentNote) + "</p>" +
    '<div class="verdicts">' +
    '<div class="v ' + (knew ? "good" : "warn") + '"><span>' + (knew ? "✅" : "❔") + "</span><p><strong>" + (knew ? "You knew why." : "You didn't know why.") + "</strong>" +
    (knew ? " You could explain this one." : " Now you can.") + "</p></div>" +
    '<div class="v ' + (myWay ? "good" : "warn") + '"><span>' + (myWay ? "🤝" : "⚠️") + "</span><p><strong>" + (myWay ? "Chosen your way." : "Not your way.") + "</strong> " +
    (myWay ? CRITERIA[c.agentTop].label + " is one of your top 3." : "You go by " + CRITERIA[state.priorities[0]].label.toLowerCase() + "; your agent went by " + CRITERIA[c.agentTop].label.toLowerCase() + ".") + "</p></div>" +
    "</div></div>" +
    '<button class="btn" data-next>' + (i < CARDS.length - 1 ? "Next card →" : "See my Sunday report") + "</button>";
}

function report() {
  var knew = 0, myWay = 0, off = [];
  CARDS.forEach(function (c, i) {
    if (state.answers[i] && state.answers[i].pick === c.agentTop) knew++;
    if (state.priorities.indexOf(c.agentTop) !== -1) myWay++; else off.push(c);
  });
  var top = CRITERIA[state.priorities[0]].label;
  var offNames = off.map(function (c) { return CRITERIA[c.agentTop].label.toLowerCase(); })
    .filter(function (n, i, a) { return a.indexOf(n) === i; });
  var offText = offNames.length > 1 ? offNames.slice(0, -1).join(", ") + " and " + offNames[offNames.length - 1] : offNames[0];
  var insight = off.length
    ? "Your agent leaned on <strong>" + offText + "</strong>, while you care most about <strong>" + top.toLowerCase() + "</strong>."
    : "Your agent is choosing the way you would. Keep checking in.";
  var rows = CARDS.map(function (c, i) {
    var k = state.answers[i] && state.answers[i].pick === c.agentTop, w = state.priorities.indexOf(c.agentTop) !== -1;
    return "<li><span>" + c.icon + "</span><div><strong>" + esc(c.title) + "</strong><small>Agent went by " + CRITERIA[c.agentTop].label.toLowerCase() + "</small></div><em>" + (k ? "✅" : "❔") + (w ? "🤝" : "⚠️") + "</em></li>";
  }).join("");
  screen.innerHTML =
    '<p class="kicker">Your Sunday report</p>' +
    '<div class="scores"><div><b>' + knew + "<i>/3</i></b><span>You knew <em>why</em></span></div><div><b>" + myWay + "<i>/3</i></b><span>Chosen <em>your way</em></span></div></div>" +
    '<p class="insight">' + insight + "</p>" +
    '<ul class="summary">' + rows + "</ul>" +
    (off.length ? '<button class="btn ghost" id="tell"' + (state.told ? " disabled" : "") + ">" + (state.told ? "✔ Your agent now knows: " + esc(top) + " comes first" : "Remind my agent: " + esc(top) + " comes first") + "</button>" : "") +
    '<button class="btn" data-next>See what changes in 4 weeks</button>';
  var tell = screen.querySelector("#tell");
  if (tell) tell.addEventListener("click", function () { state.told = true; render(); });
}

function later() {
  // Illustrative: awareness over 4 weekly check-ins
  var vals = [33, 50, 67, 100], W = 300, H = 150;
  var pts = vals.map(function (v, i) { return [30 + i * 85, H - 20 - v * 1.1]; });
  var path = pts.map(function (p, i) { return (i ? "L" : "M") + p[0] + " " + p[1]; }).join(" ");
  var svg = '<svg viewBox="0 0 ' + W + " " + H + '" class="chart" role="img" aria-label="Awareness rising from 33% to 100% over 4 weeks"><path d="' + path + '" class="ln"/>' +
    pts.map(function (p, i) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="5" class="pt"/><text x="' + (p[0] - 12) + '" y="' + (p[1] - 10) + '">' + vals[i] + '%</text><text x="' + (p[0] - 12) + '" y="' + (H - 2) + '">Wk ' + (i + 1) + "</text>"; }).join("") + "</svg>";
  screen.innerHTML =
    '<p class="kicker">4 Sundays later</p>' +
    "<h2>You know the <em>why</em> again.</h2>" +
    '<p class="lead">Each week, the cards focus on where you lost track. Slowly, you stop just approving and start understanding.</p>' + svg +
    '<p class="caption">Your awareness: the share of big choices whose reason you knew.</p>' +
    '<blockquote>Your agent saves your time.<br><em>Weekly Why Cards keeps your judgement.</em></blockquote>' +
    '<button class="btn ghost" id="restart">Start again</button>';
  screen.querySelector("#restart").addEventListener("click", function () { state = { step: 0, priorities: [], answers: [], told: false }; render(); });
}

screen.addEventListener("click", function (e) {
  var b = e.target.closest("[data-next]");
  if (b && !b.disabled) go(state.step + 1);
});

render();
