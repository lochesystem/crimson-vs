/* ========================================================
   CRIMSON VS — Picture-in-Picture + Widget Fallback
   ======================================================== */
window.PiP = {
  _pipWindow: null,
  _widget: null,
  _widgetVisible: false,

  isSupported: function () {
    return !!(window.documentPictureInPicture && documentPictureInPicture.requestWindow);
  },

  init: function () {
    this._createWidget();
    var btn = document.getElementById("btn-afk-pip");
    if (btn) {
      btn.textContent = this.isSupported() ? "OPEN PiP" : "FLOAT WIDGET";
    }
  },

  toggle: function () {
    if (this.isSupported()) {
      if (this._pipWindow && !this._pipWindow.closed) {
        this._pipWindow.close();
        this._pipWindow = null;
      } else {
        this.openPiP();
      }
    } else {
      this._toggleWidget();
    }
  },

  openPiP: function () {
    var self = this;
    if (!this.isSupported()) {
      this._toggleWidget();
      return;
    }

    documentPictureInPicture.requestWindow({
      width: 340,
      height: 220
    }).then(function (pipWin) {
      self._pipWindow = pipWin;
      pipWin.document.body.innerHTML = self._buildHTML();
      self._injectStyles(pipWin.document);
      self.update();

      pipWin.addEventListener("pagehide", function () {
        self._pipWindow = null;
      });
    }).catch(function () {
      self._toggleWidget();
    });
  },

  _createWidget: function () {
    var el = document.createElement("div");
    el.id = "afk-float-widget";
    el.className = "afk-float-widget hidden";
    el.innerHTML = this._buildHTML() + '<button class="afk-widget-close" id="afk-widget-close">×</button>';
    document.body.appendChild(el);
    this._widget = el;

    var self = this;
    document.getElementById("afk-widget-close").addEventListener("click", function () {
      self._widgetVisible = false;
      el.classList.add("hidden");
    });
  },

  _toggleWidget: function () {
    if (!this._widget) return;
    this._widgetVisible = !this._widgetVisible;
    this._widget.classList.toggle("hidden", !this._widgetVisible);
    if (this._widgetVisible) this.update();
  },

  _buildHTML: function () {
    return (
      '<div class="pip-inner">' +
        '<div class="pip-title">CRIMSON VS — AFK</div>' +
        '<div class="pip-row">Rank: <span id="pip-rank">50</span></div>' +
        '<div class="pip-row">W/L: <span id="pip-wl">0/0</span></div>' +
        '<div class="pip-row">Battles: <span id="pip-battles">0</span></div>' +
        '<div class="pip-row">Status: <span id="pip-status">Idle</span></div>' +
        '<div class="pip-row pip-drop">Drop: <span id="pip-drop">—</span></div>' +
      '</div>'
    );
  },

  _injectStyles: function (doc) {
    var style = doc.createElement("style");
    style.textContent =
      "body{margin:0;padding:10px;background:#0a0a14;color:#00d4ff;font-family:monospace;font-size:12px}" +
      ".pip-title{font-weight:bold;letter-spacing:.1em;margin-bottom:8px;color:#fff}" +
      ".pip-row{margin:4px 0}.pip-drop{color:#ffd700}";
    doc.head.appendChild(style);
  },

  update: function () {
    if (!window.Save) return;
    var d = Save.get();
    var rank = window.AI ? AI.playerRank : d.rank;
    var status = window.AFK ? AFK._state.statusText : "Idle";

    var vals = {
      "pip-rank": rank,
      "pip-wl": d.wins + "/" + d.losses,
      "pip-battles": d.afk.battlesRun || 0,
      "pip-status": status,
      "pip-drop": d.lastDrop ? d.lastDrop.name : "—"
    };

    var targets = [document];
    if (this._pipWindow && !this._pipWindow.closed) {
      targets.push(this._pipWindow.document);
    }

    targets.forEach(function (doc) {
      Object.keys(vals).forEach(function (id) {
        var el = doc.getElementById(id);
        if (el) el.textContent = vals[id];
      });
    });
  }
};
