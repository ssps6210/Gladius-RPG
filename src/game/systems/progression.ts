interface PlayerLike {
  level: number;
  exp: number;
  expNeeded: number;
  hp: number;
  maxHp: number;
  highestLevel?: number;
  attack?: number;
  defense?: number;
}

export function getNextExpNeeded(currentExpNeeded: number): number {
  return Math.floor(currentExpNeeded * 1.4);
}

export function getLevelMaxHp(currentMaxHp: number): number {
  return currentMaxHp + 15;
}

export function applyProgressionRewards(
  player: PlayerLike,
  rewards: { exp: number; gold: number },
) {
  const next: any = { ...player, exp: player.exp + rewards.exp };
  let leveled = false;

  while (next.exp >= next.expNeeded) {
    next.exp -= next.expNeeded;
    next.level += 1;
    next.expNeeded = getNextExpNeeded(next.expNeeded);
    next.maxHp = getLevelMaxHp(next.maxHp);
    if (next.attack !== undefined) next.attack += 2;
    if (next.defense !== undefined) next.defense += 1;
    leveled = true;
  }

  next.highestLevel = Math.max(next.highestLevel ?? next.level, next.level);
  if (leveled) next.hp = next.maxHp;

  return { player: next, leveled };
}
