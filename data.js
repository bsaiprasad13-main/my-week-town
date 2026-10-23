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
// One sample week. Stops are in the order the cat walks them.
var WEEKS = [
  {
    label: "Sunday, 10 March 2040", period: "4 to 10 March", total: 43,
    stops: [
      { icon: "plane", place: "Airport", skill: "problems",
        question: "Your flight is cancelled and your agent is offline. What's your first move?",
        reason: "On Tuesday your Delhi flight was cancelled. Your agent rebooked you on the cheapest seat left, the 2 pm flight.",
        options: [
          { k: "desk", t: "Go to the airline desk", me: "Handling problems yourself",
            fix: "When plans break, show me the options", fixed: "It will show you your options and let you choose." },
          { k: "app", t: "Check the airline app myself", me: "Finding a fix yourself",
            fix: "When plans break, show me the options", fixed: "It will show you your options and let you choose." },
          { k: "wait", t: "Wait for my agent", fade: true },
          { k: "idk", t: "I wouldn't know what to do", fade: true }
        ],
        tip: "Sort out one small problem this week without your agent." },

      { icon: "sofa", place: "Furniture market", skill: "decisions",
        question: "When two options are close, how do you usually decide?",
        reason: "Last week your agent picked your new sofa for you: the grey one on sale for ₹35,000.",
        options: [
          { k: "weigh", t: "I weigh what matters and pick", me: "Deciding with a clear reason" },
          { k: "gut", t: "I go with my gut", me: "Trusting your own judgement" },
          { k: "agent", t: "I ask my agent to decide", fade: true,
            fix: "Give me 2 options, I'll choose", fixed: "It will give you 2 options for big choices, and you'll choose." },
          { k: "delay", t: "I keep putting it off", fade: true,
            fix: "Give me 2 options, I'll choose", fixed: "It will give you 2 options for big choices, and you'll choose." }
        ],
        tip: "Make one choice this week without asking your agent first." },

      { icon: "office", place: "Your office", skill: "questioning",
        question: "A vendor is ₹40,000 cheaper. What would you ask first?",
        reason: "On Thursday your agent signed Vendor B to save ₹40,000. It didn't ask that Vendor B missed 2 deadlines last year.",
        options: [
          { k: "why", t: "Why are they so cheap?", me: "Asking what the catch is",
            fix: "Show me the catch before picking cheaper", fixed: "It will tell you the catch before choosing a cheaper option." },
          { k: "late", t: "Have they missed deadlines?", me: "Checking the risks first",
            fix: "At work, check deadline risks before signing", fixed: "It will flag deadline risks to you before signing." },
          { k: "none", t: "Nothing. Cheaper is better", fade: true,
            fix: "Show me the catch before picking cheaper", fixed: "It will tell you the catch before choosing a cheaper option." },
          { k: "agent", t: "I'd let my agent check", fade: true }
        ],
        tip: "When your agent says \"cheaper\", ask what the catch is." },

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

      { icon: "lamp", place: "Craft market", skill: "bargain",
        question: "A seller asks more than the usual price. What do you do?",
        reason: "On Saturday your agent paid ₹2,400 for a lamp that usually sells for ₹1,600 to ₹2,000, to save your time.",
        options: [
          { k: "ask", t: "Ask for a lower price", me: "Speaking up for a fair price",
            fix: "Let me make the offer on handmade things", fixed: "It will let you bargain next time." },
          { k: "pay", t: "Pay it. I like supporting the maker", me: "Supporting small makers" },
          { k: "shy", t: "Pay, because asking feels awkward", fade: true,
            fix: "Let me try asking once next time", fixed: "It will step back and let you ask for the price yourself." },
          { k: "agent", t: "Let my agent handle it", fade: true }
        ],
        tip: "Ask for a better price once this week, in person." },

      { icon: "letter", place: "Post office", skill: "people",
        question: "When did you last write to a close friend yourself?",
        reason: "On Saturday your agent wrote and sent Arjun's birthday message at midnight.",
        options: [
          { k: "week", t: "This week", me: "Personal effort with friends" },
          { k: "month", t: "This month", me: "Personal effort with friends" },
          { k: "cant", t: "I can't remember", fade: true,
            fix: "Remind me, I'll write to close friends", fixed: "It will remind you, and you'll write the message." }
        ],
        tip: "Write one message to a friend yourself this week." },

      { icon: "bank", place: "Bank", skill: "money",
        question: "Roughly how much did you spend on food last week?",
        reason: "₹6,800 across 14 orders, most of them after 8 pm.",
        options: [
          { k: "low", t: "Under ₹2,000", fade: true, fix: FIX_SPEND.fix, fixed: FIX_SPEND.fixed },
          { k: "mid", t: "₹2,000 to ₹5,000", fade: true, fix: FIX_SPEND.fix, fixed: FIX_SPEND.fixed },
          { k: "high", t: "Over ₹5,000", me: "You know where your money goes" },
          { k: "idk", t: "No idea", fade: true, fix: FIX_SPEND.fix, fixed: FIX_SPEND.fixed }
        ],
        tip: "Look at your week's spending for one minute every Sunday." }
    ]
  }
];

