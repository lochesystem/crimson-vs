/* ========================================================
   CRIMSON VS — Physical Card Image Mapping
   Maps .hack//G.U. Card Battle physical cards to character names
   ======================================================== */
window.CardImages = {
  basePath: "img/cards/",

  physicalCards: {
    1: "Tabby", 2: "Sakisaka", 3: "Shino", 4: "Haseo", 5: "Gaspard",
    6: "Silabus", 7: "Sakubo", 8: "Elk", 9: "Terajima Ryoko", 10: "Ovan",
    11: "Haseo", 12: "Atoli", 13: "Mistral", 14: "BlackRose", 15: "Raid",
    16: "Kamui", 17: "Zelkova", 18: "Atoli", 19: "Matsu", 20: "Orca",
    21: "Kite", 22: "Balmung", 23: "Bordeaux", 24: "Antares", 25: "Piros",
    26: "BT", 27: "Alkaid", 28: "Endrance", 29: "Sirius", 30: "Antares",
    31: "Sora", 32: "Taihaku", 33: "Gabi", 34: "Pi", 35: "Midori",
    36: "Haseo", 37: "Ginkan", 38: "Pi", 39: "Kuhn", 40: "Yata",
    41: "Kuhn", 42: "Ovan", 43: "Tri-Edge", 44: "Tri-Edge", 45: "Sakubo",
    46: "Tabby", 47: "Sakubo", 48: "Haseo", 49: "Atoli", 50: "Haseo",
    51: "Sakubo", 52: "Haseo", 53: "Gaspard", 54: "Ovan", 55: "Atoli",
    56: "Atoli", 57: "BlackRose", 58: "Mimiru", 59: "Sakaki", 60: "Kaede",
    61: "Sakaki", 62: "Kite", 63: "Orca", 64: "Balmung", 65: "Haseo",
    66: "Bordeaux", 67: "Endrance", 68: "Endrance", 69: "Haseo", 70: "Sakubo",
    71: "BlackRose", 72: "Haseo", 73: "Haseo", 74: "Bordeaux", 75: "Haseo",
    76: "Atoli", 77: "Pi", 78: "Shino", 79: "Azure Kite", 80: "Shugo",
    81: "Kuhn", 82: "Haseo", 83: "Kuhn", 84: "Mai Minase"
  },

  nameAliases: {
    "Bo": "Sakubo", "Saku": "Sakubo", "Sakisaka": "Sakisaka",
    "Piros the 3rd": "Piros", "Piros": "Piros",
    "Sophora": "Zelkova", "Hiiragi": "Zelkova",
    "Nala": "Atoli", "Raid": "Haseo",
    "Kamui": "Haseo", "Ginkan": "Haseo",
    "AIDA Sakaki": "Sakaki", "AIDA Sirius": "Sirius",
    "Cubia": "Tri-Edge", "Death Grunty": "Gaspard",
    "Natsume": "Alkaid", "Tsukasa": "Elk",
    "B-Set": "Pi", "TaN": "Ovan",
    "Silver Knight": "Balmung", "Subaru": "Mistral",
    "Terajima Ryoko": "Terajima Ryoko",
    "Azure Kite": "Azure Kite", "Azure Orca": "Orca",
    "Azure Balmung": "Balmung", "Tri-Edge Ovan": "Ovan",
    "Card King Gaspard": "Gaspard"
  },

  characterImages: {},

  _buildCharacterImages: function () {
    this.characterImages = {};
    for (var num in this.physicalCards) {
      var name = this.physicalCards[num];
      if (!this.characterImages[name]) this.characterImages[name] = [];
      this.characterImages[name].push(parseInt(num, 10));
    }
    for (var ch in this.characterImages) {
      this.characterImages[ch].sort(function (a, b) { return a - b; });
    }
  },

  _extractCharacter: function (card) {
    if (card.character) return card.character;
    var name = card.name;
    var sortedAliases = Object.keys(this.nameAliases).sort(function (a, b) { return b.length - a.length; });
    for (var i = 0; i < sortedAliases.length; i++) {
      var alias = sortedAliases[i];
      var pos = name.indexOf(alias);
      if (pos === -1) continue;
      var afterPos = pos + alias.length;
      var charAfter = afterPos < name.length ? name.charAt(afterPos) : " ";
      if (/[a-zA-Z]/.test(charAfter)) continue;
      return this.nameAliases[alias];
    }
    var parts = name.split(/\s*[-–—]\s*/);
    if (parts.length > 0) return parts[0].trim();
    return name;
  },

  getImageForCard: function (card) {
    if (!this._built) {
      this._buildCharacterImages();
      this._built = true;
    }
    var character = card.character;
    if (character) {
      var resolved = this.nameAliases[character] || character;
      var imgs = this.characterImages[resolved];
      if (imgs && imgs.length > 0) {
        return this.basePath + imgs[card.id % imgs.length] + ".jpg";
      }
    }
    var extracted = this._extractCharacter(card);
    if (extracted) {
      var resolved2 = this.nameAliases[extracted] || extracted;
      var imgs2 = this.characterImages[resolved2];
      if (imgs2 && imgs2.length > 0) {
        return this.basePath + imgs2[card.id % imgs2.length] + ".jpg";
      }
    }
    for (var charName in this.characterImages) {
      if (charName.length >= 3 && card.name.indexOf(charName) !== -1) {
        var cImgs = this.characterImages[charName];
        return this.basePath + cImgs[card.id % cImgs.length] + ".jpg";
      }
    }
    return null;
  }
};
