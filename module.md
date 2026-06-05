# Gladius RPG — 模組架構參考

> 快速定位「要改 X 就去哪裡」的參考文件。

---

## 目錄結構一覽

```
src/
├── main.tsx                  # 入口，掛載 React App
├── App.tsx                   # 根元件：LanguageProvider + GameApp + Footer
│
├── game/                     # 核心遊戲邏輯
│   ├── GameApp.tsx           # 主 UI 容器（側欄、頁籤、彈窗）
│   ├── useGameState.ts       # 所有遊戲狀態的 React Hook（唯一真相來源）
│   ├── audio.ts              # Web Audio API 音效（無外部檔案）
│   ├── game.css              # 全域遊戲樣式（含 @media mobile）
│   ├── appTypes.ts           # App 層 TypeScript 型別
│   ├── types.ts              # 重新匯出 types/ 子目錄
│   │
│   ├── types/                # 型別定義
│   │   ├── shared.ts         # EquipmentSlotId、SLOT_EFFECTIVENESS、SLOT_CLASS_UNLOCK
│   │   ├── player.ts         # RuntimePlayer 介面
│   │   ├── item.ts           # RuntimeItem 介面
│   │   └── ...               # arena / battle / combat / quest / save / tavern
│   │
│   ├── constants/
│   │   └── storage.ts        # createInitialPlayer()、createInitialEquipment()、STORAGE_KEYS
│   │
│   ├── i18n/
│   │   ├── LanguageContext.tsx  # useLanguage() → t() tr() L() toggleLang
│   │   └── strings.ts          # 所有 UI 字串（中/英）
│   │
│   ├── data/                 # 靜態遊戲內容定義
│   │   ├── classes.ts        # 職業（戰士/詩人/聖職者/強盜）、頭像路徑、屬性加成
│   │   ├── equipmentSlots.ts # EQUIP_SLOTS：欄位定義、classUnlock、effectiveness
│   │   ├── monsters.ts       # 怪物池
│   │   ├── dungeons.ts       # 地下城波次與 BOSS
│   │   ├── dungeonTiers.ts   # 難度分級（普通/英雄/傳奇）
│   │   ├── expeditions.ts    # 單怪快速探險
│   │   ├── sets.ts           # 套裝定義與效果
│   │   ├── affixes.ts        # 詞綴池（前綴/後綴）
│   │   ├── rarities.ts       # 稀有度（顏色、光暈、詞綴數）
│   │   ├── weaponCategories.ts  # 武器類型特性
│   │   ├── itemBases.ts      # 基礎裝備模板
│   │   ├── mercenaries.ts    # 傭兵定義
│   │   ├── quests.ts         # 日常/週常/成就任務
│   │   ├── tavernQuests.ts   # 酒館委託
│   │   ├── trainStats.ts     # 訓練費用曲線
│   │   ├── arena.ts          # 競技場對手池
│   │   └── enhanceLevels.ts  # 強化機率與費用
│   │
│   ├── systems/              # 遊戲邏輯運算（無 UI）
│   │   ├── combat.ts         # 戰鬥模擬核心：sumEq、cAtk/cDef/cMhp/cSpd、getClassEffects、runCombatEncounter
│   │   ├── loot.ts           # 掉落生成
│   │   ├── progression.ts    # 升級與 EXP
│   │   ├── arena.ts          # 競技場機制
│   │   ├── economy.ts        # 買賣金錢計算
│   │   ├── quests.ts         # 任務進度追蹤
│   │   ├── tavernQuests.ts   # 酒館委託邏輯
│   │   ├── recovery.ts       # 受傷 / 恢復計時
│   │   └── mercenaryCombat.ts  # 傭兵戰鬥
│   │
│   ├── lib/                  # 純函式工具
│   │   ├── items.ts          # calcSellPrice、applyEnhanceBonus、enhanceCost
│   │   ├── display.ts        # TRAIN_STAT_DISPLAY_KEYS、格式化
│   │   └── training.ts       # trainCost 計算
│   │
│   └── persistence/
│       └── index.ts          # loadGameState、saveGameState、clearGameState、mergePlayer
│
├── features/                 # 各頁籤 UI（依功能分模組）
│   ├── dungeon/DungeonTab.tsx
│   ├── arena/ArenaTab.tsx
│   ├── tavern/TavernPage.tsx
│   ├── quests/QuestTab.tsx
│   ├── shop/ShopTab.tsx
│   ├── inventory/InventoryTab.tsx
│   ├── train/TrainTab.tsx
│   ├── battle/BattleReport.tsx
│   └── mercenary/MercenaryRunSummary.tsx
│
├── components/               # 共用元件
│   ├── ClassSelectModal.tsx  # 轉職彈窗
│   ├── LootPopup.tsx         # 掉落彈窗
│   ├── ItemCard.tsx          # 物品卡片
│   ├── HpBar.tsx             # HP 條
│   ├── AffixLines.tsx        # 詞綴顯示
│   ├── BattleLog.tsx         # 戰鬥紀錄
│   ├── ReplayLog.tsx         # 重播紀錄
│   └── StoryModal/           # 劇情彈窗
│
└── layout/
    └── Footer.tsx

public/
└── portraits/                # 角色頭像圖（Gladiator/Warrior/Bard/Cleric/Rogue）
```

