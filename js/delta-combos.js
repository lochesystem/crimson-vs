window.DeltaCombos = {
  combos: [
    {
      id: "arena_combo_i",
      name: "Arena Combo I",
      effect: "unit_cost_up",
      value: 3,
      description: "Raises your unit cost by 3",
      characters: ["Haseo", "Atoli", "Silabus"],
      minMatch: 3,
      overrides: ["canard_combo"],
      overriddenBy: []
    },
    {
      id: "arena_combo_ii",
      name: "Arena Combo II",
      effect: "ap_up",
      value: 2,
      description: "Add 2 AP to your general",
      characters: ["Alkaid", "Atoli", "Haseo"],
      minMatch: 3,
      overrides: [],
      overriddenBy: []
    },
    {
      id: "arena_combo_iii",
      name: "Arena Combo III",
      effect: "ap_up",
      value: 2,
      description: "Add 2 AP to your general",
      characters: ["Endrance", "Haseo", "Kuhn"],
      minMatch: 3,
      overrides: ["eight_phase_combo"],
      overriddenBy: []
    },
    {
      id: "triangle_combo_i",
      name: "Triangle Combo I",
      effect: "unit_cost_up",
      value: 2,
      description: "Raises your unit cost by 2",
      characters: ["Atoli", "Haseo", "Shino"],
      minMatch: 3,
      overrides: [],
      overriddenBy: []
    },
    {
      id: "triangle_combo_ii",
      name: "Triangle Combo II",
      effect: "unit_cost_down",
      value: 2,
      description: "Lower enemy unit cost by 2",
      characters: ["BlackRose", "Kite", "Terajima Ryoko"],
      minMatch: 3,
      overrides: ["hackers_combo"],
      overriddenBy: []
    },
    {
      id: "triangle_combo_iii",
      name: "Triangle Combo III",
      effect: "ap_up",
      value: 2,
      description: "Add 2 AP to your general",
      characters: ["Atoli", "Haseo", "Pi"],
      minMatch: 3,
      overrides: ["eight_phase_combo"],
      overriddenBy: []
    },
    {
      id: "triangle_combo_iv",
      name: "Triangle Combo IV",
      effect: "ap_down",
      value: 2,
      description: "Subtract 2 AP from enemy general",
      characters: ["Endrance", "Haseo", "Sakubo"],
      minMatch: 3,
      overrides: ["eight_phase_combo"],
      overriddenBy: []
    },
    {
      id: "gu_combo",
      name: "G.U. Combo",
      effect: "hp_up",
      value: 5,
      description: "Add 5 HP to your general",
      characters: ["Haseo", "Kuhn", "Pi", "Yata"],
      minMatch: 3,
      overrides: ["eight_phase_combo"],
      overriddenBy: []
    },
    {
      id: "aida_combo",
      name: "AIDA Combo",
      effect: "hp_down",
      value: 5,
      description: "Subtract 5 HP from enemy general",
      characters: ["AIDA Sakaki", "AIDA Sirius", "Ovan"],
      cardIds: [112, 117, 141],
      useCardIds: true,
      minMatch: 3,
      overrides: [],
      overriddenBy: []
    },
    {
      id: "canard_combo",
      name: "Canard Combo",
      effect: "unit_cost_down",
      value: 1,
      description: "Lower enemy unit cost by 1",
      characters: ["Atoli", "Death Grunty", "Gaspard", "Haseo", "Kuhn", "Silabus"],
      minMatch: 3,
      overrides: [],
      overriddenBy: ["arena_combo_i"]
    },
    {
      id: "twilight_brigade_combo",
      name: "Twilight Brigade Combo",
      effect: "unit_cost_up",
      value: 1,
      description: "Raises your unit cost by 1",
      characters: ["Haseo", "Ovan", "Shino", "Tabby"],
      minMatch: 3,
      overrides: ["roots_combo"],
      overriddenBy: []
    },
    {
      id: "hackers_combo",
      name: ".hackers Combo",
      effect: "ap_down",
      value: 1,
      description: "Subtract 1 AP from enemy general",
      characters: ["Balmung", "BlackRose", "Kite", "Mistral", "Orca", "Natsume", "Piros", "Terajima Ryoko"],
      minMatch: 3,
      overrides: [],
      overriddenBy: ["brute_force_combo", "triangle_combo_ii", "xxxx_combo"]
    },
    {
      id: "roots_combo",
      name: "Roots Combo",
      effect: "ap_up",
      value: 1,
      description: "Add 1 AP to your general",
      characters: ["B-Set", "Haseo", "Ovan", "Phyllo", "Shino", "Tabby", "TaN"],
      minMatch: 3,
      overrides: [],
      overriddenBy: ["beast_combo", "twilight_brigade_combo"]
    },
    {
      id: "sign_combo",
      name: "SIGN Combo",
      effect: "ap_up",
      value: 1,
      description: "Add 1 AP to your general",
      characters: ["BT", "Mimiru", "Silver Knight", "Sora", "Tsukasa"],
      minMatch: 3,
      overrides: [],
      overriddenBy: []
    },
    {
      id: "eight_phase_combo",
      name: "Eight Phase Combo",
      effect: "ap_up",
      value: 1,
      description: "Add 1 AP to your general",
      characters: ["Atoli", "Endrance", "Haseo", "Kuhn", "Ovan", "Pi", "Sakubo", "Yata"],
      minMatch: 3,
      overrides: [],
      overriddenBy: ["arena_combo_iii", "gu_combo", "glasses_combo", "triangle_combo_iii", "triangle_combo_iv"]
    },
    {
      id: "heroine_combo_a",
      name: "Heroine Combo A",
      effect: "unit_cost_up",
      value: 1,
      description: "Raises your unit cost by 1",
      characters: ["Alkaid", "Atoli", "BlackRose", "Tabby", "Mimiru", "Shino", "Terajima Ryoko", "Mai Minase"],
      minMatch: 3,
      overrides: [],
      overriddenBy: []
    },
    {
      id: "heroine_combo_b",
      name: "Heroine Combo B",
      effect: "unit_cost_down",
      value: 1,
      description: "Lower enemy unit cost by 1",
      characters: ["BT", "Bordeaux", "B-Set", "Sakubo", "Kaede", "Midori", "Natsume", "Mistral"],
      minMatch: 3,
      overrides: [],
      overriddenBy: []
    },
    {
      id: "main_character_combo",
      name: "Main Character Combo",
      effect: "unit_cost_up",
      value: 1,
      description: "Raises your unit cost by 1",
      characters: ["Haseo", "Kite", "Mai Minase", "Shugo", "Tsukasa"],
      minMatch: 3,
      overrides: [],
      overriddenBy: []
    },
    {
      id: "intelligent_combo",
      name: "Intelligent Combo",
      effect: "cancel_combo",
      value: 0,
      description: "Cancel enemy's delta combo",
      characters: ["BT", "Ovan", "Phyllo", "Pi", "TaN", "Sakaki", "Yata"],
      minMatch: 3,
      cancelsEnemyCombo: true,
      overrides: [],
      overriddenBy: ["glasses_combo"]
    },
    {
      id: "glasses_combo",
      name: "Glasses Combo",
      effect: "cancel_combo",
      value: 0,
      description: "Cancel enemy's delta combo",
      characters: ["Ovan", "Pi", "Yata"],
      minMatch: 3,
      cancelsEnemyCombo: true,
      overrides: ["intelligent_combo", "eight_phase_combo"],
      overriddenBy: []
    },
    {
      id: "xxxx_combo",
      name: "XXXX Combo",
      effect: "cancel_combo",
      value: 0,
      description: "Cancel enemy's delta combo",
      characters: ["Balmung", "Cubia", "Kite", "Orca", "Shugo"],
      excludeCharacters: ["Azure Kite"],
      minMatch: 3,
      cancelsEnemyCombo: true,
      overrides: ["hackers_combo"],
      overriddenBy: []
    },
    {
      id: "seven_counsel_combo",
      name: "Seven Counsel Combo",
      effect: "ap_down",
      value: 1,
      description: "Subtract 1 AP from enemy general",
      characters: ["Kaede", "Hiiragi", "Matsu", "Nala", "Sakaki", "Zelkova"],
      minMatch: 3,
      overrides: [],
      overriddenBy: ["sakaki_faction", "zelkova_combo"]
    },
    {
      id: "zelkova_combo",
      name: "Zelkova Combo",
      effect: "hp_up",
      value: 5,
      description: "Add 5 HP to your general",
      characters: ["Zelkova", "Nala", "Kaede"],
      minMatch: 3,
      overrides: ["seven_counsel_combo"],
      overriddenBy: []
    },
    {
      id: "brute_force_combo",
      name: "Brute Force Combo",
      effect: "unit_cost_up",
      value: 1,
      description: "Raises your unit cost by 1",
      characters: ["BlackRose", "Piros the 3rd", "Matsu"],
      minMatch: 3,
      overrides: ["hackers_combo"],
      overriddenBy: []
    },
    {
      id: "icolo_combo",
      name: "Icolo Combo",
      effect: "unit_cost_down",
      value: 1,
      description: "Lower enemy unit cost by 1",
      characters: ["Taihaku", "Endrance", "Sirius", "Haseo", "Alkaid"],
      minMatch: 3,
      overrides: [],
      overriddenBy: []
    },
    {
      id: "beast_combo",
      name: "Beast Combo",
      effect: "hp_up",
      value: 3,
      description: "Add 3 HP to your general",
      characters: ["Gaspard", "Tabby", "Phyllo"],
      minMatch: 3,
      overrides: ["roots_combo"],
      overriddenBy: []
    },
    {
      id: "sakaki_faction",
      name: "Sakaki Faction",
      effect: "unit_cost_down",
      value: 1,
      description: "Lower enemy unit cost by 1",
      characters: ["Matsu", "Sakaki", "Hiiragi", "Atoli"],
      minMatch: 3,
      overrides: ["seven_counsel_combo"],
      overriddenBy: []
    },
    {
      id: "eternal_number_two",
      name: "Eternal Number Two",
      effect: "unit_cost_down",
      value: 2,
      description: "Lower enemy unit cost by 2",
      characters: ["Sakaki", "Silabus", "Silver Knight"],
      minMatch: 3,
      overrides: [],
      overriddenBy: []
    },
    {
      id: "three_sages",
      name: "Three Sages",
      effect: "ap_down",
      value: 2,
      description: "Subtract 2 AP from enemy general",
      characters: ["Zelkova", "Phyllo", "Yata"],
      minMatch: 3,
      overrides: [],
      overriddenBy: []
    },
    {
      id: "guild_master_combo",
      name: "Guild Master Combo",
      effect: "unit_cost_up",
      value: 1,
      description: "Raises your unit cost by 1",
      characters: ["Zelkova", "Gabi", "Taihaku", "Sirius", "Sakaki", "Gaspard", "Silabus"],
      minMatch: 3,
      overrides: [],
      overriddenBy: []
    },
    {
      id: "triple_role_combo",
      name: "Triple Role Combo",
      effect: "unit_cost_down",
      value: 3,
      description: "Lower enemy unit cost by 3",
      characters: ["Yata", "Nala", "TaN"],
      minMatch: 3,
      overrides: [],
      overriddenBy: []
    },
    {
      id: "avatar_combo",
      name: "Avatar Combo",
      effect: "hp_down",
      value: 3,
      description: "Subtract 3 HP from enemy general",
      characters: ["Haseo", "Atoli", "Kuhn", "Pi", "Endrance", "Sakubo", "Yata", "Ovan"],
      minMatch: 3,
      overrides: [],
      overriddenBy: []
    },
    {
      id: "love_triangle",
      name: "Love Triangle",
      effect: "ap_up",
      value: 2,
      description: "Add 2 AP to your general",
      characters: ["Alkaid", "Atoli", "Shino"],
      minMatch: 3,
      overrides: [],
      overriddenBy: []
    }
  ],

  findCombo: function(unitsArray) {
    if (!unitsArray || unitsArray.length !== 3 || !unitsArray[0] || !unitsArray[1] || !unitsArray[2]) return null;
    return this.detect(unitsArray[0], unitsArray[1], unitsArray[2]);
  },

  detect: function(unit1, unit2, unit3) {
    var units = [unit1, unit2, unit3];
    var characters = [];
    var cardIds = [];

    for (var i = 0; i < units.length; i++) {
      characters.push(units[i].character);
      cardIds.push(units[i].id);
    }

    if (characters[0] === characters[1] || characters[0] === characters[2] || characters[1] === characters[2]) {
      return null;
    }

    var matched = [];

    for (var c = 0; c < this.combos.length; c++) {
      var combo = this.combos[c];
      var isMatch = false;

      if (combo.useCardIds && combo.cardIds) {
        var idMatchCount = 0;
        var usedIds = [];
        for (var u = 0; u < cardIds.length; u++) {
          if (combo.cardIds.indexOf(cardIds[u]) !== -1 && usedIds.indexOf(cardIds[u]) === -1) {
            idMatchCount++;
            usedIds.push(cardIds[u]);
          }
        }
        isMatch = idMatchCount >= combo.minMatch;
      } else {
        var charMatchCount = 0;
        var usedChars = [];
        for (var u = 0; u < characters.length; u++) {
          if (combo.characters.indexOf(characters[u]) !== -1 && usedChars.indexOf(characters[u]) === -1) {
            if (combo.excludeCharacters && combo.excludeCharacters.indexOf(characters[u]) !== -1) {
              continue;
            }
            charMatchCount++;
            usedChars.push(characters[u]);
          }
        }
        isMatch = charMatchCount >= combo.minMatch;
      }

      if (isMatch) {
        matched.push(combo);
      }
    }

    if (matched.length === 0) return null;

    var active = [];
    for (var m = 0; m < matched.length; m++) {
      var combo = matched[m];
      var isOverridden = false;

      for (var n = 0; n < matched.length; n++) {
        if (m === n) continue;
        var other = matched[n];
        if (other.overrides && other.overrides.indexOf(combo.id) !== -1) {
          isOverridden = true;
          break;
        }
      }

      if (!isOverridden) {
        active.push(combo);
      }
    }

    if (active.length === 0) return matched[0];

    var best = active[0];
    for (var a = 1; a < active.length; a++) {
      if (active[a].characters.length < best.characters.length) {
        best = active[a];
      } else if (active[a].characters.length === best.characters.length) {
        if (active[a].value > best.value) {
          best = active[a];
        }
      }
    }

    return best;
  },

  detectAll: function(unit1, unit2, unit3) {
    var units = [unit1, unit2, unit3];
    var characters = [];
    var cardIds = [];

    for (var i = 0; i < units.length; i++) {
      characters.push(units[i].character);
      cardIds.push(units[i].id);
    }

    if (characters[0] === characters[1] || characters[0] === characters[2] || characters[1] === characters[2]) {
      return [];
    }

    var matched = [];

    for (var c = 0; c < this.combos.length; c++) {
      var combo = this.combos[c];
      var isMatch = false;

      if (combo.useCardIds && combo.cardIds) {
        var idMatchCount = 0;
        var usedIds = [];
        for (var u = 0; u < cardIds.length; u++) {
          if (combo.cardIds.indexOf(cardIds[u]) !== -1 && usedIds.indexOf(cardIds[u]) === -1) {
            idMatchCount++;
            usedIds.push(cardIds[u]);
          }
        }
        isMatch = idMatchCount >= combo.minMatch;
      } else {
        var charMatchCount = 0;
        var usedChars = [];
        for (var u = 0; u < characters.length; u++) {
          if (combo.characters.indexOf(characters[u]) !== -1 && usedChars.indexOf(characters[u]) === -1) {
            if (combo.excludeCharacters && combo.excludeCharacters.indexOf(characters[u]) !== -1) {
              continue;
            }
            charMatchCount++;
            usedChars.push(characters[u]);
          }
        }
        isMatch = charMatchCount >= combo.minMatch;
      }

      if (isMatch) {
        matched.push(combo);
      }
    }

    var active = [];
    for (var m = 0; m < matched.length; m++) {
      var combo = matched[m];
      var isOverridden = false;

      for (var n = 0; n < matched.length; n++) {
        if (m === n) continue;
        var other = matched[n];
        if (other.overrides && other.overrides.indexOf(combo.id) !== -1) {
          isOverridden = true;
          break;
        }
      }

      if (!isOverridden) {
        active.push(combo);
      }
    }

    return active;
  }
};
