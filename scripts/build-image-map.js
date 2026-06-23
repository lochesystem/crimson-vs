const fs = require("fs");
const path = require("path");

const wikiByNum = {
  1: "Tabby", 2: "Sakisaka", 3: "Shino", 4: "Haseo", 5: "Gaspard",
  6: "Silabus", 7: "Sakubo", 8: "Elk", 9: "Terajima Ryoko", 10: "Ovan",
  11: "Haseo", 12: "Atoli", 13: "Mistral", 14: "BlackRose", 15: "Raid",
  16: "Kamui", 17: "Zelkova", 18: "Atoli", 19: "Matsu", 20: "Orca",
  21: "Kite", 22: "Balmung", 23: "Bordeaux", 24: "Antares", 25: "Piros the 3rd",
  26: "BT", 27: "Alkaid", 28: "Endrance", 29: "Sirius", 30: "Antares",
  31: "Sora", 32: "Taihaku", 33: "Gabi", 34: "Pi", 35: "Midori",
  36: "Haseo", 37: "Ginkan", 38: "Pi", 39: "Kuhn", 40: "Yata",
  41: "Kuhn", 42: "Ovan", 43: "Tri-Edge", 44: "Tri-Edge", 45: "With My Brother",
  46: "Neko-Neko Punch!!", 47: "Lovable Instant", 48: "Don't kick it!!", 49: "Tranquil times",
  50: "Come Back Alive", 51: "Rival Spirits", 52: "Unyielding Sparks", 53: "Freedom to Imagine",
  54: "Baptism of Smiles", 55: "Ace of Hearts", 56: "Healing Waves", 57: "Black Rose of Insight",
  58: "What Was That?!", 59: "Voluntary Trust", 60: "Unstoppable Resolve", 61: "Bird In A Cage",
  62: "Aurora Gaze", 63: "Merry Azure Sea", 64: "Furious Azure Sky", 65: "Gimme Some Chim!",
  66: "March of Destruction", 67: "Her", 68: "Rose Letters", 69: "The Trinity",
  70: "Broken Full Moon", 71: "Reckless Roar", 72: "Invisible", 73: "Reaper's Rondo",
  74: "PK Network", 75: "No More Lose.", 76: "Shadow of Memories", 77: "Restraint of Discipline",
  78: "Fearful Shino", 79: "Flame of Consumption", 80: "Officially Allowed", 81: "Iron Fist of Anger",
  82: "Treasonous Self", 83: "Thirst for Justice", 84: "Melody Pursuer"
};

function norm(s) {
  return s.toLowerCase().replace(/["']/g, "").replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

const wikiByName = {};
Object.entries(wikiByNum).forEach(function (entry) {
  wikiByName[norm(entry[1])] = +entry[0];
});

const aliases = {
  "dont kick": 48, "dont kick it": 48,
  "no more loss": 75, "no more lose": 75,
  "cat punch": 46, "neko neko punch": 46,
  "grim reaper s rondo": 73, "reaper s rondo": 73,
  "gimme some chim": 65,
  "bird in a cage": 61,
  "black rose of insight": 57,
  "azure sea s laugh": 63, "merry azure sea": 63,
  "angry blue sky": 64, "furious azure sky": 64,
  "young girl s path": 47, "lovable instant": 47,
  "time of peace": 49, "tranquil times": 49,
  "fearful shino": 78,
  "kappa rappa kappa": 25,
  "bamyon": 31,
  "climactic theory": 35,
  "falling flag": 24,
  "unreaching blade": 23,
  "passing through": 7,
  "decapitation of oath": 43,
  "wrath of logos": 34,
  "refrain of shadows": 40,
  "coppelia s repose": 8,
  "a time to love": 5,
  "impenetrable barrier": 10,
  "master subaru": 13,
  "jackpot": 39,
  "two fangs": 19,
  "check this out": 18,
  "dancing lion": 33,
  "strongest smile": 17,
  "order upheld": 22,
  "bland self": 26,
  "haseo at dawn": 4,
  "haseo the black rogue": 36,
  "haseo the terror of death": 11,
  "degenerating haseo": 52,
  "haseo counterattacks": 48,
  "pi raven": 34,
  "tabby twilight brigade": 1,
  "shino twilight brigade": 3,
  "sakisaka twilight brigade": 2,
  "gaspard canard": 5,
  "atoli moon tree": 12,
  "sakubo trifle": 7,
  "raid of new punishers": 15,
  "ovan the wanderer": 10,
  "endrance the exquisite": 28,
  "kuhn raven": 41,
  "bordeaux the mad blade": 23,
  "ovan the twilight": 42,
  "silabus canard": 6,
  "haseo the silver dual gunner": 82,
  "bordeaux in distress": 66,
  "alkaid icolo": 27,
  "cold hearted saku": 51,
  "kaede moon tree": 60,
  "sirius icolo": 29,
  "sophora moon tree": 17,
  "twilight knight piros the 3rd": 25,
  "beast awakening haseo": 65,
  "zelkova moon tree": 17,
  "sakaki lost in ambition": 59,
  "azure orca": 20,
  "avatar awakening haseo": 72,
  "yata raven": 40,
  "bo trifle": 45,
  "sakaki moon tree": 61,
  "hiiragi moon tree": 32,
  "tri edge ovan": 44,
  "gabi kestrel": 33,
  "azure balmung": 64,
  "card king gaspard": 53,
  "taihaku icolo": 32,
  "antares icolo": 30,
  "nala moon tree": 18,
  "matsu moon tree": 19,
  "kite": 21,
  "blackrose": 14,
  "balmung": 22,
  "orca": 20,
  "tri edge": 43,
  "mistral": 13
};

const cardsSrc = fs.readFileSync(path.join(__dirname, "..", "js", "cards-data.js"), "utf8");
const cards = [];
const re = /\{\s*id:\s*(\d+),\s*name:\s*"([^"]+)"/g;
let m;
while ((m = re.exec(cardsSrc))) {
  cards.push({ id: +m[1], name: m[2] });
}

const map = {};
const unmatched = [];

cards.forEach(function (c) {
  const n = norm(c.name);
  let img = aliases[n];
  if (!img && wikiByName[n]) img = wikiByName[n];
  if (!img) {
    const keys = Object.keys(wikiByName);
    for (let i = 0; i < keys.length; i++) {
      const wn = keys[i];
      if (n.length >= 4 && (n.indexOf(wn) !== -1 || wn.indexOf(n) !== -1)) {
        img = wikiByName[wn];
        break;
      }
    }
  }
  if (img) map[c.id] = img;
  else unmatched.push(c);
});

console.log("matched", Object.keys(map).length, "unmatched", unmatched.length);
unmatched.forEach(function (c) { console.log("?", c.id, c.name); });
fs.writeFileSync(path.join(__dirname, "image-map-output.json"), JSON.stringify(map, null, 2));
