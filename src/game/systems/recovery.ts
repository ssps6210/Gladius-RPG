import type { RecoveryState } from "../types/recovery";

export function getRecoveryStatus(
  recovery: RecoveryState,
  now: number,
  currentHp: number,
  maxHp: number,
) {
  return {
    dungeonInjured: recovery.dungeonInjuredUntil > now,
    arenaInjured: recovery.arenaInjuredUntil > now,
    atFullHp: currentHp >= maxHp,
  };
}

export function applyInnRest(
  player: { hp: number; maxHp: number },
  recovery: RecoveryState,
) {
  return {
    player: { ...player, hp: player.maxHp },
    recovery: { ...recovery, dungeonInjuredUntil: 0, arenaInjuredUntil: 0 },
  };
}

export function maybeClearDungeonInjury(recovery: RecoveryState, currentHp: number, maxHp: number) {
  if (currentHp >= maxHp) {
    return { ...recovery, dungeonInjuredUntil: 0 };
  }
  return recovery;
}
