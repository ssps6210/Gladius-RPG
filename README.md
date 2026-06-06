# ⚔ Gladius RPG

A dark-fantasy browser RPG with turn-based combat, randomized loot, dungeon runs, arena battles, tavern quests, and deep equipment progression. Built with React + TypeScript — no installation required.

## 🎮 Play Now

**[▶ Click here to play in your browser](https://ssps6210.github.io/Gladius-RPG)** — no download, no login, works on desktop and mobile.

---

## ✨ Features

### ⚔ Combat
- Turn-based combat with 10+ weapon categories, each with unique traits (first-strike, bleed, critical boost, lifesteal, etc.)
- Monsters with special mechanics: evasion, armor, regeneration, cursed attacks, burn, lifesteal
- Battle replay system with animated log and skip option

### 🗺 Dungeon
- 20+ expedition zones (quick single-monster fights for fast leveling)
- 6 full dungeons with 3-wave + Boss structure (Normal / Hero / Legend difficulty)
- Mercenary dungeon system: hire mercenaries via Contract Scrolls with tiered rarities and trait bonuses

### 🏟 Arena
- Challenge CPU opponents matched to your level
- Plunder gold on victory; injuries require recovery time
- Daily refresh limit with paid refresh option

### 🍺 Tavern
- Quest board with randomly generated bounties (kill targets, lore text, gold & EXP rewards)
- Full story modal on quest completion with narrative conclusion
- Inn for paid rest and injury recovery

### 📋 Quests
- Daily / Weekly / Achievement quest system
- Completion badge in the tab indicator

### 🎒 Loot & Inventory
- Randomized item drops with 5 rarity tiers: Common → Magic → Rare → Legendary → Mythic
- Item enhancement (+1 to +10) at the Forge with success/failure mechanics
- Item synthesis: combine materials into higher-tier gear
- Bulk sell with configurable rarity threshold

### 🧤 Equipment
- 10 equipment slots: Weapon, Off-hand, Helmet, Armor, Gloves, Boots, Ring, Talisman (+ secondary weapon & ring)
- Set bonus system: collect matching pieces to unlock powerful passive bonuses
- Job class system: unlock specializations (Warrior, Ranger, Mage, etc.) with class-specific portraits and stat modifiers

### ⚒ Training
- Permanently train Attack, Defense, Max HP, and Speed at the Forge using gold

### 🔊 Audio
- Real .wav sound effects (CC0 licensed — RPG Sound Pack)
- Header audio panel: master volume slider, SE mute toggle, BGM toggle (BGM coming soon)
- Settings persist across sessions via localStorage

### 📱 Other
- Fully responsive — works on mobile (390px) and desktop
- Bilingual UI: Traditional Chinese 繁體中文 / English (toggle in header)
- Auto-save to localStorage; manual save + reset buttons
- Portrait banners for every major tab (Dungeon, Arena, Shop, Tavern, Quests, Battle Log)

---

## 🛠️ Tech Stack

| | |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 7 |
| Testing | Vitest + Testing Library |
| Audio | Web Audio API + CC0 .wav files |
| Deployment | GitHub Pages (GitHub Actions) |
| Styling | Plain CSS + inline styles (dark fantasy theme, Cinzel / Crimson Text fonts) |

---

## 🚀 Local Development

```bash
npm install
npm run dev       # localhost:5173
npm run test      # vitest
npm run build     # production build
```

---

## ☕ Support

Enjoying Gladius?

<a href="https://www.buymeacoffee.com/ssps6210noa" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

---

## Disclaimer

This is a non-profit personal project. Sound assets are CC0 licensed (RPG Sound Pack). All other content is original.
