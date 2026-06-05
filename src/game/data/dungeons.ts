export const DUNGEONS: Array<Record<string, any>> = [
  {
    id: 1, name: "野狼森林", nameEn: "Wolf Forest", icon: "🌲", minLv: 1,
    lore: "古老森林中，餓狼群和山賊聯手封鎖了道路。傳說深處有一頭稱王的巨狼。",
    waves: [
      { label: "第一波 — 外圍", monsters: ["wolf", "wolf", "boar"], desc: "巡邏的狼群和野豬" },
      { label: "第二波 — 林中", monsters: ["bandit", "bandit", "wolf"], desc: "山賊與狼的聯合伏擊" },
      { label: "第三波 — 巢穴", monsters: ["boar", "wolf", "bandit"], desc: "守衛巢穴的精銳" },
    ],
    boss: "wolfKing",
    bossIntro: "狼王現身！整片森林都在顫抖！",
  },
  {
    id: 2, name: "廢棄礦坑", nameEn: "Abandoned Mine", icon: "⛏️", minLv: 3,
    lore: "古老礦坑深處藏有珍貴礦石，但礦工們的怨靈和石巨人讓探險者有去無回。",
    waves: [
      { label: "第一波 — 礦道入口", monsters: ["goblin", "goblin", "goblin"], desc: "成群的地精守衛" },
      { label: "第二波 — 深礦通道", monsters: ["ghostMiner", "goblin", "golem"], desc: "亡魂與石巨人聯手" },
      { label: "第三波 — 礦坑核心", monsters: ["golem", "ghostMiner", "goblin"], desc: "核心守衛精銳部隊" },
    ],
    boss: "mineLord",
    bossIntro: "礦坑主從黑暗中現身，手持巨型鶴嘴鋤！",
  },
  {
    id: 3, name: "地下神殿", nameEn: "Underground Temple", icon: "🏛️", minLv: 6,
    lore: "沉睡千年的古神殿突然甦醒，不死怨靈和黑暗惡魔在石柱間遊蕩，古老的守護者也再度睜眼。",
    waves: [
      { label: "第一波 — 神殿外庭", monsters: ["skeleton", "skeleton", "cultist"], desc: "骷髏兵和黑暗祭司" },
      { label: "第二波 — 祭壇大廳", monsters: ["demon", "cultist", "skeleton"], desc: "惡魔與祭司的聯合防線" },
      { label: "第三波 — 聖所深處", monsters: ["demon", "demon", "cultist"], desc: "最強惡魔守衛隊" },
    ],
    boss: "templeGuard",
    bossIntro: "神殿守護者從石像甦醒，散發神聖光輝！",
  },
  {
    id: 4, name: "龍穴深淵", nameEn: "Dragon Lair", icon: "🐉", minLv: 10,
    lore: "傳說古龍在深淵深處沉眠了三百年。牠的子嗣守護著洞穴，而覺醒的古龍將毀滅一切。",
    waves: [
      { label: "第一波 — 龍穴入口", monsters: ["wyvern", "dragonKnight"], desc: "幼龍與龍族武士" },
      { label: "第二波 — 熔岩走廊", monsters: ["fireGiant", "wyvern", "wyvern"], desc: "火焰巨人和幼龍群" },
      { label: "第三波 — 古龍前廳", monsters: ["dragonKnight", "dragonKnight", "fireGiant"], desc: "龍族精銳" },
    ],
    boss: "ancientDragon",
    bossIntro: "古龍緩跨張開雙眼，千年的怒火瞬間噴發！",
  },
  {
    id: 5, name: "虛空深淵", nameEn: "Void Abyss", icon: "🌀", minLv: 15,
    lore: "現實世界的裂縫正在擴大。暗影獸和巫妖從裂縫中湧出，而深淵之主即將踏入這個世界。",
    waves: [
      { label: "第一波 — 裂縫前線", monsters: ["shadowBeast", "shadowBeast", "lich"], desc: "暗影獸與巫妖" },
      { label: "第二波 — 虛空領域", monsters: ["titan", "shadowBeast", "lich"], desc: "泰坦帶領暗影部隊" },
      { label: "第三波 — 深淵核心", monsters: ["lich", "titan", "shadowBeast"], desc: "深淵最強守衛" },
    ],
    boss: "abyssLord",
    bossIntro: "深淵之主現身！虛空撕裂，現實崩潰！",
  },
  {
    id: 6, name: "墮落聖殿", nameEn: "Fallen Cathedral", icon: "☀️", minLv: 30,
    lore: "墮落的神明從天界降臨，神聖的魔像和墮落聖騎士橫掃大地。你必須突破神明的防線，挑戰墮落的墮落大主教。",
    waves: [
      { label: "第一波 — 天界前衛", monsters: ["celestialKnight", "celestialKnight", "voidSpawn"], desc: "墮落聖騎士的先鋒部隊" },
      { label: "第二波 — 古教堂魔像陣", monsters: ["divineGolem", "celestialKnight", "celestialKnight"], desc: "魔像守衛強行阻擋" },
      { label: "第三波 — 聖殿深處", monsters: ["divineGolem", "divineGolem", "celestialKnight"], desc: "神殿核心守衛精銳" },
    ],
    boss: "celestialLord",
    bossIntro: "墮落大主教現身！聖光已腐化為詛咒！",
  },
  {
    id: 7, name: "煉獄裂縫", nameEn: "Purgatory Rift", icon: "🌪️", minLv: 42,
    lore: "時空裂縫中湧出混沌之力，獵犬和收割者橫行大地。裂縫深處，混沌審判者正在召喚更大的毀滅。",
    waves: [
      { label: "第一波 — 裂縫邊緣", monsters: ["chaosHound", "chaosHound", "voidSpawn"], desc: "地獄獵犬的狂暴衝鋒" },
      { label: "第二波 — 混沌深淵", monsters: ["voidReaper", "chaosHound", "chaosHound"], desc: "收割者帶領獵犬進攻" },
      { label: "第三波 — 魔君前廳", monsters: ["voidReaper", "voidReaper", "chaosHound"], desc: "最強混沌精銳守衛" },
    ],
    boss: "chaosLord",
    bossIntro: "混沌審判者現身！審判之日，無人倖免！",
  },
  {
    id: 8, name: "遠古王的遺跡", nameEn: "Ruins of the Ancient King", icon: "🌌", minLv: 58,
    lore: "宇宙誕生之地已經醒來。石棺守衛和遠古蜥蜴獸守衛著創世的奧秘，而宇宙裂縫深處，原初神的憤怒將毀滅萬物。",
    waves: [
      { label: "第一波 — 遺跡外圍", monsters: ["ancientGuardian", "primordialbeast", "ancientGuardian"], desc: "石棺守衛的初次試煉" },
      { label: "第二波 — 創世核心", monsters: ["primordialbeast", "ancientGuardian", "voidReaper"], desc: "遠古蜥蜴獸傾巢而出" },
      { label: "第三波 — 宇宙深淵", monsters: ["ancientGuardian", "primordialbeast", "primordialbeast"], desc: "創世遺跡最終守衛" },
    ],
    boss: "primordialgod",
    bossIntro: "遠古王從廢墟中甦醒！千年詛咒籠罩大地！",
  },
];
