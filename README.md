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
| **AFK mode** | Auto-battles with configurable speed, booster pack drops, offline catch-up |
| **Card collection** | Start with a basic deck; unlock cards by winning battles |
| **PiP / widget** | Picture-in-Picture (Chrome/Edge) or floating widget for background play |
| **Battle animations** | Phase banners, unit clashes, attack lunges, damage numbers, K.O. |
| **Card art** | 84 physical Card Battle images from the wiki + generated avatars for the rest |
| **Local saves** | Unified save (`crimsonvs_save`) with deck, rank, owned cards, AFK state |

---

## How to play

1. Open the game (local file or GitHub Pages link above).
2. Click **START** for manual battles, or **AFK MODE** for automatic progression.
3. Pick **1 General** and **3 Units** from your owned cards (charisma limit applies).
4. Win battles to climb rank and unlock new cards from booster packs.
5. In AFK mode, battles run on a timer (slow / normal / fast) while the tab stays open.

### AFK mode

Inspired by the original game: Crimson VS ran in the background on ALTIMIT Mine OS (~1 battle per minute). This version lets you choose:

| Speed | Interval |
|-------|----------|
| Slow | 60 seconds |
| Normal | 30 seconds |
| Fast | 10 seconds |

Wins grant a random new card (weighted by rank). Duplicates are ignored in v1.

**AFK mini window** (button on the AFK screen) tries three modes in order:

| Mode | Browsers | Behavior |
|------|----------|----------|
| **OPEN PiP** | Chrome 116+, Edge, Opera (HTTPS or localhost) | Native floating window over other apps (Document Picture-in-Picture) |
| **FLOAT WINDOW** | Firefox, Opera, older browsers, when native PiP fails | Separate `window.open` popup — floats on the desktop; allow popups for the site |
| **FLOAT WIDGET** | Last resort if popups are blocked | Draggable panel inside the tab (drag the title bar) |

Serve over HTTPS or `localhost` for native PiP. On Opera, if you see FLOAT WINDOW instead of OPEN PiP, the popup still detaches from the tab.

### Battle phases (manual mode)

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
│   ├── save.js             # Unified localStorage save
│   ├── inventory.js        # Owned cards & starter deck
│   ├── progression.js      # Booster pack drops by rank
│   ├── afk.js              # Auto-battle loop & catch-up
│   ├── pip.js              # Picture-in-Picture / float widget
│   ├── deck-builder.js     # Deck UI and validation
│   ├── ai.js               # Opponent decks and ranking
│   └── ui.js               # Screens, card rendering, battle playback
├── scripts/
│   └── validate.js         # CI smoke tests
├── .github/workflows/
│   ├── ci.yml              # PR validation
│   └── deploy-pages.yml    # Deploy on merge to main
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

The physical `.hack//G.U. Card Battle` product has **84 illustrated cards**. Crimson VS in-game has **150 cards**, so cards from Vol.3 (#111–150) reuse the closest matching character art.

Each card is mapped to the correct **physical Card Battle number** (1–84) using the [Fandom wiki gallery](https://dothack.fandom.com/wiki/Card_Battle), matched by **card name** — not by character. For example:

| Crimson VS card | Physical # | Wiki name |
|-----------------|------------|-----------|
| #40 Treasonous Self | 82 | Treasonous Self |
| #82 Don't Kick!! | 48 | Don't kick it!! |
| #67 Cat Punch!! | 46 | Neko-Neko Punch!! |

The mapping lives in `js/card-images.js` (`imageByCardId`). Cards without a dedicated illustration fall back to a styled character avatar in the UI.

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

### Development workflow

1. Create a branch: `git checkout -b feature/my-change`
2. Make changes and run validation: `node scripts/validate.js`
3. Open a Pull Request to `main`
4. CI runs automatically on the PR
5. After review and merge, **GitHub Actions deploys to Pages**

### GitHub setup (repository admin)

1. **Settings → Pages → Build and deployment:** set source to **GitHub Actions**
2. **Settings → Branches:** protect `main` — require PR and passing `CI` check before merge

### What to contribute

Issues and pull requests are welcome for:

- Rule accuracy fixes
- Missing junction / combo implementations
- UI and animation improvements
- Better character → image mapping

---

## Author

Built as a fan tribute to the `.hack` series.
