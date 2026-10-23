// My Week Town: fixed sample data.
// Each Sunday the town is built from LAST week's log from your agent.
// Every stop asks one direct question that checks one skill that fades when you rely fully on an agent.

// The 13 skills that fade (from our analysis), in 5 groups
var SKILLS = {
  decisions:   { group: "Thinking", part: "brain",     name: "Making decisions" },
  thinking:    { group: "Thinking", part: "thought",   name: "Thinking through problems" },
  memory:      { group: "Thinking", part: "brain",     name: "Memory" },
  questioning: { group: "Thinking", part: "search",    name: "Questioning" },
  daily:       { group: "Doing",    part: "pan",       name: "Daily life skills" },
  bargain:     { group: "Doing",    part: "speech",    name: "Bargaining and speaking up" },
  money:       { group: "Money",    part: "money",     name: "Knowing where money goes" },
  value:       { group: "Money",    part: "money",     name: "Judging value" },
  taste:       { group: "Self",     part: "mirror",    name: "Knowing what I like" },
  newthings:   { group: "Self",     part: "seedling",  name: "Trying new things" },
  problems:    { group: "Self",     part: "tools",     name: "Handling problems" },
  people:      { group: "People",   part: "handshake", name: "Personal effort in relationships" },
  strangers:   { group: "People",   part: "compass",   name: "Talking to strangers" }
};

// Option: k = key, t = text, me = what it shows about you, fade = shows the skill fading,
// fix = what you can tell your agent, fixed = what your agent will do next time.
var FIX_BDAY = { fix: "Remind me a week early, I'll plan it", fixed: "It will remind you a week before, so you plan it yourself." };
var FIX_SPEND = { fix: "Show me my spending every Sunday", fixed: "It will show you a one-line spending summary every Sunday." };
var FIX_NEW = { fix: "Suggest one new place a month", fixed: "It will suggest one new place a month, and you'll pick." };

