// Reason library: every reason the agent (or I) can have for a choice.
// synonyms are used to check "in my own words" answers.
window.MWT = window.MWT || {};

MWT.REASONS = {
  discount:      { label: "There was a big discount", area: "money", synonyms: ["discount", "sale", "offer", "deal", "% off", "percent off", "coupon"] },
  lowest_price:  { label: "It was the cheapest option", area: "money", synonyms: ["cheap", "cheapest", "lowest price", "low price", "less money", "budget", "cost less", "affordable"] },
  quality:       { label: "It had the best quality", area: "money", synonyms: ["quality", "well made", "durable", "lasts", "better made", "premium"] },
  saving:        { label: "It helped me save money long term", area: "money", synonyms: ["save", "saving", "savings", "long term", "in the long run"] },
  good_reviews:  { label: "It had the best reviews", area: "any", synonyms: ["review", "reviews", "rating", "ratings", "stars", "recommended"] },
  brand:         { label: "It's a well-known brand", area: "money", synonyms: ["brand", "known brand", "famous", "trusted brand"] },
  habit:         { label: "It's what I usually pick", area: "any", synonyms: ["usual", "always", "habit", "same as before", "last time", "regular"] },
  quiet:         { label: "I wanted somewhere quiet", area: "self", synonyms: ["quiet", "calm", "peace", "peaceful", "relax", "no crowd", "less crowded", "rest"] },
  close_by:      { label: "It was close by", area: "any", synonyms: ["close", "near", "nearby", "short drive", "distance", "not far"] },
  reliability:   { label: "It was the most reliable", area: "work", synonyms: ["reliable", "reliability", "never late", "on time", "dependable", "trust", "track record"] },
  speed:         { label: "It was the fastest", area: "work", synonyms: ["fast", "fastest", "quick", "quickest", "speed", "sooner", "deadline"] },
  team_fit:      { label: "It suited the team best", area: "work", synonyms: ["team", "colleagues", "everyone", "fit", "culture"] },
  experience:    { label: "They had the most experience", area: "work", synonyms: ["experience", "experienced", "senior", "years", "expert", "skills"] },
  kid_interest:  { label: "My child loves it", area: "family", synonyms: ["loves", "likes", "interest", "enjoys", "excited", "favourite", "favorite", "child wants", "kid wants"] },
  family_time:   { label: "More time together as a family", area: "family", synonyms: ["together", "family time", "time with", "bond", "with family"] },
  safety:        { label: "It was the safest choice", area: "family", synonyms: ["safe", "safety", "secure", "risk", "careful"] },
  healthy:       { label: "It was the healthier option", area: "self", synonyms: ["health", "healthy", "healthier", "fit", "nutrition", "diet"] },
  convenience:   { label: "It was the easiest option", area: "any", synonyms: ["easy", "easiest", "convenient", "simple", "hassle", "no effort"] },
  trending:      { label: "It's popular right now", area: "any", synonyms: ["popular", "trending", "everyone has", "in fashion", "viral"] },
  partner_likes: { label: "My partner would like it", area: "family", synonyms: ["partner likes", "she likes", "he likes", "wife", "husband", "partner would"] }
};

MWT.reasonLabel = function (key) {
  if (key === "dont_know") return "I don't know";
  var r = MWT.REASONS[key];
  return r ? r.label : key;
};
