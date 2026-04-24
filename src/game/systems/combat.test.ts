import { afterEach, describe, expect, it, vi } from "vitest";

import { WEAPON_CATEGORIES } from "../data/weaponCategories";
import {
  applySpec,
  applyWeaponTrait,
  buildEnemy,
  cAtk,
  cDef,
  cMhp,
  cSpd,
  fightMonster,
  gSpec,
  getWeaponCat,
  runCombat,
  simulateArenaBattle,
  simulateExpedition,
  simulateMercRun,
  simulateRun,
  sumEq,
} from "./combat";

function mockRandomSequence(values: number[]) {
  let index = 0;

  return vi.spyOn(Math, "random").mockImplementation(() => {
    const value = values[index];
    index += 1;
    return value ?? 0;
  });
}

function createPlayer(overrides: Record<string, any> = {}) {
  return {
    level: 5,
    exp: 0,
    expNeeded: 100,
    hp: 100,
    maxHp: 100,
    attack: 10,
    defense: 8,
    speed: 4,
    gold: 100,
    trainedAtk: 2,
    trainedDef: 1,
    trainedHp: 3,
    trainedSpd: 1,
    equipment: {
      weapon: null,
      offhand: null,
      armor: null,
      helmet: null,
      gloves: null,
      boots: null,
      ring: null,
      amulet: null,
    },
    ...overrides,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("combat system", () => {
  it("derives combat stats, specials, and weapon category from equipment", () => {
    const player = createPlayer({
      equipment: {
        weapon: {
          attack: 25,
          baseAttack: 25,
          enhLv: 1,
          cat: "dagger",
          specials: [{ type: "crit", val: 25 }],
        },
        offhand: null,
        armor: { hp: 20 },
        helmet: null,
        gloves: null,
        boots: { speed: 2 },
        ring: null,
        amulet: null,
      },
    });

    expect(sumEq(player, "attack")).toBe(27);
    expect(cAtk(player)).toBe(39);
    expect(cDef(player)).toBe(9);
    expect(cMhp(player)).toBe(129);
    expect(cSpd(player)).toBe(7);
    expect(gSpec(player)).toEqual([{ type: "crit", val: 25 }]);
    expect(getWeaponCat(player)).toEqual(WEAPON_CATEGORIES.dagger);
  });

  it("applies combat helper effects deterministically", () => {
    const enemy = { name: "石巨人", icon: "🪨", trait: "fire", attack: 20, defense: 8, hp: 40, maxHp: 40, burnStacks: 0, regenVal: 5 };

    vi.spyOn(Math, "random").mockReturnValue(0);

    expect(applySpec([{ type: "lifesteal", val: 20 }, { type: "crit", val: 100 }, { type: "fury", val: 5 }, { type: "pierce", val: 50 }], 10, { hp: 5, maxHp: 40 })).toEqual({
      healed: 2,
      extra: 16,
      isCrit: true,
    });
    expect(applyWeaponTrait(WEAPON_CATEGORIES.trident, 12, enemy, true, 1)).toEqual({
      finalDmg: 12,
      log: ["🩸 【三叉戟】流血層數：2"],
      newBleed: 2,
      stunned: false,
    });
  });

  it("resolves a fight through the shared monster-response helpers and persists bleed stacks", () => {
    const player = createPlayer({ hp: 90 });
    const log: any[] = [];
    const bleedRef = { val: 0 };
    const enemy = {
      name: "守護者",
      icon: "🏛️",
      hp: 35,
      maxHp: 35,
      attack: 12,
      defense: 5,
      trait: "divine",
      shielded: true,
      burnStacks: 0,
      regenVal: 0,
    };

    vi.spyOn(Math, "random").mockReturnValue(0);

    const result = fightMonster(enemy, player, 18, 9, 120, [{ type: "lifesteal", val: 10 }], WEAPON_CATEGORIES.trident, log, bleedRef);

    expect(result).toEqual({
      np: player,
      won: true,
      crits: 0,
      stuns: 0,
      totalDmgDealt: 22,
      totalDmgTaken: 3,
    });
    expect(player.hp).toBe(90);
    expect(bleedRef.val).toBe(3);
    expect(log.map((entry) => entry.txt)).toContain("🛡 🏛️守護者 的神力護盾抵擋了攻擊！");
    expect(log.map((entry) => entry.txt)).toContain("🏛️守護者 攻擊你，造成 1 傷害");
    expect(log.map((entry) => entry.txt)).toContain("🩸 流血9傷害(3層)");
  });

  it("simulates an expedition with injected reward dependencies", () => {
    const lvUp = vi.fn((player: any, expGain: number, goldGain: number) => ({
      ...player,
      exp: player.exp + expGain,
      gold: player.gold + goldGain,
    }));
    const genLoot = vi.fn(() => ({ name: "戰利品", rarityLabel: "普通" }));
    const genMercScroll = vi.fn(() => ({ name: "契約", rarityLabel: "稀有" }));
    const player = createPlayer({ attack: 30, defense: 12, hp: 120, maxHp: 120 });

    mockRandomSequence([0, 0, 0, 0, 0]);

    const result = simulateExpedition(
      { name: "狼群獵場", desc: "追獵", monster: "wolf", expMult: 1, goldMult: 1, lootBonus: 0 },
      player,
      { lvUp, genLoot, genMercScroll },
    );

    expect(result.won).toBe(true);
    expect(result.finalPlayer.exp).toBe(46);
    expect(result.finalPlayer.gold).toBe(124);
    expect(result.drops).toEqual([
      { name: "戰利品", rarityLabel: "普通" },
      { name: "契約", rarityLabel: "稀有" },
    ]);
    expect(lvUp).toHaveBeenCalledWith(expect.any(Object), 46, 24, expect.any(Array));
  });

  it("simulates a dungeon run with boss rewards", () => {
    const lvUp = vi.fn((player: any, expGain: number, goldGain: number) => ({
      ...player,
      exp: player.exp + expGain,
      gold: player.gold + goldGain,
    }));
    const genLoot = vi.fn(() => ({ name: "寶箱", rarityLabel: "普通" }));
    const genMercScroll = vi.fn(() => ({ name: "卷軸", rarityLabel: "稀有" }));
    const player = createPlayer({ attack: 40, defense: 14, hp: 140, maxHp: 140 });

    mockRandomSequence([0, 0, 0, 0, 0, 0, 0, 0]);

    const result = simulateRun(
      {
        name: "測試副本",
        lore: "簡短",
        waves: [{ label: "第一波", desc: "遭遇", monsters: ["wolf"] }],
        boss: "wolfKing",
        bossIntro: "Boss 登場",
      },
      { label: "普通", mult: 1, expMult: 1, goldMult: 1, lootBonus: 0 },
      player,
      { lvUp, genLoot, genMercScroll },
    );

    expect(result.won).toBe(true);
    expect(result.finalPlayer.exp).toBe(481);
    expect(result.finalPlayer.gold).toBe(220);
    expect(result.drops).toEqual([
      { name: "寶箱", rarityLabel: "普通" },
      { name: "寶箱", rarityLabel: "普通" },
      { name: "卷軸", rarityLabel: "稀有" },
    ]);
    expect(result.kills).toEqual([
      expect.objectContaining({ enemyId: "wolf", count: 1 }),
      expect.objectContaining({ enemyId: "wolfKing", count: 1 }),
    ]);
    expect(result.log.map((entry) => entry.txt)).toContain("👑 擊敗Boss 狼王！+435EXP +96金");
  });

  it("simulates a mercenary run with injected mercenary dungeon data", () => {
    const lvUp = vi.fn((player: any, expGain: number, goldGain: number) => ({
      ...player,
      exp: player.exp + expGain,
      gold: player.gold + goldGain,
    }));
    const genLoot = vi.fn(() => ({ name: "素材", rarityLabel: "普通" }));
    const genMercScroll = vi.fn(() => ({ name: "契約", rarityLabel: "稀有" }));
    const player = createPlayer({ attack: 35, defense: 14, hp: 150, maxHp: 150 });
    const mercs = [{ name: "治癒師", icon: "🧝", attack: 5, defense: 4, hp: 50, heal: 8 }];

    mockRandomSequence([0, 0, 0, 0, 0, 0, 0]);

    const result = simulateMercRun(
      "merc-test",
      player,
      mercs,
      {
        lvUp,
        genLoot,
        genMercScroll,
        mercDungeons: [
          {
            id: "merc-test",
            label: "傭兵測試",
            icon: "🏴",
            lvBonus: 0,
            lore: "簡短",
            waves: [{ enemies: ["wolf"], desc: "前哨", mult: 1 }],
            boss: { name: "傭兵首領", icon: "👑", hpM: 1, atkM: 1, defM: 1, trait: "armor" },
            reward: { expMult: 1.2, goldMult: 1.5, scrollBonus: 0.3 },
          },
        ],
      },
    );

    expect(result.won).toBe(true);
    expect(result.finalPlayer.exp).toBe(295);
    expect(result.finalPlayer.gold).toBe(286);
    expect(result.drops).toEqual([
      { name: "契約", rarityLabel: "稀有" },
      { name: "素材", rarityLabel: "普通" },
    ]);
    expect(result.kills).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ enemyId: "wolf", count: 1 }),
      ]),
    );
    expect(result.log.map((entry) => entry.txt)).toContain("💚治癒師回復8HP");
  });

  it("keeps regular mercenary-wave player-target attacks on legacy-simple behavior", () => {
    const lvUp = vi.fn((player: any, expGain: number, goldGain: number) => ({
      ...player,
      exp: player.exp + expGain,
      gold: player.gold + goldGain,
    }));
    const genLoot = vi.fn(() => ({ name: "素材", rarityLabel: "普通" }));
    const genMercScroll = vi.fn(() => ({ name: "契約", rarityLabel: "稀有" }));
    const player = createPlayer({ attack: 35, defense: 2, trainedDef: 0, hp: 80, maxHp: 80, trainedHp: 0 });

    mockRandomSequence([0, 0, 0, 0, 0, 0]);

    const result = simulateMercRun(
      "merc-shared-combat",
      player,
      [],
      {
        lvUp,
        genLoot,
        genMercScroll,
        mercDungeons: [
          {
            id: "merc-shared-combat",
            label: "共享戰鬥測試",
            icon: "🏴",
            lvBonus: 0,
            lore: "簡短",
            waves: [{ enemies: ["boar"], desc: "衝鋒測試", mult: 1 }],
            reward: { expMult: 1.2, goldMult: 1.5, scrollBonus: 0 },
          },
        ],
      },
    );

    expect(result.log.map((entry) => entry.txt)).toContain("野豬→你 10傷害");
    expect(result.log.map((entry) => entry.txt)).not.toContain("💥 🐗野豬 憤怒衝鋒！");
  });

  it("keeps regular mercenary-wave merc-target attacks on legacy-simple behavior", () => {
    const lvUp = vi.fn((player: any, expGain: number, goldGain: number) => ({
      ...player,
      exp: player.exp + expGain,
      gold: player.gold + goldGain,
    }));
    const genLoot = vi.fn(() => ({ name: "素材", rarityLabel: "普通" }));
    const genMercScroll = vi.fn(() => ({ name: "契約", rarityLabel: "稀有" }));
    const player = createPlayer({ attack: 5, defense: 2, trainedAtk: 0, trainedDef: 0, hp: 80, maxHp: 80, trainedHp: 0 });
    const mercs = [{ name: "盾衛", icon: "🛡️", attack: 1, defense: 10, hp: 80 }];

    mockRandomSequence([0, 0, 0, 0, 0, 0]);

    const result = simulateMercRun(
      "merc-charge-targeting",
      player,
      mercs,
      {
        lvUp,
        genLoot,
        genMercScroll,
        mercDungeons: [
          {
            id: "merc-charge-targeting",
            label: "共享衝鋒測試",
            icon: "🏴",
            lvBonus: 0,
            lore: "簡短",
            waves: [{ enemies: ["boar"], desc: "衝鋒測試", mult: 1 }],
            reward: { expMult: 1.2, goldMult: 1.5, scrollBonus: 0 },
          },
        ],
      },
    );

    expect(result.log.map((entry) => entry.txt)).toContain("野豬→盾衛 4傷害");
    expect(result.log.map((entry) => entry.txt)).not.toContain("💥 🐗野豬 憤怒衝鋒！");
  });

  it("applies healer recovery before fire burn during mercenary waves", () => {
    const lvUp = vi.fn((player: any, expGain: number, goldGain: number) => ({
      ...player,
      exp: player.exp + expGain,
      gold: player.gold + goldGain,
    }));
    const genLoot = vi.fn(() => ({ name: "素材", rarityLabel: "普通" }));
    const genMercScroll = vi.fn(() => ({ name: "契約", rarityLabel: "稀有" }));
    const player = createPlayer({ attack: 5, defense: 2, trainedAtk: 0, trainedDef: 0, hp: 70, maxHp: 80, trainedHp: 0 });
    const mercs = [{ name: "盾衛", icon: "🛡️", attack: 1, defense: 10, hp: 120 }];

    mockRandomSequence([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

    const result = simulateMercRun(
      "merc-fire-ordering",
      player,
      [...mercs, { name: "治癒師", icon: "🧝", attack: 1, defense: 4, hp: 50, heal: 8 }],
      {
        lvUp,
        genLoot,
        genMercScroll,
        mercDungeons: [
          {
            id: "merc-fire-ordering",
            label: "烈焰順序測試",
            icon: "🏴",
            lvBonus: 0,
            lore: "簡短",
            waves: [{ enemies: ["demon"], desc: "烈焰測試", mult: 1 }],
            reward: { expMult: 1.2, goldMult: 1.5, scrollBonus: 0 },
          },
        ],
      },
    );

    const logLines = result.log.map((entry) => entry.txt);
    expect(logLines).toContain("💚治癒師回復8HP");
    expect(logLines).toContain("🔥 燒傷2");
    expect(logLines.indexOf("💚治癒師回復8HP")).toBeLessThan(logLines.indexOf("🔥 燒傷2"));
  });
});

