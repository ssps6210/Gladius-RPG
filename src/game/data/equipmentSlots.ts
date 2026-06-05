export const EQUIP_SLOTS: Array<Record<string, any>> = [
  { id: "weapon", label: "武器", labelEn: "Weapon", icon: "⚔️", row: 0 },
  { id: "offhand", label: "副手", labelEn: "Off-hand", icon: "🛡️", row: 0 },
  { id: "helmet", label: "頭盔", labelEn: "Helmet", icon: "⛑️", row: 1 },
  { id: "armor", label: "胸甲", labelEn: "Armor", icon: "🥋", row: 1 },
  { id: "gloves", label: "手套", labelEn: "Gloves", icon: "🧤", row: 2 },
  { id: "boots", label: "靴子", labelEn: "Boots", icon: "👢", row: 2 },
  { id: "ring", label: "戒指", labelEn: "Ring", icon: "💍", row: 3 },
  { id: "amulet", label: "護符", labelEn: "Amulet", icon: "📿", row: 3 },
  { id: "weapon2", label: "副武器", labelEn: "2nd Weapon", icon: "🗡️", row: 0, classUnlock: "warrior", effectiveness: 0.5 },
  { id: "ring2", label: "第二戒指", labelEn: "Ring II", icon: "💍", row: 3, classUnlock: "bard", effectiveness: 1.0 },
  { id: "armor2", label: "影甲", labelEn: "Shadow Armor", icon: "🥷", row: 1, classUnlock: "rogue", effectiveness: 0.7 },
];
