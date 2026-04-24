import type { RuntimeEquipment } from "./player";

export type RuntimeArenaOpponent = {
  id: number;
  name: string;
  title: string;
  level: number;
  tier: string;
  attack: number;
  defense: number;
  maxHp: number;
  hp: number;
  equipment: RuntimeEquipment;
  goldCarried: number;
  wcKey: string;
  wins: number;
  losses: number;
  [key: string]: unknown;
};

export type RuntimeArenaState = {
  arenaOpponents: RuntimeArenaOpponent[];
  arenaInjuredUntil: number;
  arenaRefreshes: number;
  arenaLastDate: string;
};
