(function () {
  "use strict";

  // ─── Utilities ───────────────────────────────────────────────────────

  function opp(side) { return side === "your" ? "enemy" : "your"; }

  function log(state, type, msg, data) {
    state.log.push({ type: type, message: msg, data: data || {} });
  }

  function clampAP(gen) { if (gen.ap < 0) gen.ap = 0; }

  function addEffect(state, side, effect) {
    state[side].activeEffects.push(effect);
  }

  function hasEffect(state, side, key) {
    for (var i = 0; i < state[side].activeEffects.length; i++) {
      if (state[side].activeEffects[i].key === key) return true;
    }
    return false;
  }

  function getEffect(state, side, key) {
    for (var i = 0; i < state[side].activeEffects.length; i++) {
      if (state[side].activeEffects[i].key === key) return state[side].activeEffects[i];
    }
    return null;
  }

  function removeEffect(state, side, key) {
    var arr = state[side].activeEffects;
    for (var i = arr.length - 1; i >= 0; i--) {
      if (arr[i].key === key) { arr.splice(i, 1); return true; }
    }
    return false;
  }

  function removeAllEffectsBySource(state, side, sourceId) {
    var arr = state[side].activeEffects;
    var count = 0;
    for (var i = arr.length - 1; i >= 0; i--) {
      if (arr[i].sourceId === sourceId) { arr.splice(i, 1); count++; }
    }
    return count;
  }

  function countEffects(state, side) {
    return state[side].activeEffects.length;
  }

  function getEffectsWithTrinity(state, side, trinity) {
    var results = [];
    for (var i = 0; i < state[side].activeEffects.length; i++) {
      var e = state[side].activeEffects[i];
      if (e.sourceTrinity === trinity) results.push({ index: i, effect: e });
    }
    return results;
  }

  function hasBothSideEffect(state, key) {
    return hasEffect(state, "your", key) || hasEffect(state, "enemy", key);
  }

  // ─── Damage Pipeline ────────────────────────────────────────────────
  // Used for BOTH normal attacks and ability damage.
  // isReflected prevents infinite recursion from cross_counter / reflection.

  function processIncomingDamage(state, targetSide, rawAmount, damageType, isReflected) {
    var amount = rawAmount;
    if (amount <= 0) return 0;
    var attackerSide = opp(targetSide);
    var effects = state[targetSide].activeEffects;

    // Mind's Eye: dodge one normal attack
    if (damageType === "attack" && !isReflected) {
      var me = getEffect(state, targetSide, "minds_eye");
      if (me && !me.used) {
        me.used = true;
        log(state, "effect", "Mind's Eye dodges the attack!", { side: targetSide });
        return 0;
      }
    }

    // Demon Sword Maxwell: negate all junction ability damage
    if (damageType === "ability") {
      if (hasEffect(state, targetSide, "demon_sword_maxwell")) {
        log(state, "effect", "Demon Sword Maxwell negates ability damage", { side: targetSide });
        return 0;
      }
      var ad = getEffect(state, targetSide, "avatars_descent");
      if (ad && ad.turnsRemaining > 0) {
        log(state, "effect", "Avatar's Descent negates ability damage", { side: targetSide });
        return 0;
      }
    }

    // Damage reduction stack
    var reduction = 0;
    for (var i = 0; i < effects.length; i++) {
      if (effects[i].key === "damage_reduction") reduction += effects[i].value;
    }
    if (damageType === "attack" && hasEffect(state, targetSide, "emperors_pride")) {
      reduction += 1;
    }
    amount -= reduction;

    // Extra damage taken (reckless_rewards, estranged_self, avatar_berserk)
    for (var i = 0; i < effects.length; i++) {
      if (effects[i].key === "extra_damage_taken") amount += effects[i].value;
    }

    // Detail Oriented: damage <=2 on EITHER side becomes 0
    if (hasBothSideEffect(state, "detail_oriented") && amount > 0 && amount <= 2) {
      amount = 0;
    }

    // Promised Discretion: cap damage at 3 for BOTH generals
    if (hasBothSideEffect(state, "promised_discretion") && amount > 3) {
      amount = 3;
    }

    if (amount < 0) amount = 0;

    // Triggered effects (only on non-reflected damage to avoid recursion)
    if (!isReflected && amount > 0) {
      if (hasEffect(state, targetSide, "cross_counter")) {
        applyCounterDamage(state, attackerSide, 1, "Cross Counter");
      }

      if (damageType === "attack" && hasEffect(state, targetSide, "quickdance")) {
        var counterAP = state[targetSide].general.ap;
        if (counterAP > 0) {
          applyCounterDamage(state, attackerSide, counterAP, "Quickdance counter-attack");
        }
      }

      var mirror = getEffect(state, targetSide, "mirror_of_revenge");
      if (mirror && mirror.turnsRemaining > 0) {
        applyCounterDamage(state, attackerSide, amount, "Mirror of Revenge reflects");
      }

      var scheme = getEffect(state, targetSide, "ingenious_scheme");
      if (scheme && scheme.turnsRemaining > 0) {
        applyCounterDamage(state, attackerSide, amount, "Ingenious Scheme reflects");
      }
    }

    return amount;
  }

  function applyCounterDamage(state, targetSide, amount, label) {
    var reflected = processIncomingDamage(state, targetSide, amount, "ability", true);
    if (reflected > 0) {
      state[targetSide].general.hp -= reflected;
      log(state, "damage", label + ": " + reflected + " damage to " + targetSide, {
        target: targetSide, damage: reflected, type: "ability"
      });
    }
  }

  function applyAbilityDmg(state, targetSide, rawAmount, label) {
    var finalDmg = processIncomingDamage(state, targetSide, rawAmount, "ability", false);
    if (finalDmg > 0) {
      state[targetSide].general.hp -= finalDmg;
      log(state, "damage", label + ": " + finalDmg + " damage to " + targetSide, {
        target: targetSide, damage: finalDmg, type: "ability"
      });
    }
    return finalDmg;
  }

  function healHP(state, side, amount, label) {
    if (amount <= 0) return;
    state[side].general.hp += amount;
    log(state, "heal", label + ": +" + amount + " HP to " + side, {
      target: side, amount: amount
    });
  }

  // ─── Ability Metadata ───────────────────────────────────────────────

  var ABILITIES = {
    vitality_medicine:       { name: "Vitality Medicine" },
    verboten_libation:       { name: "Verboten Libation" },
    fire_fang:               { name: "Fire Fang" },
    flame_fang:              { name: "Flame Fang" },
    bone_crunching:          { name: "Bone Crunching" },
    quick_lightning:         { name: "Quick Lightning" },
    divine_punishment:       { name: "Divine Punishment" },
    demonic_spear:           { name: "Demonic Spear" },
    golden_spear:            { name: "Golden Spear" },
    hammer_of_undoing:       { name: "Hammer of Undoing" },
    energy_drain:            { name: "Energy Drain" },
    energy_drain_3:          { name: "Energy Drain III" },
    border_of_zero:          { name: "Border of Zero" },
    change_ring:             { name: "Change Ring" },
    grief_of_comrade:        { name: "Grief of Comrade" },
    all_at_once:             { name: "All at Once" },
    charge_ahead:            { name: "Charge Ahead" },
    defensive_stance:        { name: "Defensive Stance" },
    estranged_self:          { name: "Estranged Self" },
    meeting_of_souls:        { name: "Meeting of Souls" },
    will_of_similars:        { name: "Will of Similars" },
    different_mix:           { name: "Different Mix" },
    fused_consciousness:     { name: "Fused Consciousness" },
    reckless_rewards:        { name: "Reckless Rewards" },
    momentary_glory:         { name: "Momentary Glory" },
    price_of_insight:        { name: "Price of Insight" },
    telepathy:               { name: "Telepathy" },
    teamwork:                { name: "Teamwork" },
    rendezvous:              { name: "Rendezvous" },
    whirlwind_assault:       { name: "Whirlwind Assault" },
    shield_protection:       { name: "Shield Protection" },
    snipe_thunder:           { name: "Snipe Thunder" },
    shooting_squad:          { name: "Shooting Squad" },
    kaedes_guard:            { name: "Kaede's Guard" },
    gabis_call:              { name: "Gabi's Call" },
    pattern_of_demons:       { name: "Pattern of Demons" },
    warning_harmony:         { name: "Warning Harmony" },
    vengeful_arrow:          { name: "Vengeful Arrow" },
    sinister_poison_arrow:   { name: "Sinister Poison Arrow" },
    energy_genome:           { name: "Energy Genome" },
    immortal_genome:         { name: "Immortal Genome" },
    folsets_trial:           { name: "Folset's Trial" },
    merciless_light:         { name: "Merciless Light" },
    light_of_annihilation:   { name: "Light of Annihilation" },
    first_strike:            { name: "First Strike" },
    filling_hollow:          { name: "Filling Hollow" },
    aida_berserk:            { name: "Aida Berserk" },
    aida_corrosion:          { name: "Aida Corrosion" },
    first_to_action:         { name: "First to Action" },
    massacre_pulse:          { name: "Massacre Pulse" },
    long_awaited_return:     { name: "Long Awaited Return" },
    aurora_tears:            { name: "Aurora Tears" },
    anus_karma:              { name: "Anu's Karma" },
    harmonic_rhythm:         { name: "Harmonic Rhythm" },
    mobilize_troops:         { name: "Mobilize Troops" },
    gathering_strong:        { name: "Gathering Strong" },
    spirit_clothes:          { name: "Spirit Clothes" },
    veil_of_aura:            { name: "Veil of Aura" },
    emperors_pride:          { name: "Emperor's Pride" },
    demon_sword_maxwell:     { name: "Demon Sword Maxwell" },
    clenching_teeth:         { name: "Clenching Teeth" },
    super_clenching_teeth:   { name: "Super Clenching Teeth" },
    minds_eye:               { name: "Mind's Eye" },
    cross_counter:           { name: "Cross Counter" },
    mirror_of_revenge:       { name: "Mirror of Revenge" },
    ingenious_scheme:        { name: "Ingenious Scheme" },
    time_torrent:            { name: "Time Torrent" },
    avatar_berserk:          { name: "Avatar Berserk" },
    detail_oriented:         { name: "Detail Oriented" },
    promised_discretion:     { name: "Promised Discretion" },
    trial_by_fire:           { name: "Trial by Fire" },
    quickdance:              { name: "Quickdance" },
    avatars_descent:         { name: "Avatar's Descent" },
    twilights_call:          { name: "Twilight's Call" },
    double_trigger:          { name: "Double Trigger" },
    blades_crossing:         { name: "Blades Crossing" }
  };

  var STRIP_KEYS = {
    whirlwind_assault: true, shield_protection: true, snipe_thunder: true,
    shooting_squad: true, kaedes_guard: true, gabis_call: true,
    pattern_of_demons: true, warning_harmony: true
  };

  // ─── Ability Activation (one-time / setup) ──────────────────────────

  function makeEffectBase(key, sourceUnit) {
    return {
      key: key,
      sourceId: sourceUnit ? sourceUnit.id : null,
      sourceType: sourceUnit ? sourceUnit.type : "general",
      sourceTrinity: sourceUnit ? sourceUnit.trinity : null
    };
  }

  function activateAbility(state, side, abilityKey, sourceUnit) {
    if (!abilityKey || STRIP_KEYS[abilityKey]) return;
    var ab = ABILITIES[abilityKey];
    if (!ab) return;
    var gen = state[side].general;
    var enemySide = opp(side);
    var enemyGen = state[enemySide].general;
    var name = ab.name;

    switch (abilityKey) {

      // ── Healing ───────────────────────────────────────────────
      case "vitality_medicine":
        gen.hp += 5;
        log(state, "junction", name + ": +5 HP", { side: side });
        break;

      case "verboten_libation":
        gen.hp += 7;
        log(state, "junction", name + ": +7 HP", { side: side });
        break;

      // ── AP Boost ──────────────────────────────────────────────
      case "fire_fang":
        gen.ap += 1; clampAP(gen);
        log(state, "junction", name + ": +1 AP", { side: side });
        break;

      case "flame_fang":
        gen.ap += 2; clampAP(gen);
        log(state, "junction", name + ": +2 AP", { side: side });
        break;

      case "bone_crunching":
        gen.ap += 3; gen.hp -= 3; clampAP(gen);
        log(state, "junction", name + ": +3 AP, -3 HP", { side: side });
        break;

      // ── Direct Damage ─────────────────────────────────────────
      case "quick_lightning":
        applyAbilityDmg(state, enemySide, 3, name);
        break;

      case "divine_punishment":
        applyAbilityDmg(state, enemySide, 5, name);
        break;

      case "demonic_spear":
        applyAbilityDmg(state, enemySide, 7, name);
        break;

      case "golden_spear":
        applyAbilityDmg(state, enemySide, 4, name);
        break;

      case "hammer_of_undoing":
        applyAbilityDmg(state, "your", 5, name + " (self)");
        applyAbilityDmg(state, "enemy", 5, name + " (enemy)");
        break;

      case "double_trigger":
        var dtEff = makeEffectBase("double_attack", sourceUnit);
        dtEff.source = "double_trigger";
        addEffect(state, side, dtEff);
        log(state, "junction", name + ": attacks deal double damage", { side: side });
        break;

      case "blades_crossing":
        applyAbilityDmg(state, enemySide, 4, name);
        gen.ap += 1; clampAP(gen);
        log(state, "junction", name + ": 4 damage to enemy, +1 AP", { side: side });
        break;

      // ── Drain / Swap ──────────────────────────────────────────
      case "energy_drain":
        enemyGen.hp -= 2;
        gen.hp += 2;
        log(state, "junction", name + ": drain 2 HP from enemy", { side: side });
        break;

      case "energy_drain_3":
        enemyGen.hp -= 3;
        gen.hp += 3;
        log(state, "junction", name + ": drain 3 HP from enemy", { side: side });
        break;

      case "border_of_zero":
        gen.hp = 1;
        enemyGen.hp = 1;
        log(state, "junction", name + ": both generals' HP set to 1", { side: side });
        break;

      case "change_ring":
        var tmpAP = enemyGen.ap;
        enemyGen.ap = enemyGen.hp;
        enemyGen.hp = tmpAP;
        clampAP(enemyGen);
        log(state, "junction", name + ": swapped enemy AP/HP", { side: side });
        break;

      // ── Count-based ───────────────────────────────────────────
      case "grief_of_comrade":
        var count = state[enemySide].junctioned.length;
        var bonus = count * 2;
        gen.hp += bonus;
        log(state, "junction", name + ": +" + bonus + " HP (" + count + " enemy junctions)", { side: side });
        break;

      case "all_at_once":
        var count = state[side].junctioned.length;
        var bonus = count * 2;
        gen.ap += bonus; clampAP(gen);
        log(state, "junction", name + ": +" + bonus + " AP (" + count + " own junctions)", { side: side });
        break;

      // ── Turn Order ────────────────────────────────────────────
      case "charge_ahead":
        state._chargeAhead = state._chargeAhead || {};
        state._chargeAhead[side] = true;
        log(state, "junction", name + ": forces first attack", { side: side });
        break;

      case "defensive_stance":
        state._defensiveStance = state._defensiveStance || {};
        state._defensiveStance[side] = true;
        var eff = makeEffectBase("damage_reduction", sourceUnit);
        eff.value = 1;
        eff.source = "defensive_stance";
        addEffect(state, side, eff);
        log(state, "junction", name + ": forces second, -1 damage taken", { side: side });
        break;

      // ── Estranged Self ────────────────────────────────────────
      case "estranged_self":
        var removed = state[enemySide].activeEffects;
        var removedCount = 0;
        for (var i = removed.length - 1; i >= 0; i--) {
          if (removed[i].sourceType === "unit") { removed.splice(i, 1); removedCount++; }
        }
        for (var i = 0; i < state[enemySide].junctioned.length; i++) {
          state[enemySide].junctioned[i]._abilityRemoved = true;
        }
        var eff2 = makeEffectBase("extra_damage_taken", sourceUnit);
        eff2.value = 2;
        eff2.source = "estranged_self";
        addEffect(state, side, eff2);
        log(state, "junction", name + ": removed " + removedCount + " enemy effects, self takes +2 damage", { side: side });
        break;

      // ── Meeting of Souls ──────────────────────────────────────
      case "meeting_of_souls":
        var tmpJ = state.your.junctioned;
        state.your.junctioned = state.enemy.junctioned;
        state.enemy.junctioned = tmpJ;

        var yourUnitEffects = [];
        var enemyUnitEffects = [];
        var yArr = state.your.activeEffects;
        for (var i = yArr.length - 1; i >= 0; i--) {
          if (yArr[i].sourceType === "unit") yourUnitEffects.push(yArr.splice(i, 1)[0]);
        }
        var eArr = state.enemy.activeEffects;
        for (var i = eArr.length - 1; i >= 0; i--) {
          if (eArr[i].sourceType === "unit") enemyUnitEffects.push(eArr.splice(i, 1)[0]);
        }
        state.your.activeEffects = state.your.activeEffects.concat(enemyUnitEffects);
        state.enemy.activeEffects = state.enemy.activeEffects.concat(yourUnitEffects);
        log(state, "junction", name + ": all junctioned units swapped!", { side: side });
        break;

      // ── Trinity Conditional ───────────────────────────────────
      case "will_of_similars":
        if (sourceUnit && sourceUnit.trinity === gen.trinity) {
          gen.ap += 3; gen.hp += 3; clampAP(gen);
          log(state, "junction", name + ": Trinity match! +3 AP, +3 HP", { side: side });
        } else {
          gen.ap -= 3; gen.hp -= 3; clampAP(gen);
          log(state, "junction", name + ": Trinity mismatch! -3 AP, -3 HP", { side: side });
        }
        break;

      case "different_mix":
        if (sourceUnit && sourceUnit.trinity !== gen.trinity) {
          gen.ap += 2; gen.hp += 2; clampAP(gen);
          log(state, "junction", name + ": Trinity differs! +2 AP, +2 HP", { side: side });
        } else {
          gen.ap -= 2; gen.hp -= 2; clampAP(gen);
          log(state, "junction", name + ": Trinity same! -2 AP, -2 HP", { side: side });
        }
        break;

      // ── Fused Consciousness ───────────────────────────────────
      case "fused_consciousness":
        var avgAP = Math.floor((gen.ap + enemyGen.ap) / 2);
        var avgHP = Math.floor((gen.hp + enemyGen.hp) / 2);
        gen.ap = avgAP;
        gen.hp = avgHP;
        clampAP(gen);
        log(state, "junction", name + ": AP=" + avgAP + ", HP=" + avgHP + " (averaged)", { side: side });
        break;

      // ── Reckless Rewards ──────────────────────────────────────
      case "reckless_rewards":
        gen.ap += 2; clampAP(gen);
        var eff = makeEffectBase("extra_damage_taken", sourceUnit);
        eff.value = 1;
        eff.source = "reckless_rewards";
        addEffect(state, side, eff);
        log(state, "junction", name + ": +2 AP, but +1 extra damage when hit", { side: side });
        break;

      // ── Momentary Glory ───────────────────────────────────────
      case "momentary_glory":
        gen.ap += 3; clampAP(gen);
        enemyGen.ap -= 3; clampAP(enemyGen);
        var eff = makeEffectBase("momentary_glory", sourceUnit);
        eff.turnsDecayed = 0;
        addEffect(state, side, eff);
        log(state, "junction", name + ": +3 AP, enemy -3 AP (decays each turn)", { side: side });
        break;

      // ── Price of Insight ──────────────────────────────────────
      case "price_of_insight":
        var otherEffects = [];
        var myEffects = state[side].activeEffects;
        for (var i = 0; i < myEffects.length; i++) {
          if (myEffects[i].key !== "price_of_insight" && myEffects[i].sourceType === "unit") {
            otherEffects.push(myEffects[i]);
          }
        }
        if (otherEffects.length > 0 && state.rng) {
          var chosen = otherEffects[Math.floor(state.rng() * otherEffects.length)];
          var abilityToDup = chosen.originalAbilityKey || chosen.key;
          log(state, "junction", name + ": duplicates " + (ABILITIES[abilityToDup] ? ABILITIES[abilityToDup].name : chosen.key), { side: side });
          activateAbility(state, side, abilityToDup, sourceUnit);
        } else {
          log(state, "junction", name + ": no abilities to duplicate", { side: side });
        }
        break;

      // ── Delta Combo Conditional ───────────────────────────────
      case "telepathy":
        if (state.hasDeltaCombo && state.hasDeltaCombo[side]) {
          gen.ap += 5; gen.hp += 5; clampAP(gen);
          log(state, "junction", name + ": Delta Combo active! +5 AP, +5 HP", { side: side });
        } else {
          gen.ap -= 5; gen.hp -= 5; clampAP(gen);
          log(state, "junction", name + ": No Delta Combo! -5 AP, -5 HP", { side: side });
        }
        break;

      case "teamwork":
        if (state.hasDeltaCombo && state.hasDeltaCombo[side]) {
          gen.ap += 2; gen.hp += 2; clampAP(gen);
          log(state, "junction", name + ": Delta Combo active! +2 AP, +2 HP", { side: side });
        } else {
          gen.ap -= 2; gen.hp -= 2; clampAP(gen);
          log(state, "junction", name + ": No Delta Combo! -2 AP, -2 HP", { side: side });
        }
        break;

      // ── Rendezvous ────────────────────────────────────────────
      case "rendezvous":
        gen.hp += 10;
        var eff = makeEffectBase("rendezvous", sourceUnit);
        addEffect(state, side, eff);
        log(state, "junction", name + ": +10 HP now, -10 HP at turn 8", { side: side });
        break;

      // ── Recurring Damage / Heal Setup ─────────────────────────
      case "vengeful_arrow":
      case "sinister_poison_arrow":
      case "energy_genome":
      case "immortal_genome":
      case "folsets_trial":
      case "merciless_light":
      case "light_of_annihilation":
      case "first_strike":
      case "filling_hollow":
      case "aida_berserk":
      case "aida_corrosion":
      case "long_awaited_return":
        var eff = makeEffectBase(abilityKey, sourceUnit);
        eff.originalAbilityKey = abilityKey;
        addEffect(state, side, eff);
        log(state, "junction", name + " activated (recurring)", { side: side });
        break;

      case "first_to_action":
        applyAbilityDmg(state, enemySide, 5, name + " (initial)");
        var eff = makeEffectBase("first_to_action", sourceUnit);
        eff.originalAbilityKey = abilityKey;
        addEffect(state, side, eff);
        log(state, "junction", name + ": 5 damage + 1 self-damage/turn", { side: side });
        break;

      case "massacre_pulse":
        var eff = makeEffectBase("massacre_pulse", sourceUnit);
        eff.originalAbilityKey = abilityKey;
        addEffect(state, side, eff);
        log(state, "junction", name + " activated (+1 AP per attack)", { side: side });
        break;

      // ── Conditional / Turn-Based Setup ────────────────────────
      case "aurora_tears":
      case "anus_karma":
      case "harmonic_rhythm":
      case "mobilize_troops":
      case "gathering_strong":
        var eff = makeEffectBase(abilityKey, sourceUnit);
        eff.originalAbilityKey = abilityKey;
        addEffect(state, side, eff);
        log(state, "junction", name + " activated (conditional)", { side: side });
        break;

      // ── Defensive / Triggered Setup ───────────────────────────
      case "spirit_clothes":
        var eff = makeEffectBase("damage_reduction", sourceUnit);
        eff.value = 1; eff.source = "spirit_clothes"; eff.originalAbilityKey = abilityKey;
        addEffect(state, side, eff);
        log(state, "junction", name + ": -1 damage taken", { side: side });
        break;

      case "veil_of_aura":
        var eff = makeEffectBase("damage_reduction", sourceUnit);
        eff.value = 2; eff.source = "veil_of_aura"; eff.originalAbilityKey = abilityKey;
        addEffect(state, side, eff);
        log(state, "junction", name + ": -2 damage taken", { side: side });
        break;

      case "emperors_pride":
        var eff = makeEffectBase("emperors_pride", sourceUnit);
        eff.originalAbilityKey = abilityKey;
        addEffect(state, side, eff);
        log(state, "junction", name + ": -1 normal attack damage", { side: side });
        break;

      case "demon_sword_maxwell":
        var eff = makeEffectBase("demon_sword_maxwell", sourceUnit);
        eff.originalAbilityKey = abilityKey;
        addEffect(state, side, eff);
        log(state, "junction", name + ": negate all ability damage", { side: side });
        break;

      case "clenching_teeth":
        var eff = makeEffectBase("clenching_teeth", sourceUnit);
        eff.used = false; eff.surviveHP = 1; eff.originalAbilityKey = abilityKey;
        addEffect(state, side, eff);
        log(state, "junction", name + ": survive once at 1 HP", { side: side });
        break;

      case "super_clenching_teeth":
        var eff = makeEffectBase("super_clenching_teeth", sourceUnit);
        eff.used = false; eff.surviveHP = 5; eff.originalAbilityKey = abilityKey;
        addEffect(state, side, eff);
        log(state, "junction", name + ": survive once at 5 HP", { side: side });
        break;

      case "minds_eye":
        var eff = makeEffectBase("minds_eye", sourceUnit);
        eff.used = false; eff.originalAbilityKey = abilityKey;
        addEffect(state, side, eff);
        log(state, "junction", name + ": dodge one attack", { side: side });
        break;

      case "cross_counter":
        var eff = makeEffectBase("cross_counter", sourceUnit);
        eff.originalAbilityKey = abilityKey;
        addEffect(state, side, eff);
        log(state, "junction", name + ": reflect 1 damage on hit", { side: side });
        break;

      case "mirror_of_revenge":
        var eff = makeEffectBase("mirror_of_revenge", sourceUnit);
        eff.turnsRemaining = 3; eff.originalAbilityKey = abilityKey;
        addEffect(state, side, eff);
        log(state, "junction", name + ": reflect all damage for 3 turns", { side: side });
        break;

      case "ingenious_scheme":
        var eff = makeEffectBase("ingenious_scheme", sourceUnit);
        eff.turnsRemaining = 2; eff.originalAbilityKey = abilityKey;
        addEffect(state, side, eff);
        log(state, "junction", name + ": reflect all damage for 2 turns", { side: side });
        break;

      case "time_torrent":
        var eff = makeEffectBase("turn_skip", sourceUnit);
        eff.turnsRemaining = 1; eff.source = "time_torrent"; eff.originalAbilityKey = abilityKey;
        addEffect(state, enemySide, eff);
        log(state, "junction", name + ": skip enemy's next turn", { side: side });
        break;

      case "avatar_berserk":
        var skipEff = makeEffectBase("turn_skip", sourceUnit);
        skipEff.turnsRemaining = 3; skipEff.source = "avatar_berserk";
        addEffect(state, enemySide, skipEff);
        var dmgEff = makeEffectBase("extra_damage_taken", sourceUnit);
        dmgEff.value = 5; dmgEff.source = "avatar_berserk"; dmgEff.originalAbilityKey = abilityKey;
        addEffect(state, side, dmgEff);
        log(state, "junction", name + ": skip 3 enemy turns, but +5 damage taken", { side: side });
        break;

      case "detail_oriented":
        var eff = makeEffectBase("detail_oriented", sourceUnit);
        eff.originalAbilityKey = abilityKey;
        addEffect(state, side, eff);
        log(state, "junction", name + ": damage <=2 becomes 0 for both", { side: side });
        break;

      case "promised_discretion":
        var eff = makeEffectBase("promised_discretion", sourceUnit);
        eff.originalAbilityKey = abilityKey;
        addEffect(state, side, eff);
        log(state, "junction", name + ": cap damage at 3 for both", { side: side });
        break;

      case "trial_by_fire":
        var eff = makeEffectBase("trial_by_fire", sourceUnit);
        eff.turnsActive = 0; eff.boosted = false; eff.originalAbilityKey = abilityKey;
        addEffect(state, side, eff);
        log(state, "junction", name + ": can't attack 4 turns, then +5 AP +6 HP", { side: side });
        break;

      case "quickdance":
        gen.ap -= 3; clampAP(gen);
        var eff = makeEffectBase("quickdance", sourceUnit);
        eff.originalAbilityKey = abilityKey;
        addEffect(state, side, eff);
        log(state, "junction", name + ": -3 AP, counter-attack on enemy hits", { side: side });
        break;

      case "avatars_descent":
        gen.ap += 5; clampAP(gen);
        var eff = makeEffectBase("avatars_descent", sourceUnit);
        eff.turnsRemaining = 3; eff.apBoost = 5; eff.originalAbilityKey = abilityKey;
        addEffect(state, side, eff);
        log(state, "junction", name + ": +5 AP for 3 turns, negate ability damage", { side: side });
        break;

      case "twilights_call":
        var eff = makeEffectBase("twilights_call", sourceUnit);
        eff.originalAbilities = [];
        var juncts = state[side].junctioned;
        for (var i = 0; i < juncts.length; i++) {
          if (juncts[i] && juncts[i].junctionAbility && juncts[i].junctionAbility !== "twilights_call") {
            eff.originalAbilities.push({ key: juncts[i].junctionAbility, unit: juncts[i] });
          }
        }
        if (state[side].general.junctionAbility && state[side].general.junctionAbility !== "twilights_call") {
          eff.originalAbilities.push({ key: state[side].general.junctionAbility, unit: state[side].general });
        }
        eff.originalAbilityKey = abilityKey;
        addEffect(state, side, eff);
        log(state, "junction", name + ": re-activate abilities after turn 5", { side: side });
        break;
    }
  }

  // ─── Strip Ability Activation ───────────────────────────────────────

  function activateStripAbility(state, side, abilityKey, sourceUnit) {
    if (!abilityKey || !STRIP_KEYS[abilityKey]) return;
    var ab = ABILITIES[abilityKey];
    if (!ab) return;
    var enemySide = opp(side);
    var name = ab.name;

    switch (abilityKey) {
      case "whirlwind_assault":
        stripByTrinity(state, enemySide, "shield", 1, name);
        break;
      case "shield_protection":
        stripByTrinity(state, enemySide, "snipe", 1, name);
        break;
      case "snipe_thunder":
        stripByTrinity(state, enemySide, "assault", 1, name);
        break;
      case "shooting_squad":
        stripByTrinity(state, enemySide, "assault", -1, name);
        stripByTrinity(state, enemySide, "shield", -1, name);
        break;
      case "kaedes_guard":
        stripByTrinity(state, enemySide, "shield", -1, name);
        stripByTrinity(state, enemySide, "snipe", -1, name);
        break;
      case "gabis_call":
        stripByTrinity(state, enemySide, "snipe", -1, name);
        stripByTrinity(state, enemySide, "assault", -1, name);
        break;
      case "pattern_of_demons":
        stripHighestCost(state, enemySide, name);
        break;
      case "warning_harmony":
        stripIfTwoOrMore(state, enemySide, name);
        break;
    }
  }

  function stripByTrinity(state, targetSide, trinity, count, label) {
    var matches = getEffectsWithTrinity(state, targetSide, trinity);
    if (matches.length === 0) return;

    if (count === -1) {
      for (var i = matches.length - 1; i >= 0; i--) {
        state[targetSide].activeEffects.splice(matches[i].index, 1);
      }
      log(state, "effect", label + ": removed " + matches.length + " " + trinity + " junction(s) from " + targetSide, {});
    } else {
      var toRemove = Math.min(count, matches.length);
      for (var r = 0; r < toRemove; r++) {
        if (state.rng) {
          var idx = Math.floor(state.rng() * matches.length);
          var m = matches.splice(idx, 1)[0];
          removeAllEffectsBySource(state, targetSide, m.effect.sourceId);
          log(state, "effect", label + ": removed a " + trinity + " junction from " + targetSide, {});
        } else {
          removeAllEffectsBySource(state, targetSide, matches[0].effect.sourceId);
          matches.splice(0, 1);
          log(state, "effect", label + ": removed a " + trinity + " junction from " + targetSide, {});
        }
      }
    }
  }

  function stripHighestCost(state, targetSide, label) {
    var units = state[targetSide].junctioned;
    var highest = null;
    var highestCost = -1;
    for (var i = 0; i < units.length; i++) {
      if (units[i] && !units[i]._abilityRemoved && (units[i].cost || 0) > highestCost) {
        highestCost = units[i].cost || 0;
        highest = units[i];
      }
    }
    if (highest) {
      removeAllEffectsBySource(state, targetSide, highest.id);
      highest._abilityRemoved = true;
      log(state, "effect", label + ": removed junction from " + highest.name + " (cost " + highestCost + ")", {});
    }
  }

  function stripIfTwoOrMore(state, targetSide, label) {
    var unitEffects = [];
    var arr = state[targetSide].activeEffects;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].sourceType === "unit") unitEffects.push(i);
    }
    if (unitEffects.length >= 2) {
      var removeIdx;
      if (state.rng) {
        removeIdx = unitEffects[Math.floor(state.rng() * unitEffects.length)];
      } else {
        removeIdx = unitEffects[0];
      }
      var removed = arr.splice(removeIdx, 1)[0];
      log(state, "effect", label + ": removed a random junction from " + targetSide, {});
    }
  }

  // ─── Public API ─────────────────────────────────────────────────────

  window.JunctionEngine = {
    ABILITIES: ABILITIES,

    applyInitialEffects: function (state) {
      var sides = ["your", "enemy"];

      // Phase 1: Non-strip abilities — generals first
      for (var s = 0; s < sides.length; s++) {
        var side = sides[s];
        var gen = state[side].general;
        if (gen.junctionAbility && !STRIP_KEYS[gen.junctionAbility]) {
          activateAbility(state, side, gen.junctionAbility, gen);
        }
      }

      // Phase 1 continued: units slot-by-slot
      for (var slot = 0; slot < 3; slot++) {
        for (var s = 0; s < sides.length; s++) {
          var side = sides[s];
          var unit = state[side].junctioned[slot];
          if (unit && unit.junctionAbility && !unit._abilityRemoved) {
            activateAbility(state, side, unit.junctionAbility, unit);
          }
        }
      }

      // Phase 2: Strip abilities — generals first, then units
      for (var s = 0; s < sides.length; s++) {
        var side = sides[s];
        var gen = state[side].general;
        if (gen.junctionAbility && STRIP_KEYS[gen.junctionAbility]) {
          activateStripAbility(state, side, gen.junctionAbility, gen);
        }
      }
      for (var slot = 0; slot < 3; slot++) {
        for (var s = 0; s < sides.length; s++) {
          var side = sides[s];
          var unit = state[side].junctioned[slot];
          if (unit && unit.junctionAbility && !unit._abilityRemoved && STRIP_KEYS[unit.junctionAbility]) {
            activateStripAbility(state, side, unit.junctionAbility, unit);
          }
        }
      }

      // Phase 3: Resolve turn order overrides
      var ca = state._chargeAhead || {};
      var ds = state._defensiveStance || {};

      if (ca.your && ca.enemy) {
        log(state, "effect", "Both Charge Ahead cancel out", {});
      } else if (ca.your) {
        state.firstAttacker = "your";
      } else if (ca.enemy) {
        state.firstAttacker = "enemy";
      } else if (ds.your && ds.enemy) {
        log(state, "effect", "Both Defensive Stance cancel out", {});
      } else if (ds.your) {
        state.firstAttacker = "enemy";
      } else if (ds.enemy) {
        state.firstAttacker = "your";
      }

      delete state._chargeAhead;
      delete state._defensiveStance;
    },

    applyTurnStartEffects: function (state, side) {
      var gen = state[side].general;
      var enemySide = opp(side);
      var enemyGen = state[enemySide].general;
      var effects = state[side].activeEffects;
      var isFirst = (state.firstAttacker === side);

      for (var i = 0; i < effects.length; i++) {
        var eff = effects[i];
        switch (eff.key) {

          case "vengeful_arrow":
            applyAbilityDmg(state, enemySide, 1, "Vengeful Arrow");
            break;

          case "sinister_poison_arrow":
            applyAbilityDmg(state, enemySide, 2, "Sinister Poison Arrow");
            break;

          case "energy_genome":
            healHP(state, side, 1, "Energy Genome");
            break;

          case "immortal_genome":
            healHP(state, side, 2, "Immortal Genome");
            break;

          case "folsets_trial":
            gen.ap += 1; clampAP(gen);
            gen.hp -= 1;
            log(state, "effect", "Folset's Trial: +1 AP, -1 HP", { side: side });
            break;

          case "merciless_light":
            applyAbilityDmg(state, "your", 2, "Merciless Light");
            applyAbilityDmg(state, "enemy", 2, "Merciless Light");
            break;

          case "light_of_annihilation":
            applyAbilityDmg(state, "your", 3, "Light of Annihilation");
            applyAbilityDmg(state, "enemy", 3, "Light of Annihilation");
            break;

          case "first_strike":
            applyAbilityDmg(state, "your", 1, "First Strike");
            applyAbilityDmg(state, "enemy", 1, "First Strike");
            break;

          case "filling_hollow":
            stripRandomEffect(state, "your");
            stripRandomEffect(state, "enemy");
            break;

          case "aida_berserk":
            gen.ap += 2; clampAP(gen);
            gen.hp -= 2;
            log(state, "effect", "Aida Berserk: +2 AP, -2 HP", { side: side });
            break;

          case "aida_corrosion":
            gen.ap += 1; clampAP(gen);
            gen.hp -= 1;
            log(state, "effect", "Aida Corrosion: +1 AP, -1 HP", { side: side });
            break;

          case "first_to_action":
            gen.hp -= 1;
            log(state, "effect", "First to Action: -1 HP (self-damage)", { side: side });
            break;

          case "long_awaited_return":
            gen.ap += 1; clampAP(gen);
            gen.hp += 2;
            log(state, "effect", "Long Awaited Return: +1 AP, +2 HP", { side: side });
            break;

          case "harmonic_rhythm":
            if (isFirst) {
              gen.ap += 2; clampAP(gen);
              log(state, "effect", "Harmonic Rhythm (first): +2 AP", { side: side });
            } else {
              gen.hp += 4;
              log(state, "effect", "Harmonic Rhythm (second): +4 HP", { side: side });
            }
            break;

          case "mobilize_troops":
            if (state.turn > 5) {
              healHP(state, side, 1, "Mobilize Troops");
            }
            break;

          case "gathering_strong":
            if (state.turn <= 5) {
              applyAbilityDmg(state, enemySide, 1, "Gathering Strong");
            }
            break;

          case "momentary_glory":
            if (eff.turnsDecayed < 3) {
              enemyGen.ap += 1; clampAP(enemyGen);
              gen.ap -= 1; clampAP(gen);
              eff.turnsDecayed++;
              log(state, "effect", "Momentary Glory fading: self -1 AP, enemy +1 AP", { side: side });
            }
            break;

          case "rendezvous":
            if (state.turn === 8) {
              gen.hp -= 10;
              log(state, "effect", "Rendezvous: -10 HP (turn 8 penalty)", { side: side });
            }
            break;

          case "trial_by_fire":
            eff.turnsActive++;
            if (eff.turnsActive === 5 && !eff.boosted) {
              gen.ap += 5; gen.hp += 6; clampAP(gen);
              eff.boosted = true;
              log(state, "effect", "Trial by Fire complete: +5 AP, +6 HP!", { side: side });
            }
            break;

          case "twilights_call":
            if (state.turn === 6) {
              log(state, "effect", "Twilight's Call: re-activating all abilities!", { side: side });
              var abs = eff.originalAbilities;
              for (var a = 0; a < abs.length; a++) {
                activateAbility(state, side, abs[a].key, abs[a].unit);
              }
            }
            break;
        }
      }
    },

    applyTurnEndEffects: function (state, side) {
      var gen = state[side].general;
      var isFirst = (state.firstAttacker === side);
      var effects = state[side].activeEffects;

      for (var i = 0; i < effects.length; i++) {
        var eff = effects[i];
        switch (eff.key) {
          case "aurora_tears":
            if (isFirst) {
              gen.ap += 2; clampAP(gen);
              log(state, "effect", "Aurora Tears: +2 AP (end of turn, going first)", { side: side });
            }
            break;

          case "anus_karma":
            if (!isFirst) {
              healHP(state, side, 3, "Anu's Karma (going second)");
            }
            break;
        }
      }

      // Decrement turn-based counters
      for (var i = effects.length - 1; i >= 0; i--) {
        var eff = effects[i];

        if (eff.key === "mirror_of_revenge" || eff.key === "ingenious_scheme") {
          eff.turnsRemaining--;
          if (eff.turnsRemaining <= 0) {
            effects.splice(i, 1);
            log(state, "effect", (ABILITIES[eff.key] ? ABILITIES[eff.key].name : eff.key) + " expired", { side: side });
          }
        }

        if (eff.key === "avatars_descent") {
          eff.turnsRemaining--;
          if (eff.turnsRemaining <= 0) {
            gen.ap -= eff.apBoost;
            clampAP(gen);
            effects.splice(i, 1);
            log(state, "effect", "Avatar's Descent expired: -" + eff.apBoost + " AP", { side: side });
          }
        }
      }
    },

    onDealDamage: function (state, attackerSide, baseDamage) {
      var damage = baseDamage;
      var effects = state[attackerSide].activeEffects;

      for (var i = 0; i < effects.length; i++) {
        if (effects[i].key === "massacre_pulse") {
          state[attackerSide].general.ap += 1;
          log(state, "effect", "Massacre Pulse: AP +1 (cumulative)", { side: attackerSide });
        }
        if (effects[i].key === "double_attack") {
          damage *= 2;
          log(state, "effect", "Double Trigger: damage doubled to " + damage, { side: attackerSide });
        }
      }

      return damage;
    },

    onTakeDamage: function (state, defenderSide, damage, damageType) {
      return processIncomingDamage(state, defenderSide, damage, damageType || "attack", false);
    },

    checkSurvival: function (state, side) {
      var gen = state[side].general;
      if (gen.hp > 0) return;

      var effects = state[side].activeEffects;
      for (var i = 0; i < effects.length; i++) {
        var eff = effects[i];
        if ((eff.key === "super_clenching_teeth" || eff.key === "clenching_teeth") && !eff.used) {
          eff.used = true;
          gen.hp = eff.surviveHP;
          var name = ABILITIES[eff.key] ? ABILITIES[eff.key].name : eff.key;
          log(state, "effect", name + ": survived at " + eff.surviveHP + " HP!", { side: side });
          return;
        }
      }
    },

    // Utility: check if a side's turn should be skipped
    consumeTurnSkip: function (state, side) {
      var effects = state[side].activeEffects;
      for (var i = 0; i < effects.length; i++) {
        if (effects[i].key === "turn_skip" && effects[i].turnsRemaining > 0) {
          effects[i].turnsRemaining--;
          var src = effects[i].source || "unknown";
          if (effects[i].turnsRemaining <= 0) effects.splice(i, 1);
          log(state, "effect", "Turn skipped! (" + src + ")", { side: side });
          return true;
        }
      }
      return false;
    },

    // Utility: check if a side can attack (Trial by Fire blocks attacks)
    canAttack: function (state, side) {
      var trial = getEffect(state, side, "trial_by_fire");
      if (trial && !trial.boosted) return false;
      return true;
    }
  };

  // ─── Internal Helper for Filling Hollow ─────────────────────────────

  function stripRandomEffect(state, side) {
    var arr = state[side].activeEffects;
    if (arr.length === 0) return;
    var idx;
    if (state.rng) {
      idx = Math.floor(state.rng() * arr.length);
    } else {
      idx = 0;
    }
    var removed = arr.splice(idx, 1)[0];
    var name = removed.key;
    if (ABILITIES[name]) name = ABILITIES[name].name;
    log(state, "effect", "Filling Hollow removes " + name + " from " + side, {});
  }

})();
