export function trainCost(playerLevel: number, currentTrained: number) {
  return Math.max(5, Math.floor(playerLevel * 5 + currentTrained * 8));
}
