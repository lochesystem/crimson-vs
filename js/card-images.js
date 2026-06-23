/* ========================================================
   CRIMSON VS — Card Image Mapping
   Maps each Crimson VS card ID to the correct physical
   Card Battle image number (1–84) from the Fandom wiki gallery.
   https://dothack.fandom.com/wiki/Card_Battle
   ======================================================== */
window.CardImages = {
  basePath: "img/cards/",

  // Crimson VS card id → physical Card Battle image number
  imageByCardId: {
    // Vol.2 Generals (#001–025)
    1: 4,   // Haseo at Dawn
    2: 21,  // Kite
    3: 36,  // Haseo the Black Rogue
    4: 14,  // BlackRose
    5: 11,  // Haseo the Terror of Death
    6: 38,  // Pi - Raven
    7: 22,  // Balmung
    8: 1,   // Tabby - Twilight Brigade
    9: 11,  // Degenerating Haseo
    10: 3,  // Shino - Twilight Brigade
    11: 2,  // Sakisaka - Twilight Brigade
    12: 36, // Haseo Counterattacks
    13: 5,  // Gaspard - Canard
    14: 12, // Atoli - Moon Tree
    15: 7,  // Sakubo - Trifle
    16: 20, // Orca
    17: 15, // Raid of New Punishers
    18: 10, // Ovan the Wanderer
    19: 43, // Tri-Edge
    20: 28, // Endrance the Exquisite
    21: 39, // Kuhn - Raven
    22: 23, // Bordeaux the Mad Blade
    23: 42, // Ovan the Twilight
    24: 13, // Mistral
    25: 6,  // Silabus - Canard

    // Vol.2 Assault Units (#026–045)
    26: 25, // Kappa Rappa Kappa (Piros the 3rd)
    27: 31, // Bamyon! (Sora)
    28: 58, // What Was That?!
    29: 35, // Climactic Theory (Midori)
    30: 69, // The Trinity
    31: 66, // March of Destruction
    32: 24, // Falling Flag (Antares)
    33: 78, // Fearful Shino
    34: 49, // Time of Peace
    35: 23, // Unreaching Blade (Bordeaux)
    36: 57, // Black Rose of Insight
    37: 7,  // Passing Through (Sakubo)
    38: 81, // Iron Fist of Anger
    39: 52, // Unyielding Sparks
    40: 82, // Treasonous Self
    41: 83, // Thirst for Justice
    42: 79, // Flame of Consumption
    43: 43, // Decapitation of Oath (Tri-Edge)
    44: 67, // "She"
    45: 54, // Baptism of Smiles

    // Vol.2 Shield Units (#046–065)
    46: 34, // Wrath of Logos (Pi)
    47: 47, // Young Girl's Path
    48: 63, // Azure Sea's Laugh
    49: 59, // Voluntary Trust
    50: 50, // Come Back Alive
    51: 62, // Aurora Gaze
    52: 40, // Refrain of Shadows (Yata)
    53: 8,  // Coppelia's Repose (Elk)
    54: 51, // Rival Spirits
    55: 5,  // A Time To Love (Gaspard)
    56: 45, // With My Brother
    57: 76, // Shadow of Memories
    58: 53, // Freedom to Imagine
    59: 56, // Healing Waves
    60: 55, // Ace of Hearts
    61: 72, // Invisible
    62: 77, // Restraint of Discipline
    63: 75, // No More Loss
    64: 84, // Melody Pursuer
    65: 10, // Impenetrable Barrier (Ovan)

    // Vol.2 Snipe Units (#066–085)
    66: 60, // Unstoppable Resolve
    67: 46, // Cat Punch!!
    68: 61, // Bird in a Cage
    69: 13, // Master Subaru! (Mistral)
    70: 39, // Jackpot (Kuhn)
    71: 64, // Angry Blue Sky
    72: 74, // PK Network
    73: 19, // Two Fangs (Matsu)
    74: 65, // Gimme Some Chim!
    75: 26, // Bland Self (BT)
    76: 22, // Order Upheld (Balmung)
    77: 68, // Rose Letters
    78: 71, // Reckless Roar
    79: 18, // Check This Out! (Atoli)
    80: 70, // Broken Full Moon
    81: 33, // Dancing Lion (Gabi)
    82: 48, // Don't Kick!!
    83: 80, // Officially Allowed
    84: 17, // Strongest Smile (Zelkova)
    85: 73, // Grim Reaper's Rondo

    // Vol.3 Generals (#086–110)
    86: 36, // Haseo the Silver Dual Gunner
    87: 23, // Bordeaux in Distress
    88: 27, // Alkaid - Icolo
    89: 7,  // Cold-Hearted Saku (Sakubo)
    90: 60, // Kaede - Moon Tree
    91: 29, // Sirius - Icolo
    92: 17, // Sophora - Moon Tree (Zelkova)
    93: 25, // Twilight Knight Piros the 3rd
    94: 79, // Beast Awakening Haseo
    95: 17, // Zelkova - Moon Tree
    96: 61, // Sakaki Lost in Ambition
    97: 20, // Azure Orca
    98: 72, // Avatar Awakening Haseo
    99: 40, // Yata - Raven
    100: 45, // Bo - Trifle
    101: 61, // Sakaki - Moon Tree
    102: 17, // Hiiragi - Moon Tree (Zelkova)
    103: 44, // Tri-Edge Ovan
    104: 33, // Gabi - Kestrel
    105: 64, // Azure Balmung
    106: 5,  // Card King Gaspard
    107: 32, // Taihaku - Icolo
    108: 30, // Antares - Icolo
    109: 12, // Nala - Moon Tree (Atoli)
    110: 19, // Matsu - Moon Tree

    // Vol.3 Units (#111–150) — no dedicated physical art; best character match
    111: 82, // Zelpest Light Blast (Haseo)
    112: 61, // Promised Power (AIDA Sakaki)
    113: 36, // A Road to Change (Haseo)
    114: 42, // Pandora's Box (Ovan)
    115: 43, // Pure Malice (Cubia / Tri-Edge)
    116: 11, // Howling Fang (Haseo)
    117: 29, // A Promise of Discord (AIDA Sirius)
    118: 4,  // The Second Seal (Haseo)
    119: 30, // I'm not your pupil! (Antares)
    120: 29, // Minimum Maxim (Sirius)
    121: 25, // Heavenly Twilight Knight (Piros)
    122: 36, // Hurricane Knight (Haseo)
    123: 32, // The Vain King (Taihaku)
    124: 3,  // What's Most Important (Shino)
    125: 72, // Operation Delta (Haseo)
    126: 12, // Overture of Destruction (Atoli)
    127: 40, // Playful Hermit (Yata)
    128: 18, // Flame Guardian (Atoli)
    129: 40, // Did you see that! (Phyllo → Yata)
    130: 7,  // Magic Surge (Sakubo)
    131: 40, // Limitless Knowledge (Yata)
    132: 12, // Masquerade Ball (Nala → Atoli)
    133: 34, // Serpentarius (Pi)
    134: 35, // A Time for Calm (Midori)
    135: 34, // Remorse's Companion (B-Set → Pi)
    136: 6,  // Our Best Shot (Silabus)
    137: 8,  // Miracle (Tsukasa → Elk)
    138: 73, // Ultimate Thanatos (Haseo)
    139: 10, // A False Future (Ovan)
    140: 21, // Creatures From the Dark (Azure Kite)
    141: 44, // Chaotic Answer (Ovan)
    142: 27, // Cheer Up (Alkaid)
    143: 45, // A Glimpse of Twins (Sakubo)
    144: 8,  // Next to You, Next to Me (Elk)
    145: 1,  // Together with the Master (Tabby)
    146: 17, // A Girl's Heart (Hiiragi → Zelkova)
    147: 5,  // Grunty Oink! (Death Grunty → Gaspard)
    148: 27, // A Hero's Arrival! (Natsume → Alkaid)
    149: 42, // The Place for Evil (TaN → Ovan)
    150: 13  // Cute Hunter (Mistral)
  },

  getImageForCard: function (card) {
    if (!card || card.id == null) return null;
    var num = this.imageByCardId[card.id];
    if (num) return this.basePath + num + ".jpg";
    return null;
  }
};
