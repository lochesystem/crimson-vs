/* ========================================================
   CRIMSON VS — AI Opponent System
   ======================================================== */
window.AI = {
  playerRank: 50,
  wins: 0,
  losses: 0,

  /* ---------- Initialization ---------- */
  init: function () {
    try {
      var data = localStorage.getItem("crimsonvs_ai");
      if (data) {
        var parsed = JSON.parse(data);
        this.playerRank = parsed.rank || 50;
        this.wins = parsed.wins || 0;
        this.losses = parsed.losses || 0;
      }
    } catch (e) { /* noop */ }
  },

  _save: function () {
    try {
      localStorage.setItem("crimsonvs_ai", JSON.stringify({
        rank: this.playerRank,
        wins: this.wins,
        losses: this.losses
      }));
    } catch (e) { /* noop */ }
  },

  /* ---------- Generate Opponent ---------- */
  generateOpponent: function () {
    var rank = this.playerRank;
    var deckData = this._getDeckForRank(rank);

    var general = CardsData.getCard(deckData.generalId);
    var units = deckData.unitIds.map(function (id) { return CardsData.getCard(id); });

    return {
      name: deckData.name,
      rank: rank,
      deck: { general: general, units: units }
    };
  },

  /* ---------- Report Result ---------- */
  reportResult: function (won) {
    if (won) {
      this.wins++;
      if (this.playerRank > 1) {
        this.playerRank--;
      } else if (this.playerRank === 1) {
        this.playerRank = 0; // beat champion
      }
    } else {
      this.losses++;
    }
    this._save();
  },

  /* ---------- Deck Selection by Rank ---------- */
  _getDeckForRank: function (rank) {
    var pool;
    if (rank <= 1)       pool = this.deckPool.champion;
    else if (rank <= 9)  pool = this.deckPool.tier4;
    else if (rank <= 24) pool = this.deckPool.tier3;
    else if (rank <= 39) pool = this.deckPool.tier2;
    else                 pool = this.deckPool.tier1;

    return pool[Math.floor(Math.random() * pool.length)];
  },

  deckPool: {
    tier1: [
      { name: "Rookie Guildsman", generalId: 25, unitIds: [67, 70, 28] },
      { name: "Harvest Cleric", generalId: 24, unitIds: [26, 27, 69] },
      { name: "Arena Hopeful", generalId: 23, unitIds: [67, 68, 70] },
      { name: "Burning Passion", generalId: 8, unitIds: [66, 71, 28] }
    ],
    tier2: [
      { name: "Demon Palace Guard", generalId: 20, unitIds: [72, 61, 60] },
      { name: "Moon Tree Healer", generalId: 14, unitIds: [55, 56, 57] },
      { name: "Epitaph Wielder", generalId: 21, unitIds: [54, 58, 69] },
      { name: "Canard Strategist", generalId: 13, unitIds: [53, 52, 48] }
    ],
    tier3: [
      { name: "Twilight Blade", generalId: 10, unitIds: [49, 64, 82] },
      { name: "Tri-Edge Hunter", generalId: 18, unitIds: [48, 63, 81] },
      { name: "Terror of Death", generalId: 1, unitIds: [30, 42, 39] },
      { name: "Kestrel Assassin", generalId: 22, unitIds: [68, 72, 79] }
    ],
    tier4: [
      { name: "Arena Champion I", generalId: 12, unitIds: [30, 59, 50] },
      { name: "Twilight Vanguard", generalId: 11, unitIds: [40, 57, 47] },
      { name: "Icolo Fury", generalId: 88, unitIds: [29, 116, 119] },
      { name: "Raven Intelligence", generalId: 99, unitIds: [131, 134, 136] }
    ],
    champion: [
      { name: "Card King Gaspard", generalId: 106, unitIds: [74, 81, 80] },
      { name: "Gaspard — Final Hand", generalId: 95, unitIds: [65, 125, 49] },
      { name: "Gaspard — Kestrel Storm", generalId: 104, unitIds: [141, 147, 148] }
    ]
  }
};
