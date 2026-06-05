import { useLanguage } from "../game/i18n/LanguageContext";

export function AffixLines({ affixes }: { affixes: any[] }) {
  const { lang, tr } = useLanguage();
  if (!affixes || !affixes.length) return null;
  const statLabel = (stat: string) => {
    if (stat === "attack") return lang === "en" ? "ATK" : "攻擊";
    if (stat === "defense") return lang === "en" ? "DEF" : "防禦";
    if (stat === "hp") return "HP";
    return lang === "en" ? "SPD" : "速度";
  };
  const specialLabel = (special: string) => {
    const zh: Record<string, string> = {
      crit: "% 爆擊率", lifesteal: "% 吸血", thorns: " 荊棘反傷", regen: " 每回合回復",
      pierce: "% 穿透", vampiric: "% 吸魂", reflect: " 反射傷害",
    };
    const en: Record<string, string> = {
      crit: "% Crit", lifesteal: "% Lifesteal", thorns: " Thorns", regen: " Regen/round",
      pierce: "% Pierce", vampiric: "% Vampiric", reflect: " Reflect",
    };
    const table = lang === "en" ? en : zh;
    return table[special] ?? (lang === "en" ? " Low HP Rage" : " 低血狂怒");
  };
  return (
    <div className="iaf">
      {affixes.map((a, i) => (
        <div key={i} className={`al${a.special ? " as" : ""}`}>
          {a.stat
            ? `${tr(a, "tag")}: +${a.rolledVal} ${statLabel(a.stat)}`
            : `${tr(a, "tag")}: ${a.rolledVal}${specialLabel(a.special)}`}
        </div>
      ))}
    </div>
  );
}
