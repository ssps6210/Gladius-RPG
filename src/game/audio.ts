let ctx: AudioContext | null = null;
const fetchCache = new Map<string, ArrayBuffer>();
const bufCache = new Map<string, AudioBuffer | null>();

const S = "./sounds/rpg_sound_pack/RPG%20Sound%20Pack";

const SFX = {
  hit:         `${S}/battle/swing.wav`,
  crit:        `${S}/battle/swing3.wav`,
  block:       `${S}/inventory/metal-ringing.wav`,
  levelUp:     `${S}/interface/interface5.wav`,
  loot:        `${S}/interface/interface2.wav`,
  gold:        `${S}/inventory/coin.wav`,
  victory:     `${S}/interface/interface6.wav`,
  defeat:      `${S}/misc/random2.wav`,
  enhanceOk:   `${S}/inventory/metal-small1.wav`,
  enhanceFail: `${S}/misc/random3.wav`,
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
  const buf = await loadBuf(url);
  if (buf) playBuf(buf, vol);
}

// Prefetch raw audio bytes eagerly so first-play has no network delay
if (typeof window !== "undefined") {
  Object.values(SFX).forEach(url =>
    fetch(url).then(r => r.ok ? r.arrayBuffer() : null).then(arr => {
      if (arr) fetchCache.set(url, arr);
    }).catch(() => {})
  );
}

export function playHit()       { play(SFX.hit, 0.7); }
export function playCrit()      { play(SFX.crit, 0.9); }
export function playBlock()     { play(SFX.block, 0.7); }
export function playLevelUp()   { play(SFX.levelUp, 0.85); }
export function playLootDrop()  { play(SFX.loot, 0.7); }
export function playGold()      { play(SFX.gold, 0.65); }
export function playVictory()   { play(SFX.victory, 0.85); }
export function playDefeat()    { play(SFX.defeat, 0.7); }
export function playEnhance(success: boolean) {
  play(success ? SFX.enhanceOk : SFX.enhanceFail, 0.75);
}
