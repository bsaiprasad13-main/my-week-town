# My Week Town (prototype)

It's 2040. Your AI agent does almost everything for you. Every Sunday, last week becomes a little town, and a pixel cat walks you to each choice your agent made. At each stop you check two things:

1. **Does your agent still choose like you?** Your priority vs your agent's priority.
2. **Do you still remember your own week?**

Plain HTML, CSS and JavaScript. No install. Double-click `index.html` (best at phone width).

## The journey
1. **Start:** "Last week, your agent did 43 things for you. 7 of them were choices about your life." Tap **Wake up the cat**.
2. **Priority stop:** one line, such as "Buying a TV, what matters most to you?", with 4 priorities to pick from.
3. **Reveal:** your priority next to your agent's priority, and what it did last week. If they differ: **✋ Tell my agent: For TVs, picture quality comes first.**
4. **Memory stop:** "Without checking: when is Mom's birthday?" Then the answer from last week's log.
5. **Town hall:** "3 of 5 choices made your way", a table of your priorities vs your agent's, what you remembered, and what you told your agent.

## The 7 stops
| # | Type | Question | Agent's priority |
|---|---|---|---|
| 1 | Priority | Buying a TV, what matters most to you? | Price |
| 2 | Priority | Flight cancelled. What matters most in the new booking? | Pay less |
| 3 | Priority | Choosing a sofa, what matters most? | Price |
| 4 | Priority | Picking a birthday gift for your best friend, what matters most? | Arrives on time |
| 5 | Memory | Without checking: when is Mom's birthday? | (8 March) |
| 6 | Memory | Without checking: whose birthday wish did your agent send last week? | (Arjun) |
| 7 | Priority | Ordering dinner after a long day, what matters most? | Fast |

## Behind the town
Tap **Behind the town** (top right) to see:
- **Last week's log:** everything your agent shared about last week, which choices became stops, and which routine tasks were skipped.
- **Model instructions:** what we tell the AI model that builds the town. You can edit and save them, like project instructions.

## What is simulated
One fixed sample week (`data.js`) stands in for the AI agent, so every visitor sees the same clear story. In the real product, an AI model with no memory builds each week's town from the agent's log.

## Credits
3D icons: [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) by Microsoft, MIT License (see `icons-LICENSE.txt`). Cat: [oneko.js](https://github.com/adryd325/oneko.js) by adryd, MIT License (see `oneko-LICENSE.txt`).
