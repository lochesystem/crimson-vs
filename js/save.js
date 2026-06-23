/* ========================================================
   CRIMSON VS — Unified Save System
   ======================================================== */
window.Save = {
  VERSION: 1,
  KEY: "crimsonvs_save",
  LEGACY_DECK_KEY: "crimsonvs_deck",
  LEGACY_AI_KEY: "crimsonvs_ai",

  data: null,

  defaultData: function () {
    return {
      version: this.VERSION,
      rank: 50,
      wins: 0,
      losses: 0,
      ownedCardIds: [],
      deck: { generalId: null, unitIds: [null, null, null] },
      championBeaten: false,
      settings: { afkSpeed: "normal" },
      afk: {
        enabled: false,
        lastTick: Date.now(),
        battlesRun: 0,
        battleIndex: 0
      },
      lastDrop: null,
      lastBattle: null
    };
  },

  init: function () {
    this.data = this._load();
    this.save();
    return this.data;
  },

  get: function () {
    if (!this.data) this.init();
    return this.data;
  },

  save: function () {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(this.data));
    } catch (e) { /* noop */ }
  },

  _load: function () {
    try {
      var raw = localStorage.getItem(this.KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        return this._normalize(parsed);
      }
    } catch (e) { /* noop */ }

    return this._migrateLegacy();
  },

  _normalize: function (data) {
    var d = this.defaultData();
    if (!data || typeof data !== "object") return d;

    d.version = data.version || this.VERSION;
    d.rank = typeof data.rank === "number" ? data.rank : 50;
    d.wins = data.wins || 0;
    d.losses = data.losses || 0;
    d.ownedCardIds = Array.isArray(data.ownedCardIds) ? data.ownedCardIds.slice() : [];
    d.championBeaten = !!data.championBeaten;
    d.settings = data.settings || { afkSpeed: "normal" };
    if (!d.settings.afkSpeed) d.settings.afkSpeed = "normal";
    d.afk = data.afk || d.afk;
    d.lastDrop = data.lastDrop || null;
    d.lastBattle = data.lastBattle || null;

    if (data.deck) {
      d.deck.generalId = data.deck.generalId || null;
      d.deck.unitIds = Array.isArray(data.deck.unitIds)
        ? data.deck.unitIds.slice(0, 3)
        : [null, null, null];
      while (d.deck.unitIds.length < 3) d.deck.unitIds.push(null);
    }

    return d;
  },

  _migrateLegacy: function () {
    var d = this.defaultData();

    try {
      var aiRaw = localStorage.getItem(this.LEGACY_AI_KEY);
      if (aiRaw) {
        var ai = JSON.parse(aiRaw);
        d.rank = typeof ai.rank === "number" ? ai.rank : 50;
        d.wins = ai.wins || 0;
        d.losses = ai.losses || 0;
        if (d.rank === 0) d.championBeaten = true;
      }
    } catch (e) { /* noop */ }

    try {
      var deckRaw = localStorage.getItem(this.LEGACY_DECK_KEY);
      if (deckRaw) {
        var deck = JSON.parse(deckRaw);
        d.deck.generalId = deck.generalId || null;
        d.deck.unitIds = deck.unitIds || [null, null, null];
      }
    } catch (e) { /* noop */ }

    return d;
  },

  setRank: function (rank, wins, losses) {
    var d = this.get();
    d.rank = rank;
    d.wins = wins;
    d.losses = losses;
    this.save();
  },

  addOwned: function (cardId) {
    var d = this.get();
    if (d.ownedCardIds.indexOf(cardId) === -1) {
      d.ownedCardIds.push(cardId);
      this.save();
      return true;
    }
    return false;
  },

  owns: function (cardId) {
    return this.get().ownedCardIds.indexOf(cardId) !== -1;
  },

  getOwnedIds: function () {
    return this.get().ownedCardIds.slice();
  },

  setDeck: function (generalId, unitIds) {
    var d = this.get();
    d.deck.generalId = generalId;
    d.deck.unitIds = unitIds.slice(0, 3);
    while (d.deck.unitIds.length < 3) d.deck.unitIds.push(null);
    this.save();
  },

  getDeckIds: function () {
    var d = this.get();
    return { generalId: d.deck.generalId, unitIds: d.deck.unitIds.slice() };
  },

  setAfkSpeed: function (speed) {
    var d = this.get();
    d.settings.afkSpeed = speed;
    this.save();
  },

  getAfkInterval: function () {
    var speed = this.get().settings.afkSpeed || "normal";
    if (speed === "slow") return 60000;
    if (speed === "fast") return 10000;
    return 30000;
  }
};
