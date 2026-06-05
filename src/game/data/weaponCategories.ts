export const WEAPON_CATEGORIES: Record<string, Record<string, any>> = {
  sword: { label: "劍", labelEn: "Sword", icon: "⚔️", trait: "balanced", traitDesc: "平衡型，無特殊效果", traitDescEn: "Balanced, no special effect" },
  dagger: { label: "匕首", labelEn: "Dagger", icon: "🗡️", trait: "swift", traitDesc: "速度+3，首回合傷害×1.5", traitDescEn: "SPD+3, first round ×1.5" },
  axe: { label: "斧", labelEn: "Axe", icon: "🪓", trait: "armorbreak", traitDesc: "無視敵方 20% 防禦", traitDescEn: "Ignore 20% enemy DEF" },
  hammer: { label: "錘", labelEn: "Hammer", icon: "🔨", trait: "stun", traitDesc: "10% 機率使敵人本回合無法攻擊", traitDescEn: "10% chance to stun" },
  spear: { label: "長矛", labelEn: "Spear", icon: "🏹", trait: "firstblood", traitDesc: "先手攻擊，永遠先出手", traitDescEn: "Always attack first" },
  trident: { label: "三叉戟", labelEn: "Trident", icon: "🔱", trait: "bleed", traitDesc: "造成流血，每回合額外 3 傷害", traitDescEn: "Bleed: +3 damage/round" },
  sickle: { label: "鐮刀", labelEn: "Sickle", icon: "☽", trait: "crit_boost", traitDesc: "爆擊率額外 +10%", traitDescEn: "+10% crit rate" },
  angel: { label: "死亡天使", labelEn: "Death Angel", icon: "🪽", trait: "soulstrike", traitDesc: "低血時傷害+50%（敵人HP<30%）", traitDescEn: "Low HP: damage +50% (enemy <30%)" },
  club: { label: "棍棒", labelEn: "Club", icon: "🪵", trait: "bonecrush", traitDesc: "每回合額外 2 點固定傷害", traitDescEn: "+2 flat damage/round" },
  staff: { label: "法杖", labelEn: "Staff", icon: "🪄", trait: "spellpower", traitDesc: "吸血效果翻倍", traitDescEn: "Lifesteal doubled" },
};
