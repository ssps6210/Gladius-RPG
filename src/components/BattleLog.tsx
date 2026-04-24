import { useEffect, useRef } from "react";

import type { RuntimeLogEntry } from "../game/types";

export function BattleLog({ log }: { log: RuntimeLogEntry[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [log]);
  return (
    <div className="blog" ref={ref}>
      {log.map((line, i) => {
        const txt = typeof line === "string" ? line : line.txt;
        return (
          <div key={i} className={
            txt.includes("你攻擊") || txt.includes("爆擊") ? "lh" :
            txt.includes("🗡") ? "lm" :
            txt.includes("攻擊了") && !txt.includes("你攻擊") ? "le" :
            (txt.includes("擊敗") || txt.includes("等級")) ? "lw" :
            (txt.includes("被擊敗") || txt.includes("陣亡")) ? "ll" : ""
          }>{txt}</div>
        );
      })}
    </div>
  );
}
