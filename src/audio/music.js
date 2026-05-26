import { globalMuted, globalMusicVol, getCtx, closeCtx, setGlobalMusicVol } from './audioContext.js';

let _musicNodes = [];
let _musicPlaying = false;

const MUSIC_NOTES = [220, 246.94, 261.63, 293.66, 329.63, 349.23, 392, 440, 493.88];
const BASS_NOTES  = [55, 65.41, 73.42, 82.41];

export function startMusic() {
  if (_musicPlaying || globalMuted) return;
  const ctx = getCtx(); if (!ctx) return;
  _musicPlaying = true;

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(globalMusicVol, ctx.currentTime);
  masterGain.connect(ctx.destination);
  _musicNodes.push(masterGain);

  const lofi = ctx.createBiquadFilter();
  lofi.type = "lowpass"; lofi.frequency.value = 2200; lofi.Q.value = 0.5;
  lofi.connect(masterGain);

  const tremolo = ctx.createGain();
  const tremoloLFO = ctx.createOscillator();
  tremoloLFO.frequency.value = 4.5;
  const tremoloGain = ctx.createGain();
  tremoloGain.gain.value = 0.04;
  tremoloLFO.connect(tremoloGain);
  tremoloGain.connect(tremolo.gain);
  tremolo.gain.value = 0.96;
  tremolo.connect(lofi);
  tremoloLFO.start();
  _musicNodes.push(tremoloLFO);

  const bpm = 82;
  const beat = 60 / bpm;
  const startTime = ctx.currentTime + 0.1;

  const chords = [
    [220, 261.63, 329.63, 392],
    [146.83, 220, 293.66, 349.23],
    [196, 246.94, 329.63, 392],
    [130.81, 196, 261.63, 329.63],
  ];

  const BARS = 64;
  for (let bar = 0; bar < BARS; bar++) {
    const chord = chords[bar % chords.length];
    const t = startTime + bar * beat * 4;

    chord.forEach((freq) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine"; o.frequency.value = freq;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.08, t + 0.15);
      g.gain.setValueAtTime(0.08, t + beat * 3.5);
      g.gain.linearRampToValueAtTime(0, t + beat * 4.2);
      o.connect(g); g.connect(tremolo);
      o.start(t); o.stop(t + beat * 4.5);
    });

    for (let h = 0; h < 8; h++) {
      const ht = t + h * beat * 0.5;
      const hg = ctx.createGain();
      const hbuf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
      const hdata = hbuf.getChannelData(0);
      for (let k = 0; k < hdata.length; k++) hdata[k] = (Math.random()*2-1);
      const hs = ctx.createBufferSource(); hs.buffer = hbuf;
      const hfilt = ctx.createBiquadFilter();
      hfilt.type = "highpass"; hfilt.frequency.value = 8000;
      hg.gain.setValueAtTime(h % 2 === 0 ? 0.06 : 0.03, ht);
      hg.gain.exponentialRampToValueAtTime(0.001, ht + 0.04);
      hs.connect(hfilt); hfilt.connect(hg); hg.connect(tremolo);
      hs.start(ht); hs.stop(ht + 0.05);
    }

    [0, 2].forEach(b => {
      const kt = t + b * beat;
      const kg = ctx.createGain();
      const ko = ctx.createOscillator();
      ko.type = "sine";
      ko.frequency.setValueAtTime(120, kt);
      ko.frequency.exponentialRampToValueAtTime(40, kt + 0.1);
      kg.gain.setValueAtTime(0.35, kt);
      kg.gain.exponentialRampToValueAtTime(0.001, kt + 0.2);
      ko.connect(kg); kg.connect(tremolo);
      ko.start(kt); ko.stop(kt + 0.25);
    });

    [1, 3].forEach(b => {
      const st = t + b * beat;
      const sg = ctx.createGain();
      const sbuf = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
      const sdata = sbuf.getChannelData(0);
      for (let k = 0; k < sdata.length; k++) sdata[k] = (Math.random()*2-1) * Math.exp(-k / (ctx.sampleRate * 0.05));
      const ss = ctx.createBufferSource(); ss.buffer = sbuf;
      sg.gain.setValueAtTime(0.15, st);
      sg.gain.exponentialRampToValueAtTime(0.001, st + 0.15);
      ss.connect(sg); sg.connect(tremolo);
      ss.start(st); ss.stop(st + 0.2);
    });

    if (bar % 2 === 0) {
      const riff = [0, 2, 4, 7];
      riff.forEach((semitone, i) => {
        const base = chord[0] * 2;
        const freq = base * Math.pow(2, semitone / 12);
        const rt = t + i * beat * 0.5 + 0.02;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "triangle"; o.frequency.value = freq;
        g.gain.setValueAtTime(0, rt);
        g.gain.linearRampToValueAtTime(0.07, rt + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, rt + beat * 0.45);
        o.connect(g); g.connect(tremolo);
        o.start(rt); o.stop(rt + beat * 0.5);
      });
    }
  }
}

export function stopMusic() {
  _musicPlaying = false;
  _musicNodes.forEach(n => { try { n.disconnect(); if (n.stop) n.stop(); } catch(_){} });
  _musicNodes = [];
  closeCtx();
}

export { setGlobalMusicVol as setMusicVolume };
