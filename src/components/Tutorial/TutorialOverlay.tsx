import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLanguage } from "../../game/i18n/LanguageContext";

interface TutorialStep {
  tabId: string;
  title: string; titleEn: string; titleCn?: string;
  desc: string; descEn: string; descCn?: string;
}

export const TUTORIAL_TOTAL_STEPS = 6;

const STEPS: TutorialStep[] = [
  {
    tabId: "dungeon",
    title: "⚔ 選一個遠征，開始戰鬥！",
    titleEn: "⚔ Pick an Expedition to start!",
    titleCn: "⚔ 选一个远征，开始战斗！",
    desc: "點擊遠征區域卡片開始戰鬥——建議先從等級1的區域下手。打完後記得回背包裝備掉落的裝備！",
    descEn: "Tap an expedition card to fight. Start with the Lv.1 zone. After battle, go equip any gear that dropped!",
    descCn: "点击远征区域卡片开始战斗——建议先从等级1的区域下手。打完后记得回背包装备掉落的装备！",
  },
  {
    tabId: "inventory",
    title: "🎒 裝備剛掉落的裝備！",
    titleEn: "🎒 Equip your new drops!",
    titleCn: "🎒 装备刚掉落的装备！",
    desc: "打怪有機會掉落裝備。進背包點「裝備」穿上，「賣普通品」賣掉多餘垃圾換金幣。",
    descEn: "Monsters drop gear. Tap 'Equip' to wear it, 'Sell junk' to sell common items for gold.",
    descCn: "打怪有机会掉落装备。进背包点「装备」穿上，「卖普通品」卖掉多余垃圾换金币。",
  },
  {
    tabId: "shop",
    title: "🏪 補充藥水！",
    titleEn: "🏪 Buy Potions!",
    titleCn: "🏪 补充药水！",
    desc: "進商店購買回復藥水，在背包頁面可以使用。沒有藥水就很難硬撐過高等級遠征！",
    descEn: "Buy healing potions here. Use them from the Inventory tab. Essential for surviving harder zones!",
    descCn: "进商店购买回复药水，在背包页面可以使用。没有药水就很难硬撑过高等级远征！",
  },
  {
    tabId: "train",
    title: "⚒ 花金幣永久強化！",
    titleEn: "⚒ Train for permanent power!",
    titleCn: "⚒ 花金币永久强化！",
    desc: "訓練場可永久提升攻擊、防禦、HP 和速度。越早訓練、複利越大，強烈建議每次賺到錢就訓練！",
    descEn: "Permanently boost ATK, DEF, HP, and SPD. The earlier you invest, the bigger the compound gains!",
    descCn: "训练场可永久提升攻击、防御、HP 和速度。越早训练、复利越大，强烈建议每次赚到钱就训练！",
  },
  {
    tabId: "tavern",
    title: "🍺 HP 不足來酒館！",
    titleEn: "🍺 Low HP? Rest at the Tavern!",
    titleCn: "🍺 HP 不足来酒馆！",
    desc: "付費昏睡讓 HP 全滿，還可以接懸賞任務，完成可獲得額外金幣和 EXP！",
    descEn: "Pay to sleep and fully restore HP. Also pick up bounty quests for bonus gold and EXP!",
    descCn: "付费昏睡让 HP 全满，还可以接悬赏任务，完成可获得额外金币和 EXP！",
  },
  {
    tabId: "arena",
    title: "🏟 競技場 PvP！",
    titleEn: "🏟 Arena PvP!",
    titleCn: "🏟 竞技场 PvP！",
    desc: "在競技場挑戰其他冒險者！勝利可搶奪對方部分金幣，累積勝場提高排行榜排名！",
    descEn: "Challenge other adventurers! Win to plunder their gold and climb the leaderboard!",
    descCn: "在竞技场挑战其他冒险者！胜利可抢夺对方部分金币，累积胜场提高排行榜排名！",
  },
];

const TOOLTIP_W = 270;
const PAD = 7;

