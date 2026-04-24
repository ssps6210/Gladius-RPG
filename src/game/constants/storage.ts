import { EQUIPMENT_SLOT_IDS, type RuntimeEquipment, type RuntimePlayer } from "../types";

export const STORAGE_KEYS = {
  player: "g_pl",
  inventory: "g_inv",
} as const;

export function createInitialEquipment(): RuntimeEquipment {
  return Object.fromEntries(
    EQUIPMENT_SLOT_IDS.map((slot) => [slot, null] as const),
  ) as RuntimeEquipment;
}

export function createInitialPlayer(): RuntimePlayer {
  return {
    name: "角鬥士",
    level: 1,
    exp: 0,
    expNeeded: 100,
    hp: 100,
    maxHp: 100,
    attack: 12,
    defense: 5,
    speed: 8,
    gold: 200,
    equipment: createInitialEquipment(),
    trainedAtk: 0,
    trainedDef: 0,
    trainedHp: 0,
    trainedSpd: 0,
    totalKills: 0,
    totalBossKills: 0,
    totalDungeons: 0,
    totalExpeditions: 0,
    totalArenaWins: 0,
    totalGoldEarned: 0,
    totalEnhances: 0,
    totalTrains: 0,
    totalMercRuns: 0,
    monsterKills: {},
    highestLevel: 1,
  };
}

export const INITIAL_EQUIPMENT = createInitialEquipment();
export const INITIAL_PLAYER = createInitialPlayer();
