// My Week Town: sample data that stands in for the user's personal AI agent.

// Everyday areas. items = the priorities to pick from; agent = the agent's starting picture of the user, most important first.
var AREAS = {
  electronics: { name: "Gadgets", about: "gadgets", icon: "tv", place: "Electronics store",
    items: [["price", "Price"], ["picture", "Picture quality"], ["lasts", "Lasts long"], ["brand", "Brand I trust"]], agent: ["price", "lasts", "brand", "picture"] },
  travel: { name: "Travel", about: "travel", icon: "plane", place: "Airport",
    items: [["early", "Reach early"], ["less", "Pay less"], ["comfort", "Comfort"], ["hassle", "Least hassle"]], agent: ["less", "hassle", "early", "comfort"] },
  home: { name: "Home", about: "home things", icon: "sofa", place: "Furniture market",
    items: [["price", "Price"], ["lasts", "Lasts long"], ["looks", "Looks"], ["comfort", "Comfort"]], agent: ["price", "comfort", "lasts", "looks"] },
  gifts: { name: "Gifts", about: "gifts", icon: "gift", place: "Gift shop",
    items: [["personal", "Personal touch"], ["useful", "Useful"], ["price", "Price"], ["time", "Arrives on time"]], agent: ["time", "price", "useful", "personal"] },
  food: { name: "Dinner", about: "dinner after a long day", icon: "takeout", place: "Food street",
    items: [["healthy", "Healthy"], ["fast", "Fast"], ["cheap", "Cheap"], ["taste", "Taste"]], agent: ["fast", "cheap", "taste", "healthy"] },
  groceries: { name: "Groceries", about: "groceries", icon: "pan", place: "Grocery market",
    items: [["price", "Price"], ["fresh", "Freshness"], ["brand", "Brand I trust"], ["quick", "Quick delivery"]], agent: ["price", "quick", "brand", "fresh"] },
  weekend: { name: "Weekends", about: "weekends", icon: "calendar", place: "Weekend park",
    items: [["rest", "Rest"], ["family", "Family time"], ["friends", "Friends"], ["new", "Something new"]], agent: ["rest", "family", "friends", "new"] },
  commute: { name: "Commute", about: "getting to work", icon: "compass", place: "Bus stop",
    items: [["cheap", "Cheapest"], ["fast", "Fastest"], ["comfy", "Comfiest"], ["green", "Greenest"]], agent: ["cheap", "fast", "comfy", "green"] },
  clothes: { name: "Clothes", about: "clothes", icon: "mirror", place: "Tailor",
    items: [["comfort", "Comfort"], ["style", "Style"], ["price", "Price"], ["lasts", "Lasts long"]], agent: ["price", "comfort", "style", "lasts"] }
};

// What the agent did before the very first catch-up (placed in the last 7 days on first run).
// Crucial choices become questions; routine ones are skipped.
var SEED = [
  { daysAgo: 6.2, routine: true, label: "Bills", did: "Paid the electricity bill, ₹2,140", skip: "Routine. Same as every month." },
  { daysAgo: 5.4, area: "electronics", choice: "TV", agentKey: "price",
    did: "Bought a 55-inch TV for ₹45,000, the best deal it found.", looked: "65-inch for ₹58,000 · OLED for ₹62,000",
    question: "Your agent bought a TV (and it's very proud of the deal). Be honest: what did you want it to nail?" },
  { daysAgo: 5.1, area: "travel", choice: "Flight", agentKey: "less",
    did: "Rebooked your cancelled Delhi flight on the cheapest seat left, the 2 pm.", looked: "9:30 am flight, ₹8,900",
    question: "Flight cancelled (classic). In the rebooking, what matters most to you?" },
  { daysAgo: 4.8, routine: true, label: "Health", did: "Refilled your vitamin D tablets", skip: "Routine refill." },
  { daysAgo: 4.3, area: "home", choice: "Sofa", agentKey: "price",
    did: "Ordered a grey sofa on sale for ₹35,000.", looked: "Solid wood sofa, ₹42,000, lasts 15 years",
    question: "A new sofa is on its way. What would make you sink into it happily?" },
  { daysAgo: 3.9, routine: true, label: "Travel", did: "Booked 5 cabs to the office", skip: "Same route as always." },
  { daysAgo: 3.2, area: "gifts", choice: "Gift for Arjun", agentKey: "time",
    did: "Ordered Arjun a ₹1,200 mug, because it would arrive on time.", looked: "A custom photo book, ₹2,500, arriving after his birthday",
    question: "Arjun's birthday gift: what makes a gift feel like it came from you?" },
  { daysAgo: 2.4, routine: true, label: "Work", did: "Moved 9 meetings and replied to 37 emails", skip: "Routine work admin." },
  { daysAgo: 1.1, area: "food", choice: "Late dinners", agentKey: "fast",
    did: "Ordered dinner 11 times after 8 pm, always the fastest delivery.", looked: "Healthier places, 15 minutes slower",
    question: "It's 9 pm and you're starving (again). Dinner should be…" },
  { daysAgo: 0.6, routine: true, label: "Groceries", did: "Reordered the usual groceries, ₹1,850", skip: "Same list as last week." }
];

