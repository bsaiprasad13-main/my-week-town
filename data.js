// My Week Town: sample data that stands in for the user's personal AI agent, plus the app's content.
var DATA_VERSION = 3; // bump when the sample data changes shape; old saved demo data is reset

// Everyday areas. items = the priorities behind each choice; agent = the agent's starting picture of the user, most important first.
var AREAS = {
  food: { name: "Dinner", about: "food on busy days", place: "Food street",
    items: [["fast", "Fast"], ["healthy", "Healthy"], ["cheap", "Cheap"], ["taste", "Taste"]], agent: ["fast", "cheap", "taste", "healthy"] },
  groceries: { name: "Groceries", about: "groceries", place: "Grocery market",
    items: [["quick", "Quick delivery"], ["price", "Price"], ["fresh", "Freshness"], ["brand", "Brands I trust"]], agent: ["price", "quick", "brand", "fresh"] },
  commute: { name: "Commute", about: "getting around", place: "Bus stop",
    items: [["fast", "Getting there fast"], ["cheap", "Saving money"], ["comfy", "Comfort"], ["green", "Greener ways"]], agent: ["cheap", "fast", "comfy", "green"] },
  weekend: { name: "Weekends", about: "free time", place: "Weekend park",
    items: [["rest", "Rest"], ["friends", "Friends"], ["family", "Family"], ["new", "Something new"]], agent: ["rest", "family", "friends", "new"] },
  chores: { name: "Chores", about: "chores", place: "Home corner",
    items: [["time", "Saving time"], ["save", "Saving money"], ["self", "Doing it myself"], ["quality", "Done really well"]], agent: ["time", "save", "quality", "self"] },
  fitness: { name: "Workouts", about: "staying fit", place: "Gym",
    items: [["health", "Health"], ["rest", "Rest"], ["social", "Company"], ["cost", "Cost"]], agent: ["rest", "cost", "health", "social"] },
  gifts: { name: "Gifts", about: "gifts", place: "Gift shop",
    items: [["time", "Arrives on time"], ["personal", "Personal touch"], ["price", "Price"], ["useful", "Useful"]], agent: ["time", "price", "useful", "personal"] }
};

