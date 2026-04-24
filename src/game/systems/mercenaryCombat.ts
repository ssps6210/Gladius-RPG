interface MercenaryUnit {
  name: string;
  icon: string;
  attack: number;
  defense: number;
  hp: number;
  maxHp: number;
  heal?: number;
}

interface MercenaryDungeon {
  id: string;
  label: string;
  icon: string;
  lore: string;
  lvBonus: number;
  waves: Array<{ enemies: string[]; desc: string; mult: number }>;
  reward: { expMult: number; goldMult: number; scrollBonus: number };
}

export function runMercenaryDungeon(party: MercenaryUnit[], dungeon: MercenaryDungeon) {
  const living = party.map((unit) => ({ ...unit }));
  const summary: string[] = [];

  summary.push(`🏰 出發：${dungeon.label}`);
  summary.push(dungeon.lore);

  for (const wave of dungeon.waves) {
    summary.push(`━━ ${wave.desc} ━━`);

    // Apply healer recovery between waves
    for (const unit of living) {
      if (unit.heal && unit.heal > 0 && unit.hp > 0) {
        const healed = Math.min(unit.heal, unit.maxHp - unit.hp);
        unit.hp = Math.min(unit.maxHp, unit.hp + unit.heal);
        if (healed > 0) {
          summary.push(`💚${unit.name}回復${healed}HP`);
        } else {
          summary.push(`💚${unit.name}回復隊伍`);
        }
        // Heal adjacent allies
        for (const ally of living) {
          if (ally !== unit && ally.hp > 0) {
            const allyHealed = Math.min(unit.heal, ally.maxHp - ally.hp);
            ally.hp = Math.min(ally.maxHp, ally.hp + unit.heal);
            if (allyHealed > 0) {
              summary.push(`💚${unit.name}為${ally.name}回復${allyHealed}HP`);
            }
          }
        }
      }
    }

    // Simple wave combat: each alive unit fights one enemy
    for (const enemyType of wave.enemies) {
      const enemyHp = Math.floor((30 + wave.mult * 20) * 1);
      const enemyAtk = Math.floor(5 * wave.mult);
      let eHp = enemyHp;

      for (const unit of living) {
        if (unit.hp <= 0 || eHp <= 0) continue;
        const dmgToEnemy = Math.max(1, unit.attack - 2);
        const dmgToUnit = Math.max(1, enemyAtk - unit.defense);
        eHp -= dmgToEnemy;
        unit.hp -= dmgToUnit;
        if (unit.hp < 0) unit.hp = 0;
      }

      if (eHp <= 0) {
        summary.push(`✅ 擊敗 ${enemyType}！`);
      } else {
        summary.push(`💀 ${enemyType} 尚未擊敗`);
      }
    }
  }

  const survivors = living.filter((unit) => unit.hp > 0).length;
  summary.push(`─────────────────`);
  summary.push(`📊 倖存傭兵：${survivors}/${living.length}`);

  return {
    survivors,
    summary,
    rewards: { gold: 0, exp: 0, loot: [] as unknown[] },
  };
}
