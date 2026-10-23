# Weekly Why Cards (prototype)

It's 2040. Your AI agent makes your choices. Every Sunday, 3 cards check **whether you know why** your agent chose what it chose, and **whether it chose your way**.

A guided visual prototype of one Sunday check-in. Plain HTML, CSS and JavaScript (3 files). No install. Fonts load from Google Fonts when online; offline it falls back to system fonts.

## Run it
Double-click `index.html`.

## The journey (8 screens)
1. **Intro:** "Your agent makes your choices. Do you still know why?"
2. **How do you choose?** Pick your top 3 criteria, in order (for example quality, fair mid-range price, reliability).
3. **Sunday check-in:** "Last week your agent made 8 big choices. Here are 3 worth a second look."
4. **3 cards** (TV, office vendor, health insurance). Each asks *"Why do you think your agent picked it?"*: 3 options, **Something else** (type it), or **Not sure**. Then it reveals:
   - what the agent actually looked at,
   - ✅ / ❔ **Did you know why?**
   - 🤝 / ⚠️ **Was it chosen your way?** (the agent's criterion against your top 3)
5. **Sunday report:** "You knew why: 2/3 · Chosen your way: 1/3," one insight line, and "Remind my agent: quality comes first."
6. **4 Sundays later:** awareness rising from 33% to 100% (illustrative).

## What is simulated
Sample data stands in for the AI agent, and the 4-week chart is illustrative. In the real product, an AI model with no memory would pick the cards from the agent's weekly data.
