# My Week Town (prototype)

It's 2040, and your AI agent makes most of your choices. My Week Town is a short game you can play **anytime**: a curious pixel cat walks you through a little town and asks what you like. When your answer differs from what your AI thinks, the cat asks if it should let your AI know.

Plain HTML, CSS and JavaScript. No install. Open `index.html` (best at phone width).

## Two sections, one app
| Section | Who sees it | What's in it |
|---|---|---|
| **User** | Everyone (user and admin) | The game only. No agent data, no model, no instructions |
| **Admin** | Only the admin role | Overview with the cat's voice switch, then detail pages: catch-up log, data from the agent, the agent's picture of the user, updates and games, icon library, editable model instructions. Plus demo controls |

- **Role switch:** "Switch to admin" in the header (demo only, not secure). As admin, the header shows **User | Admin** tabs. "Exit admin" or "Switch to user role" goes back. `admin.html` opens the app in the admin role.

## Going back, on every screen
- **Home** button in the header (asks to confirm mid-game; unanswered choices wait for the next game).
- **Catch-up result:** "← Back" to home. That catch-up doesn't count, so nothing is skipped.
- **Question and answer:** "← Previous" (jumps back instantly), "← Change my answer", and "← Back" from the typed answer.
- **Thank-you screen:** "← Back" to the last question.
- **Admin detail pages:** "← Back to overview".
- The phone/browser back button does the same as the on-screen back.

## How a game works
1. **"Let's see what you like."** Tap **Wake up the cat**. Behind the scenes, the app catches up with the agent: only what happened **after the last successful catch-up** (first run: last 7 days). Each run is logged for the admin.
2. **"The cat has 5 questions, it seems."** 4 to 6 questions: everyday situations from the user's week first (dinner, groceries, getting to work, weekends, chores, workouts, small gifts), topped up with fun everyday checks when little happened. No rare big purchases.
3. **The cat asks**, in the voice the admin picked:
   - *The cat speaks:* "Hmm, I've been wondering… Monday, 8:40 am, and you're a bit late. How do you get to work?"
   - *Narrator:* "The cat is curious… Monday, 8:40 am, and you're a bit late. How do you get to work?"
   Each question is one small situation where a single decision shows a clear priority. 4 concrete choices (cab ₹320 / metro ₹40 / wait for an AC cab / bike-share), plus **Something else** to type your own. One answer only. Questions never mention the AI agent.
4. **The cat reacts.** Same as what the AI thinks: "I knew it!" Different: "Ooh, noted! Should I let your AI know?" **Yes** sends it right away; **No** keeps it private. No other AI details are shown.
5. **"Thanks! That's all for now."** How many the cat guessed right, and what your AI now knows.

## Icons
Each question gets one icon from a 69-icon library in 7 groups (Shopping, Food, Travel, Home, People, Work and money, Health and fun). The model picks the closest one; if nothing fits it uses a fallback. The admin can browse the library.

## Trying the full loop (demo)
1. Play once in `index.html` and say **Yes** to a few "Should I let your AI know?" questions.
2. Play again right away: nothing new, so you get fun everyday checks.
3. Switch to admin, open the **Admin** tab and press **Simulate new agent activity**. Go to the **User** tab and play again: the agent now chooses by your updates.
4. **Reset demo** in the Admin tab starts over.

Data is saved in the browser (localStorage).

## What is simulated
Sample data (`data.js`) stands in for the personal AI agent. `store.js` holds the catch-up, question building and update logic; `app.js` is the game; `admin.js` is the role switch, tabs and admin section. In the real product, a fresh AI model with no memory prepares each game from the agent's log, following the instructions in the admin page.

## Credits
3D icons: [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) by Microsoft, MIT License (see `icons-LICENSE.txt`). Cat: [oneko.js](https://github.com/adryd325/oneko.js) by adryd, MIT License (see `oneko-LICENSE.txt`).
