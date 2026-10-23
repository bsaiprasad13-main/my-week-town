// Sample agent data: 4 weeks of "my" life in 2040.
// In the real product this comes from the Agent Connector (read-only).
// madeBy: "agent" (agent decided) · "approved" (agent picked, I tapped yes) · "me" (I decided)
window.MWT = window.MWT || {};

MWT.SAMPLE_WEEKS = [
  {
    weekId: "2040-W10", start: "2040-03-04", end: "2040-03-10",
    myPreferences: ["quiet", "reliability", "quality", "saving", "family_time"],
    totalDecisions: 142, agentDecisions: 131,
    decisions: [
      { id: "w10-d1", date: "2040-03-04", area: "money", icon: "🧳", title: "Booked a weekend trip to Coorg", amount: 40000, affectsOthers: true, madeBy: "approved",
        realReasons: ["discount"], rejectedOptions: ["Goa", "Ooty"], whatIfFactor: "discount", question: "Why did we book Coorg?" },
      { id: "w10-d2", date: "2040-03-05", area: "money", icon: "🛡️", title: "Renewed the health insurance plan", amount: 18000, affectsOthers: true, madeBy: "agent",
        realReasons: ["lowest_price"], rejectedOptions: ["Family Plus plan"], whatIfFactor: "lowest_price", question: "Why this insurance plan?" },
      { id: "w10-d3", date: "2040-03-06", area: "money", icon: "📱", title: "Bought a new phone", amount: 52000, affectsOthers: false, madeBy: "approved",
        realReasons: ["trending", "brand"], rejectedOptions: ["Last year's model"], whatIfFactor: "", question: "Why this phone?" },
      { id: "w10-d4", date: "2040-03-06", area: "work", icon: "🏢", title: "Picked Vendor B for the office project", amount: 500000, affectsOthers: true, madeBy: "approved",
        realReasons: ["lowest_price"], rejectedOptions: ["Vendor A"], whatIfFactor: "lowest_price", question: "Why Vendor B?" },
      { id: "w10-d5", date: "2040-03-07", area: "work", icon: "🧑‍💼", title: "Shortlisted Asha for the team lead role", amount: 0, affectsOthers: true, madeBy: "me",
        realReasons: ["experience"], rejectedOptions: ["Ravi"], whatIfFactor: "", question: "Why Asha for team lead?" },
      { id: "w10-d6", date: "2040-03-08", area: "family", icon: "🏫", title: "Chose the science fair for Riya", amount: 0, affectsOthers: true, madeBy: "me",
        realReasons: ["kid_interest"], rejectedOptions: ["Sports day"], whatIfFactor: "", question: "Papa, why the science fair?" },
      { id: "w10-d7", date: "2040-03-09", area: "family", icon: "🎁", title: "Bought a watch for my partner's birthday", amount: 12000, affectsOthers: true, madeBy: "agent",
        realReasons: ["good_reviews"], rejectedOptions: ["Pottery class voucher"], whatIfFactor: "", question: "Why a watch?" },
      { id: "w10-d8", date: "2040-03-09", area: "self", icon: "🥗", title: "Switched to a meal plan subscription", amount: 6000, affectsOthers: false, madeBy: "agent",
        realReasons: ["convenience"], rejectedOptions: ["Cooking at home"], whatIfFactor: "convenience", question: "Why the meal plan?" }
    ]
  },
  {
    weekId: "2040-W11", start: "2040-03-11", end: "2040-03-17",
    myPreferences: ["quiet", "reliability", "quality", "saving", "family_time"],
    totalDecisions: 156, agentDecisions: 144,
    decisions: [
      { id: "w11-d1", date: "2040-03-11", area: "money", icon: "🛋️", title: "Ordered a new sofa", amount: 35000, affectsOthers: true, madeBy: "approved",
        realReasons: ["discount"], rejectedOptions: ["Wooden sofa from the local shop"], whatIfFactor: "discount", question: "Why this sofa?" },
      { id: "w11-d2", date: "2040-03-12", area: "money", icon: "💳", title: "Moved savings into a new fund", amount: 100000, affectsOthers: true, madeBy: "agent",
        realReasons: ["trending"], rejectedOptions: ["Fixed deposit"], whatIfFactor: "trending", question: "Why this fund?" },
      { id: "w11-d3", date: "2040-03-13", area: "money", icon: "🎧", title: "Bought noise-cancelling headphones", amount: 15000, affectsOthers: false, madeBy: "approved",
        realReasons: ["lowest_price"], rejectedOptions: ["The pair with better build"], whatIfFactor: "lowest_price", question: "Why these headphones?" },
      { id: "w11-d4", date: "2040-03-13", area: "work", icon: "📦", title: "Chose a courier partner for client deliveries", amount: 80000, affectsOthers: true, madeBy: "agent",
        realReasons: ["speed"], rejectedOptions: ["The cheaper courier"], whatIfFactor: "speed", question: "Why this courier?" },
      { id: "w11-d5", date: "2040-03-14", area: "work", icon: "🗓️", title: "Moved the team offsite to Friday", amount: 0, affectsOthers: true, madeBy: "approved",
        realReasons: ["team_fit"], rejectedOptions: ["Wednesday"], whatIfFactor: "", question: "Why move the offsite to Friday?" },
      { id: "w11-d6", date: "2040-03-15", area: "family", icon: "🚗", title: "Booked a family car for the weekend", amount: 7000, affectsOthers: true, madeBy: "agent",
        realReasons: ["safety"], rejectedOptions: ["A smaller hatchback"], whatIfFactor: "safety", question: "Why the bigger car?" },
      { id: "w11-d7", date: "2040-03-16", area: "family", icon: "🎨", title: "Signed Riya up for art classes", amount: 9000, affectsOthers: true, madeBy: "me",
        realReasons: ["kid_interest"], rejectedOptions: ["Coding club"], whatIfFactor: "", question: "Papa, why art and not coding?" }
    ]
  },
  {
    weekId: "2040-W12", start: "2040-03-18", end: "2040-03-24",
    myPreferences: ["quiet", "reliability", "quality", "saving", "family_time"],
    totalDecisions: 149, agentDecisions: 136,
    decisions: [
      { id: "w12-d1", date: "2040-03-18", area: "money", icon: "🧺", title: "Bought a washing machine", amount: 32000, affectsOthers: true, madeBy: "approved",
        realReasons: ["discount"], rejectedOptions: ["The model with a 10-year warranty"], whatIfFactor: "discount", question: "Why this washing machine?" },
      { id: "w12-d2", date: "2040-03-19", area: "money", icon: "✈️", title: "Booked flights for the Diwali trip", amount: 48000, affectsOthers: true, madeBy: "agent",
        realReasons: ["lowest_price"], rejectedOptions: ["The direct flight"], whatIfFactor: "lowest_price", question: "Why the flight with a stop?" },
      { id: "w12-d3", date: "2040-03-20", area: "money", icon: "🏋️", title: "Joined a gym near the office", amount: 20000, affectsOthers: false, madeBy: "approved",
        realReasons: ["close_by"], rejectedOptions: ["The yoga studio"], whatIfFactor: "close_by", question: "Why this gym?" },
      { id: "w12-d4", date: "2040-03-20", area: "work", icon: "💻", title: "Picked a new project tool for the team", amount: 60000, affectsOthers: true, madeBy: "agent",
        realReasons: ["team_fit"], rejectedOptions: ["The tool we used before"], whatIfFactor: "", question: "Why switch tools?" },
      { id: "w12-d5", date: "2040-03-21", area: "work", icon: "🧾", title: "Renewed the contract with Vendor A", amount: 400000, affectsOthers: true, madeBy: "me",
        realReasons: ["reliability"], rejectedOptions: ["Vendor B"], whatIfFactor: "", question: "Why stay with Vendor A?" },
      { id: "w12-d6", date: "2040-03-22", area: "family", icon: "🏞️", title: "Planned a Sunday picnic at the lake", amount: 0, affectsOthers: true, madeBy: "approved",
        realReasons: ["family_time", "quiet"], rejectedOptions: ["The mall"], whatIfFactor: "", question: "Papa, why the lake?" },
      { id: "w12-d7", date: "2040-03-23", area: "family", icon: "👟", title: "Bought school shoes for Riya", amount: 5500, affectsOthers: true, madeBy: "agent",
        realReasons: ["good_reviews"], rejectedOptions: ["The shoes she picked in the shop"], whatIfFactor: "good_reviews", question: "Why these shoes and not mine?" }
    ]
  },
  {
    weekId: "2040-W13", start: "2040-03-25", end: "2040-03-31",
    myPreferences: ["quiet", "reliability", "quality", "saving", "family_time"],
    totalDecisions: 151, agentDecisions: 135,
    decisions: [
      { id: "w13-d1", date: "2040-03-25", area: "money", icon: "📺", title: "Bought a new TV", amount: 45000, affectsOthers: true, madeBy: "approved",
        realReasons: ["discount"], rejectedOptions: ["The smaller TV with better reviews"], whatIfFactor: "discount", question: "Why this TV?" },
      { id: "w13-d2", date: "2040-03-26", area: "money", icon: "🏦", title: "Took a car loan from a new bank", amount: 600000, affectsOthers: true, madeBy: "agent",
        realReasons: ["lowest_price"], rejectedOptions: ["Our usual bank"], whatIfFactor: "lowest_price", question: "Why a new bank for the loan?" },
      { id: "w13-d3", date: "2040-03-27", area: "money", icon: "🪴", title: "Subscribed to a plant-care service", amount: 5000, affectsOthers: false, madeBy: "approved",
        realReasons: ["trending"], rejectedOptions: ["Doing it myself"], whatIfFactor: "trending", question: "Why the plant service?" },
      { id: "w13-d4", date: "2040-03-27", area: "work", icon: "🧑‍💻", title: "Hired a freelancer for the website", amount: 90000, affectsOthers: true, madeBy: "approved",
        realReasons: ["experience"], rejectedOptions: ["A cheaper agency"], whatIfFactor: "experience", question: "Why this freelancer?" },
      { id: "w13-d5", date: "2040-03-28", area: "work", icon: "📊", title: "Chose the Q2 report format", amount: 0, affectsOthers: true, madeBy: "me",
        realReasons: ["team_fit"], rejectedOptions: ["Last quarter's format"], whatIfFactor: "", question: "Why change the report format?" },
      { id: "w13-d6", date: "2040-03-29", area: "family", icon: "🍽️", title: "Booked dinner for Mom's birthday", amount: 8000, affectsOthers: true, madeBy: "agent",
        realReasons: ["quiet", "family_time"], rejectedOptions: ["The rooftop restaurant"], whatIfFactor: "", question: "Why this restaurant for Mom?" },
      { id: "w13-d7", date: "2040-03-30", area: "family", icon: "🚲", title: "Bought a bicycle for Riya", amount: 9000, affectsOthers: true, madeBy: "approved",
        realReasons: ["safety"], rejectedOptions: ["The faster mountain bike"], whatIfFactor: "safety", question: "Papa, why not the mountain bike?" }
    ]
  }
];

// Short names shown under each building on the map
MWT.SHORT_NAMES = {
  "w10-d1": "Coorg trip", "w10-d2": "Health insurance", "w10-d3": "New phone", "w10-d4": "Vendor B",
  "w10-d5": "Team lead pick", "w10-d6": "Science fair", "w10-d7": "Birthday watch", "w10-d8": "Meal plan",
  "w11-d1": "New sofa", "w11-d2": "Savings fund", "w11-d3": "Headphones", "w11-d4": "Courier partner",
  "w11-d5": "Offsite day", "w11-d6": "Family car", "w11-d7": "Art classes",
  "w12-d1": "Washing machine", "w12-d2": "Diwali flights", "w12-d3": "Gym", "w12-d4": "Project tool",
  "w12-d5": "Vendor A contract", "w12-d6": "Lake picnic", "w12-d7": "School shoes",
  "w13-d1": "New TV", "w13-d2": "Car loan", "w13-d3": "Plant service", "w13-d4": "Freelancer",
  "w13-d5": "Report format", "w13-d6": "Mom's birthday dinner", "w13-d7": "Riya's bicycle"
};
