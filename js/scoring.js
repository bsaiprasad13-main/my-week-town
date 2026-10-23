// Scoring: compares my answer with the real reason.
// Answers: { picked: reasonKey } · { other: "my own words" } · { notSure: true }
// Results: "lit" (knew it) · "cracked" (different reason) · "fog" (not sure)
window.MWT = window.MWT || {};

MWT.scoring = (function () {
  function norm(text) { return (text || "").toLowerCase().replace(/[’']/g, "'").trim(); }

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

  function score(card, decision, answer) {
    var real = decision.realReasons;
    if (answer.notSure) return { result: "fog" };
    if (answer.picked) return { result: real.indexOf(answer.picked) !== -1 ? "lit" : "cracked" };

    var text = answer.other || "";
    if (isNotSure(text)) return { result: "fog" };
    var mine = reasonsIn(text);
    var words = norm(text).split(/\s+/).filter(Boolean).length;
    if (mine.some(function (k) { return real.indexOf(k) !== -1; })) return { result: "lit", ownPass: true };
    if (words >= 2 || mine.length) return { result: "cracked", ownPass: true };
    return { result: "fog" };
  }

  // Gap report: passed into NEXT week's Card Builder (the builder itself remembers nothing).
  function gapReport(plan, answers, decisionsById) {
    var byArea = {}, gapReasonKeys = [];
    plan.cards.forEach(function (c) {
      var a = byArea[c.area] || (byArea[c.area] = { cards: 0, lit: 0, cracked: 0, fog: 0 });
      var res = answers[c.id] ? answers[c.id].result : "fog";
      a.cards++;
      a[res]++;
      if (res !== "lit") {
        var k = decisionsById[c.decisionId].realReasons[0];
        if (gapReasonKeys.indexOf(k) === -1) gapReasonKeys.push(k);
      }
    });
    return { weekId: plan.weekId, byArea: byArea, gapReasonKeys: gapReasonKeys };
  }

  return { score: score, gapReport: gapReport };
})();
