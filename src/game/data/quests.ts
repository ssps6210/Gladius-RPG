const RARITY_ZH: Record<string, string> = { mythic: "神話", legendary: "傳說", rare: "稀有", magic: "魔法" };
const RARITY_EN: Record<string, string> = { mythic: "Mythic", legendary: "Legendary", rare: "Rare", magic: "Magic" };
const RARITY_CN: Record<string, string> = { mythic: "神话", legendary: "传说", rare: "稀有", magic: "魔法" };

const QUEST_REWARDS = {
  gold:   (value: any) => ({ type: "gold",   value,  label: `🪙 ${value} 金幣`,                        labelEn: `🪙 ${value} Gold`,             labelCn: `🪙 ${value} 金币` }),
  exp:    (value: any) => ({ type: "exp",    value,  label: `✨ ${value} EXP`,                          labelEn: `✨ ${value} EXP`,               labelCn: `✨ ${value} EXP` }),
  item:   (rarity: any) => ({ type: "item",  rarity, label: `🎁 ${RARITY_ZH[rarity] || "魔法"}裝備×1`, labelEn: `🎁 ${RARITY_EN[rarity] || "Magic"} Gear×1`,          labelCn: `🎁 ${RARITY_CN[rarity] || "魔法"}装备×1` }),
  weapon: (rarity: any) => ({ type: "weapon", rarity, label: `⚔ ${RARITY_ZH[rarity] || "傳說"}武器×1`, labelEn: `⚔ ${RARITY_EN[rarity] || "Legendary"} Weapon×1`,    labelCn: `⚔ ${RARITY_CN[rarity] || "传说"}武器×1` }),
  scroll: (rarity: any) => ({ type: "scroll", rarity, label: `📜 ${RARITY_ZH[rarity] || "魔法"}傭兵捲軸×1`, labelEn: `📜 ${RARITY_EN[rarity] || "Magic"} Merc Scroll×1`, labelCn: `📜 ${RARITY_CN[rarity] || "魔法"}佣兵卷轴×1` }),
};

