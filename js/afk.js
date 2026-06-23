/* ========================================================
   CRIMSON VS — AFK Auto-Battle Mode
   ======================================================== */
window.AFK = {
  _timer: null,
  _running: false,
  _state: {
    lastResult: null,
    lastReward: null,
    statusText: "Idle"
  },

  SPEEDS: {
    slow: { label: "Slow (60s)", ms: 60000 },
    normal: { label: "Normal (30s)", ms: 30000 },
    fast: { label: "Fast (10s)", ms: 10000 }
  },

  OFFLINE_CAP_MS: 8 * 60 * 60 * 1000,
  CHUNK_SIZE: 50,

  init: function () {
    this._bindUI();
    this._processOfflineCatchUp();
    this._refreshUI();
  },

  _bindUI: function () {
    var self = this;

    var startBtn = document.getElementById("btn-afk-start");
    var stopBtn = document.getElementById("btn-afk-stop");
    var backBtn = document.getElementById("btn-afk-back");
    var speedSel = document.getElementById("afk-speed");
    var pipBtn = document.getElementById("btn-afk-pip");
    var replayBtn = document.getElementById("btn-afk-replay");

    if (startBtn) startBtn.addEventListener("click", function () { self.start(); });
    if (stopBtn) stopBtn.addEventListener("click", function () { self.stop(); });
    if (backBtn) backBtn.addEventListener("click", function () { UI.showScreen("title"); });
    if (speedSel) {
      speedSel.value = Save.get().settings.afkSpeed || "normal";
      speedSel.addEventListener("change", function () {
        Save.setAfkSpeed(speedSel.value);
        if (self._running) {
          self.stop();
          self.start();
        }
        self._refreshUI();
      });
    }
    if (pipBtn) pipBtn.addEventListener("click", function () {
      if (window.PiP) PiP.toggle();
    });
    if (replayBtn) replayBtn.addEventListener("click", function () {
      self._replayLastBattle();
    });
  },

  getInterval: function () {
    var speed = Save.get().settings.afkSpeed || "normal";
    var cfg = this.SPEEDS[speed] || this.SPEEDS.normal;
    return cfg.ms;
  },

  isRunning: function () {
    return this._running;
  },

  getTimeUntilNextMs: function () {
    if (!this._running) return null;
    var d = Save.get();
    var nextAt = (d.afk.lastTick || Date.now()) + this.getInterval();
    return Math.max(0, nextAt - Date.now());
  },

  start: function () {
    if (this._running) return;
    var deck = DeckBuilder.getDeck();
    if (!deck) {
      alert("Set up a valid deck before starting AFK mode.");
      return;
    }
    var ownedCheck = Inventory.validateDeckOwned(deck);
    if (!ownedCheck.valid) {
      alert("Deck has unowned cards: " + ownedCheck.errors.join(", "));
      return;
    }

    this._running = true;
    var d = Save.get();
    d.afk.enabled = true;
    d.afk.lastTick = Date.now();
    Save.save();

    this._state.statusText = "Running";
    this._refreshUI();
    this._runBattle();
    var self = this;
    this._timer = setInterval(function () { self._runBattle(); }, this.getInterval());
    if (window.PiP) {
      PiP.update();
      PiP.refreshIdle();
    }
  },

  stop: function () {
    this._running = false;
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
    var d = Save.get();
    d.afk.enabled = false;
    d.afk.lastTick = Date.now();
    Save.save();
    this._state.statusText = "Stopped";
    this._refreshUI();
    if (window.PiP) {
      PiP.update();
      PiP.refreshIdle();
    }
  },

  _runBattle: function () {
    var deck = DeckBuilder.getDeck();
    if (!deck) {
      this.stop();
      return;
    }

    var d = Save.get();
    var seed = d.afk.battleIndex;
    var resolved = DeckBuilder.resolveBattle(deck, { silent: true, seed: seed });
    if (!resolved) return;

    d.afk.battlesRun++;
    d.afk.battleIndex++;
    d.afk.lastTick = Date.now();
    Save.save();

    this._state.lastResult = resolved.result;
    this._state.lastReward = resolved.reward;
    this._state.statusText = resolved.result.winner === "player" ? "Victory" : "Defeat";

    DeckBuilder._updateRankDisplay();
    this._refreshUI();
    this._showToast(resolved);
    if (window.PiP) {
      if (PiP.isActive()) {
        PiP.playBattleEvent(resolved);
      } else {
        PiP.update();
      }
    }
  },

  _showToast: function (resolved) {
    var container = document.getElementById("afk-toast-area");
    if (!container) return;

    var msg = resolved.result.winner === "player" ? "WIN" : "LOSS";
    if (resolved.reward && resolved.reward.card) {
      if (!resolved.reward.duplicate) {
        msg += " — New card: " + resolved.reward.card.name;
      } else {
        msg += " — Duplicate";
      }
    }

    var el = document.createElement("div");
    el.className = "afk-toast " + (resolved.result.winner === "player" ? "win" : "loss");
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(function () { el.remove(); }, 4000);
    while (container.children.length > 5) {
      container.removeChild(container.firstChild);
    }
  },

  _replayLastBattle: function () {
    var lb = Save.get().lastBattle;
    if (!lb || !lb.result) {
      alert("No battle to replay yet.");
      return;
    }
    this.stop();
    UI.playBattle(lb.result, lb.deck, lb.opponent.deck, lb.opponent.name + " (Rank " + lb.opponent.rank + ")");
  },

  _processOfflineCatchUp: function () {
    var d = Save.get();
    if (!d.afk.enabled) return;

    var elapsed = Date.now() - (d.afk.lastTick || Date.now());
    if (elapsed < this.getInterval()) return;

    var capped = Math.min(elapsed, this.OFFLINE_CAP_MS);
    var battles = Math.floor(capped / this.getInterval());
    if (battles <= 0) return;

    this._state.statusText = "Catching up (" + battles + ")...";
    this._refreshUI();

    var deck = DeckBuilder.getDeck();
    if (!deck) return;

  var self = this;
    var processed = 0;

    function runChunk() {
      var chunk = Math.min(self.CHUNK_SIZE, battles - processed);
      for (var i = 0; i < chunk; i++) {
        DeckBuilder.resolveBattle(deck, { silent: true, seed: d.afk.battleIndex + processed + i });
      }
      processed += chunk;
      d.afk.battlesRun += chunk;
      d.afk.battleIndex += chunk;
      Save.save();
      self._refreshUI();

      if (processed < battles) {
        if (window.requestIdleCallback) {
          requestIdleCallback(runChunk);
        } else {
          setTimeout(runChunk, 0);
        }
      } else {
        d.afk.lastTick = Date.now();
        Save.save();
        self._state.statusText = "Catch-up complete";
        self._refreshUI();
        if (d.afk.enabled) self.start();
      }
    }

    runChunk();
  },

  _refreshUI: function () {
    if (!window.AI) return;
    var d = Save.get();

    var set = function (id, val) {
      var el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    set("afk-rank", AI.playerRank);
    set("afk-wins", AI.wins);
    set("afk-losses", AI.losses);
    set("afk-battles", d.afk.battlesRun || 0);
    set("afk-status", this._state.statusText);
    set("afk-owned", Inventory.getOwnedCount() + " / 150");

    var dropEl = document.getElementById("afk-last-drop");
    if (dropEl) {
      if (d.lastDrop) {
        dropEl.textContent = (d.lastDrop.isNew ? "NEW: " : "") + d.lastDrop.name;
      } else {
        dropEl.textContent = "—";
      }
    }

    var startBtn = document.getElementById("btn-afk-start");
    var stopBtn = document.getElementById("btn-afk-stop");
    if (startBtn) startBtn.disabled = this._running;
    if (stopBtn) stopBtn.disabled = !this._running;

    var deck = DeckBuilder.getDeck();
    var deckStatus = document.getElementById("afk-deck-status");
    if (deckStatus) {
      deckStatus.textContent = deck
        ? deck.general.name + " + 3 units"
        : "No deck — set up in Deck Builder first";
    }
  },

  onScreenOpen: function () {
    DeckBuilder._loadDeck();
    this._refreshUI();
    if (Save.get().afk.enabled && !this._running) {
      this.start();
    }
  }
};
