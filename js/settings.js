// Settings: private areas, sharing with the agent, and the card builder's instructions.
window.MWT = window.MWT || {};

MWT.settingsScreen = (function () {
  function render(el, ctx) {
    var s = ctx.settings;
    var areas = ["work", "money", "family", "self"].map(function (a) {
      return '<label><input type="checkbox" name="priv" value="' + a + '"' + (s.privateAreas.indexOf(a) !== -1 ? " checked" : "") + "> " + MWT.AREA_NAMES[a] + "</label>";
    }).join("");
    el.innerHTML = '<div class="panel"><h1>Settings</h1>' +
      '<h3>Keep private</h3><p class="muted small">These parts of your life never appear on cards.</p><div class="checks">' + areas + "</div>" +
      '<h3 style="margin-top:16px">Tell my agent?</h3><label class="checks"><input type="checkbox" id="send"' + (s.sendRepairsToAgent ? " checked" : "") +
      "> When I say “not my reason”, tell my agent</label>" +
      '<p class="muted small">Off by default. The point is for you to understand yourself, not to train your agent.</p>' +
      '<details style="margin-top:12px"><summary>Instructions for the card builder</summary>' +
      '<p class="note">In 2040 an AI with no memory reads these every week to pick your cards. In this prototype the same rules run as code.</p>' +
      '<textarea id="ins" rows="7">' + MWT.esc(s.instructions) + "</textarea></details>" +
      '<div class="row" style="margin-top:16px"><button class="btn" id="save">Save</button><span id="saved" class="done"></span></div>' +
      '<p class="muted small">Changes apply from next week\'s cards. Your data stays on this device.</p></div>';

    el.querySelector("#save").addEventListener("click", function () {
      MWT.app.saveSettings({
        privateAreas: Array.prototype.map.call(el.querySelectorAll('input[name="priv"]:checked'), function (i) { return i.value; }),
        sendRepairsToAgent: el.querySelector("#send").checked,
        instructions: el.querySelector("#ins").value.trim() || MWT.DEFAULT_INSTRUCTIONS
      });
      el.querySelector("#saved").textContent = "✔ Saved";
    });
  }
  return { render: render };
})();