describe("runCombat", () => {
  function mockFastPlayer() {
    return createPlayer({ speed: 20, attack: 50, defense: 10, hp: 200, maxHp: 200, trainedSpd: 0 });
  }

  function mockWeakEnemy() {
    return {
      id: "slime",
      name: "史萊姆",
      attack: 1,
      defense: 0,
      hp: 5,
      maxHp: 5,
      speed: 1,
      expReward: 10,
      goldReward: 5,
      trait: null,
      isBoss: false,
    };
  }

  it("returns structured kill records", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const result = runCombat(mockFastPlayer(), mockWeakEnemy());
    expect(result.kills).toEqual([
      expect.objectContaining({ enemyId: "slime", count: 1 }),
    ]);
  });

  it("records speed-driven combat effects in result logs", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const result = runCombat(mockFastPlayer(), mockWeakEnemy());
    expect(result.log.some((entry) => entry.includes("速度"))).toBe(true);
  });
});

describe("simulateArenaBattle", () => {
  it("returns a win result with gold plundered when player is stronger", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const player = createPlayer({ attack: 100, defense: 50, hp: 500, maxHp: 500, trainedAtk: 0, trainedDef: 0, trainedHp: 0, trainedSpd: 0 });
    const opponent = {
      name: "弱雞", level: 1, tier: "weak",
      attack: 1, defense: 0, maxHp: 5, hp: 5,
      goldCarried: 200, wcKey: null,
    };
    const result = simulateArenaBattle(player, opponent);
    expect(result.won).toBe(true);
    expect(result.goldPlundered).toBeGreaterThan(0);
    expect(result.log.length).toBeGreaterThan(0);
  });

  it("returns a loss result when player is weaker", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const player = createPlayer({ attack: 1, defense: 0, hp: 5, maxHp: 5, trainedAtk: 0, trainedDef: 0, trainedHp: 0, trainedSpd: 0 });
    const opponent = {
      name: "強敵", level: 50, tier: "strong",
      attack: 999, defense: 500, maxHp: 9999, hp: 9999,
      goldCarried: 500, wcKey: null,
    };
    const result = simulateArenaBattle(player, opponent);
    expect(result.won).toBe(false);
    expect(result.goldPlundered).toBe(0);
  });
});
