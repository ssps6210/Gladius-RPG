import { useEffect, useRef, useState } from "react";
import {
  getAudioSettings,
  setBgmEnabled,
  setBgmVolume,
  setMasterVolume,
  setSeEnabled,
  setSeVolume,
} from "../../game/audio";
import { useLanguage } from "../../game/i18n/LanguageContext";

export function AudioSettingsButton() {
  const { L } = useLanguage();
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(getAudioSettings);
  const panelRef = useRef<HTMLDivElement>(null);

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

  function changeMaster(v: number) {
    setMasterVolume(v);
    setSettings(s => ({ ...s, masterVolume: v }));
  }

  function changeBgmVol(v: number) {
    setBgmVolume(v);
    setSettings(s => ({ ...s, bgmVolume: v }));
  }

  function changeSeVol(v: number) {
    setSeVolume(v);
    setSettings(s => ({ ...s, seVolume: v }));
  }

  const masterPct = Math.round(settings.masterVolume * 100);
  const bgmPct    = Math.round(settings.bgmVolume * 100);
  const sePct     = Math.round(settings.seVolume * 100);

  return (
    <div ref={panelRef} style={{ position: "relative" }}>
      <button
        className="btn btm"
        style={{ fontSize: 13, padding: "4px 8px", lineHeight: 1 }}
        onClick={() => setOpen(o => !o)}
        title={L("音效設定", "Sound Settings", "音效设置")}
      >
        {settings.seEnabled || settings.bgmEnabled ? "🔊" : "🔇"}
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
          minWidth: 220,
          fontFamily: "'Cinzel', serif",
        }}>
          {/* Header */}
          <div style={{ fontSize: 10, letterSpacing: 3, color: "#8b5a14", marginBottom: 14, textTransform: "uppercase" as const }}>
            ⚙ {L("音效設定", "Sound Settings", "音效设置")}
          </div>

          {/* Master Volume */}
          <VolumeRow
            icon="🎚"
            label={L("總音量", "Master", "总音量")}
            pct={masterPct}
            value={settings.masterVolume}
            onChange={changeMaster}
            enabled
          />

          <div style={{ height: 1, background: "#2a1808", margin: "10px 0" }} />

          {/* BGM */}
          <VolumeRow
            icon="🎵"
            label={L("音樂 BGM", "Music BGM", "音乐 BGM")}
            pct={bgmPct}
            value={settings.bgmVolume}
            onChange={changeBgmVol}
            enabled={settings.bgmEnabled}
            toggle={<ToggleSwitch on={settings.bgmEnabled} onToggle={toggleBgm} />}
          />

          {/* SE */}
          <VolumeRow
            icon="🔊"
            label={L("音效 SE", "Sound FX", "音效 SE")}
            pct={sePct}
            value={settings.seVolume}
            onChange={changeSeVol}
            enabled={settings.seEnabled}
            toggle={<ToggleSwitch on={settings.seEnabled} onToggle={toggleSe} />}
          />
        </div>
      )}
    </div>
  );
}

function VolumeRow({
  icon, label, pct, value, onChange, enabled, toggle,
}: {
  icon: string;
  label: string;
  pct: number;
  value: number;
  onChange: (v: number) => void;
  enabled: boolean;
  toggle?: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <span style={{ fontSize: 11, color: enabled ? "#c8a878" : "#5a4828" }}>
          {icon} {label}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: enabled ? "#e8c050" : "#4a3820", minWidth: 32, textAlign: "right" }}>
            {pct}%
          </span>
          {toggle}
        </div>
      </div>
      <input
        type="range" min={0} max={1} step={0.05}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        disabled={!enabled}
        style={{
          width: "100%",
          accentColor: "#c8961e",
          cursor: enabled ? "pointer" : "not-allowed",
          opacity: enabled ? 1 : 0.35,
        }}
      />
    </div>
  );
}

function ToggleSwitch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        position: "relative",
        width: 36, height: 18,
        background: on ? "#c8961e" : "#2a1e0a",
        border: `1px solid ${on ? "#e8b030" : "#4a3010"}`,
        borderRadius: 9,
        cursor: "pointer",
        padding: 0,
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute",
        top: 2, left: on ? 18 : 2,
        width: 12, height: 12,
        background: on ? "#fff8e0" : "#5a4028",
        borderRadius: "50%",
        transition: "left 0.2s",
        display: "block",
      }} />
    </button>
  );
}
