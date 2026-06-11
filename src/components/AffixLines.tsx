import { useLanguage } from "../game/i18n/LanguageContext";

export function AffixLines({ affixes }: { affixes: any[] }) {
  const { lang, tr } = useLanguage();
  if (!affixes || !affixes.length) return null;
  const statLabel = (stat: string) => {
    if (lang === "en") {
      if (stat === "attack") return "ATK";
      if (stat === "defense") return "DEF";
      if (stat === "hp") return "HP";
      return "SPD";
    }
    if (lang === "zh_cn") {
      if (stat === "attack") return "攻击";
      if (stat === "defense") return "防御";
      if (stat === "hp") return "HP";
      return "速度";
    }
    if (stat === "attack") return "攻擊";
    if (stat === "defense") return "防禦";
    if (stat === "hp") return "HP";
    return "速度";
  };
  const specialLabel = (special: string) => {
    const zh: Record<string, string> = {
      crit: "% 爆擊率", lifesteal: "% 吸血", thorns: " 荊棘反傷", regen: " 每回合回復",
      pierce: "% 穿透", vampiric: "% 吸魂", reflect: " 反射傷害",
    };
    const cn: Record<string, string> = {
      crit: "% 爆击率", lifesteal: "% 吸血", thorns: " 荆棘反伤", regen: " 每回合回复",
      pierce: "% 穿透", vampiric: "% 吸魂", reflect: " 反射伤害",
    };
    const en: Record<string, string> = {
      crit: "% Crit", lifesteal: "% Lifesteal", thorns: " Thorns", regen: " Regen/round",
      pierce: "% Pierce", vampiric: "% Vampiric", reflect: " Reflect",
    };
    if (lang === "en") return en[special] ?? " Low HP Rage";
    if (lang === "zh_cn") return cn[special] ?? " 低血狂怒";
    return zh[special] ?? " 低血狂怒";
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
