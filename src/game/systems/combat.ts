import { MERC_DUNGEONS } from "../data/mercenaries";
import { MONSTERS } from "../data/monsters";
import { WEAPON_CATEGORIES } from "../data/weaponCategories";
import { applyEnhanceBonus } from "../lib/items";
import type { KillRecord } from "../types/combat";

type AnyRecord = Record<string, any>;

type CombatDeps = {
  lvUp: (player: any, expGain: any, goldGain: any, log: any[]) => any;
  genLoot: (playerLevel: any, bonus?: any, forcedSlot?: any) => any;
  genMercScroll: (playerLevel: any, forceGrade?: any) => any;
  mercDungeons?: any[];
};

function recordKill(kills: KillRecord[], enemyId: string, enemyName: string, enemyCategory?: string) {
  const existing = kills.find((entry) => entry.enemyId === enemyId);
  if (existing) {
    existing.count += 1;
    return;
  }

  kills.push({
    enemyId,
    enemyName,
    enemyCategory,
    count: 1,
  });
}

export const sumEq = (player: any, stat: any) =>
  Object.values(player.equipment).reduce((sum, entry) => {
    const item = entry as any;
    if (!item) {
      return sum;
    }

    const value = item.enhLv > 0 ? applyEnhanceBonus(item)[stat] || 0 : item[stat] || 0;
    return sum + value;
  }, 0);

export const cAtk = (player: any) => player.attack + (player.trainedAtk || 0) + sumEq(player, "attack");
export const cDef = (player: any) => player.defense + (player.trainedDef || 0) + sumEq(player, "defense");
export const cMhp = (player: any) => player.maxHp + (player.trainedHp || 0) * 3 + sumEq(player, "hp");
export const cSpd = (player: any) => player.speed + (player.trainedSpd || 0) + sumEq(player, "speed");

export const gSpec = (player: any) => {
  const specials: any[] = [];
  Object.values(player.equipment).forEach((entry) => {
    const item = entry as any;
    if (item?.specials) {
      specials.push(...item.specials);
    }
  });
  return specials;
};

export const getWeaponCat = (player: any) => {
  const weapon = player.equipment.weapon;
  return weapon?.cat ? WEAPON_CATEGORIES[weapon.cat] : null;
};

export function applySpec(specials: any, dmg: any, target: any) {
  let healed = 0;
  let extra = 0;
  let isCrit = false;

  for (const special of specials) {
    if (special.type === "lifesteal") {
      healed += Math.floor((dmg * special.val) / 100);
    }
    if (special.type === "vampiric") {
      healed += Math.floor((dmg * special.val) / 200);
    }
    if (special.type === "crit" && Math.random() * 100 < special.val) {
      extra += dmg;
      isCrit = true;
    }
    if (special.type === "fury" && target.hp < target.maxHp * 0.3) {
      extra += special.val;
    }
    if (special.type === "pierce") {
      extra += Math.floor(((dmg * special.val) / 100) * 0.3);
    }
  }

  return { healed, extra, isCrit };
}

export function applyWeaponTrait(cat: any, dmg: any, enemy: any, isFirstRound: any, bleedStacks: any) {
  let finalDmg = dmg;
  const log: string[] = [];
  let newBleed = bleedStacks || 0;
  let stunned = false;

  if (!cat) {
    return { finalDmg, log, newBleed, stunned };
  }

  switch (cat.trait) {
    case "armorbreak":
      finalDmg = Math.floor(finalDmg * 1.2);
      break;
    case "stun":
      if (Math.random() < 0.1) {
        stunned = true;
        log.push("🌀 【錘】震暈效果！敵人本回合無法攻擊！");
      }
      break;
    case "bleed":
      newBleed = Math.min((bleedStacks || 0) + 1, 5);
      log.push(`🩸 【三叉戟】流血層數：${newBleed}`);
      break;
    case "crit_boost":
      if (Math.random() < 0.1) {
        finalDmg *= 2;
        log.push("💥 【鐮刀】爆擊加成觸發！");
      }
      break;
    case "soulstrike":
      if (enemy.hp < enemy.maxHp * 0.3) {
        finalDmg = Math.floor(finalDmg * 1.5);
        log.push("👻 【死亡天使】低血觸發！傷害×1.5");
      }
      break;
    case "bonecrush":
      finalDmg += 2;
      break;
    case "spellpower":
      break;
    default:
      break;
  }

  return { finalDmg, log, newBleed, stunned };
}