// Everyday situations where one decision shows a clear priority. Each option maps to one priority (its key).
// "did" is what the agent did when it faced this situation (admin only).
var SCN = {
  F1: { area: "food", icon: "curry", q: "It's 9:30 pm and you're starving after a long day. What do you order?",
    options: [["fast", "Biryani, here in 15 minutes"], ["healthy", "Dal-rice and salad, in 40 minutes"], ["cheap", "Whatever is cheapest tonight"], ["taste", "My favourite place, even if it takes an hour"]],
    did: "Ordered biryani from the fastest place, ₹420." },
  F2: { area: "food", icon: "salad", q: "Lunch break: 30 minutes, then a meeting. What do you grab?",
    options: [["fast", "Whatever is quickest nearby"], ["healthy", "A salad bowl, even with a queue"], ["cheap", "Office canteen, ₹60"], ["taste", "The good dosa place, and rush back"]],
    did: "Sent a sandwich to your desk." },
  F3: { area: "food", icon: "pan", q: "Sunday dinner at home. What's the plan?",
    options: [["taste", "Order from my favourite place"], ["healthy", "Cook something light"], ["cheap", "Leftovers, zero spend"], ["fast", "Order the fastest thing"]],
    did: "Ordered the fastest option." },
  G1: { area: "groceries", icon: "cart", q: "Milk and veggies are running out. When should they come?",
    options: [["quick", "In 10 minutes, with a ₹49 fee"], ["price", "Tomorrow morning, free"], ["fresh", "I'll pick them at the market myself"], ["brand", "Whenever my usual brands are in stock"]],
    did: "Scheduled them for tomorrow to skip the ₹49 fee." },
  G2: { area: "groceries", icon: "apple", q: "The mangoes look a bit tired today. What do you do?",
    options: [["fresh", "Pay more for the fresh farm box"], ["price", "Take the discounted ones"], ["quick", "Whatever comes fastest"], ["brand", "Only from the store I trust"]],
    did: "Bought the discounted mangoes." },
  G3: { area: "groceries", icon: "cart", q: "Your usual rice brand is out of stock. Now what?",
    options: [["brand", "Wait until it's back"], ["price", "Grab the cheapest one"], ["fresh", "Try a fresher local one"], ["quick", "Whatever can arrive today"]],
    did: "Picked the cheapest one." },
  C1: { area: "commute", icon: "taxi", q: "Monday, 8:40 am, and you're a bit late. How do you get to work?",
    options: [["fast", "Cab: 25 minutes, ₹320"], ["cheap", "Metro: 35 minutes, ₹40"], ["comfy", "Wait for an AC cab with space"], ["green", "Bike-share, I'll sweat a little"]],
    did: "Booked the metro to save ₹280." },
  C2: { area: "commute", icon: "umbrella", q: "It's pouring, and the office is 3 km away. How do you go?",
    options: [["comfy", "A cab, I want to stay dry"], ["cheap", "Bus, it's ₹15"], ["fast", "Whatever leaves first"], ["green", "Walk with an umbrella"]],
    did: "Booked a shared cab." },
  C3: { area: "commute", icon: "train", q: "Friday evening, heading home, and cabs cost double. What do you do?",
    options: [["cheap", "Metro, skip the surge"], ["fast", "Pay double, I want to get home"], ["comfy", "Wait 30 minutes for normal prices"], ["green", "Cycle home"]],
    did: "Waited for normal prices." },
  W1: { area: "weekend", icon: "sun", q: "Free Saturday! Friends want brunch, family wants lunch, and you're tired. What wins?",
    options: [["rest", "Sleep in, cancel everything"], ["friends", "Brunch with friends"], ["family", "Lunch with family"], ["new", "That new trek everyone talks about"]],
    did: "Kept your Saturday empty." },
  W2: { area: "weekend", icon: "popcorn", q: "Sunday evening and nothing's planned. What sounds best?",
    options: [["rest", "Couch and a movie"], ["friends", "Call friends over"], ["family", "Visit family"], ["new", "A class I've never tried"]],
    did: "Queued a movie for you." },
  W3: { area: "weekend", icon: "camping", q: "A long weekend is coming. What do you want from it?",
    options: [["new", "Somewhere I've never been"], ["rest", "Stay home and recharge"], ["family", "Time with my parents"], ["friends", "A trip with friends"]],
    did: "Planned a quiet weekend at home." },
  H1: { area: "chores", icon: "home", q: "The laundry pile is huge. What do you do?",
    options: [["time", "Pickup service today, ₹250"], ["save", "Run the machine tonight"], ["self", "Do it on Sunday, I like the routine"], ["quality", "The good dry cleaner, ₹600"]],
    did: "Booked laundry pickup for ₹250." },
  H2: { area: "chores", icon: "toolbox", q: "The kitchen tap is dripping. How do you handle it?",
    options: [["time", "A plumber today, ₹400"], ["save", "Leave it, it's just a drip"], ["self", "Watch a video and fix it myself"], ["quality", "The best-rated plumber, even next week"]],
    did: "Booked the first available plumber, ₹400." },
  H3: { area: "chores", icon: "plant", q: "Weekly cleaning: how should it happen?",
    options: [["time", "Hire help, 2 hours, ₹500"], ["save", "Do it myself, save the money"], ["self", "Do it myself, it calms me"], ["quality", "A deep-clean service once a month"]],
    did: "Booked weekly cleaning help." },
  X1: { area: "fitness", icon: "sneaker", q: "6 am alarm. Gym or sleep?",
    options: [["health", "Gym, I'll feel better after"], ["rest", "Sleep, I need it"], ["social", "Only if my friend comes too"], ["cost", "Skip the gym, run outside for free"]],
    did: "Snoozed your alarm." },
  X2: { area: "fitness", icon: "sneaker", q: "Starting a new fitness plan this month. Which one?",
    options: [["health", "A trainer, even if it's pricey"], ["social", "A group class with friends"], ["cost", "Free home workouts"], ["rest", "Just evening walks, no pressure"]],
    did: "Picked free home workouts." },
  T1: { area: "gifts", icon: "gift", q: "Arjun's birthday is tomorrow. Which gift?",
    options: [["time", "A ₹1,200 mug that arrives on time"], ["personal", "A handmade photo book, 2 days late"], ["price", "Something under ₹500"], ["useful", "Something he actually needs"]],
    did: "Ordered the mug that arrives on time." },
  T2: { area: "gifts", icon: "bouquet", q: "Mom's anniversary is next week. What do you give?",
    options: [["personal", "A letter I write myself"], ["useful", "Something she'll use every day"], ["price", "A small sweet treat"], ["time", "Flowers, delivered on the day"]],
    did: "Scheduled flowers for the day." }
};

