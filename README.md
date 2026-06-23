# Crimson VS

Fan-made browser recreation of **Crimson VS**, the card battle minigame from `.hack//G.U.` (ALTIMIT Mine OS). Play in the browser with all 150 in-game cards, original-style rules, deck building, AI ranking, and animated battles.

**[Play online (GitHub Pages)](https://lochesystem.github.io/crimson-vs/)**

---

## Features

| Feature | Description |
|--------|-------------|
| **150 cards** | All Crimson VS generals and units with English names |
| **Original rules** | Unit Battle, General Battle, Delta Combos, Junction Abilities |
| **Trinity system** | Assault / Shield / Snipe with advantage cycle |
| **Deck builder** | Filter by type, trinity, rarity; charisma validation |
| **AI ranking** | Climb from Rank 50 to Rank 1; final boss Gaspard |
| **Battle animations** | Phase banners, unit clashes, attack lunges, damage numbers, K.O. |
| **Card art** | 84 physical Card Battle images from the wiki + generated avatars for the rest |
| **Local saves** | Decks and rank progress stored in `localStorage` |

---

## How to play

1. Open the game (local file or GitHub Pages link above).
2. Click **START**.
3. Pick **1 General** and **3 Units** (total unit cost must not exceed the general's Charisma).
4. Click **FIGHT** to battle the AI opponent.
5. Win to climb the ranking ladder toward Rank 1.

### Battle phases

1. **Delta Combo** — If your 3 units share a character combo, a bonus effect may activate (AP/HP changes, cost modifiers, cancel enemy combo, etc.).
2. **Unit Battle** — Each unit slot is compared (Trinity advantage, then cost). Winners become **Junction** cards for their general.
3. **General Battle** — Generals fight in turns (up to 10). Turn order is decided by Trinity advantage, then Charisma. Junction Abilities trigger throughout the fight.

### Trinity advantage

```
Snipe  → beats → Assault
Assault → beats → Shield
Shield  → beats → Snipe
```

---

## Run locally

No build step required — vanilla HTML, CSS, and JavaScript.

```bash
# Clone the repository
git clone https://github.com/lochesystem/crimson-vs.git
cd crimson-vs

# Option A: open index.html directly in your browser

# Option B: use a simple static server (recommended)
npx serve .
# or: python -m http.server 8080
```

Then open `http://localhost:3000` (or `8080`).

---

## Project structure

```
crimson-vs/
├── index.html          # Main app shell and screens
├── css/
│   └── style.css       # UI theme (ALTIMIT-inspired)
├── js/
│   ├── cards-data.js   # All 150 card definitions
│   ├── card-images.js  # Physical card image → character mapping
│   ├── delta-combos.js # 33 Delta Combo definitions
│   ├── junction-engine.js  # ~70 Junction Ability effects
│   ├── battle-engine.js    # Full battle simulation
│   ├── deck-builder.js     # Deck UI and validation
│   ├── ai.js               # Opponent decks and ranking
│   └── ui.js               # Screens, card rendering, battle playback
└── img/
    └── cards/          # 84 card images (physical Card Battle set)
```

### Module overview

| Module | Role |
|--------|------|
| `CardsData` | Card database and `getCard(id)` lookup |
| `CardImages` | Maps characters to downloaded wiki art |
| `DeltaCombos` | Detects combos from unit lineups |
| `JunctionEngine` | Applies junction abilities during battle |
| `BattleEngine` | Runs a complete battle; returns log + result |
| `DeckBuilder` | Collection filters and deck slots |
| `AI` | Rank-based opponents and persistence |
| `UI` | Screen flow and battle animations |

---

## Card images

The physical `.hack//G.U. Card Battle` product has **84 illustrated cards**. Crimson VS in-game has **150 cards**, so not every card has unique official art.

The game resolves images by:

1. Matching the card's character to the physical card set (`card-images.js`)
2. Using name aliases for generals (e.g. `Bo` → Sakubo, `Sophora` → Zelkova)
3. Falling back to a styled character avatar when no image exists

Card images were sourced from the [Dot Hack Wiki](https://dothack.fandom.com/wiki/Card_Battle) for educational / fan use.

---

## Data sources

- [Card Battle (Fandom)](https://dothack.fandom.com/wiki/Card_Battle) — card stats and images
- Japanese wiki references — junction mechanics and combo details where English sources conflict

---

## Tech stack

- **HTML5 / CSS3 / JavaScript (ES5)** — no frameworks, no bundler
- **localStorage** — deck and rank persistence
- **GitHub Pages** — static hosting

---

## Disclaimer

This is a **non-commercial fan project**. `.hack//G.U.`, Crimson VS, and all related characters and assets are property of **Bandai Namco Entertainment** / **CyberConnect2**. This project is not affiliated with or endorsed by the rights holders.

---

## License

The **source code** in this repository is provided for learning and fan use. **Game content** (names, characters, card art) belongs to the respective rights holders. Do not use this project for commercial purposes.

---

## Contributing

Issues and pull requests are welcome for:

- Rule accuracy fixes
- Missing junction / combo implementations
- UI and animation improvements
- Better character → image mapping

---

## Author

Built as a fan tribute to the `.hack` series.
