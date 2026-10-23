# My Week Town (prototype)

A visual prototype of the 2040 product. Plain HTML, CSS and JavaScript. No install, no internet.

## Run it
Double-click `index.html`, or serve the folder (for example `python -m http.server 8123`) and open http://localhost:8123.

## Demo walkthrough
1. **Week 1:** Enter my town → read the week summary → visit all buildings → see the report → repair.
2. Press **Next week ▸**. Districts where you lost track now start foggy and get more buildings.
3. Play weeks 2–4. Open **Progress** to see the north star (Choice Awareness Rate) by week, the gap closure rate and the guardrails.
4. **Reset demo** starts again from week 1.

## What is simulated
| Real 2040 product | In this prototype |
|---|---|
| Connection to my personal agent | 4 sample weeks in `js/data/sample-weeks.js` |
| Memoryless AI model with editable instructions | Rule-based `buildTown()` in `js/townBuilder.js`, following the same instructions |
| Understanding my own words | Matching against reason synonyms in `js/data/reasons.js` |

Design and logic: see `../docs/build/`.
