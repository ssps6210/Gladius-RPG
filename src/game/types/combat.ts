export interface KillRecord {
  enemyId: string;
  enemyName: string;
  enemyCategory?: string;
  count: number;
}

export interface CombatResult {
  outcome: "win" | "loss" | "draw";
  kills: KillRecord[];
  rewards: {
    exp: number;
    gold: number;
    loot: unknown[];
  };
}
