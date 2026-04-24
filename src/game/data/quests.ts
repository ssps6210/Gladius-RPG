const QUEST_REWARDS = {
  gold: (value: any) => ({ type: "gold", value, label: `🪙 ${value} 金幣` }),
  exp: (value: any) => ({ type: "exp", value, label: `✨ ${value} EXP` }),
  item: (rarity: any) => ({ type: "item", rarity, label: `🎁 ${rarity === "mythic" ? "神話" : rarity === "legendary" ? "傳說" : rarity === "rare" ? "稀有" : "魔法"}裝備×1` }),
  scroll: (rarity: any) => ({ type: "scroll", rarity, label: `📜 ${rarity === "mythic" ? "神話" : rarity === "legendary" ? "傳說" : rarity === "rare" ? "稀有" : "魔法"}傭兵捲軸×1` }),
};

export const QUEST_DEFS: Record<string, Record<string, any>> = {
  d1: { cat: "daily", icon: "🗡", title: "今日狩獵", desc: "完成 3 次探險", field: "totalExpeditions", target: 3, rewards: [QUEST_REWARDS.gold(80), QUEST_REWARDS.exp(120)] },
  d2: { cat: "daily", icon: "⚔", title: "副本出征", desc: "完成 1 個副本", field: "totalDungeons", target: 1, rewards: [QUEST_REWARDS.gold(150), QUEST_REWARDS.exp(200)] },
  d3: { cat: "daily", icon: "💀", title: "每日殺戮", desc: "擊殺 10 隻怪物", field: "totalKills", target: 10, rewards: [QUEST_REWARDS.gold(60), QUEST_REWARDS.exp(80)] },
  d4: { cat: "daily", icon: "🏟", title: "競技場試煉", desc: "贏得 1 場競技場對決", field: "totalArenaWins", target: 1, rewards: [QUEST_REWARDS.gold(200), QUEST_REWARDS.exp(150)] },
  d5: { cat: "daily", icon: "🪙", title: "財富積累", desc: "賺取 500 金幣", field: "totalGoldEarned", target: 500, rewards: [QUEST_REWARDS.exp(100), QUEST_REWARDS.item("magic")] },
  w1: { cat: "weekly", icon: "🏆", title: "周冠軍", desc: "贏得 5 場競技場", field: "totalArenaWins", target: 5, rewards: [QUEST_REWARDS.gold(500), QUEST_REWARDS.exp(600), QUEST_REWARDS.item("rare")] },
  w2: { cat: "weekly", icon: "🐉", title: "副本征服者", desc: "完成 5 個副本", field: "totalDungeons", target: 5, rewards: [QUEST_REWARDS.gold(400), QUEST_REWARDS.exp(500), QUEST_REWARDS.scroll("rare")] },
  w3: { cat: "weekly", icon: "⚒", title: "鍛造狂人", desc: "強化裝備 10 次", field: "totalEnhances", target: 10, rewards: [QUEST_REWARDS.gold(300), QUEST_REWARDS.item("rare")] },
  w4: { cat: "weekly", icon: "💪", title: "訓練達人", desc: "訓練屬性 8 次", field: "totalTrains", target: 8, rewards: [QUEST_REWARDS.gold(400), QUEST_REWARDS.exp(400), QUEST_REWARDS.item("legendary")] },
  w5: { cat: "weekly", icon: "🏴", title: "傭兵統帥", desc: "完成 3 個傭兵副本", field: "totalMercRuns", target: 3, rewards: [QUEST_REWARDS.gold(350), QUEST_REWARDS.scroll("legendary")] },
  a1: { cat: "achieve", icon: "🌟", title: "初出茅廬", desc: "達到 Lv.5", field: "highestLevel", target: 5, rewards: [QUEST_REWARDS.gold(200), QUEST_REWARDS.exp(300)] },
  a2: { cat: "achieve", icon: "⭐", title: "戰場老兵", desc: "達到 Lv.15", field: "highestLevel", target: 15, rewards: [QUEST_REWARDS.gold(500), QUEST_REWARDS.exp(800), QUEST_REWARDS.item("rare")] },
  a3: { cat: "achieve", icon: "💫", title: "傳說鬥士", desc: "達到 Lv.30", field: "highestLevel", target: 30, rewards: [QUEST_REWARDS.gold(1000), QUEST_REWARDS.exp(2000), QUEST_REWARDS.item("legendary")] },
  a4: { cat: "achieve", icon: "💀", title: "屠夫", desc: "累計擊殺 100 隻怪物", field: "totalKills", target: 100, rewards: [QUEST_REWARDS.gold(300), QUEST_REWARDS.item("rare")] },
  a5: { cat: "achieve", icon: "☠", title: "死神", desc: "累計擊殺 1000 隻怪物", field: "totalKills", target: 1000, rewards: [QUEST_REWARDS.gold(800), QUEST_REWARDS.item("legendary")] },
  a6: { cat: "achieve", icon: "👑", title: "Boss獵人", desc: "擊殺 10 個 Boss", field: "totalBossKills", target: 10, rewards: [QUEST_REWARDS.gold(400), QUEST_REWARDS.exp(600), QUEST_REWARDS.item("legendary")] },
  a7: { cat: "achieve", icon: "🏅", title: "競技場新星", desc: "贏得 10 場競技場", field: "totalArenaWins", target: 10, rewards: [QUEST_REWARDS.gold(400), QUEST_REWARDS.exp(500), QUEST_REWARDS.scroll("rare")] },
  a8: { cat: "achieve", icon: "🥇", title: "競技場王者", desc: "贏得 50 場競技場", field: "totalArenaWins", target: 50, rewards: [QUEST_REWARDS.gold(1000), QUEST_REWARDS.scroll("mythic")] },
  a9: { cat: "achieve", icon: "⚒", title: "鍛造大師", desc: "成功強化到 +7 以上", field: "totalEnhances", target: 1, rewards: [QUEST_REWARDS.gold(500), QUEST_REWARDS.item("legendary")], special: "enh7" },
  a10: { cat: "achieve", icon: "💎", title: "神話收藏家", desc: "擁有 3 件神話裝備", field: "totalKills", target: 1, rewards: [QUEST_REWARDS.gold(800), QUEST_REWARDS.scroll("mythic")], special: "3mythic" },
};
