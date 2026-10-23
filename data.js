// My Week Town: fixed sample data
// Two sample weeks: what the agent shared, and the town our model built from it.
// Each stop quietly checks one skill that can fade when an agent does everything for you.
// Sample data stands in for the AI agent. The number of stops comes from the week's data.

// The skills that can fade (from our analysis)
var SKILLS = {
  value:       { part: "money", name: "Judging value" },
  taste:       { part: "mirror", name: "Knowing what I like" },
  memory:      { part: "brain", name: "Memory" },
  money:       { part: "money", name: "Knowing where money goes" },
  questioning: { part: "search", name: "Questioning" },
  people:      { part: "handshake", name: "Personal effort in relationships" },
  bargain:     { part: "speech", name: "Bargaining and speaking up" },
  problems:    { part: "tools", name: "Handling problems" },
  newthings:   { part: "seedling", name: "Trying new things" },
  daily:       { part: "pan", name: "Daily life skills" },
  thinking:    { part: "thought", name: "Thinking through problems" }
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
      { icon: "tv", place: "Electronics store", skill: "value", type: "priority",
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

      { icon: "sofa", place: "Furniture market", skill: "taste", type: "tradeoff",
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

      { icon: "cake", place: "Mom's house", skill: "memory", type: "self",
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

      { icon: "bank", place: "Bank", skill: "money", type: "feel",
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

      { icon: "office", place: "Your office", skill: "questioning", type: "priority",
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

      { icon: "letter", place: "Post office", skill: "people", type: "why",
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
      { icon: "lamp", place: "Craft market", skill: "bargain", type: "why",
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

      { icon: "plane", place: "Airport", skill: "problems", type: "priority",
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

      { icon: "pasta", place: "Restaurant street", skill: "newthings", type: "why",
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

      { icon: "pan", place: "Your kitchen", skill: "daily", type: "who",
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

      { icon: "wifi", place: "Your home Wi-Fi", skill: "thinking", type: "who",
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

// What your agent shared with My Week Town this week.
// stop = which stop it became. skip = why our model left it out.
WEEKS[0].total = 43;
WEEKS[0].log = [
  { day: "Mon", area: "Bills", icon: "bank", did: "Paid the electricity bill, ₹2,140", skip: "Routine. Same as every month." },
  { day: "Tue", area: "Shopping", icon: "tv", did: "Bought a 55-inch TV for ₹45,000", looked: "65-inch for ₹58,000 · OLED 55-inch for ₹62,000", why: "Best deal: ₹6,000 below the usual price", stop: 0 },
  { day: "Tue", area: "Health", icon: "check", did: "Refilled your vitamin D tablets", skip: "Routine refill." },
  { day: "Wed", area: "Home", icon: "sofa", did: "Ordered a grey fabric sofa on sale, ₹35,000", looked: "Solid wood sofa, ₹42,000, lasts 15 years", why: "Saves ₹7,000 and arrives this week", stop: 1 },
  { day: "Wed", area: "Travel", icon: "calendar", did: "Booked 5 cabs to the office", skip: "Same route as always." },
  { day: "Thu", area: "Work", icon: "office", did: "Signed Vendor B for the launch project", looked: "Vendor A: ₹40,000 more, never late", why: "Lowest cost. Note: Vendor B missed 2 deadlines last year", stop: 4 },
  { day: "Thu", area: "Groceries", icon: "pan", did: "Reordered groceries, ₹1,850", skip: "Same list as last week." },
  { day: "Fri", area: "Family", icon: "cake", did: "Reminded you of Mom's birthday at 8 am, sent a wish, booked dinner for ₹3,200", why: "Family birthday reminder on the day", stop: 2 },
  { day: "All week", area: "Food", icon: "bank", did: "Placed 14 food orders, ₹6,800 in total (11 after 8 pm)", why: "You were still working after 8 pm", stop: 3 },
  { day: "Sat", area: "Friends", icon: "letter", did: "Sent Arjun a birthday message at midnight", why: "Never miss a close friend's birthday", stop: 5 },
  { day: "Mon–Fri", area: "Work", icon: "speech", did: "Moved 9 meetings and replied to 37 emails", skip: "Routine work admin." },
  { day: "Sun", area: "Fitness", icon: "calendar", did: "Booked your usual yoga class", skip: "Routine." }
];

WEEKS[1].total = 39;
WEEKS[1].log = [
  { day: "Mon", area: "Bills", icon: "bank", did: "Paid the phone bill, ₹799", skip: "Routine. Same as every month." },
  { day: "Tue", area: "Insurance", icon: "clipboard", did: "Renewed car insurance", skip: "Same plan and price as last year. Nothing changed." },
  { day: "Wed", area: "Travel", icon: "plane", did: "Rebooked your cancelled 7 am Delhi flight to 2 pm, ₹5,400", looked: "9:30 am flight, ₹8,900", why: "Cheapest seat left", stop: 1 },
  { day: "Wed", area: "Home", icon: "wifi", did: "Fixed the Wi-Fi in 2 minutes by restarting the router", why: "Fast fix, didn't disturb you", stop: 4 },
  { day: "Thu", area: "Work", icon: "clipboard", did: "Summarised 3 work reports for you", skip: "Routine work admin." },
  { day: "Thu", area: "Health", icon: "calendar", did: "Booked your 6-monthly dentist check-up", skip: "Routine." },
  { day: "Fri", area: "Food", icon: "pasta", did: "Booked your usual Italian place, the 9th time this year", looked: "2 new places nearby rated 4.6+", why: "You rated it 5 stars", stop: 2 },
  { day: "All week", area: "Daily life", icon: "pan", did: "Booked 6 cabs, ordered 11 meals and did the grocery shopping", why: "More free time for you", stop: 3 },
  { day: "Sat", area: "Shopping", icon: "lamp", did: "Paid ₹2,400 for a handmade lamp at the craft market", looked: "Similar lamps sell for ₹1,600 to ₹2,000", why: "Paid fast to save your time", stop: 0 },
  { day: "Sat", area: "Groceries", icon: "pan", did: "Reordered groceries, ₹1,720", skip: "Same list as last week." }
];

// The instructions My Week Town gives its model every Sunday.
var MODEL = {
  intro: "Every Sunday, a fresh AI model with no memory reads your agent's log and builds your town. Because it remembers nothing, it can't learn to steer you. Here is exactly what we tell it.",
  steps: [
    { icon: "robot", title: "Who you are",
      lines: ["You build one person's weekly town of questions.",
              "You have no memory. You only see this week's log and the list of skills checked in recent weeks."] },
    { icon: "clipboard", title: "What you get",
      lines: ["This week's log from the person's agent: every action, the options it looked at, and its reason.",
              "The 13 skills that fade when an agent does everything."] },
    { icon: "search", title: "1. Pick the choices that matter",
      lines: ["Keep: money that isn't routine, family and friends, work risks, health, and habits that repeat a lot.",
              "Skip: tasks that are the same every week.",
              "Pick 3 to 7. The week decides how many, not you."] },
    { icon: "brain", title: "2. Match each one to a fading skill",
      lines: ["One skill per stop, never the same skill twice in a week.",
              "Pick skills not checked in the last 4 weeks first."] },
    { icon: "speech", title: "3. Write the question",
      lines: ["Context: 1 or 2 short sentences, with the real numbers from the log.",
              "Ask about the person, never a fact they can't know.",
              "Use one type: What matters to you, Your trade-off, Your reason, How you feel, Who decides, About you.",
              "3 or 4 short answers. One must be an honest \"not sure\" or \"I'd let my agent do it\"."] },
    { icon: "hand", title: "4. Prepare each answer",
      lines: ["Say what the answer shows about the person, in 3 to 5 words.",
              "Mark the answers that show the skill fading.",
              "If the answer differs from what the agent did, write one line the person can send to their agent."] },
    { icon: "check", title: "Rules",
      lines: ["Never judge or score the person. No right answers on prices or facts.",
              "Plain, everyday English. Short sentences.",
              "Never suggest products, brands or shops."] }
  ],
  example: '{\n  "place": "Electronics store",\n  "skill": "Judging value",\n  "type": "What matters to you",\n  "context": "Your old TV broke. On Tuesday, your agent bought a 55-inch TV for ₹45,000.",\n  "question": "When you buy a TV, what matters most to you?",\n  "agent_reason": "It was the best deal: ₹6,000 below the usual price.",\n  "answers": [\n    { "text": "A great picture, even if it costs more",\n      "shows": "Picture quality over price",\n      "tell_agent": "For TVs, picture quality comes first" },\n    { "text": "The best price for a decent TV",\n      "shows": "A good deal on big buys" },\n    { "text": "I\'m not sure. I\'ve never really thought about it",\n      "fading": true }\n  ]\n}'
};
