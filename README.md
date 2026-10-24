# My Week Town (prototype)

It's 2040, and your AI agent makes most of your choices. My Week Town is a short game you can play **anytime**: a pixel cat walks you through a little town built from what your agent did recently, and checks one thing: **does your agent still choose like you?** You decide which corrections go back to your agent.

Plain HTML, CSS and JavaScript. No install. Open `index.html` (best at phone width).

## Two interfaces
| Page | Who | What it shows |
|---|---|---|
| `index.html` | The user | The game only. No agent data, no model, no instructions |
| `admin.html` | The maintainer | Catch-up log, the agent's raw data, the agent's picture of the user, updates received, games played, editable model instructions, and demo controls |

## How a game works
1. **Wake up the cat.** The app catches up with the agent, fetching only what happened **after the last successful catch-up** (the first run looks at the last 7 days). Each run is logged with its date and time.
2. **Questions (3 to 5):**
   - **New crucial choices** first: "Your agent bought a TV (and it's very proud of the deal). Be honest: what did you want it to nail?" Pick 1 of 4 priorities, or type your own.
   - **Nothing or little new?** Quick taste checks from everyday areas not checked lately: "Your perfect weekend, ranked. No wrong answers, only lazy ones." Tap the 4 priorities in order.
   - Extra crucial choices wait for the next game.
3. **Reveal:** your priority (or order) next to your agent's, and what it did. If it differs, **Save for my agent**.
4. **Town hall:** how many choices were made your way, You vs Agent, and **Send updates to your agent**: tick the ones you want, untick the rest. The agent replies to each one.
5. **Next game:** when the agent acts in an area you updated, the reveal shows "Your agent followed the update you sent".

## Trying the full loop (demo)
1. Play once in `index.html`, then send a few updates.
2. Play again right away: nothing new, so you get taste checks.
3. In `admin.html`, press **Simulate new agent activity**, then play again. The agent now chooses by your updates.
4. **Reset demo** in `admin.html` starts over.

Data is saved in the browser (localStorage), shared by both pages on the same site.

## What is simulated
Sample data (`data.js`) stands in for the personal AI agent. `store.js` holds the catch-up, question building and update logic used by both pages. In the real product, a fresh AI model with no memory prepares each game from the agent's log, following the instructions in the admin page.

## Credits
3D icons: [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) by Microsoft, MIT License (see `icons-LICENSE.txt`). Cat: [oneko.js](https://github.com/adryd325/oneko.js) by adryd, MIT License (see `oneko-LICENSE.txt`).
