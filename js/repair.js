// Repair: confirm or correct reasons for cracked and foggy buildings.
// Repairs never change this week's score: the score shows awareness BEFORE being told.
window.MWT = window.MWT || {};

MWT.repair = (function () {
  var esc = MWT.esc;

  function renderRepair(el, ctx) {
    var r = ctx.result;
    if (!r.finished) { el.innerHTML = '<div class="card"><p>Finish your town first.</p><button class="btn" data-go="town">Back to town</button></div>'; return; }
    var items = r.town.buildings.filter(function (b) { return r.answers[b.id].result !== "lit"; });
    var sending = ctx.settings.sendRepairsToAgent;
    var choices = (ctx.week.myPreferences || []).concat(["discount", "lowest_price", "quality", "convenience", "safety"])
      .filter(function (k, i, a) { return a.indexOf(k) === i; });

    var list = items.map(function (b) {
      var d = ctx.byId[b.decisionId], rep = r.repairs[b.id], res = r.answers[b.id].result;
      var real = d.realReasons.map(MWT.reasonLabel).join(" · ");
      var status = rep
        ? '<p class="done-tag">✔ ' + (rep.action === "correct" ? "Your reason saved: " + esc(MWT.reasonLabel(rep.myReason)) : rep.action === "gotit" ? "Got it" : "Confirmed the agent's reason") +
          (rep.action === "correct" ? (sending ? " · sent to your agent" : " · kept private") : "") + "</p>"
        : '<div class="row">' +
          (res === "cracked" ? '<button class="btn secondary" data-act="confirm" data-b="' + b.id + '">That reason was fine</button>' : '<button class="btn secondary" data-act="gotit" data-b="' + b.id + '">Got it</button>') +
          '<select aria-label="My real reason" data-sel="' + b.id + '"><option value="">My real reason is…</option>' +
          choices.map(function (k) { return '<option value="' + k + '">' + esc(MWT.reasonLabel(k)) + "</option>"; }).join("") +
          '</select><button class="btn" data-act="correct" data-b="' + b.id + '">Save my reason</button></div>';
      return '<div class="repair-item"><h3>' + (res === "cracked" ? "🧱 " : "☁️ ") + d.icon + " " + esc(d.title) + "</h3>" +
        '<p class="small muted">' + (d.madeBy === "me" ? "Your reason at the time" : "Your agent's reason") + ": <strong>" + esc(real) + "</strong></p>" + status + "</div>";
    }).join("");

    el.innerHTML = '<div class="card"><h1>Repair your town</h1>' +
      '<p class="muted">Look again at the choices you lost track of. Repairs help you understand yourself; they don\'t change this week\'s score. ' +
      (sending ? "Corrected reasons are sent to your agent." : "Corrected reasons stay private (change this in Settings).") + "</p>" +
      (items.length ? list : '<p class="done-tag">Every building is lit. Nothing to repair.</p>') + "</div>" +
      '<div class="row"><button class="btn secondary" data-go="report">Back to report</button><button class="btn secondary" data-go="progress">See my progress</button></div>';

    el.querySelectorAll("[data-act]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-b"), act = btn.getAttribute("data-act");
        if (act === "correct") {
          var v = el.querySelector('[data-sel="' + id + '"]').value;
          if (!v) { el.querySelector('[data-sel="' + id + '"]').focus(); return; }
          MWT.app.saveRepair(id, { action: "correct", myReason: v, sendToAgent: sending });
        } else {
          MWT.app.saveRepair(id, { action: act });
        }
      });
    });
  }

  return { renderRepair: renderRepair };
})();