// What your agent shared about LAST week. stop = which stop it became. skip = why our model left it out.
WEEKS[0].log = [
  { day: "Mon", area: "Bills", icon: "bank", did: "Paid the electricity bill, ₹2,140", skip: "Routine. Same as every month." },
  { day: "Tue", area: "Travel", icon: "plane", did: "Rebooked your cancelled 7 am Delhi flight to 2 pm, ₹5,400", looked: "9:30 am flight, ₹8,900", why: "Cheapest seat left", stop: 0 },
  { day: "Tue", area: "Shopping", icon: "tv", did: "Bought a 55-inch TV for ₹45,000", looked: "65-inch for ₹58,000 · OLED 55-inch for ₹62,000", why: "Best deal: ₹6,000 below the usual price", skip: "A big buy, but Judging value was checked 2 weeks ago." },
  { day: "Tue", area: "Health", icon: "check", did: "Refilled your vitamin D tablets", skip: "Routine refill." },
  { day: "Wed", area: "Home", icon: "sofa", did: "Picked and ordered a grey fabric sofa on sale, ₹35,000", looked: "Solid wood sofa, ₹42,000, lasts 15 years", why: "Saves ₹7,000 and arrives this week", stop: 1 },
  { day: "Wed", area: "Travel", icon: "calendar", did: "Booked 5 cabs to the office", skip: "Same route as always." },
  { day: "Thu", area: "Work", icon: "office", did: "Signed Vendor B for the launch project", looked: "Vendor A: ₹40,000 more, never late", why: "Lowest cost. Vendor B missed 2 deadlines last year", stop: 2 },
  { day: "Thu", area: "Groceries", icon: "pan", did: "Reordered groceries, ₹1,850", skip: "Same list as last week." },
  { day: "Fri", area: "Family", icon: "cake", did: "Reminded you of Mom's birthday at 8 am, sent a wish, booked dinner for ₹3,200", why: "Family birthday reminder on the day", stop: 3 },
  { day: "Sat", area: "Shopping", icon: "lamp", did: "Paid ₹2,400 for a handmade lamp at the craft market", looked: "Similar lamps sell for ₹1,600 to ₹2,000", why: "Paid fast to save your time", stop: 4 },
  { day: "Sat", area: "Friends", icon: "letter", did: "Wrote and sent Arjun a birthday message at midnight", why: "Never miss a close friend's birthday", stop: 5 },
  { day: "All week", area: "Food", icon: "bank", did: "Placed 14 food orders, ₹6,800 in total (11 after 8 pm)", why: "You were still working after 8 pm", stop: 6 },
  { day: "Mon–Fri", area: "Work", icon: "speech", did: "Moved 9 meetings and replied to 37 emails", skip: "Routine work admin." },
  { day: "Sun", area: "Fun", icon: "popcorn", did: "Picked your Sunday movie", why: "Matched your watch history", skip: "Knowing what I like was checked last week." }
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
