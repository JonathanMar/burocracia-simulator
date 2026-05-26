import { globalMuted, getCtx, synthBeep, synthNoise, globalSfxVol } from './audioContext.js';

export const SYNTH_SOUNDS = {
  approve:       () => { synthBeep(880, 0.08, "sine", 0.4); synthBeep(1320, 0.1, "sine", 0.3, 0.06); },
  reject:        () => { synthBeep(220, 0.15, "sawtooth", 0.4); synthBeep(160, 0.2, "square", 0.3, 0.1); },
  save_correct:  () => { synthBeep(660, 0.07, "sine", 0.35); synthBeep(880, 0.09, "sine", 0.3, 0.05); synthBeep(1100, 0.12, "sine", 0.25, 0.1); },
  save_wrong:    () => { synthBeep(200, 0.18, "square", 0.4); synthBeep(150, 0.25, "square", 0.35, 0.12); },
  printer_jam:   () => { synthNoise(0.25, 0.12, 0, 800); synthBeep(150, 0.3, "sawtooth", 0.10, 0.1); },
  printer_tap:   () => { synthNoise(0.06, 0.14, 0, 2000); synthBeep(80, 0.05, "square", 0.12); },
  printer_fix:   () => { synthNoise(0.3, 0.09, 0, 400); synthBeep(440, 0.1, "sine", 0.08, 0.2); },
  printer_start: () => { [0,1,2,3,4].forEach(i => synthNoise(0.08, 0.07, i*0.09, 600 + i*200)); },
  printer_dead:  () => { synthBeep(100, 0.5, "sawtooth", 0.13); synthNoise(0.4, 0.10, 0.1, 100); },
  stamp:         () => { synthNoise(0.05, 0.16, 0, 3000); synthBeep(200, 0.08, "square", 0.09); },
  paper_rustle:  () => { synthNoise(0.18, 0.25, 0, 2500); },
  staple_remove: () => { synthNoise(0.08, 0.5, 0, 1500); synthBeep(800, 0.04, "square", 0.2, 0.05); },
  align:         () => { synthNoise(0.12, 0.3, 0, 1000); },
  click_field:   () => { synthBeep(1200, 0.03, "sine", 0.25); },
  match_ok:      () => { synthBeep(660, 0.06, "sine", 0.3); synthBeep(990, 0.08, "sine", 0.25, 0.04); },
  match_diff:    () => { synthBeep(330, 0.1, "sawtooth", 0.35); },
  event_alert:   () => { [0,1,2].forEach(i => synthBeep(880, 0.08, "square", 0.35, i*0.12)); },
  achievement:   () => { [0,1,2,3].forEach(i => synthBeep(440*(1.25**i), 0.12, "sine", 0.3, i*0.08)); },
  error_buzz:    () => { synthNoise(0.3, 0.5, 0, 200); synthBeep(120, 0.4, "square", 0.4); },
  greve:         () => { synthBeep(440, 0.08, "square", 0.4); synthBeep(550, 0.08, "square", 0.4, 0.1); synthBeep(440, 0.08, "square", 0.4, 0.2); },
  blackout:      () => { synthNoise(0.5, 0.6, 0, 50); synthBeep(60, 0.5, "sine", 0.5); },
  typewriter:    () => { [0,1,2,3].forEach(i => { synthNoise(0.03, 0.4, i*0.04, 3000); }); },
  day_complete:  () => { [0,1,2,3,4].forEach(i => synthBeep(440*(1.189**i), 0.15, "sine", 0.3, i*0.1)); },
};

export const FILE_SOUNDS = {
  approve:       "/sounds/colocando_itens.mp4",
  reject:        "/sounds/bip_erro.mp4",
  printer_jam:   "/sounds/erro_puxar.mp4",
  printer_tap:   "/sounds/tapa.mp4",
  printer_fix:   "/sounds/arrumando.mp4",
  printer_start: "/sounds/digitalizacao.mp4",
  save_correct:  "/sounds/colocando_itens.mp4",
  save_wrong:    "/sounds/bip_erro.mp4",
  stamp:         "/sounds/colocando_itens.mp4",
  paper_rustle:  "/sounds/arrumando.mp4",
  staple_remove: "/sounds/arrumando.mp4",
};

const _fileAudioCache = {};
let _fileSoundsEnabled = true;

function playFileSound(name, volume = 0.8) {
  if (!_fileSoundsEnabled) return;
  const src = FILE_SOUNDS[name];
  if (!src) return;
  try {
    let base = _fileAudioCache[name];
    if (!base) {
      base = new Audio(src);
      base.addEventListener("error", () => { _fileSoundsEnabled = false; }, { once: true });
      _fileAudioCache[name] = base;
    }
    const clone = base.cloneNode();
    clone.volume = Math.min(1, volume);
    clone.play().catch(() => {});
  } catch (_) {}
}

export function playSound(name, volume = 1.0) {
  if (globalMuted) return;
  getCtx();
  const fn = SYNTH_SOUNDS[name];
  if (fn) fn();
  playFileSound(name, volume * 0.55);
}
