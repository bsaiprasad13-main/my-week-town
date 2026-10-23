// Town Builder: the "memoryless model".
// buildTown(weekData, lastGapReport, settings) -> townPlan
// It keeps NOTHING between calls. Same input always gives the same town.
// In 2040 an AI model follows the editable instructions; here JavaScript follows the same rules.
window.MWT = window.MWT || {};

MWT.AREAS = ["work", "money", "family", "friends", "self"];
MWT.AREA_NAMES = { work: "Work", money: "Money", family: "Family", friends: "Friends", self: "Me time" };
MWT.CHARACTERS = {
  work:    { id: "boss",    name: "Your boss",    icon: "👔" },
  money:   { id: "partner", name: "Your partner", icon: "❤️" },
  family:  { id: "child",   name: "Riya",         icon: "🧒" },
  friends: { id: "friend",  name: "Your friend",  icon: "🧑‍🤝‍🧑" },
  self:    { id: "friend",  name: "Your friend",  icon: "🧑‍🤝‍🧑" }
};
MWT.THEMES = [
  { id: "monsoon", name: "Monsoon evening", sky: "🌧️" },
  { id: "winter", name: "Winter morning", sky: "☁️" },
  { id: "festival", name: "Festival night", sky: "🪔" },
  { id: "summer", name: "Summer afternoon", sky: "☀️" }
];

MWT.townBuilder = (function () {
  // Small seeded random generator, so the same week always shuffles the same way.
  function seedFrom(text) {
    var h = 2166136261;
    for (var i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(list, rand) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rand() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  // Step 1: keep important choices
  function isImportant(d, s) {
    if (s.privateAreas.indexOf(d.area) !== -1) return false;
    if (!d.realReasons || d.realReasons.length === 0) return false;
    return d.amount >= s.minAmount || d.affectsOthers || s.careAreas.indexOf(d.area) !== -1;
  }

  function areaHadGaps(gap, area) {
    var a = gap && gap.byArea && gap.byArea[area];
    return !!(a && (a.cracked + a.fog) > 0);
  }

  // Step 2: priority score
  function priority(d, gap) {
    var p = 0;
    if (areaHadGaps(gap, d.area)) p += 3;
    if (gap && gap.gapReasonKeys && d.realReasons.some(function (r) { return gap.gapReasonKeys.indexOf(r) !== -1; })) p += 2;
    if (d.amount >= 20000 || d.affectsOthers) p += 2;
    if (d.madeBy !== "me") p += 1;
    return p;
  }

  // Step 3: size
  function sizeOf(d) {
    if (d.amount >= 20000 || d.area === "family") return "large";
    if (d.amount >= 5000 || d.area === "work") return "medium";
    return "small";
  }

  function wrongReasons(d, prefs, count, rand) {
    var out = [];
    shuffle(prefs, rand).forEach(function (k) {
      if (out.length < count && d.realReasons.indexOf(k) === -1 && MWT.REASONS[k]) out.push(k);
    });
    var pool = Object.keys(MWT.REASONS).filter(function (k) {
      var r = MWT.REASONS[k];
      return (r.area === d.area || r.area === "any") && d.realReasons.indexOf(k) === -1 && out.indexOf(k) === -1;
    });
    shuffle(pool, rand).forEach(function (k) { if (out.length < count) out.push(k); });
    return out;
  }

  // Step 7: options. One question type for every building:
  // 3 reasons (1 real + 2 believable wrong ones, shuffled), then "Other" and "Not sure" in the screen.
  function buildOptions(b, d, prefs, rand) {
    var opts = [d.realReasons[0]].concat(wrongReasons(d, prefs, 2, rand));
    b.options = shuffle(opts, rand).map(function (k) { return { key: k, text: MWT.reasonLabel(k) }; });
  }

  function buildTown(week, gap, settings) {
    var s = Object.assign(MWT.defaultSettings(), settings || {});
    var max = Math.max(5, Math.min(7, s.buildingsMax || 7));
    var rand = rng(seedFrom(week.weekId));

    var important = week.decisions.filter(function (d) { return isImportant(d, s); });
    var ranked = important.map(function (d) { return { d: d, p: priority(d, gap) }; })
      .sort(function (a, b) { return (b.p - a.p) || (b.d.amount - a.d.amount); });

    // Every area with choices gets at least one building, then fill up to max.
    var picked = [];
    MWT.AREAS.forEach(function (area) {
      var first = ranked.filter(function (x) { return x.d.area === area; })[0];
      if (first && picked.length < max) picked.push(first);
    });
    ranked.forEach(function (x) { if (picked.length < max && picked.indexOf(x) === -1) picked.push(x); });
    picked.sort(function (a, b) { return (b.p - a.p) || (b.d.amount - a.d.amount); });

    // Step 6: one building per picked choice
    var buildings = picked.map(function (x, i) {
      var d = x.d;
      var b = {
        id: "b" + (i + 1), decisionId: d.id, area: d.area, size: sizeOf(d),
        character: MWT.CHARACTERS[d.area] || MWT.CHARACTERS.self,
        prompt: d.question, priority: x.p
      };
      buildOptions(b, d, week.myPreferences || [], rand);
      return b;
    });

    // Step 4: starting fog per district
    var districts = MWT.AREAS.filter(function (a) { return buildings.some(function (b) { return b.area === a; }); })
      .map(function (area) {
        var g = gap && gap.byArea && gap.byArea[area];
        var fog = g && g.buildings ? (g.cracked + g.fog) / g.buildings : 0;
        return { area: area, startFog: Math.round(fog * 100) / 100, buildingIds: buildings.filter(function (b) { return b.area === area; }).map(function (b) { return b.id; }) };
      });

    // Step 8: theme
    var num = parseInt(week.weekId.split("W")[1], 10) || 0;
    var theme = MWT.THEMES[num % MWT.THEMES.length];

    // Share of important choices per area (used to weight the north star estimate)
    var areaShare = {};
    important.forEach(function (d) { areaShare[d.area] = (areaShare[d.area] || 0) + 1; });
    Object.keys(areaShare).forEach(function (a) { areaShare[a] = areaShare[a] / important.length; });

    return {
      weekId: week.weekId, theme: theme, districts: districts, buildings: buildings,
      importantCount: important.length, areaShare: areaShare, lowSample: important.length < 3
    };
  }

  return { buildTown: buildTown, isImportant: isImportant };
})();
