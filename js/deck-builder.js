/* ========================================================
   CRIMSON VS — Deck Builder
   ======================================================== */
window.DeckBuilder = {
  selectedGeneral: null,
  selectedUnits: [null, null, null],
  filters: { trinity: "all", rarity: "all", type: "all", search: "" },
  _lastOpponent: null,

  /* ---------- Initialization ---------- */
  init: function () {
    this._bindFilters();
    this._bindSlots();
    this._bindActions();
    this._loadDeck();
    this._updateRankDisplay();
    this.renderCardGrid();
  },

  /* ---------- Card Grid ---------- */
  renderCardGrid: function () {
    if (!window.CardsData) return;

    var grid = document.getElementById("card-grid");
    grid.innerHTML = "";

    var allCards = this._getFilteredCards();
    var self = this;
    var remaining = this.getRemainingCharisma();

    allCards.forEach(function (card) {
      var isSelected = self._isCardSelected(card);
      var isLocked = window.Inventory && !Inventory.owns(card.id);
      var isDisabled = isLocked;

      if (card.type === "unit" && !isSelected && !isLocked) {
        if (!self.selectedGeneral) isDisabled = true;
        else if (card.cost > remaining) isDisabled = true;
        else if (self.selectedUnits[0] && self.selectedUnits[1] && self.selectedUnits[2]) isDisabled = true;
      }
      if (card.type === "general" && self.selectedGeneral && self.selectedGeneral.id !== card.id) {
        // generals remain clickable to swap
      }

      var cardEl = UI.renderCard(card, {
        size: "small",
        clickable: !isLocked,
        selected: isSelected,
        locked: isLocked
      });
      if (isDisabled) cardEl.classList.add("disabled");

      cardEl.addEventListener("click", function () {
        if (isDisabled) return;
        if (window.UI) UI.markCardSeen(card.id);
        if (card.type === "general") {
          self.selectGeneral(card);
        } else {
          if (isSelected) {
            var idx = self._findUnitSlot(card);
            if (idx !== -1) self.removeUnit(idx);
          } else {
            self.addUnit(card);
          }
        }
      });

      grid.appendChild(cardEl);
    });

    if (window.UI) UI.observeNewCards(grid);
  },

  _getFilteredCards: function () {
    var f = this.filters;
    var generals = (CardsData.generals || []).slice();
    var units = (CardsData.units || []).slice();
    var all = generals.concat(units);

    return all.filter(function (c) {
      if (f.trinity !== "all" && c.trinity !== f.trinity) return false;
      if (f.rarity !== "all" && c.rarity !== f.rarity) return false;
      if (f.type !== "all" && c.type !== f.type) return false;
      if (f.search) {
        var s = f.search.toLowerCase();
        var nameMatch = (c.name || "").toLowerCase().indexOf(s) !== -1;
        var jpMatch = (c.nameJp || "").toLowerCase().indexOf(s) !== -1;
        var charMatch = (c.character || "").toLowerCase().indexOf(s) !== -1;
        if (!nameMatch && !jpMatch && !charMatch) return false;
      }
      return true;
    });
  },

  /* ---------- General Selection ---------- */
  selectGeneral: function (card) {
    if (card.type !== "general") return;

    var oldCharisma = this.selectedGeneral ? this.selectedGeneral.charisma : 0;
    this.selectedGeneral = card;

    if (card.charisma < oldCharisma) {
      var totalCost = this._getTotalUnitCost();
      if (totalCost > card.charisma) {
        this.selectedUnits = [null, null, null];
      }
    }

    this._updateDeckDisplay();
    this.renderCardGrid();
    this.saveDeck();
  },

  /* ---------- Unit Management ---------- */
  addUnit: function (card, slot) {
    if (card.type !== "unit") return;
    if (!this.selectedGeneral) return;

    var remaining = this.getRemainingCharisma();
    if (card.cost > remaining) return;

    if (slot !== undefined && slot >= 0 && slot < 3) {
      this.selectedUnits[slot] = card;
    } else {
      var emptySlot = this.selectedUnits.indexOf(null);
      if (emptySlot === -1) return;
      this.selectedUnits[emptySlot] = card;
    }

    this._updateDeckDisplay();
    this.renderCardGrid();
    this.saveDeck();
  },

  removeUnit: function (slot) {
    if (slot < 0 || slot > 2) return;
    this.selectedUnits[slot] = null;
    this._updateDeckDisplay();
    this.renderCardGrid();
    this.saveDeck();
  },

  /* ---------- Charisma ---------- */
  getRemainingCharisma: function () {
    if (!this.selectedGeneral) return 0;
    return this.selectedGeneral.charisma - this._getTotalUnitCost();
  },

  _getTotalUnitCost: function () {
    var total = 0;
    this.selectedUnits.forEach(function (u) {
      if (u) total += u.cost;
    });
    return total;
  },

  /* ---------- Delta Combo ---------- */
  checkDeltaCombo: function () {
    var indicator = document.getElementById("delta-combo-indicator");
    var textEl = indicator.querySelector(".delta-combo-text");

    if (!window.DeltaCombos || !this.selectedUnits[0] || !this.selectedUnits[1] || !this.selectedUnits[2]) {
      indicator.classList.remove("active");
      textEl.textContent = "No Delta Combo";
      return null;
    }

    var result = DeltaCombos.detect(this.selectedUnits[0], this.selectedUnits[1], this.selectedUnits[2]);

    if (result) {
      indicator.classList.add("active");
      textEl.textContent = "△ " + (result.name || "Delta Combo Active!");
      return result;
    } else {
      indicator.classList.remove("active");
      textEl.textContent = "No Delta Combo";
      return null;
    }
  },

  /* ---------- Deck Object ---------- */
  getDeck: function () {
    if (!this.selectedGeneral) return null;
    if (!this.selectedUnits[0] || !this.selectedUnits[1] || !this.selectedUnits[2]) return null;

    return {
      general: this.selectedGeneral,
      units: this.selectedUnits.slice()
    };
  },

  /* ---------- Persistence ---------- */
  saveDeck: function () {
    var generalId = this.selectedGeneral ? this.selectedGeneral.id : null;
    var unitIds = this.selectedUnits.map(function (u) { return u ? u.id : null; });
    if (window.Save) {
      Save.setDeck(generalId, unitIds);
      return;
    }
    try {
      localStorage.setItem("crimsonvs_deck", JSON.stringify({ generalId: generalId, unitIds: unitIds }));
    } catch (e) { /* noop */ }
  },

  _loadDeck: function () {
    if (!window.CardsData) return;

    if (window.Inventory) Inventory.sanitizeDeckIds();

    var data;
    if (window.Save) {
      data = Save.getDeckIds();
    } else {
      try {
        var raw = localStorage.getItem("crimsonvs_deck");
        if (!raw) return;
        data = JSON.parse(raw);
      } catch (e) { return; }
    }

    if (data.generalId) {
      var gen = CardsData.getCard(data.generalId);
      if (gen && gen.type === "general") {
        if (!window.Inventory || Inventory.owns(gen.id)) this.selectedGeneral = gen;
      }
    }

    if (data.unitIds && Array.isArray(data.unitIds)) {
      for (var i = 0; i < 3; i++) {
        if (data.unitIds[i]) {
          var unit = CardsData.getCard(data.unitIds[i]);
          if (unit && unit.type === "unit") {
            if (!window.Inventory || Inventory.owns(unit.id)) this.selectedUnits[i] = unit;
          }
        }
      }
    }

    this._updateDeckDisplay();
  },

  /* ---------- Battle ---------- */
  resolveBattle: function (deck, options) {
    options = options || {};
    deck = deck || this.getDeck();
    if (!deck) return null;

    if (window.BattleEngine && BattleEngine.validateDeck) {
      var valid = BattleEngine.validateDeck(deck);
      if (valid && valid.valid === false) {
        if (!options.silent) {
          alert("Invalid deck: " + (valid.errors ? valid.errors.join(", ") : "Unknown error"));
        }
        return null;
      }
    }

    if (window.Inventory) {
      var ownedCheck = Inventory.validateDeckOwned(deck);
      if (!ownedCheck.valid) {
        if (!options.silent) {
          alert("Deck has unowned cards: " + ownedCheck.errors.join(", "));
        }
        return null;
      }
    }

    var opponent = AI.generateOpponent();
    this._lastOpponent = opponent;

    var seed = options.seed != null ? options.seed : Date.now();
    var result = BattleEngine.runBattle(deck, opponent.deck, seed);
    var won = result.winner === "player";

    AI.reportResult(won);

    var reward = null;
    if (window.Progression) {
      reward = Progression.grantRewards(won, AI.playerRank, opponent.name);
    }

    if (window.Save) {
      var sd = Save.get();
      sd.lastBattle = {
        result: result,
        deck: deck,
        opponent: opponent,
        at: Date.now()
      };
      Save.save();
    }

    return { result: result, opponent: opponent, reward: reward, won: won };
  },

  startBattle: function () {
    var deck = this.getDeck();
    var resolved = this.resolveBattle(deck);
    if (!resolved) return;

    this._updateRankDisplay();
    UI.playBattle(
      resolved.result,
      deck,
      resolved.opponent.deck,
      resolved.opponent.name + " (Rank " + resolved.opponent.rank + ")"
    );
  },

  /* ---------- UI Updates ---------- */
  _updateDeckDisplay: function () {
    var self = this;

    // General slot
    var genSlot = document.getElementById("slot-general");
    genSlot.innerHTML = "";
    genSlot.classList.toggle("filled", !!this.selectedGeneral);

    if (this.selectedGeneral) {
      var genCard = UI.renderCard(this.selectedGeneral, { size: "small", clickable: false });
      genSlot.appendChild(genCard);

      var removeBtn = document.createElement("button");
      removeBtn.className = "slot-remove";
      removeBtn.textContent = "×";
      removeBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        self.selectedGeneral = null;
        self.selectedUnits = [null, null, null];
        self._updateDeckDisplay();
        self.renderCardGrid();
        self.saveDeck();
      });
      genSlot.appendChild(removeBtn);
    } else {
      genSlot.innerHTML = '<div class="slot-placeholder">Select a General</div>';
    }

    // Unit slots
    for (var i = 0; i < 3; i++) {
      var uSlot = document.getElementById("slot-unit-" + i);
      uSlot.innerHTML = "";
      uSlot.classList.toggle("filled", !!this.selectedUnits[i]);

      if (this.selectedUnits[i]) {
        var uCard = UI.renderCard(this.selectedUnits[i], { size: "small", clickable: false });
        uSlot.appendChild(uCard);

        (function (idx) {
          var rBtn = document.createElement("button");
          rBtn.className = "slot-remove";
          rBtn.textContent = "×";
          rBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            self.removeUnit(idx);
          });
          uSlot.appendChild(rBtn);
        })(i);
      } else {
        uSlot.innerHTML = '<div class="slot-placeholder">Unit ' + (i + 1) + "</div>";
      }
    }

    // Charisma bar
    var total = this.selectedGeneral ? this.selectedGeneral.charisma : 0;
    var used = this._getTotalUnitCost();
    document.getElementById("charisma-used").textContent = used;
    document.getElementById("charisma-total").textContent = total;

    var fill = document.getElementById("charisma-fill");
    fill.style.width = total > 0 ? Math.min(100, (used / total) * 100) + "%" : "0%";
    fill.classList.toggle("over-budget", used > total);

    // Delta Combo
    this.checkDeltaCombo();

    // Battle button
    var deck = this.getDeck();
    document.getElementById("btn-battle").disabled = !deck;
  },

  _updateRankDisplay: function () {
    if (!window.AI) return;
    document.getElementById("rank-number").textContent = AI.playerRank;
    document.getElementById("rank-wins").textContent = AI.wins;
    document.getElementById("rank-losses").textContent = AI.losses;
  },

  _isCardSelected: function (card) {
    if (card.type === "general") return this.selectedGeneral && this.selectedGeneral.id === card.id;
    return this.selectedUnits.some(function (u) { return u && u.id === card.id; });
  },

  _findUnitSlot: function (card) {
    for (var i = 0; i < 3; i++) {
      if (this.selectedUnits[i] && this.selectedUnits[i].id === card.id) return i;
    }
    return -1;
  },

  /* ---------- Filter Bindings ---------- */
  _bindFilters: function () {
    var self = this;

    var trinityBtns = document.querySelectorAll(".card-pool .filter-trinity .filter-btn");
    trinityBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        trinityBtns.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        self.filters.trinity = btn.getAttribute("data-trinity");
        self.renderCardGrid();
      });
    });

    document.getElementById("filter-rarity").addEventListener("change", function () {
      self.filters.rarity = this.value;
      self.renderCardGrid();
    });

    document.getElementById("filter-type").addEventListener("change", function () {
      self.filters.type = this.value;
      self.renderCardGrid();
    });

    document.getElementById("filter-search").addEventListener("input", function () {
      self.filters.search = this.value;
      self.renderCardGrid();
    });
  },

  /* ---------- Slot Click Bindings ---------- */
  _bindSlots: function () {
    var self = this;

    document.getElementById("slot-general").addEventListener("click", function () {
      self.filters.type = "general";
      document.getElementById("filter-type").value = "general";
      self.renderCardGrid();
    });

    for (var i = 0; i < 3; i++) {
      (function (idx) {
        document.getElementById("slot-unit-" + idx).addEventListener("click", function () {
          if (!self.selectedUnits[idx]) {
            self.filters.type = "unit";
            document.getElementById("filter-type").value = "unit";
            self.renderCardGrid();
          }
        });
      })(i);
    }
  },

  /* ---------- Action Bindings ---------- */
  _bindActions: function () {
    var self = this;

    document.getElementById("btn-battle").addEventListener("click", function () {
      self.startBattle();
    });

    document.getElementById("btn-clear-deck").addEventListener("click", function () {
      self.selectedGeneral = null;
      self.selectedUnits = [null, null, null];
      self._updateDeckDisplay();
      self.renderCardGrid();
      self.saveDeck();
    });

    document.getElementById("btn-back-title").addEventListener("click", function () {
      UI.showScreen("title");
    });
  }
};