// Icon library. For each question the model picks the closest key; FALLBACK_ICON when nothing fits.
var ICONS = {
  Shopping: { tv: "TV", laptop: "Laptop", phone: "Phone", headphone: "Headphones", camera: "Camera", watch: "Watch", glasses: "Glasses", cart: "Groceries", shirt: "Clothes", sneaker: "Shoes", ring: "Jewellery", card: "Card payment" },
  Food: { takeout: "Takeaway", pizza: "Pizza", curry: "Indian meal", pasta: "Pasta", salad: "Healthy food", apple: "Fruit", coffee: "Coffee", cookie: "Snacks", cupcake: "Dessert", cake: "Birthday cake", pan: "Cooking" },
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
  { daysAgo: 5.4, scn: "C1", agentKey: "cheap" },
  { daysAgo: 4.8, routine: true, label: "Health", did: "Refilled your vitamin D tablets", skip: "Routine refill." },
  { daysAgo: 4.3, scn: "G1", agentKey: "price" },
  { daysAgo: 3.6, scn: "T1", agentKey: "time" },
  { daysAgo: 2.4, routine: true, label: "Work", did: "Moved 9 meetings and replied to 37 emails", skip: "Routine work admin." },
  { daysAgo: 1.8, scn: "H1", agentKey: "time" },
  { daysAgo: 1.1, scn: "F1", agentKey: "fast" },
  { daysAgo: 0.6, routine: true, label: "Groceries", did: "Reordered the usual groceries, ₹1,850", skip: "Same list as last week." }
];

// New things the agent can "do" when the admin simulates fresh activity (it chooses by its current picture of the user).
var SIM = ["X1", "F2", "C2", "W1", "G2", "H2", "T2", "W2"];
var SIM_ROUTINE = [
  { label: "Bills", did: "Paid the phone bill, ₹799", skip: "Routine. Same as every month." },
  { label: "Work", did: "Summarised 3 work reports", skip: "Routine work admin." },
  { label: "Health", did: "Booked your 6-monthly dentist check-up", skip: "Routine." }
];

// Fun checks: asked when little or nothing new happened. Compared with the agent's current picture of the user.
var CHECKS = ["W3", "F3", "C3", "G3", "H3", "X2", "W2", "T2"];

// The instructions the app's model follows. Admin only; editable like project instructions.
var MODEL = {
  intro: "Each time the user starts a game, a fresh AI model with no memory reads what the user's agent did since the last successful catch-up and prepares the questions. These are its instructions.",
  text: [
    "WHO YOU ARE",
    "- You prepare one short game in which a curious cat asks the user what they'd do.",
    "- You have no memory. You only see the agent's log since the last successful catch-up, the agent's current picture of the user, and the areas checked recently.",
    "",
    "STEP 1: CATCH UP",
    "- Read only what the agent did after the last successful catch-up time.",
    "- Keep everyday choices that say something about the user's priorities (food, groceries, getting around, free time, chores, fitness, small gifts). Skip routine tasks and rare big purchases.",
    "- Choices you can't fit this time wait for the next game.",
    "",
    "STEP 2: PICK THE QUESTIONS",
    "- 4 to 6 questions per game. Never more than 6.",
    "- New choices first, oldest first. If fewer than 4 are new, add fun checks from areas not asked recently.",
    "",
    "STEP 3: WRITE EACH QUESTION, AS THE CAT",
    "- Describe one small everyday situation where a single decision shows a clear priority (time vs money, healthy vs fast, rest vs friends).",
    "- Avoid questions where many factors matter at once (\"what matters in a TV?\").",
    "- Exactly 4 concrete options, each standing for one priority. One must be the agent's real choice. The app adds a 5th: \"Something else\".",
    "- One answer only. Never ask the user to rank or pick several.",
    "- Never mention the AI agent in a question.",
    "- Pick one icon from the icon library. If nothing fits, use the fallback icon.",
    "",
    "STEP 4: AFTER THE ANSWER",
    "- Same as the agent's choice: the cat cheers (\"I knew it!\").",
    "- Different: \"Ooh, noted! Should I let your AI know?\" Yes sends it to the agent right away; No keeps it private.",
    "- Show no other details about the agent.",
    "",
    "RULES",
    "- The user decides what goes to their agent. Never send anything on your own.",
    "- Light humour is good. Never mock, judge or guilt the user.",
    "- Plain, everyday English. Never suggest products, brands or shops."
  ].join("\n")
};
