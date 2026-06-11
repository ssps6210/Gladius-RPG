# ⚔ Gladius RPG

A dark-fantasy browser RPG with turn-based combat, randomized loot, dungeon runs, arena battles, tavern quests, and deep equipment progression. Built with React + TypeScript — no installation required, no login, no ads.

## 🎮 Play Now

**[▶ Click here to play in your browser](https://ssps6210.github.io/Gladius-RPG)** — desktop & mobile, instant load.

> 🌐 Languages: **繁體中文 / 简体中文 / English** (toggle in the header)

---

## ✨ Features

### ⚔ Combat & Dungeons
- Turn-based combat with 13 job classes (Tier 1 → Tier 2 advancement at Lv.70)
- 10+ weapon categories with unique traits — first-strike, bleed, lifesteal, crits, thorns
- Monsters with special mechanics: evasion, armor, regen, burn, curse
- 20+ expedition zones + 6 full dungeons (3-wave + Boss, Normal / Hero / Legend)
- **Dungeon Modifier system** — 15 random modifiers rolled before entry (buff / debuff / mixed); player can confirm or retreat
- Mercenary dungeon runs with tiered Contract Scrolls

### 🏟 Arena
- PvP against CPU opponents; plunder gold on victory
- **Leaderboard** with 12 NPC rivals — your rank updates as you win
- Injuries require recovery time; daily free refreshes

### 🎒 Loot & Inventory
- 5 rarity tiers: Common → Magic → Rare → Legendary → Mythic
- **Rarity filter buttons** (All / Magic+ / Rare+ / Legend+ / Mythic)
- **Sort by enhancement level or rarity**
- Item enhancement (+1 → +10) with success / failure mechanics
- Item synthesis system; bulk sell with configurable threshold

### 🧤 Equipment
- 10 equipment slots with effectiveness weights per slot
- 6 set bonus collections — equip matching pieces to unlock passive bonuses
- Compare tooltip on hover shows stat diffs vs currently equipped

### ⭐ Prestige System
- Unlocks at **Lv.85** — reset level / class / gear, keep trained stats + 20% gold
- Each prestige grants permanent **+5% to all combat stats** (up to ×10)

### 🍺 Tavern & Quests
- Randomized bounty quest board with lore text and story conclusion modals
- Inn for HP recovery; quest badge indicator in tab bar
- Daily / Weekly / Achievement quest system

### ⚒ Training
- Permanently train ATK, DEF, HP, SPD with gold — compounds over time

### 🔊 Audio
- Real .wav SFX (CC0 licensed — RPG Sound Pack) + looping BGM per scene
- **Independent volume sliders** for BGM and SE + master volume
- All settings persist via localStorage

### 📱 Other
- Fully responsive — desktop and mobile (390px+)
- 3-slot save system with localStorage auto-save
- **Enhanced tutorial** — 6-step guided first-play experience
- **Battle log quick-view** toggle — skip replay animation, see result instantly
- Portrait banners for every tab

---

## 🛠️ Tech Stack

| | |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 7 |
| Testing | Vitest + Testing Library |
| Audio | Web Audio API + CC0 .wav |
| Deployment | GitHub Pages via GitHub Actions |
| Styling | Plain CSS + inline styles (Cinzel / Crimson Text fonts) |

---

## 🚀 Local Development

```bash
git clone https://github.com/ssps6210/Gladius-RPG.git
cd Gladius-RPG
npm install
npm run dev       # localhost:5173
npm run test      # vitest
npm run build     # production build to /dist
```

---

## ☕ Support

This project is free and open-source forever. If you enjoy it, a coffee keeps the dungeon lights on.

<a href="https://www.buymeacoffee.com/ssps6210noa" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;"></a>

---

## 📄 License & Disclaimer

MIT License. Non-profit personal project.  
Sound assets: CC0 (RPG Sound Pack). All other content is original.
