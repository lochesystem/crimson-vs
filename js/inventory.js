/* ========================================================
   CRIMSON VS — Player Inventory
   ======================================================== */
window.Inventory = {
  starterCardIds: [
    8, 16, 25,
    26, 27, 28, 50, 66, 67, 68, 70
  ],

  defaultDeck: {
    generalId: 8,
    unitIds: [67, 50, 28]
  },

  init: function () {
    if (!window.Save) return;
    var d = Save.get();
    if (!d.ownedCardIds || d.ownedCardIds.length === 0) {
      this.grantStarterPack();
    }
  },

  grantStarterPack: function () {
    var self = this;
    this.starterCardIds.forEach(function (id) {
      Save.addOwned(id);
    });
    var deck = Save.get().deck;
    if (!deck.generalId) {
      Save.setDeck(this.defaultDeck.generalId, this.defaultDeck.unitIds);
    }
  },

  owns: function (cardId) {
    return Save.owns(cardId);
  },

  unlock: function (cardId) {
    var isNew = Save.addOwned(cardId);
    if (isNew) Save.markUnseen(cardId);
    return isNew;
  },

  getOwnedCards: function () {
    if (!window.CardsData) return [];
    var ids = Save.getOwnedIds();
    return ids.map(function (id) { return CardsData.getCard(id); }).filter(Boolean);
  },

  getOwnedCount: function () {
    return Save.getOwnedIds().length;
  },

  validateDeckOwned: function (deck) {
    var errors = [];
    if (!deck || !deck.general) {
      errors.push("No general selected");
      return { valid: false, errors: errors };
    }
    if (!this.owns(deck.general.id)) {
      errors.push("General not owned: " + deck.general.name);
    }
    if (!deck.units || deck.units.length < 3) {
      errors.push("Need 3 units");
      return { valid: false, errors: errors };
    }
    for (var i = 0; i < 3; i++) {
      if (!deck.units[i]) {
        errors.push("Unit slot " + (i + 1) + " is empty");
      } else if (!this.owns(deck.units[i].id)) {
        errors.push("Unit not owned: " + deck.units[i].name);
      }
    }
    return { valid: errors.length === 0, errors: errors };
  },

  sanitizeDeckIds: function () {
    var deck = Save.getDeckIds();
    var changed = false;

    if (deck.generalId && !this.owns(deck.generalId)) {
      deck.generalId = null;
      changed = true;
    }

    for (var i = 0; i < 3; i++) {
      if (deck.unitIds[i] && !this.owns(deck.unitIds[i])) {
        deck.unitIds[i] = null;
        changed = true;
      }
    }

    if (changed) {
      Save.setDeck(deck.generalId, deck.unitIds);
    }
    return deck;
  }
};
