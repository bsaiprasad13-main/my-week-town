// My Week Town: fixed sample data.
// Every Sunday the town is built from LAST week's log from your agent.
// Two kinds of stops:
//   priority: what matters most to YOU in this choice, checked against what mattered to your agent
//   memory:   do you still remember your own week without your agent

// Priority option: k = key, t = text, fix = what you can tell your agent if it differs, fixed = what your agent will do next time.
var WEEKS = [
  {
    label: "Sunday, 10 March 2040", period: "4 to 10 March", total: 43,
    stops: [
      { kind: "priority", icon: "tv", place: "Electronics store", choice: "TV",
        question: "Buying a TV, what matters most to you?",
        agent: "price", did: "On Tuesday it bought a 55-inch TV for ₹45,000, the best deal it found.",
        options: [
          { k: "price", t: "Price" },
          { k: "picture", t: "Picture quality", fix: "For TVs, picture quality comes first", fixed: "It will pick the best picture, not just the best deal." },
          { k: "lasts", t: "Lasts long", fix: "For big buys, pick things that last", fixed: "It will weigh how long things last before the price." },
          { k: "brand", t: "Brand", fix: "For electronics, pick brands I trust", fixed: "It will stick to brands you trust." }
        ] },

      { kind: "priority", icon: "plane", place: "Airport", choice: "Flight",
        question: "Flight cancelled. What matters most in the new booking?",
        agent: "less", did: "On Tuesday it rebooked you on the cheapest seat left, the 2 pm flight.",
        options: [
          { k: "early", t: "Reach early", fix: "When plans break, reaching early comes first", fixed: "It will book the earliest option, even if it costs more." },
          { k: "less", t: "Pay less" },
          { k: "comfort", t: "Comfort", fix: "On flights, comfort comes first", fixed: "It will pick comfortable seats and times." },
          { k: "hassle", t: "Least hassle", fix: "When plans break, keep it simple for me", fixed: "It will pick the option with the fewest changes." }
        ] },

      { kind: "priority", icon: "sofa", place: "Furniture market", choice: "Sofa",
        question: "Choosing a sofa, what matters most?",
        agent: "price", did: "On Wednesday it ordered a grey sofa on sale for ₹35,000.",
        options: [
          { k: "price", t: "Price" },
          { k: "lasts", t: "Lasts long", fix: "For sofas, quality comes first", fixed: "It will check with you before choosing a sale over quality." },
          { k: "looks", t: "Looks", fix: "For my home, how it looks comes first", fixed: "It will show you photos before ordering for your home." },
          { k: "comfort", t: "Comfort", fix: "For furniture, comfort comes first", fixed: "It will pick comfort over the deal for furniture." }
        ] },

      { kind: "priority", icon: "gift", place: "Gift shop", choice: "Gift for Arjun",
        question: "Picking a birthday gift for your best friend, what matters most?",
        agent: "time", did: "On Thursday it ordered Arjun a ₹1,200 mug, because it would arrive on time.",
        options: [
          { k: "personal", t: "Personal touch", fix: "For close friends, a personal gift comes first", fixed: "It will suggest personal gifts and let you pick." },
          { k: "useful", t: "Useful", fix: "Pick gifts they'll actually use", fixed: "It will look for gifts your friends will use." },
          { k: "price", t: "Price", fix: "Keep gifts within my budget", fixed: "It will stay within your gift budget." },
          { k: "time", t: "Arrives on time" }
        ] },

      { kind: "memory", icon: "cake", place: "Mom's house", choice: "Mom's birthday",
        question: "Without checking: when is Mom's birthday?",
        answer: "8", did: "Mom's birthday was on Friday, 8 March. Your agent reminded you that morning.",
        fix: "Remind me a week early, I'll plan it", fixed: "It will remind you a week before, so you plan it yourself.",
        options: [ { k: "8", t: "8 March" }, { k: "18", t: "18 March" }, { k: "28", t: "28 March" }, { k: "idk", t: "I don't remember" } ] },

      { kind: "memory", icon: "letter", place: "Post office", choice: "Birthday wish",
        question: "Without checking: whose birthday wish did your agent send last week?",
        answer: "arjun", did: "Your agent wrote and sent Arjun's birthday message at midnight on Saturday.",
        fix: "Tell me before you send wishes for me", fixed: "It will remind you, and you'll write the message.",
        options: [ { k: "arjun", t: "Arjun" }, { k: "rahul", t: "Rahul" }, { k: "priya", t: "Priya" }, { k: "idk", t: "I don't remember" } ] },

      { kind: "priority", icon: "takeout", place: "Food street", choice: "Late dinners",
        question: "Ordering dinner after a long day, what matters most?",
        agent: "fast", did: "It ordered dinner 11 times after 8 pm, always the fastest delivery.",
        options: [
          { k: "healthy", t: "Healthy", fix: "For dinner, healthy comes first", fixed: "It will pick healthy meals, even if they take longer." },
          { k: "fast", t: "Fast" },
          { k: "cheap", t: "Cheap", fix: "For dinner, keep it cheap", fixed: "It will pick good-value meals over the fastest ones." },
          { k: "taste", t: "Taste", fix: "For dinner, taste comes first", fixed: "It will pick your favourite places over the fastest ones." }
        ] }
    ]
  }
];

