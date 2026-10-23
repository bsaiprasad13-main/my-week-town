# My Week Town (prototype)

It's 2040. Your AI agent does almost everything for you. Every Sunday your week becomes a little town, and a pixel cat walks you to each choice your agent made last week. Each stop quietly checks one skill that fades when an agent does it all for you.

Plain HTML, CSS and JavaScript. No install. Double-click `index.html` (best at phone width).

## The journey
1. **Start:** "Last week, your agent did 43 things for you. 7 of them shaped you." Tap **Wake up the cat** and it walks you through the town.
2. **Each stop:** one direct question, with no story, that checks one fading skill: your memory, your priorities, your thinking, what you would do.
3. **Reveal:** your answer next to what your agent did last week, and whether that skill is **still strong** or **starting to fade**.
4. **Not how you'd do it?** One tap: "✋ Tell my agent: I'd pay a bit more for things that last."
5. **Town hall:** how many of your skills still feel like yours, one small step for each fading skill, what you told your agent, and what you got from the walk.
6. **Next Sunday:** a new town with a different number of stops and different skills.

## Skills checked (all 13 across two weeks)
| Week 1 (4 to 10 March) | Week 2 (11 to 17 March) |
|---|---|
| Judging value · Making decisions · Memory · Knowing where money goes · Questioning · Personal effort in relationships · Knowing what I like | Bargaining and speaking up · Handling problems · Trying new things · Daily life skills · Thinking through problems · Talking to strangers |

## Behind the town
Tap **Behind the town** (top right) to see:
- **Last week's log:** everything your agent shared about last week, which choices our model turned into stops, and which routine tasks it skipped.
- **Model instructions:** what we tell the AI model that builds the questions. You can edit and save them, like project instructions. A sample of what it sends back is shown below.

## What is simulated
Two sample weeks stand in for the AI agent. In the real product, an AI model with no memory builds each week's town from the agent's data.

The two weeks are fixed sample data in `data.js`, so every visitor sees the same clear story.

## Credits
3D icons: [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) by Microsoft, MIT License (see `icons-LICENSE.txt`). Cat: [oneko.js](https://github.com/adryd325/oneko.js) by adryd, MIT License (see `oneko-LICENSE.txt`).
