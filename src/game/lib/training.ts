export function trainCost(playerLevel: number, currentTrained: number) {
  const base = Math.max(5, Math.floor(playerLevel * 5 + currentTrained * 8));
  if (currentTrained < 100) return base;
  // Exponential scaling kicks in after 100 trains per stat
  // Each train beyond 100 multiplies cost by ~1.06, so at 150 it's ~18× base
  const exp = Math.pow(1.06, currentTrained - 99);
  return Math.ceil(base * exp);
}
