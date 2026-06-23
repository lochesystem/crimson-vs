/* ========================================================
   CRIMSON VS — Progression & Booster Packs
   ======================================================== */
window.Progression = {
  dropPools: {
    tier1: { minRank: 40, rarities: { common: 70, rare: 25, "super-rare": 4, "ultra-rare": 1 } },
    tier2: { minRank: 25, rarities: { common: 50, rare: 35, "super-rare": 12, "ultra-rare": 3 } },
    tier3: { minRank: 10, rarities: { common: 35, rare: 40, "super-rare": 20, "ultra-rare": 5 } },
    tier4: { minRank: 2, rarities: { common: 20, rare: 35, "super-rare": 30, "ultra-rare": 15 } },
    champion: { minRank: 0, rarities: { rare: 30, "super-rare": 40, "ultra-rare": 30 } }
  },

  championExclusiveIds: [85, 106, 111, 138, 103],

  _getTier: function (rank) {
    if (rank <= 1) return "champion";
    if (rank <= 9) return "tier4";
    if (rank <= 24) return "tier3";
    if (rank <= 39) return "tier2";
    return "tier1";
  },

  _pickRarity: function (weights) {
    var total = 0;
    var keys = Object.keys(weights);
    keys.forEach(function (k) { total += weights[k]; });
    var roll = Math.random() * total;
    var acc = 0;
    for (var i = 0; i < keys.length; i++) {
      acc += weights[keys[i]];
      if (roll < acc) return keys[i];
    }
    return keys[keys.length - 1];
  },

  _cardsByRarity: function (rarity, unownedOnly) {
    if (!window.CardsData) return [];
    var all = CardsData.generals.concat(CardsData.units);
    return all.filter(function (c) {
      if (c.rarity !== rarity) return false;
      if (unownedOnly && Inventory.owns(c.id)) return false;
      return true;
    });
  },

  rollBoosterCard: function (rank, forceChampion) {
    var tier = forceChampion ? "champion" : this._getTier(rank);
    var pool = this.dropPools[tier];
    var rarity = this._pickRarity(pool.rarities);
    var candidates = this._cardsByRarity(rarity, true);

    if (candidates.length === 0) {
      candidates = this._cardsByRarity(rarity, false);
    }
    if (candidates.length === 0) {
      var all = CardsData.generals.concat(CardsData.units).filter(function (c) {
        return !Inventory.owns(c.id);
      });
      if (all.length === 0) return null;
      return all[Math.floor(Math.random() * all.length)];
    }

    return candidates[Math.floor(Math.random() * candidates.length)];
  },

  grantRewards: function (won, rank, opponentName) {
    var result = { won: won, card: null, duplicate: false, championUnlock: false };

    if (!won) return result;

    var forceChampion = rank <= 1 && opponentName && opponentName.indexOf("Gaspard") !== -1;
    var card = this.rollBoosterCard(rank, forceChampion);

    if (forceChampion) {
      var d = Save.get();
      if (!d.championBeaten) {
        d.championBeaten = true;
        result.championUnlock = true;
        Save.save();
      }
      if (!card && this.championExclusiveIds.length > 0) {
        var unownedChamp = this.championExclusiveIds.filter(function (id) {
          return !Inventory.owns(id);
        });
        if (unownedChamp.length > 0) {
          card = CardsData.getCard(unownedChamp[Math.floor(Math.random() * unownedChamp.length)]);
        }
      }
    }

    if (card) {
      var isNew = Inventory.unlock(card.id);
      result.card = card;
      result.duplicate = !isNew;
      var saveData = Save.get();
      saveData.lastDrop = { id: card.id, name: card.name, isNew: isNew, at: Date.now() };
      Save.save();
    }

    return result;
  }
};
