// Card Builder: the "memoryless model".
// buildWeek(weekData, lastGapReport, settings) -> this week's cards
// It keeps NOTHING between calls. Same input always gives the same cards.
// In 2040 an AI model follows the editable instructions; here JavaScript follows the same rules.
window.MWT = window.MWT || {};

MWT.AREAS = ["work", "money", "family", "friends", "self"];
MWT.AREA_NAMES = { work: "Work", money: "Money", family: "Family", friends: "Friends", self: "Me time" };
MWT.ASKERS = {
  work: { name: "Your boss", icon: "👔" },
  money: { name: "Your partner", icon: "❤️" },
  family: { name: "Riya", icon: "🧒" },
  friends: { name: "Your friend", icon: "🧑‍🤝‍🧑" },
  self: { name: "Your friend", icon: "🧑‍🤝‍🧑" }
};

MWT.cardBuilder = (function () {
  // Seeded shuffle, so the same week always looks the same
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

  // Keep only important choices
  function isImportant(d, s) {
    if (s.privateAreas.indexOf(d.area) !== -1) return false;
    if (!d.realReasons || d.realReasons.length === 0) return false;
    return d.amount >= s.minAmount || d.affectsOthers || s.careAreas.indexOf(d.area) !== -1;
  }

  function areaHadGaps(gap, area) {
    var a = gap && gap.byArea && gap.byArea[area];
    return !!(a && (a.cracked + a.fog) > 0);
  }

  // Priority: weak areas and missed reasons from last week come first
  function priority(d, gap) {
    var p = 0;
    if (areaHadGaps(gap, d.area)) p += 3;
    if (gap && gap.gapReasonKeys && d.realReasons.some(function (r) { return gap.gapReasonKeys.indexOf(r) !== -1; })) p += 2;
    if (d.amount >= 20000 || d.affectsOthers) p += 2;
    if (d.madeBy !== "me") p += 1;
    return p;
  }

  // 1 real reason + 2 believable wrong ones (my own preferences first), shuffled
  function options(d, prefs, rand) {
    var wrong = [];
    shuffle(prefs, rand).forEach(function (k) {
      if (wrong.length < 2 && d.realReasons.indexOf(k) === -1 && MWT.REASONS[k]) wrong.push(k);
    });
    var pool = Object.keys(MWT.REASONS).filter(function (k) {
      var r = MWT.REASONS[k];
      return (r.area === d.area || r.area === "any") && d.realReasons.indexOf(k) === -1 && wrong.indexOf(k) === -1;
    });
    shuffle(pool, rand).forEach(function (k) { if (wrong.length < 2) wrong.push(k); });
    return shuffle([d.realReasons[0]].concat(wrong), rand).map(function (k) { return { key: k, text: MWT.reasonLabel(k) }; });
  }

  function buildWeek(week, gap, settings) {
    var s = Object.assign(MWT.defaultSettings(), settings || {});
    var count = s.cardsPerWeek || 5;
    var rand = rng(seedFrom(week.weekId));

    var important = week.decisions.filter(function (d) { return isImportant(d, s); });
    var ranked = important.map(function (d) { return { d: d, p: priority(d, gap) }; })
      .sort(function (a, b) { return (b.p - a.p) || (b.d.amount - a.d.amount); });

    // At least one card per area that has choices, then fill by priority
    var picked = [];
    MWT.AREAS.forEach(function (area) {
      var first = ranked.filter(function (x) { return x.d.area === area; })[0];
      if (first && picked.length < count) picked.push(first);
    });
    ranked.forEach(function (x) { if (picked.length < count && picked.indexOf(x) === -1) picked.push(x); });
    picked.sort(function (a, b) { return (b.p - a.p) || (b.d.amount - a.d.amount); });

    var cards = picked.map(function (x, i) {
      return {
        id: "c" + (i + 1), decisionId: x.d.id, area: x.d.area,
        asker: MWT.ASKERS[x.d.area] || MWT.ASKERS.self,
        prompt: x.d.question, options: options(x.d, week.myPreferences || [], rand), priority: x.p
      };
    });

    // Share of important choices per area (used to weight the north star estimate)
    var areaShare = {};
    important.forEach(function (d) { areaShare[d.area] = (areaShare[d.area] || 0) + 1; });
    Object.keys(areaShare).forEach(function (a) { areaShare[a] = areaShare[a] / important.length; });

    var focus = MWT.AREAS.filter(function (a) { return areaHadGaps(gap, a) && cards.some(function (c) { return c.area === a; }); });

    return { weekId: week.weekId, cards: cards, importantCount: important.length, areaShare: areaShare, focusAreas: focus, lowSample: important.length < 3 };
  }

  return { buildWeek: buildWeek, isImportant: isImportant };
})();
