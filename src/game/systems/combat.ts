import { MERC_DUNGEONS } from "../data/mercenaries";
import { MONSTERS } from "../data/monsters";
import { WEAPON_CATEGORIES } from "../data/weaponCategories";
import { aggregateSetEffects, calculateSetBonuses } from "../data/sets";
import { JOB_CLASSES } from "../data/classes";
import { applyEnhanceBonus } from "../lib/items";
import { SLOT_EFFECTIVENESS } from "../types/shared";
import type { KillRecord } from "../types/combat";

type AnyRecord = Record<string, any>;

// Combat runs synchronously per call, so a module-level language flag lets the
// many log builders localize without threading `lang` through every signature.
let _combatLang: "zh" | "en" = "zh";
export function setCombatLang(lang: "zh" | "en") {
  _combatLang = lang;
}
const L = (zh: string, en: string) => (_combatLang === "en" ? en : zh);
/** Localize a data field by language (name/label/traitDesc → *En fallback). */
const LF = (obj: any, field: string) => {
  if (!obj) return "";
  return _combatLang === "en" ? obj[`${field}En`] ?? obj[field] : obj[field];
};

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
  Object.entries(player.equipment).reduce((sum, [slotId, entry]) => {
    const item = entry as any;
    if (!item) return sum;
    const value = item.enhLv > 0 ? applyEnhanceBonus(item)[stat] || 0 : item[stat] || 0;
    const mult = SLOT_EFFECTIVENESS[slotId as keyof typeof SLOT_EFFECTIVENESS] ?? 1.0;
    return sum + Math.floor(value * mult);
  }, 0);

export const cAtk = (player: any) => {
  const base = player.attack + (player.trainedAtk || 0) + sumEq(player, "attack");
  const setBonuses = calculateSetBonuses(player.equipment || {});
  const cls = JOB_CLASSES[player.jobClass as keyof typeof JOB_CLASSES];
  return base + aggregateSetEffects(setBonuses).attack + (cls?.atkBonus || 0);
};
export const cDef = (player: any) => {
  const base = player.defense + (player.trainedDef || 0) + sumEq(player, "defense");
  const setBonuses = calculateSetBonuses(player.equipment || {});
  const cls = JOB_CLASSES[player.jobClass as keyof typeof JOB_CLASSES];
  return base + aggregateSetEffects(setBonuses).defense + (cls?.defBonus || 0);
};
export const cMhp = (player: any) => {
  const base = player.maxHp + (player.trainedHp || 0) * 3 + sumEq(player, "hp");
  const setBonuses = calculateSetBonuses(player.equipment || {});
  const cls = JOB_CLASSES[player.jobClass as keyof typeof JOB_CLASSES];
  const hpAdd = cls?.hpPct ? Math.floor(base * cls.hpPct / 100) : 0;
  return base + aggregateSetEffects(setBonuses).hp + hpAdd;
};
export const cSpd = (player: any) => {
  const base = player.speed + (player.trainedSpd || 0) + sumEq(player, "speed");
  const setBonuses = calculateSetBonuses(player.equipment || {});
  const cls = JOB_CLASSES[player.jobClass as keyof typeof JOB_CLASSES];
  return base + aggregateSetEffects(setBonuses).speed + (cls?.spdBonus || 0);
};

/** Get aggregate set effects for a player (used by combat for lifesteal, critChance, etc.) */
export const getSetEffects = (player: any) => {
  const setBonuses = calculateSetBonuses(player.equipment || {});
  return aggregateSetEffects(setBonuses);
};

export interface ClassEffects {
  blockChance: number;       // Warrior/Paladin: chance to block
  blockReflect: number;      // Paladin: reflect % of blocked damage (0–1)
  inspireChance: number;     // Bard/ShadowDancer: chance to skip enemy attack
  dodgeChance: number;       // ShadowDancer: full dodge chance
  regenPerRound: number;     // Cleric: fixed HP regen
  regenPctPerRound: number;  // Archbishop: % of maxHp to regen
  firstRoundCrit: boolean;   // Rogue/Assassin: guaranteed first-round crit
  bonusCritChance: number;   // Rogue: extra crit %; Assassin: extra crit %
  critMultiplier: number;    // default 2; Assassin: 3.5
  classLifesteal: number;    // ShadowFiend: % of damage healed (0–100)
  rageMode: boolean;         // Berserker: double ATK when HP < 30%
  holyWrathChance: number;   // Inquisitor: chance for ×2 holy damage
  arcaneBurst: boolean;      // Spellsinger: every 3rd round bonus ATK×1.5
}

const BASE_CE: ClassEffects = {
  blockChance: 0, blockReflect: 0, inspireChance: 0, dodgeChance: 0,
  regenPerRound: 0, regenPctPerRound: 0,
  firstRoundCrit: false, bonusCritChance: 0, critMultiplier: 2,
  classLifesteal: 0, rageMode: false, holyWrathChance: 0, arcaneBurst: false,
};

