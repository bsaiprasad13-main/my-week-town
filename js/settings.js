// Settings: kept short. Private areas, sharing with the agent, and the builder's instructions.
window.MWT = window.MWT || {};

MWT.settingsScreen = (function () {
  var esc = MWT.esc;

  function render(el, ctx) {
    var s = ctx.settings;
    var areas = ["work", "money", "family", "self"].map(function (a) {
      return '<label><input type="checkbox" name="priv" value="' + a + '"' + (s.privateAreas.indexOf(a) !== -1 ? " checked" : "") + "> " + MWT.AREA_NAMES[a] + "</label>";
    }).join("");
    el.innerHTML = '<button class="back" data-go="map">← Map</button><div class="card"><h1>Settings</h1>' +
      '<h3>Keep private</h3><p class="muted small">These parts of your life are never used in the town.</p><div class="checks">' + areas + "</div>" +
      '<h3 style="margin-top:16px">Tell my agent?</h3><label class="checks"><input type="checkbox" id="send"' + (s.sendRepairsToAgent ? " checked" : "") +
      "> When I say “that's not my reason”, tell my agent</label>" +
      '<p class="muted small">Off by default. The point is for you to understand yourself, not to train your agent.</p>' +
      '<details style="margin-top:12px"><summary>Instructions for the town builder</summary>' +
      '<p class="note">In 2040 an AI with no memory reads these every week to build your town. In this prototype the same rules run as code.</p>' +
      '<textarea id="ins" rows="8">' + esc(s.instructions) + "</textarea></details>" +
      '<div class="row" style="margin-top:16px"><button class="btn" id="save">Save</button><span id="saved" class="done-tag"></span></div>' +
      '<p class="muted small">Changes apply from the next town you open. Your data stays on this device.</p></div>';

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
