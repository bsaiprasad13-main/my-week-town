// Settings: editable instructions, "important" rules, private areas, repairs to agent.
window.MWT = window.MWT || {};

MWT.settingsScreen = (function () {
  var esc = MWT.esc;

  function checks(name, selected) {
    return MWT.AREAS.map(function (a) {
      return '<label><input type="checkbox" name="' + name + '" value="' + a + '"' + (selected.indexOf(a) !== -1 ? " checked" : "") + "> " + MWT.AREA_NAMES[a] + "</label>";
    }).join("");
  }

  function render(el, ctx) {
    var s = ctx.settings;
    el.innerHTML = '<div class="card"><h1>Settings</h1>' +
      '<label class="field" for="ins">Instructions the town builder follows</label>' +
      '<textarea id="ins" rows="8">' + esc(s.instructions) + "</textarea>" +
      '<p class="note">In 2040 an AI model with no memory reads these instructions every week. In this prototype, the same rules run as code, and the settings below control them.</p>' +
      '<button type="button" class="btn secondary" id="ins-reset">Reset instructions</button>' +

      '<label class="field" for="min">A choice is important if it costs at least (₹)</label><input id="min" type="number" min="0" step="500" value="' + s.minAmount + '">' +
      '<p class="small muted">…or affects other people, or is in one of these areas:</p><div class="checks" id="care">' + checks("care", s.careAreas) + "</div>" +

      '<label class="field">Private areas (never used in the game)</label><div class="checks" id="priv">' + checks("priv", s.privateAreas) + "</div>" +

      '<label class="field" for="max">Buildings per week (max)</label><select id="max">' +
      [5, 6, 7].map(function (n) { return '<option value="' + n + '"' + (s.buildingsMax === n ? " selected" : "") + ">" + n + "</option>"; }).join("") + "</select>" +

      '<label class="field"><input type="checkbox" id="send"' + (s.sendRepairsToAgent ? " checked" : "") + "> Send corrected reasons to my agent</label>" +
      '<p class="small muted">Off by default. The goal is you understanding yourself, not making your agent more accurate.</p>' +

      '<div class="row" style="margin-top:16px"><button class="btn" id="save">Save settings</button><span id="saved" class="done-tag"></span></div>' +
      '<p class="note" style="margin-top:12px">Changes apply to towns built from now on. A town you have started stays the same.</p></div>' +

      '<div class="card"><h3>Your data</h3><p class="muted small">Everything is stored only on this device.</p>' +
      '<button class="btn secondary" id="wipe">Delete all my data</button></div>';

    el.querySelector("#ins-reset").addEventListener("click", function () { el.querySelector("#ins").value = MWT.DEFAULT_INSTRUCTIONS; });
    el.querySelector("#save").addEventListener("click", function () {
      function vals(name) { return Array.prototype.map.call(el.querySelectorAll('input[name="' + name + '"]:checked'), function (i) { return i.value; }); }
      var min = parseInt(el.querySelector("#min").value, 10);
      MWT.app.saveSettings({
        instructions: el.querySelector("#ins").value.trim() || MWT.DEFAULT_INSTRUCTIONS,
        minAmount: isNaN(min) || min < 0 ? 5000 : min,
        careAreas: vals("care"),
        privateAreas: vals("priv"),
        buildingsMax: Math.max(5, Math.min(7, parseInt(el.querySelector("#max").value, 10) || 7)),
        sendRepairsToAgent: el.querySelector("#send").checked
      });
      el.querySelector("#saved").textContent = "✔ Saved";
    });
    el.querySelector("#wipe").addEventListener("click", function () {
      if (window.confirm("Delete all your town data on this device?")) MWT.app.resetAll();
    });
  }

  return { render: render };
})();
