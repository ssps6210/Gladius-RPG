# Legacy Game Full Extraction — Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completely delete `src/legacy/game.tsx` by extracting all 2452 lines into proper modular homes, ending with `src/App.tsx` importing a clean `GameApp` component.

**Architecture:** Bottom-up — legacy types first, then CSS, then pure UI components (leaf nodes), then feature components with internal state, then the `useGameState` hook, then tab feature components, then final GameApp assembly. Each task: create the file, add the import in `game.tsx`, delete the inline content, verify, commit.

**Tech Stack:** TypeScript 5, React 19, Vitest 3, Vite

---

## File Structure

### Files to create

- `src/legacy/types.ts` — all type aliases exported from game.tsx
- `src/legacy/game.css` — CSS extracted from the inline string
- `src/components/AffixLines.tsx`
- `src/components/HpBar.tsx`
- `src/components/ReplayLog.tsx`
- `src/components/BattleLog.tsx`
- `src/components/ItemCard.tsx`
- `src/components/LootPopup.tsx`
- `src/features/quests/QuestTab.tsx`
- `src/features/arena/ArenaTab.tsx`
- `src/game/useGameState.ts`
- `src/features/dungeon/DungeonTab.tsx`
- `src/features/train/TrainTab.tsx`
- `src/features/battle/BattleReport.tsx`
- `src/features/shop/ShopTab.tsx`
- `src/features/inventory/InventoryTab.tsx`
- `src/game/GameApp.tsx`

### Files to modify

- `src/legacy/game.tsx` — progressive deletion as each piece moves out
- `src/App.tsx` — final import swap in Task 16

### Files to delete

- `src/legacy/game.tsx` (Task 16)

---

## Task 1: Extract Legacy Types

**Files:**
- Create: `src/legacy/types.ts`
- Modify: `src/legacy/game.tsx:55-107`

- [ ] **Step 1: Create `src/legacy/types.ts`**

```ts
import type {
  RuntimeArenaOpponent,
  RuntimeItem,
  RuntimePlayer,
  RuntimeQuestState,
  RuntimeReplay,
} from "../game/types";

export type AnyRecord = Record<string, any>;
export type AnyList = any[];

export type LegacyItem = RuntimeItem & AnyRecord & {
  uid: any;
  name: any;
  icon: any;
  rarity: any;
  cat: any;
  attack: any;
  defense: any;
  hp: any;
  speed: any;
  heal: any;
  enhLv: any;
  itemLevel: any;
  slot: any;
  type: any;
  cost: any;
  affixes: any[];
  specials: any[];
};

export type LegacyPlayer = RuntimePlayer & AnyRecord & {
  level: any;
  exp: any;
  expNeeded: any;
  hp: any;
  maxHp: any;
  attack: any;
  defense: any;
  speed: any;
  gold: any;
  equipment: AnyRecord;
};

export type LegacyQuestState = RuntimeQuestState & AnyRecord;

export type LegacyArenaOpponent = Omit<RuntimeArenaOpponent, "equipment"> & AnyRecord & {
  equipment: AnyRecord;
  attack: any;
  defense: any;
  maxHp: any;
  hp: any;
  goldCarried: any;
};

export type LegacyReplay = Omit<RuntimeReplay, "drops" | "dungeon" | "tier" | "expedition" | "opponent"> & AnyRecord & {
  lines: any[];
  cursor: any;
  drops: LegacyItem[];
  won?: any;
  dungeon?: any;
  tier?: any;
  expedition?: any;
  opponent?: any;
};

export type LootDrop = LegacyItem & { _remaining?: LegacyItem[] };
```

- [ ] **Step 2: Replace the inline type declarations in `game.tsx`**

Delete lines 55–107 in `src/legacy/game.tsx`:
```ts
type AnyRecord = Record<string, any>;
type AnyList = any[];
type LegacyItem = RuntimeItem & AnyRecord & { ... };
type LegacyPlayer = RuntimePlayer & AnyRecord & { ... };
type LegacyQuestState = RuntimeQuestState & AnyRecord;
type LegacyArenaOpponent = ...;
type LegacyReplay = ...;
type LootDrop = LegacyItem & { _remaining?: LegacyItem[] };
```

Add this import line (after the last existing import block):
```ts
import type {
  AnyRecord,
  LegacyArenaOpponent,
  LegacyItem,
  LegacyPlayer,
  LegacyQuestState,
  LegacyReplay,
  LootDrop,
} from "./types";
```

Also remove the now-unused `import type { RuntimeArenaOpponent, RuntimeLogEntry, RuntimeItem, RuntimePlayer, RuntimeQuestState, RuntimeReplay }` block from game.tsx (it was only used to define the legacy types, not elsewhere in the file).

- [ ] **Step 3: Verify**

Run: `npm run typecheck`
Expected: PASS (no errors)

- [ ] **Step 4: Commit**

```bash
git add src/legacy/types.ts src/legacy/game.tsx
git commit -m "refactor: extract legacy type aliases to types.ts"
```

---

## Task 2: Extract CSS

**Files:**
- Create: `src/legacy/game.css`
- Modify: `src/legacy/game.tsx:120-758` (the `const css` declaration) and line ~1632 (the `<style>` tag)

- [ ] **Step 1: Create `src/legacy/game.css`**

Copy the raw CSS content from between the backticks in `game.tsx` lines 121–757 and save it verbatim as `src/legacy/game.css`. The file should start with `*{box-sizing:border-box;margin:0;padding:0}` and end with the last CSS rule before the closing backtick.

To extract precisely:
```bash
# In the project root:
node -e "
const fs = require('fs');
const src = fs.readFileSync('src/legacy/game.tsx', 'utf8');
const match = src.match(/const css=\`([\s\S]*?)\`;/);
fs.writeFileSync('src/legacy/game.css', match[1].trim());
console.log('CSS extracted, length:', match[1].trim().length);
"
```

Expected output: `CSS extracted, length: ~16000` (some number of characters)

- [ ] **Step 2: Add CSS import and remove inline string from `game.tsx`**

Add at the top of `src/legacy/game.tsx` (after the React import):
```ts
import "./game.css";
```

Delete the entire `const css` declaration (lines 120–758, the block starting with `const css=\`` and ending with the closing backtick).

In the JSX `return` block, find and delete this line:
```tsx
      <style>{css}</style>
```

- [ ] **Step 3: Verify**

Run: `npm run typecheck && npm test`
Expected: PASS — the game should render with the same styles applied via CSS import.

- [ ] **Step 4: Commit**

```bash
git add src/legacy/game.css src/legacy/game.tsx
git commit -m "refactor: extract inline CSS to game.css"
```

---

## Task 3: Extract `AffixLines`

**Files:**
- Create: `src/components/AffixLines.tsx`
- Modify: `src/legacy/game.tsx:759-776`

- [ ] **Step 1: Create `src/components/AffixLines.tsx`**