export function buildEnemy(monsterKey: any, playerLevel: any, mult: any = 1, isBoss: any = false) {
  const monster = MONSTERS[monsterKey] || MONSTERS.wolf;
  const scale = (0.85 + Math.random() * 0.25) * mult;
  const base = playerLevel * 8 + 12;
  const bossHpMult = isBoss ? 1.6 : 1;
  const bossAtkMult = isBoss ? 1.4 : 1;
  const bossDefMult = isBoss ? 1.2 : 1;

  return {
    key: monsterKey,
    name: monster.name,
    icon: monster.icon,
    trait: monster.trait,
    traitDesc: monster.traitDesc,
    lore: monster.lore,
    isBoss: monster.boss || isBoss,
    hp: Math.floor(base * monster.hpM * scale * bossHpMult),
    maxHp: Math.floor(base * monster.hpM * scale * bossHpMult),
    attack: Math.floor((playerLevel * 2.6 + 4) * monster.atkM * scale * bossAtkMult),
    defense: Math.floor((playerLevel * 1.3 + 2) * monster.defM * scale * bossDefMult),
    expReward: Math.floor((playerLevel * 10 + 8) * monster.hpM * mult * (isBoss ? 3 : 1)),
    goldReward: Math.floor((playerLevel * 4 + 4) * mult * (isBoss ? 4 : 1)),
    burnStacks: 0,
    cursed: false,
    shielded: isBoss,
    regenVal: monster.trait === "stonewall" ? 5 : 0,
  };
}

export function applyMonsterTrait(enemy: any, dmgToEnemy: any, log: any[]) {
  let finalDmg = dmgToEnemy;

  switch (enemy.trait) {
    case "dodge":
      if (Math.random() < 0.2) {
        finalDmg = 0;
        log.push({ txt: `${enemy.icon}${enemy.name} 閃避攻擊！`, type: "enemy" });
      }
      break;
    case "armor":
      finalDmg = Math.floor(finalDmg * 0.6);
      break;
    case "phase":
      break;
    case "divine":
      if (enemy.shielded) {
        finalDmg = 0;
        enemy.shielded = false;
        log.push({ txt: `🛡 ${enemy.icon}${enemy.name} 的神力護盾抵擋了攻擊！`, type: "enemy" });
      }
      break;
    case "dragonArmor":
      finalDmg = Math.floor(finalDmg * 0.65);
      break;
    default:
      break;
  }

  return finalDmg;
}

export function enemyAttackPlayer(enemy: any, pDef: any, specials: any, np: any, pMhp: any, log: any[], round: any) {
  const attackResult = resolveEnemyAttack(enemy, pDef, specials, np, log, round);
  np = attackResult.np;
  np.hp = Math.max(0, np.hp - attackResult.damageTaken);
  log.push({ txt: `${enemy.icon}${enemy.name} 攻擊你，造成 ${attackResult.damageTaken} 傷害`, type: "enemy" });
  return { np, damageTaken: attackResult.damageTaken };
}

export function resolveEnemyAttack(enemy: any, targetDef: any, specials: any, np: any, log: any[], round: any) {
  let baseDmg = Math.max(1, enemy.attack - targetDef + Math.floor(Math.random() * 4) - 2);

  if (enemy.trait === "fire") {
    enemy.burnStacks = (enemy.burnStacks || 0) + 1;
  }
  if (enemy.burnStacks > 0) {
    np.hp = Math.max(0, np.hp - enemy.burnStacks * 2);
    log.push({ txt: `🔥 燒傷傷害 ${enemy.burnStacks * 2}`, type: "enemy" });
  }

  if (enemy.trait === "soulSuck") {
    const suck = Math.floor(baseDmg * 0.05);
    enemy.hp = Math.min(enemy.maxHp, enemy.hp + suck);
  }

  if (enemy.trait === "voidRip") {
    baseDmg = Math.max(1, enemy.attack + Math.floor(Math.random() * 4));
  }

  if (enemy.regenVal > 0) {
    enemy.hp = Math.min(enemy.maxHp, enemy.hp + enemy.regenVal);
    log.push({ txt: `💚 ${enemy.name} 回復 ${enemy.regenVal}HP`, type: "enemy" });
  }

  if (enemy.trait === "charge" && round === 1) {
    baseDmg = Math.floor(baseDmg * 1.3);
    log.push({ txt: `💥 ${enemy.icon}${enemy.name} 憤怒衝鋒！`, type: "enemy" });
  }

  if (enemy.trait === "inferno" && round % 3 === 0) {
    baseDmg = Math.floor(baseDmg * 2);
    log.push({ txt: `🔥 ${enemy.icon}${enemy.name} 全力一擊！`, type: "enemy" });
  }

  if (enemy.trait === "collapse" && round % 5 === 0) {
    baseDmg += 15;
    log.push({ txt: "🪨 岩石崩落！額外 15 傷害", type: "enemy" });
  }

  if (enemy.trait === "dragonRage" && enemy.hp < enemy.maxHp * 0.3) {
    baseDmg = Math.floor(baseDmg * 1.6);
    log.push({ txt: "😡 古龍暴怒！傷害×1.6", type: "enemy" });
  }

  const thorns = specials.filter((special: any) => special.type === "thorns").reduce((sum: any, special: any) => sum + special.val, 0);
  const reflect = specials.filter((special: any) => special.type === "reflect").reduce((sum: any, special: any) => sum + special.val, 0);
  if (thorns > 0) {
    enemy.hp = Math.max(0, enemy.hp - thorns);
    log.push({ txt: `🌵 荊棘反傷 ${thorns}`, type: "hit" });
  }
  if (reflect > 0) {
    enemy.hp = Math.max(0, enemy.hp - reflect);
    log.push({ txt: `🔮 盾反 ${reflect}`, type: "hit" });
  }

  return { np, damageTaken: baseDmg };
}

