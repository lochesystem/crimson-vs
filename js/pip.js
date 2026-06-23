/* ========================================================
   CRIMSON VS — Picture-in-Picture + Widget Fallback
   ======================================================== */
window.PiP = {
  _pipWindow: null,
  _widget: null,
  _widgetVisible: false,
  _animTimeouts: [],
  _countdownInterval: null,
  _animating: false,

  isSupported: function () {
    return !!(window.documentPictureInPicture && documentPictureInPicture.requestWindow);
  },

  isActive: function () {
    if (this._pipWindow && !this._pipWindow.closed) return true;
    return this._widgetVisible;
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
      height: 300
    }).then(function (pipWin) {
      self._pipWindow = pipWin;
      pipWin.document.body.innerHTML = self._buildHTML();
      self._injectStyles(pipWin.document);
      self.update();
      self.refreshIdle();

      pipWin.addEventListener("pagehide", function () {
        self._pipWindow = null;
        self._abortAnimation();
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
      self._abortAnimation();
    });
  },

  _toggleWidget: function () {
    if (!this._widget) return;
    this._widgetVisible = !this._widgetVisible;
    this._widget.classList.toggle("hidden", !this._widgetVisible);
    if (this._widgetVisible) {
      this.update();
      this.refreshIdle();
    } else {
      this._abortAnimation();
    }
  },

  _buildHTML: function () {
    return (
      '<div class="pip-inner">' +
        '<div class="pip-title">CRIMSON VS — AFK</div>' +
        '<div class="pip-stage" id="pip-stage"></div>' +
        '<div class="pip-stats">' +
          '<div class="pip-row">Rank: <span id="pip-rank">50</span></div>' +
          '<div class="pip-row">W/L: <span id="pip-wl">0/0</span></div>' +
          '<div class="pip-row">Battles: <span id="pip-battles">0</span></div>' +
          '<div class="pip-row">Status: <span id="pip-status">Idle</span></div>' +
          '<div class="pip-row pip-drop">Drop: <span id="pip-drop">—</span></div>' +
        '</div>' +
      '</div>'
    );
  },

  _getPipCSS: function () {
    return (
      "body{margin:0;padding:10px;background:#0a0a14;color:#00d4ff;font-family:monospace;font-size:11px}" +
      ".pip-title{font-weight:bold;letter-spacing:.1em;margin-bottom:6px;color:#fff;font-size:11px}" +
      ".pip-stage{position:relative;height:120px;margin-bottom:8px;background:rgba(0,0,0,0.4);border:1px solid rgba(0,212,255,0.2);border-radius:6px;overflow:hidden}" +
      ".pip-row{margin:2px 0}.pip-drop{color:#ffd700}" +
      ".pip-phase-banner{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.6);opacity:0;white-space:nowrap;font-weight:800;letter-spacing:.15em;color:#fff;text-shadow:0 0 12px rgba(0,212,255,0.8);animation:pipPhaseIn 0.8s ease forwards;z-index:5}" +
      ".pip-mini-clash{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:6px}" +
      ".pip-mini-card{width:52px;height:72px;border-radius:4px;overflow:hidden;border:2px solid #00d4ff;background:#111}" +
      ".pip-mini-card.enemy{border-color:#ff3333}" +
      ".pip-mini-card img{width:100%;height:100%;object-fit:cover}" +
      ".pip-mini-card .pip-mini-fallback{display:flex;align-items:center;justify-content:center;height:100%;font-size:8px;text-align:center;padding:4px;color:#ccc}" +
      ".pip-mini-card.left{animation:pipClashSlideL 0.4s ease forwards}" +
      ".pip-mini-card.right{animation:pipClashSlideR 0.4s ease forwards}" +
      ".pip-mini-vs{font-size:14px;font-weight:800;color:#fff;text-shadow:0 0 8px rgba(255,255,255,0.6);animation:pipVsFlash 0.5s ease}" +
      ".pip-result{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:900;letter-spacing:.1em;opacity:0;animation:pipWinFlash 0.6s ease forwards;z-index:6}" +
      ".pip-result.win{color:#33cc33;text-shadow:0 0 16px rgba(51,204,51,0.8)}" +
      ".pip-result.loss{color:#ff3333;text-shadow:0 0 16px rgba(255,51,51,0.8)}" +
      ".pip-drop-wrap{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;pointer-events:none;z-index:7}" +
      ".pip-drop-card{width:56px;height:78px;border-radius:4px;overflow:hidden;border:2px solid #ffd700;box-shadow:0 0 16px rgba(255,215,0,0.6);animation:pipFloatUp 1.4s ease forwards;margin-bottom:8px}" +
      ".pip-drop-card img{width:100%;height:100%;object-fit:cover}" +
      ".pip-drop-label{font-size:10px;font-weight:800;color:#ffd700;letter-spacing:.12em;animation:pipFloatUp 1.4s ease forwards;text-shadow:0 0 8px rgba(255,215,0,0.8)}" +
      "@keyframes pipPhaseIn{0%{opacity:0;transform:translate(-50%,-50%) scale(0.5)}30%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.1)}}" +
      "@keyframes pipClashSlideL{from{transform:translateX(-60px);opacity:0}to{transform:translateX(0);opacity:1}}" +
      "@keyframes pipClashSlideR{from{transform:translateX(60px);opacity:0}to{transform:translateX(0);opacity:1}}" +
      "@keyframes pipVsFlash{0%,100%{opacity:0.5;transform:scale(1)}50%{opacity:1;transform:scale(1.2)}}" +
      "@keyframes pipWinFlash{0%{opacity:0;transform:scale(0.5)}40%{opacity:1;transform:scale(1.1)}100%{opacity:1;transform:scale(1)}}" +
      "@keyframes pipFloatUp{0%{opacity:0;transform:translateY(40px) scale(0.7)}20%{opacity:1;transform:translateY(0) scale(1)}80%{opacity:1;transform:translateY(-20px) scale(1)}100%{opacity:0;transform:translateY(-50px) scale(0.9)}}" +
      ".pip-idle{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px}" +
      ".pip-countdown-ring{position:relative;width:64px;height:64px;border-radius:50%;background:conic-gradient(#00d4ff calc(var(--progress,0) * 1%),rgba(0,212,255,0.12) 0);display:flex;align-items:center;justify-content:center}" +
      ".pip-countdown-ring::before{content:'';position:absolute;width:52px;height:52px;border-radius:50%;background:#0a0a14}" +
      ".pip-countdown-time{position:relative;z-index:1;font-size:13px;font-weight:800;color:#fff;letter-spacing:.05em}" +
      ".pip-countdown-label{font-size:9px;font-weight:700;letter-spacing:.12em;color:#888;text-transform:uppercase;animation:pipScanPulse 2s ease infinite}" +
      ".pip-idle-paused .pip-countdown-label,.pip-idle-waiting .pip-countdown-label{animation:none}" +
      ".pip-paused-icon{font-size:18px;font-weight:800;color:#888;letter-spacing:2px}" +
      ".pip-idle-sync .pip-countdown-label{color:#00d4ff}" +
      "@keyframes pipScanPulse{0%,100%{opacity:.6}50%{opacity:1}}"
    );
  },

  _injectStyles: function (doc) {
    var style = doc.createElement("style");
    style.textContent = this._getPipCSS();
    doc.head.appendChild(style);
  },

  _getStageDocs: function () {
    var docs = [];
    if (this._pipWindow && !this._pipWindow.closed) {
      docs.push(this._pipWindow.document);
    }
    if (this._widgetVisible && this._widget) {
      docs.push(document);
    }
    return docs;
  },

  _getStage: function (doc) {
    return doc.getElementById("pip-stage");
  },

  _abortAnimation: function () {
    for (var i = 0; i < this._animTimeouts.length; i++) {
      clearTimeout(this._animTimeouts[i]);
    }
    this._animTimeouts = [];
    this._animating = false;
    this._stopCountdown();
    var docs = this._getStageDocs();
    for (var j = 0; j < docs.length; j++) {
      var stage = this._getStage(docs[j]);
      if (stage) stage.innerHTML = "";
    }
  },

  _stopCountdown: function () {
    if (this._countdownInterval) {
      clearInterval(this._countdownInterval);
      this._countdownInterval = null;
    }
  },

  _formatCountdown: function (ms) {
    var totalSec = Math.ceil(ms / 1000);
    var min = Math.floor(totalSec / 60);
    var sec = totalSec % 60;
    return min + ":" + String(sec).padStart(2, "0");
  },

  _getIdleMode: function () {
    if (window.AFK && AFK.isRunning()) return "countdown";
    if (window.AFK && AFK._state.statusText && AFK._state.statusText.indexOf("Catching up") !== -1) {
      return "sync";
    }
    var d = window.Save ? Save.get() : null;
    if (d && d.afk.battlesRun > 0) return "paused";
    return "waiting";
  },

  _buildIdleHTML: function (mode) {
    if (mode === "countdown") {
      var remaining = window.AFK ? AFK.getTimeUntilNextMs() : 0;
      var interval = window.AFK ? AFK.getInterval() : 30000;
      var progress = interval > 0 ? (1 - remaining / interval) * 100 : 0;
      return (
        '<div class="pip-idle">' +
          '<div class="pip-countdown-ring" style="--progress:' + progress + '">' +
            '<span class="pip-countdown-time">' + this._formatCountdown(remaining || 0) + "</span>" +
          "</div>" +
          '<div class="pip-countdown-label">NEXT BATTLE</div>' +
        "</div>"
      );
    }
    if (mode === "sync") {
      return (
        '<div class="pip-idle pip-idle-sync">' +
          '<div class="pip-countdown-label">SYNCING...</div>' +
        "</div>"
      );
    }
    if (mode === "paused") {
      return (
        '<div class="pip-idle pip-idle-paused">' +
          '<div class="pip-paused-icon">||</div>' +
          '<div class="pip-countdown-label">AFK PAUSED</div>' +
        "</div>"
      );
    }
    return (
      '<div class="pip-idle pip-idle-waiting">' +
        '<div class="pip-countdown-label">PRESS START AFK</div>' +
      "</div>"
    );
  },

  _showIdleStage: function () {
    var mode = this._getIdleMode();
    var html = this._buildIdleHTML(mode);
    var docs = this._getStageDocs();
    for (var i = 0; i < docs.length; i++) {
      var stage = this._getStage(docs[i]);
      if (stage) stage.innerHTML = html;
    }
  },

  _tickCountdown: function () {
    if (this._animating || !this.isActive()) return;
    if (!window.AFK || !AFK.isRunning()) {
      this.refreshIdle();
      return;
    }

    var remaining = AFK.getTimeUntilNextMs();
    var interval = AFK.getInterval();
    var progress = interval > 0 ? (1 - remaining / interval) * 100 : 100;
    var timeStr = this._formatCountdown(remaining || 0);

    var docs = this._getStageDocs();
    for (var i = 0; i < docs.length; i++) {
      var stage = this._getStage(docs[i]);
      if (!stage) continue;
      var ring = stage.querySelector(".pip-countdown-ring");
      var timeEl = stage.querySelector(".pip-countdown-time");
      if (ring) ring.style.setProperty("--progress", progress);
      if (timeEl) timeEl.textContent = timeStr;
    }
  },

  refreshIdle: function () {
    if (!this.isActive() || this._animating) return;

    this._stopCountdown();
    this._showIdleStage();

    if (window.AFK && AFK.isRunning()) {
      var self = this;
      this._tickCountdown();
      this._countdownInterval = setInterval(function () {
        self._tickCountdown();
      }, 1000);
    }
  },

  _schedule: function (fn, delay) {
    var self = this;
    var id = setTimeout(function () {
      var idx = self._animTimeouts.indexOf(id);
      if (idx !== -1) self._animTimeouts.splice(idx, 1);
      fn();
    }, delay);
    this._animTimeouts.push(id);
    return id;
  },

  _clearStage: function () {
    var docs = this._getStageDocs();
    for (var i = 0; i < docs.length; i++) {
      var stage = this._getStage(docs[i]);
      if (stage) stage.innerHTML = "";
    }
  },

  _renderMiniCardHTML: function (card, side) {
    var cls = "pip-mini-card " + (side === "enemy" ? "enemy right" : "left");
    var inner = "";
    if (card && window.CardImages) {
      var img = CardImages.getImageForCard(card);
      if (img) {
        inner = '<img src="' + img + '" alt="">';
      } else if (card) {
        inner = '<div class="pip-mini-fallback">' + card.name + "</div>";
      }
    }
    return '<div class="' + cls + '">' + inner + "</div>";
  },

  _showInAllStages: function (html) {
    var docs = this._getStageDocs();
    for (var i = 0; i < docs.length; i++) {
      var stage = this._getStage(docs[i]);
      if (stage) stage.innerHTML = html;
    }
  },

  playBattleEvent: function (resolved) {
    if (!this.isActive() || !resolved) {
      this.update();
      return;
    }

    var self = this;
    this._abortAnimation();
    this._animating = true;

    var lb = window.Save ? Save.get().lastBattle : null;
    var playerDeck = lb ? lb.deck : null;
    var enemyDeck = lb && lb.opponent ? lb.opponent.deck : null;
    var won = resolved.result && resolved.result.winner === "player";

    var pUnit = null;
    var eUnit = null;
    if (playerDeck && enemyDeck) {
      for (var i = 0; i < 3; i++) {
        if (playerDeck.units[i] && enemyDeck.units[i]) {
          pUnit = playerDeck.units[i];
          eUnit = enemyDeck.units[i];
          break;
        }
      }
      if (!pUnit && playerDeck.units[0]) pUnit = playerDeck.units[0];
      if (!eUnit && enemyDeck.units[0]) eUnit = enemyDeck.units[0];
    }

    // Phase 1: BATTLE banner
    this._showInAllStages('<div class="pip-phase-banner">BATTLE</div>');

    // Phase 2: Mini clash
    this._schedule(function () {
      var clashHtml =
        '<div class="pip-mini-clash">' +
          self._renderMiniCardHTML(pUnit, "player") +
          '<div class="pip-mini-vs">VS</div>' +
          self._renderMiniCardHTML(eUnit, "enemy") +
        "</div>";
      self._showInAllStages(clashHtml);
    }, 400);

    // Phase 3: WIN / LOSS
    this._schedule(function () {
      var resultHtml = '<div class="pip-result ' + (won ? "win" : "loss") + '">' + (won ? "WIN" : "LOSS") + "</div>";
      self._showInAllStages(resultHtml);
    }, 1200);

    // Phase 4: Card drop
    var reward = resolved.reward;
    if (reward && reward.card && !reward.duplicate) {
      this._schedule(function () {
        var card = reward.card;
        var imgSrc = window.CardImages ? CardImages.getImageForCard(card) : null;
        var cardInner = imgSrc
          ? '<img src="' + imgSrc + '" alt="">'
          : '<div class="pip-mini-fallback">' + card.name + "</div>";
        var dropHtml =
          '<div class="pip-drop-wrap">' +
            '<div class="pip-drop-card">' + cardInner + "</div>" +
            '<div class="pip-drop-label">NEW CARD</div>' +
          "</div>";
        self._showInAllStages(dropHtml);
      }, 1800);
    }

    // Phase 5: Return to idle countdown + update stats
    this._schedule(function () {
      self._animating = false;
      self.update();
      self.refreshIdle();
    }, 2800);
  },

  update: function () {
    if (!window.Save) return;
    var d = Save.get();
    var rank = window.AI ? AI.playerRank : d.rank;
    var status = window.AFK ? AFK._state.statusText : "Idle";

    var dropText = "—";
    if (d.lastDrop) {
      dropText = (d.lastDrop.isNew ? "NEW: " : "") + d.lastDrop.name;
    }

    var vals = {
      "pip-rank": rank,
      "pip-wl": d.wins + "/" + d.losses,
      "pip-battles": d.afk.battlesRun || 0,
      "pip-status": status,
      "pip-drop": dropText
    };

    var targets = [];
    if (this._widgetVisible) targets.push(document);
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