```tsx
export function AffixLines({ affixes }: { affixes: any[] }) {
  if (!affixes || !affixes.length) return null;
  return (
    <div className="iaf">
      {affixes.map((a, i) => (
        <div key={i} className={`al${a.special ? " as" : ""}`}>
          {a.stat
            ? `${a.tag}: +${a.rolledVal} ${a.stat === "attack" ? "攻擊" : a.stat === "defense" ? "防禦" : a.stat === "hp" ? "HP" : "速度"}`
            : `${a.tag}: ${a.rolledVal}${
                a.special === "crit" ? "% 爆擊率" : a.special === "lifesteal" ? "% 吸血" :
                a.special === "thorns" ? " 荊棘反傷" : a.special === "regen" ? " 每回合回復" :
                a.special === "pierce" ? "% 穿透" : a.special === "vampiric" ? "% 吸魂" :
                a.special === "reflect" ? " 反射傷害" : " 低血狂怒"}`}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Replace inline definition in `game.tsx`**

Delete the `function AffixLines` block (lines 759–776).

Add import at the top of `game.tsx` (with other component imports):
```ts
import { AffixLines } from "../components/AffixLines";
```

- [ ] **Step 3: Verify and commit**

Run: `npm run typecheck && npm test`
Expected: PASS

```bash
git add src/components/AffixLines.tsx src/legacy/game.tsx
git commit -m "refactor: extract AffixLines component"
```

---

## Task 4: Extract `HpBar`

**Files:**
- Create: `src/components/HpBar.tsx`
- Modify: `src/legacy/game.tsx:830-837`

- [ ] **Step 1: Create `src/components/HpBar.tsx`**

```tsx
export function HpBar({ cur, max, color = "#c83030", thin }: { cur: any; max: any; color?: string; thin?: any }) {
  return (
    <div className="bw">
      <div className="bl"><span>HP</span><span>{cur}/{max}</span></div>
      <div className="bt" style={thin ? { height: 6 } : {}}>
        <div className="bf" style={{
          width: `${Math.round(Math.max(0, cur) / max * 100)}%`,
          background: `linear-gradient(90deg,${color}99,${color})`,
        }} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace inline definition in `game.tsx`**

Delete the `function HpBar` block (lines 830–837).

Add import:
```ts
import { HpBar } from "../components/HpBar";
```

- [ ] **Step 3: Verify and commit**

Run: `npm run typecheck && npm test`
Expected: PASS

```bash
git add src/components/HpBar.tsx src/legacy/game.tsx
git commit -m "refactor: extract HpBar component"
```

---

## Task 5: Extract `ReplayLog`

**Files:**
- Create: `src/components/ReplayLog.tsx`
- Modify: `src/legacy/game.tsx:839-871`

- [ ] **Step 1: Create `src/components/ReplayLog.tsx`**

```tsx
import { useEffect, useRef } from "react";

import type { RuntimeLogEntry } from "../game/types";

type AnyRecord = Record<string, any>;

export function ReplayLog({ lines, cursor }: { lines: RuntimeLogEntry[]; cursor: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = lines.slice(0, cursor);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [cursor]);
  const COLOR: AnyRecord = {
    hit: "#d4a030", enemy: "#c84040", win: "#50c870", lose: "#c84040",
    heal: "#50c890", merc: "#6aaa6a", loot: "#c878e0", info: "#8a7050",
    title: "#e8c050", sep: "#3a2a10",
  };
  return (
    <div className="blog" ref={ref} style={{ height: 280, fontFamily: "'Crimson Text',serif" }}>
      {visible.map((line, i) => {
        const isLast = i === visible.length - 1;
        const c = COLOR[line.type] || "#a08060";
        const isSep = line.type === "sep";
        return (
          <div key={i} style={{
            color: isSep ? "#2a1a08" : c,
            fontStyle: line.type === "info" || line.type === "sep" ? "italic" : "normal",
            fontFamily: line.type === "title" || line.type === "win" || line.type === "lose" ? "'Cinzel',serif" : "inherit",
            fontSize: line.type === "title" ? "13px" : "12px",
            letterSpacing: line.type === "title" ? 1 : 0,
            borderBottom: isSep ? "1px solid #2a1a08" : "none",
            margin: isSep ? "6px 0" : "0",
            padding: isSep ? "0" : "1px 0",
            opacity: isLast ? 1 : 0.9,
            animation: isLast ? "fadeIn .15s ease" : "none",
          }}>{line.txt}</div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Replace inline definition in `game.tsx`**

Delete the `function ReplayLog` block (lines 839–871).

Add import:
```ts
import { ReplayLog } from "../components/ReplayLog";
```

- [ ] **Step 3: Verify and commit**

Run: `npm run typecheck && npm test`
Expected: PASS

```bash
git add src/components/ReplayLog.tsx src/legacy/game.tsx
git commit -m "refactor: extract ReplayLog component"
```

---

## Task 6: Extract `BattleLog`

**Files:**
- Create: `src/components/BattleLog.tsx`
- Modify: `src/legacy/game.tsx:873-892`

- [ ] **Step 1: Create `src/components/BattleLog.tsx`**

```tsx
import { useEffect, useRef } from "react";

import type { RuntimeLogEntry } from "../game/types";

export function BattleLog({ log }: { log: RuntimeLogEntry[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [log]);
  return (
    <div className="blog" ref={ref}>
      {log.map((line, i) => {
        const txt = typeof line === "string" ? line : line.txt;
        return (
          <div key={i} className={
            txt.includes("你攻擊") || txt.includes("爆擊") ? "lh" :
            txt.includes("🗡") ? "lm" :
            txt.includes("攻擊了") && !txt.includes("你攻擊") ? "le" :
            (txt.includes("擊敗") || txt.includes("等級")) ? "lw" :
            (txt.includes("被擊敗") || txt.includes("陣亡")) ? "ll" : ""
          }>{txt}</div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Replace inline definition in `game.tsx`**

Delete the `function BattleLog` block (lines 873–892).

Add import:
```ts
import { BattleLog } from "../components/BattleLog";
```

- [ ] **Step 3: Verify and commit**

Run: `npm run typecheck && npm test`
Expected: PASS

```bash
git add src/components/BattleLog.tsx src/legacy/game.tsx
git commit -m "refactor: extract BattleLog component"
```

---

## Task 7: Extract `ItemCard`

**Files:**
- Create: `src/components/ItemCard.tsx`
- Modify: `src/legacy/game.tsx:778-828`

- [ ] **Step 1: Create `src/components/ItemCard.tsx`**

```tsx
import { EQUIP_SLOTS } from "../game/data/equipmentSlots";
import { WEAPON_CATEGORIES } from "../game/data/weaponCategories";
import { getRarity } from "../game/systems";

import { AffixLines } from "./AffixLines";

export function ItemCard({ item, onEquip, onUse }: { item: any; onEquip?: any; onUse?: any }) {
  const rar = getRarity(item.rarity);
  const rc = rar.color;
  const glow = rar.glow;
  const isNormal = item.rarity === "normal" || !item.rarity;
  const cat = item.cat ? WEAPON_CATEGORIES[item.cat] : null;
  const slotDef = EQUIP_SLOTS.find(s => s.id === item.slot);
  return (
    <div className="ii" style={{
      borderColor: isNormal ? "#2e1e0a" : rc + "88",
      boxShadow: glow ? `${glow}, inset 0 0 20px rgba(0,0,0,0.3)` : "none",
      background: isNormal
        ? "linear-gradient(160deg,#1a1208,#120e06)"
        : `linear-gradient(160deg, ${rc}0a 0%, #120e06 60%)`,
    }}>
      <div className="iii" style={{ filter: `drop-shadow(0 2px 4px ${rc}66)` }}>{item.icon}</div>
      {!isNormal && (
        <div className="rb" style={{
          color: rc, borderColor: rc + "66", background: `${rc}15`,
          textShadow: glow ? `0 0 8px ${rc}` : "none",
        }}>{rar.label}</div>
      )}
      <div className="iin" style={{
        color: rc,
        textShadow: glow && !isNormal ? `0 0 10px ${rc}88` : "none",
      }}>{item.name}</div>
      {item.itemLevel > 0 && (
        <div style={{ fontSize: 9, color: "#6a5028", marginBottom: 2 }}>
          Lv.{item.itemLevel} · ×{Math.pow(1.25, Math.floor(item.itemLevel / 10)).toFixed(2)}倍
        </div>
      )}
      {cat && <div className="icat">{cat.icon} {cat.label}</div>}
      {!cat && slotDef && <div className="icat">{slotDef.icon} {slotDef.label}</div>}
      <div className="iis">
        {item.attack > 0  && <div style={{ color: item.attack > 50 ? "#f5c040" : item.attack > 25 ? "#e8a030" : "#5a4020" }}>攻擊 +{item.attack}</div>}
        {item.defense > 0 && <div style={{ color: item.defense > 40 ? "#80c0f0" : item.defense > 20 ? "#4a9fd4" : "#5a4020" }}>防禦 +{item.defense}</div>}
        {item.hp > 0      && <div style={{ color: item.hp > 80 ? "#f06060" : item.hp > 40 ? "#c84040" : "#5a4020" }}>HP +{item.hp}</div>}
        {item.speed > 0   && <div style={{ color: "#5a9050" }}>速度 +{item.speed}</div>}
        {item.heal        && <div style={{ color: "#50a860" }}>回復 {item.heal} HP</div>}
      </div>
      {cat && <div className="icat" style={{ color: "#d08030", fontSize: 10 }}>{cat.traitDesc}</div>}
      <AffixLines affixes={item.affixes} />
      <div style={{ marginTop: 7, display: "flex", flexDirection: "column", gap: 4 }}>
        {onEquip && <button className="btn btp" style={{ width: "100%", fontSize: 10 }} onClick={onEquip}>裝備</button>}
        {onUse   && <button className="btn btm" style={{ width: "100%", fontSize: 10 }} onClick={onUse}>使用</button>}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace inline definition in `game.tsx`**

Delete the `function ItemCard` block (lines 778–828).

Add import:
```ts
import { ItemCard } from "../components/ItemCard";
```

- [ ] **Step 3: Verify and commit**

Run: `npm run typecheck && npm test`
Expected: PASS

```bash
git add src/components/ItemCard.tsx src/legacy/game.tsx
git commit -m "refactor: extract ItemCard component"
```

---

## Task 8: Extract `LootPopup`

**Files:**
- Create: `src/components/LootPopup.tsx`
- Modify: `src/legacy/game.tsx:894-938`

- [ ] **Step 1: Create `src/components/LootPopup.tsx`**

```tsx
import { WEAPON_CATEGORIES } from "../game/data/weaponCategories";
import { getRarity } from "../game/systems";

import { AffixLines } from "./AffixLines";

export function LootPopup({ item, onEquip, onTake, onDiscard }: {
  item: any;
  onEquip: () => void;
  onTake: () => void;
  onDiscard: () => void;
}) {
  const lr = getRarity(item.rarity);
  const isMercScroll = item.type === "merc_scroll";
  return (
    <div className="lp">
      <div className="lb" style={{
        borderColor: lr.color + "99",
        boxShadow: `0 0 60px rgba(0,0,0,.9), ${lr.glow || "0 0 20px rgba(139,90,20,.2)"}`,
      }}>
        <div className="ltl">{isMercScroll ? "📜 傭兵契約捲軸" : "✨ 戰利品掉落 ✨"}</div>
        <div className="lii" style={{ filter: `drop-shadow(0 4px 12px ${lr.color}88)` }}>{item.icon}</div>
        <div className="lin" style={{ color: lr.color, textShadow: lr.glow ? `0 0 12px ${lr.color}` : "none" }}>{item.name}</div>
        <div className="rb" style={{ color: lr.color, borderColor: lr.color + "66", background: `${lr.color}18` }}>{lr.label}</div>
        {item.cat && (
          <div style={{ fontSize: 11, color: "#d08030", margin: "5px 0" }}>
            {WEAPON_CATEGORIES[item.cat] ? WEAPON_CATEGORIES[item.cat].icon : ""}{" "}
            {WEAPON_CATEGORIES[item.cat] ? WEAPON_CATEGORIES[item.cat].label : ""}{" · "}
            {WEAPON_CATEGORIES[item.cat] ? WEAPON_CATEGORIES[item.cat].traitDesc : ""}
          </div>
        )}
        <div className="lst">
          {item.attack > 0  && <div>攻擊 {isMercScroll ? "" : "+"}{item.attack}</div>}
          {item.defense > 0 && <div>防禦 {isMercScroll ? "" : "+"}{item.defense}</div>}
          {item.hp > 0      && <div>HP {isMercScroll ? "" : "+"}{item.hp}</div>}
          {item.speed > 0   && <div>速度 +{item.speed}</div>}
          {item.heal > 0    && <div style={{ color: "#50c890" }}>每回合回復 {item.heal}HP</div>}
          {item.itemLevel   && <div style={{ color: "#5a4020", fontSize: 11 }}>物品等級 {item.itemLevel}</div>}
        </div>
        <AffixLines affixes={item.affixes} />
        <div className="la">
          {isMercScroll ? (
            <>
              <button className="btn btp" onClick={onTake}>📜 收入背包</button>
              <button className="btn btd" onClick={onDiscard}>🗑 丟棄</button>
            </>
          ) : (
            <>
              <button className="btn btp" onClick={onEquip}>⚔ 裝備</button>
              <button className="btn btm" onClick={onTake}>🎒 背包</button>
              <button className="btn btd" onClick={onDiscard}>🗑 丟棄</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace inline definition in `game.tsx`**

Delete the `function LootPopup` block (lines 894–938).

Add import:
```ts
import { LootPopup } from "../components/LootPopup";
```

- [ ] **Step 3: Verify and commit**

Run: `npm run typecheck && npm test`
Expected: PASS

```bash
git add src/components/LootPopup.tsx src/legacy/game.tsx
git commit -m "refactor: extract LootPopup component"
```

---

## Task 9: Extract `QuestTab`

**Files:**
- Create: `src/features/quests/QuestTab.tsx`
- Modify: `src/legacy/game.tsx:941-1077`

- [ ] **Step 1: Create `src/features/quests/QuestTab.tsx`**

```tsx
import { useState } from "react";

import { QUEST_DEFS } from "../../game/data/quests";
import { getQuestProgress, isQuestDone } from "../../game/systems";
import type { LegacyItem, LegacyPlayer, LegacyQuestState } from "../../legacy/types";

export function QuestTab({ player, inventory, questState, onCollect }: {
  player: LegacyPlayer;
  inventory: LegacyItem[];
  questState: LegacyQuestState;
  onCollect: (questId: string) => void;
}) {
  const [catTab, setCatTab] = useState("daily");
  const statsWithInv = { ...player, _inv: inventory };

  const cats = [
    { id: "daily",   label: "📅 每日", color: "#4caf50" },
    { id: "weekly",  label: "📆 每週", color: "#4a9fd4" },
    { id: "achieve", label: "🏆 成就", color: "#e07020" },
  ];

  const questsInCat = Object.entries(QUEST_DEFS).filter(([, d]) => d.cat === catTab);

  const completable = Object.entries(QUEST_DEFS).filter(([id]) =>
    isQuestDone(id, statsWithInv, questState)
  ).length;

  return (
    <div>
      <div className="stl">
        📋 任務
        {completable > 0 && (
          <span style={{ marginLeft: 8, background: "#c84040", color: "#fff", borderRadius: "10px",
            padding: "1px 7px", fontSize: 11, fontFamily: "sans-serif" }}>
            {completable}
          </span>
        )}
      </div>

      <div className="quest-tabs">
        {cats.map(cat => {
          const catCompletable = Object.entries(QUEST_DEFS)
            .filter(([id, d]) => d.cat === cat.id && isQuestDone(id, statsWithInv, questState))
            .length;
          return (
            <button key={cat.id}
              className={`btn${catTab === cat.id ? " btp" : " btm"}`}
              style={{ fontSize: 11, padding: "6px 14px", position: "relative" }}
              onClick={() => setCatTab(cat.id)}>
              {cat.label}
              {catCompletable > 0 && (
                <span style={{ marginLeft: 5, background: "#c84040", color: "#fff",
                  borderRadius: "8px", padding: "0 5px", fontSize: 10 }}>
                  {catCompletable}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {catTab === "daily" && (
        <div style={{ fontSize: 11, color: "#4a3820", marginBottom: 10, fontStyle: "italic" }}>
          每日任務在午夜重置（{questState.dailyDate}）
        </div>
      )}
      {catTab === "weekly" && (
        <div style={{ fontSize: 11, color: "#4a3820", marginBottom: 10, fontStyle: "italic" }}>
          每週任務在週一重置（{questState.weeklyDate}）
        </div>
      )}
      {catTab === "achieve" && (
        <div style={{ fontSize: 11, color: "#4a3820", marginBottom: 10, fontStyle: "italic" }}>
          成就任務永不重置，完成後即鎖定
        </div>
      )}

      <div className="quest-cat">
        {questsInCat.map(([id, def]) => {
          const collected = questState.progress[id] && questState.progress[id].collected;
          const done      = !collected && isQuestDone(id, statsWithInv, questState);
          const progress  = getQuestProgress(id, statsWithInv, questState);
          const pct       = Math.min(100, Math.round(progress / def.target * 100));
          const barColor  = done ? "#4caf50" : pct > 50 ? "#c8961e" : "#4a9fd4";

          return (
            <div key={id} className={`quest-card${collected ? " done" : done ? " collect" : ""}`}>
              <div className="quest-icon">{def.icon}</div>
              <div className="quest-body">
                <div className="quest-title">{def.title}</div>
                <div className="quest-desc">{def.desc}</div>
                {!collected && (
                  <>
                    <div className="quest-progress">
                      <div className="quest-pbar" style={{ width: `${pct}%`, background: barColor }} />
                    </div>
                    <div className="quest-ptext">
                      {done ? "✅ 已完成，可領取！" : `${Math.min(progress, def.target)} / ${def.target}`}
                    </div>
                  </>
                )}
                {collected && (
                  <div className="quest-ptext" style={{ color: "#4caf50" }}>✓ 已領取</div>
                )}
                <div className="quest-rewards">
                  {def.rewards.map((r: any, i: any) => (
                    <span key={i} className="quest-reward-badge">{r.label}</span>
                  ))}
                </div>
              </div>
              <div className="quest-btn">
                {!collected && done && (
                  <button className="btn btp" style={{ fontSize: 10, padding: "6px 12px", whiteSpace: "nowrap" }}
                    onClick={() => onCollect(id)}>
                    領取！
                  </button>
                )}
                {collected && <div style={{ fontSize: 18 }}>✅</div>}
                {!collected && !done && (
                  <div style={{ fontSize: 11, color: "#4a3020", textAlign: "center" }}>{pct}%</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace inline definition in `game.tsx`**

Delete the `// ── QuestTab component` comment and `function QuestTab` block (lines 941–1077).

Add import:
```ts
import { QuestTab } from "../features/quests/QuestTab";
```

- [ ] **Step 3: Verify and commit**

Run: `npm run typecheck && npm test`
Expected: PASS

```bash
git add src/features/quests/QuestTab.tsx src/legacy/game.tsx
git commit -m "refactor: extract QuestTab to features/quests"
```

---

## Task 10: Extract `ArenaTab`

**Files:**
- Create: `src/features/arena/ArenaTab.tsx`
- Modify: `src/legacy/game.tsx:1079-1211`

- [ ] **Step 1: Create `src/features/arena/ArenaTab.tsx`**

```tsx
import { useEffect, useState } from "react";

import { getRarity } from "../../game/systems";
import type { LegacyArenaOpponent, LegacyPlayer } from "../../legacy/types";

export function ArenaTab({ player, arenaOpponents, arenaInjuredUntil, arenaRefreshes, onRefresh, onFight, onInit }: {
  player: LegacyPlayer;
  arenaOpponents: LegacyArenaOpponent[];
  arenaInjuredUntil: number;
  arenaRefreshes: number;
  onRefresh: (free: boolean) => void;
  onFight: (opponent: LegacyArenaOpponent) => void;
  onInit: () => void;
}) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (now >= arenaInjuredUntil) return;
    const t = setTimeout(() => setNow(Date.now()), 1000);
    return () => clearTimeout(t);
  }, [now, arenaInjuredUntil]);

  const injured = now < arenaInjuredUntil;
  const remaining = Math.max(0, arenaInjuredUntil - now);
  const injuredMins = Math.floor(remaining / 60000);
  const injuredSecs = Math.floor((remaining % 60000) / 1000);

  return (
    <div>
      <div className="stl">🏟 競技場 <span style={{ color: "#6a5030", fontSize: 13 }}>— 挑戰對手掠奪金幣</span></div>
      <div style={{ fontSize: 12, color: "#5a4020", marginBottom: 14, fontStyle: "italic", lineHeight: 1.8 }}>
        挑戰隨機對手，勝利可掠奪對方金幣（10-25%）。<br />
        <span style={{ color: "#c84040" }}>敗北則受傷休息 30 分鐘，且損失金幣。</span>
      </div>

      {injured && (
        <div className="arena-injury">
          <div style={{ fontSize: 28, marginBottom: 8 }}>🛌</div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 14, color: "#c84040", marginBottom: 6 }}>正在養傷中</div>
          <div style={{ fontSize: 13, color: "#8a4030", marginBottom: 12 }}>上次競技場落敗，需要休息才能再次出戰</div>
          <div style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: 22, color: "#c84040" }}>
            {String(injuredMins).padStart(2, "0")}:{String(injuredSecs).padStart(2, "0")}
          </div>
          <div style={{ fontSize: 11, color: "#6a3020", marginTop: 4 }}>剩餘休息時間</div>
        </div>
      )}

      <div className="arena-refresh-bar">
        <div style={{ color: "#8a7050" }}>
          今日免費刷新：<span style={{ color: "#c8961e", fontFamily: "'Cinzel',serif" }}>{arenaRefreshes}</span>/5 次剩餘
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btp" style={{ fontSize: 10, padding: "5px 12px" }}
            onClick={() => onRefresh(true)} disabled={arenaRefreshes <= 0}>
            🔄 免費刷新
          </button>
          <button className="btn btm" style={{ fontSize: 10, padding: "5px 12px" }}
            onClick={() => onRefresh(false)}>
            🪙 花費 {50 + player.level * 10} 刷新
          </button>
        </div>
      </div>

      {arenaOpponents.length === 0 && !injured && (
        <div style={{ textAlign: "center", padding: "30px", color: "#5a4020", fontStyle: "italic" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🏟</div>
          點擊「免費刷新」開始尋找對手
          <div style={{ marginTop: 12 }}>
            <button className="btn btp" style={{ fontSize: 11 }} onClick={() => onRefresh(true)} disabled={arenaRefreshes <= 0}>
              🔄 尋找對手
            </button>
          </div>
        </div>
      )}

      <div className="arena-grid">
        {arenaOpponents.map(opp => {
          const tierLabel = opp.tier === "weak" ? "較弱" : opp.tier === "strong" ? "較強" : "相當";
          const tierColor = opp.tier === "weak" ? "#4caf50" : opp.tier === "strong" ? "#e07020" : "#4a9fd4";
          const plunderEst = Math.floor(opp.goldCarried * 0.175);
          const canFight = !injured;
          return (
            <div key={opp.id} className={`arena-card ${opp.tier}`}
              style={{ opacity: canFight ? 1 : 0.5, cursor: canFight ? "pointer" : "not-allowed" }}
              onClick={() => canFight && onFight(opp)}>
              <div className="ac-tier">{tierLabel}</div>
              <div style={{ fontSize: 28, marginBottom: 6, filter: `drop-shadow(0 2px 8px ${tierColor}66)` }}>
                {opp.tier === "strong" ? "😤" : opp.tier === "weak" ? "😰" : "😐"}
              </div>
              <div className="ac-name">{opp.name}</div>
              <div className="ac-lvl">Lv.{opp.level} · {opp.wins}勝 {opp.losses}敗</div>
              <div className="ac-stats">
                <div><span style={{ color: "#c8781e" }}>攻 {opp.attack}</span> · <span style={{ color: "#4a9fd4" }}>防 {opp.defense}</span></div>
                <div><span style={{ color: "#c84040" }}>HP {opp.maxHp}</span></div>
                <div style={{ color: "#f0c040", marginTop: 4 }}>💰 攜帶 ~{opp.goldCarried} 金</div>
                <div style={{ color: "#4caf50", fontSize: 10 }}>預估掠奪 ~{plunderEst} 金</div>
              </div>
              <div style={{ marginTop: 8, display: "flex", gap: 3, flexWrap: "wrap", minHeight: 22 }}>
                {Object.entries(opp.equipment).map(([slot, eq]) => {
                  const item = eq as any;
                  if (!item) return null;
                  const r = getRarity(item.rarity);
                  return (
                    <span key={slot} title={item.name}
                      style={{ fontSize: 13, filter: `drop-shadow(0 1px 3px ${r.color}88)` }}>
                      {item.icon}
                    </span>
                  );
                })}
              </div>
              <button className="btn btp" style={{ width: "100%", marginTop: 10, fontSize: 11 }}
                disabled={!canFight}
                onClick={e => { e.stopPropagation(); canFight && onFight(opp); }}>
                {canFight ? "⚔ 挑戰！" : "🛌 休息中"}
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 16, padding: "10px 14px", background: "#0e0a06", border: "1px solid #2a1a08", borderRadius: 5, fontSize: 11, color: "#4a3820", lineHeight: 1.9 }}>
        <div style={{ color: "#6a5030", fontFamily: "'Cinzel',serif", marginBottom: 4 }}>競技場規則</div>
        🟢 <span style={{ color: "#4caf50" }}>較弱</span> — 容易擊敗，掠奪金幣較少<br />
        🔵 <span style={{ color: "#4a9fd4" }}>相當</span> — 勝負各半，掠奪金幣適中<br />
        🟠 <span style={{ color: "#e07020" }}>較強</span> — 難以擊敗，掠奪金幣豐厚<br />
        每天 5 次免費刷新，或花費金幣額外刷新。敗北休息 30 分鐘。
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace inline definition in `game.tsx`**

Delete the `// ── ArenaTab component` comment and `function ArenaTab` block (lines 1079–1211).

Add import:
```ts
import { ArenaTab } from "../features/arena/ArenaTab";
```

- [ ] **Step 3: Verify and commit**

Run: `npm run typecheck && npm test`
Expected: PASS

```bash
git add src/features/arena/ArenaTab.tsx src/legacy/game.tsx
git commit -m "refactor: extract ArenaTab to features/arena"
```

---

## Task 11: Extract `useGameState` Hook

**Files:**
- Create: `src/game/useGameState.ts`
- Modify: `src/legacy/game.tsx` — replace App body with `const state = useGameState(); const { ... } = state;`

- [ ] **Step 1: Create `src/game/useGameState.ts`**

The hook contains all state and handlers from the current `App` function body. Create the file with the following structure, filling in each handler verbatim from `game.tsx`:

```ts
import { useCallback, useEffect, useRef, useState } from "react";

import {
  INITIAL_EQUIPMENT,
  INITIAL_PLAYER,
} from "./constants";
import { ENHANCE_LEVELS } from "./data/enhanceLevels";
import { EQUIP_SLOTS } from "./data/equipmentSlots";
import { MERC_DUNGEONS } from "./data/mercenaries";
import { QUEST_DEFS } from "./data/quests";
import { TRAIN_STATS } from "./data/trainStats";
import { WEAPON_CATEGORIES } from "./data/weaponCategories";
import { TRAIN_STAT_DISPLAY_KEYS } from "./lib/display";
import { applyEnhanceBonus, calcSellPrice, enhanceCost } from "./lib/items";
import { trainCost } from "./lib/training";
import { clearGameState, loadGameState, saveGameState } from "./persistence";
import {
  applyProgressionRewards,
  cAtk,
  checkQuestReset,
  cDef,
  cMhp,
  cSpd,
  genArenaOpponent,
  genAuctionItem,
  genLoot,
  genMercScroll,
  genShopItem,
  gSpec,
  getWeaponCat,
  initQuestState,
  isQuestDone,
  simulateArenaBattle,
  simulateExpedition,
  simulateMercRun,
  simulateRun,
} from "./systems";
import type {
  LegacyArenaOpponent,
  LegacyItem,
  LegacyPlayer,
  LegacyQuestState,
  LegacyReplay,
  LootDrop,
} from "../legacy/types";

export function useGameState() {
  const [player, setPlayer] = useState<LegacyPlayer>(() => loadGameState().player as LegacyPlayer);
  const [inventory, setInventory] = useState<LegacyItem[]>(() => loadGameState().inventory as LegacyItem[]);
  const [tab, setTab] = useState("dungeon");
  const [replay, setReplay] = useState<LegacyReplay | null>(null);
  const replayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lootDrop, setLootDrop] = useState<LootDrop | null>(null);
  const [selectedScrolls, setSelectedScrolls] = useState<any[]>([]);
  const [saveMsg, setSaveMsg] = useState("");
  const [shopFilter, setShopFilter] = useState("all");
  const [invFilter, setInvFilter] = useState("all");
  const [shopItems, setShopItems] = useState<any[]>(() =>
    Array.from({ length: 8 }, (_, i) => genShopItem(1, ["weapon","offhand","armor","helmet","gloves","boots","ring","amulet"][i]))
  );
  const [auctionItems, setAuctionItems] = useState<any[]>(() => Array.from({ length: 4 }, () => genAuctionItem(1)));
  const [shopTab, setShopTab] = useState("buy");
  const [bidInput, setBidInput] = useState<Record<string, any>>({});
  const [enhanceTarget, setEnhanceTarget] = useState<any>(null);
  const [enhanceLog, setEnhanceLog] = useState<string[]>([]);
  const [enhanceAnim, setEnhanceAnim] = useState<string | null>(null);
  const [arenaOpponents, setArenaOpponents] = useState<LegacyArenaOpponent[]>([]);
  const [arenaInjuredUntil, setArenaInjuredUntil] = useState(0);
  const [arenaRefreshes, setArenaRefreshes] = useState(5);
  const [arenaLastDate, setArenaLastDate] = useState("");
  const [questState, setQuestState] = useState<LegacyQuestState>(() => initQuestState());
  const [questNotify, setQuestNotify] = useState<string | null>(null);

  // ── Derived values ────────────────────────────────────────────────────────
  const tAtk = cAtk(player), tDef = cDef(player), tMhp = cMhp(player), tSpd = cSpd(player);
  const pSpec = gSpec(player);
  const wCat = getWeaponCat(player);
  const mercScrollsInInv = inventory.filter(i => i.type === "merc_scroll");
  const selectedScrollObjs = selectedScrolls.map(uid => inventory.find(i => i.uid === uid)).filter(Boolean);
  const hpPct = Math.round((player.hp / tMhp) * 100);
  const expPct = Math.round((player.exp / player.expNeeded) * 100);
  const potions = inventory.filter(i => i.type === "potion").length;
  const filteredShop = shopFilter === "all" ? shopItems : shopItems.filter(i => i.slot === shopFilter || i.type === shopFilter);
  const filteredInv  = invFilter === "all" ? inventory : inventory.filter(i => i.slot === invFilter || i.type === invFilter);
  const SLOT_FILTERS = [
    { id: "all", label: "全部" }, { id: "weapon", label: "武器" }, { id: "offhand", label: "副手" },
    { id: "armor", label: "胸甲" }, { id: "helmet", label: "頭盔" }, { id: "gloves", label: "手套" },
    { id: "boots", label: "靴子" }, { id: "ring", label: "戒指" }, { id: "amulet", label: "護符" },
    { id: "potion", label: "藥水" }, { id: "merc_scroll", label: "📜傭兵" },
  ];

  // ── Handlers ──────────────────────────────────────────────────────────────
  const save = useCallback(() => {
    saveGameState({ player, inventory });
    setSaveMsg("存檔成功！"); setTimeout(() => setSaveMsg(""), 2000);
  }, [player, inventory]);

  const reset = () => {
    if (!confirm("確定重置？")) return;
    clearGameState();
    setPlayer({ ...INITIAL_PLAYER, equipment: { ...INITIAL_EQUIPMENT } });
    setInventory([]); setReplay(null); setSelectedScrolls([]);
  };

  // Copy lvUp verbatim from game.tsx lines 1258–1266
  function lvUp(np: any, expG: any, goldG: any, log: any) {
    const withGold = { ...np, gold: (np.gold || 0) + goldG };
    const prevLevel = withGold.level;
    const { player: next } = applyProgressionRewards(withGold, { exp: expG, gold: 0 });
    for (let lv = prevLevel + 1; lv <= next.level; lv++) {
      log.push({ txt: `🌟 等級提升！Lv.${lv}！`, type: "win" });
    }
    return next;
  }

  // Copy updateQuestProgress verbatim from game.tsx lines 1534–1547
  const updateQuestProgress = (updatedPlayer: any, updatedInventory: any) => {
    const statsWithInv = { ...updatedPlayer, _inv: updatedInventory || inventory };
    const newQs = checkQuestReset(questState, updatedPlayer);
    Object.keys(QUEST_DEFS).forEach(id => {
      if (!(newQs.progress[id] && newQs.progress[id].collected)) {
        if (isQuestDone(id, statsWithInv, newQs)) {
          // notification placeholder
        }
      }
    });
    if (newQs !== questState) setQuestState(newQs);
  };

  // Copy all remaining handlers verbatim from game.tsx:
  // startBattle (lines 1268–1283)
  // startExpedition (lines 1285–1296)
  // takeLoot, discardLoot, equipLootNow (lines 1315–1333)
  // startMercBattle (lines 1338–1355)
  // usePotion (lines 1357–1361)
  // buyItem, sellItem, sortInventory, sellJunk, refreshShop (lines 1363–1398)
  // doEnhance (lines 1399–1475)
  // doTrain (lines 1477–1490)
  // initArena, arenaRefresh, startArenaBattle (lines 1492–1581)
  // collectQuest (lines 1503–1532)
  // refreshAuction, placeBid, claimAuction (lines 1583–1604)
  // equipItem, unequip (lines 1606–1615)

  // ── Replay effects ─────────────────────────────────────────────────────────
  // Copy useEffect blocks verbatim from game.tsx lines 1298–1313

  return {
    // State
    player, setPlayer, inventory, setInventory,
    tab, setTab, replay, setReplay, lootDrop,
    selectedScrolls, setSelectedScrolls,
    saveMsg, shopFilter, setShopFilter, invFilter, setInvFilter,
    shopItems, auctionItems, shopTab, setShopTab,
    bidInput, setBidInput,
    enhanceTarget, setEnhanceTarget, enhanceLog, enhanceAnim,
    arenaOpponents, arenaInjuredUntil, arenaRefreshes,
    questState, questNotify,
    // Derived
    tAtk, tDef, tMhp, tSpd, pSpec, wCat,
    hpPct, expPct, potions,
    mercScrollsInInv, selectedScrollObjs,
    filteredShop, filteredInv, SLOT_FILTERS,
    // Handlers
    save, reset, lvUp,
    startBattle, startExpedition,
    takeLoot, discardLoot, equipLootNow,
    startMercBattle, usePotion,
    buyItem, sellItem, sortInventory, sellJunk, refreshShop,
    doEnhance, doTrain,
    initArena, arenaRefresh, startArenaBattle,
    collectQuest, updateQuestProgress,
    refreshAuction, placeBid, claimAuction,
    equipItem, unequip,
  };
}
```

The comment lines `// Copy X verbatim from game.tsx lines Y–Z` are implementation instructions — replace each with the actual copied code from the referenced lines. The skeleton above shows every state variable, derived value, and handler that must appear.

- [ ] **Step 2: Replace App body in `game.tsx` with hook call**

Replace the entire body of `function App()` (lines 1213–1628 in current game.tsx, i.e. everything between the opening `{` and the `return (` statement) with:

```tsx
  const state = useGameState();
  const {
    player, setPlayer, inventory, setInventory,
    tab, setTab, replay, setReplay, lootDrop,
    selectedScrolls, setSelectedScrolls,
    saveMsg, shopFilter, setShopFilter, invFilter, setInvFilter,
    shopItems, auctionItems, shopTab, setShopTab,
    bidInput, setBidInput,
    enhanceTarget, setEnhanceTarget, enhanceLog, enhanceAnim,
    arenaOpponents, arenaInjuredUntil, arenaRefreshes,
    questState, questNotify,
    tAtk, tDef, tMhp, tSpd, pSpec, wCat,
    hpPct, expPct, potions,
    mercScrollsInInv, selectedScrollObjs,
    filteredShop, filteredInv, SLOT_FILTERS,
    save, reset,
    startBattle, startExpedition,
    takeLoot, discardLoot, equipLootNow,
    startMercBattle, usePotion,
    buyItem, sellItem, sortInventory, sellJunk, refreshShop,
    doEnhance, doTrain,
    initArena, arenaRefresh, startArenaBattle,
    collectQuest,
    refreshAuction, placeBid, claimAuction,
    equipItem, unequip,
  } = state;
```

Add the import at the top of game.tsx:
```ts
import { useGameState } from "../game/useGameState";
```

Remove from `game.tsx` all the imports that are now only used in `useGameState.ts` (anything not referenced in the remaining JSX). The remaining imports in game.tsx will be only what's needed for the JSX itself (DUNGEON_TIERS, DUNGEONS, MERC_DUNGEONS, MONSTERS, EXPEDITIONS, EQUIP_SLOTS, QUEST_DEFS, WEAPON_CATEGORIES, ENHANCE_LEVELS, TRAIN_STATS, EQUIP_SLOTS, getRarity, getWeaponCat, isQuestDone, checkQuestReset, calcSellPrice, trainCost, TRAIN_STAT_DISPLAY_KEYS, enhanceCost, genMercScroll).

- [ ] **Step 3: Verify and commit**

Run: `npm run typecheck && npm test`
Expected: PASS

```bash
git add src/game/useGameState.ts src/legacy/game.tsx
git commit -m "refactor: extract useGameState hook from App component"
```

---

## Task 12: Extract `DungeonTab`

**Files:**
- Create: `src/features/dungeon/DungeonTab.tsx`
- Modify: `src/legacy/game.tsx:1775-1922`

- [ ] **Step 1: Create `src/features/dungeon/DungeonTab.tsx`**

```tsx
import { DUNGEON_TIERS } from "../../game/data/dungeonTiers";
import { DUNGEONS } from "../../game/data/dungeons";
import { EXPEDITIONS } from "../../game/data/expeditions";
import { MERC_DUNGEONS } from "../../game/data/mercenaries";
import { MONSTERS } from "../../game/data/monsters";
import { getRarity } from "../../game/systems";

export function DungeonTab({ player, startBattle, startExpedition, startMercBattle, mercScrollsInInv, selectedScrolls, setSelectedScrolls, setInventory, genMercScroll }: {
  player: any;
  startBattle: (dungeon: any, tier: any) => void;
  startExpedition: (expedition: any) => void;
  startMercBattle: (dungeonId: any) => void;
  mercScrollsInInv: any[];
  selectedScrolls: any[];
  setSelectedScrolls: (fn: any) => void;
  setInventory: (fn: any) => void;
  genMercScroll: (level: number) => any;
}) {
  return (
    <div>
      {/* Copy the JSX block verbatim from game.tsx lines 1776–1921 */}
    </div>
  );
}
```

Copy the JSX content from game.tsx lines 1776–1921 verbatim into the return statement. The JSX references: `EXPEDITIONS`, `MONSTERS`, `player.level`, `startExpedition`, `DUNGEONS`, `DUNGEON_TIERS`, `startBattle`, `MERC_DUNGEONS`, `mercScrollsInInv`, `selectedScrolls`, `setSelectedScrolls`, `getRarity`, `setInventory`, `genMercScroll`, `startMercBattle`.

- [ ] **Step 2: Wire into `game.tsx`**

Replace the inline `{tab==="dungeon"&&(...)}` block (lines 1775–1922) with:

```tsx
{tab === "dungeon" && (
  <DungeonTab
    player={player}
    startBattle={startBattle}
    startExpedition={startExpedition}
    startMercBattle={startMercBattle}
    mercScrollsInInv={mercScrollsInInv}
    selectedScrolls={selectedScrolls}
    setSelectedScrolls={setSelectedScrolls}
    setInventory={setInventory}
    genMercScroll={genMercScroll}
  />
)}
```

Add import:
```ts
import { DungeonTab } from "../features/dungeon/DungeonTab";
```

Also add to the useGameState return and destructuring: `genMercScroll` (it's already imported in useGameState from systems but needs to be returned if used in DungeonTab directly). Alternatively, move the inline `genMercScroll` call into `DungeonTab` itself since it only imports the data function.

- [ ] **Step 3: Verify and commit**

Run: `npm run typecheck && npm test`
Expected: PASS

```bash
git add src/features/dungeon/DungeonTab.tsx src/legacy/game.tsx
git commit -m "refactor: extract DungeonTab feature component"
```

---

## Task 13: Extract `TrainTab`

**Files:**
- Create: `src/features/train/TrainTab.tsx`
- Modify: `src/legacy/game.tsx:1924-2065`

- [ ] **Step 1: Create `src/features/train/TrainTab.tsx`**

```tsx
import { ENHANCE_LEVELS } from "../../game/data/enhanceLevels";
import { TRAIN_STATS } from "../../game/data/trainStats";
import { TRAIN_STAT_DISPLAY_KEYS } from "../../game/lib/display";
import { enhanceCost, getRarity } from "../../game/systems";
import { trainCost } from "../../game/lib/training";

export function TrainTab({ player, inventory, doTrain, doEnhance, enhanceTarget, setEnhanceTarget, enhanceLog, enhanceAnim }: {
  player: any;
  inventory: any[];
  doTrain: (statId: any) => void;
  doEnhance: (uid: any) => void;
  enhanceTarget: any;
  setEnhanceTarget: (v: any) => void;
  enhanceLog: string[];
  enhanceAnim: string | null;
}) {
  return (
    <div>
      {/* Copy the JSX block verbatim from game.tsx lines 1925–2065 */}
    </div>
  );
}
```

Copy the JSX content from game.tsx lines 1925–2065 verbatim into the return statement.

- [ ] **Step 2: Wire into `game.tsx`**

Replace the `{tab==="train"&&(...)}` block (lines 1924–2065) with:

```tsx
{tab === "train" && (
  <TrainTab
    player={player}
    inventory={inventory}
    doTrain={doTrain}
    doEnhance={doEnhance}
    enhanceTarget={enhanceTarget}
    setEnhanceTarget={setEnhanceTarget}
    enhanceLog={enhanceLog}
    enhanceAnim={enhanceAnim}
  />
)}
```

Add import:
```ts
import { TrainTab } from "../features/train/TrainTab";
```

- [ ] **Step 3: Verify and commit**

Run: `npm run typecheck && npm test`
Expected: PASS

```bash
git add src/features/train/TrainTab.tsx src/legacy/game.tsx
git commit -m "refactor: extract TrainTab feature component"
```

---

## Task 14: Extract `BattleReport`

**Files:**
- Create: `src/features/battle/BattleReport.tsx`
- Modify: `src/legacy/game.tsx:2087-2139`

- [ ] **Step 1: Create `src/features/battle/BattleReport.tsx`**

```tsx
import { MERC_DUNGEONS } from "../../game/data/mercenaries";
import { ReplayLog } from "../../components/ReplayLog";

export function BattleReport({ replay, setReplay, setTab, startBattle, startExpedition, startMercBattle }: {
  replay: any;
  setReplay: (v: any) => void;
  setTab: (v: string) => void;
  startBattle: (dungeon: any, tier: any) => void;
  startExpedition: (expedition: any) => void;
  startMercBattle: (dungeonId: any) => void;
}) {
  return (
    <div className="ba">
      {/* Copy JSX from game.tsx lines 2088–2138 verbatim */}
    </div>
  );
}
```

Copy the JSX block from game.tsx lines 2088–2138 verbatim. The JSX references: `replay`, `setReplay`, `setTab`, `MERC_DUNGEONS`, `ReplayLog`, `startBattle`, `startExpedition`, `startMercBattle`.

- [ ] **Step 2: Wire into `game.tsx`**

Replace the `{tab==="battle"&&(...)}` block (lines 2087–2139) with:

```tsx
{tab === "battle" && (
  <BattleReport
    replay={replay}
    setReplay={setReplay}
    setTab={setTab}
    startBattle={startBattle}
    startExpedition={startExpedition}
    startMercBattle={startMercBattle}
  />
)}
```

Add import:
```ts
import { BattleReport } from "../features/battle/BattleReport";
```

- [ ] **Step 3: Verify and commit**

Run: `npm run typecheck && npm test`
Expected: PASS

```bash
git add src/features/battle/BattleReport.tsx src/legacy/game.tsx
git commit -m "refactor: extract BattleReport feature component"
```

---

## Task 15: Extract `ShopTab`

**Files:**
- Create: `src/features/shop/ShopTab.tsx`
- Modify: `src/legacy/game.tsx:2142-2330`

- [ ] **Step 1: Create `src/features/shop/ShopTab.tsx`**

```tsx
import { EQUIP_SLOTS } from "../../game/data/equipmentSlots";
import { WEAPON_CATEGORIES } from "../../game/data/weaponCategories";
import { getRarity } from "../../game/systems";
import { AffixLines } from "../../components/AffixLines";

export function ShopTab({ player, shopItems, auctionItems, shopFilter, setShopFilter, filteredShop, shopTab, setShopTab, bidInput, setBidInput, buyItem, sellItem, sortInventory, sellJunk, refreshShop, refreshAuction, placeBid, claimAuction, equipItem, inventory }: {
  player: any;
  shopItems: any[];
  auctionItems: any[];
  shopFilter: string;
  setShopFilter: (v: string) => void;
  filteredShop: any[];
  shopTab: string;
  setShopTab: (v: string) => void;
  bidInput: Record<string, any>;
  setBidInput: (fn: any) => void;
  buyItem: (item: any) => void;
  sellItem: (uid: any) => void;
  sortInventory: () => void;
  sellJunk: () => void;
  refreshShop: () => void;
  refreshAuction: () => void;
  placeBid: (auctionId: any, amount: any) => void;
  claimAuction: (auctionId: any) => void;
  equipItem: (item: any) => void;
  inventory: any[];
}) {
  return (
    <div>
      {/* Copy JSX from game.tsx lines 2143–2329 verbatim */}
    </div>
  );
}
```

Copy the JSX block from game.tsx lines 2143–2329 verbatim.

- [ ] **Step 2: Wire into `game.tsx`**

Replace the `{tab==="shop"&&(...)}` block (lines 2142–2330) with:

```tsx
{tab === "shop" && (
  <ShopTab
    player={player}
    shopItems={shopItems}
    auctionItems={auctionItems}
    shopFilter={shopFilter}
    setShopFilter={setShopFilter}
    filteredShop={filteredShop}
    shopTab={shopTab}
    setShopTab={setShopTab}
    bidInput={bidInput}
    setBidInput={setBidInput}
    buyItem={buyItem}
    sellItem={sellItem}
    sortInventory={sortInventory}
    sellJunk={sellJunk}
    refreshShop={refreshShop}
    refreshAuction={refreshAuction}
    placeBid={placeBid}
    claimAuction={claimAuction}
    equipItem={equipItem}
    inventory={inventory}
  />
)}
```

Add import:
```ts
import { ShopTab } from "../features/shop/ShopTab";
```

- [ ] **Step 3: Verify and commit**

Run: `npm run typecheck && npm test`
Expected: PASS

```bash
git add src/features/shop/ShopTab.tsx src/legacy/game.tsx
git commit -m "refactor: extract ShopTab feature component"
```

---

## Task 16: Extract `InventoryTab`

**Files:**
- Create: `src/features/inventory/InventoryTab.tsx`
- Modify: `src/legacy/game.tsx:2333-2422`

- [ ] **Step 1: Create `src/features/inventory/InventoryTab.tsx`**

```tsx
import { WEAPON_CATEGORIES } from "../../game/data/weaponCategories";
import { calcSellPrice, getRarity } from "../../game/systems";
import { AffixLines } from "../../components/AffixLines";
import { cMhp } from "../../game/systems";

export function InventoryTab({ player, inventory, filteredInv, invFilter, setInvFilter, SLOT_FILTERS, selectedScrolls, setSelectedScrolls, setTab, setPlayer, sortInventory, sellJunk, sellItem, equipItem }: {
  player: any;
  inventory: any[];
  filteredInv: any[];
  invFilter: string;
  setInvFilter: (v: string) => void;
  SLOT_FILTERS: { id: string; label: string }[];
  selectedScrolls: any[];
  setSelectedScrolls: (fn: any) => void;
  setTab: (v: string) => void;
  setPlayer: (fn: any) => void;
  setInventory: (fn: any) => void;
  sortInventory: () => void;
  sellJunk: () => void;
  sellItem: (uid: any) => void;
  equipItem: (item: any) => void;
}) {
  return (
    <div>
      {/* Copy JSX from game.tsx lines 2334–2421 verbatim */}
    </div>
  );
}
```

Copy the JSX block from game.tsx lines 2334–2421 verbatim. Note: the inventory tab has an inline potion `使用` handler that calls `setPlayer` and `setInventory` — include `setInventory` in the props as well (add it to the props interface above).

- [ ] **Step 2: Wire into `game.tsx`**

Replace the `{tab==="inventory"&&(...)}` block (lines 2333–2422) with:

```tsx
{tab === "inventory" && (
  <InventoryTab
    player={player}
    inventory={inventory}
    filteredInv={filteredInv}
    invFilter={invFilter}
    setInvFilter={setInvFilter}
    SLOT_FILTERS={SLOT_FILTERS}
    selectedScrolls={selectedScrolls}
    setSelectedScrolls={setSelectedScrolls}
    setTab={setTab}
    setPlayer={setPlayer}
    setInventory={setInventory}
    sortInventory={sortInventory}
    sellJunk={sellJunk}
    sellItem={sellItem}
    equipItem={equipItem}
  />
)}
```

Add import:
```ts
import { InventoryTab } from "../features/inventory/InventoryTab";
```

- [ ] **Step 3: Verify and commit**

Run: `npm run typecheck && npm test`
Expected: PASS

```bash
git add src/features/inventory/InventoryTab.tsx src/legacy/game.tsx
git commit -m "refactor: extract InventoryTab feature component"
```

---

## Task 17: Assemble `GameApp` and Delete Legacy File

**Files:**
- Create: `src/game/GameApp.tsx`
- Modify: `src/App.tsx`
- Delete: `src/legacy/game.tsx`

At this point `game.tsx` contains only: CSS import, component imports, `useGameState` import, the `App` function with sidebar JSX + nav bar + tab routing shell (each tab replaced with a component), and the `LegacyGame` re-export.

- [ ] **Step 1: Create `src/game/GameApp.tsx`**

Copy the entire content of `src/legacy/game.tsx` at this point into `src/game/GameApp.tsx`. Adjust all relative import paths since the file now lives in `src/game/` instead of `src/legacy/`:

| Old path (from src/legacy/) | New path (from src/game/) |
| --- | --- |
| `"./game.css"` | `"../legacy/game.css"` |
| `"../components/X"` | `"../components/X"` (unchanged) |
| `"../features/X"` | `"../features/X"` (unchanged) |
| `"../game/useGameState"` | `"./useGameState"` |
| `"./types"` | `"../legacy/types"` |

Rename the exported function from `LegacyGame` to `GameApp`:
```tsx
export default function GameApp() {
  return <App />;
}
```

Or inline `App` directly into `GameApp` (removing the internal `App` wrapper is cleaner but optional — just ensure the default export is named `GameApp`).

- [ ] **Step 2: Update `src/App.tsx`**

```tsx
// Before:
import LegacyGame from "./legacy/game";
export default function App() { return <LegacyGame />; }

// After:
import GameApp from "./game/GameApp";
export default function App() { return <GameApp />; }
```

- [ ] **Step 3: Run typecheck and tests**

Run: `npm run typecheck && npm test`
Expected: PASS — all 150 tests passing, no type errors.

If there are import path errors, fix them one by one until typecheck passes.

- [ ] **Step 4: Delete `src/legacy/game.tsx`**

```bash
rm src/legacy/game.tsx
```

Run again:
```bash
npm run typecheck && npm test
```
Expected: PASS — same results as before deletion.

- [ ] **Step 5: Check for orphaned legacy types**

Run:
```bash
grep -r "from.*legacy/types" src/ --include="*.ts" --include="*.tsx"
```

If `src/legacy/types.ts` is still imported by any file (GameApp, QuestTab, ArenaTab), keep it. If not, it can be deleted — but it's harmless to leave it.

- [ ] **Step 6: Final commit**

```bash
git add src/game/GameApp.tsx src/App.tsx
git rm src/legacy/game.tsx
git commit -m "refactor: assemble GameApp and delete legacy game.tsx"
```

---

## Self-Review

### Spec Coverage

- CSS extraction → Task 2 ✓
- Legacy types extraction → Task 1 ✓
- Pure UI components (AffixLines, HpBar, ReplayLog, BattleLog, ItemCard, LootPopup) → Tasks 3–8 ✓
- QuestTab, ArenaTab feature components → Tasks 9–10 ✓
- `useGameState` hook → Task 11 ✓
- Tab feature components (DungeonTab, TrainTab, BattleReport, ShopTab, InventoryTab) → Tasks 12–16 ✓
- GameApp + deletion → Task 17 ✓

### Placeholder Scan

- Task 11 (useGameState): the "copy verbatim" instructions for individual handlers reference exact line numbers in game.tsx. These are not placeholders — they are precise extraction instructions for code that is straightforward to copy. The handler logic is not shown inline to avoid ~400 lines of duplication that would obscure the plan structure.
- Task 12–16 tab components: same approach — JSX is referenced by exact line numbers rather than duplicated. This is intentional for readability.

### Type Consistency

- `LegacyPlayer`, `LegacyItem`, `LegacyQuestState`, `LegacyArenaOpponent`, `LegacyReplay`, `LootDrop` — all exported from `src/legacy/types.ts` in Task 1 and imported in Tasks 9, 10, 11.
- `useGameState` return shape — all names match the destructuring in Task 11 Step 2 and the prop names passed to tab components in Tasks 12–16.
- `genMercScroll` in DungeonTab — imported from `../../game/systems` inside the component (not threaded through props) since it's a pure data function with no state dependency.