// New things the agent can "do" when the admin simulates fresh activity. It chooses by its current picture of the user.
var SIM = [
  { area: "groceries", choice: "Groceries", did: "Reordered the weekly groceries, ₹1,640.", question: "Groceries landed. What should your agent never compromise on?" },
  { area: "electronics", choice: "Laptop", did: "Bought a new laptop for ₹68,000.", question: "New laptop! What should it be best at, for you?" },
  { area: "weekend", choice: "Saturday plan", did: "Planned your Saturday.", question: "Your agent planned your Saturday. What did you actually want from it?" },
  { area: "food", choice: "Late dinner", did: "Ordered biryani at 10 pm.", question: "Late dinner, round two. What matters most tonight?" },
  { area: "commute", choice: "Monday ride", did: "Booked your Monday ride to work.", question: "Monday commute, sorted. What makes a ride right for you?" },
  { area: "home", choice: "Study lamp", did: "Ordered a new study lamp.", question: "A new lamp for your desk. What matters most?" },
  { area: "clothes", choice: "Shirts", did: "Bought 3 shirts.", question: "Three new shirts arrived. What should clothes be for you?" },
  { area: "travel", choice: "Goa trip", did: "Booked your long-weekend Goa trip.", question: "Goa is booked! What makes a trip feel right?" },
  { area: "gifts", choice: "Mom's flowers", did: "Picked Mom's anniversary flowers.", question: "Mom's anniversary flowers are sorted. What makes a gift feel like you?" }
];
var SIM_ROUTINE = [
  { label: "Bills", did: "Paid the phone bill, ₹799", skip: "Routine. Same as every month." },
  { label: "Work", did: "Summarised 3 work reports", skip: "Routine work admin." },
  { label: "Health", did: "Booked your 6-monthly dentist check-up", skip: "Routine." }
];

// Quick taste checks, asked when little or nothing new happened since the last catch-up.
var REFRESH = {
  groceries: "Groceries: rank what matters, most important first. (Your agent thinks it knows. Does it?)",
  weekend: "Your perfect weekend, ranked. No wrong answers, only lazy ones.",
  commute: "Monday commute: rank what makes a ride bearable.",
  clothes: "Shopping for clothes: rank what matters, from 'must' to 'meh'.",
  electronics: "Gadgets: rank what you'd happily pay extra for.",
  travel: "Trips: rank what makes travel worth it.",
  home: "Your home: rank what matters in the things you live with.",
  gifts: "Gifts for people you love: rank what makes them feel special.",
  food: "Dinner after a long day: rank your cravings."
};

// The instructions the app's model follows. Admin only; editable like project instructions.
var MODEL = {
  intro: "Each time the user starts a game, a fresh AI model with no memory reads what the user's agent did since the last successful catch-up and prepares the questions. These are its instructions.",
  text: [
    "WHO YOU ARE",
    "- You prepare one short game that checks whether the user's agent still chooses like the user.",
    "- You have no memory. You only see the agent's log since the last successful catch-up, the agent's current picture of the user, and the areas checked recently.",
    "",
    "STEP 1: CATCH UP",
    "- Read only what the agent did after the last successful catch-up time.",
    "- Keep crucial choices (big buys, family and friends, travel, food habits). Skip routine tasks, each with a reason.",
    "- Crucial choices you can't fit this time wait for the next game.",
    "",
    "STEP 2: PICK THE QUESTIONS",
    "- 3 to 5 questions per game. Never more.",
    "- New crucial choices first, oldest first.",
    "- If fewer than 3 are new, add quick taste checks from everyday areas not checked recently, so the game still finds changes in what matters to the user.",
    "",
    "STEP 3: WRITE EACH QUESTION",
    "- A crucial choice: one curious, funny line about the situation, then \"what matters most?\". 4 priorities from that area, one of them the agent's real priority. The app adds \"Something else\".",
    "- A taste check: ask the user to rank the area's 4 priorities, most important first.",
    "- Light humour is good. Never mock, judge or guilt the user.",
    "",
    "STEP 4: THE REVEAL",
    "- One sentence on what the agent did and the priority it used.",
    "- If the agent was following an update the user sent, say so.",
    "",
    "RULES",
    "- The user decides which updates go to their agent. Never send anything on your own.",
    "- Plain, everyday English. Never suggest products, brands or shops."
  ].join("\n")
};
