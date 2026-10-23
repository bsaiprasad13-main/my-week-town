// Scoring Engine: compares my answer with the real reason.
// Results: "lit" (same reason) · "cracked" (different reason) · "fog" (don't know) · "skipped"
window.MWT = window.MWT || {};

MWT.scoring = (function () {
  function norm(text) { return (text || "").toLowerCase().replace(/[’']/g, "'").trim(); }

  // Which reason keys does this text mention?
  function reasonsIn(text) {
    var t = norm(text), found = [];
    Object.keys(MWT.REASONS).forEach(function (k) {
      var r = MWT.REASONS[k];
      var hit = r.synonyms.some(function (s) { return t.indexOf(s) !== -1; });
      if (hit) found.push(k);
    });
    return found;
  }

  function isDontKnow(text) {
    var t = norm(text);
    return t === "" || /(don'?t know|dont know|not sure|no idea|idk)/.test(t);
  }

  function score(building, decision, answer) {
    if (answer.skipped) return { result: "skipped", ownPass: false };
    var real = decision.realReasons;

    if (building.challenge === "pick") {
      if (answer.picked === "dont_know") return { result: "fog" };
      return { result: real.indexOf(answer.picked) !== -1 ? "lit" : "cracked", myReasonKey: answer.picked };
    }

    if (building.challenge === "fake") {
      if (answer.picked === "dont_know") return { result: "fog" };
      return { result: answer.picked === building.fakeKey ? "lit" : "cracked" };
    }

    if (building.challenge === "whatif") {
      if (answer.picked === "notsure") return { result: "fog" };
      var isMain = real[0] === decision.whatIfFactor;
      var knewIt = isMain ? answer.picked === "no" : answer.picked === "yes";
      return { result: knewIt ? "lit" : "cracked" };
    }

    // In my own words
    var why = answer.text || "";
    var named = (answer.notPicked || "").trim().length >= 2;
    if (isDontKnow(why)) return { result: "fog", ownPass: false };
    var mine = reasonsIn(why);
    var matched = mine.some(function (k) { return real.indexOf(k) !== -1; });
    if (matched) return { result: "lit", ownPass: named, myReasonKey: mine[0] };
    var words = norm(why).split(/\s+/).filter(Boolean).length;
    if (words >= 2) return { result: "cracked", ownPass: named, myReasonKey: mine[0] || null };
    return { result: "fog", ownPass: false };
  }

  // Gap report: passed into NEXT week's Town Builder (the builder itself remembers nothing).
  function gapReport(town, answers, decisionsById) {
    var byArea = {}, gapReasonKeys = [];
    town.buildings.forEach(function (b) {
      var a = byArea[b.area] || (byArea[b.area] = { buildings: 0, lit: 0, cracked: 0, fog: 0 });
      var ans = answers[b.id];
      var res = ans ? ans.result : "skipped";
      a.buildings++;
      if (res === "lit") a.lit++;
      else if (res === "cracked") a.cracked++;
      else a.fog++; // fog and skipped both mean "not aware"
      if (res !== "lit") {
        var k = decisionsById[b.decisionId].realReasons[0];
        if (gapReasonKeys.indexOf(k) === -1) gapReasonKeys.push(k);
      }
    });
    return { weekId: town.weekId, byArea: byArea, gapReasonKeys: gapReasonKeys };
  }

  return { score: score, gapReport: gapReport, reasonsIn: reasonsIn };
})();
