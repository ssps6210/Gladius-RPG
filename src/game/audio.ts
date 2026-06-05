let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try { ctx = new AudioContext(); } catch { return null; }
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function gain(ac: AudioContext, val: number, when = 0) {
  const g = ac.createGain();
  g.gain.setValueAtTime(val, when);
  return g;
}

export function playHit() {
  const ac = getCtx(); if (!ac) return;
  const t = ac.currentTime;
  const osc = ac.createOscillator();
  const g = gain(ac, 0.3, t);
  osc.connect(g); g.connect(ac.destination);
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(180, t);
  osc.frequency.exponentialRampToValueAtTime(80, t + 0.1);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  osc.start(t); osc.stop(t + 0.12);
}

export function playCrit() {
  const ac = getCtx(); if (!ac) return;
  const t = ac.currentTime;
  [0, 0.04].forEach((delay, i) => {
    const osc = ac.createOscillator();
    const g = gain(ac, 0.25, t + delay);
    osc.connect(g); g.connect(ac.destination);
    osc.type = "square";
    osc.frequency.setValueAtTime(i === 0 ? 320 : 480, t + delay);
    osc.frequency.exponentialRampToValueAtTime(60, t + delay + 0.18);
    g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.2);
    osc.start(t + delay); osc.stop(t + delay + 0.2);
  });
}

export function playBlock() {
  const ac = getCtx(); if (!ac) return;
  const t = ac.currentTime;
  const osc = ac.createOscillator();
  const g = gain(ac, 0.2, t);
  osc.connect(g); g.connect(ac.destination);
  osc.type = "triangle";
  osc.frequency.setValueAtTime(600, t);
  osc.frequency.setValueAtTime(400, t + 0.03);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  osc.start(t); osc.stop(t + 0.15);
}

export function playLevelUp() {
  const ac = getCtx(); if (!ac) return;
  const t = ac.currentTime;
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    const osc = ac.createOscillator();
    const g = gain(ac, 0.2, t + i * 0.1);
    osc.connect(g); g.connect(ac.destination);
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, t + i * 0.1);
    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.22);
    osc.start(t + i * 0.1); osc.stop(t + i * 0.1 + 0.22);
  });
}

export function playLootDrop() {
  const ac = getCtx(); if (!ac) return;
  const t = ac.currentTime;
  const osc = ac.createOscillator();
  const g = gain(ac, 0.18, t);
  osc.connect(g); g.connect(ac.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(300, t);
  osc.frequency.exponentialRampToValueAtTime(900, t + 0.15);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
  osc.start(t); osc.stop(t + 0.25);
}

export function playGold() {
  const ac = getCtx(); if (!ac) return;
  const t = ac.currentTime;
  [0, 0.06, 0.12].forEach((d, i) => {
    const osc = ac.createOscillator();
    const g = gain(ac, 0.12, t + d);
    osc.connect(g); g.connect(ac.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(800 + i * 200, t + d);
    g.gain.exponentialRampToValueAtTime(0.001, t + d + 0.15);
    osc.start(t + d); osc.stop(t + d + 0.15);
  });
}

export function playVictory() {
  const ac = getCtx(); if (!ac) return;
  const t = ac.currentTime;
  const notes = [392, 523, 659, 784, 659, 784, 1047];
  const times = [0, 0.12, 0.24, 0.36, 0.52, 0.6, 0.72];
  notes.forEach((freq, i) => {
    const osc = ac.createOscillator();
    const g = gain(ac, 0.18, t + times[i]);
    osc.connect(g); g.connect(ac.destination);
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, t + times[i]);
    g.gain.exponentialRampToValueAtTime(0.001, t + times[i] + (i === notes.length - 1 ? 0.4 : 0.18));
    osc.start(t + times[i]); osc.stop(t + times[i] + 0.4);
  });
}

export function playDefeat() {
  const ac = getCtx(); if (!ac) return;
  const t = ac.currentTime;
  const osc = ac.createOscillator();
  const g = gain(ac, 0.2, t);
  osc.connect(g); g.connect(ac.destination);
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(220, t);
  osc.frequency.exponentialRampToValueAtTime(80, t + 0.5);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
  osc.start(t); osc.stop(t + 0.55);
}

export function playEnhance(success: boolean) {
  if (success) {
    const ac = getCtx(); if (!ac) return;
    const t = ac.currentTime;
    [0, 0.1, 0.2].forEach((d, i) => {
      const osc = ac.createOscillator();
      const g = gain(ac, 0.15, t + d);
      osc.connect(g); g.connect(ac.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(440 + i * 220, t + d);
      g.gain.exponentialRampToValueAtTime(0.001, t + d + 0.15);
      osc.start(t + d); osc.stop(t + d + 0.15);
    });
  } else {
    const ac = getCtx(); if (!ac) return;
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const g = gain(ac, 0.15, t);
    osc.connect(g); g.connect(ac.destination);
    osc.type = "square";
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.2);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc.start(t); osc.stop(t + 0.22);
  }
}