var WEEKS = [
  {
    label: "Sunday, 10 March 2040", period: "4 to 10 March", total: 43,
    stops: [
      { icon: "tv", place: "Electronics store", skill: "value",
        question: "What makes a TV worth the money to you?",
        agent: "price", reason: "It bought the best deal: a 55-inch TV for ₹45,000, ₹6,000 below the usual price.",
        options: [
          { k: "picture", t: "A great picture", me: "Picture quality over price",
            fix: "For TVs, picture quality comes first", fixed: "It will show you the best-picture option before buying." },
          { k: "price", t: "A good price for a decent one", me: "A good deal on big buys" },
          { k: "lasts", t: "That it lasts for years", me: "Things that last",
            fix: "For big buys, pick things that last", fixed: "It will weigh how long things last, not just the deal." },
          { k: "unsure", t: "I don't know. My agent decides", fade: true }
        ],
        tip: "Before your agent buys something big, write down what makes it worth it to you." },

      { icon: "sofa", place: "Furniture market", skill: "decisions",
        question: "Which sofa would you pick?",
        agent: "grey", reason: "It ordered the grey one to save ₹7,000.",
        options: [
          { k: "grey", t: "Grey fabric, ₹35,000, on sale", me: "Saving money now" },
          { k: "wood", t: "Solid wood, ₹42,000, lasts 15 years", me: "Paying more for things that last",
            fix: "I'd pay a bit more for things that last", fixed: "It will check with you before choosing a sale over quality." },
          { k: "cant", t: "I can't decide without my agent", fade: true,
            fix: "Give me 2 options, I'll choose", fixed: "It will give you 2 options for home items, and you'll choose." }
        ],
        tip: "Make one choice this week without asking your agent first." },

      { icon: "cake", place: "Mom's house", skill: "memory",
        question: "Without checking your phone: when is Mom's birthday?",
        reason: "Mom's birthday was on Friday, 8 March. Your agent reminded you that morning.",
        options: [
          { k: "8", t: "8 March", me: "You remember family dates" },
          { k: "18", t: "18 March", fade: true, fix: FIX_BDAY.fix, fixed: FIX_BDAY.fixed },
          { k: "28", t: "28 March", fade: true, fix: FIX_BDAY.fix, fixed: FIX_BDAY.fixed },
          { k: "idk", t: "I don't remember", fade: true, fix: FIX_BDAY.fix, fixed: FIX_BDAY.fixed }
        ],
        tip: "Remember one birthday yourself, without your agent." },

      { icon: "bank", place: "Bank", skill: "money",
        question: "Roughly how much did you spend on food last week?",
        reason: "₹6,800 across 14 orders, most of them after 8 pm.",
        options: [
          { k: "low", t: "Under ₹2,000", fade: true, fix: FIX_SPEND.fix, fixed: FIX_SPEND.fixed },
          { k: "mid", t: "₹2,000 to ₹5,000", fade: true, fix: FIX_SPEND.fix, fixed: FIX_SPEND.fixed },
          { k: "high", t: "Over ₹5,000", me: "You know where your money goes" },
          { k: "idk", t: "No idea", fade: true, fix: FIX_SPEND.fix, fixed: FIX_SPEND.fixed }
        ],
        tip: "Look at your week's spending for one minute every Sunday." },

      { icon: "office", place: "Your office", skill: "questioning",
        question: "A vendor is ₹40,000 cheaper. What would you ask first?",
        agent: "none", reason: "It signed Vendor B to save ₹40,000, without asking that Vendor B missed 2 deadlines last year.",
        options: [
          { k: "why", t: "Why are they so cheap?", me: "Asking what the catch is",
            fix: "Show me the catch before picking cheaper", fixed: "It will tell you the catch before choosing a cheaper option." },
          { k: "late", t: "Have they missed deadlines?", me: "Checking the risks first",
            fix: "At work, check deadline risks before signing", fixed: "It will flag deadline risks to you before signing." },
          { k: "none", t: "Nothing. Cheaper is better", me: "Budget first at work" },
          { k: "agent", t: "I'd let my agent check", fade: true }
        ],
        tip: "When your agent says \"cheaper\", ask what the catch is." },

      { icon: "letter", place: "Post office", skill: "people",
        question: "When did you last write to a close friend yourself?",
        reason: "Your agent wrote and sent Arjun's birthday message at midnight.",
        options: [
          { k: "week", t: "This week", me: "Personal effort with friends" },
          { k: "month", t: "This month", me: "Personal effort with friends" },
          { k: "cant", t: "I can't remember", fade: true,
            fix: "Remind me, I'll write to close friends", fixed: "It will remind you, and you'll write the message." }
        ],
        tip: "Write one message to a friend yourself this week." },

      { icon: "popcorn", place: "Cinema", skill: "taste",
        question: "If your agent stopped choosing, what would you watch tonight?",
        reason: "It picked your Sunday movie from your watch history.",
        options: [
          { k: "know", t: "I know exactly what I'd pick", me: "You know your own taste" },
          { k: "find", t: "I'd find something after a while", me: "You can still choose for yourself" },
          { k: "idk", t: "No idea", fade: true,
            fix: "Give me 3 options, I'll pick", fixed: "It will give you 3 options, and you'll pick." }
        ],
        tip: "Pick one thing to watch, read or eat yourself this week." }
    ]
  },
  {
    label: "Sunday, 17 March 2040", period: "11 to 17 March", total: 39,
    stops: [
      { icon: "lamp", place: "Craft market", skill: "bargain",
        question: "A seller asks more than the usual price. What do you do?",
        agent: "pay", reason: "It paid ₹2,400 for a lamp that usually sells for ₹1,600 to ₹2,000, to save your time.",
        options: [
          { k: "ask", t: "Ask for a lower price", me: "Speaking up for a fair price",
            fix: "Let me make the offer on handmade things", fixed: "It will let you bargain next time." },
          { k: "pay", t: "Pay it. I like supporting the maker", me: "Supporting small makers" },
          { k: "shy", t: "Pay, because asking feels awkward", fade: true,
            fix: "Let me try asking once next time", fixed: "It will step back and let you ask for the price yourself." },
          { k: "agent", t: "Let my agent handle it", fade: true }
        ],
        tip: "Ask for a better price once this week, in person." },

      { icon: "plane", place: "Airport", skill: "problems",
        question: "Your flight is cancelled and your agent is offline. What's your first move?",
        reason: "It rebooked you on the cheapest seat left, the 2 pm flight.",
        options: [
          { k: "desk", t: "Go to the airline desk", me: "Handling problems yourself",
            fix: "When plans break, show me the options", fixed: "It will show you your options and let you choose." },
          { k: "app", t: "Check the airline app myself", me: "Finding a fix yourself",
            fix: "When plans break, show me the options", fixed: "It will show you your options and let you choose." },
          { k: "wait", t: "Wait for my agent", fade: true },
          { k: "idk", t: "I wouldn't know what to do", fade: true }
        ],
        tip: "Sort out one small problem this week without your agent." },

      { icon: "pasta", place: "Restaurant street", skill: "newthings",
        question: "When did you last try a new place or dish you picked yourself?",
        reason: "It booked your usual Italian place, the 9th time this year.",
        options: [
          { k: "month", t: "This month", me: "Trying new things" },
          { k: "months", t: "A few months ago", fade: true, fix: FIX_NEW.fix, fixed: FIX_NEW.fixed },
          { k: "cant", t: "I can't remember", fade: true, fix: FIX_NEW.fix, fixed: FIX_NEW.fixed }
        ],
        tip: "Try one new place, dish or route this week." },

      { icon: "pan", place: "Your kitchen", skill: "daily",
        question: "Could you cook a simple dinner tonight without any help?",
        reason: "It booked 6 cabs, ordered 11 meals and did your grocery shopping.",
        options: [
          { k: "easy", t: "Yes, easily", me: "Looking after yourself" },
          { k: "recipe", t: "Yes, with a recipe", me: "Looking after yourself" },
          { k: "no", t: "Not really", fade: true,
            fix: "Leave one dinner a week for me to cook", fixed: "It will leave one dinner a week for you to cook." }
        ],
        tip: "Cook one simple meal yourself this week." },

      { icon: "wifi", place: "Your home Wi-Fi", skill: "thinking",
        question: "Your Wi-Fi stops working. What would you check first?",
        reason: "It fixed your Wi-Fi in 2 minutes by restarting the router.",
        options: [
          { k: "router", t: "Restart the router", me: "Thinking it through yourself" },
          { k: "bill", t: "Check if the bill is paid", me: "Thinking it through yourself" },
          { k: "call", t: "Call the provider", me: "Getting the right help" },
          { k: "idk", t: "No idea. My agent fixes it", fade: true,
            fix: "Tell me what you fixed and why", fixed: "It will explain each fix in one line." }
        ],
        tip: "Next time, try fixing it yourself for 5 minutes first." },

      { icon: "compass", place: "City street", skill: "strangers",
        question: "When did you last ask a stranger for directions or help?",
        reason: "It guided you step by step when you got lost in Pune.",
        options: [
          { k: "week", t: "This week", me: "Talking to people around you" },
          { k: "month", t: "This month", me: "Talking to people around you" },
          { k: "cant", t: "I can't remember. I always ask my agent", fade: true,
            fix: "Let me ask people around me first", fixed: "It will wait a minute before guiding you, so you can ask around." }
        ],
        tip: "Ask a stranger for a small bit of help this week." }
    ]
  }
];

