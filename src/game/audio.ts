// ── Audio settings (persisted to localStorage) ──────────────────────────
const LS_KEY = "gladius_audio";

interface AudioSettings {
  seEnabled: boolean;
  bgmEnabled: boolean;
  masterVolume: number; // 0–1
}

const _defaults: AudioSettings = { seEnabled: true, bgmEnabled: true, masterVolume: 1 };
let _settings: AudioSettings = { ..._defaults };

if (typeof window !== "undefined") {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) _settings = { ..._defaults, ...JSON.parse(raw) };
  } catch { /* ignore */ }
}

function _save() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(_settings)); } catch { /* ignore */ }
}

export function getAudioSettings(): Readonly<AudioSettings> { return _settings; }
export function setSeEnabled(v: boolean)    { _settings = { ..._settings, seEnabled: v };                             _save(); }
export function setBgmEnabled(v: boolean)   { _settings = { ..._settings, bgmEnabled: v };                            _save(); syncBgm(); }
export function setMasterVolume(v: number)  {
  _settings = { ..._settings, masterVolume: Math.max(0, Math.min(1, v)) };
  _save();
  if (_bgmGain) _bgmGain.gain.value = BGM_VOL * _settings.masterVolume;
}

// ── AudioContext + buffer caches ─────────────────────────────────────────
let ctx: AudioContext | null = null;
const fetchCache = new Map<string, ArrayBuffer>();
const bufCache = new Map<string, AudioBuffer | null>();

const S = "./sounds/rpg_sound_pack/RPG%20Sound%20Pack";

const SFX = {
  hit:         `${S}/battle/swing.wav`,
  crit:        `${S}/battle/swing3.wav`,
  block:       `${S}/inventory/metal-ringing.wav`,
  levelUp:     `${S}/battle/sword-unsheathe.wav`,
  loot:        `${S}/battle/sword-unsheathe2.wav`,
  gold:        `${S}/inventory/coin.wav`,
  victory:     `${S}/battle/sword-unsheathe3.wav`,
  defeat:      `${S}/misc/random2.wav`,
  enhanceOk:   `${S}/inventory/metal-small1.wav`,
  enhanceFail: `${S}/misc/random3.wav`,
  shopEnter:   `${S}/world/door.wav`,
} as const;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try { ctx = new AudioContext(); } catch { return null; }
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

async function loadBuf(url: string): Promise<AudioBuffer | null> {
  if (bufCache.has(url)) return bufCache.get(url) ?? null;
  bufCache.set(url, null);
  const ac = getCtx();
  if (!ac) return null;
  try {
    let arr = fetchCache.get(url);
    if (!arr) {
      const res = await fetch(url);
      if (!res.ok) return null;
      arr = await res.arrayBuffer();
      fetchCache.set(url, arr);
    }
    const buf = await ac.decodeAudioData(arr.slice(0));
    bufCache.set(url, buf);
    return buf;
  } catch {
    return null;
  }
}

function playBuf(buf: AudioBuffer, vol: number) {
  const ac = getCtx();
  if (!ac) return;
  const src = ac.createBufferSource();
  src.buffer = buf;
  const g = ac.createGain();
  g.gain.value = vol;
  src.connect(g);
  g.connect(ac.destination);
  src.start();
}

async function play(url: string, vol: number) {
  if (!_settings.seEnabled) return;
  const buf = await loadBuf(url);
  if (buf) playBuf(buf, vol * _settings.masterVolume);
}

// ── BGM ───────────────────────────────────────────────────────────────────
const BGM_VOL = 0.32;

let _bgmSource: AudioBufferSourceNode | null = null;
let _bgmGain: GainNode | null = null;
let _currentBgmUrl: string | null = null;

async function _playBgmUrl(url: string) {
  const ac = getCtx();
  if (!ac) return;
  const buf = await loadBuf(url);
  if (!buf || _currentBgmUrl !== url) return; // guard: url changed while loading
  _bgmGain = ac.createGain();
  _bgmGain.gain.value = BGM_VOL * _settings.masterVolume;
  _bgmGain.connect(ac.destination);
  _bgmSource = ac.createBufferSource();
  _bgmSource.buffer = buf;
  _bgmSource.loop = true;
  _bgmSource.connect(_bgmGain);
  _bgmSource.onended = () => { _bgmSource = null; _bgmGain = null; };
  _bgmSource.start();
}

export function stopBgm() {
  if (_bgmSource) { try { _bgmSource.stop(); } catch { /* ignore */ } _bgmSource = null; }
  _bgmGain = null;
}

export async function switchBgm(url: string) {
  if (_currentBgmUrl === url && _bgmSource) return;
  stopBgm();
  _currentBgmUrl = url;
  if (!_settings.bgmEnabled) return;
  await _playBgmUrl(url);
}

export function startBgm() { switchBgm("./sounds/bgm.mp3"); }

export function syncBgm() {
  if (_settings.bgmEnabled) { if (_currentBgmUrl) switchBgm(_currentBgmUrl); else startBgm(); }
  else { stopBgm(); }
}

// Prefetch raw audio bytes eagerly so first-play has no network delay
if (typeof window !== "undefined") {
  Object.values(SFX).forEach(url =>
    fetch(url).then(r => r.ok ? r.arrayBuffer() : null).then(arr => {
      if (arr) fetchCache.set(url, arr);
    }).catch(() => {})
  );
}

export function playHit()        { play(SFX.hit, 0.7); }
export function playCrit()       { play(SFX.crit, 0.9); }
export function playBlock()      { play(SFX.block, 0.7); }
export function playLevelUp()    { play(SFX.levelUp, 0.85); }
export function playLootDrop()   { play(SFX.loot, 0.75); }
export function playGold()       { play(SFX.gold, 0.65); }
export function playVictory()    { play(SFX.victory, 0.85); }
export function playDefeat()     { play(SFX.defeat, 0.7); }
export function playShopEnter()  { play(SFX.shopEnter, 0.6); }
export function playEnhance(success: boolean) {
  play(success ? SFX.enhanceOk : SFX.enhanceFail, 0.75);
}
