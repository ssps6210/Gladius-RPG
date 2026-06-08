import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLanguage } from "../../game/i18n/LanguageContext";

interface TutorialStep {
  tabId: string;
  title: string; titleEn: string;
  desc: string; descEn: string;
}

const STEPS: TutorialStep[] = [
  {
    tabId: "dungeon",
    title: "⚔ 地下城探險",  titleEn: "⚔ Dungeon",
    desc: "點擊這裡進入地下城！選擇一個探險區域開始戰鬥，擊敗怪物可以獲得經驗和金幣。",
    descEn: "Click here to enter the dungeon! Pick an expedition zone to fight monsters and earn EXP & gold.",
  },
  {
    tabId: "shop",
    title: "🏪 商店補給",    titleEn: "🏪 Shop",
    desc: "打完怪記得補藥！進商店購買回復藥水，確保下次戰鬥有足夠的HP撐下去。",
    descEn: "Restock after fighting! Buy healing potions to keep your HP up for the next battle.",
  },
  {
    tabId: "tavern",
    title: "🍺 酒館昏睡",    titleEn: "🍺 Tavern",
    desc: "HP嚴重不足時來酒館付費昏睡，一覺醒來HP全滿！這裡也有懸賞任務可以接。",
    descEn: "Too low on HP? Pay to sleep at the tavern and wake up fully healed. Bounty quests are here too.",
  },
  {
    tabId: "train",
    title: "⚒ 訓練場強化",  titleEn: "⚒ Training",
    desc: "花金幣永久訓練攻擊、防禦、HP 和速度。越早訓練複利越大，不要忘了！",
    descEn: "Spend gold to permanently train ATK, DEF, HP and SPD. Invest early for maximum compound gains!",
  },
  {
    tabId: "inventory",
    title: "🎒 背包賣裝備",  titleEn: "🎒 Inventory",
    desc: "背包塞滿了？點「賣普通品」一鍵清空普通裝備換金幣，只留稀有以上的好東西就行。",
    descEn: "Bag full? Tap 'Sell junk' to instantly clear common items for gold. Keep rares and above.",
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

  // Reset advance guard each step
  useEffect(() => { advancedRef.current = false; }, [step]);

  // Auto-advance when user navigates to the target tab
  useEffect(() => {
    if (!currentStep || advancedRef.current) return;
    if (activeTab === currentStep.tabId) {
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
          {L(currentStep.title, currentStep.titleEn)}
        </div>

        <div style={{ fontSize: 11, color: "#9a8060", lineHeight: 1.65, marginBottom: 13 }}>
          {L(currentStep.desc, currentStep.descEn)}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={onSkip}
            style={{
              background: "transparent", border: "none",
              color: "#3a2818", fontSize: 10, cursor: "pointer", padding: 0,
            }}
          >
            {L("跳過教學", "Skip")}
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