---

## 常見修改對應位置

### 加新職業
1. `data/classes.ts` — 加 `JobClassId`、`JOB_CLASSES` 條目、頭像路徑
2. `systems/combat.ts` → `getClassEffects()` — 加職業特效 case
3. `types/shared.ts` → `SLOT_CLASS_UNLOCK` — 如有專屬裝備槽

### 加新裝備槽
1. `types/shared.ts` → `EQUIPMENT_SLOT_IDS`（加 slot id）、`SLOT_EFFECTIVENESS`、`SLOT_CLASS_UNLOCK`、`SLOT_BASE_TYPE`
2. `data/equipmentSlots.ts` → `EQUIP_SLOTS`（加 classUnlock、effectiveness）
3. `constants/storage.ts` → `createInitialEquipment()` 會自動從 `EQUIPMENT_SLOT_IDS` 產生，無需手動加

### 加新怪物 / 地下城
- 怪物：`data/monsters.ts`
- 地下城波次：`data/dungeons.ts`
- 探險（單怪）：`data/expeditions.ts`

### 加新任務
- 日常/週常/成就：`data/quests.ts`
- 酒館委託：`data/tavernQuests.ts`

### 改平衡數值
| 想改什麼 | 去哪裡 |
|---|---|
| 職業屬性加成 | `data/classes.ts` atkBonus / defBonus / hpPct / spdBonus |
| 職業戰鬥特效 | `systems/combat.ts` → `getClassEffects()` |
| 第二槽效能 | `types/shared.ts` → `SLOT_EFFECTIVENESS` |
| 強化機率/費用 | `data/enhanceLevels.ts` |
| 武器類型特性 | `data/weaponCategories.ts` |
| 套裝效果 | `data/sets.ts` |
| 訓練費用曲線 | `data/trainStats.ts` |
| 掉落稀有度權重 | `data/rarities.ts` |

### 加新音效
- `game/audio.ts` — 新增函式，使用 Web Audio API（無需外部檔案）
- 在 `useGameState.ts` 頂部 import，於適當時機呼叫

### 改 UI 文字（中/英）
- `game/i18n/strings.ts` — UI 固定字串
- 裝備槽名稱：`data/equipmentSlots.ts` label / labelEn
- 職業名稱/描述：`data/classes.ts` name / nameEn / desc / descEn

### 改手機介面
- `game/game.css` → 最底部 `@media (max-width: 768px)` 區塊

### 加新頭像
1. 圖片放入 `public/portraits/`（路徑格式：`./portraits/FileName.ext`）
2. `data/classes.ts` → 對應職業的 `portrait` 欄位填入路徑

---

## 持久化機制（重要）

`useGameState.ts` 的 `player` 狀態透過 `persistence/index.ts` 的 `mergePlayer()` 做存讀。

**新增 player 欄位時必須同時在 `createInitialPlayer()`（`constants/storage.ts`）加預設值**，否則舊存檔讀取後該欄位會是 `undefined`。

```typescript
// constants/storage.ts
export function createInitialPlayer(): RuntimePlayer {
  return {
    // ... 現有欄位 ...
    jobClass: "",        // 新欄位必須在這裡加預設值
    newField: 0,         // ← 加在這裡
  };
}
```

---

## 戰鬥數值流程

```
player.attack
  + player.trainedAtk
  + sumEq(player, "attack")     ← 含 SLOT_EFFECTIVENESS 乘數
  + aggregateSetEffects(sets).attack
  + cls.atkBonus
= cAtk(player)                  ← 實際攻擊力
```

`sumEq` 在 `systems/combat.ts`，對 weapon2（×0.5）、armor2（×0.7）、ring2（×1.0）等第二槽自動套乘。

---

## 部署

- Push 到 `main` → GitHub Actions 自動 build + deploy 到 GitHub Pages
- 所有圖片路徑必須用 `./` 開頭相對路徑（因 vite.config.ts 設 `base: "./"`）
- Repo：`https://github.com/ssps6210/Gladius-RPG`