function resolveMercenaryWaveEnemyAttack(enemy: any, np: any, pDef: any, mercs: any[], log: any[]) {
  const alive = mercs.filter((merc: any) => merc.alive);
  const tanks = alive.filter((merc: any) => merc.defense >= 8);
  const targets = tanks.length ? tanks : alive;

  if (targets.length) {
    const target = targets[Math.floor(Math.random() * targets.length)];
    const damageTaken = Math.max(1, enemy.attack - target.defense + Math.floor(Math.random() * 3));
    target.curHp = Math.max(0, target.curHp - damageTaken);
    log.push({ txt: `${enemy.name}→${target.name} ${damageTaken}傷害`, type: "enemy" });
    if (target.curHp <= 0) {
      target.alive = false;
      log.push({ txt: `💀 ${target.name}陣亡！`, type: "lose" });
    }
    return { np, damageTaken };
  }

  const damageTaken = Math.max(1, enemy.attack - pDef + Math.floor(Math.random() * 4) - 2);
  np.hp = Math.max(0, np.hp - damageTaken);
  log.push({ txt: `${enemy.name}→你 ${damageTaken}傷害`, type: "enemy" });
  return { np, damageTaken };
}

function applyMercenaryWaveEnemyAfterEffects(enemy: any, np: any, pMhp: any, mercs: any[], log: any[]) {
  const healerMerc = mercs.find((merc: any) => merc.alive && ((merc.heal || 0) > 0 || merc.name.includes("治癒")));
  if (healerMerc) {
    const healAmount = healerMerc.heal || 8;
    np.hp = Math.min(np.hp + healAmount, pMhp);
    log.push({ txt: `💚${healerMerc.name}回復${healAmount}HP`, type: "heal" });
  }

  if (enemy.trait === "fire") {
    enemy.burnStacks = (enemy.burnStacks || 0) + 1;
    const burnDamage = enemy.burnStacks * 2;
    np.hp = Math.max(0, np.hp - burnDamage);
    log.push({ txt: `🔥 燒傷${burnDamage}`, type: "enemy" });
  }

  return { np };
}

export function resolvePlayerCombatRound(
  enemy: any,
  np: any,
  pAtk: any,
  pMhp: any,
  specials: any,
  wc: any,
  log: any[],
  round: any,
  firstRound: any,
  bleed: any,
) {
  let nextBleed = bleed;
  let totalDmgDealt = 0;
  let crits = 0;
  let stuns = 0;

  if (nextBleed > 0) {
    const bleedDamage = nextBleed * 3;
    const resist = enemy.trait === "undead" && Math.random() < 0.3;
    enemy.hp = Math.max(0, enemy.hp - (resist ? 0 : bleedDamage));
    log.push({ txt: resist ? `💀 ${enemy.name}抵抗流血！` : `🩸 流血${bleedDamage}傷害(${nextBleed}層)`, type: resist ? "info" : "hit" });
  }
  if (enemy.hp <= 0) {
    return { np, bleed: nextBleed, totalDmgDealt, crits, stuns, enemyDefeated: true, stunned: false };
  }

  let rawDef = enemy.defense;
  if (wc?.trait === "armorbreak") {
    rawDef = Math.floor(rawDef * 0.8);
  }
  if (enemy.trait === "phase") {
    rawDef = Math.floor(rawDef * 0.75);
  }

  let dmgMult = 1;
  if (wc?.trait === "swift" && firstRound) {
    dmgMult = 1.5;
    log.push({ txt: "⚡ 先制一擊！×1.5", type: "hit" });
  }

  const dmg = Math.max(1, Math.floor((pAtk - rawDef + Math.floor(Math.random() * 5) - 2) * dmgMult));
  const { healed, extra, isCrit } = applySpec(specials, dmg, enemy);
  const weaponResult = applyWeaponTrait(wc, dmg + extra, enemy, firstRound, nextBleed);
  weaponResult.log.forEach((entry) => log.push({ txt: entry, type: "hit" }));
  if (isCrit) {
    log.push({ txt: "💥 爆擊！", type: "hit" });
    crits += 1;
  }
  if (weaponResult.stunned) {
    stuns += 1;
  }
  nextBleed = weaponResult.newBleed || nextBleed;

  const actualDmg = applyMonsterTrait(enemy, weaponResult.finalDmg, log);
  enemy.hp = Math.max(0, enemy.hp - actualDmg);
  totalDmgDealt += actualDmg;
  if (actualDmg > 0) {
    log.push({ txt: `回合${round}: 你→${enemy.icon}${enemy.name} ${actualDmg}${isCrit ? "💥" : ""}`, type: "hit" });
  }
  if (healed > 0) {
    np.hp = Math.min(np.hp + healed, pMhp);
    log.push({ txt: `🩸 吸血+${healed}HP`, type: "heal" });
  }

  const regen = specials.filter((special: any) => special.type === "regen" || special.type === "vampiric").reduce((sum: any, special: any) => sum + special.val, 0);
  if (regen > 0 && np.hp > 0) {
    np.hp = Math.min(np.hp + regen, pMhp);
    log.push({ txt: `💚 回復+${regen}HP`, type: "heal" });
  }

  return { np, bleed: nextBleed, totalDmgDealt, crits, stuns, enemyDefeated: enemy.hp <= 0, stunned: weaponResult.stunned };
}

