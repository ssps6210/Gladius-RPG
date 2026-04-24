export const WEAPON_CATEGORIES: Record<string, Record<string, any>> = {
  sword: { label: "劍", icon: "⚔️", trait: "balanced", traitDesc: "平衡型，無特殊效果" },
  dagger: { label: "匕首", icon: "🗡️", trait: "swift", traitDesc: "速度+3，首回合傷害×1.5" },
  axe: { label: "斧", icon: "🪓", trait: "armorbreak", traitDesc: "無視敵方 20% 防禦" },
  hammer: { label: "錘", icon: "🔨", trait: "stun", traitDesc: "10% 機率使敵人本回合無法攻擊" },
  spear: { label: "長矛", icon: "🏹", trait: "firstblood", traitDesc: "先手攻擊，永遠先出手" },
  trident: { label: "三叉戟", icon: "🔱", trait: "bleed", traitDesc: "造成流血，每回合額外 3 傷害" },
  sickle: { label: "鐮刀", icon: "☽", trait: "crit_boost", traitDesc: "爆擊率額外 +10%" },
  angel: { label: "死亡天使", icon: "🪽", trait: "soulstrike", traitDesc: "低血時傷害+50%（敵人HP<30%）" },
  club: { label: "棍棒", icon: "🪵", trait: "bonecrush", traitDesc: "每回合額外 2 點固定傷害" },
  staff: { label: "法杖", icon: "🪄", trait: "spellpower", traitDesc: "吸血效果翻倍" },
};
