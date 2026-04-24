# ⚔ Gladius RPG

A browser-based text RPG with turn-based combat, randomized loot, quests, arena battles, and inventory progression. The current runtime runs through Parcel + React + TypeScript from the modular `src/` app.

## 🎮 Run Locally

```bash
npm install
npm run dev
```

## 🏗️ Build

```bash
npm run build
```

Runtime note: `index.html` is the Parcel HTML entry for the modular app and loads `src/main.tsx`.

## ✨ Features

- Dynamic turn-based combat with weapon traits and battle logs
- Randomized loot, enhancement, training, and inventory management
- Expedition, dungeon, quest, arena, shop, auction, and mercenary flows
- Traditional Chinese UI

## 🛠️ Tech Stack

- React 19
- TypeScript
- Parcel
- Vitest

## ✅ Migration Verification

- Dev-mode runtime was exercised with `npm run dev`; Parcel served the migrated app successfully on a local port during Task 5 smoke testing.
- Fresh-state startup was verified because no existing save was present in the test browser context at the start of the run.
- Expedition flow was exercised with `狼群獵場`; battle log, rewards, gold/EXP updates, and item drop UI all rendered.
- Dungeon flow was exercised with `野狼森林【普通】`; multi-wave combat, level-up, and boss-loss result handling all rendered.
- Inventory interaction was exercised by equipping `皮靴`; visible defense and speed values updated in the character panel.
- Shop flow was exercised by buying one `銅戒指` and then selling it back through the sell view.
- Auction coverage was limited to the inspection path; listings, current bids, and disabled bid controls were confirmed, but no bid was placed because the smoke-test character did not have enough gold for the minimum bid.
- Training flow was exercised with one HP training action; the forge screen rendered numeric values for `攻擊力`, `防禦力`, `生命值`, and `速度`, and the HP training update changed gold and max HP and persisted after reload.
- Quest rendering was exercised by opening the quest tab and confirming progress values were shown.
- Arena flow was exercised by challenging one opponent; combat report, defeat handling, and cooldown messaging all rendered.
- Persistence was exercised by saving, reloading the page, and confirming player state plus equipped inventory restored from `localStorage`.

## 📁 Runtime Notes

- `index.html` is the Parcel entry used by the migrated app.
- The active runtime lives under `src/`.
- Historical migration references may still appear inside docs, but they are not part of the current runnable architecture.

## 📁 Runtime Files

| File | Description |
|------|-------------|
| `index.html` | Parcel entry for the current migrated runtime |
| `src/main.tsx` | App bootstrap entry loaded by Parcel |
| `src/App.tsx` | Root app shell |
| `src/game/GameApp.tsx` | Main game composition |

## Disclaimer

This is an educational, non-profit, fan-made project. All original game concepts belong to their respective copyright holders.