function runCombatEncounter(
  enemy: any,
  np: any,
  pAtk: any,
  pDef: any,
  pMhp: any,
  specials: any,
  wc: any,
  log: any[],
  bleedRef: any,
  hooks: AnyRecord = {},
) {
  let round = 0;
  let firstRound = true;
  let bleed = bleedRef.val;
  let totalDmgDealt = 0;
  let totalDmgTaken = 0;
  let crits = 0;
  let stuns = 0;
  const roundCap = hooks.roundCap || 80;

  while (np.hp > 0 && enemy.hp > 0 && round < roundCap) {
    round += 1;

    const roundResult = resolvePlayerCombatRound(enemy, np, pAtk, pMhp, specials, wc, log, round, firstRound, bleed);
    np = roundResult.np;
    bleed = roundResult.bleed;
    totalDmgDealt += roundResult.totalDmgDealt;
    crits += roundResult.crits;
    stuns += roundResult.stuns;
    if (roundResult.enemyDefeated) {
      break;
    }

    if (hooks.afterPlayerRound) {
      const afterPlayerResult = hooks.afterPlayerRound({ enemy, np, round, log }) || {};
      np = afterPlayerResult.np || np;
      totalDmgDealt += afterPlayerResult.damageDealt || 0;
      if (enemy.hp <= 0) {
        break;
      }
    }

    if (!roundResult.stunned) {
      const attackResult = hooks.enemyAttack
        ? hooks.enemyAttack({ enemy, np, pDef, pMhp, specials, log, round })
        : enemyAttackPlayer(enemy, pDef, specials, np, pMhp, log, round);
      np = attackResult.np || np;
      totalDmgTaken += attackResult.damageTaken || 0;
    }

    if (hooks.afterEnemyRound) {
      const afterEnemyResult = hooks.afterEnemyRound({ enemy, np, round, log }) || {};
      np = afterEnemyResult.np || np;
    }

    firstRound = false;
  }

  bleedRef.val = bleed;
  return { np, won: enemy.hp <= 0, crits, stuns, totalDmgDealt, totalDmgTaken };
}

export function fightMonster(enemy: any, np: any, pAtk: any, pDef: any, pMhp: any, specials: any, wc: any, log: any[], bleedRef: any) {
  return runCombatEncounter(enemy, np, pAtk, pDef, pMhp, specials, wc, log, bleedRef);
}

export function simulateExpedition(expedition: any, initPlayer: any, deps: CombatDeps) {
  const { lvUp, genLoot, genMercScroll } = deps;
  let np = { ...initPlayer };
  const pAtk = cAtk(np);
  const pDef = cDef(np);
  const pMhp = cMhp(np);
  const specials = gSpec(np);
  const wc = getWeaponCat(np);
  const log: any[] = [];
  const drops: any[] = [];
  const kills: KillRecord[] = [];
  const bleedRef = { val: 0 };

  log.push({ txt: `🗺 探險：${expedition.name}`, type: "title" });
  log.push({ txt: `"${expedition.desc}"`, type: "info" });
  if (wc) {
    log.push({ txt: `🗡 ${wc.label} — ${wc.traitDesc}`, type: "info" });
  }

  const enemy = buildEnemy(expedition.monster, np.level, 1);
  log.push({ txt: `━━ ${enemy.icon}${enemy.name} ｜ HP:${enemy.maxHp} 攻:${enemy.attack} 防:${enemy.defense} ━━`, type: "sep" });
  log.push({ txt: `📜 ${enemy.lore}`, type: "info" });
  log.push({ txt: `⚡ 特性：${enemy.traitDesc}`, type: "info" });

  const result = fightMonster(enemy, np, pAtk, pDef, pMhp, specials, wc, log, bleedRef);
  np = result.np;
  if (result.won) {
    recordKill(kills, enemy.key || expedition.monster || enemy.name, enemy.name);
    const expGain = Math.floor(enemy.expReward * expedition.expMult);
    const goldGain = Math.floor(enemy.goldReward * expedition.goldMult);
    np = lvUp(np, expGain, goldGain, log);
    log.push({ txt: `✅ 擊敗${enemy.name}！+${expGain}EXP +${goldGain}金`, type: "win" });
    if (Math.random() < 0.3 + expedition.lootBonus) {
      const drop = genLoot(np.level, expedition.lootBonus);
      drops.push(drop);
      log.push({ txt: `✨ 掉落：${drop.rarityLabel}【${drop.name}】`, type: "loot" });
    }
    if (Math.random() < 0.08 + expedition.lootBonus * 0.5) {
      const scroll = genMercScroll(np.level);
      drops.push(scroll);
      log.push({ txt: `📜 傭兵契約捲軸：${scroll.rarityLabel}【${scroll.name}】`, type: "loot" });
    }
  } else {
    log.push({ txt: `💀 被${enemy.name}擊敗！`, type: "lose" });
    np.gold = Math.max(50, np.gold - Math.min(300, Math.floor(np.gold * 0.08)));
    np.hp = Math.floor(cMhp(np) * 0.3);
  }

  log.push({ txt: "─────────────────", type: "sep" });
  log.push({ txt: `📊 ${result.won ? "勝利" : "落敗"} · 造成${result.totalDmgDealt} · 承受${result.totalDmgTaken}`, type: result.won ? "win" : "lose" });
  return { log, finalPlayer: np, drops, kills, won: result.won };
}

