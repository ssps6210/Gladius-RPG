import { useEffect, useRef, useState } from "react";
import { getAudioSettings, setBgmEnabled, setMasterVolume, setSeEnabled } from "../../game/audio";
import { useLanguage } from "../../game/i18n/LanguageContext";

export function AudioSettingsButton() {
  const { L } = useLanguage();
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(getAudioSettings);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function toggleSe() {
    const next = !settings.seEnabled;
    setSeEnabled(next);
    setSettings(s => ({ ...s, seEnabled: next }));
  }

  function toggleBgm() {
    const next = !settings.bgmEnabled;
    setBgmEnabled(next);
    setSettings(s => ({ ...s, bgmEnabled: next }));
  }

  function changeVolume(v: number) {
    setMasterVolume(v);
    setSettings(s => ({ ...s, masterVolume: v }));
  }

  const volPct = Math.round(settings.masterVolume * 100);

  return (
    <div ref={panelRef} style={{ position: "relative" }}>
      <button
        className="btn btm"
        style={{ fontSize: 13, padding: "4px 8px", lineHeight: 1 }}
        onClick={() => setOpen(o => !o)}
        title={L("音效設定", "Sound Settings")}
      >
        {settings.seEnabled ? "🔊" : "🔇"}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0,
          zIndex: 300,
          background: "linear-gradient(160deg, #2a1c08, #1e1408)",
          border: "1px solid #6a4010",
          borderRadius: 6,
          padding: "14px 16px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.7)",
          minWidth: 200,
          fontFamily: "'Cinzel', serif",
        }}>
          {/* Header */}
          <div style={{ fontSize: 10, letterSpacing: 3, color: "#8b5a14", marginBottom: 14, textTransform: "uppercase" as const }}>
            ⚙ {L("音效設定", "Sound Settings")}
          </div>

          {/* Master Volume */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#c8a878", marginBottom: 6 }}>
              <span>{L("總音量", "Master Vol")}</span>
              <span style={{ color: "#e8c050" }}>{volPct}%</span>
            </div>
            <input
              type="range" min={0} max={1} step={0.05}
              value={settings.masterVolume}
              onChange={e => changeVolume(parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: "#c8961e", cursor: "pointer" }}
            />
          </div>

          {/* SE Toggle */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: "#c8a878" }}>🔊 {L("音效 SE", "Sound FX")}</span>
            <ToggleSwitch on={settings.seEnabled} onToggle={toggleSe} />
          </div>

          {/* BGM Toggle */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: settings.bgmEnabled ? "#c8a878" : "#5a4828" }}>
              🎵 {L("音樂 BGM", "Music BGM")}
            </span>
            <ToggleSwitch on={settings.bgmEnabled} onToggle={toggleBgm} />
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleSwitch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        position: "relative",
        width: 40, height: 20,
        background: on ? "#c8961e" : "#2a1e0a",
        border: `1px solid ${on ? "#e8b030" : "#4a3010"}`,
        borderRadius: 10,
        cursor: "pointer",
        padding: 0,
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute",
        top: 2, left: on ? 22 : 2,
        width: 14, height: 14,
        background: on ? "#fff8e0" : "#5a4028",
        borderRadius: "50%",
        transition: "left 0.2s",
        display: "block",
      }} />
    </button>
  );
}