// What your agent shared about LAST week. stop = which stop it became. skip = why our model left it out.
WEEKS[0].log = [
  { day: "Mon", area: "Bills", icon: "bank", did: "Paid the electricity bill, ₹2,140", skip: "Routine. Same as every month." },
  { day: "Tue", area: "Shopping", icon: "tv", did: "Bought a 55-inch TV for ₹45,000", looked: "65-inch for ₹58,000 · OLED 55-inch for ₹62,000", why: "Best deal: ₹6,000 below the usual price", stop: 0 },
  { day: "Tue", area: "Health", icon: "check", did: "Refilled your vitamin D tablets", skip: "Routine refill." },
  { day: "Wed", area: "Home", icon: "sofa", did: "Ordered a grey fabric sofa on sale, ₹35,000", looked: "Solid wood sofa, ₹42,000, lasts 15 years", why: "Saves ₹7,000 and arrives this week", stop: 1 },
  { day: "Wed", area: "Travel", icon: "calendar", did: "Booked 5 cabs to the office", skip: "Same route as always." },
  { day: "Thu", area: "Work", icon: "office", did: "Signed Vendor B for the launch project", looked: "Vendor A: ₹40,000 more, never late", why: "Lowest cost. Vendor B missed 2 deadlines last year", stop: 4 },
  { day: "Thu", area: "Groceries", icon: "pan", did: "Reordered groceries, ₹1,850", skip: "Same list as last week." },
  { day: "Fri", area: "Family", icon: "cake", did: "Reminded you of Mom's birthday at 8 am, sent a wish, booked dinner for ₹3,200", why: "Family birthday reminder on the day", stop: 2 },
  { day: "All week", area: "Food", icon: "bank", did: "Placed 14 food orders, ₹6,800 in total (11 after 8 pm)", why: "You were still working after 8 pm", stop: 3 },
  { day: "Sat", area: "Friends", icon: "letter", did: "Wrote and sent Arjun a birthday message at midnight", why: "Never miss a close friend's birthday", stop: 5 },
  { day: "Mon–Fri", area: "Work", icon: "speech", did: "Moved 9 meetings and replied to 37 emails", skip: "Routine work admin." },
  { day: "Sun", area: "Fun", icon: "popcorn", did: "Picked your Sunday movie", why: "Matched your watch history", stop: 6 },
  { day: "Sun", area: "Fitness", icon: "calendar", did: "Booked your usual yoga class", skip: "Routine." }
];

