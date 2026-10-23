# Weekly Why Cards (prototype)

Every Sunday, 5 quick cards check whether you still know the reasons behind your own big choices, the ones your AI agent made for you in 2040.

Plain HTML, CSS and JavaScript. No install, no internet.

## Run it
Double-click `index.html`, or serve the folder (for example `python -m http.server 8123`) and open http://localhost:8123.

## How it works
1. **Welcome:** how many big choices your agent made last week, and what the cards do.
2. **5 cards, one at a time:** pick the real reason from 3 options, type your own with **Other reason**, or tap **Not sure**.
3. **After each card:** ✅ you knew why · 🔀 different reason (you're asked if the agent's reason is okay with you) · ❔ you'd lost track.
4. **Score:** "You knew why for 3 of 5," your awareness (the north star), and every card's real reason.
5. **Next week:** areas you missed get more cards. **Progress** shows awareness by week.

## What is simulated
| Real 2040 product | In this prototype |
|---|---|
| Connection to my personal agent | 4 sample weeks in `js/data/sample-weeks.js` |
| Memoryless AI model with editable instructions | Rule-based `buildWeek()` in `js/cardBuilder.js` |
| Understanding my typed reason | Matching against reason synonyms in `js/data/reasons.js` |
