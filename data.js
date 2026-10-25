// Cat Catch: sample data that stands in for the user's personal AI agent, plus the app's content.
var DATA_VERSION = 4; // bump when the sample data changes shape; old saved demo data is reset

// The 6 questions, one per everyday area. items = the options (each one is a priority); agent = the agent's starting picture of the user, most important first.
// act = how the agent's activity reads in the admin log.
var AREAS = {
  cab: { name: "Cab rides", about: "cab rides", place: "Cab stand", act: "Booked a cab",
    items: [["price", "Low price"], ["fast", "Quick pickup"], ["comfort", "Comfortable ride"], ["safety", "Safety"]], agent: ["price", "fast", "comfort", "safety"] },
  movies: { name: "Movies", about: "movie tickets", place: "Cinema", act: "Booked movie tickets",
    items: [["near", "Close and easy to reach"], ["luxury", "Luxury and comfort"], ["price", "Low price"], ["view", "Best view of the screen"]], agent: ["near", "price", "view", "luxury"] },
  icecream: { name: "Ice cream", about: "ice cream", place: "Ice cream cart", act: "Ordered ice cream",
    items: [["nosugar", "No sugar"], ["price", "Low price"], ["brand", "Trusted brand"], ["natural", "Natural flavours"]], agent: ["price", "brand", "natural", "nosugar"] },
  clothes: { name: "Clothes", about: "clothes shopping", place: "Clothes store", act: "Bought clothes",
    items: [["fit", "Comfortable fit"], ["brand", "Brand"], ["looks", "Looks and style"], ["price", "Price"], ["reviews", "Reviews"]], agent: ["price", "reviews", "brand", "looks", "fit"] },
  homeservice: { name: "Home services", about: "home services", place: "Helpers' corner", act: "Booked a home service",
    items: [["trusted", "Trusted provider"], ["price", "Affordable price"], ["reviews", "Good reviews"], ["eta", "Arrives soon"]], agent: ["eta", "price", "reviews", "trusted"] },
  day: { name: "Your day", about: "your day", place: "Town park", act: "Planned your day",
    items: [["balance", "Work-life balance"], ["health", "Health first"], ["productive", "Productive"], ["chill", "Chill"]], agent: ["productive", "balance", "chill", "health"] }
};

// The same 6 questions every game. The options are the area's items; the user ranks as many as they like, plus "Something else".
// "did" is a sample of what the agent did in that area (admin only).
var SCN = {
  CAB: { area: "cab", icon: "taxi", q: "Booking a cab. What matters most to you?", did: "Booked the cheapest cab, ₹180, with a 12-minute wait." },
  MOV: { area: "movies", icon: "clapper", q: "Booking movie tickets. What do you look for?", did: "Booked 2 seats at the nearest theatre, front rows." },
  ICE: { area: "icecream", icon: "icecream", q: "Ordering ice cream. What matters to you?", did: "Ordered a ₹99 tub, the cheapest one on offer." },
  CLO: { area: "clothes", icon: "shirt", q: "Shopping for clothes. What matters most?", did: "Bought a ₹699 shirt from the price-drop sale." },
  HOM: { area: "homeservice", icon: "toolbox", q: "Booking a home service (cleaning, plumber, repair). How do you choose?", did: "Booked the first cleaner who could come in 20 minutes." },
  DAY: { area: "day", icon: "sun", q: "How do you like your day to go?", did: "Packed your Tuesday with 7 meetings and a late work slot." }
};
Object.keys(SCN).forEach(function (id) { SCN[id].options = AREAS[SCN[id].area].items; AREAS[SCN[id].area].scn = id; });

// Icon library. For each question the model picks the closest key; FALLBACK_ICON when nothing fits.
var ICONS = {
  Shopping: { tv: "TV", laptop: "Laptop", phone: "Phone", headphone: "Headphones", camera: "Camera", watch: "Watch", glasses: "Glasses", cart: "Groceries", shirt: "Clothes", dress: "Fashion", sneaker: "Shoes", ring: "Jewellery", card: "Card payment" },
  Food: { takeout: "Takeaway", pizza: "Pizza", curry: "Indian meal", pasta: "Pasta", salad: "Healthy food", apple: "Fruit", coffee: "Coffee", cookie: "Snacks", cupcake: "Dessert", icecream: "Ice cream", cake: "Birthday cake", pan: "Cooking" },
  Travel: { plane: "Flight", train: "Train", bus: "Bus", taxi: "Cab", car: "Car", bicycle: "Bicycle", hotel: "Hotel", luggage: "Luggage", beach: "Beach trip", camping: "Camping", compass: "Directions", ticket: "Tickets" },
  Home: { home: "Home", sofa: "Sofa", bed: "Bed", chair: "Chair", bulb: "Lamp", lamp: "Decor", plant: "Plants", toolbox: "Repairs", wifi: "Wi-Fi" },
  People: { gift: "Gift", bouquet: "Flowers", letter: "Message", party: "Party", balloon: "Celebration", babybottle: "Baby", dog: "Pet", handshake: "Friends" },
  "Work and money": { briefcase: "Work", office: "Office", chart: "Investing", coin: "Savings", bank: "Bank", money: "Money", school: "Learning", books: "Books" },
  "Health and fun": { hospital: "Health", pill: "Medicine", clapper: "Movies", music: "Music", videogame: "Games", popcorn: "Fun night", sun: "Sunny day", umbrella: "Rainy day", calendar: "Plans" }
};
var FALLBACK_ICON = "sparkles";

