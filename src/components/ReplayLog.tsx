import { useEffect, useRef } from "react";

import type { RuntimeLogEntry } from "../game/types";

type AnyRecord = Record<string, any>;

export function ReplayLog({ lines, cursor }: { lines: RuntimeLogEntry[]; cursor: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = lines.slice(0, cursor);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [cursor]);
  const COLOR: AnyRecord = {
    hit: "#d4a030", enemy: "#c84040", win: "#50c870", lose: "#c84040",
    heal: "#50c890", merc: "#6aaa6a", loot: "#c878e0", info: "#8a7050",
    title: "#e8c050", sep: "#3a2a10",
  };
  return (
    <div className="blog" ref={ref} style={{ height: 280, fontFamily: "'Crimson Text',serif" }}>
      {visible.map((line, i) => {
        const isLast = i === visible.length - 1;
        const c = COLOR[line.type] || "#a08060";
        const isSep = line.type === "sep";
        return (
          <div key={i} style={{
            color: isSep ? "#2a1a08" : c,
            fontStyle: line.type === "info" || line.type === "sep" ? "italic" : "normal",
            fontFamily: line.type === "title" || line.type === "win" || line.type === "lose" ? "'Cinzel',serif" : "inherit",
            fontSize: line.type === "title" ? "13px" : "12px",
            letterSpacing: line.type === "title" ? 1 : 0,
            borderBottom: isSep ? "1px solid #2a1a08" : "none",
            margin: isSep ? "6px 0" : "0",
            padding: isSep ? "0" : "1px 0",
            opacity: isLast ? 1 : 0.9,
            animation: isLast ? "fadeIn .15s ease" : "none",
          }}>{line.txt}</div>
        );
      })}
    </div>
  );
}
