const RARITY_ZH: Record<string, string> = { mythic: "神話", legendary: "傳說", rare: "稀有", magic: "魔法" };
const RARITY_EN: Record<string, string> = { mythic: "Mythic", legendary: "Legendary", rare: "Rare", magic: "Magic" };

const QUEST_REWARDS = {
  gold:   (value: any) => ({ type: "gold",   value,  label: `🪙 ${value} 金幣`,                        labelEn: `🪙 ${value} Gold` }),
  exp:    (value: any) => ({ type: "exp",    value,  label: `✨ ${value} EXP`,                          labelEn: `✨ ${value} EXP` }),
  item:   (rarity: any) => ({ type: "item",  rarity, label: `🎁 ${RARITY_ZH[rarity] || "魔法"}裝備×1`, labelEn: `🎁 ${RARITY_EN[rarity] || "Magic"} Gear×1` }),
  weapon: (rarity: any) => ({ type: "weapon", rarity, label: `⚔ ${RARITY_ZH[rarity] || "傳說"}武器×1`, labelEn: `⚔ ${RARITY_EN[rarity] || "Legendary"} Weapon×1` }),
  scroll: (rarity: any) => ({ type: "scroll", rarity, label: `📜 ${RARITY_ZH[rarity] || "魔法"}傭兵捲軸×1`, labelEn: `📜 ${RARITY_EN[rarity] || "Magic"} Merc Scroll×1` }),
};