export function TutorialOverlay({
  step,
  activeTab,
  onAdvance,
  onSkip,
}: {
  step: number | null;
  activeTab: string;
  onAdvance: () => void;
  onSkip: () => void;
}) {
  const { L } = useLanguage();
  const [rect, setRect] = useState<DOMRect | null>(null);
  const advancedRef = useRef(false);
  const stepStartTabRef = useRef<string>("");

  const currentStep = step !== null ? STEPS[step] ?? null : null;

  // Find and track target element rect
  useLayoutEffect(() => {
    if (!currentStep) { setRect(null); return; }
    const update = () => {
      const el = document.querySelector(`[data-tutorial="${currentStep.tabId}"]`) as HTMLElement | null;
      if (el) setRect(el.getBoundingClientRect());
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [currentStep]);

  // Reset advance guard each step, record which tab was active when step started
  useEffect(() => {
    advancedRef.current = false;
    stepStartTabRef.current = activeTab;
  }, [step]);

  // Auto-advance only when user NAVIGATES to the target tab (not if already there)
  useEffect(() => {
    if (!currentStep || advancedRef.current) return;
    if (activeTab === currentStep.tabId && stepStartTabRef.current !== currentStep.tabId) {
      advancedRef.current = true;
      const t = setTimeout(onAdvance, 700);
      return () => clearTimeout(t);
    }
  }, [activeTab, currentStep, onAdvance]);

  if (step === null || !currentStep || !rect) return null;

  // Spotlight geometry
  const sx = rect.left - PAD;
  const sy = rect.top - PAD;
  const sw = rect.width + PAD * 2;
  const sh = rect.height + PAD * 2;

  // Tooltip horizontal position: centered on spotlight, clamped to viewport
  const vw = window.innerWidth;
  const tooltipLeft = Math.max(8, Math.min(vw - TOOLTIP_W - 8, sx + sw / 2 - TOOLTIP_W / 2));
  // Arrow offset within tooltip
  const arrowCenter = Math.max(12, Math.min(TOOLTIP_W - 20, (sx + sw / 2) - tooltipLeft));

  // Show tooltip above or below
  const below = sy + sh + 16;
  const above = sy - 170;
  const showAbove = below + 170 > window.innerHeight && above > 0;
  const tooltipTop = showAbove ? above : below;

  const isLast = step === STEPS.length - 1;

  return (
    <>
      {/* Spotlight: box-shadow creates the dark overlay; pointer-events:none lets clicks through */}
      <div
        className="tutorial-spotlight"
        style={{
          position: "fixed",
          left: sx, top: sy, width: sw, height: sh,
          borderRadius: 8,
          zIndex: 9000,
          pointerEvents: "none",
        }}
      />

      {/* Tooltip card */}
      <div
        style={{
          position: "fixed",
          left: tooltipLeft,
          top: tooltipTop,
          width: TOOLTIP_W,
          background: "linear-gradient(160deg, #1c1308, #100c06)",
          border: "1px solid #c8961e",
          borderRadius: 10,
          padding: "14px 14px 12px",
          zIndex: 9001,
          boxShadow: "0 6px 32px rgba(0,0,0,0.85), 0 0 0 1px #5a3a1022",
        }}
      >
        {/* Arrow pointing toward the spotlight */}
        {!showAbove ? (
          <div style={{
            position: "absolute", top: -8, left: arrowCenter - 7,
            width: 0, height: 0,
            borderLeft: "7px solid transparent",
            borderRight: "7px solid transparent",
            borderBottom: "8px solid #c8961e",
          }} />
        ) : (
          <div style={{
            position: "absolute", bottom: -8, left: arrowCenter - 7,
            width: 0, height: 0,
            borderLeft: "7px solid transparent",
            borderRight: "7px solid transparent",
            borderTop: "8px solid #c8961e",
          }} />
        )}

        {/* Progress dots */}
        <div style={{ display: "flex", gap: 5, marginBottom: 10, alignItems: "center" }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              height: 5, borderRadius: 3,
              width: i === step ? 18 : 5,
              background: i < step ? "#4caf50" : i === step ? "#c8961e" : "#2a1e10",
              transition: "all 0.3s",
            }} />
          ))}
          <span style={{ fontSize: 10, color: "#4a3820", marginLeft: 4 }}>
            {step + 1} / {STEPS.length}
          </span>
        </div>

        <div style={{
          fontFamily: "'Cinzel',serif", fontSize: 13,
          color: "#e0a830", marginBottom: 7, letterSpacing: 0.3,
        }}>
          {L(currentStep.title, currentStep.titleEn, currentStep.titleCn)}
        </div>

        <div style={{ fontSize: 11, color: "#9a8060", lineHeight: 1.65, marginBottom: 13 }}>
          {L(currentStep.desc, currentStep.descEn, currentStep.descCn)}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={onSkip}
            style={{
              background: "transparent", border: "none",
              color: "#3a2818", fontSize: 10, cursor: "pointer", padding: 0,
            }}
          >
            {L("跳過教學", "Skip", "跳过教学")}
          </button>
          <button
            onClick={onAdvance}
            className="btn btp"
            style={{ fontSize: 11, padding: "5px 16px" }}
          >
            {isLast ? L("完成 ✓", "Done ✓") : L("下一步 →", "Next →")}
          </button>
        </div>
      </div>
    </>
  );
}

export { STEPS as TUTORIAL_STEPS };
