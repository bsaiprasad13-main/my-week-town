# My Week Town (prototype)

It's 2040. Your AI agent makes your big choices. Every Sunday, your week becomes a little town, and your character walks through it, stopping at each choice your agent made.

Plain HTML, CSS and JavaScript (3 files). No install. Fonts load from Google Fonts when online; offline it falls back to system fonts.

## Run it
Double-click `index.html`. Best viewed at phone width.

## The journey
1. **Start:** "Your agent made 5 big choices for you this week." Tap **Start walking**.
2. **The walk:** your character walks from home along the road to each building. Buildings are grey until visited.
3. **At each building:** a question about *you*. The type changes with the choice:
   - *Which would you take?* (30% off TV, or ₹6,000 more for the better one)
   - *Who gets it?* (reliable Vendor A, or cheaper Vendor B)
   - *What matters most to you?* (fast claims, lowest price, big brand)
4. **The reveal:** what your agent actually did. ✨ **Same as you**, or 🚩 **Not your way** ("You value quality. Your agent went for saving money now.")
5. **Town hall:** "2/5 choices were made your way," where your agent drifted, and what you got:
   - you can explain every big choice from your week,
   - you know where your agent stops thinking like you,
   - you made the decisions yourself, so your judgement stays sharp,
   - **Teach my agent: quality first.**
6. **Next Sunday:** a new town with a different number of buildings (4) and new questions.

## What is simulated
Two sample weeks stand in for the AI agent. In the real product, an AI model with no memory builds each week's town from the agent's data: the number of buildings and the kind of question depend on what happened that week.