export const QUEST_DEFS: Record<string, Record<string, any>> = {
  // ── Class milestone quests (pinned first in achieve tab) ──────────────────
  q_class1: {
    cat: "achieve", icon: "⚔", field: "jobClass", target: 1, special: "class1",
    title: "初次轉職", titleEn: "First Class",
    desc: "達到 Lv.30 後選擇你的轉職職業",
    descEn: "Reach Lv.30 and choose your first class",
    rewards: [QUEST_REWARDS.gold(10000), QUEST_REWARDS.weapon("legendary")],
  },
  q_class2: {
    cat: "achieve", icon: "🔥", field: "jobClass", target: 1, special: "class2",
    title: "二轉飛升", titleEn: "Second Awakening",
    desc: "達到 Lv.70 後升級為二轉職業",
    descEn: "Reach Lv.70 and ascend to a Tier 2 class",
    rewards: [QUEST_REWARDS.gold(100000), QUEST_REWARDS.weapon("mythic")],
  },

  // ── Daily ─────────────────────────────────────────────────────────────────
  d1: { cat: "daily",   icon: "🗡", title: "今日狩獵",   titleEn: "Today's Hunt",          desc: "完成 3 次探險",        descEn: "Complete 3 expeditions",     field: "totalExpeditions", target: 3,   rewards: [QUEST_REWARDS.gold(80), QUEST_REWARDS.exp(120)] },
  d2: { cat: "daily",   icon: "⚔", title: "副本出征",   titleEn: "Dungeon Run",            desc: "完成 1 個副本",        descEn: "Complete 1 dungeon",         field: "totalDungeons",    target: 1,   rewards: [QUEST_REWARDS.gold(150), QUEST_REWARDS.exp(200)] },
  d3: { cat: "daily",   icon: "💀", title: "每日殺戮",   titleEn: "Daily Slaughter",        desc: "擊殺 10 隻怪物",      descEn: "Kill 10 monsters",           field: "totalKills",       target: 10,  rewards: [QUEST_REWARDS.gold(60), QUEST_REWARDS.exp(80)] },
  d4: { cat: "daily",   icon: "🏟", title: "競技場試煉", titleEn: "Arena Trial",            desc: "贏得 1 場競技場對決", descEn: "Win 1 arena battle",         field: "totalArenaWins",   target: 1,   rewards: [QUEST_REWARDS.gold(200), QUEST_REWARDS.exp(150)] },
  d5: { cat: "daily",   icon: "🪙", title: "財富積累",   titleEn: "Wealth Accumulation",    desc: "賺取 500 金幣",       descEn: "Earn 500 gold",              field: "totalGoldEarned",  target: 500, rewards: [QUEST_REWARDS.exp(100), QUEST_REWARDS.item("magic")] },

  // ── Weekly ────────────────────────────────────────────────────────────────
  w1: { cat: "weekly",  icon: "🏆", title: "周冠軍",     titleEn: "Weekly Champion",        desc: "贏得 5 場競技場",     descEn: "Win 5 arena battles",        field: "totalArenaWins",   target: 5,   rewards: [QUEST_REWARDS.gold(500), QUEST_REWARDS.exp(600), QUEST_REWARDS.item("rare")] },
  w2: { cat: "weekly",  icon: "🐉", title: "副本征服者", titleEn: "Dungeon Conqueror",       desc: "完成 5 個副本",       descEn: "Complete 5 dungeons",        field: "totalDungeons",    target: 5,   rewards: [QUEST_REWARDS.gold(400), QUEST_REWARDS.exp(500), QUEST_REWARDS.scroll("rare")] },
  w3: { cat: "weekly",  icon: "⚒", title: "鍛造狂人",   titleEn: "Forge Maniac",           desc: "強化裝備 10 次",      descEn: "Enhance gear 10 times",      field: "totalEnhances",    target: 10,  rewards: [QUEST_REWARDS.gold(300), QUEST_REWARDS.item("rare")] },
  w4: { cat: "weekly",  icon: "💪", title: "訓練達人",   titleEn: "Training Master",        desc: "訓練屬性 8 次",       descEn: "Train attributes 8 times",   field: "totalTrains",      target: 8,   rewards: [QUEST_REWARDS.gold(400), QUEST_REWARDS.exp(400), QUEST_REWARDS.item("legendary")] },
  w5: { cat: "weekly",  icon: "🏴", title: "傭兵統帥",   titleEn: "Merc Commander",         desc: "完成 3 個傭兵副本",   descEn: "Complete 3 merc dungeons",   field: "totalMercRuns",    target: 3,   rewards: [QUEST_REWARDS.gold(350), QUEST_REWARDS.scroll("legendary")] },

  // ── Achieve ───────────────────────────────────────────────────────────────
  a1:  { cat: "achieve", icon: "🌟", title: "初出茅廬",   titleEn: "Novice",            desc: "達到 Lv.5",             descEn: "Reach Lv.5",              field: "highestLevel",   target: 5,    rewards: [QUEST_REWARDS.gold(200), QUEST_REWARDS.exp(300)] },
  a2:  { cat: "achieve", icon: "⭐", title: "戰場老兵",   titleEn: "Battle Veteran",    desc: "達到 Lv.15",            descEn: "Reach Lv.15",             field: "highestLevel",   target: 15,   rewards: [QUEST_REWARDS.gold(500), QUEST_REWARDS.exp(800), QUEST_REWARDS.item("rare")] },
  a3:  { cat: "achieve", icon: "💫", title: "傳說鬥士",   titleEn: "Legendary Fighter", desc: "達到 Lv.30",            descEn: "Reach Lv.30",             field: "highestLevel",   target: 30,   rewards: [QUEST_REWARDS.gold(1000), QUEST_REWARDS.exp(2000), QUEST_REWARDS.item("legendary")] },
  a4:  { cat: "achieve", icon: "💀", title: "屠夫",       titleEn: "Butcher",           desc: "累計擊殺 100 隻怪物",   descEn: "Kill 100 monsters total", field: "totalKills",     target: 100,  rewards: [QUEST_REWARDS.gold(300), QUEST_REWARDS.item("rare")] },
  a5:  { cat: "achieve", icon: "☠",  title: "死神",       titleEn: "Death",             desc: "累計擊殺 1000 隻怪物",  descEn: "Kill 1000 monsters total",field: "totalKills",     target: 1000, rewards: [QUEST_REWARDS.gold(800), QUEST_REWARDS.item("legendary")] },
  a6:  { cat: "achieve", icon: "👑", title: "Boss獵人",   titleEn: "Boss Hunter",       desc: "擊殺 10 個 Boss",       descEn: "Kill 10 bosses",          field: "totalBossKills", target: 10,   rewards: [QUEST_REWARDS.gold(400), QUEST_REWARDS.exp(600), QUEST_REWARDS.item("legendary")] },
  a7:  { cat: "achieve", icon: "🏅", title: "競技場新星", titleEn: "Arena Rising Star",  desc: "贏得 10 場競技場",      descEn: "Win 10 arena battles",    field: "totalArenaWins", target: 10,   rewards: [QUEST_REWARDS.gold(400), QUEST_REWARDS.exp(500), QUEST_REWARDS.scroll("rare")] },
  a8:  { cat: "achieve", icon: "🥇", title: "競技場王者", titleEn: "Arena King",         desc: "贏得 50 場競技場",      descEn: "Win 50 arena battles",    field: "totalArenaWins", target: 50,   rewards: [QUEST_REWARDS.gold(1000), QUEST_REWARDS.scroll("mythic")] },
  a9:  { cat: "achieve", icon: "⚒", title: "鍛造大師",   titleEn: "Forge Master",      desc: "成功強化到 +7 以上",    descEn: "Enhance to +7 or above",  field: "totalEnhances",  target: 1,    rewards: [QUEST_REWARDS.gold(500), QUEST_REWARDS.item("legendary")], special: "enh7" },
  a10: { cat: "achieve", icon: "💎", title: "神話收藏家", titleEn: "Mythic Collector",   desc: "擁有 3 件神話裝備",     descEn: "Own 3 mythic items",      field: "totalKills",     target: 1,    rewards: [QUEST_REWARDS.gold(800), QUEST_REWARDS.scroll("mythic")], special: "3mythic" },
};
