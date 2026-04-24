export function HpBar({ cur, max, color = "#c83030", thin }: { cur: any; max: any; color?: string; thin?: any }) {
  return (
    <div className="bw">
      <div className="bl"><span>HP</span><span>{cur}/{max}</span></div>
      <div className="bt" style={thin ? { height: 6 } : {}}>
        <div className="bf" style={{
          width: `${Math.round(Math.max(0, cur) / max * 100)}%`,
          background: `linear-gradient(90deg,${color}99,${color})`,
        }} />
      </div>
    </div>
  );
}
