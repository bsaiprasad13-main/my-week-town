// Scoring Engine: compares my answer with the real reason.
// Answers: { picked: reasonKey } · { other: "my own words" } · { notSure: true }
// Results: "lit" (same reason) · "cracked" (different reason) · "fog" (not sure)
window.MWT = window.MWT || {};

MWT.scoring = (function () {
  function norm(text) { return (text || "").toLowerCase().replace(/[’']/g, "'").trim(); }

  // Which reason keys does this text mention?
  function reasonsIn(text) {
    var t = norm(text), found = [];
    Object.keys(MWT.REASONS).forEach(function (k) {
      if (MWT.REASONS[k].synonyms.some(function (s) { return t.indexOf(s) !== -1; })) found.push(k);
    });
    return found;
  }

  function isNotSure(text) {
    var t = norm(text);
    return t === "" || /(don'?t know|dont know|not sure|no idea|idk)/.test(t);
  }

  function score(building, decision, answer) {
    var real = decision.realReasons;
    if (answer.notSure) return { result: "fog" };

    if (answer.picked) {
      return { result: real.indexOf(answer.picked) !== -1 ? "lit" : "cracked", myReasonKey: answer.picked };
    }

    // "Other": my own words
    var text = answer.other || "";
    if (isNotSure(text)) return { result: "fog" };
    var mine = reasonsIn(text);
    var words = norm(text).split(/\s+/).filter(Boolean).length;
    var gaveReason = words >= 2 || mine.length > 0;
    if (mine.some(function (k) { return real.indexOf(k) !== -1; })) return { result: "lit", ownPass: true, myReasonKey: mine[0] };
    if (gaveReason) return { result: "cracked", ownPass: true, myReasonKey: mine[0] || null };
    return { result: "fog" };
  }

  // Gap report: passed into NEXT week's Town Builder (the builder itself remembers nothing).
  function gapReport(town, answers, decisionsById) {
    var byArea = {}, gapReasonKeys = [];
    town.buildings.forEach(function (b) {
      var a = byArea[b.area] || (byArea[b.area] = { buildings: 0, lit: 0, cracked: 0, fog: 0 });
      var res = answers[b.id] ? answers[b.id].result : "fog";
      a.buildings++;
      a[res]++;
      if (res !== "lit") {
        var k = decisionsById[b.decisionId].realReasons[0];
        if (gapReasonKeys.indexOf(k) === -1) gapReasonKeys.push(k);
      }
    });
    return { weekId: town.weekId, byArea: byArea, gapReasonKeys: gapReasonKeys };
  }

  return { score: score, gapReport: gapReport, reasonsIn: reasonsIn };
})();
