// Saves everything on this device (localStorage). Falls back to memory if storage is blocked.
window.MWT = window.MWT || {};

MWT.DEFAULT_INSTRUCTIONS = [
  "1. Use only important choices from last week, and never use private areas.",
  "2. Pick 5 cards.",
  "3. Give more cards to areas I struggled in last week.",
  "4. Make wrong options believable: use my own preferences and common reasons.",
  "5. Never use words that blame or judge me."
].join("\n");

MWT.defaultSettings = function () {
  return {
    minAmount: 5000,
    careAreas: ["work", "money", "family"],
    privateAreas: [],
    cardsPerWeek: 5,
    sendRepairsToAgent: false,
    instructions: MWT.DEFAULT_INSTRUCTIONS
  };
};

MWT.storage = (function () {
  var KEY = "weekly-why-cards-v1";
  var memory = null;

  function fresh() { return { weekIndex: 0, reached: [0], results: {}, settings: MWT.defaultSettings() }; }

  function load() {
    var raw = null;
    try { raw = window.localStorage.getItem(KEY); } catch (e) { raw = null; }
    if (!raw && memory) raw = memory;
    if (!raw) return fresh();
    try {
      var s = JSON.parse(raw);
      s.settings = Object.assign(MWT.defaultSettings(), s.settings || {});
      s.results = s.results || {};
      s.reached = s.reached || [0];
      return s;
    } catch (e) { return fresh(); }
  }

  function save(state) {
    var raw = JSON.stringify(state);
    memory = raw;
    try { window.localStorage.setItem(KEY, raw); } catch (e) { /* memory only */ }
  }

  function reset() {
    memory = null;
    try { window.localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    return fresh();
  }

  return { load: load, save: save, reset: reset };
})();