export function simulateRun(dungeon: any, tier: any, initPlayer: any, deps: CombatDeps) {
  const { lvUp, genLoot, genMercScroll } = deps;
  let np = { ...initPlayer };
  const pAtk = cAtk(np);
  const pDef = cDef(np);
  const pMhp = cMhp(np);
  const specials = gSpec(np);
  const wc = getWeaponCat(np);
  const log: any[] = [];
  const drops: any[] = [];
  const kills: KillRecord[] = [];
  const bleedRef = { val: 0 };
  let totalKills = 0;
  let totalDmgDealt = 0;
  let totalDmgTaken = 0;
  let totalCrits = 0;

  log.push({ txt: `⚔️ 進入 ${dungeon.name}【${tier.label}】`, type: "title" });
  log.push({ txt: `"${dungeon.lore}"`, type: "info" });
  if (wc) {
    log.push({ txt: `🗡 ${wc.label} — ${wc.traitDesc}`, type: "info" });
  }

  for (const wave of dungeon.waves) {
    if (np.hp <= 0) {
      break;
    }
    log.push({ txt: `━━ ${wave.label} — ${wave.desc} ━━`, type: "sep" });
    for (const monsterKey of wave.monsters) {
      if (np.hp <= 0) {
        break;
      }
      const enemy = buildEnemy(monsterKey, np.level, tier.mult);
      log.push({ txt: `${enemy.icon}${enemy.name} 出現！(HP:${enemy.maxHp} 攻:${enemy.attack} ⚡${enemy.traitDesc})`, type: "info" });
      const result = fightMonster(enemy, np, pAtk, pDef, pMhp, specials, wc, log, bleedRef);
      np = result.np;
      totalDmgDealt += result.totalDmgDealt;
      totalDmgTaken += result.totalDmgTaken;
      totalCrits += result.crits;
      if (result.won) {
        recordKill(kills, monsterKey, enemy.name);
        totalKills += 1;
        const expGain = Math.floor(enemy.expReward * tier.expMult);
        const goldGain = Math.floor(enemy.goldReward * tier.goldMult);
        np = lvUp(np, expGain, goldGain, log);
        log.push({ txt: `✅ 擊敗${enemy.name}！+${expGain}EXP +${goldGain}金`, type: "win" });
        if (Math.random() < 0.2 + tier.lootBonus * 0.5) {
          const drop = genLoot(np.level, tier.lootBonus);
          drops.push(drop);
          log.push({ txt: `✨ 掉落：${drop.rarityLabel}【${drop.name}】`, type: "loot" });
        }
      } else {
        log.push({ txt: `💀 在第${totalKills + 1}怪陣亡！`, type: "lose" });
        break;
      }
    }
    if (np.hp > 0) {
      np.hp = Math.min(pMhp, np.hp + Math.floor(pMhp * 0.12));
    }
  }

  if (np.hp > 0 && dungeon.boss) {
    log.push({ txt: "━━━━━━━━━━━━━━━━━━", type: "sep" });
    log.push({ txt: `🔥 ${dungeon.bossIntro}`, type: "title" });
    const boss = buildEnemy(dungeon.boss, np.level, tier.mult, true);
    log.push({ txt: `${boss.icon}${boss.name} ｜ HP:${boss.maxHp} 攻:${boss.attack} 防:${boss.defense}`, type: "info" });
    log.push({ txt: `👹 Boss特性：${boss.traitDesc}`, type: "info" });
    const result = fightMonster(boss, np, pAtk, pDef, pMhp, specials, wc, log, bleedRef);
    np = result.np;
    totalDmgDealt += result.totalDmgDealt;
    totalDmgTaken += result.totalDmgTaken;
    totalCrits += result.crits;
    if (result.won) {
      recordKill(kills, dungeon.boss || boss.key || boss.name, boss.name, "boss");
      totalKills += 1;
      const expGain = Math.floor(boss.expReward * tier.expMult);
      const goldGain = Math.floor(boss.goldReward * tier.goldMult);
      np = lvUp(np, expGain, goldGain, log);
      log.push({ txt: `👑 擊敗Boss ${boss.name}！+${expGain}EXP +${goldGain}金`, type: "win" });
      if (Math.random() < 0.6 + tier.lootBonus) {
        const drop = genLoot(np.level, tier.lootBonus + 0.1);
        drops.push(drop);
        log.push({ txt: `✨ Boss掉落：${drop.rarityLabel}【${drop.name}】`, type: "loot" });
      }
      if (Math.random() < 0.25 + tier.lootBonus) {
        const scroll = genMercScroll(np.level);
        drops.push(scroll);
        log.push({ txt: `📜 Boss掉落契約捲軸：${scroll.rarityLabel}【${scroll.name}】`, type: "loot" });
      }
    } else {
      log.push({ txt: `💀 敗於Boss ${boss.name}！`, type: "lose" });
    }
  }

  const won = np.hp > 0;
  if (!won) {
    np.gold = Math.max(50, np.gold - Math.min(300, Math.floor(np.gold * 0.1)));
    np.hp = Math.floor(cMhp(np) * 0.3);
  }
  const totalMonsters = dungeon.waves.flatMap((wave: any) => wave.monsters).length + 1;
  log.push({ txt: "─────────────────", type: "sep" });
  log.push({ txt: "📊 戰鬥結算", type: "title" });
  log.push({ txt: `${won ? "🏆 副本完成！" : "💀 副本失敗"} · 擊殺${totalKills}/${totalMonsters}`, type: won ? "win" : "lose" });
  log.push({ txt: `⚔ 造成${totalDmgDealt} · 承受${totalDmgTaken} · 爆擊${totalCrits}次 · 掉落${drops.length}件`, type: "info" });
  return { log, finalPlayer: np, drops, kills, won };
}