export const QUEST_DEFS: Record<string, Record<string, any>> = {
  // ── Class milestone quests (pinned first in achieve tab) ──────────────────
  q_class1: {
    cat: "achieve", icon: "⚔", field: "jobClass", target: 1, special: "class1",
    title: "初次轉職", titleEn: "First Class", titleCn: "初次转职",
    desc: "達到 Lv.30 後選擇你的轉職職業",
    descEn: "Reach Lv.30 and choose your first class",
    descCn: "达到 Lv.30 后选择你的转职职业",
    rewards: [QUEST_REWARDS.gold(10000), QUEST_REWARDS.weapon("legendary")],
  },
  q_class2: {
    cat: "achieve", icon: "🔥", field: "jobClass", target: 1, special: "class2",
    title: "二轉飛升", titleEn: "Second Awakening", titleCn: "二转飞升",
    desc: "達到 Lv.70 後升級為二轉職業",
    descEn: "Reach Lv.70 and ascend to a Tier 2 class",
    descCn: "达到 Lv.70 后升级为二转职业",
    rewards: [QUEST_REWARDS.gold(100000), QUEST_REWARDS.weapon("mythic")],
  },

  // ── Daily ─────────────────────────────────────────────────────────────────
  d1: { cat: "daily",   icon: "🗡", title: "今日狩獵",   titleEn: "Today's Hunt",          titleCn: "今日狩猎",   desc: "完成 3 次探險",        descEn: "Complete 3 expeditions",     descCn: "完成 3 次探险",        field: "totalExpeditions", target: 3,   rewards: [QUEST_REWARDS.gold(80), QUEST_REWARDS.exp(120)] },
  d2: { cat: "daily",   icon: "⚔", title: "副本出征",   titleEn: "Dungeon Run",            titleCn: "副本出征",   desc: "完成 1 個副本",        descEn: "Complete 1 dungeon",         descCn: "完成 1 个副本",        field: "totalDungeons",    target: 1,   rewards: [QUEST_REWARDS.gold(150), QUEST_REWARDS.exp(200)] },
  d3: { cat: "daily",   icon: "💀", title: "每日殺戮",   titleEn: "Daily Slaughter",        titleCn: "每日杀戮",   desc: "擊殺 10 隻怪物",      descEn: "Kill 10 monsters",           descCn: "击杀 10 只怪物",      field: "totalKills",       target: 10,  rewards: [QUEST_REWARDS.gold(60), QUEST_REWARDS.exp(80)] },
  d4: { cat: "daily",   icon: "🏟", title: "競技場試煉", titleEn: "Arena Trial",            titleCn: "竞技场试炼", desc: "贏得 1 場競技場對決", descEn: "Win 1 arena battle",         descCn: "赢得 1 场竞技场对决", field: "totalArenaWins",   target: 1,   rewards: [QUEST_REWARDS.gold(200), QUEST_REWARDS.exp(150)] },
  d5: { cat: "daily",   icon: "🪙", title: "財富積累",   titleEn: "Wealth Accumulation",    titleCn: "财富积累",   desc: "賺取 500 金幣",       descEn: "Earn 500 gold",              descCn: "赚取 500 金币",       field: "totalGoldEarned",  target: 500, rewards: [QUEST_REWARDS.exp(100), QUEST_REWARDS.item("magic")] },

  // ── Weekly ────────────────────────────────────────────────────────────────
  w1: { cat: "weekly",  icon: "🏆", title: "周冠軍",     titleEn: "Weekly Champion",        titleCn: "周冠军",     desc: "贏得 5 場競技場",     descEn: "Win 5 arena battles",        descCn: "赢得 5 场竞技场",     field: "totalArenaWins",   target: 5,   rewards: [QUEST_REWARDS.gold(500), QUEST_REWARDS.exp(600), QUEST_REWARDS.item("rare")] },
  w2: { cat: "weekly",  icon: "🐉", title: "副本征服者", titleEn: "Dungeon Conqueror",       titleCn: "副本征服者", desc: "完成 5 個副本",       descEn: "Complete 5 dungeons",        descCn: "完成 5 个副本",       field: "totalDungeons",    target: 5,   rewards: [QUEST_REWARDS.gold(400), QUEST_REWARDS.exp(500), QUEST_REWARDS.scroll("rare")] },
  w3: { cat: "weekly",  icon: "⚒", title: "鍛造狂人",   titleEn: "Forge Maniac",           titleCn: "锻造狂人",   desc: "強化裝備 10 次",      descEn: "Enhance gear 10 times",      descCn: "强化装备 10 次",      field: "totalEnhances",    target: 10,  rewards: [QUEST_REWARDS.gold(300), QUEST_REWARDS.item("rare")] },
  w4: { cat: "weekly",  icon: "💪", title: "訓練達人",   titleEn: "Training Master",        titleCn: "训练达人",   desc: "訓練屬性 8 次",       descEn: "Train attributes 8 times",   descCn: "训练属性 8 次",       field: "totalTrains",      target: 8,   rewards: [QUEST_REWARDS.gold(400), QUEST_REWARDS.exp(400), QUEST_REWARDS.item("legendary")] },
  w5: { cat: "weekly",  icon: "🏴", title: "傭兵統帥",   titleEn: "Merc Commander",         titleCn: "佣兵统帅",   desc: "完成 3 個傭兵副本",   descEn: "Complete 3 merc dungeons",   descCn: "完成 3 个佣兵副本",   field: "totalMercRuns",    target: 3,   rewards: [QUEST_REWARDS.gold(350), QUEST_REWARDS.scroll("legendary")] },

  // ── Achieve ───────────────────────────────────────────────────────────────
  a1:  { cat: "achieve", icon: "🌟", title: "初出茅廬",   titleEn: "Novice",            titleCn: "初出茅庐",   desc: "達到 Lv.5",             descEn: "Reach Lv.5",              descCn: "达到 Lv.5",             field: "highestLevel",   target: 5,    rewards: [QUEST_REWARDS.gold(200), QUEST_REWARDS.exp(300)] },
  a2:  { cat: "achieve", icon: "⭐", title: "戰場老兵",   titleEn: "Battle Veteran",    titleCn: "战场老兵",   desc: "達到 Lv.15",            descEn: "Reach Lv.15",             descCn: "达到 Lv.15",            field: "highestLevel",   target: 15,   rewards: [QUEST_REWARDS.gold(500), QUEST_REWARDS.exp(800), QUEST_REWARDS.item("rare")] },
  a3:  { cat: "achieve", icon: "💫", title: "傳說鬥士",   titleEn: "Legendary Fighter", titleCn: "传说斗士",   desc: "達到 Lv.30",            descEn: "Reach Lv.30",             descCn: "达到 Lv.30",            field: "highestLevel",   target: 30,   rewards: [QUEST_REWARDS.gold(1000), QUEST_REWARDS.exp(2000), QUEST_REWARDS.item("legendary")] },
  a4:  { cat: "achieve", icon: "💀", title: "屠夫",       titleEn: "Butcher",           titleCn: "屠夫",       desc: "累計擊殺 100 隻怪物",   descEn: "Kill 100 monsters total", descCn: "累计击杀 100 只怪物",   field: "totalKills",     target: 100,  rewards: [QUEST_REWARDS.gold(300), QUEST_REWARDS.item("rare")] },
  a5:  { cat: "achieve", icon: "☠",  title: "死神",       titleEn: "Death",             titleCn: "死神",       desc: "累計擊殺 1000 隻怪物",  descEn: "Kill 1000 monsters total",descCn: "累计击杀 1000 只怪物",  field: "totalKills",     target: 1000, rewards: [QUEST_REWARDS.gold(800), QUEST_REWARDS.item("legendary")] },
  a6:  { cat: "achieve", icon: "👑", title: "Boss獵人",   titleEn: "Boss Hunter",       titleCn: "Boss猎人",   desc: "擊殺 10 個 Boss",       descEn: "Kill 10 bosses",          descCn: "击杀 10 个 Boss",       field: "totalBossKills", target: 10,   rewards: [QUEST_REWARDS.gold(400), QUEST_REWARDS.exp(600), QUEST_REWARDS.item("legendary")] },
  a7:  { cat: "achieve", icon: "🏅", title: "競技場新星", titleEn: "Arena Rising Star",  titleCn: "竞技场新星", desc: "贏得 10 場競技場",      descEn: "Win 10 arena battles",    descCn: "赢得 10 场竞技场",      field: "totalArenaWins", target: 10,   rewards: [QUEST_REWARDS.gold(400), QUEST_REWARDS.exp(500), QUEST_REWARDS.scroll("rare")] },
  a8:  { cat: "achieve", icon: "🥇", title: "競技場王者", titleEn: "Arena King",         titleCn: "竞技场王者", desc: "贏得 50 場競技場",      descEn: "Win 50 arena battles",    descCn: "赢得 50 场竞技场",      field: "totalArenaWins", target: 50,   rewards: [QUEST_REWARDS.gold(1000), QUEST_REWARDS.scroll("mythic")] },
  a9:  { cat: "achieve", icon: "⚒", title: "鍛造大師",   titleEn: "Forge Master",      titleCn: "锻造大师",   desc: "成功強化到 +7 以上",    descEn: "Enhance to +7 or above",  descCn: "成功强化到 +7 以上",    field: "totalEnhances",  target: 1,    rewards: [QUEST_REWARDS.gold(500), QUEST_REWARDS.item("legendary")], special: "enh7" },
  a10: { cat: "achieve", icon: "💎", title: "神話收藏家", titleEn: "Mythic Collector",   titleCn: "神话收藏家", desc: "擁有 3 件神話裝備",     descEn: "Own 3 mythic items",      descCn: "拥有 3 件神话装备",     field: "totalKills",     target: 1,    rewards: [QUEST_REWARDS.gold(800), QUEST_REWARDS.scroll("mythic")], special: "3mythic" },
};
