export function AffixLines({ affixes }: { affixes: any[] }) {
  if (!affixes || !affixes.length) return null;
  return (
    <div className="iaf">
      {affixes.map((a, i) => (
        <div key={i} className={`al${a.special ? " as" : ""}`}>
          {a.stat
            ? `${a.tag}: +${a.rolledVal} ${a.stat === "attack" ? "攻擊" : a.stat === "defense" ? "防禦" : a.stat === "hp" ? "HP" : "速度"}`
            : `${a.tag}: ${a.rolledVal}${
                a.special === "crit" ? "% 爆擊率" : a.special === "lifesteal" ? "% 吸血" :
                a.special === "thorns" ? " 荊棘反傷" : a.special === "regen" ? " 每回合回復" :
                a.special === "pierce" ? "% 穿透" : a.special === "vampiric" ? "% 吸魂" :
                a.special === "reflect" ? " 反射傷害" : " 低血狂怒"}`}
        </div>
      ))}
    </div>
  );
}