/** Get class-based combat effect modifiers for a player */
export const getClassEffects = (player: any): ClassEffects => {
  const cls = JOB_CLASSES[player.jobClass as keyof typeof JOB_CLASSES];
  if (!cls) return { ...BASE_CE };
  switch (cls.id) {
    case "warrior":      return { ...BASE_CE, blockChance: 0.15 };
    case "bard":         return { ...BASE_CE, inspireChance: 0.20 };
    case "cleric":       return { ...BASE_CE, regenPerRound: 8 };
    case "rogue":        return { ...BASE_CE, firstRoundCrit: true, bonusCritChance: 15 };
    // Tier 2
    case "berserker":    return { ...BASE_CE, rageMode: true };
    case "paladin":      return { ...BASE_CE, blockChance: 0.30, blockReflect: 0.30 };
    case "assassin":     return { ...BASE_CE, firstRoundCrit: true, bonusCritChance: 20, critMultiplier: 3.5 };
    case "shadowFiend":  return { ...BASE_CE, classLifesteal: 20 };
    case "archbishop":   return { ...BASE_CE, regenPctPerRound: 5 };
    case "inquisitor":   return { ...BASE_CE, regenPerRound: 0, holyWrathChance: 0.20 };
    case "shadowDancer": return { ...BASE_CE, dodgeChance: 0.30 };
    case "spellsinger":  return { ...BASE_CE, arcaneBurst: true };
    default:             return { ...BASE_CE };
  }
};

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
        log.push(L("🌀 【錘】震暈效果！敵人本回合無法攻擊！", "🌀 [Hammer] Stun! Enemy can't attack this round!"));
      }
      break;
    case "bleed":
      newBleed = Math.min((bleedStacks || 0) + 1, 5);
      log.push(L(`🩸 【三叉戟】流血層數：${newBleed}`, `🩸 [Trident] Bleed stacks: ${newBleed}`));
      break;
    case "crit_boost":
      if (Math.random() < 0.1) {
        finalDmg *= 2;
        log.push(L("💥 【鐮刀】爆擊加成觸發！", "💥 [Sickle] Crit bonus triggered!"));
      }
      break;
    case "soulstrike":
      if (enemy.hp < enemy.maxHp * 0.3) {
        finalDmg = Math.floor(finalDmg * 1.5);
        log.push(L("👻 【死亡天使】低血觸發！傷害×1.5", "👻 [Death Angel] Low HP trigger! Damage ×1.5"));
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
    nameEn: monster.nameEn || monster.name,
    icon: monster.icon,
    trait: monster.trait,
    traitDesc: monster.traitDesc,
    traitDescEn: monster.traitDescEn || monster.traitDesc,
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
        log.push({ txt: L(`${enemy.icon}${enemy.name} 閃避攻擊！`, `${enemy.icon}${LF(enemy, "name")} dodged the attack!`), type: "enemy" });
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
        log.push({ txt: L(`🛡 ${enemy.icon}${enemy.name} 的神力護盾抵擋了攻擊！`, `🛡 ${enemy.icon}${LF(enemy, "name")}'s divine shield blocked the attack!`), type: "enemy" });
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

export function enemyAttackPlayer(enemy: any, pDef: any, specials: any, np: any, pMhp: any, log: any[], round: any, setEffects?: { damageReduction: number }, blockChance?: number, classEffects?: ClassEffects) {
  const attackResult = resolveEnemyAttack(enemy, pDef, specials, np, log, round);
  np = attackResult.np;
  let damageTaken = attackResult.damageTaken;
  // Warrior/Paladin: block chance halves incoming damage; Paladin reflects on block
  if (blockChance && blockChance > 0 && Math.random() < blockChance) {
    damageTaken = Math.max(1, Math.floor(damageTaken / 2));
    const reflectDmg = classEffects?.blockReflect && classEffects.blockReflect > 0
      ? Math.max(1, Math.floor(damageTaken * classEffects.blockReflect))
      : 0;
    if (reflectDmg > 0) {
      enemy.hp = Math.max(0, enemy.hp - reflectDmg);
      log.push({ txt: L(`🛡 【聖騎士】格擋反彈！傷害減半+反彈${reflectDmg}！`, `🛡 [Paladin] Block + Reflect ${reflectDmg}!`), type: "hit" });
    } else {
      log.push({ txt: L("🛡 【戰士】格擋成功！傷害減半！", "🛡 [Warrior] Block! Damage halved!"), type: "hit" });
    }
  }
  // Apply set bonus: damage reduction on incoming attacks
  if (setEffects && setEffects.damageReduction > 0) {
    damageTaken = Math.max(1, Math.floor(damageTaken * (1 - setEffects.damageReduction / 100)));
  }
  np.hp = Math.max(0, np.hp - damageTaken);
  log.push({ txt: L(`${enemy.icon}${enemy.name} 攻擊你，造成 ${damageTaken} 傷害`, `${enemy.icon}${LF(enemy, "name")} hits you for ${damageTaken} damage`), type: "enemy" });
  return { np, damageTaken };
}

export function resolveEnemyAttack(enemy: any, targetDef: any, specials: any, np: any, log: any[], round: any) {
  let baseDmg = Math.max(1, enemy.attack - targetDef + Math.floor(Math.random() * 4) - 2);

  if (enemy.trait === "fire") {
    enemy.burnStacks = (enemy.burnStacks || 0) + 1;
  }
  if (enemy.burnStacks > 0) {
    np.hp = Math.max(0, np.hp - enemy.burnStacks * 2);
    log.push({ txt: L(`🔥 燒傷傷害 ${enemy.burnStacks * 2}`, `🔥 Burn damage ${enemy.burnStacks * 2}`), type: "enemy" });
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
    log.push({ txt: L(`💚 ${enemy.name} 回復 ${enemy.regenVal}HP`, `💚 ${LF(enemy, "name")} regenerates ${enemy.regenVal} HP`), type: "enemy" });
  }

  if (enemy.trait === "charge" && round === 1) {
    baseDmg = Math.floor(baseDmg * 1.3);
    log.push({ txt: L(`💥 ${enemy.icon}${enemy.name} 憤怒衝鋒！`, `💥 ${enemy.icon}${LF(enemy, "name")} charges in fury!`), type: "enemy" });
  }

  if (enemy.trait === "inferno" && round % 3 === 0) {
    baseDmg = Math.floor(baseDmg * 2);
    log.push({ txt: L(`🔥 ${enemy.icon}${enemy.name} 全力一擊！`, `🔥 ${enemy.icon}${LF(enemy, "name")} unleashes a full strike!`), type: "enemy" });
  }

  if (enemy.trait === "collapse" && round % 5 === 0) {
    baseDmg += 15;
    log.push({ txt: L("🪨 岩石崩落！額外 15 傷害", "🪨 Rockfall! +15 damage"), type: "enemy" });
  }

  if (enemy.trait === "dragonRage" && enemy.hp < enemy.maxHp * 0.3) {
    baseDmg = Math.floor(baseDmg * 1.6);
    log.push({ txt: L("😡 古龍暴怒！傷害×1.6", "😡 Dragon's rage! Damage ×1.6"), type: "enemy" });
  }

  const thorns = specials.filter((special: any) => special.type === "thorns").reduce((sum: any, special: any) => sum + special.val, 0);
  const reflect = specials.filter((special: any) => special.type === "reflect").reduce((sum: any, special: any) => sum + special.val, 0);
  if (thorns > 0) {
    enemy.hp = Math.max(0, enemy.hp - thorns);
    log.push({ txt: L(`🌵 荊棘反傷 ${thorns}`, `🌵 Thorns ${thorns}`), type: "hit" });
  }
  if (reflect > 0) {
    enemy.hp = Math.max(0, enemy.hp - reflect);
    log.push({ txt: L(`🔮 盾反 ${reflect}`, `🔮 Reflect ${reflect}`), type: "hit" });
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
    log.push({ txt: `${LF(enemy, "name")}→${LF(target, "name")} ${damageTaken}${L("傷害", " dmg")}`, type: "enemy" });
    if (target.curHp <= 0) {
      target.alive = false;
      log.push({ txt: L(`💀 ${target.name}陣亡！`, `💀 ${LF(target, "name")} has fallen!`), type: "lose" });
    }
    return { np, damageTaken };
  }

  const damageTaken = Math.max(1, enemy.attack - pDef + Math.floor(Math.random() * 4) - 2);
  np.hp = Math.max(0, np.hp - damageTaken);
  log.push({ txt: `${LF(enemy, "name")}→${L("你", "You")} ${damageTaken}${L("傷害", " dmg")}`, type: "enemy" });
  return { np, damageTaken };
}

function applyMercenaryWaveEnemyAfterEffects(enemy: any, np: any, pMhp: any, mercs: any[], log: any[]) {
  const healerMerc = mercs.find((merc: any) => merc.alive && ((merc.heal || 0) > 0 || merc.name.includes("治癒")));
  if (healerMerc) {
    const healAmount = healerMerc.heal || 8;
    np.hp = Math.min(np.hp + healAmount, pMhp);
    log.push({ txt: L(`💚${healerMerc.name}回復${healAmount}HP`, `💚${LF(healerMerc, "name")} heals ${healAmount} HP`), type: "heal" });
  }

  if (enemy.trait === "fire") {
    enemy.burnStacks = (enemy.burnStacks || 0) + 1;
    const burnDamage = enemy.burnStacks * 2;
    np.hp = Math.max(0, np.hp - burnDamage);
    log.push({ txt: L(`🔥 燒傷${burnDamage}`, `🔥 Burn ${burnDamage}`), type: "enemy" });
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
  setEffects?: { critChance: number; lifesteal: number; damageReduction: number },
  classEffects?: ClassEffects,
) {
  let nextBleed = bleed;
  let totalDmgDealt = 0;
  let crits = 0;
  let stuns = 0;
  let setTriggered = false;

  if (nextBleed > 0) {
    const bleedDamage = nextBleed * 3;
    const resist = enemy.trait === "undead" && Math.random() < 0.3;
    enemy.hp = Math.max(0, enemy.hp - (resist ? 0 : bleedDamage));
    log.push({ txt: resist ? L(`💀 ${enemy.name}抵抗流血！`, `💀 ${LF(enemy, "name")} resists bleed!`) : L(`🩸 流血${bleedDamage}傷害(${nextBleed}層)`, `🩸 Bleed ${bleedDamage} dmg (${nextBleed} stacks)`), type: resist ? "info" : "hit" });
  }
  if (enemy.hp <= 0) {
    return { np, bleed: nextBleed, totalDmgDealt, crits, stuns, setTriggered, enemyDefeated: true, stunned: false };
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
    log.push({ txt: L("⚡ 先制一擊！×1.5", "⚡ First strike! ×1.5"), type: "hit" });
  }

  let effectivePAtk = pAtk;
  if (classEffects?.rageMode && np.hp < pMhp * 0.3) {
    effectivePAtk = pAtk * 2;
    log.push({ txt: L("🔥 【狂戰士】暴怒！攻擊翻倍！", "🔥 [Berserker] Rage! ATK doubled!"), type: "hit" });
  }
  const dmg = Math.max(1, Math.floor((effectivePAtk - rawDef + Math.floor(Math.random() * 5) - 2) * dmgMult));
  const specResult = applySpec(specials, dmg, enemy);
  let healed = specResult.healed;
  let extra = specResult.extra;
  let isCrit = specResult.isCrit;

  if (!isCrit && classEffects?.firstRoundCrit && firstRound) {
    const critMult = classEffects.critMultiplier ?? 2;
    extra += Math.floor(dmg * (critMult - 1));
    isCrit = true;
    log.push({ txt: critMult > 2 ? L("💀 【暗殺者】首擊爆擊！", "💀 [Assassin] First-strike crit!") : L("🗡️ 【強盜】首擊爆擊！", "🗡️ [Rogue] First-strike crit!"), type: "hit" });
  }

  // Apply set bonus: extra crit chance
  if (!isCrit && setEffects && setEffects.critChance > 0 && Math.random() * 100 < setEffects.critChance) {
    extra += dmg;
    isCrit = true;
    setTriggered = true;
  }

  if (!isCrit && classEffects && classEffects.bonusCritChance > 0 && Math.random() * 100 < classEffects.bonusCritChance) {
    const critMult = classEffects.critMultiplier ?? 2;
    extra += Math.floor(dmg * (critMult - 1));
    isCrit = true;
    log.push({ txt: critMult > 2 ? L("💀 【暗殺者】爆擊！", "💀 [Assassin] Crit!") : L("🗡️ 【強盜】爆擊！", "🗡️ [Rogue] Crit!"), type: "hit" });
  }

  // Apply set bonus: lifesteal
  if (setEffects && setEffects.lifesteal > 0) {
    healed += Math.floor((dmg * setEffects.lifesteal) / 100);
    setTriggered = true;
  }
  const weaponResult = applyWeaponTrait(wc, dmg + extra, enemy, firstRound, nextBleed);
  weaponResult.log.forEach((entry) => log.push({ txt: entry, type: "hit" }));
  if (isCrit) {
    log.push({ txt: L("💥 爆擊！", "💥 Critical!"), type: "hit" });
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
    log.push({ txt: L(`回合${round}: 你→${enemy.icon}${enemy.name} ${actualDmg}${isCrit ? "💥" : ""}`, `R${round}: You→${enemy.icon}${LF(enemy, "name")} ${actualDmg}${isCrit ? "💥" : ""}`), type: "hit" });
  }

  // Inquisitor: holy wrath — extra attack equal to base damage
  if (classEffects?.holyWrathChance && classEffects.holyWrathChance > 0 && enemy.hp > 0 && Math.random() < classEffects.holyWrathChance) {
    enemy.hp = Math.max(0, enemy.hp - actualDmg);
    totalDmgDealt += actualDmg;
    log.push({ txt: L(`⚡ 【神裁官】神聖審判！+${actualDmg}傷害！`, `⚡ [Inquisitor] Holy Wrath! +${actualDmg} damage!`), type: "hit" });
  }

  // Spellsinger: arcane burst every 3rd round
  if (classEffects?.arcaneBurst && round % 3 === 0 && enemy.hp > 0) {
    const arcaneDmg = Math.floor(effectivePAtk * 1.5);
    enemy.hp = Math.max(0, enemy.hp - arcaneDmg);
    totalDmgDealt += arcaneDmg;
    log.push({ txt: L(`🔮 【法術詩人】奧術爆發！+${arcaneDmg}傷害`, `🔮 [Spellsinger] Arcane Burst! +${arcaneDmg} damage`), type: "hit" });
  }

  if (healed > 0) {
    np.hp = Math.min(np.hp + healed, pMhp);
    log.push({ txt: L(`🩸 吸血+${healed}HP`, `🩸 Lifesteal +${healed} HP`), type: "heal" });
  }

  // ShadowFiend: lifesteal on hit
  if (classEffects?.classLifesteal && classEffects.classLifesteal > 0 && actualDmg > 0) {
    const stolen = Math.floor((actualDmg * classEffects.classLifesteal) / 100);
    if (stolen > 0) {
      np.hp = Math.min(np.hp + stolen, pMhp);
      log.push({ txt: L(`🌑 【影魔】吸命+${stolen}HP`, `🌑 [Shadow Fiend] Lifesteal +${stolen} HP`), type: "heal" });
    }
  }

  // Cleric: regen per round
  if (classEffects && classEffects.regenPerRound > 0 && np.hp > 0) {
    np.hp = Math.min(np.hp + classEffects.regenPerRound, pMhp);
    log.push({ txt: L(`✝️ 神聖回復+${classEffects.regenPerRound}HP`, `✝️ Holy Regen +${classEffects.regenPerRound} HP`), type: "heal" });
  }

  // Archbishop: % of max HP regen per round
  if (classEffects?.regenPctPerRound && classEffects.regenPctPerRound > 0 && np.hp > 0) {
    const archRegen = Math.min(999, Math.floor(pMhp * classEffects.regenPctPerRound / 100));
    np.hp = Math.min(np.hp + archRegen, pMhp);
    log.push({ txt: L(`☀️ 【大主教】神聖光輝+${archRegen}HP`, `☀️ [Archbishop] Divine Light +${archRegen} HP`), type: "heal" });
  }

  // Apply set bonus: damage reduction on incoming attacks (applied later in enemyAttackPlayer)
  const regen = specials.filter((special: any) => special.type === "regen" || special.type === "vampiric").reduce((sum: any, special: any) => sum + special.val, 0);
  if (regen > 0 && np.hp > 0) {
    np.hp = Math.min(np.hp + regen, pMhp);
    log.push({ txt: L(`💚 回復+${regen}HP`, `💚 Regen +${regen} HP`), type: "heal" });
  }

  return { np, bleed: nextBleed, totalDmgDealt, crits, stuns, setTriggered, enemyDefeated: enemy.hp <= 0, stunned: weaponResult.stunned };
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
  // Equipment doesn't change mid-combat, so compute set bonuses once up front.
  const setEffects = getSetEffects(np);
  const classEffects = getClassEffects(np);
  let totalDmgDealt = 0;
  let totalDmgTaken = 0;
  let crits = 0;
  let stuns = 0;
  let setTriggers = 0;
  const roundCap = hooks.roundCap || 80;

  while (np.hp > 0 && enemy.hp > 0 && round < roundCap) {
    round += 1;

    const roundResult = resolvePlayerCombatRound(enemy, np, pAtk, pMhp, specials, wc, log, round, firstRound, bleed, setEffects, classEffects);
    np = roundResult.np;
    bleed = roundResult.bleed;
    totalDmgDealt += roundResult.totalDmgDealt;
    crits += roundResult.crits;
    stuns += roundResult.stuns;
    if (roundResult.setTriggered) setTriggers += 1;
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
      const inspired = classEffects.inspireChance > 0 && Math.random() < classEffects.inspireChance;
      const dodged = !inspired && classEffects.dodgeChance > 0 && Math.random() < classEffects.dodgeChance;
      if (inspired) {
        log.push({ txt: L("🎵 【吟遊詩人】旋律激勵！敵方本回合無法攻擊！", "🎵 [Bard] Inspiring melody! Enemy can't attack!"), type: "hit" });
      } else if (dodged) {
        log.push({ txt: L("🌀 【影舞者】完美閃避！傷害全免！", "🌀 [Shadow Dancer] Perfect dodge!"), type: "hit" });
      } else {
        const attackResult = hooks.enemyAttack
          ? hooks.enemyAttack({ enemy, np, pDef, pMhp, specials, log, round })
          : enemyAttackPlayer(enemy, pDef, specials, np, pMhp, log, round, setEffects, classEffects.blockChance, classEffects);
        np = attackResult.np || np;
        totalDmgTaken += attackResult.damageTaken || 0;
      }
    }

    if (hooks.afterEnemyRound) {
      const afterEnemyResult = hooks.afterEnemyRound({ enemy, np, round, log }) || {};
      np = afterEnemyResult.np || np;
    }

    firstRound = false;
  }

  bleedRef.val = bleed;
  return { np, won: enemy.hp <= 0, crits, stuns, totalDmgDealt, totalDmgTaken, setTriggers, rounds: round };
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

  log.push({ txt: L(`🗺 探險：${expedition.name}`, `🗺 Expedition: ${LF(expedition, "name")}`), type: "title" });
  log.push({ txt: `"${LF(expedition, "desc")}"`, type: "info" });
  if (wc) {
    log.push({ txt: `🗡 ${LF(wc, "label")} — ${LF(wc, "traitDesc")}`, type: "info" });
  }

  const enemy = buildEnemy(expedition.monster, np.level, 1);
  log.push({ txt: `━━ ${enemy.icon}${LF(enemy, "name")} ｜ HP:${enemy.maxHp} ${L("攻", "ATK")}:${enemy.attack} ${L("防", "DEF")}:${enemy.defense} ━━`, type: "sep" });
  log.push({ txt: `📜 ${enemy.lore}`, type: "info" });
  log.push({ txt: `⚡ ${L("特性", "Trait")}：${LF(enemy, "traitDesc")}`, type: "info" });

  const result = fightMonster(enemy, np, pAtk, pDef, pMhp, specials, wc, log, bleedRef);
  np = result.np;
  if (result.won) {
    recordKill(kills, enemy.key || expedition.monster || enemy.name, enemy.name);
    const expGain = Math.floor(enemy.expReward * expedition.expMult);
    const goldGain = Math.floor(enemy.goldReward * expedition.goldMult);
    np = lvUp(np, expGain, goldGain, log);
    log.push({ txt: L(`✅ 擊敗${enemy.name}！+${expGain}EXP +${goldGain}金`, `✅ Defeated ${LF(enemy, "name")}! +${expGain} EXP +${goldGain} gold`), type: "win" });
    if (Math.random() < 0.3 + expedition.lootBonus) {
      const drop = genLoot(np.level, expedition.lootBonus);
      drops.push(drop);
      log.push({ txt: L(`✨ 掉落：${drop.rarityLabel}【${drop.name}】`, `✨ Drop: ${LF(drop, "rarityLabel")} [${LF(drop, "name")}]`), type: "loot" });
    }
    if (Math.random() < 0.08 + expedition.lootBonus * 0.5) {
      const scroll = genMercScroll(np.level);
      drops.push(scroll);
      log.push({ txt: L(`📜 傭兵契約捲軸：${scroll.rarityLabel}【${scroll.name}】`, `📜 Merc Scroll: ${LF(scroll, "rarityLabel")} [${LF(scroll, "name")}]`), type: "loot" });
    }
  } else {
    log.push({ txt: L(`💀 被${enemy.name}擊敗！`, `💀 Defeated by ${LF(enemy, "name")}!`), type: "lose" });
    np.gold = Math.max(50, np.gold - Math.min(300, Math.floor(np.gold * 0.08)));
    np.hp = Math.floor(cMhp(np) * 0.3);
  }

  log.push({ txt: "─────────────────", type: "sep" });
  const expAvgDps = (result.rounds || 0) > 0 ? Math.round(result.totalDmgDealt / result.rounds) : 0;
  log.push({ txt: `📊 ${result.won ? L("勝利", "Victory") : L("落敗", "Defeat")} · ${L("造成", "Dealt")}${result.totalDmgDealt} · ${L("均傷", "Avg DPS")}${expAvgDps} · ${L("承受", "Taken")}${result.totalDmgTaken} · ${L("爆擊", "Crits")}${result.crits}${L("次", "")}${(result.setTriggers || 0) > 0 ? ` · ${L("套裝觸發", "Set procs")}${result.setTriggers}${L("次", "")}` : ""}`, type: result.won ? "win" : "lose" });
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
  let totalSetTriggers = 0;
  let totalRounds = 0;

  log.push({ txt: L(`⚔️ 進入 ${dungeon.name}【${tier.label}】`, `⚔️ Entering ${LF(dungeon, "name")} [${LF(tier, "label")}]`), type: "title" });
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
      log.push({ txt: L(`${enemy.icon}${enemy.name} 出現！(HP:${enemy.maxHp} 攻:${enemy.attack} ⚡${enemy.traitDesc})`, `${enemy.icon}${LF(enemy, "name")} appears! (HP:${enemy.maxHp} ATK:${enemy.attack} ⚡${LF(enemy, "traitDesc")})`), type: "info" });
      const result = fightMonster(enemy, np, pAtk, pDef, pMhp, specials, wc, log, bleedRef);
      np = result.np;
      totalDmgDealt += result.totalDmgDealt;
      totalDmgTaken += result.totalDmgTaken;
      totalCrits += result.crits;
      totalSetTriggers += result.setTriggers || 0;
      totalRounds += result.rounds || 0;
      if (result.won) {
        recordKill(kills, monsterKey, enemy.name);
        totalKills += 1;
        const expGain = Math.floor(enemy.expReward * tier.expMult);
        const goldGain = Math.floor(enemy.goldReward * tier.goldMult);
        np = lvUp(np, expGain, goldGain, log);
        log.push({ txt: L(`✅ 擊敗${enemy.name}！+${expGain}EXP +${goldGain}金`, `✅ Defeated ${LF(enemy, "name")}! +${expGain} EXP +${goldGain} gold`), type: "win" });
        if (Math.random() < 0.2 + tier.lootBonus * 0.5) {
          const drop = genLoot(np.level, tier.lootBonus);
          drops.push(drop);
          log.push({ txt: L(`✨ 掉落：${drop.rarityLabel}【${drop.name}】`, `✨ Drop: ${LF(drop, "rarityLabel")} [${LF(drop, "name")}]`), type: "loot" });
        }
      } else {
        log.push({ txt: L(`💀 在第${totalKills + 1}怪陣亡！`, `💀 Fell at monster #${totalKills + 1}!`), type: "lose" });
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
    log.push({ txt: `${boss.icon}${LF(boss, "name")} ｜ HP:${boss.maxHp} ${L("攻", "ATK")}:${boss.attack} ${L("防", "DEF")}:${boss.defense}`, type: "info" });
    log.push({ txt: `👹 ${L("Boss特性", "Boss trait")}：${LF(boss, "traitDesc")}`, type: "info" });
    const result = fightMonster(boss, np, pAtk, pDef, pMhp, specials, wc, log, bleedRef);
    np = result.np;
    totalDmgDealt += result.totalDmgDealt;
    totalDmgTaken += result.totalDmgTaken;
    totalCrits += result.crits;
    totalSetTriggers += result.setTriggers || 0;
    totalRounds += result.rounds || 0;
    if (result.won) {
      recordKill(kills, dungeon.boss || boss.key || boss.name, boss.name, "boss");
      totalKills += 1;
      const expGain = Math.floor(boss.expReward * tier.expMult);
      const goldGain = Math.floor(boss.goldReward * tier.goldMult);
      np = lvUp(np, expGain, goldGain, log);
      log.push({ txt: L(`👑 擊敗Boss ${boss.name}！+${expGain}EXP +${goldGain}金`, `👑 Boss ${LF(boss, "name")} defeated! +${expGain} EXP +${goldGain} gold`), type: "win" });
      if (Math.random() < 0.6 + tier.lootBonus) {
        const drop = genLoot(np.level, tier.lootBonus + 0.1);
        drops.push(drop);
        log.push({ txt: L(`✨ Boss掉落：${drop.rarityLabel}【${drop.name}】`, `✨ Boss drop: ${LF(drop, "rarityLabel")} [${LF(drop, "name")}]`), type: "loot" });
      }
      if (Math.random() < 0.25 + tier.lootBonus) {
        const scroll = genMercScroll(np.level);
        drops.push(scroll);
        log.push({ txt: L(`📜 Boss掉落契約捲軸：${scroll.rarityLabel}【${scroll.name}】`, `📜 Boss scroll drop: ${LF(scroll, "rarityLabel")} [${LF(scroll, "name")}]`), type: "loot" });
      }
    } else {
      log.push({ txt: L(`💀 敗於Boss ${boss.name}！`, `💀 Defeated by Boss ${LF(boss, "name")}!`), type: "lose" });
    }
  }

  const won = np.hp > 0;
  if (!won) {
    np.gold = Math.max(50, np.gold - Math.min(300, Math.floor(np.gold * 0.1)));
    np.hp = Math.floor(cMhp(np) * 0.3);
  }
  const totalMonsters = dungeon.waves.flatMap((wave: any) => wave.monsters).length + 1;
  log.push({ txt: "─────────────────", type: "sep" });
  const avgDps = totalRounds > 0 ? Math.round(totalDmgDealt / totalRounds) : 0;
  log.push({ txt: L("📊 戰鬥結算", "📊 Battle Summary"), type: "title" });
  log.push({ txt: `${won ? L("🏆 副本完成！", "🏆 Dungeon cleared!") : L("💀 副本失敗", "💀 Dungeon failed")} · ${L("擊殺", "Kills")}${totalKills}/${totalMonsters}`, type: won ? "win" : "lose" });
  log.push({ txt: `⚔ ${L("造成", "Dealt")}${totalDmgDealt} · ${L("均傷", "Avg DPS")}${avgDps} · ${L("承受", "Taken")}${totalDmgTaken} · ${L("爆擊", "Crits")}${totalCrits}${L("次", "")}${totalSetTriggers > 0 ? ` · ${L("套裝觸發", "Set procs")}${totalSetTriggers}${L("次", "")}` : ""} · ${L("掉落", "Drops")}${drops.length}${L("件", "")}`, type: "info" });
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
  let totalMercCrits = 0;
  let totalMercSetTriggers = 0;

  log.push({ txt: L(`🏴 傭兵副本：${dungeon.icon}${dungeon.label}`, `🏴 Merc Dungeon: ${dungeon.icon}${LF(dungeon, "label")}`), type: "title" });
  log.push({ txt: `"${LF(dungeon, "lore")}"`, type: "info" });
  log.push({ txt: `📢 ${L("傭兵", "Mercs")}：${nm.map((merc: any) => LF(merc, "name")).join(L("、", ", "))}`, type: "info" });

  for (let waveIndex = 0; waveIndex < dungeon.waves.length; waveIndex += 1) {
    const wave = dungeon.waves[waveIndex];
    if (np.hp <= 0) {
      break;
    }
    log.push({ txt: L(`━━ 第${waveIndex + 1}波 — ${wave.desc} ━━`, `━━ Wave ${waveIndex + 1} — ${LF(wave, "desc")} ━━`), type: "sep" });
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
      log.push({ txt: L(`${enemy.icon}${enemy.name} 出現！HP:${enemy.maxHp} 攻:${enemy.attack} ⚡${enemy.traitDesc}`, `${enemy.icon}${LF(enemy, "name")} appears! HP:${enemy.maxHp} ATK:${enemy.attack} ⚡${LF(enemy, "traitDesc")}`), type: "info" });

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
      totalMercCrits += result.crits || 0;
      totalMercSetTriggers += result.setTriggers || 0;

      if (np.hp > 0 && enemy.hp <= 0) {
        recordKill(kills, monsterData ? monsterKey : enemy.name, enemy.name);
        const expGain = Math.floor(enemy.expReward * ((dungeon.reward && dungeon.reward.expMult) || 1.2));
        const goldGain = Math.floor(enemy.goldReward * ((dungeon.reward && dungeon.reward.goldMult) || 1.5));
        np = lvUp(np, expGain, goldGain, log);
        log.push({ txt: L(`✅ 擊敗${enemy.name}！+${expGain}EXP +${goldGain}金`, `✅ Defeated ${LF(enemy, "name")}! +${expGain} EXP +${goldGain} gold`), type: "win" });
      } else if (np.hp <= 0) {
        log.push({ txt: L("💀 你陣亡！", "💀 You have fallen!"), type: "lose" });
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
    log.push({ txt: L(`👑 副本首領：${bossData.icon}${bossData.name} 登場！`, `👑 Dungeon Boss: ${bossData.icon}${LF(bossData, "name")} enters!`), type: "title" });
    log.push({ txt: `HP:${bossEnemy.maxHp} ${L("攻", "ATK")}:${bossEnemy.attack} ${L("防", "DEF")}:${bossEnemy.defense}`, type: "info" });
    const bleedRef = { val: 0 };
    const result = fightMonster(bossEnemy, np, pAtk, pDef, pMhp, specials, getWeaponCat(np), log, bleedRef);
    np = result.np;
    totalDmgDealt += result.totalDmgDealt;
    totalMercCrits += result.crits || 0;
    totalMercSetTriggers += result.setTriggers || 0;
    if (result.won) {
      recordKill(kills, bossData.name, bossData.name, "boss");
      np = lvUp(np, bossEnemy.expReward, bossEnemy.goldReward, log);
      log.push({ txt: L(`👑 擊敗首領${bossData.name}！+${bossEnemy.expReward}EXP`, `👑 Boss ${LF(bossData, "name")} defeated! +${bossEnemy.expReward} EXP`), type: "win" });
      const scrollBonus = (dungeon.reward && dungeon.reward.scrollBonus) || 0.3;
      if (Math.random() < scrollBonus) {
        const scroll = genMercScroll(np.level);
        drops.push(scroll);
        log.push({ txt: L(`📜 首領掉落契約捲軸：${scroll.rarityLabel}【${scroll.name}】`, `📜 Boss scroll drop: ${LF(scroll, "rarityLabel")} [${LF(scroll, "name")}]`), type: "loot" });
      }
      if (Math.random() < 0.4) {
        const drop = genLoot(np.level, 0.2);
        drops.push(drop);
        log.push({ txt: L(`✨ 掉落：${drop.rarityLabel}【${drop.name}】`, `✨ Drop: ${LF(drop, "rarityLabel")} [${LF(drop, "name")}]`), type: "loot" });
      }
    } else {
      log.push({ txt: L(`💀 敗於首領${bossData.name}！`, `💀 Defeated by Boss ${LF(bossData, "name")}!`), type: "lose" });
    }
  }

  const won = np.hp > 0;
  if (!won) {
    np.gold = Math.max(50, np.gold - Math.min(300, Math.floor(np.gold * 0.08)));
    np.hp = Math.floor(cMhp(np) * 0.3);
  }
  log.push({ txt: "─────────────────", type: "sep" });
  log.push({ txt: `📊 ${won ? L("勝利", "Victory") : L("落敗", "Defeat")} · ${L("造成", "Dealt")}${totalDmgDealt} · ${L("承受", "Taken")}${totalDmgTaken} · ${L("爆擊", "Crits")}${totalMercCrits}${L("次", "")}${totalMercSetTriggers > 0 ? ` · ${L("套裝觸發", "Set procs")}${totalMercSetTriggers}${L("次", "")}` : ""} · ${L("掉落", "Drops")}${drops.length}${L("件", "")}`, type: won ? "win" : "lose" });
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

  log.push(L(`⚔️ 戰鬥開始！你 vs ${enemy.name}`, `⚔️ Battle start! You vs ${LF(enemy, "name")}`));
  log.push(L(`⚡ 速度比較：你 ${pSpd} vs ${enemy.name} ${eSpd}${pSpd > eSpd ? "（你的速度更快，先手攻擊）" : ""}`, `⚡ Speed: You ${pSpd} vs ${LF(enemy, "name")} ${eSpd}${pSpd > eSpd ? " (you're faster, first strike)" : ""}`));

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

  log.push({ txt: L(`⚔️ 競技場對決！`, `⚔️ Arena Duel!`), type: "title" });
  log.push({ txt: L(`你 (Lv.${player.level} 攻${pAtk} 防${pDef}) vs ${opponent.name} (Lv.${opponent.level} 攻${opponent.attack} 防${opponent.defense})`, `You (Lv.${player.level} ATK${pAtk} DEF${pDef}) vs ${LF(opponent, "name")} (Lv.${opponent.level} ATK${opponent.attack} DEF${opponent.defense})`), type: "info" });
  if (wc)  log.push({ txt: L(`你的武器：${wc.label} — ${wc.traitDesc}`, `Your weapon: ${LF(wc, "label")} — ${LF(wc, "traitDesc")}`), type: "info" });
  if (oWc) log.push({ txt: L(`對手武器：${oWc.label} — ${oWc.traitDesc}`, `Foe's weapon: ${LF(oWc, "label")} — ${LF(oWc, "traitDesc")}`), type: "info" });
  log.push({ txt: `━━━━━━━━━━━━━━━━━━`, type: "sep" });

  if (pSpd >= oSpd || (wc && wc.trait === "firstblood")) {
    log.push({ txt: L(`⚡ 你先手！（速度 ${pSpd} vs ${oSpd}）`, `⚡ You strike first! (SPD ${pSpd} vs ${oSpd})`), type: "hit" });
  } else {
    log.push({ txt: L(`⚡ 對手先手！（速度 ${oSpd} vs ${pSpd}）`, `⚡ Foe strikes first! (SPD ${oSpd} vs ${pSpd})`), type: "enemy" });
  }

  const fakeEnemy = {
    name: opponent.name, nameEn: opponent.nameEn || opponent.name, icon: "🏟",
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
    log.push({ txt: L(`🏆 勝利！擊敗 ${opponent.name}！`, `🏆 Victory! Defeated ${LF(opponent, "name")}!`), type: "win" });
    log.push({ txt: L(`💰 掠奪金幣 ${goldPlundered}（對手攜帶 ${opponent.goldCarried}）`, `💰 Plundered ${goldPlundered} gold (foe carried ${opponent.goldCarried})`), type: "win" });
  } else {
    log.push({ txt: `━━━━━━━━━━━━━━━━━━`, type: "sep" });
    log.push({ txt: L(`💀 落敗！被 ${opponent.name} 擊倒！`, `💀 Defeated by ${LF(opponent, "name")}!`), type: "lose" });
    log.push({ txt: L(`🛌 你需要休息 30 分鐘才能再戰`, `🛌 Rest 30 min before fighting again`), type: "lose" });
  }
  log.push({ txt: `─────────────────`, type: "sep" });
  log.push({ txt: `📊 ${L("造成", "Dealt")} ${result.totalDmgDealt} · ${L("承受", "Taken")} ${result.totalDmgTaken} · ${L("爆擊", "Crits")} ${result.crits}${L("次", "")}${(result.setTriggers || 0) > 0 ? ` · ${L("套裝觸發", "Set procs")}${result.setTriggers}${L("次", "")}` : ""}`, type: "info" });

  return { log, finalPlayer: result.np, won, goldPlundered };
}
