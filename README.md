# ⚔ Gladius RPG

A browser-based text RPG with turn-based combat, randomised loot, quests, arena battles, and inventory progression. Built with React + TypeScript, bundled with Parcel.

## 🎮 Play Now

**[▶ Click here to play in your browser](https://ssps6210.github.io/Gladius-RPG)** — no installation required!

---

## 🚀 Run Locally

```bash
npm install
npm run dev
```

## 🏗️ Build

```bash
npm run build
```

> `index.html` is the Parcel HTML entry and loads `src/main.tsx`.

---

## ✨ Features

- Turn-based combat with weapon traits and detailed battle logs
- Randomised loot drops, gear enhancement, and stat training
- Expedition, dungeon, quest, arena, shop, auction, and mercenary systems
- Persistent save via `localStorage` — progress survives page reloads
- Bilingual UI (Traditional Chinese / English)

---

## 🛠️ Tech Stack

- React 19
- TypeScript
- Parcel
- Vitest

---

## ✅ Smoke-Test Coverage

- Dev runtime verified with `npm run dev`; Parcel served the app successfully on a local port.
- Fresh-state startup confirmed with no prior save in the test browser context.
- **Expedition** tested with *Wolf Pack Hunting Ground*; battle log, rewards, gold/EXP updates, and item drop UI all rendered.
- **Dungeon** tested with *Wolf Forest [Normal]*; multi-wave combat, level-up, and boss-loss result handling all rendered.
- **Inventory** tested by equipping *Leather Boots*; DEF and SPD values updated in the character panel.
- **Shop** tested by buying a *Bronze Ring* and selling it back through the sell view.
- **Auction** inspected listings and confirmed current bids and disabled bid controls rendered (no bid placed — test character lacked the minimum gold).
- **Training** tested one HP training action; ATK, DEF, HP, and SPD values rendered correctly; gold and max HP updated and persisted after reload.
- **Quests** verified progress values rendered on the quest tab.
- **Arena** tested by challenging one opponent; combat report, defeat handling, and cooldown messaging all rendered.
- **Persistence** verified by saving, reloading, and confirming player state and equipped inventory restored from `localStorage`.

---

## 📁 Key Files

| File | Description |
|------|-------------|
| `index.html` | Parcel entry point |
| `src/main.tsx` | App bootstrap |
| `src/App.tsx` | Root app shell |
| `src/game/GameApp.tsx` | Main game composition |

---

## ☕ Support

If you enjoy the game, consider buying the developer a coffee!

<a href="https://www.buymeacoffee.com/ssps6210noa" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height:60px;width:217px;" />
</a>

---

## Disclaimer

This is a non-profit, independently developed fan project. Not affiliated with any publisher or exam board.
