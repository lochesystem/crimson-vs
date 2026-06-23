(function () {
  "use strict";

  // ─── Seeded PRNG (mulberry32) ───────────────────────────────────────

  function createRNG(seed) {
    var s = seed | 0;
    return function () {
      s = s + 0x6D2B79F5 | 0;
      var t = Math.imul(s ^ s >>> 15, 1 | s);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // ─── Helpers ────────────────────────────────────────────────────────

  function opp(side) { return side === "your" ? "enemy" : "your"; }

  function log(state, type, msg, data) {
    state.log.push({ type: type, message: msg, data: data || {} });
  }

  function clampAP(gen) { if (gen.ap < 0) gen.ap = 0; }

  function copyCard(card) {
    var c = {};
    for (var k in card) {
      if (card.hasOwnProperty(k)) c[k] = card[k];
    }
    return c;
  }

  // Trinity advantage: returns 1 if a beats b, -1 if b beats a, 0 if equal
  function trinityAdvantage(a, b) {
    if (a === b) return 0;
    if ((a === "snipe" && b === "assault") ||
        (a === "assault" && b === "shield") ||
        (a === "shield" && b === "snipe")) return 1;
    return -1;
  }

  // ─── Public API ─────────────────────────────────────────────────────

  window.BattleEngine = {

    validateDeck: function (deck) {
      var errors = [];
      if (!deck) { return { valid: false, errors: ["Deck is null or undefined"] }; }
      if (!deck.general) { errors.push("No general card"); }
      else if (deck.general.type !== "general") { errors.push("General card is not type 'general'"); }

      if (!deck.units || !Array.isArray(deck.units)) {
        errors.push("Units must be an array");
      } else {
        if (deck.units.length !== 3) {
          errors.push("Must have exactly 3 unit cards, got " + deck.units.length);
        }
        var totalCost = 0;
        for (var i = 0; i < deck.units.length; i++) {
          if (!deck.units[i]) { errors.push("Unit slot " + (i + 1) + " is empty"); continue; }
          if (deck.units[i].type !== "unit") { errors.push("Card in unit slot " + (i + 1) + " is not type 'unit'"); }
          totalCost += (deck.units[i].cost || 0);
        }
        if (deck.general && totalCost > (deck.general.charisma || 0)) {
          errors.push("Total unit cost (" + totalCost + ") exceeds general's charisma (" + (deck.general.charisma || 0) + ")");
        }
      }
      return { valid: errors.length === 0, errors: errors };
    },

    runBattle: function (playerDeck, enemyDeck, seed) {
      var rng = createRNG(seed != null ? seed : Date.now());

      // Build initial state
      var state = {
        your: {
          general: copyCard(playerDeck.general),
          junctioned: [],
          activeEffects: []
        },
        enemy: {
          general: copyCard(enemyDeck.general),
          junctioned: [],
          activeEffects: []
        },
        turn: 0,
        firstAttacker: "your",
        hasDeltaCombo: { your: null, enemy: null },
        log: [],
        rng: rng
      };

      // Copy AP/HP from card stats
      state.your.general.ap = state.your.general.ap || 0;
      state.your.general.hp = state.your.general.hp || 0;
      state.enemy.general.ap = state.enemy.general.ap || 0;
      state.enemy.general.hp = state.enemy.general.hp || 0;

      var unitBattleResults = [];

      // ── Phase 1: Delta Combos ──────────────────────────────────
      this._deltaComboPhase(state, playerDeck, enemyDeck);

      // ── Phase 2: Unit Battles ──────────────────────────────────
      unitBattleResults = this._unitBattle(state, playerDeck, enemyDeck);

      // ── Phase 3: General Battle ────────────────────────────────
      this._generalBattle(state);

      // ── Determine Winner ───────────────────────────────────────
      var winner;
      var yourHP = state.your.general.hp;
      var enemyHP = state.enemy.general.hp;

      if (yourHP <= 0 && enemyHP <= 0) {
        winner = "draw";
      } else if (yourHP <= 0) {
        winner = "enemy";
      } else if (enemyHP <= 0) {
        winner = "player";
      } else if (yourHP > enemyHP) {
        winner = "player";
      } else if (enemyHP > yourHP) {
        winner = "enemy";
      } else {
        winner = "draw";
      }

      log(state, "result", "Battle result: " + winner, { winner: winner });

      return {
        winner: winner,
        log: state.log,
        finalState: {
          player: { hp: state.your.general.hp, ap: state.your.general.ap },
          enemy:  { hp: state.enemy.general.hp, ap: state.enemy.general.ap }
        },
        unitBattleResults: unitBattleResults,
        phases: {
          deltaCombo: { your: state.hasDeltaCombo.your, enemy: state.hasDeltaCombo.enemy },
          unitBattle: { results: unitBattleResults },
          generalBattle: {
            firstAttacker: state.firstAttacker,
            turnsPlayed: state.turn,
            yourJunctioned: state.your.junctioned.length,
            enemyJunctioned: state.enemy.junctioned.length
          }
        }
      };
    },

    // ── Delta Combo Phase ─────────────────────────────────────────────

    _deltaComboPhase: function (state, playerDeck, enemyDeck) {
      if (!window.DeltaCombos || typeof window.DeltaCombos.findCombo !== "function") return;

      var DC = window.DeltaCombos;
      var pCombo = DC.findCombo(playerDeck.units) || null;
      var eCombo = DC.findCombo(enemyDeck.units) || null;

      if (pCombo) log(state, "delta_combo", "Player activates Delta Combo: " + pCombo.name, { side: "your", combo: pCombo });
      if (eCombo) log(state, "delta_combo", "Enemy activates Delta Combo: " + eCombo.name, { side: "enemy", combo: eCombo });

      // Cancel-type combos negate the opposing combo
      var pCancel = pCombo && (pCombo.cancelsEnemyCombo || pCombo.effect === "cancel_combo");
      var eCancel = eCombo && (eCombo.cancelsEnemyCombo || eCombo.effect === "cancel_combo");

      if (pCancel && eCancel) {
        log(state, "delta_combo", "Both cancel combos negate each other!", {});
        pCombo = null;
        eCombo = null;
      } else if (pCancel && eCombo) {
        log(state, "delta_combo", "Player's " + pCombo.name + " cancels enemy combo!", {});
        eCombo = null;
      } else if (eCancel && pCombo) {
        log(state, "delta_combo", "Enemy's " + eCombo.name + " cancels player combo!", {});
        pCombo = null;
      }

      state.hasDeltaCombo.your = pCombo;
      state.hasDeltaCombo.enemy = eCombo;
    },

    // ── Unit Battle Phase ─────────────────────────────────────────────

    _unitBattle: function (state, playerDeck, enemyDeck) {
      var results = [];

      // Get cost modifiers from delta combos
      var pCostMod = 0;
      var eCostMod = 0;
      var pCombo = state.hasDeltaCombo.your;
      var eCombo = state.hasDeltaCombo.enemy;
      if (pCombo) {
        if (pCombo.effect === "unit_cost_up") pCostMod += pCombo.value;
        if (pCombo.effect === "unit_cost_down") eCostMod -= pCombo.value;
      }
      if (eCombo) {
        if (eCombo.effect === "unit_cost_up") eCostMod += eCombo.value;
        if (eCombo.effect === "unit_cost_down") pCostMod -= eCombo.value;
      }

      for (var slot = 0; slot < 3; slot++) {
        var pUnit = playerDeck.units[slot] ? copyCard(playerDeck.units[slot]) : null;
        var eUnit = enemyDeck.units[slot]  ? copyCard(enemyDeck.units[slot])  : null;

        if (!pUnit && !eUnit) {
          results.push({ slot: slot + 1, winner: "draw", playerUnit: null, enemyUnit: null });
          continue;
        }
        if (!pUnit) {
          state.enemy.junctioned.push(eUnit);
          log(state, "unit_battle", "Slot " + (slot + 1) + ": enemy " + eUnit.name + " wins (no opponent)", { slot: slot + 1 });
          results.push({ slot: slot + 1, winner: "enemy", playerUnit: null, enemyUnit: eUnit });
          continue;
        }
        if (!eUnit) {
          state.your.junctioned.push(pUnit);
          log(state, "unit_battle", "Slot " + (slot + 1) + ": player " + pUnit.name + " wins (no opponent)", { slot: slot + 1 });
          results.push({ slot: slot + 1, winner: "player", playerUnit: pUnit, enemyUnit: null });
          continue;
        }

        var pCost = (pUnit.cost || 0) + pCostMod;
        var eCost = (eUnit.cost || 0) + eCostMod;

        // Trinity tiebreaker: advantaged side gets +1 effective cost
        var tAdv = trinityAdvantage(pUnit.trinity, eUnit.trinity);
        if (pCost === eCost && tAdv !== 0) {
          if (tAdv === 1) pCost += 1;
          else eCost += 1;
        }

        var slotWinner;
        if (pCost > eCost) {
          slotWinner = "player";
          state.your.junctioned.push(pUnit);
          log(state, "unit_battle",
            "Slot " + (slot + 1) + ": " + pUnit.name + " (cost " + pCost + ") beats " + eUnit.name + " (cost " + eCost + ")",
            { slot: slot + 1, winner: "player" });
        } else if (eCost > pCost) {
          slotWinner = "enemy";
          state.enemy.junctioned.push(eUnit);
          log(state, "unit_battle",
            "Slot " + (slot + 1) + ": " + eUnit.name + " (cost " + eCost + ") beats " + pUnit.name + " (cost " + pCost + ")",
            { slot: slot + 1, winner: "enemy" });
        } else {
          slotWinner = "draw";
          log(state, "unit_battle",
            "Slot " + (slot + 1) + ": " + pUnit.name + " and " + eUnit.name + " tie — both eliminated",
            { slot: slot + 1, winner: "draw" });
        }

        results.push({ slot: slot + 1, winner: slotWinner, playerUnit: pUnit, enemyUnit: eUnit });
      }

      return results;
    },

    // ── General Battle Phase ──────────────────────────────────────────

    _generalBattle: function (state) {
      var JE = window.JunctionEngine;
      var yourGen = state.your.general;
      var enemyGen = state.enemy.general;

      // 1. Determine initial turn order
      var tAdv = trinityAdvantage(yourGen.trinity, enemyGen.trinity);
      if (tAdv === 1) {
        state.firstAttacker = "your";
      } else if (tAdv === -1) {
        state.firstAttacker = "enemy";
      } else {
        // Same trinity → higher charisma goes first
        var yCha = yourGen.charisma || 0;
        var eCha = enemyGen.charisma || 0;
        if (yCha >= eCha) {
          state.firstAttacker = "your";
        } else {
          state.firstAttacker = "enemy";
        }
      }

      log(state, "effect", "Turn order: " + state.firstAttacker + " attacks first (Trinity/Charisma)", {
        firstAttacker: state.firstAttacker
      });

      // 2. Apply delta combo stat effects to generals
      var sides = ["your", "enemy"];
      for (var s = 0; s < sides.length; s++) {
        var combo = state.hasDeltaCombo[sides[s]];
        if (!combo) continue;
        var eSide = sides[s] === "your" ? "enemy" : "your";
        if (combo.effect === "ap_up") {
          state[sides[s]].general.ap += combo.value;
          log(state, "delta_combo", sides[s] + " Delta Combo: +" + combo.value + " AP", { side: sides[s] });
        } else if (combo.effect === "ap_down") {
          state[eSide].general.ap = Math.max(0, state[eSide].general.ap - combo.value);
          log(state, "delta_combo", sides[s] + " Delta Combo: -" + combo.value + " AP to opponent", { side: sides[s] });
        } else if (combo.effect === "hp_up") {
          state[sides[s]].general.hp += combo.value;
          log(state, "delta_combo", sides[s] + " Delta Combo: +" + combo.value + " HP", { side: sides[s] });
        } else if (combo.effect === "hp_down") {
          state[eSide].general.hp -= combo.value;
          log(state, "delta_combo", sides[s] + " Delta Combo: -" + combo.value + " HP to opponent", { side: sides[s] });
        }
      }

      // 3. Apply junction abilities (may override turn order)
      JE.applyInitialEffects(state);

      var firstSide = state.firstAttacker;
      var secondSide = opp(firstSide);

      log(state, "effect", "General Battle begins — " + firstSide + " goes first", {
        yourAP: yourGen.ap, yourHP: yourGen.hp,
        enemyAP: enemyGen.ap, enemyHP: enemyGen.hp
      });

      // 3. Battle loop — up to 10 turns
      for (var t = 1; t <= 10; t++) {
        state.turn = t;
        log(state, "turn_start", "── Turn " + t + " ──", { turn: t });

        // Turn-start effects
        JE.applyTurnStartEffects(state, firstSide);
        JE.applyTurnStartEffects(state, secondSide);

        // Check for deaths from turn-start effects
        if (yourGen.hp <= 0 || enemyGen.hp <= 0) {
          JE.checkSurvival(state, "your");
          JE.checkSurvival(state, "enemy");
          if (yourGen.hp <= 0 || enemyGen.hp <= 0) break;
        }

        // First attacker attacks
        var firstSkipped = JE.consumeTurnSkip(state, firstSide);
        if (!firstSkipped && JE.canAttack(state, firstSide)) {
          performAttack(state, firstSide, secondSide);
          if (state[secondSide].general.hp <= 0) {
            JE.checkSurvival(state, secondSide);
            if (state[secondSide].general.hp <= 0) {
              log(state, "turn_end", "Turn " + t + " ends (KO)", { turn: t });
              break;
            }
          }
        }

        // Second attacker attacks (if still alive)
        if (state[firstSide].general.hp <= 0) {
          JE.checkSurvival(state, firstSide);
          if (state[firstSide].general.hp <= 0) {
            log(state, "turn_end", "Turn " + t + " ends (KO)", { turn: t });
            break;
          }
        }

        var secondSkipped = JE.consumeTurnSkip(state, secondSide);
        if (!secondSkipped && JE.canAttack(state, secondSide)) {
          performAttack(state, secondSide, firstSide);
          if (state[firstSide].general.hp <= 0) {
            JE.checkSurvival(state, firstSide);
            if (state[firstSide].general.hp <= 0) {
              log(state, "turn_end", "Turn " + t + " ends (KO)", { turn: t });
              break;
            }
          }
        }

        // Turn-end effects
        JE.applyTurnEndEffects(state, firstSide);
        JE.applyTurnEndEffects(state, secondSide);

        log(state, "turn_end", "Turn " + t + " ends — Your HP:" + yourGen.hp + " AP:" + yourGen.ap +
          " | Enemy HP:" + enemyGen.hp + " AP:" + enemyGen.ap, { turn: t });

        // Check for deaths from turn-end effects
        if (yourGen.hp <= 0 || enemyGen.hp <= 0) {
          JE.checkSurvival(state, "your");
          JE.checkSurvival(state, "enemy");
          if (yourGen.hp <= 0 || enemyGen.hp <= 0) break;
        }
      }
    }
  };

  // ─── Attack Helper ──────────────────────────────────────────────────

  function performAttack(state, attackerSide, defenderSide) {
    var JE = window.JunctionEngine;
    var attacker = state[attackerSide].general;
    var defender = state[defenderSide].general;

    var baseDmg = attacker.ap;
    var modifiedDmg = JE.onDealDamage(state, attackerSide, baseDmg);

    log(state, "attack", attackerSide + " general attacks for " + modifiedDmg + " damage", {
      attacker: attackerSide, baseDamage: baseDmg, modifiedDamage: modifiedDmg
    });

    var finalDmg = JE.onTakeDamage(state, defenderSide, modifiedDmg, "attack");
    defender.hp -= finalDmg;

    if (finalDmg !== modifiedDmg) {
      log(state, "damage", defenderSide + " takes " + finalDmg + " damage (reduced from " + modifiedDmg + ")", {
        target: defenderSide, damage: finalDmg
      });
    } else {
      log(state, "damage", defenderSide + " takes " + finalDmg + " damage", {
        target: defenderSide, damage: finalDmg
      });
    }
  }

})();
