/* CI smoke test — validates card data and image mappings */
var fs = require("fs");
var path = require("path");
var vm = require("vm");

function loadModule(relativePath, exportName) {
  var code = fs.readFileSync(path.join(__dirname, "..", relativePath), "utf8");
  var sandbox = { window: {} };
  vm.runInNewContext(code, sandbox);
  return sandbox.window[exportName];
}

var CardsData = loadModule("js/cards-data.js", "CardsData");
var CardImages = loadModule("js/card-images.js", "CardImages");

var errors = [];
var allCards = (CardsData.generals || []).concat(CardsData.units || []);

if (allCards.length !== 150) {
  errors.push("Expected 150 cards, found " + allCards.length);
}

var ids = {};
allCards.forEach(function (c) {
  if (ids[c.id]) errors.push("Duplicate card id: " + c.id);
  ids[c.id] = true;
  if (!CardImages.imageByCardId[c.id]) {
    errors.push("Missing imageByCardId mapping for card " + c.id + " (" + c.name + ")");
  }
});

for (var i = 1; i <= 150; i++) {
  if (!ids[i]) errors.push("Missing card id: " + i);
}

var imgDir = path.join(__dirname, "..", "img", "cards");
var usedNums = {};
Object.keys(CardImages.imageByCardId).forEach(function (id) {
  var num = CardImages.imageByCardId[id];
  if (num < 1 || num > 84) errors.push("Invalid image number " + num + " for card " + id);
  usedNums[num] = true;
  var file = path.join(imgDir, num + ".jpg");
  if (!fs.existsSync(file)) errors.push("Missing image file: img/cards/" + num + ".jpg");
});

if (errors.length > 0) {
  console.error("Validation failed:\n" + errors.join("\n"));
  process.exit(1);
}

console.log("OK: 150 cards, " + Object.keys(CardImages.imageByCardId).length + " image mappings, " + Object.keys(usedNums).length + " unique art files referenced");