export function simulateMercRun(dungeonId: any, initPlayer: any, mercs: any, deps: CombatDeps) {
  const { lvUp, genLoot, genMercScroll, mercDungeons = MERC_DUNGEONS } = deps;
  const dungeon = mercDungeons.find((entry: any) => entry.id === dungeonId) || mercDungeons[0];
  let np = { ...initPlayer };
  const pAtk = cAtk(np);
  const pDef = cDef(np);
  const pMhp = cMhp(np);
  const specials = gSpec(np);
  const wc = getWeaponCat(np);
  const nm = mercs.map((merc: any) => ({ ...merc, curHp: merc.hp, alive: true }));
  const log: any[] = [];
  const drops: any[] = [];
  const kills: KillRecord[] = [];
  const bleedRef = { val: 0 };
  let totalDmgDealt = 0;
  let totalDmgTaken = 0;

  log.push({ txt: `🏴 傭兵副本：${dungeon.icon}${dungeon.label}`, type: "title" });
  log.push({ txt: `"${dungeon.lore}"`, type: "info" });
  log.push({ txt: `📢 傭兵：${nm.map((merc: any) => merc.name).join("、")}`, type: "info" });

  for (let waveIndex = 0; waveIndex < dungeon.waves.length; waveIndex += 1) {
    const wave = dungeon.waves[waveIndex];
    if (np.hp <= 0) {
      break;
    }
    log.push({ txt: `━━ 第${waveIndex + 1}波 — ${wave.desc} ━━`, type: "sep" });
    for (const monsterKey of wave.enemies) {
      if (np.hp <= 0) {
        break;
      }
      const monsterData = MONSTERS[monsterKey];
      let enemy: AnyRecord;
      if (monsterData) {
        enemy = buildEnemy(monsterKey, np.level + dungeon.lvBonus, wave.mult || 1);
      } else {
        const fallbackKey = Object.keys(MONSTERS)[Math.floor(Math.random() * 6)];
        enemy = buildEnemy(fallbackKey, np.level + dungeon.lvBonus, wave.mult || 1);
        enemy.name = monsterKey;
      }
      log.push({ txt: `${enemy.icon}${enemy.name} 出現！HP:${enemy.maxHp} 攻:${enemy.attack} ⚡${enemy.traitDesc}`, type: "info" });

      const result = runCombatEncounter(enemy, np, pAtk, pDef, pMhp, specials, wc, log, bleedRef, {
        afterPlayerRound: ({ enemy: currentEnemy }: AnyRecord) => {
          let damageDealt = 0;
          for (const merc of nm) {
            if (!merc.alive || currentEnemy.hp <= 0) {
              continue;
            }
            const mercDmg = Math.max(1, merc.attack - currentEnemy.defense + Math.floor(Math.random() * 3));
            currentEnemy.hp = Math.max(0, currentEnemy.hp - mercDmg);
            damageDealt += mercDmg;
            log.push({ txt: `${merc.icon}${merc.name}→${currentEnemy.name} ${mercDmg}`, type: "merc" });
          }
          return { damageDealt };
        },
        enemyAttack: ({ enemy: currentEnemy, np: currentPlayer }: AnyRecord) => {
          return resolveMercenaryWaveEnemyAttack(currentEnemy, currentPlayer, pDef, nm, log);
        },
        afterEnemyRound: ({ np: currentPlayer }: AnyRecord) => {
          return applyMercenaryWaveEnemyAfterEffects(enemy, currentPlayer, pMhp, nm, log);
        },
      });
      np = result.np;
      totalDmgDealt += result.totalDmgDealt;
      totalDmgTaken += result.totalDmgTaken;

      if (np.hp > 0 && enemy.hp <= 0) {
        recordKill(kills, monsterData ? monsterKey : enemy.name, enemy.name);
        const expGain = Math.floor(enemy.expReward * ((dungeon.reward && dungeon.reward.expMult) || 1.2));
        const goldGain = Math.floor(enemy.goldReward * ((dungeon.reward && dungeon.reward.goldMult) || 1.5));
        np = lvUp(np, expGain, goldGain, log);
        log.push({ txt: `✅ 擊敗${enemy.name}！+${expGain}EXP +${goldGain}金`, type: "win" });
      } else if (np.hp <= 0) {
        log.push({ txt: "💀 你陣亡！", type: "lose" });
      }
    }
    if (np.hp > 0) {
      np.hp = Math.min(pMhp, np.hp + Math.floor(pMhp * 0.15));
    }
  }

  if (np.hp > 0 && dungeon.boss) {
    const bossData = dungeon.boss;
    const bossEnemy = {
      name: bossData.name,
      icon: bossData.icon,
      trait: bossData.trait,
      traitDesc: "",
      hp: Math.floor((np.level * 8 + 12) * bossData.hpM * 1.5 * ((dungeon.reward && dungeon.reward.goldMult) || 1)),
      maxHp: Math.floor((np.level * 8 + 12) * bossData.hpM * 1.5 * ((dungeon.reward && dungeon.reward.goldMult) || 1)),
      attack: Math.floor((np.level * 2.6 + 4) * bossData.atkM * 1.2),
      defense: Math.floor((np.level * 1.3 + 2) * bossData.defM * 1.1),
      expReward: Math.floor(np.level * 40 * ((dungeon.reward && dungeon.reward.expMult) || 1)),
      goldReward: Math.floor(np.level * 20 * ((dungeon.reward && dungeon.reward.goldMult) || 1)),
      shielded: false,
      burnStacks: 0,
      regenVal: 0,
      isBoss: true,
    };
    log.push({ txt: "━━━━━━━━━━━━━━━━━━", type: "sep" });
    log.push({ txt: `👑 副本首領：${bossData.icon}${bossData.name} 登場！`, type: "title" });
    log.push({ txt: `HP:${bossEnemy.maxHp} 攻:${bossEnemy.attack} 防:${bossEnemy.defense}`, type: "info" });
    const bleedRef = { val: 0 };
    const result = fightMonster(bossEnemy, np, pAtk, pDef, pMhp, specials, getWeaponCat(np), log, bleedRef);
    np = result.np;
    totalDmgDealt += result.totalDmgDealt;
    if (result.won) {
      recordKill(kills, bossData.name, bossData.name, "boss");
      np = lvUp(np, bossEnemy.expReward, bossEnemy.goldReward, log);
      log.push({ txt: `👑 擊敗首領${bossData.name}！+${bossEnemy.expReward}EXP`, type: "win" });
      const scrollBonus = (dungeon.reward && dungeon.reward.scrollBonus) || 0.3;
      if (Math.random() < scrollBonus) {
        const scroll = genMercScroll(np.level);
        drops.push(scroll);
        log.push({ txt: `📜 首領掉落契約捲軸：${scroll.rarityLabel}【${scroll.name}】`, type: "loot" });
      }
      if (Math.random() < 0.4) {
        const drop = genLoot(np.level, 0.2);
        drops.push(drop);
        log.push({ txt: `✨ 掉落：${drop.rarityLabel}【${drop.name}】`, type: "loot" });
      }
    } else {
      log.push({ txt: `💀 敗於首領${bossData.name}！`, type: "lose" });
    }
  }

  const won = np.hp > 0;
  if (!won) {
    np.gold = Math.max(50, np.gold - Math.min(300, Math.floor(np.gold * 0.08)));
    np.hp = Math.floor(cMhp(np) * 0.3);
  }
  log.push({ txt: "─────────────────", type: "sep" });
  log.push({ txt: `📊 ${won ? "勝利" : "落敗"} · 造成${totalDmgDealt} · 承受${totalDmgTaken} · 掉落${drops.length}件`, type: won ? "win" : "lose" });
  return { log, finalPlayer: np, drops, kills, won };
}

