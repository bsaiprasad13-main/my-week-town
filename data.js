// My Week Town: sample data that stands in for the user's personal AI agent, plus the app's content.

// Everyday areas. items = the priorities to pick from; agent = the agent's starting picture of the user, most important first.
var AREAS = {
  electronics: { name: "Gadgets", about: "gadgets", place: "Electronics store",
    items: [["price", "Price"], ["picture", "Picture quality"], ["lasts", "Lasts long"], ["brand", "Brand I trust"]], agent: ["price", "lasts", "brand", "picture"] },
  travel: { name: "Travel", about: "travel", place: "Airport",
    items: [["early", "Reach early"], ["less", "Pay less"], ["comfort", "Comfort"], ["hassle", "Least hassle"]], agent: ["less", "hassle", "early", "comfort"] },
  home: { name: "Home", about: "home things", place: "Furniture market",
    items: [["price", "Price"], ["lasts", "Lasts long"], ["looks", "Looks"], ["comfort", "Comfort"]], agent: ["price", "comfort", "lasts", "looks"] },
  gifts: { name: "Gifts", about: "gifts", place: "Gift shop",
    items: [["personal", "Personal touch"], ["useful", "Useful"], ["price", "Price"], ["time", "Arrives on time"]], agent: ["time", "price", "useful", "personal"] },
  food: { name: "Dinner", about: "dinner after a long day", place: "Food street",
    items: [["healthy", "Healthy"], ["fast", "Fast"], ["cheap", "Cheap"], ["taste", "Taste"]], agent: ["fast", "cheap", "taste", "healthy"] },
  groceries: { name: "Groceries", about: "groceries", place: "Grocery market",
    items: [["price", "Price"], ["fresh", "Freshness"], ["brand", "Brand I trust"], ["quick", "Quick delivery"]], agent: ["price", "quick", "brand", "fresh"] },
  weekend: { name: "Weekends", about: "weekends", place: "Weekend park",
    items: [["rest", "Rest"], ["family", "Family time"], ["friends", "Friends"], ["new", "Something new"]], agent: ["rest", "family", "friends", "new"] },
  commute: { name: "Commute", about: "getting to work", place: "Bus stop",
    items: [["cheap", "Cheapest"], ["fast", "Fastest"], ["comfy", "Comfiest"], ["green", "Greenest"]], agent: ["cheap", "fast", "comfy", "green"] },
  clothes: { name: "Clothes", about: "clothes", place: "Tailor",
    items: [["comfort", "Comfort"], ["style", "Style"], ["price", "Price"], ["lasts", "Lasts long"]], agent: ["price", "comfort", "style", "lasts"] }
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
// Questions never mention the agent: they ask the user, in the cat's words.
var SEED = [
  { daysAgo: 6.2, routine: true, label: "Bills", did: "Paid the electricity bill, ₹2,140", skip: "Routine. Same as every month." },
  { daysAgo: 5.4, area: "electronics", choice: "TV", icon: "tv", agentKey: "price",
    did: "Bought a 55-inch TV for ₹45,000, the best deal it found.", looked: "65-inch for ₹58,000 · OLED for ₹62,000",
    question: "You got a new TV. What did you want it to be great at?" },
  { daysAgo: 5.1, area: "travel", choice: "Flight", icon: "plane", agentKey: "less",
    did: "Rebooked your cancelled Delhi flight on the cheapest seat left, the 2 pm.", looked: "9:30 am flight, ₹8,900",
    question: "Your flight got cancelled. In the new booking, what matters most to you?" },
  { daysAgo: 4.8, routine: true, label: "Health", did: "Refilled your vitamin D tablets", skip: "Routine refill." },
  { daysAgo: 4.3, area: "home", choice: "Sofa", icon: "sofa", agentKey: "price",
    did: "Ordered a grey sofa on sale for ₹35,000.", looked: "Solid wood sofa, ₹42,000, lasts 15 years",
    question: "A new sofa is coming home. What would make you love it?" },
  { daysAgo: 3.9, routine: true, label: "Travel", did: "Booked 5 cabs to the office", skip: "Same route as always." },
  { daysAgo: 3.2, area: "gifts", choice: "Gift for Arjun", icon: "gift", agentKey: "time",
    did: "Ordered Arjun a ₹1,200 mug, because it would arrive on time.", looked: "A custom photo book, ₹2,500, arriving after his birthday",
    question: "Arjun's birthday! What makes a gift feel like it came from you?" },
  { daysAgo: 2.4, routine: true, label: "Work", did: "Moved 9 meetings and replied to 37 emails", skip: "Routine work admin." },
  { daysAgo: 1.1, area: "food", choice: "Late dinners", icon: "takeout", agentKey: "fast",
    did: "Ordered dinner 11 times after 8 pm, always the fastest delivery.", looked: "Healthier places, 15 minutes slower",
    question: "It's 9 pm and you're starving. Dinner should be…" },
  { daysAgo: 0.6, routine: true, label: "Groceries", did: "Reordered the usual groceries, ₹1,850", skip: "Same list as last week." }
];

// New things the agent can "do" when the admin simulates fresh activity. It chooses by its current picture of the user.
var SIM = [
  { area: "groceries", choice: "Groceries", icon: "cart", did: "Reordered the weekly groceries, ₹1,640.", question: "Your groceries landed. What should never be compromised?" },
  { area: "electronics", choice: "Laptop", icon: "laptop", did: "Bought a new laptop for ₹68,000.", question: "A new laptop! What should it be best at, for you?" },
  { area: "weekend", choice: "Saturday plan", icon: "calendar", did: "Planned your Saturday.", question: "Saturday's planned. What did you actually want from it?" },
  { area: "food", choice: "Late dinner", icon: "curry", did: "Ordered biryani at 10 pm.", question: "Late dinner again! What matters most tonight?" },
  { area: "commute", choice: "Monday ride", icon: "taxi", did: "Booked your Monday ride to work.", question: "Monday ride to work. What makes a ride right for you?" },
  { area: "home", choice: "Study lamp", icon: "bulb", did: "Ordered a new study lamp.", question: "A new lamp for your desk. What matters most?" },
  { area: "clothes", choice: "Shirts", icon: "shirt", did: "Bought 3 shirts.", question: "Three new shirts! What should clothes be for you?" },
  { area: "travel", choice: "Goa trip", icon: "beach", did: "Booked your long-weekend Goa trip.", question: "Goa trip coming up! What makes a trip feel right?" },
  { area: "gifts", choice: "Mom's flowers", icon: "bouquet", did: "Picked Mom's anniversary flowers.", question: "Flowers for Mom's anniversary. What makes a gift feel like you?" }
];
var SIM_ROUTINE = [
  { label: "Bills", did: "Paid the phone bill, ₹799", skip: "Routine. Same as every month." },
  { label: "Work", did: "Summarised 3 work reports", skip: "Routine work admin." },
  { label: "Health", did: "Booked your 6-monthly dentist check-up", skip: "Routine." }
];

// Quick taste checks: asked when little or nothing new happened. Rank the 4 priorities.
var REFRESH = {
  groceries: { icon: "cart", q: "Groceries: rank what matters, most important first." },
  weekend: { icon: "camping", q: "Your perfect weekend, ranked. No wrong answers, only lazy ones." },
  commute: { icon: "bus", q: "Getting to work: rank what makes a ride bearable." },
  clothes: { icon: "shirt", q: "Buying clothes: rank what matters, from 'must' to 'meh'." },
  electronics: { icon: "headphone", q: "Gadgets: rank what you'd happily pay extra for." },
  travel: { icon: "luggage", q: "Trips: rank what makes travel worth it." },
  home: { icon: "plant", q: "Your home: rank what matters in the things you live with." },
  gifts: { icon: "balloon", q: "Gifts for people you love: rank what makes them special." },
  food: { icon: "salad", q: "Dinner after a long day: rank your cravings." }
};

// The instructions the app's model follows. Admin only; editable like project instructions.
var MODEL = {
  intro: "Each time the user starts a game, a fresh AI model with no memory reads what the user's agent did since the last successful catch-up and prepares the questions. These are its instructions.",
  text: [
    "WHO YOU ARE",
    "- You prepare one short game in which a curious cat asks the user what they like.",
    "- You have no memory. You only see the agent's log since the last successful catch-up, the agent's current picture of the user, and the areas checked recently.",
    "",
    "STEP 1: CATCH UP",
    "- Read only what the agent did after the last successful catch-up time.",
    "- Keep crucial choices (big buys, family and friends, travel, food habits). Skip routine tasks, each with a reason.",
    "- Crucial choices you can't fit this time wait for the next game.",
    "",
    "STEP 2: PICK THE QUESTIONS",
    "- 4 to 6 questions per game. Never more than 6.",
    "- New crucial choices first, oldest first.",
    "- If fewer than 4 are new, add quick taste checks from everyday areas not checked recently.",
    "",
    "STEP 3: WRITE EACH QUESTION, AS THE CAT",
    "- The cat is curious and a little unsure. One short, friendly line about the situation, then what matters most.",
    "- Never mention the AI agent in a question. Ask about the user and what they like.",
    "- A crucial choice: 4 priorities from that area, one of them the agent's real priority. The app adds \"Something else\".",
    "- A taste check: ask the user to rank the area's 4 priorities, most important first.",
    "- Pick one icon for each question from the icon library. If nothing fits, use the fallback icon.",
    "",
    "STEP 4: AFTER THE ANSWER",
    "- Same as the agent's priority: the cat cheers (\"I knew it!\").",
    "- Different: \"Ooh, noted! Should I let your AI know?\" Yes sends it to the agent right away; No keeps it private.",
    "- Show no other details about the agent.",
    "",
    "RULES",
    "- The user decides what goes to their agent. Never send anything on your own.",
    "- Light humour is good. Never mock, judge or guilt the user.",
    "- Plain, everyday English. Never suggest products, brands or shops."
  ].join("\n")
};
