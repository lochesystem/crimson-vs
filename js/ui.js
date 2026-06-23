/* ========================================================
   CRIMSON VS — UI Controller
   ======================================================== */
window.UI = {
  currentScreen: "title",
  _battleQueue: [],
  _battlePlaying: false,
  _battleSpeed: 1,

  /* ---------- Initialization ---------- */
  init: function () {
    this._bindTitleScreen();
    this._bindCollectionScreen();
    this.showScreen("title");
  },

  /* ---------- Screen Management ---------- */
  showScreen: function (screenId) {
    var self = this;
    var current = document.querySelector(".screen.active");
    var next = document.getElementById("screen-" + screenId);
    if (!next) return;

    if (current && current !== next) {
      current.classList.add("fade-out");
      setTimeout(function () {
        current.classList.remove("active", "fade-out");
        next.classList.add("active", "fade-in");
        setTimeout(function () { next.classList.remove("fade-in"); }, 50);
      }, 350);
    } else {
      if (current) current.classList.remove("active");
      next.classList.add("active");
    }
    this.currentScreen = screenId;
  },

  /* ---------- Card Rendering ---------- */
  _charColors: {
    "Haseo": ["#c42b2b","#2b2b2b"], "Atoli": ["#6bc45e","#2b5e25"], "Kuhn": ["#4a90d9","#1a3a5c"],
    "Pi": ["#9b30ff","#3d1266"], "Yata": ["#708090","#2f3640"], "Ovan": ["#8b6914","#3d2f0a"],
    "Shino": ["#db7093","#5c2030"], "Endrance": ["#9370db","#3a2d5c"], "Silabus": ["#3cb371","#1a4c30"],
    "Gaspard": ["#f4a460","#5c3d1a"], "Tabby": ["#ff8c00","#5c3200"], "Bordeaux": ["#dc143c","#5c0a1a"],
    "Kite": ["#4169e1","#1a2d5c"], "BlackRose": ["#ff69b4","#5c2040"], "Balmung": ["#87ceeb","#2b4e5e"],
    "Orca": ["#20b2aa","#0a4c4a"], "Mistral": ["#ffd700","#5c4d00"], "Sakubo": ["#dda0dd","#4a2d4a"],
    "Sakaki": ["#800080","#2d002d"], "Zelkova": ["#228b22","#0a3d0a"], "Alkaid": ["#ff4500","#5c1a00"],
    "Piros": ["#cd853f","#4a3018"], "Sora": ["#00ced1","#004d4f"], "Mimiru": ["#cd5c5c","#4a2020"],
    "Antares": ["#b22222","#4a0e0e"], "Midori": ["#90ee90","#2d5c2d"], "Azure Kite": ["#1e90ff","#0a3a6e"],
    "Elk": ["#8fbc8f","#2d4a2d"], "Gabi": ["#daa520","#4a3a08"], "Silver Knight": ["#c0c0c0","#3a3a3a"],
    "BT": ["#bc8f8f","#4a3030"], "Matsu": ["#556b2f","#222b12"], "Kaede": ["#2e8b57","#123622"],
    "Hiiragi": ["#6a5acd","#2a2252"], "Nala": ["#48d1cc","#1a5250"], "Mai Minase": ["#f08080","#5c2828"],
    "Phyllo": ["#deb887","#4a3c20"], "TaN": ["#a0522d","#402010"], "Cubia": ["#4b0082","#1a002d"],
    "Death Grunty": ["#696969","#222"], "Natsume": ["#fa8072","#5c2820"], "B-Set": ["#7b68ee","#2d2660"],
    "Tsukasa": ["#d2b48c","#4a3c28"], "Shugo": ["#32cd32","#124c12"], "Sirius": ["#4682b4","#1a3048"],
    "Taihaku": ["#8b4513","#3a1c08"], "AIDA Sakaki": ["#4a004a","#1a001a"], "AIDA Sirius": ["#00004a","#00001a"],
    "Piros the 3rd": ["#cd853f","#4a3018"], "Subaru": ["#b0c4de","#3a4450"]
  },

  _getCharColor: function(card) {
    var key = card.character || card.name.split(" ")[0];
    if (this._charColors[card.character]) return this._charColors[card.character];
    for (var k in this._charColors) {
      if (card.name.indexOf(k) !== -1 || (card.character && card.character.indexOf(k) !== -1)) return this._charColors[k];
    }
    var hash = 0;
    for (var i = 0; i < card.name.length; i++) hash = card.name.charCodeAt(i) + ((hash << 5) - hash);
    var h = Math.abs(hash) % 360;
    return ["hsl("+h+",50%,35%)","hsl("+h+",40%,15%)"];
  },

  _getCharInitial: function(card) {
    if (card.character) {
      var parts = card.character.split(" ");
      return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : card.character.substring(0,2).toUpperCase();
    }
    var w = card.name.split(" ");
    if (w.length >= 2) return (w[0][0] + w[1][0]).toUpperCase();
    return card.name.substring(0,2).toUpperCase();
  },

  renderCard: function (card, options) {
    options = options || {};
    var size = options.size || "small";
    var clickable = options.clickable !== false;
    var selected = options.selected || false;
    var faceDown = options.faceDown || false;

    var el = document.createElement("div");
    el.className = "card";
    el.setAttribute("data-card-id", card.id);

    el.classList.add("trinity-" + card.trinity);
    el.classList.add("rarity-" + card.rarity);
    if (size === "large") el.classList.add("card-large");
    if (selected) el.classList.add("selected");
    if (!clickable) el.style.cursor = "default";
    if (faceDown) el.classList.add("face-down");

    var trinityLabel = card.trinity.charAt(0).toUpperCase();
    var colors = this._getCharColor(card);
    var initials = this._getCharInitial(card);
    var idStr = String(card.id).padStart(3, "0");

    var statsHtml = "";
    if (card.type === "general") {
      statsHtml =
        '<div class="card-stat"><span class="icon icon-hp">♥</span>' + card.hp + "</div>" +
        '<div class="card-stat"><span class="icon icon-ap">⚡</span>' + card.ap + "</div>" +
        '<div class="card-stat"><span class="icon icon-cha">✦</span>' + card.charisma + "</div>";
    } else {
      statsHtml =
        '<div class="card-stat"><span class="icon icon-cost">✦</span>' + card.cost + "</div>";
    }

    var artHtml = "";
    var imgSrc = window.CardImages ? CardImages.getImageForCard(card) : null;
    if (imgSrc) {
      artHtml = '<img class="card-art-img" src="' + imgSrc + '" alt="" loading="lazy">';
    } else {
      artHtml = '<div class="card-char-avatar" style="background:linear-gradient(135deg,' + colors[0] + ',' + colors[1] + ')">' + initials + "</div>";
    }

    el.innerHTML =
      '<div class="card-image-area">' +
        '<div class="card-type-badge ' + card.type + '">' + card.type.toUpperCase() + "</div>" +
        '<div class="card-trinity-icon ' + card.trinity + '">' + trinityLabel + "</div>" +
        artHtml +
        '<div class="card-id-badge">#' + idStr + "</div>" +
      "</div>" +
      '<div class="card-name" title="' + card.name + '">' + card.name + "</div>" +
      (card.nameJp ? '<div class="card-name-jp">' + card.nameJp + "</div>" : "") +
      '<div class="card-stats">' + statsHtml + "</div>" +
      (card.junctionAbilityName
        ? '<div class="card-ability" title="' + card.junctionAbilityName + '">' + card.junctionAbilityName + "</div>"
        : "");

    return el;
  },

  /* ---------- Battle Playback ---------- */
  playBattle: function (battleResult, playerDeck, enemyDeck, opponentName) {
    var self = this;
    this.showScreen("battle");

    setTimeout(function () {
      self._setupBattleField(playerDeck, enemyDeck, opponentName);

      var delay = 600;
      self._battleQueue = [];
      self._battlePlaying = true;

      // Phase 1: Reveal cards
      self._enqueue(delay, function () { self._showPhaseBanner("DRAW CARDS"); });
      delay += 400;
      self._enqueue(delay, function () { self._revealCard("player-general-slot"); });
      delay += 350;
      for (var i = 0; i < 3; i++) {
        (function (idx) { self._enqueue(delay, function () { self._revealCard("player-unit-" + idx); }); })(i);
        delay += 250;
      }
      delay += 200;
      self._enqueue(delay, function () { self._revealCard("enemy-general-slot"); });
      delay += 350;
      for (var j = 0; j < 3; j++) {
        (function (idx) { self._enqueue(delay, function () { self._revealCard("enemy-unit-" + idx); }); })(j);
        delay += 250;
      }
      delay += 600;

      // Phase 2: Delta Combos
      var pDC = battleResult.phases && battleResult.phases.deltaCombo ? battleResult.phases.deltaCombo.your : null;
      var eDC = battleResult.phases && battleResult.phases.deltaCombo ? battleResult.phases.deltaCombo.enemy : null;
      if (pDC || eDC) {
        self._enqueue(delay, function () {
          self._showPhaseBanner("DELTA COMBO");
          self.addLogEntry({ type: "phase", message: "— DELTA COMBO PHASE —" });
        });
        delay += 1400;
        if (pDC) {
          self._enqueue(delay, function () {
            self._screenFlash("ability-flash");
            self.addLogEntry({ type: "combo", message: "You: " + pDC.name + " — " + (pDC.description || "") });
          });
          delay += 800;
        }
        if (eDC) {
          self._enqueue(delay, function () {
            self._screenFlash("ability-flash");
            self.addLogEntry({ type: "combo", message: "Enemy: " + eDC.name + " — " + (eDC.description || "") });
          });
          delay += 800;
        }
      }

      // Phase 3: Unit Battles with clash overlay
      if (battleResult.unitBattleResults && battleResult.unitBattleResults.length > 0) {
        self._enqueue(delay, function () {
          self._showPhaseBanner("UNIT BATTLE");
          self.addLogEntry({ type: "phase", message: "— UNIT BATTLE PHASE —" });
        });
        delay += 1400;

        battleResult.unitBattleResults.forEach(function (ub, idx) {
          self._enqueue(delay, function () {
            self._showUnitClash(ub, idx, playerDeck, enemyDeck);
          });
          delay += 2200;
        });
      }

      delay += 400;

      // Phase 4: General Battle
      self._enqueue(delay, function () {
        self._showPhaseBanner("GENERAL BATTLE");
        self.addLogEntry({ type: "phase", message: "— GENERAL BATTLE PHASE —" });
      });
      delay += 1600;

      if (battleResult.log) {
        var playerMaxHP = playerDeck.general.hp;
        var enemyMaxHP = enemyDeck.general.hp;
        var playerHP = playerMaxHP;
        var enemyHP = enemyMaxHP;
        var prevTurn = 0;

        battleResult.log.forEach(function (entry) {
          var t = entry.type || "";
          var isAttack = t === "attack";
          var isDamage = t === "damage" && entry.data && entry.data.damage !== undefined;
          var isJunction = t === "junction";
          var isTurnStart = t === "turn_start";
          var isEffect = t === "effect";

          // Turn start — show turn indicator
          if (isTurnStart && entry.data && entry.data.turn && entry.data.turn !== prevTurn) {
            prevTurn = entry.data.turn;
            self._enqueue(delay, function () {
              self._showTurnIndicator(entry.data.turn);
              self.addLogEntry(entry);
            });
            delay += 900;
            return;
          }

          // Attack — lunge animation + slash effect
          if (isAttack) {
            self._enqueue(delay, function () {
              var side = entry.data && entry.data.attacker ? entry.data.attacker : "your";
              var cssSide = side === "your" ? ".battle-player" : ".battle-enemy";
              var el = document.querySelector(cssSide);
              if (el) {
                el.classList.add("attacking");
                setTimeout(function () { el.classList.remove("attacking"); }, 600);
              }
              self._showAttackSlash();
              self.addLogEntry(entry);
            });
            delay += 500;
            return;
          }

          // Damage — flash + shake + number
          if (isDamage) {
            self._enqueue(delay, function () {
              var target = entry.data.target || "enemy";
              var dmg = entry.data.damage;
              if (target === "enemy") {
                enemyHP = Math.max(0, enemyHP - dmg);
                self.showDamageNumber("enemy", dmg, "damage");
                self._shakeElement(".battle-enemy");
              } else {
                playerHP = Math.max(0, playerHP - dmg);
                self.showDamageNumber("player", dmg, "damage");
                self._shakeElement(".battle-player");
              }
              if (dmg >= 4) self._screenFlash("damage-flash");
              self.updateHPBars(playerHP, playerMaxHP, enemyHP, enemyMaxHP);
              self.addLogEntry(entry);
              if (playerHP <= 0 || enemyHP <= 0) {
                self._showKO(playerHP <= 0 ? "player" : "enemy");
              }
            });
            delay += 650;
            return;
          }

          // Heal — green flash + heal number
          if (t === "heal" && entry.data && entry.data.heal !== undefined) {
            self._enqueue(delay, function () {
              var healTarget = (entry.data.target === "enemy") ? "enemy" : "player";
              var amt = entry.data.heal;
              if (healTarget === "player") {
                playerHP = Math.min(playerMaxHP, playerHP + amt);
                self.showDamageNumber("player", amt, "heal");
              } else {
                enemyHP = Math.min(enemyMaxHP, enemyHP + amt);
                self.showDamageNumber("enemy", amt, "heal");
              }
              self._screenFlash("heal-flash");
              self.updateHPBars(playerHP, playerMaxHP, enemyHP, enemyMaxHP);
              self.addLogEntry(entry);
            });
            delay += 600;
            return;
          }

          // Junction activation — glow the card
          if (isJunction) {
            self._enqueue(delay, function () {
              var side = (entry.data && entry.data.side) || "your";
              self._glowGeneralCard(side === "your" ? "player" : "enemy");
              self.showAbilityPopup(
                side === "your" ? "player" : "enemy",
                entry.message || "",
                ""
              );
              if (entry.data && entry.data.abilityName) {
                self._screenFlash("ability-flash");
              }
              self.addLogEntry(entry);
            });
            delay += 900;
            return;
          }

          // Delta combo stat effects
          if (t === "delta_combo") {
            self._enqueue(delay, function () {
              self._screenFlash("ability-flash");
              self.addLogEntry(entry);
            });
            delay += 500;
            return;
          }

          // Effect logs
          if (isEffect) {
            self._enqueue(delay, function () { self.addLogEntry(entry); });
            delay += 400;
            return;
          }

          // Turn end — skip silently
          if (t === "turn_end") {
            return;
          }

          // Everything else
          self._enqueue(delay, function () { self.addLogEntry(entry); });
          delay += 350;
        });
      }

      delay += 600;

      // Final sync HP
      self._enqueue(delay, function () {
        if (battleResult.finalState) {
          self.updateHPBars(
            battleResult.finalState.player.hp, playerDeck.general.hp,
            battleResult.finalState.enemy.hp, enemyDeck.general.hp
          );
          document.getElementById("player-ap-value").textContent = battleResult.finalState.player.ap;
          document.getElementById("enemy-ap-value").textContent = battleResult.finalState.enemy.ap;
        }
      });
      delay += 400;

      // Result
      self._enqueue(delay, function () {
        var w = battleResult.winner;
        var label = w === "player" ? "VICTORY!" : w === "enemy" ? "DEFEAT" : "DRAW";
        self._showPhaseBanner(label);
        self.addLogEntry({ type: "result", message: label });
      });
      delay += 2200;

      self._enqueue(delay, function () {
        self._battlePlaying = false;
        self.showResults(battleResult);
      });

      self._flushQueue();
    }, 500);
  },

  /* ---------- Animation Helpers ---------- */
  _showPhaseBanner: function (text) {
    var el = document.createElement("div");
    el.className = "phase-banner";
    el.textContent = text;
    document.body.appendChild(el);
    this._updatePhaseLabel(text);
    setTimeout(function () { el.remove(); }, 1400);
  },

  _screenFlash: function (type) {
    var el = document.createElement("div");
    el.className = "screen-flash " + type;
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 400);
  },

  _showAttackSlash: function () {
    var el = document.createElement("div");
    el.className = "attack-slash";
    el.innerHTML = '<div class="attack-slash-line"></div><div class="attack-slash-line"></div><div class="attack-slash-line"></div>';
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 500);
  },

  _shakeElement: function (selector) {
    var el = document.querySelector(selector);
    if (!el) return;
    el.classList.remove("shake");
    void el.offsetWidth;
    el.classList.add("shake");
    setTimeout(function () { el.classList.remove("shake"); }, 600);
  },

  _showTurnIndicator: function (turnNum) {
    var el = document.createElement("div");
    el.className = "turn-indicator";
    el.textContent = "— TURN " + turnNum + " —";
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 1100);
  },

  _glowGeneralCard: function (side) {
    var slotId = side === "player" ? "player-general-slot" : "enemy-general-slot";
    var slot = document.getElementById(slotId);
    if (!slot) return;
    var card = slot.querySelector(".card");
    if (!card) return;
    card.classList.remove("junction-glow");
    void card.offsetWidth;
    card.classList.add("junction-glow");
    setTimeout(function () { card.classList.remove("junction-glow"); }, 1300);
  },

  _showKO: function (loserSide) {
    this._screenFlash("ko-flash");
    var el = document.createElement("div");
    el.className = "ko-text";
    el.textContent = "K.O.";
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 1200);
  },

  _showUnitClash: function (ub, slotIdx, playerDeck, enemyDeck) {
    var self = this;
    var pUnit = ub.playerUnit || (playerDeck.units[slotIdx] || null);
    var eUnit = ub.enemyUnit || (enemyDeck.units[slotIdx] || null);

    var overlay = document.createElement("div");
    overlay.className = "unit-clash-overlay";

    var leftCard = document.createElement("div");
    leftCard.className = "clash-card clash-left";
    leftCard.style.borderColor = "var(--accent)";
    if (pUnit) {
      var pImg = window.CardImages ? CardImages.getImageForCard(pUnit) : null;
      if (pImg) {
        leftCard.innerHTML = '<img src="' + pImg + '" alt="">';
      } else {
        leftCard.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:var(--bg-card);color:var(--text);font-size:0.8rem;padding:8px;text-align:center">' + pUnit.name + '</div>';
      }
    } else {
      leftCard.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:var(--bg-card);color:var(--text-muted)">EMPTY</div>';
    }

    var vsEl = document.createElement("div");
    vsEl.className = "unit-clash-vs";
    vsEl.textContent = "VS";

    var rightCard = document.createElement("div");
    rightCard.className = "clash-card clash-right";
    rightCard.style.borderColor = "var(--assault)";
    if (eUnit) {
      var eImg = window.CardImages ? CardImages.getImageForCard(eUnit) : null;
      if (eImg) {
        rightCard.innerHTML = '<img src="' + eImg + '" alt="">';
      } else {
        rightCard.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:var(--bg-card);color:var(--text);font-size:0.8rem;padding:8px;text-align:center">' + eUnit.name + '</div>';
      }
    } else {
      rightCard.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:var(--bg-card);color:var(--text-muted)">EMPTY</div>';
    }

    overlay.appendChild(leftCard);
    overlay.appendChild(vsEl);
    overlay.appendChild(rightCard);
    document.body.appendChild(overlay);

    // Show result after 800ms
    setTimeout(function () {
      if (ub.winner === "player") {
        leftCard.classList.add("clash-winner");
        rightCard.classList.add("clash-loser");
        self._appendClashLabel(leftCard, "WIN!", "win");
        self._appendClashLabel(rightCard, "LOSE", "lose");
      } else if (ub.winner === "enemy") {
        leftCard.classList.add("clash-loser");
        rightCard.classList.add("clash-winner");
        self._appendClashLabel(leftCard, "LOSE", "lose");
        self._appendClashLabel(rightCard, "WIN!", "win");
      } else {
        self._appendClashLabel(leftCard, "DRAW", "lose");
        self._appendClashLabel(rightCard, "DRAW", "lose");
      }

      var pSlotCard = document.querySelector("#player-unit-" + slotIdx + " .card");
      var eSlotCard = document.querySelector("#enemy-unit-" + slotIdx + " .card");
      if (ub.winner === "player") {
        if (pSlotCard) pSlotCard.classList.add("battle-win");
        if (eSlotCard) eSlotCard.classList.add("battle-lose");
      } else if (ub.winner === "enemy") {
        if (pSlotCard) pSlotCard.classList.add("battle-lose");
        if (eSlotCard) eSlotCard.classList.add("battle-win");
      } else {
        if (pSlotCard) pSlotCard.classList.add("battle-draw");
        if (eSlotCard) eSlotCard.classList.add("battle-draw");
      }

      self.addLogEntry({
        type: "info",
        message: "Slot " + (slotIdx + 1) + ": " +
          (pUnit ? pUnit.name : "Empty") + " vs " + (eUnit ? eUnit.name : "Empty") +
          " → " + (ub.winner === "player" ? "You win!" : ub.winner === "enemy" ? "Enemy wins!" : "Draw!")
      });
    }, 800);

    // Remove overlay
    setTimeout(function () {
      overlay.classList.add("exiting");
      setTimeout(function () { overlay.remove(); }, 450);
    }, 1800);
  },

  _appendClashLabel: function (parent, text, cls) {
    var lbl = document.createElement("div");
    lbl.className = "clash-result-label " + cls;
    lbl.textContent = text;
    parent.style.position = "relative";
    parent.appendChild(lbl);
  },

  _enqueue: function (delay, fn) {
    this._battleQueue.push({ delay: delay, fn: fn });
  },

  _flushQueue: function () {
    this._battleQueue.forEach(function (item) {
      setTimeout(item.fn, item.delay);
    });
    this._battleQueue = [];
  },

  _setupBattleField: function (playerDeck, enemyDeck, opponentName) {
    document.getElementById("player-name").textContent = "YOU";
    document.getElementById("enemy-name").textContent = opponentName || "OPPONENT";

    document.getElementById("battle-log-entries").innerHTML = "";
    this._updatePhaseLabel("READY");

    this.updateHPBars(playerDeck.general.hp, playerDeck.general.hp, enemyDeck.general.hp, enemyDeck.general.hp);
    document.getElementById("player-ap-value").textContent = playerDeck.general.ap;
    document.getElementById("enemy-ap-value").textContent = enemyDeck.general.ap;

    // Place cards face-down
    var pGenSlot = document.getElementById("player-general-slot");
    pGenSlot.innerHTML = "";
    pGenSlot.appendChild(this.renderCard(playerDeck.general, { faceDown: true, clickable: false }));

    for (var i = 0; i < 3; i++) {
      var pSlot = document.getElementById("player-unit-" + i);
      pSlot.innerHTML = "";
      if (playerDeck.units[i]) {
        pSlot.appendChild(this.renderCard(playerDeck.units[i], { faceDown: true, clickable: false }));
      }
    }

    var eGenSlot = document.getElementById("enemy-general-slot");
    eGenSlot.innerHTML = "";
    eGenSlot.appendChild(this.renderCard(enemyDeck.general, { faceDown: true, clickable: false }));

    for (var j = 0; j < 3; j++) {
      var eSlot = document.getElementById("enemy-unit-" + j);
      eSlot.innerHTML = "";
      if (enemyDeck.units[j]) {
        eSlot.appendChild(this.renderCard(enemyDeck.units[j], { faceDown: true, clickable: false }));
      }
    }
  },

  _revealCard: function (slotId) {
    var slot = document.getElementById(slotId);
    if (!slot) return;
    var card = slot.querySelector(".card");
    if (!card) return;
    card.classList.remove("face-down");
    card.classList.add("flip-reveal");
  },

  _updatePhaseLabel: function (text) {
    var label = document.getElementById("battle-phase-label");
    if (label) label.textContent = text;
  },

  /* ---------- HP Bars ---------- */
  updateHPBars: function (playerHP, playerMaxHP, enemyHP, enemyMaxHP) {
    var pFill = document.getElementById("player-hp-fill");
    var eFill = document.getElementById("enemy-hp-fill");
    var pVal = document.getElementById("player-hp-value");
    var eVal = document.getElementById("enemy-hp-value");

    var pPct = Math.max(0, (playerHP / playerMaxHP) * 100);
    var ePct = Math.max(0, (enemyHP / enemyMaxHP) * 100);

    if (pFill) {
      pFill.style.width = pPct + "%";
      pFill.style.background = pPct <= 25
        ? "linear-gradient(90deg, #ff2222, #ff4444)"
        : pPct <= 50
          ? "linear-gradient(90deg, #ff6622, #ffaa44)"
          : "linear-gradient(90deg, #44cc44, #66ee66)";
    }
    if (eFill) {
      eFill.style.width = ePct + "%";
      eFill.style.background = ePct <= 25
        ? "linear-gradient(90deg, #ff2222, #ff4444)"
        : ePct <= 50
          ? "linear-gradient(90deg, #ff6622, #ffaa44)"
          : "linear-gradient(90deg, #44cc44, #66ee66)";
    }
    if (pVal) pVal.textContent = Math.max(0, playerHP);
    if (eVal) eVal.textContent = Math.max(0, enemyHP);
  },

  /* ---------- Floating Damage Numbers ---------- */
  showDamageNumber: function (side, amount, type) {
    var container = document.getElementById("floating-effects");
    var el = document.createElement("div");
    el.className = "floating-damage " + (type || "damage");
    if (type === "damage" && amount >= 5) el.classList.add("big-hit");

    var prefix = type === "heal" ? "+" : "-";
    el.textContent = prefix + amount;

    var sideEl = document.querySelector(side === "enemy" ? ".battle-enemy" : ".battle-player");
    if (sideEl) {
      var rect = sideEl.getBoundingClientRect();
      el.style.left = (rect.left + rect.width / 2 - 30 + Math.random() * 60) + "px";
      el.style.top = (rect.top + rect.height / 2) + "px";
    } else {
      el.style.left = "50%";
      el.style.top = side === "enemy" ? "25%" : "65%";
    }

    container.appendChild(el);
    setTimeout(function () { el.remove(); }, 1600);
  },

  /* ---------- Ability Popup ---------- */
  showAbilityPopup: function (side, abilityName, description) {
    var popup = document.createElement("div");
    popup.className = "ability-popup " + (side === "enemy" ? "enemy-side" : "player-side");
    popup.innerHTML = "<strong>" + abilityName + "</strong>" + (description ? "<br><small>" + description + "</small>" : "");
    document.body.appendChild(popup);
    setTimeout(function () { popup.remove(); }, 2200);
  },

  /* ---------- Battle Log ---------- */
  addLogEntry: function (entry) {
    var container = document.getElementById("battle-log-entries");
    if (!container) return;

    var el = document.createElement("div");
    el.className = "log-entry";

    var t = entry.type || "";
    if (t === "turn_end") return;
    if (t === "phase" || t === "turn_start") el.classList.add("log-phase");
    else if (t === "damage") el.classList.add("log-damage");
    else if (t === "attack") el.classList.add("log-damage");
    else if (t === "heal") el.classList.add("log-heal");
    else if (t === "ability" || t === "junction") el.classList.add("log-ability");
    else if (t === "combo" || t === "delta" || t === "delta_combo") el.classList.add("log-combo");
    else if (t === "result") el.classList.add("log-result");

    el.textContent = entry.message || "";
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;
  },

  /* ---------- Results Screen ---------- */
  showResults: function (battleResult) {
    this.showScreen("results");

    var banner = document.getElementById("results-banner");
    var text = document.getElementById("results-text");

    banner.className = "results-banner";
    if (battleResult.winner === "player") {
      banner.classList.add("victory");
      text.textContent = "VICTORY";
    } else if (battleResult.winner === "enemy") {
      banner.classList.add("defeat");
      text.textContent = "DEFEAT";
    } else {
      banner.classList.add("draw");
      text.textContent = "DRAW";
    }

    if (battleResult.finalState) {
      document.getElementById("result-player-hp").textContent = Math.max(0, battleResult.finalState.player.hp);
      document.getElementById("result-enemy-hp").textContent = Math.max(0, battleResult.finalState.enemy.hp);
    }

    var unitsWon = 0;
    if (battleResult.unitBattleResults) {
      battleResult.unitBattleResults.forEach(function (ub) {
        if (ub.winner === "player") unitsWon++;
      });
    }
    document.getElementById("result-units-won").textContent = unitsWon + " / " + (battleResult.unitBattleResults ? battleResult.unitBattleResults.length : 0);
    document.getElementById("result-rank").textContent = window.AI ? AI.playerRank : "—";
  },

  /* ---------- Title Screen Bindings ---------- */
  _bindTitleScreen: function () {
    var self = this;

    document.getElementById("btn-start").addEventListener("click", function () {
      self.showScreen("deck-builder");
    });

    document.getElementById("btn-collection").addEventListener("click", function () {
      self._renderCollection();
      self.showScreen("collection");
    });

    document.getElementById("btn-continue").addEventListener("click", function () {
      self.showScreen("deck-builder");
    });

    document.getElementById("btn-rematch").addEventListener("click", function () {
      if (window.DeckBuilder) DeckBuilder.startBattle();
    });
  },

  /* ---------- Collection Screen ---------- */
  _bindCollectionScreen: function () {
    var self = this;

    document.getElementById("btn-back-title-collection").addEventListener("click", function () {
      self.showScreen("title");
    });

    // Trinity filter buttons
    var colFilterBtns = document.querySelectorAll('[data-context="collection"]');
    colFilterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        colFilterBtns.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        self._renderCollection();
      });
    });

    document.getElementById("collection-filter-rarity").addEventListener("change", function () { self._renderCollection(); });
    document.getElementById("collection-filter-type").addEventListener("change", function () { self._renderCollection(); });
    document.getElementById("collection-search").addEventListener("input", function () { self._renderCollection(); });

    // Modal close
    document.getElementById("card-modal-close").addEventListener("click", function () {
      document.getElementById("card-modal-overlay").classList.remove("open");
    });
    document.getElementById("card-modal-overlay").addEventListener("click", function (e) {
      if (e.target === this) this.classList.remove("open");
    });
  },

  _renderCollection: function () {
    if (!window.CardsData) return;

    var trinityBtn = document.querySelector('[data-context="collection"].filter-btn.active');
    var trinityFilter = trinityBtn ? trinityBtn.getAttribute("data-trinity") : "all";
    var rarityFilter = document.getElementById("collection-filter-rarity").value;
    var typeFilter = document.getElementById("collection-filter-type").value;
    var searchText = document.getElementById("collection-search").value.toLowerCase().trim();

    var allCards = [].concat(CardsData.generals || [], CardsData.units || []);

    var filtered = allCards.filter(function (c) {
      if (trinityFilter !== "all" && c.trinity !== trinityFilter) return false;
      if (rarityFilter !== "all" && c.rarity !== rarityFilter) return false;
      if (typeFilter !== "all" && c.type !== typeFilter) return false;
      if (searchText) {
        var nameMatch = (c.name || "").toLowerCase().indexOf(searchText) !== -1;
        var jpMatch = (c.nameJp || "").toLowerCase().indexOf(searchText) !== -1;
        var charMatch = (c.character || "").toLowerCase().indexOf(searchText) !== -1;
        if (!nameMatch && !jpMatch && !charMatch) return false;
      }
      return true;
    });

    document.getElementById("collection-total").textContent = allCards.length;

    var grid = document.getElementById("collection-grid");
    grid.innerHTML = "";
    var self = this;

    filtered.forEach(function (card) {
      var cardEl = self.renderCard(card, { size: "small", clickable: true });
      cardEl.addEventListener("click", function () { self._showCardModal(card); });
      grid.appendChild(cardEl);
    });
  },

  _showCardModal: function (card) {
    var content = document.getElementById("card-modal-content");
    content.innerHTML = "";

    content.appendChild(this.renderCard(card, { size: "large", clickable: false }));

    var info = document.createElement("div");
    info.className = "card-detail-info";

    var rows = [
      { label: "ID", value: card.id },
      { label: "Type", value: card.type.charAt(0).toUpperCase() + card.type.slice(1) },
      { label: "Trinity", value: card.trinity.charAt(0).toUpperCase() + card.trinity.slice(1) },
      { label: "Rarity", value: card.rarity }
    ];

    if (card.type === "general") {
      rows.push({ label: "HP", value: card.hp });
      rows.push({ label: "AP", value: card.ap });
      rows.push({ label: "Charisma", value: card.charisma });
    } else {
      rows.push({ label: "Cost", value: card.cost });
      if (card.character) rows.push({ label: "Character", value: card.character });
    }

    if (card.junctionAbilityName) {
      rows.push({ label: "Junction", value: card.junctionAbilityName });
    }

    rows.forEach(function (r) {
      var row = document.createElement("div");
      row.className = "card-detail-row";
      row.innerHTML = '<span class="card-detail-label">' + r.label + '</span><span class="card-detail-value">' + r.value + "</span>";
      info.appendChild(row);
    });

    content.appendChild(info);
    document.getElementById("card-modal-overlay").classList.add("open");
  }
};