// The cat's two voices. The admin picks one; the user page follows it.
var VOICES = {
  speaks: { name: "The cat speaks", openers: ["Hmm, I've been wondering…", "Quick question from me…", "Okay, I'm curious…", "Help me out here…", "Meow, one more thing…", "Tell me something…"] },
  narrator: { name: "Narrator", openers: ["The cat is curious…", "The cat tilts its head…", "The cat has a question…", "The cat is wondering…", "The cat looks puzzled…", "The cat leans in…"] }
};
var CAT_MATCH = ["I knew it!", "Called it! That's so you.", "Knew it. You're easy to read today.", "Yep, thought so!"];
var CAT_NEW = ["Ooh, noted!", "Interesting! Noted.", "Oh! I didn't see that coming.", "Hmm, good to know!"];

// What the agent did before the very first catch-up (placed in the last 7 days on first run).
var SEED = [
  { daysAgo: 6.2, routine: true, label: "Bills", did: "Paid the electricity bill, ₹2,140", skip: "Routine. Same as every month." },
  { daysAgo: 5.4, scn: "CAB", agentKey: "price" },
  { daysAgo: 4.8, routine: true, label: "Health", did: "Refilled your vitamin D tablets", skip: "Routine refill." },
  { daysAgo: 4.3, scn: "ICE", agentKey: "price" },
  { daysAgo: 3.6, scn: "MOV", agentKey: "near" },
  { daysAgo: 2.4, routine: true, label: "Work", did: "Moved 9 meetings and replied to 37 emails", skip: "Routine work admin." },
  { daysAgo: 1.8, scn: "HOM", agentKey: "eta" },
  { daysAgo: 0.6, routine: true, label: "Groceries", did: "Reordered the usual groceries, ₹1,850", skip: "Same list as last week." }
];

// New things the agent can "do" when the admin simulates fresh activity (it chooses by its current picture of the user).
var SIM = ["DAY", "CLO", "CAB", "ICE", "HOM", "MOV"];
var SIM_ROUTINE = [
  { label: "Bills", did: "Paid the phone bill, ₹799", skip: "Routine. Same as every month." },
  { label: "Work", did: "Summarised 3 work reports", skip: "Routine work admin." },
  { label: "Health", did: "Booked your 6-monthly dentist check-up", skip: "Routine." }
];

// Free, open-source models that run inside the browser (WebLLM). Downloaded once, then cached on the device.
var AI_MODELS = [
  { id: "Qwen2.5-0.5B-Instruct-q4f16_1-MLC", name: "Qwen 2.5 · 0.5B", size: "about 0.4 GB", note: "Smallest and fastest, simpler questions" },
  { id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC", name: "Qwen 2.5 · 1.5B", size: "about 1 GB", note: "Balanced (default)" },
  { id: "Llama-3.2-3B-Instruct-q4f16_1-MLC", name: "Llama 3.2 · 3B", size: "about 2 GB", note: "Best writing, slower, needs a stronger GPU" }
];

// The instructions the app's model follows. Admin only; editable like project instructions.
var MODEL = {
  intro: "Each time the user starts a game, a fresh AI model with no memory reads what the user's agent did since the last successful catch-up and prepares the questions. These are its instructions.",
  text: [
    "WHO YOU ARE",
    "- You prepare one short game in which a curious cat asks the user what matters to them.",
    "- You have no memory. You only see the agent's log since the last successful catch-up and the agent's current picture of the user.",
    "",
    "STEP 1: CATCH UP",
    "- Read only what the agent did after the last successful catch-up time.",
    "- Note which of the 6 areas the agent acted in: cab rides, movie tickets, ice cream, clothes shopping, home services, the user's day. Skip routine tasks.",
    "",
    "STEP 2: ORDER THE QUESTIONS",
    "- Always the same 6 questions, one per area.",
    "- Areas the agent acted in come first, oldest first. Then the rest, the ones asked longest ago first.",
    "",
    "STEP 3: ASK EACH QUESTION, AS THE CAT",
    "- Keep the question short and everyday. You may reword it, but keep its meaning and keep every option.",
    "- The user taps the options in order of what matters to them. Ranking is optional: one option, a few, or all.",
    "- The app adds \"Something else\" so the user can type their own priority and rank it too.",
    "- Never mention the AI agent in a question.",
    "- Pick one icon from the icon library. If nothing fits, use the fallback icon.",
    "",
    "STEP 4: AFTER THE ANSWER",
    "- Compare the user's ranking with the agent's order for that area.",
    "- Match: the user's #1 is the agent's #1, and the other options the user ranked come in the same order as the agent's. The cat cheers (\"I knew it!\").",
    "- No match: \"Ooh, noted! Should I let your AI know?\" Yes sends the user's ranking right away (ranked options first, the rest keep the agent's order). No keeps it private.",
    "- Show no other details about the agent.",
    "",
    "RULES",
    "- The user decides what goes to their agent. Never send anything on your own.",
    "- Light humour is good. Never mock, judge or guilt the user.",
    "- Plain, everyday English. Never suggest products, brands or shops."
  ].join("\n")
};