export function runCombat(player: any, enemy: any) {
  const pAtk = cAtk(player);
  const pDef = cDef(player);
  const pMhp = cMhp(player);
  const pSpd = cSpd(player);
  const eSpd = enemy.speed ?? 1;
  const specials = gSpec(player);
  const wc = getWeaponCat(player);
  const log: string[] = [];
  const bleedRef = { val: 0 };

  log.push(`⚔️ 戰鬥開始！你 vs ${enemy.name}`);
  log.push(`⚡ 速度比較：你 ${pSpd} vs ${enemy.name} ${eSpd}${pSpd > eSpd ? "（你的速度更快，先手攻擊）" : ""}`);

  const result = fightMonster(enemy, { ...player }, pAtk, pDef, pMhp, specials, wc, log as any, bleedRef);
  const defeated = result.won;
  const outcome = defeated ? "win" : "loss";

  return {
    outcome,
    kills: defeated ? [{ enemyId: enemy.id, enemyName: enemy.name, count: 1 }] : [],
    rewards: {
      exp: defeated ? enemy.expReward ?? 0 : 0,
      gold: defeated ? enemy.goldReward ?? 0 : 0,
      loot: [],
    },
    log,
    player: result.np,
  };
}

export function simulateArenaBattle(player: any, opponent: any) {
  const pAtk = cAtk(player);
  const pDef = cDef(player);
  const pMhp = cMhp(player);
  const pSpd = cSpd(player);
  const specials = gSpec(player);
  const wc = getWeaponCat(player);
  const oWc = opponent.wcKey ? WEAPON_CATEGORIES[opponent.wcKey] : null;
  const oSpd = Math.floor((3 + opponent.level * 0.5) * (opponent.tier === "strong" ? 1.2 : 1));
  const log: any[] = [];
  const bleedRef = { val: 0 };

  log.push({ txt: `⚔️ 競技場對決！`, type: "title" });
  log.push({ txt: `你 (Lv.${player.level} 攻${pAtk} 防${pDef}) vs ${opponent.name} (Lv.${opponent.level} 攻${opponent.attack} 防${opponent.defense})`, type: "info" });
  if (wc)  log.push({ txt: `你的武器：${wc.label} — ${wc.traitDesc}`, type: "info" });
  if (oWc) log.push({ txt: `對手武器：${oWc.label} — ${oWc.traitDesc}`, type: "info" });
  log.push({ txt: `━━━━━━━━━━━━━━━━━━`, type: "sep" });

  if (pSpd >= oSpd || (wc && wc.trait === "firstblood")) {
    log.push({ txt: `⚡ 你先手！（速度 ${pSpd} vs ${oSpd}）`, type: "hit" });
  } else {
    log.push({ txt: `⚡ 對手先手！（速度 ${oSpd} vs ${pSpd}）`, type: "enemy" });
  }

  const fakeEnemy = {
    name: opponent.name, icon: "🏟",
    hp: opponent.maxHp, maxHp: opponent.maxHp,
    attack: opponent.attack, defense: opponent.defense,
    trait: oWc ? oWc.trait : "balanced", traitDesc: oWc ? oWc.traitDesc : "",
    isBoss: false, burnStacks: 0, shielded: false, regenVal: 0,
    expReward: 0, goldReward: 0,
  };

  const result = fightMonster(fakeEnemy, { ...player }, pAtk, pDef, pMhp, specials, wc, log, bleedRef);
  const won = result.won;
  let goldPlundered = 0;

  if (won) {
    goldPlundered = Math.floor(opponent.goldCarried * (0.10 + Math.random() * 0.15));
    log.push({ txt: `━━━━━━━━━━━━━━━━━━`, type: "sep" });
    log.push({ txt: `🏆 勝利！擊敗 ${opponent.name}！`, type: "win" });
    log.push({ txt: `💰 掠奪金幣 ${goldPlundered}（對手攜帶 ${opponent.goldCarried}）`, type: "win" });
  } else {
    log.push({ txt: `━━━━━━━━━━━━━━━━━━`, type: "sep" });
    log.push({ txt: `💀 落敗！被 ${opponent.name} 擊倒！`, type: "lose" });
    log.push({ txt: `🛌 你需要休息 30 分鐘才能再戰`, type: "lose" });
  }
  log.push({ txt: `─────────────────`, type: "sep" });
  log.push({ txt: `📊 造成 ${result.totalDmgDealt} · 承受 ${result.totalDmgTaken} · 爆擊 ${result.crits} 次`, type: "info" });

  return { log, finalPlayer: result.np, won, goldPlundered };
}
