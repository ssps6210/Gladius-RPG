import type { RuntimeItem } from "./item";
import type { EquipmentSlotId } from "./shared";

export type RuntimeEquipment = Record<EquipmentSlotId, RuntimeItem | null>;

export type RuntimePlayer = {
  name: string;
  level: number;
  exp: number;
  expNeeded: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  gold: number;
  equipment: RuntimeEquipment;
  trainedAtk: number;
  trainedDef: number;
  trainedHp: number;
  trainedSpd: number;
  totalKills: number;
  totalBossKills: number;
  totalDungeons: number;
  totalExpeditions: number;
  totalArenaWins: number;
  totalGoldEarned: number;
  totalEnhances: number;
  totalTrains: number;
  totalMercRuns: number;
  monsterKills: Record<string, number>;
  highestLevel: number;
  [key: string]: unknown;
};
