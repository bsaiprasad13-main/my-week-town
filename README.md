# My Week Town (prototype)

It's 2040. Your AI agent does almost everything for you. Every Sunday your week becomes a little town, and a little person walks to each choice your agent made. Each stop quietly checks one skill that fades when an agent does it all for you.

Plain HTML, CSS and JavaScript. No install. Double-click `index.html` (best at phone width).

## The journey
1. **Start:** "Your agent did 43 things for you this week. 6 of them were choices." The person wakes up, stretches and walks.
2. **Each stop:** a short line on what happened, then one question about your priorities, reasons or feelings.
3. **Reveal:** your reason next to your agent's reason, and whether that skill is **still strong** or **starting to fade**.
4. **Not how you'd do it?** One tap: "✋ Tell my agent: I'd pay a bit more for things that last."
5. **Town hall:** how many of your skills still feel like yours, one small step for each fading skill, what you told your agent, and what you got from the walk.
6. **Next Sunday:** a new town with a different number of stops and different skills.

## Skills checked
| Week 1 | Week 2 |
|---|---|
| Judging value · Knowing what I like · Memory · Knowing where money goes · Questioning · Personal effort in relationships | Bargaining and speaking up · Handling problems · Trying new things · Daily life skills · Thinking through problems |

## Behind the town
Tap **Behind the town** (top right) to see:
- **From your agent:** everything your agent shared this week, which choices our model turned into stops, and which routine tasks it skipped.
- **Model instructions:** exactly what we tell the AI model that builds the questions, plus a sample of what it sends back.

## What is simulated
Two sample weeks stand in for the AI agent. In the real product, an AI model with no memory builds each week's town from the agent's data.

The two weeks are fixed sample data in `data.js`, so every visitor sees the same clear story.

## Credits
3D icons: [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) by Microsoft, MIT License (see `icons-LICENSE.txt`). The walking person is drawn in code.