// What your agent shared about LAST week. stop = which stop it became. skip = why our model left it out.
WEEKS[0].log = [
  { day: "Mon", area: "Bills", icon: "bank", did: "Paid the electricity bill, ₹2,140", skip: "Routine. Same as every month." },
  { day: "Tue", area: "Shopping", icon: "tv", did: "Bought a 55-inch TV for ₹45,000", looked: "65-inch for ₹58,000 · OLED 55-inch for ₹62,000", why: "Price: best deal, ₹6,000 below the usual price", stop: 0 },
  { day: "Tue", area: "Travel", icon: "plane", did: "Rebooked your cancelled 7 am Delhi flight to 2 pm, ₹5,400", looked: "9:30 am flight, ₹8,900", why: "Price: cheapest seat left", stop: 1 },
  { day: "Tue", area: "Health", icon: "check", did: "Refilled your vitamin D tablets", skip: "Routine refill." },
  { day: "Wed", area: "Home", icon: "sofa", did: "Ordered a grey fabric sofa on sale, ₹35,000", looked: "Solid wood sofa, ₹42,000, lasts 15 years", why: "Price: saves ₹7,000", stop: 2 },
  { day: "Wed", area: "Travel", icon: "calendar", did: "Booked 5 cabs to the office", skip: "Same route as always." },
  { day: "Thu", area: "Friends", icon: "gift", did: "Ordered Arjun's birthday gift: a mug, ₹1,200", looked: "Custom photo book, ₹2,500, arrives after his birthday", why: "On time: arrives before his birthday", stop: 3 },
  { day: "Thu", area: "Groceries", icon: "pan", did: "Reordered groceries, ₹1,850", skip: "Same list as last week." },
  { day: "Fri", area: "Family", icon: "cake", did: "Reminded you of Mom's birthday at 8 am, sent a wish, booked dinner for ₹3,200", why: "Family birthday reminder on the day", stop: 4 },
  { day: "Sat", area: "Friends", icon: "letter", did: "Wrote and sent Arjun a birthday message at midnight", why: "Never miss a close friend's birthday", stop: 5 },
  { day: "Sat", area: "Shopping", icon: "lamp", did: "Bought a lamp at the craft market, ₹2,400", skip: "Small buy, and similar to one checked before." },
  { day: "All week", area: "Food", icon: "takeout", did: "Ordered dinner 11 times after 8 pm, ₹5,900 in total", looked: "Healthier places 15 minutes slower", why: "Speed: fastest delivery each time", stop: 6 },
  { day: "Mon–Fri", area: "Work", icon: "speech", did: "Moved 9 meetings and replied to 37 emails", skip: "Routine work admin." },
  { day: "Sun", area: "Fun", icon: "popcorn", did: "Picked your Sunday movie", skip: "Small, everyday choice." }
];

// The instructions My Week Town gives its model every Sunday. Editable in the app, like project instructions.
var MODEL = {
  intro: "Every Sunday, a fresh AI model with no memory reads last week's log from your agent and builds your town. These are its instructions. Edit them like project instructions.",
  text: [
    "WHO YOU ARE",
    "- You build one person's weekly town of questions.",
    "- You have no memory. You only see last week's log from their agent.",
    "",
    "YOUR TWO JOBS",
    "1. Check if the agent still chooses like the person: their priorities vs the agent's priorities.",
    "2. Check if the person still remembers their own week without the agent.",
    "",
    "STEP 1: PICK THE CHOICES THAT MATTER",
    "- Keep choices where priorities can differ: big buys, family and friends, travel, food habits.",
    "- Skip routine tasks that are the same every week.",
    "- Pick 4 to 6 priority stops and 1 or 2 memory stops.",
    "",
    "STEP 2: WRITE A PRIORITY QUESTION",
    "- One short line: the situation, then \"what matters most?\"",
    "  Example: \"Buying a TV, what matters most to you?\"",
    "- 4 one- or two-word answers, such as Price, Quality, Lasts long, Looks.",
    "- One of them must be the agent's real priority, from its reason in the log.",
    "- For every other answer, write one line the person can send to their agent.",
    "",
    "STEP 3: WRITE A MEMORY QUESTION",
    "- Ask about something important from last week, without checking.",
    "  Example: \"Without checking: when is Mom's birthday?\"",
    "- 3 options plus \"I don't remember\". Only one is right.",
    "",
    "STEP 4: WRITE THE REVEAL",
    "- One sentence on what the agent did last week and why.",
    "",
    "RULES",
    "- Never judge the person. Different is not wrong; it's a chance to tell the agent.",
    "- Plain, everyday English. Short sentences.",
    "- Never suggest products, brands or shops."
  ].join("\n"),
  example: '{\n  "kind": "priority",\n  "place": "Furniture market",\n  "question": "Choosing a sofa, what matters most?",\n  "answers": ["Price", "Lasts long", "Looks", "Comfort"],\n  "agent_priority": "Price",\n  "reveal": "On Wednesday it ordered a grey sofa on sale for ₹35,000.",\n  "tell_agent": {\n    "Lasts long": "For sofas, quality comes first",\n    "Looks": "For my home, how it looks comes first",\n    "Comfort": "For furniture, comfort comes first"\n  }\n}'
};