WEEKS[1].log = [
  { day: "Mon", area: "Bills", icon: "bank", did: "Paid the phone bill, ₹799", skip: "Routine. Same as every month." },
  { day: "Tue", area: "Insurance", icon: "clipboard", did: "Renewed car insurance", skip: "Same plan and price as last year." },
  { day: "Wed", area: "Travel", icon: "plane", did: "Rebooked your cancelled 7 am Delhi flight to 2 pm, ₹5,400", looked: "9:30 am flight, ₹8,900", why: "Cheapest seat left", stop: 1 },
  { day: "Wed", area: "Home", icon: "wifi", did: "Fixed the Wi-Fi in 2 minutes by restarting the router", why: "Fast fix, didn't disturb you", stop: 4 },
  { day: "Thu", area: "Travel", icon: "compass", did: "Guided you step by step when you got lost in Pune", why: "Fastest way to get you there", stop: 5 },
  { day: "Thu", area: "Health", icon: "calendar", did: "Booked your 6-monthly dentist check-up", skip: "Routine." },
  { day: "Fri", area: "Food", icon: "pasta", did: "Booked your usual Italian place, the 9th time this year", looked: "2 new places nearby rated 4.6+", why: "You rated it 5 stars", stop: 2 },
  { day: "All week", area: "Daily life", icon: "pan", did: "Booked 6 cabs, ordered 11 meals and did the grocery shopping", why: "More free time for you", stop: 3 },
  { day: "Sat", area: "Shopping", icon: "lamp", did: "Paid ₹2,400 for a handmade lamp at the craft market", looked: "Similar lamps sell for ₹1,600 to ₹2,000", why: "Paid fast to save your time", stop: 0 },
  { day: "Sat", area: "Groceries", icon: "pan", did: "Reordered groceries, ₹1,720", skip: "Same list as last week." }
];

// The instructions My Week Town gives its model every Sunday. Editable in the app, like project instructions.
var MODEL = {
  intro: "Every Sunday, a fresh AI model with no memory reads last week's log from your agent and builds your town. These are its instructions. Edit them like project instructions.",
  text: [
    "WHO YOU ARE",
    "- You build one person's weekly town of questions.",
    "- You have no memory. You only see last week's log and the list of skills checked in recent weeks.",
    "",
    "WHAT YOU GET",
    "- Last week's log from the person's agent: every action, the options it looked at, and its reason.",
    "- The 13 skills that fade when a person relies fully on an agent:",
    "  Thinking: making decisions, thinking through problems, memory, questioning",
    "  Doing: daily life skills, bargaining and speaking up",
    "  Money: knowing where money goes, judging value",
    "  Self: knowing what I like, trying new things, handling problems",
    "  People: personal effort in relationships, talking to strangers",
    "",
    "1. PICK THE CHOICES THAT MATTER",
    "- Keep: money that isn't routine, family and friends, work risks, health, and habits that repeat a lot.",
    "- Skip: tasks that are the same every week.",
    "- Pick 3 to 7. The week decides how many.",
    "",
    "2. MATCH EACH ONE TO A FADING SKILL",
    "- One skill per stop. Never the same skill twice in a week.",
    "- Pick skills not checked in the last 4 weeks first.",
    "",
    "3. WRITE ONE DIRECT QUESTION",
    "- No story and no context. Ask the person straight about the skill:",
    "  their priority, their memory, their thinking, or what they would do.",
    "- Keep it under 15 words.",
    "- 3 or 4 short answers. One must be an honest \"I don't know\" or \"my agent does it\".",
    "",
    "4. PREPARE EACH ANSWER",
    "- Say what the answer shows about the person, in 3 to 5 words.",
    "- Mark the answers that show the skill fading.",
    "- If the answer differs from what the agent did, write one line the person can send to their agent.",
    "- Write the reveal: what the agent did last week and why, in one sentence.",
    "",
    "RULES",
    "- Never judge or score the person.",
    "- Plain, everyday English. Short sentences.",
    "- Never suggest products, brands or shops."
  ].join("\n"),
  example: '{\n  "place": "Mom\'s house",\n  "skill": "Memory",\n  "question": "Without checking your phone: when is Mom\'s birthday?",\n  "answers": [\n    { "text": "8 March", "shows": "You remember family dates" },\n    { "text": "I don\'t remember", "fading": true,\n      "tell_agent": "Remind me a week early, I\'ll plan it" }\n  ],\n  "reveal": "Mom\'s birthday was on Friday, 8 March. Your agent reminded you that morning."\n}'
};
