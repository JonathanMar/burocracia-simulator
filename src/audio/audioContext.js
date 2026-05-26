let _actx = null;
export let globalMuted = false;
export let globalSfxVol = 0.25;
export let globalMusicVol = 0.38;

export function setGlobalMuted(v) { globalMuted = v; }
export function setGlobalMusicVol(v) { globalMusicVol = v; }

export function getCtx() {
  if (!_actx) {
    try { _actx = new (window.AudioContext || window.webkitAudioContext)(); } catch(_) {}
  }
  if (_actx && _actx.state === "suspended") _actx.resume().catch(()=>{});
  return _actx;
}

export function closeCtx() {
  if (_actx) { _actx.close().catch(()=>{}); _actx = null; }
}

export function synthBeep(freq, dur, type = "square", vol = 0.3, delay = 0) {
  const ctx = getCtx(); if (!ctx || globalMuted) return;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, ctx.currentTime + delay);
  g.gain.linearRampToValueAtTime(vol * globalSfxVol, ctx.currentTime + delay + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
  g.connect(ctx.destination);
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, ctx.currentTime + delay);
  o.connect(g);
  o.start(ctx.currentTime + delay);
  o.stop(ctx.currentTime + delay + dur + 0.05);
}

export function synthNoise(dur, vol = 0.2, delay = 0, hipass = 200) {
  const ctx = getCtx(); if (!ctx || globalMuted) return;
  const bufLen = ctx.sampleRate * dur;
  const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filt = ctx.createBiquadFilter();
  filt.type = "highpass"; filt.frequency.value = hipass;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol * globalSfxVol, ctx.currentTime + delay);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
  src.connect(filt); filt.connect(g); g.connect(ctx.destination);
  src.start(ctx.currentTime + delay);
  src.stop(ctx.currentTime + delay + dur + 0.05);
}
