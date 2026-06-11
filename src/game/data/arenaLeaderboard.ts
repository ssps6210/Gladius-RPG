export interface ArenaLeaderboardNpc {
  id: string;
  name: string;
  nameEn: string;
  level: number;
  wins: number;
  losses: number;
  classIcon: string;
}

export const ARENA_NPC_PLAYERS: ArenaLeaderboardNpc[] = [
  { id: "npc_01", name: "血鐵劍士・艾克",    nameEn: "Axe・Erik",        level: 52, wins: 812, losses: 120, classIcon: "⚔" },
  { id: "npc_02", name: "沙漠之鷹・法魯克",   nameEn: "Desert Hawk・Farouk", level: 48, wins: 634, losses: 198, classIcon: "🏹" },
  { id: "npc_03", name: "鐵壁・諾爾曼",      nameEn: "IronWall・Norman",  level: 45, wins: 509, losses: 241, classIcon: "🛡" },
  { id: "npc_04", name: "毒牙・薇拉",        nameEn: "Viper・Vera",       level: 41, wins: 388, losses: 177, classIcon: "🗡" },
  { id: "npc_05", name: "暗影・瑞斯",        nameEn: "Shadow・Rys",       level: 38, wins: 305, losses: 162, classIcon: "🌑" },
  { id: "npc_06", name: "閃電・托爾格",      nameEn: "Thunder・Torgue",   level: 35, wins: 229, losses: 139, classIcon: "⚡" },
  { id: "npc_07", name: "石拳・布朗",        nameEn: "Stonefist・Brown",  level: 31, wins: 175, losses: 128, classIcon: "👊" },
  { id: "npc_08", name: "紅月・麗蓮娜",      nameEn: "RedMoon・Liliana",  level: 27, wins: 122, losses: 110, classIcon: "🌙" },
  { id: "npc_09", name: "孤狼・葛雷格",      nameEn: "Lone Wolf・Greg",   level: 23, wins: 84,  losses: 96,  classIcon: "🐺" },
  { id: "npc_10", name: "青銅劍・馬庫斯",    nameEn: "Bronze・Marcus",    level: 18, wins: 45,  losses: 87,  classIcon: "⚔" },
  { id: "npc_11", name: "新手・提姆",        nameEn: "Rookie・Tim",       level: 12, wins: 18,  losses: 67,  classIcon: "🗡" },
  { id: "npc_12", name: "菜鳥・阿鋒",        nameEn: "Newbie・Fong",      level: 8,  wins: 6,   losses: 44,  classIcon: "👶" },
];
