// Week Store: saves everything on this device (localStorage).
// Falls back to memory if the browser blocks storage.
window.MWT = window.MWT || {};

MWT.DEFAULT_INSTRUCTIONS = [
  "1. Use only important choices from last week, and never use private areas.",
  "2. Pick 5 to 7 buildings.",
  "3. Give more buildings to areas I struggled in last week.",
  "4. Make the biggest gap the 'in my own words' building.",
  "5. Make wrong options believable: use my own preferences and common reasons.",
  "6. Change the theme every week so the town feels new.",
  "7. Never use words that blame or judge me."
].join("\n");

MWT.defaultSettings = function () {
  return {
    minAmount: 5000,
    careAreas: ["work", "money", "family"],
    privateAreas: [],
    buildingsMin: 5,
    buildingsMax: 7,
    sendRepairsToAgent: false,
    instructions: MWT.DEFAULT_INSTRUCTIONS
  };
};

MWT.storage = (function () {
  var KEY = "my-week-town-v2";
  var memory = null;

  function fresh() {
    return { weekIndex: 0, reached: [0], results: {}, settings: MWT.defaultSettings() };
  }

  function load() {
    var raw = null;
    try { raw = window.localStorage.getItem(KEY); } catch (e) { raw = null; }
    if (!raw && memory) return JSON.parse(memory);
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
