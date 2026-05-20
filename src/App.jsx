import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// SOUND SYSTEM — Web Audio API (synth) + real file playback + BG music
// ═══════════════════════════════════════════════════════════════════════════════
let _actx = null;
let globalMuted = false;
let globalSfxVol = 0.25;   // ← baixado (era 0.55)
let globalMusicVol = 0.38;  // ← aumentado (era 0.18)

function getCtx() {
  if (!_actx) {
    try { _actx = new (window.AudioContext || window.webkitAudioContext)(); } catch(_) {}
  }
  if (_actx && _actx.state === "suspended") _actx.resume().catch(()=>{});
  return _actx;
}

// ── Synth helpers ────────────────────────────────────────────────────────────
function synthBeep(freq, dur, type = "square", vol = 0.3, delay = 0) {
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

function synthNoise(dur, vol = 0.2, delay = 0, hipass = 200) {
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

// ── Sound definitions ─────────────────────────────────────────────────────────
const SYNTH_SOUNDS = {
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

// ── File-based sounds (real recordings, cloned for overlap) ──────────────────
const FILE_SOUNDS = {
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
let _fileSoundsEnabled = true; // disabled if first load fails

function playFileSound(name, volume = 0.8) {
  if (!_fileSoundsEnabled) return;
  const src = FILE_SOUNDS[name];
  if (!src) return;
  try {
    // Clone pattern: always create new Audio so sounds can overlap
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

// ── Main playSound: run synth + try real file ─────────────────────────────────
function playSound(name, volume = 1.0) {
  if (globalMuted) return;
  getCtx(); // ensure context is running
  const fn = SYNTH_SOUNDS[name];
  if (fn) fn();
  playFileSound(name, volume * 0.55);
}

// ── Background Music (procedural lo-fi office jazz) ──────────────────────────
let _musicNodes = [];
let _musicPlaying = false;

const MUSIC_NOTES = [220, 246.94, 261.63, 293.66, 329.63, 349.23, 392, 440, 493.88];
const BASS_NOTES  = [55, 65.41, 73.42, 82.41];

function startMusic() {
  if (_musicPlaying || globalMuted) return;
  const ctx = getCtx(); if (!ctx) return;
  _musicPlaying = true;

  // Master gain for music
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(globalMusicVol, ctx.currentTime);
  masterGain.connect(ctx.destination);
  _musicNodes.push(masterGain);

  // Lo-fi filter (warm, slightly muffled)
  const lofi = ctx.createBiquadFilter();
  lofi.type = "lowpass"; lofi.frequency.value = 2200; lofi.Q.value = 0.5;
  lofi.connect(masterGain);

  // Tremolo (office AC hum effect)
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

  // Chord progression: Am7 → Dm7 → G7 → Cmaj7 (jazz office vibe)
  const chords = [
    [220, 261.63, 329.63, 392],   // Am7
    [146.83, 220, 293.66, 349.23],// Dm7
    [196, 246.94, 329.63, 392],   // G7
    [130.81, 196, 261.63, 329.63],// Cmaj7
  ];

  const BARS = 64; // loop length
  for (let bar = 0; bar < BARS; bar++) {
    const chord = chords[bar % chords.length];
    const t = startTime + bar * beat * 4;

    // Pad chord
    chord.forEach((freq, i) => {
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

    // Hi-hat pattern (every half-beat)
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

    // Kick drum on beats 1 and 3
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

    // Snare on beats 2 and 4
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

    // Melodic riff (every 2 bars)
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

function stopMusic() {
  _musicPlaying = false;
  _musicNodes.forEach(n => { try { n.disconnect(); if (n.stop) n.stop(); } catch(_){} });
  _musicNodes = [];
  // Also close and recreate context next time
  if (_actx) { _actx.close().catch(()=>{}); _actx = null; }
}

function setMusicVolume(v) {
  globalMusicVol = v;
}

function useSoundToggle() {
  const [muted, setMuted] = useState(false);
  const toggle = useCallback(() => {
    setMuted(m => {
      const next = !m;
      globalMuted = next;
      if (next) stopMusic();
      else startMusic();
      return next;
    });
  }, []);
  return [muted, toggle];
}


// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════
const CITIES   = ["São Paulo","Belo Horizonte","Rio de Janeiro","Curitiba","Salvador","Fortaleza","Manaus","Porto Alegre"];
const NAMES    = ["João Silva","Maria Oliveira","Carlos Souza","Ana Lima","Pedro Costa","Fernanda Rocha","Roberto Alves","Cláudia Mendes","Marcos Santos","Juliana Ferreira","Lucas Pereira","Amanda Gomes"];
// Expanded doc types
const DOC_TYPES = ["RG","CNH","CONTRATO","LAUDO","CERTIDÃO","PROCESSO","DECLARAÇÃO","ATESTADO"];
const PRINTER_NAME = "Beatriz";

// Correct folder per doc type
const CORRECT_FOLDER = {
  "RG":         "CLIENTES/2026/RG",
  "CNH":        "CLIENTES/2026/CNH",
  "CONTRATO":   "CLIENTES/2026/CONTRATOS",
  "LAUDO":      "CLIENTES/2026/LAUDOS",
  "CERTIDÃO":   "CLIENTES/2026/CERTIDÕES",
  "PROCESSO":   "CLIENTES/2026/PROCESSOS",
  "DECLARAÇÃO": "CLIENTES/2026/DECLARAÇÕES",
  "ATESTADO":   "CLIENTES/2026/ATESTADOS",
};

const STORY_DAYS = [
  { day:1, boss:`Bom dia, novo funcionário. Digitalize os documentos, valide os dados e salve na pasta certa antes do expediente acabar. A ${PRINTER_NAME} está… razoável hoje.`, bossName:"Sr. Figueiredo", bossEmoji:"👔" },
  { day:2, boss:"Ontem foi aceitável. Hoje o volume aumenta. Alguém derramou café na impressora — ela está de péssimo humor. Ah, e sem erros.", bossName:"Sr. Figueiredo", bossEmoji:"👔" },
  { day:3, boss:"Auditoria na semana que vem. ZERO erros. O TI instalou uma 'atualização' hoje cedo. Boa sorte.", bossName:"Sr. Figueiredo", bossEmoji:"😤" },
  { day:4, boss:"Recebi reclamações. Documentos tortos, pastas erradas. Corrija isso hoje.", bossName:"Sr. Figueiredo", bossEmoji:"😤" },
  { day:5, boss:"Última chance. Nota mínima B e seu contrato é renovado. Talvez.", bossName:"Sra. Diretora", bossEmoji:"💼" },
];

const MEMORANDOS = [
  { day:2, text:"A partir de hoje, documentos de CURITIBA devem ser verificados com atenção redobrada ao campo Validade. Memorando 04/2026 — Dep. Jurídico." },
  { day:3, text:"Atenção: documentos com rasura no campo CPF são automaticamente INVÁLIDOS. Memorando 07/2026." },
  { day:4, text:"Novo protocolo: páginas faltando em CONTRATOS geram penalidade dobrada. Memorando 11/2026 — Auditoria Interna." },
  { day:5, text:"ALERTA: qualquer documento salvo na pasta errada será debitado do salário. Memorando 13/2026." },
];

const RANDOM_EVENTS = [
  { id:"coffee",   emoji:"☕", title:"CAFÉ DERRAMADO!",       desc:"Alguns documentos ficaram grudados e precisam ser preparados novamente.", duration:7000,  effect:"staple" },
  { id:"boss",     emoji:"👔", title:"CHEFE APARECEU!",       desc:'"Como estamos indo? Espero que sem erros…" Ele fica te olhando por 10 segundos.', duration:10000, effect:"pressure" },
  { id:"antivirus",emoji:"🛡️",title:"ANTIVÍRUS ATIVADO!",    desc:"O antivírus decidiu escanear TUDO agora. PC travado por 8 segundos.", duration:8000,  effect:"freeze" },
  { id:"cat",      emoji:"🐱", title:"GATO NA SALA!",         desc:"O gato sentou em cima dos documentos. Nada pode ser feito.", duration:6000,  effect:"block" },
  { id:"power",    emoji:"⚡", title:"ENERGIA PISCANDO!",     desc:"A impressora reiniciou e perdeu o humor acumulado.", duration:5000,  effect:"printer_reset" },
  { id:"phone",    emoji:"📞", title:"CLIENTE LIGANDO!",      desc:'"Cadê meu documento?!" Você perde 15 pontos.', duration:7000,  effect:"penalty" },
  { id:"update",   emoji:"💻", title:"WINDOWS UPDATE!",       desc:"Agora. Sem negociação. PC travado por 10 segundos.", duration:10000, effect:"freeze" },
  { id:"intern",   emoji:"🧑‍💼",title:"ESTAGIÁRIO AJUDANDO!", desc:"O estagiário processou um doc aleatório. Será que foi correto?", duration:5000,  effect:"intern" },
  { id:"meeting",  emoji:"📊", title:"REUNIÃO OBRIGATÓRIA!",  desc:"Todos na sala. Agora. PC travado por 12 segundos.", duration:12000, effect:"freeze" },
  { id:"wifi",     emoji:"📶", title:"IMPRESSORA COM WI-FI!", desc:`A ${PRINTER_NAME} conectou na internet e está imprimindo receitas. Clique em REINICIAR para parar.`, duration:99999, effect:"wifi_print" },
  { id:"blackout", emoji:"🌑", title:"QUEDA DE ENERGIA!",     desc:"Tela às escuras por 6 segundos.", duration:6000,  effect:"blackout" },
  { id:"colleague",emoji:"🙋", title:"COLEGA PEDINDO AJUDA!", desc:'"Você pode assinar por mim? É só um doc…" Aceitar: +15s, mas risco de erro extra.', duration:8000,  effect:"colleague" },
];

const PRINTER_EVENTS = [
  { id:"jam",      label:"ATOLAMENTO!",      color:"#cc4444", fix:"pull" },
  { id:"toner",    label:"SEM TONER",        color:"#bb7700", fix:"replace" },
  { id:"overheat", label:"SUPERAQUECIMENTO", color:"#bb4400", fix:"wait" },
  { id:"skewed",   label:"PAPEL TORTO",      color:"#999900", fix:"align" },
  { id:"ghost",    label:"MODO FANTASMA",    color:"#7744aa", fix:"restart" },
];

const PRINTER_LCD_MSGS = [
  "Eu sei o que você fez ontem.",
  "Detectei 0 motivos para cooperar.",
  "Humor: péssimo. Motivo: existência.",
  "Por favor não me bata de novo.",
  "ERRO 404: vontade de trabalhar não encontrada.",
  "Toner: 12%. Paciência: 0%.",
  "Considerando uma carreira diferente.",
];

const WEIGHT_ITEMS = [
  { id:"stapler", label:"Grampeador",     emoji:"📎", weight:1 },
  { id:"monitor", label:"Monitor Velho",  emoji:"🖥️", weight:4 },
  { id:"coffee",  label:"Copo de Café",   emoji:"☕", weight:1 },
  { id:"books",   label:"Pilha de Livros",emoji:"📚", weight:3 },
  { id:"binder",  label:"Fichário",       emoji:"🗂️", weight:2 },
];

const ACHIEVEMENTS = [
  { id:"tap10",       label:"Percussionista",     desc:"Deu 10 tapinhas na impressora",       emoji:"🥁", check:s=>s.taps>=10 },
  { id:"perfect",     label:"Sem Erros!",         desc:"Completou um dia sem erros",          emoji:"✨", check:s=>s.dayErrors===0 },
  { id:"wrongfolder", label:"Arquivista Caótico", desc:"Salvou em pasta errada 3 vezes",      emoji:"🗄️", check:s=>(s.wrongFolders||0)>=3 },
  { id:"rejected5",   label:"Rigoroso",           desc:"Rejeitou 5 docs inválidos corretamente",emoji:"🔍",check:s=>(s.correctRejections||0)>=5 },
  { id:"speedrun",    label:"Turbo Burocrático",  desc:"Completou dia com +120s sobrando",    emoji:"⚡", check:s=>(s.timeBonus||0)>=120 },
  { id:"intern",      label:"Confia no Estagiário",desc:"Estagiário acertou 3 vezes",        emoji:"🧑‍💼",check:s=>(s.internCorrect||0)>=3 },
  { id:"greve",       label:"Negociador",         desc:`A ${PRINTER_NAME} entrou em greve`,   emoji:"✊", check:s=>(s.printerStrikes||0)>=1 },
  { id:"investigator",label:"Investigador",       desc:"Comparou 20 campos manualmente",      emoji:"🕵️", check:s=>(s.fieldsCompared||0)>=20 },
];

const TUTORIAL_STEPS = [
  { title:"Bem-vindo ao Trabalho", emoji:"👋", content:"Você foi contratado para digitalizar documentos governamentais. Cada documento precisa ser inspecionado, preparado fisicamente e salvo no local correto antes do fim do expediente." },
  { title:"1. Escolha um Documento", emoji:"📋", content:"Na coluna ESQUERDA ficam os documentos pendentes. Clique em qualquer um para inspecioná-lo no painel central. Documentos com ⚙ precisam de preparação física antes de digitalizar." },
  { title:"2. Prepare Fisicamente", emoji:"⚙", content:"Antes de digitalizar, verifique se o doc tem grampos (remover) ou folhas desalinhadas (alinhar). Os botões aparecem acima da área de inspeção quando necessário." },
  { title:"3. Compare os Documentos", emoji:"🔍", content:"No centro você vê o DOCUMENTO ORIGINAL (esquerda) e a FICHA CADASTRAL (direita). Compare cada campo manualmente — Nome, CPF, Cidade, Validade. NÃO há marcação automática de erros. Os erros são seus para encontrar." },
  { title:"4. Clique nos Campos para Comparar", emoji:"🖱️", content:"Clique em qualquer campo do documento ou da ficha para selecioná-lo. Em seguida, clique no campo correspondente do outro lado. O sistema dirá apenas se os valores COINCIDEM ou DIVERGEM — não dirá se é erro ou não. Você decide." },
  { title:"5. Bloco de Notas", emoji:"📝", content:"Use o bloco de notas abaixo para marcar suspeitas. Clique nos botões '+CPF suspeito', '+Cidade diverge' etc. São só para sua organização — não afetam o jogo diretamente." },
  { title:"6. Aprove ou Rejeite", emoji:"⚖", content:"APROVADO: digitaliza o doc (mesmo com erros — você arca com a penalidade). REJEITAR: descarta o doc. Rejeitar um doc válido perde 40 pts. Aprovar um inválido perde 35+ pts. Rejeitar corretamente ganha pontos." },
  { title:"7. Salve no Lugar Certo", emoji:"💾", content:"Após digitalizar, escolha a pasta correta na modal. RG → RG, CNH → CNH, Contrato → CONTRATOS, etc. Pasta errada = -28 pts. Os docs digitalizados ficam na seção 'AGUARDANDO SALVAR' na lista esquerda." },
  { title:"8. A Beatriz (Impressora)", emoji:"🖨️", content:`Coloque peso em cima dela (2–5 kg) para digitalizar direito. Quando travar, use a ação CORRETA: Atolamento→Puxar, Sem Toner→Trocar Toner, Superaquecimento→Resfriar, Papel Torto/Fantasma→Reiniciar. Tapinha é uma aposta — pode piorar.` },
  { title:"9. Vida Zero = Pane Total", emoji:"💀", content:`Se a saúde da ${PRINTER_NAME} chegar a 0%, ela para completamente e drena seus pontos até o técnico chegar. Muitos tapinhas levam à GREVE (20s parada). Cuide bem dela.` },
  { title:"Pronto!", emoji:"🚀", content:"Eventos aleatórios vão acontecer: café, chefe, antivírus, queda de energia, estagiário e mais. Alta reputação com a Beatriz = ela avisa antes de quebrar. Boa sorte!" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
function generateCPF(valid=true){
  const r=()=>Math.floor(Math.random()*9);
  const d=Array.from({length:9},r);
  if(!valid) return `${d[0]}${d[1]}${d[2]}.${d[3]}${d[4]}${d[5]}.${d[6]}${d[7]}${d[8]}-99`;
  let s1=d.reduce((a,v,i)=>a+v*(10-i),0);
  let r1=(s1*10)%11; if(r1>=10)r1=0;
  let s2=d.reduce((a,v,i)=>a+v*(11-i),0)+r1*2;
  let r2=(s2*10)%11; if(r2>=10)r2=0;
  return `${d[0]}${d[1]}${d[2]}.${d[3]}${d[4]}${d[5]}.${d[6]}${d[7]}${d[8]}-${r1}${r2}`;
}
const rf = arr => arr[Math.floor(Math.random()*arr.length)];
const p2 = n => String(n).padStart(2,"0");

// Generate a random signature SVG path (squiggly line)
function genSignature() {
  const pts = [];
  let x = 10, y = 20;
  for (let i = 0; i < 6; i++) {
    x += 10 + Math.random() * 15;
    y = 15 + Math.random() * 15;
    pts.push(`${i===0?"M":"L"}${x.toFixed(0)},${y.toFixed(0)}`);
  }
  // add a small loop at end
  x += 8; pts.push(`Q${x+5},${y-10} ${x+10},${y}`);
  return pts.join(" ");
}

// Determine how many docs per level
function docsForLevel(lv) { return 3 + lv * 2; }

function generateDoc(id, level, allDocs=[]){
  const type=rf(DOC_TYPES), name=rf(NAMES), city=rf(CITIES);
  const validCPF=Math.random()>0.32, cityMismatch=Math.random()>0.62;
  const nameMismatch=Math.random()>0.74, expired=Math.random()>0.8;
  const missingPages=level>1&&Math.random()>0.74;
  const hasGrampo=Math.random()>0.45, misaligned=Math.random()>0.5;
  const hasRasura=level>2&&Math.random()>0.8;
  // FIX: missingStamp applies to CONTRATO, PROCESSO, and now DECLARAÇÃO too
  const missingStamp=level>1&&(type==="CONTRATO"||type==="PROCESSO"||type==="DECLARAÇÃO")&&Math.random()>0.75;
  // FIX: Missing signature — new issue type
  const missingSignature=level>0&&Math.random()>0.78;
  const isDuplicate=level>2&&allDocs.length>0&&Math.random()>0.82;
  const dupSource=isDuplicate?rf(allDocs.filter(d=>!d.isDuplicate)):null;
  const cpf=isDuplicate&&dupSource?dupSource.data.cpf:generateCPF(validCPF);
  const issueYear=expired?2019+Math.floor(Math.random()*3):2024;
  const expiryYear=expired?2022+Math.floor(Math.random()*2):2027;
  
  // Extra CNH-specific fields
  const cnhCategory = rf(["A","B","AB","C","D","E"]);
  const cnhNumber = `${Math.floor(Math.random()*90000000)+10000000}`;
  
  // Photo placeholder — whether photo looks different from name
  const photoMismatch = level>2&&Math.random()>0.85;

  const issues=[];
  if(!validCPF&&!isDuplicate) issues.push("CPF inválido");
  if(isDuplicate) issues.push("CPF duplicado");
  if(cityMismatch) issues.push("Cidade incompatível");
  if(nameMismatch) issues.push("Nome divergente");
  if(expired) issues.push("Documento vencido");
  if(missingPages) issues.push("Página faltando");
  if(hasRasura) issues.push("Rasura no CPF");
  if(missingStamp) issues.push("Carimbo ausente");
  if(missingSignature) issues.push("Assinatura ausente");
  if(photoMismatch) issues.push("Foto suspeita");

  // Pages: CONTRATO, PROCESSO, DECLARAÇÃO = 2 pages; others = 1
  const isMultiPage = type==="CONTRATO"||type==="PROCESSO"||type==="DECLARAÇÃO";
  
  return {
    id, type,
    pages:missingPages?1:(isMultiPage?2:1),
    expectedPages:isMultiPage?2:1,
    data:{ name, city, cpf,
      formCity:cityMismatch?rf(CITIES.filter(c=>c!==city)):city,
      formName:nameMismatch?rf(NAMES.filter(n=>n!==name)):name,
      issueDate:`${p2(Math.floor(Math.random()*28)+1)}/${p2(Math.floor(Math.random()*12)+1)}/${issueYear}`,
      expiryDate:`31/12/${expiryYear}`,
      rg:`${Math.floor(Math.random()*90000000)+10000000}-${Math.floor(Math.random()*9)}`,
      organ:rf(["SSP/SP","SSP/RJ","SSP/MG","DETRAN/PR","SSP/BA","DETRAN/RS"]),
      cnhCategory, cnhNumber,
      // Signature data
      signature: missingSignature ? null : genSignature(),
      photoMismatch,
      // Atestado/Laudo
      cid: `${rf(["J00","I10","F32","K21","M54","Z76","R50"])}.${Math.floor(Math.random()*9)}`,
      doctor: rf(["Dr. Henrique Costa","Dra. Sandra Melo","Dr. Paulo Ramos","Dra. Vera Lima"]),
      crm: `CRM-SP ${Math.floor(Math.random()*90000)+10000}`,
    },
    issues, isValid:issues.length===0,
    scanned:false, savedPath:null,
    aligned:!misaligned, hasGrampo, misaligned,
    physicalReady:!misaligned&&!hasGrampo,
    hasRasura, missingStamp, missingSignature, isDuplicate, photoMismatch,
    urgentDeadline:Math.random()>0.85?Date.now()+30000:null,
    suspectedFields:[],
  };
}

function genLevel(lv){
  const docs=[];
  for(let i=0;i<docsForLevel(lv);i++) docs.push(generateDoc(i+1,lv,docs));
  return docs;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FIELD COMPARISON SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════
function FieldCompareResult({ first, second, onDismiss }) {
  if (!first || !second) return null;
  const same = first.value === second.value;
  return (
    <div style={{
      position:"fixed", bottom:80, left:"50%", transform:"translateX(-50%)",
      background: same ? "#0a1a0a" : "#1a0a0a",
      border:`1px solid ${same?"#336633":"#663333"}`,
      borderRadius:8, padding:"12px 20px", zIndex:400,
      fontFamily:"'Courier New',monospace", textAlign:"center",
      boxShadow:`0 0 20px ${same?"#33663322":"#66333322"}`,
      animation:"slideIn 0.2s ease", minWidth:320,
    }}>
      <div style={{color:"#888", fontSize:10, marginBottom:6}}>COMPARAÇÃO DE CAMPOS</div>
      <div style={{display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:10, alignItems:"center", marginBottom:10}}>
        <div style={{background:"#0f0f1a", border:"1px solid #333", borderRadius:4, padding:"6px 10px"}}>
          <div style={{color:"#888", fontSize:9, marginBottom:2}}>{first.side.toUpperCase()}</div>
          <div style={{color:"#ddd", fontSize:11, fontWeight:"bold"}}>{first.label}</div>
          <div style={{color:"#bbb", fontSize:12, marginTop:2, fontFamily:"Georgia,serif"}}>{first.value}</div>
        </div>
        <div style={{fontSize:20}}>{same ? "=" : "≠"}</div>
        <div style={{background:"#0f0f1a", border:"1px solid #333", borderRadius:4, padding:"6px 10px"}}>
          <div style={{color:"#888", fontSize:9, marginBottom:2}}>{second.side.toUpperCase()}</div>
          <div style={{color:"#ddd", fontSize:11, fontWeight:"bold"}}>{second.label}</div>
          <div style={{color:"#bbb", fontSize:12, marginTop:2, fontFamily:"Georgia,serif"}}>{second.value}</div>
        </div>
      </div>
      <div style={{
        color: same ? "#55aa55" : "#cc5555",
        fontSize:13, fontWeight:"bold", marginBottom:8,
      }}>
        {same ? "✓ Valores coincidem" : "≠ Valores divergem"}
      </div>
      <div style={{color:"#666", fontSize:10, marginBottom:10}}>
        {same
          ? "Estes dois campos têm o mesmo conteúdo."
          : "Estes dois campos têm conteúdo diferente — avalie se é relevante."}
      </div>
      <button onClick={onDismiss} style={{
        background:"transparent", border:"1px solid #444", color:"#777",
        padding:"4px 16px", borderRadius:3, cursor:"pointer",
        fontFamily:"'Courier New',monospace", fontSize:11,
      }}>Fechar</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLICKABLE FIELD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
function ClickableField({ fieldId, label, value, side, selectedField, onFieldClick, suspicious }) {
  const isSelected = selectedField?.fieldId === fieldId;
  const isSameSide = selectedField?.side === side;
  const canCompare = selectedField && !isSameSide && selectedField.label === label;

  return (
    <div
      onClick={() => onFieldClick({ fieldId, label, value, side })}
      title={canCompare ? `Clique para comparar com "${selectedField.value}"` : `Clique para selecionar este campo`}
      style={{
        display:"flex", gap:8, marginBottom:7, cursor:"pointer",
        borderRadius:3, padding:"2px 4px", transition:"all 0.15s",
        background: isSelected ? "#2a2a10" : canCompare ? "#0a1a2a" : "transparent",
        outline: isSelected ? "1px solid #aaa900" : canCompare ? "1px solid #224466" : "none",
        position:"relative",
      }}
    >
      <span style={{
        color:"#aaa", fontSize:9, textTransform:"uppercase",
        letterSpacing:0.4, minWidth:70, paddingTop:3, flexShrink:0,
      }}>{label}</span>
      <span style={{
        background: suspicious ? "#1a1000" : side==="ficha" ? "#dde8f5" : "#e5ddc8",
        border:`1px solid ${suspicious?"#664400":side==="ficha"?"#a0b8d8":"#c0aa88"}`,
        padding:"2px 6px", borderRadius:2, fontSize:12, fontWeight:"bold",
        color: suspicious ? "#cc8800" : "#111", flex:1,
        transition:"all 0.15s",
      }}>{value}</span>
      {suspicious && (
        <span style={{
          position:"absolute", top:-4, right:-4,
          fontSize:10, background:"#1a0800", borderRadius:"50%",
          width:16, height:16, display:"flex", alignItems:"center",
          justifyContent:"center", border:"1px solid #664400",
        }}>🔖</span>
      )}
      {isSelected && (
        <span style={{
          position:"absolute", right:4, top:"50%", transform:"translateY(-50%)",
          color:"#aaa900", fontSize:10,
        }}>← selecionado</span>
      )}
      {canCompare && (
        <span style={{
          position:"absolute", right:4, top:"50%", transform:"translateY(-50%)",
          color:"#446688", fontSize:10, animation:"blink 0.8s infinite",
        }}>comparar →</span>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIGNATURE SVG component
// ═══════════════════════════════════════════════════════════════════════════════
function SignatureField({ path, label="Assinatura", missing=false }) {
  return (
    <div style={{marginTop:8, borderTop:"1px dashed #c0aa88", paddingTop:6}}>
      <div style={{fontSize:8, color:"#999", marginBottom:2}}>{label}</div>
      {missing ? (
        <div style={{
          height:28, background:"#fff8e0", border:"1px dashed #cc8800",
          borderRadius:2, display:"flex", alignItems:"center",
          justifyContent:"center", gap:6,
        }}>
          <span style={{color:"#cc6600", fontSize:10, fontWeight:"bold"}}>⚠ ASSINATURA AUSENTE</span>
        </div>
      ) : (
        <svg width="120" height="35" style={{display:"block", overflow:"visible"}}>
          <path d={path} stroke="#1a3080" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  );
}

// Photo placeholder component
function PhotoPlaceholder({ mismatch=false }) {
  return (
    <div style={{
      width:52, height:64, border:`1px solid ${mismatch?"#cc6600":"#c0aa88"}`,
      background:mismatch?"#fff4e0":"#f0ece0", display:"flex",
      flexDirection:"column", alignItems:"center", justifyContent:"center",
      gap:2, flexShrink:0, borderRadius:1, position:"relative",
    }}>
      <div style={{fontSize:20}}>{mismatch?"❓":"👤"}</div>
      <div style={{fontSize:7, color:mismatch?"#cc6600":"#aaa", textAlign:"center", lineHeight:1.2}}>
        {mismatch?"FOTO\nSUSPEITA":"3x4"}
      </div>
      {mismatch && (
        <div style={{
          position:"absolute", top:-5, right:-5, background:"#cc6600",
          color:"#fff", fontSize:8, borderRadius:"50%", width:14, height:14,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>⚠</div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENT VISUAL — no automatic red highlighting
// ═══════════════════════════════════════════════════════════════════════════════
function DocSheet({ children, headerColor="#7a1515", bg="#f4efe6", borderCol="#c0aa88", title, subtitle, seal }) {
  return (
    <div style={{
      background:bg, border:`1px solid ${borderCol}`, borderRadius:3,
      padding:"12px 14px", fontFamily:"Georgia,serif", color:"#1a1a1a",
      boxShadow:"2px 4px 10px #00000028", fontSize:11, position:"relative",
    }}>
      <div style={{borderBottom:`2px solid ${headerColor}`, paddingBottom:6, marginBottom:9}}>
        <div style={{fontSize:12, fontWeight:"bold", color:headerColor, letterSpacing:0.8}}>{title}</div>
        {subtitle && <div style={{fontSize:9, color:"#777", marginTop:2}}>{subtitle}</div>}
      </div>
      {seal && <div style={{position:"absolute", top:10, right:12, fontSize:20, opacity:0.3}}>{seal}</div>}
      {children}
    </div>
  );
}

function DocumentVisual({ doc, page=1, selectedField, onFieldClick, suspectedFields=[] }) {
  const expired = doc.issues.includes("Documento vencido");
  const expiredStamp = expired ? (
    <div style={{position:"absolute",bottom:10,right:10,border:"2px solid #aa000044",color:"#aa0000",padding:"1px 8px",fontSize:9,fontWeight:"bold",letterSpacing:1,borderRadius:2,transform:"rotate(-7deg)",opacity:0.7}}>VENCIDO</div>
  ) : null;
  const sf = suspectedFields;
  const fp = (name) => sf.includes(`doc:${name}`);

  const field = (label, value, name) => (
    <ClickableField
      fieldId={`doc:${name}`} label={label} value={value} side="documento"
      selectedField={selectedField} onFieldClick={onFieldClick}
      suspicious={fp(name)}
    />
  );

  // ── RG ──────────────────────────────────────────────────────────────────────
  if (doc.type === "RG") return (
    <DocSheet title="CARTEIRA DE IDENTIDADE" subtitle={`República Federativa do Brasil • ${doc.data.organ}`} headerColor="#7a1515" seal="🏛️">
      <div style={{display:"flex", gap:8, marginBottom:4}}>
        <PhotoPlaceholder mismatch={doc.photoMismatch}/>
        <div style={{flex:1}}>
          {field("Nome", doc.data.name, "name")}
          {field("CPF", doc.hasRasura ? "███.███.███-██  ⚠rasura" : doc.data.cpf, "cpf")}
          {field("RG", doc.data.rg, "rg")}
          {field("Naturalidade", doc.data.city, "city")}
        </div>
      </div>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:6}}>
        {field("Emissão", doc.data.issueDate, "issueDate")}
        {field("Validade", doc.data.expiryDate, "expiryDate")}
      </div>
      <SignatureField path={doc.data.signature} label="Assinatura do Titular" missing={doc.missingSignature}/>
      {expiredStamp}
    </DocSheet>
  );

  // ── CNH ─────────────────────────────────────────────────────────────────────
  if (doc.type === "CNH") return (
    <DocSheet title="CARTEIRA NACIONAL DE HABILITAÇÃO" subtitle={`DETRAN • ${doc.data.organ}`} headerColor="#1a5a7a" bg="#eef5fa" borderCol="#90b8d0" seal="🚗">
      <div style={{display:"flex", gap:8, marginBottom:4}}>
        <PhotoPlaceholder mismatch={doc.photoMismatch}/>
        <div style={{flex:1}}>
          {field("Nome", doc.data.name, "name")}
          {field("CPF", doc.hasRasura ? "███.███.███-██  ⚠rasura" : doc.data.cpf, "cpf")}
          {field("Registro", doc.data.cnhNumber, "cnhNumber")}
          {field("Categoria", doc.data.cnhCategory, "cnhCategory")}
        </div>
      </div>
      {field("Naturalidade", doc.data.city, "city")}
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:6}}>
        {field("Emissão", doc.data.issueDate, "issueDate")}
        {field("Validade", doc.data.expiryDate, "expiryDate")}
      </div>
      <SignatureField path={doc.data.signature} label="Assinatura do Condutor" missing={doc.missingSignature}/>
      {expiredStamp}
    </DocSheet>
  );

  // ── CONTRATO / PROCESSO ──────────────────────────────────────────────────────
  if (doc.type === "CONTRATO" || doc.type === "PROCESSO") {
    if (page === 2 && doc.issues.includes("Página faltando")) return (
      <div style={{background:"#f4efe6",border:"1px dashed #c0aa88",borderRadius:3,minHeight:200,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8,opacity:0.5}}>
        <div style={{fontSize:26}}>📄</div>
        <div style={{color:"#aa0000",fontWeight:"bold",fontSize:12,fontFamily:"Georgia,serif"}}>PÁGINA 2 AUSENTE</div>
      </div>
    );
    return (
      <DocSheet title={doc.type==="CONTRATO"?"CONTRATO DE PRESTAÇÃO DE SERVIÇOS":"PROCESSO ADMINISTRATIVO"} subtitle={`Nº ${String(doc.id).padStart(6,"0")}/2026 • Pág. ${page} de 2`} headerColor="#1e3d7a" bg="#eef2f8" borderCol="#a0b8d8" seal="⚖️">
        {page===1 ? (
          <>
            {field("Contratante", doc.data.formName, "formName")}
            {field("CPF", doc.data.cpf, "cpf")}
            {field("Cidade", doc.data.formCity, "formCity")}
            {field("Data", doc.data.issueDate, "issueDate")}
            {doc.missingStamp && <div style={{background:"#fff8e0",border:"1px solid #d4a000",borderRadius:2,padding:"4px 8px",fontSize:9,color:"#a06000",marginTop:6}}>⚠ Área de carimbo: vazia</div>}
            <div style={{marginTop:8,color:"#666",fontSize:9,lineHeight:1.6,borderTop:"1px dashed #c0aa88",paddingTop:6}}>Pelo presente instrumento, as partes acordam os termos e condições aqui estabelecidos...</div>
          </>
        ) : (
          <>
            {field("Titular (pág.2)", doc.data.name, "name")}
            <div style={{marginTop:8,color:"#666",fontSize:9,lineHeight:1.6}}>...sendo a validade de 12 meses a contar da data de assinatura.</div>
            <div style={{marginTop:12,display:"flex",gap:12}}>
              <div style={{flex:1}}>
                <SignatureField path={doc.data.signature} label="Assinatura do Titular" missing={doc.missingSignature}/>
              </div>
              <div style={{flex:1}}>
                <SignatureField path={doc.data.signature ? doc.data.signature + " M2" : null} label="Testemunha"/>
              </div>
            </div>
          </>
        )}
      </DocSheet>
    );
  }

  // ── DECLARAÇÃO ───────────────────────────────────────────────────────────────
  if (doc.type === "DECLARAÇÃO") {
    if (page === 2 && doc.issues.includes("Página faltando")) return (
      <div style={{background:"#f4efe6",border:"1px dashed #c0aa88",borderRadius:3,minHeight:200,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8,opacity:0.5}}>
        <div style={{fontSize:26}}>📄</div>
        <div style={{color:"#aa0000",fontWeight:"bold",fontSize:12,fontFamily:"Georgia,serif"}}>PÁGINA 2 AUSENTE</div>
      </div>
    );
    return (
      <DocSheet title="DECLARAÇÃO DE IMPOSTO DE RENDA" subtitle={`Exercício 2026 • IRPF • Pág. ${page} de 2`} headerColor="#3a5a1a" bg="#f0f5ea" borderCol="#90b870" seal="💰">
        {page===1 ? (
          <>
            {field("Declarante", doc.data.formName, "formName")}
            {field("CPF", doc.data.cpf, "cpf")}
            {field("Município", doc.data.formCity, "formCity")}
            {field("Ano-Calendário", doc.data.issueDate.split("/")[2], "issueDate")}
            {doc.missingStamp && <div style={{background:"#fff8e0",border:"1px solid #d4a000",borderRadius:2,padding:"4px 8px",fontSize:9,color:"#a06000",marginTop:6}}>⚠ Carimbo da Receita Federal: ausente</div>}
            <div style={{marginTop:8,color:"#666",fontSize:9,lineHeight:1.6,borderTop:"1px dashed #90b870",paddingTop:6}}>Declaro que as informações prestadas neste formulário são verdadeiras...</div>
          </>
        ) : (
          <>
            {field("Titular (pág.2)", doc.data.name, "name")}
            <div style={{marginTop:8,color:"#666",fontSize:9}}>Bens, direitos e obrigações declarados conforme legislação vigente.</div>
            <SignatureField path={doc.data.signature} label="Assinatura do Declarante" missing={doc.missingSignature}/>
          </>
        )}
      </DocSheet>
    );
  }

  // ── LAUDO ───────────────────────────────────────────────────────────────────
  if (doc.type === "LAUDO") return (
    <DocSheet title="LAUDO MÉDICO / TÉCNICO" subtitle={`Protocolo ${String(doc.id).padStart(5,"0")}`} headerColor="#165a30" bg="#f0f5f0" borderCol="#90b8a0" seal="🏥">
      {field("Paciente", doc.data.formName, "formName")}
      {field("CPF", doc.data.cpf, "cpf")}
      {field("Cidade", doc.data.formCity, "formCity")}
      {field("Data", doc.data.issueDate, "issueDate")}
      {field("CID", doc.data.cid, "cid")}
      <div style={{marginTop:8,background:"#dceee3",borderRadius:2,padding:8,fontSize:9,color:"#444",lineHeight:1.6}}><strong>Parecer:</strong> Paciente apto para as atividades descritas.</div>
      <div style={{marginTop:6,fontSize:9,color:"#666"}}>Responsável: {doc.data.doctor} — {doc.data.crm}</div>
      <SignatureField path={doc.data.signature} label="Assinatura do Médico" missing={doc.missingSignature}/>
    </DocSheet>
  );

  // ── ATESTADO ─────────────────────────────────────────────────────────────────
  if (doc.type === "ATESTADO") return (
    <DocSheet title="ATESTADO MÉDICO" subtitle={`Emitido em ${doc.data.issueDate}`} headerColor="#5a1a5a" bg="#f5f0f5" borderCol="#b090b8" seal="🩺">
      {field("Paciente", doc.data.formName, "formName")}
      {field("CPF", doc.data.cpf, "cpf")}
      {field("Cidade", doc.data.formCity, "formCity")}
      {field("CID", doc.data.cid, "cid")}
      {field("Validade", doc.data.expiryDate, "expiryDate")}
      <div style={{marginTop:8,background:"#ede0ed",borderRadius:2,padding:8,fontSize:9,color:"#444",lineHeight:1.6}}>
        Atesto que o(a) paciente acima necessita de afastamento por período determinado.
      </div>
      <div style={{marginTop:6,fontSize:9,color:"#666"}}>Dr(a): {doc.data.doctor} — {doc.data.crm}</div>
      <SignatureField path={doc.data.signature} label="Assinatura e Carimbo" missing={doc.missingSignature}/>
      {expiredStamp}
    </DocSheet>
  );

  // ── CERTIDÃO (default) ───────────────────────────────────────────────────────
  return (
    <DocSheet title="CERTIDÃO OFICIAL" subtitle={`Cartório Oficial • Reg. nº ${String(doc.id).padStart(7,"0")}`} headerColor="#5a3010" bg="#f5f0e0" borderCol="#c0a060" seal="🏛️">
      {field("Requerente", doc.data.formName, "formName")}
      {field("CPF", doc.data.cpf, "cpf")}
      {field("Comarca", doc.data.formCity, "formCity")}
      {field("Emissão", doc.data.issueDate, "issueDate")}
      {field("Validade", doc.data.expiryDate, "expiryDate")}
      <SignatureField path={doc.data.signature} label="Assinatura do Escrivão" missing={doc.missingSignature}/>
      {expiredStamp}
    </DocSheet>
  );
}

function FichaCadastral({ doc, selectedField, onFieldClick, suspectedFields=[] }) {
  const sf = suspectedFields;
  const fp = name => sf.includes(`ficha:${name}`);
  const field = (label, value, name) => (
    <ClickableField
      fieldId={`ficha:${name}`} label={label} value={value} side="ficha"
      selectedField={selectedField} onFieldClick={onFieldClick}
      suspicious={fp(name)}
    />
  );
  return (
    <div style={{background:"#eef2f8",border:"1px solid #a0b8d8",borderRadius:3,padding:"12px 14px",fontFamily:"Georgia,serif",boxShadow:"2px 4px 10px #00000020",fontSize:11}}>
      <div style={{borderBottom:"2px solid #1e3d7a",paddingBottom:6,marginBottom:9}}>
        <div style={{fontSize:11,fontWeight:"bold",color:"#1e3d7a",letterSpacing:0.8}}>FORMULÁRIO DE CADASTRO</div>
        <div style={{fontSize:9,color:"#777",marginTop:2}}>Digitalizações Infernais Ltda. • Uso Interno</div>
      </div>
      {field("Nome Completo",   doc.data.formName,   "name")}
      {field("CPF",             doc.data.cpf,        "cpf")}
      {field("Cidade/Município",doc.data.formCity,   "city")}
      {field("Data Referência", doc.data.issueDate,  "issueDate")}
      {(doc.type==="CNH") && field("Categoria CNH", doc.data.cnhCategory, "cnhCategory")}
      {(doc.type==="LAUDO"||doc.type==="ATESTADO") && field("CID", doc.data.cid, "cid")}
      <div style={{marginTop:12,borderTop:"1px dashed #a0b8d8",paddingTop:8,display:"flex",justifyContent:"flex-end",gap:8}}>
        {["Responsável","Data"].map(l=>(
          <div key={l} style={{textAlign:"center",borderTop:"1px solid #1e3d7a",paddingTop:3,width:68}}>
            <div style={{fontSize:8,color:"#999"}}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INSPECTION PANEL
// ═══════════════════════════════════════════════════════════════════════════════
function InspectionPanel({ doc, onApprove, onReject, frozen, blackout, onFieldCompare, suspectedFields, onToggleSuspect }) {
  const [activePage, setActivePage]     = useState(1);
  const [notes, setNotes]               = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [compareResult, setCompareResult] = useState(null);

  useEffect(() => { setActivePage(1); setNotes([]); setSelectedField(null); setCompareResult(null); }, [doc?.id]);

  function handleFieldClick(field) {
    playSound("click_field", 0.5);
    if (!selectedField) {
      setSelectedField(field);
      return;
    }
    if (selectedField.side === field.side) {
      setSelectedField(field);
      return;
    }
    if (selectedField.label !== field.label) {
      setSelectedField(field);
      return;
    }
    const same = selectedField.value === field.value;
    playSound(same ? "match_ok" : "match_diff", 0.7);
    setCompareResult({ first: selectedField, second: field });
    setSelectedField(null);
    onFieldCompare();
  }

  if (!doc) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",flexDirection:"column",gap:12,padding:20}}>
      <div style={{fontSize:44,opacity:0.12}}>📋</div>
      <div style={{fontFamily:"'Courier New',monospace",fontSize:13,color:"#777",textAlign:"center"}}>Selecione um documento para inspecionar</div>
      <div style={{fontFamily:"'Courier New',monospace",fontSize:11,color:"#555",textAlign:"center",maxWidth:280,lineHeight:1.7}}>Compare manualmente os campos entre o documento e a ficha cadastral — clique nos campos para comparar valores</div>
    </div>
  );

  const hasMulti  = doc.expectedPages > 1;
  const canAct    = !frozen && !blackout;
  const canApprove = doc.physicalReady && canAct;

  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",fontFamily:"'Courier New',monospace",gap:0,position:"relative"}}>

      {/* Freeze / Blackout overlay */}
      {(frozen || blackout) && (
        <div style={{position:"absolute",inset:0,background:blackout?"#000000f0":"#00000099",zIndex:20,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:8,transition:"background 0.3s"}}>
          {blackout
            ? <div style={{color:"#ffffffcc",textAlign:"center",animation:"blink 0.8s infinite"}}><div style={{fontSize:36,marginBottom:8}}>🌑</div><div style={{fontSize:13}}>QUEDA DE ENERGIA</div></div>
            : <div style={{color:"#5a8fff",textAlign:"center"}}><div style={{fontSize:30,marginBottom:8}}>🔒</div><div style={{fontSize:13}}>PC TRAVADO</div></div>}
        </div>
      )}

      {/* Header */}
      <div style={{flexShrink:0,padding:"10px 14px 8px",borderBottom:"1px solid #0f0f1a",display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
        <span style={{background:"#1a2a4a",border:"1px solid #2a4a6a",color:"#6a9eff",padding:"2px 8px",borderRadius:3,fontSize:11}}>DOC #{doc.id}</span>
        <span style={{color:"#999",fontSize:12}}>{doc.type}</span>
        {doc.urgentDeadline && Date.now()<doc.urgentDeadline && (
          <span style={{color:"#ff5555",fontSize:10,background:"#300000",border:"1px solid #ff333355",padding:"1px 6px",borderRadius:3,animation:"blink 0.8s infinite"}}>🔴 URGENTE</span>
        )}
        {!doc.physicalReady && (
          <span style={{color:"#cc8800",fontSize:10,background:"#221800",border:"1px solid #cc880033",padding:"1px 6px",borderRadius:3}}>⚙ Prepare antes de digitalizar</span>
        )}
        {hasMulti && (
          <div style={{marginLeft:"auto",display:"flex",gap:5}}>
            {[1,2].map(p=>(
              <button key={p} onClick={()=>setActivePage(p)} style={{background:activePage===p?"#1a2a4a":"transparent",border:`1px solid ${activePage===p?"#4a9eff":"#333"}`,color:activePage===p?"#6a9eff":"#777",padding:"3px 10px",borderRadius:3,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:11}}>Pág {p}</button>
            ))}
          </div>
        )}
      </div>

      {/* Compare hint */}
      {selectedField && (
        <div style={{flexShrink:0,background:"#1a1a08",borderBottom:"1px solid #333300",padding:"6px 14px",display:"flex",alignItems:"center",gap:10}}>
          <span style={{color:"#aaaa00",fontSize:10}}>🖱️ Campo selecionado:</span>
          <span style={{color:"#dddd44",fontSize:11,fontWeight:"bold"}}>{selectedField.label}</span>
          <span style={{color:"#999",fontSize:10}}>"{selectedField.value}"</span>
          <span style={{color:"#777",fontSize:10,marginLeft:"auto"}}>Clique no mesmo campo do outro lado para comparar</span>
          <button onClick={()=>setSelectedField(null)} style={{background:"transparent",border:"1px solid #444",color:"#777",padding:"2px 8px",borderRadius:3,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:10}}>✕</button>
        </div>
      )}

      {/* Scrollable documents area */}
      <div style={{flex:1,overflow:"auto",padding:"10px 14px",display:"flex",flexDirection:"column",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8,opacity:0.7}}>
          <div style={{flex:1,height:"1px",background:"#1a1a2e"}}/>
          <span style={{color:"#666",fontSize:9,letterSpacing:1,whiteSpace:"nowrap"}}>← CLIQUE NOS CAMPOS PARA COMPARAR →</span>
          <div style={{flex:1,height:"1px",background:"#1a1a2e"}}/>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>
            <div style={{color:"#777",fontSize:9,marginBottom:5,letterSpacing:1}}>{hasMulti?`DOCUMENTO — PÁG. ${activePage}`:"DOCUMENTO ORIGINAL"}</div>
            <DocumentVisual doc={doc} page={activePage} selectedField={selectedField} onFieldClick={handleFieldClick} suspectedFields={suspectedFields}/>
          </div>
          <div>
            <div style={{color:"#777",fontSize:9,marginBottom:5,letterSpacing:1}}>FICHA CADASTRAL</div>
            <FichaCadastral doc={doc} selectedField={selectedField} onFieldClick={handleFieldClick} suspectedFields={suspectedFields}/>
          </div>
        </div>

        {/* Notepad */}
        <div style={{background:"#0c0c1a",border:"1px solid #252535",borderRadius:4,padding:"6px 10px",display:"flex",gap:5,flexWrap:"wrap",alignItems:"center",minHeight:34}}>
          <span style={{color:"#777",fontSize:10}}>📝</span>
          {notes.map((n,i)=>(
            <span key={i} style={{background:"#2a1010",border:"1px solid #553333",color:"#cc7070",fontSize:10,padding:"0 6px",borderRadius:3}}>
              {n} <span style={{cursor:"pointer",opacity:0.6}} onClick={()=>setNotes(u=>u.filter((_,j)=>j!==i))}>×</span>
            </span>
          ))}
          {["CPF suspeito","Cidade diverge","Nome diferente","Vencido","Pág. faltando","Rasura","Carimbo ausente","CPF duplicado","Assinatura ausente","Foto suspeita"]
            .filter(n=>!notes.includes(n))
            .map(n=>(
              <span key={n} onClick={()=>setNotes(u=>[...u,n])} style={{color:"#666",fontSize:10,cursor:"pointer",padding:"0 5px",borderRadius:3,border:"1px solid #252535"}}>+{n}</span>
            ))}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{flexShrink:0,padding:"10px 14px",borderTop:"1px solid #0f0f1a",display:"flex",gap:10,background:"#030307"}}>
        <button
          onClick={() => { playSound("approve"); onApprove(doc); }}
          disabled={!canApprove}
          style={{flex:1,padding:"12px 0",background:canApprove?"#0a200a":"#080810",border:`1px solid ${canApprove?"#337733":"#1a1a1a"}`,color:canApprove?"#55bb55":"#333",borderRadius:5,cursor:canApprove?"pointer":"default",fontFamily:"'Courier New',monospace",fontSize:13,fontWeight:"bold",transition:"all 0.2s"}}
        >✓ APROVADO — DIGITALIZAR</button>
        <button
          onClick={() => { playSound("reject"); onReject(doc); }}
          disabled={!canAct}
          style={{flex:1,padding:"12px 0",background:canAct?"#200a0a":"#080810",border:`1px solid ${canAct?"#773333":"#1a1a1a"}`,color:canAct?"#bb5555":"#333",borderRadius:5,cursor:canAct?"pointer":"default",fontFamily:"'Courier New',monospace",fontSize:13,fontWeight:"bold",transition:"all 0.2s"}}
        >✗ REJEITAR</button>
      </div>

      {/* Compare result popup */}
      {compareResult && (
        <FieldCompareResult
          first={compareResult.first}
          second={compareResult.second}
          onDismiss={() => setCompareResult(null)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHYSICAL PREP
// ═══════════════════════════════════════════════════════════════════════════════
function PhysicalPrepPanel({ doc, onPrepared }) {
  const [grampoOk,  setGrampoOk]  = useState(!doc.hasGrampo);
  const [alignOk,   setAlignOk]   = useState(doc.aligned);
  useEffect(() => {
    if (grampoOk && alignOk) { const t = setTimeout(() => onPrepared(doc.id), 200); return () => clearTimeout(t); }
  }, [grampoOk, alignOk, doc.id, onPrepared]);
  return (
    <div style={{flexShrink:0,background:"#0e0e1c",border:"1px solid #cc880033",borderRadius:7,padding:11,fontFamily:"'Courier New',monospace",margin:"0 0 8px"}}>
      <div style={{color:"#cc8800",fontSize:10,marginBottom:9,letterSpacing:1}}>⚙ PREPARAÇÃO FÍSICA</div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {doc.hasGrampo && (
          <div style={{display:"flex",alignItems:"center",gap:10,background:grampoOk?"#0a180a":"#1a1000",border:`1px solid ${grampoOk?"#336633":"#664400"}`,borderRadius:5,padding:"7px 11px"}}>
            <span style={{fontSize:16}}>{grampoOk?"✅":"📎"}</span>
            <div style={{flex:1,color:grampoOk?"#55aa55":"#cc8800",fontSize:11}}>{grampoOk?"Grampo removido":"Documento grampeado — o scanner não aceita"}</div>
            {!grampoOk && <button onClick={()=>{playSound("staple_remove");setGrampoOk(true);}} style={{background:"#332200",border:"1px solid #cc8800",color:"#cc8800",padding:"3px 10px",borderRadius:3,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:11}}>Remover</button>}
          </div>
        )}
        {doc.misaligned && (
          <div style={{display:"flex",alignItems:"center",gap:10,background:alignOk?"#0a180a":"#181200",border:`1px solid ${alignOk?"#336633":"#887700"}`,borderRadius:5,padding:"7px 11px"}}>
            <span style={{fontSize:16}}>{alignOk?"✅":"📄"}</span>
            <div style={{flex:1,color:alignOk?"#55aa55":"#aaaa00",fontSize:11}}>{alignOk?"Folhas alinhadas":"Folhas desalinhadas — vai digitalizar torto"}</div>
            {!alignOk && <button onClick={()=>{playSound("align");setAlignOk(true);}} style={{background:"#221a00",border:"1px solid #aaaa00",color:"#aaaa00",padding:"3px 10px",borderRadius:3,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:11}}>Alinhar</button>}
          </div>
        )}
      </div>
      {grampoOk && alignOk && <div style={{color:"#55aa55",fontSize:10,marginTop:7,textAlign:"center"}}>✓ Pronto para digitalizar</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRINTER PANEL
// ═══════════════════════════════════════════════════════════════════════════════
function PrinterPanel({ printer, onAction, onAddWeight, onRemoveWeight }) {
  const [lcdMsg] = useState(() => rf(PRINTER_LCD_MSGS));
  const issue = printer.currentIssue;
  const dead  = printer.health <= 0;
  const hc    = printer.health > 60 ? "#448844" : printer.health > 30 ? "#aa8800" : "#aa3333";
  const moodFace = printer.mood>70?"( ◕‿◕)":printer.mood>40?"(-_-;)":printer.mood>15?"(╯°□°)╯":"(ﾉ◕ヮ◕)ﾉ✧";
  const tw    = printer.weightItems.reduce((a,w)=>a+w.weight,0);
  const optimal = tw >= 2 && tw <= 5;

  return (
    <div style={{background:"#111122",border:`2px solid ${dead?"#660000":printer.onStrike?"#aa3300":printer.wifiMode?"#004488":issue?issue.color+"88":"#1e1e2e"}`,borderRadius:8,padding:13,fontFamily:"'Courier New',monospace",boxShadow:dead?"0 0 20px #66000044":"none",transition:"all 0.3s"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:9}}>
        <div style={{fontSize:28,position:"relative",filter:dead?"grayscale(1)":"none"}}>
          🖨️
          {printer.weightItems.length>0&&<span style={{position:"absolute",top:-6,right:-8,fontSize:11}}>{printer.weightItems[printer.weightItems.length-1].emoji}</span>}
          {printer.wifiMode&&<span style={{position:"absolute",top:-6,left:-8,fontSize:11,animation:"blink 0.5s infinite"}}>📶</span>}
        </div>
        <div style={{flex:1}}>
          <div style={{color:"#999",fontSize:9}}>{PRINTER_NAME.toUpperCase()} — SCANJET PRO X-2000</div>
          {dead ? <div style={{color:"#aa3333",fontSize:11,animation:"blink 1s infinite"}}>💀 FORA DE SERVIÇO</div>
           : printer.onStrike ? <div style={{color:"#cc6600",fontSize:11,animation:"blink 0.8s infinite"}}>✊ EM GREVE — {printer.strikeCountdown}s</div>
           : <div style={{color:"#336633",fontSize:11}}>{moodFace}</div>}
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{color:"#999",fontSize:9}}>SAÚDE</div>
          <div style={{color:hc,fontSize:15,fontWeight:"bold"}}>{printer.health}%</div>
        </div>
      </div>

      <div style={{height:4,background:"#0a0a14",borderRadius:2,marginBottom:9,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${printer.health}%`,background:hc,transition:"width 0.5s,background 0.5s",borderRadius:2}}/>
      </div>

      {!dead&&!printer.onStrike&&(
        <div style={{background:"#0a1a0a",border:"1px solid #1a2a1a",borderRadius:3,padding:"3px 8px",marginBottom:8,fontSize:9,color:"#336633"}}>📟 {lcdMsg}</div>
      )}

      {dead&&<div style={{background:"#1a0000",border:"1px solid #660000",borderRadius:5,padding:9,marginBottom:9}}><div style={{color:"#cc3333",fontWeight:"bold",fontSize:12}}>💀 IMPRESSORA MORTA</div><div style={{color:"#884444",fontSize:10,marginTop:3}}>Aguardando técnico... (-5 pts/s)</div></div>}
      {printer.onStrike&&!dead&&<div style={{background:"#1a0800",border:"1px solid #cc6600",borderRadius:5,padding:9,marginBottom:9}}><div style={{color:"#cc6600",fontWeight:"bold",fontSize:12}}>✊ EM GREVE — {printer.strikeCountdown}s</div><div style={{color:"#886644",fontSize:10,marginTop:3}}>Aguarde. Ela está negociando com o sindicato.</div></div>}
      {printer.wifiMode&&!dead&&!printer.onStrike&&<div style={{background:"#000a1a",border:"1px solid #0066aa",borderRadius:5,padding:9,marginBottom:9,animation:"blink 1s infinite"}}><div style={{color:"#0099ff",fontWeight:"bold",fontSize:12}}>📶 WI-FI ATIVADO</div><div style={{color:"#336688",fontSize:10,marginTop:3}}>Imprimindo receitas... Clique REINICIAR para parar.</div></div>}

      {issue&&!dead&&!printer.wifiMode&&(
        <div style={{background:`${issue.color}11`,border:`1px solid ${issue.color}66`,borderRadius:5,padding:9,marginBottom:9}}>
          <div style={{color:issue.color,fontWeight:"bold",fontSize:11}}>⚠ {issue.label}</div>
          <div style={{color:"#888",fontSize:10,marginTop:2}}>Use a ação correta abaixo para consertar</div>
        </div>
      )}

      {!dead&&(
        <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
          {[{label:"🤜 Tapinha",action:"tap",color:"#cc5500"},{label:"📄 Puxar",action:"pull",color:"#aa9900"},{label:"🔄 Reiniciar",action:"restart",color:"#3366aa"},{label:"🖊️ Toner",action:"replace",color:"#888"},{label:"❄️ Resfriar",action:"wait",color:"#006688"}].map(b=>(
            <button key={b.action} onClick={()=>onAction(b.action)}
              style={{background:`${b.color}18`,border:`1px solid ${b.color}55`,color:b.color,padding:"3px 7px",borderRadius:3,cursor:"pointer",fontSize:10,fontFamily:"'Courier New',monospace"}}
              onMouseEnter={e=>e.target.style.background=`${b.color}30`}
              onMouseLeave={e=>e.target.style.background=`${b.color}18`}
            >{b.label}</button>
          ))}
        </div>
      )}

      <div style={{borderTop:"1px solid #1a1a2e",paddingTop:9}}>
        <div style={{color:"#aaa",fontSize:9,marginBottom:5}}>⚖ PESO IMPROVISADO (ideal: 2–5 kg)</div>
        <div style={{color:optimal?"#55cc55":tw>5?"#ff5555":"#aaa",fontSize:9,marginBottom:5}}>{tw}kg {optimal?"✓ ideal":tw>5?"⚠ pesado demais":tw>0?"⚠ muito leve":"— sem peso"}</div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {WEIGHT_ITEMS.map(item=>{
            const on=printer.weightItems.some(w=>w.id===item.id);
            return(
              <button key={item.id} onClick={()=>on?onRemoveWeight(item.id):onAddWeight(item)}
                style={{background:on?"#0a1a0a":"#0a0a14",border:`1px solid ${on?"#336633":"#1a1a2e"}`,color:on?"#449944":"#666",padding:"3px 7px",borderRadius:3,cursor:"pointer",fontSize:11,fontFamily:"'Courier New',monospace",transition:"all 0.2s"}}
                title={`${item.label} (${item.weight}kg)`}
              >{item.emoji}{on?" ✓":" +"}</button>
            );
          })}
        </div>
        {printer.jammed&&!dead&&<div style={{color:"#aa3333",fontSize:10,marginTop:6,animation:"blink 0.5s infinite"}}>⛔ Bloqueada — conserte primeiro</div>}
      </div>

      <div style={{marginTop:9,borderTop:"1px solid #1a1a2e",paddingTop:8}}>
        <div style={{color:"#aaa",fontSize:9,marginBottom:4}}>REPUTAÇÃO COM {PRINTER_NAME.toUpperCase()}</div>
        <div style={{height:3,background:"#0a0a14",borderRadius:2,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${printer.reputation}%`,background:printer.reputation>60?"#336633":printer.reputation>30?"#886600":"#660000",transition:"width 0.5s",borderRadius:2}}/>
        </div>
        <div style={{color:printer.reputation>60?"#55cc55":printer.reputation>30?"#ddaa00":"#ff5555",fontSize:9,marginTop:3}}>
          {printer.reputation>70?"Ela gosta de você (avisa antes de travar)":printer.reputation>40?"Relação neutra":"Ela te odeia (falha sem aviso)"}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SMALL COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════
function DocumentCard({ doc, selected, onClick, onMouseEnter, onMouseLeave, now }) {
  const urgent = doc.urgentDeadline && now < doc.urgentDeadline;
  return (
    <div onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
      style={{background:selected?"#0e1622":"#080810",border:`2px solid ${selected?"#3a6aaa":urgent?"#cc222288":"#111"}`,borderRadius:5,padding:"9px 11px",cursor:"pointer",transition:"all 0.15s",position:"relative"}}>
      {urgent&&<div style={{position:"absolute",top:4,right:6,color:"#cc2222",fontSize:9,animation:"blink 0.6s infinite"}}>⏰</div>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <span style={{background:"#111122",border:"1px solid #2a2a44",color:"#6688bb",padding:"1px 5px",borderRadius:2,fontSize:9}}>{doc.type}</span>
          <div style={{color:"#ccc",fontSize:11,marginTop:4,fontWeight:"bold"}}>{doc.data.name}</div>
          <div style={{color:"#666",fontSize:10}}>{doc.data.cpf}</div>
        </div>
        <div style={{textAlign:"right",fontSize:10}}>
          {!doc.physicalReady&&<div style={{color:"#886600"}}>⚙</div>}
          {doc.scanned&&<div style={{color:"#336633"}}>✓</div>}
          {doc.savedPath&&<div style={{color:"#3355aa"}}>💾</div>}
          <div style={{color:"#555",marginTop:2}}>{doc.pages}/{doc.expectedPages}p</div>
        </div>
      </div>
    </div>
  );
}

function FileSaveModal({ doc, onSave, onClose }) {
  const [path, setPath] = useState("");
  const folders = Object.values(CORRECT_FOLDER);
  const correct = CORRECT_FOLDER[doc.type];
  return (
    <div style={{position:"fixed",inset:0,background:"#000000cc",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100}}>
      <div style={{background:"#0a0a18",border:"1px solid #2a2a3e",borderRadius:9,padding:22,width:440,fontFamily:"'Courier New',monospace"}}>
        <div style={{color:"#ccc",fontSize:14,fontWeight:"bold",marginBottom:4}}>💾 SALVAR ARQUIVO</div>
        <div style={{color:"#777",fontSize:10,marginBottom:14}}>{doc.type}_{String(doc.id).padStart(4,"0")}_{doc.data.name.replace(/ /g,"_")}.pdf</div>
        <div style={{color:"#777",fontSize:10,marginBottom:8}}>Selecione o diretório:</div>
        <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:16,maxHeight:260,overflowY:"auto"}}>
          {folders.map(f=>(
            <div key={f} onClick={()=>setPath(f)} style={{padding:"7px 12px",background:path===f?"#0a1a2a":"#0f0f18",border:`1px solid ${path===f?"#3a6aaa":"#2a2a3e"}`,borderRadius:4,cursor:"pointer",fontSize:11,color:path===f?"#6a9eff":"#777",transition:"all 0.1s"}}>📁 {f}</div>
          ))}
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>path&&onSave(doc,path,path===correct)} disabled={!path} style={{flex:1,padding:"9px 0",background:path?"#0a1a2a":"#0a0a14",border:`1px solid ${path?"#3a6aaa":"#1a1a2e"}`,color:path?"#6a9eff":"#444",borderRadius:4,cursor:path?"pointer":"default",fontFamily:"'Courier New',monospace",fontSize:12,fontWeight:"bold"}}>SALVAR AQUI</button>
          <button onClick={onClose} style={{padding:"9px 14px",background:"transparent",border:"1px solid #2a2a3e",color:"#777",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:11}}>✕</button>
        </div>
      </div>
    </div>
  );
}

function EventBanner({ event, onColleagueAccept, onColleagueDecline }) {
  if (!event) return null;
  const isColleague = event.effect === "colleague";
  return (
    <div style={{position:"fixed",top:58,left:"50%",transform:"translateX(-50%)",background:"#130820",border:"1px solid #7744aa",borderRadius:8,padding:"11px 20px",zIndex:150,fontFamily:"'Courier New',monospace",maxWidth:420,textAlign:"center",boxShadow:"0 0 20px #7744aa33",animation:"slideIn 0.3s ease"}}>
      <div style={{fontSize:26,marginBottom:3}}>{event.emoji}</div>
      <div style={{color:"#cc99ff",fontWeight:"bold",fontSize:12,marginBottom:3}}>{event.title}</div>
      <div style={{color:"#999",fontSize:10,marginBottom:isColleague?10:0}}>{event.desc}</div>
      {isColleague && (
        <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:8}}>
          <button onClick={onColleagueAccept} style={{background:"#0a2a0a",border:"1px solid #336633",color:"#55aa55",padding:"5px 14px",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:11}}>Aceitar (+15s)</button>
          <button onClick={onColleagueDecline} style={{background:"#1a0a0a",border:"1px solid #554444",color:"#776666",padding:"5px 14px",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:11}}>Recusar</button>
        </div>
      )}
    </div>
  );
}

function MemorandoModal({ memo, onClose }) {
  if (!memo) return null;
  return (
    <div style={{position:"fixed",inset:0,background:"#000000cc",display:"flex",alignItems:"center",justifyContent:"center",zIndex:180}}>
      <div style={{background:"#f5f0e0",border:"1px solid #c0a060",borderRadius:6,padding:24,maxWidth:420,width:"90%",fontFamily:"Georgia,serif",boxShadow:"0 8px 30px #00000066"}}>
        <div style={{borderBottom:"2px solid #8b4513",paddingBottom:8,marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:"bold",color:"#8b4513",letterSpacing:1}}>📋 MEMORANDO INTERNO</div>
          <div style={{fontSize:9,color:"#888",marginTop:2}}>Digitalizações Infernais Ltda. — Circulação Obrigatória</div>
        </div>
        <div style={{color:"#222",fontSize:12,lineHeight:1.8,marginBottom:16}}>{memo.text}</div>
        <div style={{display:"flex",justifyContent:"flex-end"}}>
          <button onClick={onClose} style={{background:"#8b4513",border:"none",color:"#fff",padding:"7px 20px",borderRadius:4,cursor:"pointer",fontFamily:"Georgia,serif",fontSize:11,fontWeight:"bold"}}>Ciente. Assinar e arquivar.</button>
        </div>
      </div>
    </div>
  );
}

function AchievementPopup({ achievement }) {
  if (!achievement) return null;
  return (
    <div style={{position:"fixed",top:18,right:18,background:"#1a1200",border:"1px solid #aa8800",borderRadius:8,padding:"12px 16px",zIndex:250,fontFamily:"'Courier New',monospace",animation:"slideIn 0.3s ease",boxShadow:"0 0 20px #aa880044"}}>
      <div style={{color:"#aa8800",fontSize:9,letterSpacing:1,marginBottom:3}}>🏆 CONQUISTA DESBLOQUEADA</div>
      <div style={{color:"#ffcc00",fontSize:13,fontWeight:"bold"}}>{achievement.emoji} {achievement.label}</div>
      <div style={{color:"#886600",fontSize:10,marginTop:2}}>{achievement.desc}</div>
    </div>
  );
}

function DailyLogModal({ stats, level, score, timeLeft, onClose }) {
  const grade = score>800?"S":score>500?"A":score>300?"B":score>150?"C":"D";
  const gc = {S:"#ffcc00",A:"#44bb44",B:"#4488ff",C:"#dd8800",D:"#dd4444"}[grade];
  const lines = [
    `> RELATÓRIO DIÁRIO — DIA ${level}`,`> =============================`,
    `> Aprovados corretamente:  ${stats.approved}`,
    `> Rejeitados corretamente: ${stats.correctRejections||0}`,
    `> Erros cometidos:         ${stats.errors}`,
    `> Pastas erradas:          ${stats.wrongFolders||0}`,
    `> Tapinhas na impressora:  ${stats.taps||0}`,
    `> Campos comparados:       ${stats.fieldsCompared||0}`,
    `> =============================`,
    `> Pontuação do dia: ${score} pts`,
    `> Nota: ${grade}`,`> Tempo restante: ${p2(Math.floor(timeLeft/60))}:${p2(timeLeft%60)}`,
    `> =============================`,
    grade==="D"?"> STATUS: AVISO FORMAL EMITIDO":grade==="C"?"> STATUS: DESEMPENHO INSUFICIENTE":grade==="B"?"> STATUS: DENTRO DO ESPERADO":grade==="A"?"> STATUS: PARABÉNS (quase)":"> STATUS: EXCEPCIONAL. Suspeito.",
  ];
  return (
    <div style={{position:"fixed",inset:0,background:"#000000ee",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>
      <div style={{background:"#050510",border:"1px solid #1a2a1a",borderRadius:8,padding:24,maxWidth:440,width:"90%",fontFamily:"'Courier New',monospace"}}>
        <div style={{color:"#336633",fontSize:10,marginBottom:12,letterSpacing:1}}>📊 FIM DO DIA — RELATÓRIO GERADO</div>
        <div style={{background:"#020a02",border:"1px solid #0a1a0a",borderRadius:4,padding:14,marginBottom:16,fontSize:11,lineHeight:1.9}}>
          {lines.map((l,i)=><div key={i} style={{color:l.includes("Nota")||l.includes("Pontuação")||l.includes("STATUS")?gc:"#336633"}}>{l}</div>)}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{color:gc,fontSize:22,fontWeight:"bold"}}>{grade}</div>
          <button onClick={onClose} style={{background:"#0a1a0a",border:"1px solid #336633",color:"#55aa55",padding:"8px 22px",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:12,fontWeight:"bold"}}>Próximo dia ▶</button>
        </div>
      </div>
    </div>
  );
}

function StoryDialog({ day, onClose }) {
  const d = STORY_DAYS[Math.min(day-1, STORY_DAYS.length-1)];
  const memo = MEMORANDOS.find(m => m.day === day);
  const [showMemo, setShowMemo] = useState(false);
  return (
    <>
      <div style={{position:"fixed",inset:0,background:"#000000ee",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:200,paddingBottom:36}}>
        <div style={{background:"#0a0a18",border:"1px solid #1a1a2e",borderRadius:9,padding:22,maxWidth:480,width:"90%",fontFamily:"'Courier New',monospace",animation:"slideIn 0.4s ease"}}>
          <div style={{display:"flex",gap:14,alignItems:"flex-start",marginBottom:14}}>
            <div style={{fontSize:38}}>{d.bossEmoji}</div>
            <div>
              <div style={{color:"#4a9eff",fontSize:10,marginBottom:5,letterSpacing:1}}>{d.bossName.toUpperCase()} — DIA {day}</div>
              <div style={{color:"#bbb",fontSize:13,lineHeight:1.8}}>"{d.boss}"</div>
            </div>
          </div>
          {memo && (
            <div onClick={()=>setShowMemo(true)} style={{background:"#1a1400",border:"1px solid #664400",borderRadius:4,padding:"7px 12px",marginBottom:14,cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:16}}>📋</span>
              <div>
                <div style={{color:"#aa8800",fontSize:10,fontWeight:"bold"}}>Memorando novo na sua mesa</div>
                <div style={{color:"#886622",fontSize:9}}>Clique para ler — leitura obrigatória</div>
              </div>
            </div>
          )}
          <div style={{display:"flex",justifyContent:"flex-end"}}>
            <button onClick={onClose} style={{background:"#4a9eff",border:"none",color:"#000",padding:"8px 22px",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:12,fontWeight:"bold"}}>Ao trabalho. ▶</button>
          </div>
        </div>
      </div>
      {showMemo && memo && <MemorandoModal memo={memo} onClose={()=>setShowMemo(false)}/>}
    </>
  );
}

function TutorialOverlay({ step, onNext, onSkip }) {
  const s = TUTORIAL_STEPS[step];
  if (!s) return null;
  const isLast = step === TUTORIAL_STEPS.length - 1;
  return (
    <div style={{position:"fixed",inset:0,background:"#000000cc",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}}>
      <div style={{background:"#0c0c20",border:"2px solid #3355aa",borderRadius:10,padding:28,maxWidth:500,width:"90%",fontFamily:"'Courier New',monospace",animation:"slideIn 0.3s ease",boxShadow:"0 0 40px #3355aa33"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
          <div style={{fontSize:36}}>{s.emoji}</div>
          <div>
            <div style={{color:"#6a9eff",fontSize:10,letterSpacing:2,marginBottom:4}}>TUTORIAL — {step+1}/{TUTORIAL_STEPS.length}</div>
            <div style={{color:"#fff",fontSize:16,fontWeight:"bold"}}>{s.title}</div>
          </div>
        </div>
        <div style={{height:3,background:"#1a1a2e",borderRadius:2,marginBottom:16,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${((step+1)/TUTORIAL_STEPS.length)*100}%`,background:"#3355aa",borderRadius:2,transition:"width 0.3s"}}/>
        </div>
        <div style={{color:"#bbb",fontSize:13,lineHeight:1.9,marginBottom:20,background:"#080818",border:"1px solid #1a1a2e",borderRadius:6,padding:"12px 16px"}}>{s.content}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <button onClick={onSkip} style={{background:"transparent",border:"1px solid #333",color:"#666",padding:"7px 14px",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:11}}>Pular tutorial</button>
          <button onClick={onNext} style={{background:"#3355aa",border:"none",color:"#fff",padding:"9px 24px",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:13,fontWeight:"bold"}}>
            {isLast ? "Começar! 🚀" : "Próximo →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ScanningOverlay({ scanning }) {
  if (!scanning) return null;
  return (
    <div style={{position:"fixed",inset:0,background:"#000000bb",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
      <div style={{background:"#0a0a18",border:"1px solid #3366aa",borderRadius:10,padding:"24px 32px",fontFamily:"'Courier New',monospace",textAlign:"center",minWidth:280}}>
        <div style={{fontSize:36,marginBottom:10,animation:"blink 0.4s infinite"}}>🖨️</div>
        <div style={{color:"#6a9eff",fontSize:12,marginBottom:14,letterSpacing:1}}>DIGITALIZANDO...</div>
        <div style={{height:8,background:"#111",borderRadius:4,overflow:"hidden",marginBottom:10}}>
          <div style={{height:"100%",width:`${scanning.progress}%`,background:"linear-gradient(90deg,#2244aa,#4488ff)",borderRadius:4,transition:"width 0.08s linear",boxShadow:"0 0 8px #4488ff66"}}/>
        </div>
        <div style={{color:"#5577aa",fontSize:10}}>{scanning.doc.type} — {scanning.doc.data.name}</div>
        <div style={{color:"#444",fontSize:9,marginTop:4}}>{Math.round(scanning.progress)}%</div>
      </div>
    </div>
  );
}

function ScreenFlash({ color }) {
  if (!color) return null;
  return (
    <div style={{position:"fixed",inset:0,background:color,zIndex:600,pointerEvents:"none",animation:"flashFade 0.35s ease forwards"}}/>
  );
}

function DecisionLog({ decisions }) {
  if (decisions.length === 0) return null;
  return (
    <div style={{position:"fixed",bottom:18,left:18,display:"flex",flexDirection:"column",gap:4,zIndex:200,pointerEvents:"none"}}>
      <div style={{color:"#778",fontSize:9,letterSpacing:1,marginBottom:2}}>ÚLTIMAS AÇÕES</div>
      {decisions.map((d,i) => (
        <div key={d.id} style={{background:"#08080f",border:`1px solid ${d.color}44`,borderRadius:4,padding:"4px 10px",fontFamily:"'Courier New',monospace",fontSize:10,color:d.color,opacity:0.4+(i*0.3),animation:"slideIn 0.2s ease"}}>
          {d.icon} {d.text}
        </div>
      ))}
    </div>
  );
}

function DocTooltip({ doc, visible }) {
  if (!visible || !doc) return null;
  return (
    <div style={{position:"fixed",left:228,top:120,background:"#0c0c1e",border:"1px solid #2a2a3e",borderRadius:6,padding:"10px 14px",zIndex:400,fontFamily:"'Courier New',monospace",pointerEvents:"none",minWidth:200,boxShadow:"0 4px 16px #00000066",animation:"slideIn 0.15s ease"}}>
      <div style={{color:"#6688bb",fontSize:10,fontWeight:"bold",marginBottom:6}}>{doc.type} — prévia</div>
      {[["Nome",doc.data.name],["CPF",doc.data.cpf],["Cidade",doc.data.city],["Validade",doc.data.expiryDate]].map(([l,v])=>(
        <div key={l} style={{display:"flex",gap:8,marginBottom:3}}>
          <span style={{color:"#666",fontSize:9,minWidth:50}}>{l}</span>
          <span style={{color:"#999",fontSize:10}}>{v}</span>
        </div>
      ))}
      {!doc.physicalReady && <div style={{color:"#886600",fontSize:9,marginTop:5,borderTop:"1px solid #1a1a2e",paddingTop:4}}>⚙ Precisa de preparação</div>}
      {doc.urgentDeadline && <div style={{color:"#cc3333",fontSize:9,marginTop:3,animation:"blink 0.8s infinite"}}>⏰ URGENTE</div>}
    </div>
  );
}

const DAY_RULES = {
  1: ["Valide: Nome, CPF, Cidade, Validade, Assinatura","Remova grampos antes de digitalizar","Coloque 2–5kg na impressora"],
  2: ["⚠ Atenção redobrada à Validade em docs de Curitiba","Documentos desalinhados precisam ser ajustados","A impressora está de mau humor hoje"],
  3: ["⚠ CPF com rasura = inválido automaticamente","Documentos podem ter CPF duplicado (verifique)","Atualizações do sistema podem travar o PC"],
  4: ["⚠ Páginas faltando em CONTRATOS = penalidade dobrada","Mais eventos aleatórios hoje","Carimbo ausente em contratos é motivo de rejeição"],
  5: ["⚠ Pasta errada = débito em salário","Volume máximo de documentos","A impressora começa com saúde reduzida"],
};

function DailyRulesBriefing({ day, onClose }) {
  const rules = DAY_RULES[Math.min(day, 5)] || DAY_RULES[5];
  return (
    <div style={{position:"fixed",inset:0,background:"#000000cc",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>
      <div style={{background:"#0a0a18",border:"1px solid #2a3a1a",borderRadius:9,padding:24,maxWidth:400,width:"90%",fontFamily:"'Courier New',monospace",animation:"slideIn 0.3s ease"}}>
        <div style={{color:"#558855",fontSize:10,letterSpacing:2,marginBottom:12}}>📋 REGRAS ATIVAS — DIA {day}</div>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:18}}>
          {rules.map((r,i)=>(
            <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",background:r.startsWith("⚠")?"#1a1200":"#0a0a12",border:`1px solid ${r.startsWith("⚠")?"#554400":"#1a1a2e"}`,borderRadius:5,padding:"8px 12px"}}>
              <span style={{fontSize:14,flexShrink:0}}>{r.startsWith("⚠")?"⚠":"✓"}</span>
              <span style={{color:r.startsWith("⚠")?"#aa8800":"#558855",fontSize:11,lineHeight:1.5}}>{r.replace("⚠ ","")}</span>
            </div>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"flex-end"}}>
          <button onClick={onClose} style={{background:"#224422",border:"1px solid #336633",color:"#55aa55",padding:"8px 22px",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:12,fontWeight:"bold"}}>Entendido ▶</button>
        </div>
      </div>
    </div>
  );
}

function GameOverReview({ wrongDocs, onClose }) {
  if (wrongDocs.length === 0) return null;
  return (
    <div style={{position:"fixed",inset:0,background:"#000000dd",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>
      <div style={{background:"#0a0a18",border:"1px solid #2a1a1a",borderRadius:9,padding:24,maxWidth:480,width:"90%",maxHeight:"80vh",overflow:"auto",fontFamily:"'Courier New',monospace",animation:"slideIn 0.3s ease"}}>
        <div style={{color:"#aa4444",fontSize:10,letterSpacing:2,marginBottom:14}}>🔍 REVISÃO DE ERROS</div>
        {wrongDocs.map((doc, i) => (
          <div key={i} style={{background:"#0f0a0a",border:"1px solid #2a1a1a",borderRadius:6,padding:"10px 14px",marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <span style={{color:"#7799bb",fontSize:11,fontWeight:"bold"}}>{doc.type} — {doc.data.name}</span>
              <span style={{fontSize:10,background:doc.decision==="approved_wrong"?"#2a0a0a":"#1a0000",border:`1px solid ${doc.decision==="approved_wrong"?"#663333":"#441111"}`,color:doc.decision==="approved_wrong"?"#cc5555":"#aa3333",padding:"2px 8px",borderRadius:3}}>
                {doc.decision==="approved_wrong"?"Aprovado com erro":"Rejeitado indevidamente"}
              </span>
            </div>
            {doc.issues.length > 0 ? (
              <div>
                <div style={{color:"#666",fontSize:9,marginBottom:4}}>Problemas que o doc tinha:</div>
                {doc.issues.map(iss=>(
                  <div key={iss} style={{color:"#cc7744",fontSize:10,marginLeft:8}}>• {iss}</div>
                ))}
              </div>
            ) : (
              <div style={{color:"#336633",fontSize:10}}>• Documento era válido — não devia ser rejeitado</div>
            )}
          </div>
        ))}
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}>
          <button onClick={onClose} style={{background:"#1a0a0a",border:"1px solid #663333",color:"#cc5555",padding:"8px 22px",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:12,fontWeight:"bold"}}>Fechar</button>
        </div>
      </div>
    </div>
  );
}

function GameOverReviewWrapper({ wrongDocs, grade, gc, score, stats, unlocked, onStartGame, onMenu }) {
  const [showReview, setShowReview] = useState(false);
  const quoteMap = {D:'"Você está despedido." — Sr. Figueiredo',C:'"Precisa melhorar muito." — Sr. Figueiredo',B:'"Aceitável. Por hoje." — Sr. Figueiredo',A:'"Bom trabalho. Sem aumento." — Sr. Figueiredo',S:'"...Quem é você?" — Sr. Figueiredo'};
  return (
    <div style={{textAlign:"center",maxWidth:440,padding:40}}>
      {showReview && <GameOverReview wrongDocs={wrongDocs} onClose={()=>setShowReview(false)}/>}
      <div style={{fontSize:48,marginBottom:10}}>⏰</div>
      <div style={{fontSize:20,color:"#aa3333",fontWeight:"bold",letterSpacing:3,marginBottom:6}}>FIM DO EXPEDIENTE</div>
      <div style={{color:"#777",fontSize:11,marginBottom:22}}>{quoteMap[grade]}</div>
      <div style={{background:"#080812",border:"1px solid #1a1a2e",borderRadius:8,padding:20,marginBottom:18}}>
        <div style={{color:gc,fontSize:44,fontWeight:"bold",marginBottom:4}}>{grade}</div>
        <div style={{color:"#aa8800",fontSize:24,fontWeight:"bold",marginBottom:14}}>{score} pts</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          {[{label:"Aprovados",val:stats.approved,color:"#448844"},{label:"Rejeitados",val:stats.rejected,color:"#aa6600"},{label:"Salvos",val:stats.saved,color:"#334488"},{label:"Erros",val:stats.errors,color:"#aa3333"},{label:"Campos comparados",val:stats.fieldsCompared||0,color:"#446688"},{label:"Tapinhas",val:stats.taps||0,color:"#553333"}].map(s=>(
            <div key={s.label} style={{textAlign:"center"}}>
              <div style={{color:s.color,fontSize:18,fontWeight:"bold"}}>{s.val}</div>
              <div style={{color:"#666",fontSize:10}}>{s.label}</div>
            </div>
          ))}
        </div>
        {unlocked.length>0&&(
          <div style={{borderTop:"1px solid #111",paddingTop:10,marginBottom:10}}>
            <div style={{color:"#554400",fontSize:9,marginBottom:6,letterSpacing:1}}>CONQUISTAS</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center"}}>
              {ACHIEVEMENTS.filter(a=>unlocked.includes(a.id)).map(a=>(
                <span key={a.id} title={a.desc} style={{fontSize:18}}>{a.emoji}</span>
              ))}
            </div>
          </div>
        )}
        {wrongDocs.length>0&&(
          <button onClick={()=>setShowReview(true)} style={{background:"#1a0a0a",border:"1px solid #663333",color:"#cc6666",padding:"6px 16px",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:11,width:"100%"}}>
            🔍 Revisar {wrongDocs.length} erro(s) cometido(s)
          </button>
        )}
      </div>
      <div style={{display:"flex",gap:10,justifyContent:"center"}}>
        <button onClick={()=>onStartGame(false)} style={{background:"#aa3333",border:"none",color:"#fff",padding:"10px 22px",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:13,fontWeight:"bold",letterSpacing:1}}>↺ DE NOVO</button>
        <button onClick={onMenu} style={{background:"#1a1a2e",border:"1px solid #333",color:"#888",padding:"10px 22px",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:12}}>Menu</button>
      </div>
    </div>
  );
}

function Toast({ messages }) {
  return (
    <div style={{position:"fixed",bottom:18,right:18,display:"flex",flexDirection:"column-reverse",gap:5,zIndex:300,pointerEvents:"none"}}>
      {messages.map(m=>(
        <div key={m.id} style={{background:m.type==="error"?"#1c0808":m.type==="success"?"#081808":m.type==="achievement"?"#1a1200":"#080818",border:`1px solid ${m.type==="error"?"#883333":m.type==="success"?"#338833":m.type==="achievement"?"#aa8800":"#334488"}`,color:m.type==="error"?"#cc5555":m.type==="success"?"#55aa55":m.type==="achievement"?"#ffcc00":"#5577cc",padding:"6px 11px",borderRadius:5,fontFamily:"'Courier New',monospace",fontSize:11,animation:"slideIn 0.2s ease",maxWidth:300}}>{m.text}</div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN GAME
// ═══════════════════════════════════════════════════════════════════════════════
export default function BurocraciaSimulator() {
  const [phase,         setPhase]         = useState("intro");
  const [tutorialStep,  setTutorialStep]  = useState(0);
  const [level,         setLevel]         = useState(1);
  const [score,         setScore]         = useState(0);
  const [docs,          setDocs]          = useState([]);
  const [selectedDoc,   setSelectedDoc]   = useState(null);
  const [saveModal,     setSaveModal]     = useState(null);
  const [timeLeft,      setTimeLeft]      = useState(200);
  const [frozen,        setFrozen]        = useState(false);
  const [blackout,      setBlackout]      = useState(false);
  const [activeEvent,   setActiveEvent]   = useState(null);
  const [toasts,        setToasts]        = useState([]);
  const [showStory,     setShowStory]     = useState(false);
  const [showDailyLog,  setShowDailyLog]  = useState(false);
  const [pendingNext,   setPendingNext]   = useState(null);
  const [now,           setNow]           = useState(Date.now());
  const [achievement,   setAchievement]   = useState(null);
  const [unlocked,      setUnlocked]      = useState([]);
  const [suspectedMap,  setSuspectedMap]  = useState({});
  const [muted,         toggleMute]       = useSoundToggle();
  const [flashColor,    setFlashColor]    = useState(null);
  const [scanning,      setScanning]      = useState(null);
  const [decisionLog,   setDecisionLog]   = useState([]);
  const [hoveredDoc,    setHoveredDoc]    = useState(null);
  const [showRules,     setShowRules]     = useState(false);
  const [wrongDocs,     setWrongDocs]     = useState([]);
  const [docsPerMin,    setDocsPerMin]    = useState(0);
  const dpmRef          = useRef({count:0, since:Date.now()});
  const [stats, setStats] = useState({
    approved:0,rejected:0,saved:0,errors:0,taps:0,
    wrongFolders:0,correctRejections:0,dayErrors:0,
    timeBonus:0,internCorrect:0,printerStrikes:0,fieldsCompared:0,
  });
  const [printer, setPrinter] = useState({
    health:100,mood:80,jammed:false,currentIssue:null,
    tapCount:0,weightItems:[],reputation:60,
    onStrike:false,strikeCountdown:0,wifiMode:false,
  });

  const toastId      = useRef(0);
  const timerRef     = useRef(null);
  const eventRef     = useRef(null);
  const printerRef   = useRef(null);
  const deathRef     = useRef(null);
  const strikeRef    = useRef(null);
  const nowRef       = useRef(null);
  const docsRef      = useRef(docs);
  const statsRef     = useRef(stats);
  const printerSRef  = useRef(printer);
  const timeLeftRef  = useRef(timeLeft);
  useEffect(()=>{ docsRef.current   = docs;    },[docs]);
  useEffect(()=>{ statsRef.current  = stats;   },[stats]);
  useEffect(()=>{ printerSRef.current= printer;},[printer]);
  useEffect(()=>{ timeLeftRef.current= timeLeft;},[timeLeft]);

  const addToast = useCallback((text, type="info") => {
    const id = ++toastId.current;
    setToasts(t => [...t.slice(-5), {id,text,type}]);
    setTimeout(()=>setToasts(t=>t.filter(m=>m.id!==id)), 3500);
  }, []);

  const triggerAchievement = useCallback((ach) => {
    setUnlocked(u => {
      if (u.includes(ach.id)) return u;
      setAchievement(ach);
      setTimeout(()=>setAchievement(null), 4000);
      playSound("achievement", 0.8);
      addToast(`🏆 ${ach.emoji} ${ach.label}`, "achievement");
      return [...u, ach.id];
    });
  }, [addToast]);

  const checkAch = useCallback((s, p) => {
    ACHIEVEMENTS.forEach(a => {
      if (a.check(s || statsRef.current)) triggerAchievement(a);
    });
    if (p?.onStrike) { const a = ACHIEVEMENTS.find(x=>x.id==="greve"); if(a) triggerAchievement(a); }
  }, [triggerAchievement]);

  const flashScreen = useCallback((color) => {
    setFlashColor(color);
    setTimeout(() => setFlashColor(null), 350);
  }, []);

  const addDecision = useCallback((icon, text, color) => {
    setDecisionLog(l => [...l.slice(-2), {id: Date.now(), icon, text, color}]);
  }, []);

  const bumpDpm = useCallback(() => {
    dpmRef.current.count++;
    const elapsed = (Date.now() - dpmRef.current.since) / 60000;
    if (elapsed > 0) setDocsPerMin(Math.round(dpmRef.current.count / elapsed));
  }, []);

  // Now ticker + urgent expiry
  useEffect(()=>{ nowRef.current=setInterval(()=>{
    setNow(Date.now());
    setDocs(ds => ds.map(d => {
      if(d.urgentDeadline && Date.now() > d.urgentDeadline && !d.urgentExpired && !d.scanned && !d.savedPath){
        setScore(s => Math.max(0, s-25));
        addToast("⏰ Doc urgente expirou sem ser processado! -25 pts","error");
        setFlashColor("#ff220033");
        setTimeout(()=>setFlashColor(null),350);
        return {...d, urgentExpired:true, urgentDeadline:null};
      }
      return d;
    }));
  }, 1000); return()=>clearInterval(nowRef.current); },[addToast]);

  // Main timer
  useEffect(()=>{
    if(phase!=="playing") return;
    timerRef.current=setInterval(()=>{
      setTimeLeft(t=>{
        if(t<=1){
          clearInterval(timerRef.current);
          stopMusic();
          playSound("blackout", 0.9);
          setPhase("gameover");
          return 0;
        }
        return t-1;
      });
    },1000);
    return()=>clearInterval(timerRef.current);
  },[phase]);

  // Printer death drain
  useEffect(()=>{
    if(phase!=="playing") return;
    deathRef.current=setInterval(()=>{
      if(printerSRef.current.health<=0&&!printerSRef.current.onStrike){
        setScore(s=>Math.max(0,s-5));
        addToast("💀 Técnico ainda não chegou... -5 pts","error");
      }
    },2000);
    return()=>clearInterval(deathRef.current);
  },[phase,addToast]);

  // Strike countdown
  useEffect(()=>{
    if(phase!=="playing") return;
    strikeRef.current=setInterval(()=>{
      setPrinter(p=>{
        if(!p.onStrike) return p;
        const c=p.strikeCountdown-1;
        if(c<=0){ addToast(`✊ ${PRINTER_NAME} voltou da greve.`,"info"); return{...p,onStrike:false,strikeCountdown:0,health:Math.min(100,p.health+10),jammed:false,currentIssue:null}; }
        return{...p,strikeCountdown:c};
      });
    },1000);
    return()=>clearInterval(strikeRef.current);
  },[phase,addToast]);

  // ── DAY-END DETECTION ────────────────────────────────────────────────────────
  // Fires whenever docs changes. If ALL docs in the array have been saved (every
  // rejected doc was removed from array), the day is over.
  useEffect(() => {
    if (phase !== "playing") return;
    if (showDailyLog || pendingNext) return; // already triggered
    if (docs.length === 0) return;           // no docs loaded yet
    const allDone = docs.every(d => d.savedPath !== null);
    if (allDone) {
      setStats(s => ({ ...s, timeBonus: timeLeft, dayErrors: s.dayErrors }));
      setPendingNext(level + 1);
      setShowDailyLog(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docs, phase]);

  // Keyboard shortcuts
  useEffect(() => {
    if (phase !== "playing") return;
    function onKey(e) {
      if (saveModal || showStory || showDailyLog || frozen || blackout) return;
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "a" || e.key === "A") { if (selectedDoc) handleApprove(selectedDoc); }
      if (e.key === "r" || e.key === "R") { if (selectedDoc) handleReject(selectedDoc); }
      if (e.key === "Tab") {
        e.preventDefault();
        const p = docs.filter(d => !d.savedPath && !d.scanned);
        if (p.length === 0) return;
        const idx = selectedDoc ? p.findIndex(d => d.id === selectedDoc.id) : -1;
        const next = p[(idx + 1) % p.length];
        if (next) { playSound("paper_rustle", 0.3); setSelectedDoc(next); }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, selectedDoc, docs, saveModal, showStory, showDailyLog, frozen, blackout]);

  useEffect(() => {
    if(phase!=="playing") return;
    eventRef.current=setInterval(()=>{
      if(activeEvent||Math.random()>0.28) return;
      const ev=rf(RANDOM_EVENTS.filter(e=>e.id!=="wifi"||!printerSRef.current.wifiMode));
      setActiveEvent(ev);
      playSound("event_alert",0.6);
      if(ev.effect==="freeze"||ev.effect==="block"||ev.effect==="meeting") setFrozen(true);
      if(ev.effect==="blackout"){playSound("blackout",0.8);setBlackout(true);setTimeout(()=>setBlackout(false),ev.duration);}
      if(ev.effect==="printer_reset"){setPrinter(p=>({...p,jammed:false,currentIssue:null,mood:Math.max(0,p.mood-10),reputation:Math.max(0,p.reputation-5)}));addToast("⚡ Impressora reiniciada!","info");}
      if(ev.effect==="penalty"){setScore(s=>Math.max(0,s-15));addToast("📞 Cliente furioso! -15 pts","error");}
      if(ev.effect==="staple"){setDocs(ds=>ds.map(d=>!d.scanned&&!d.savedPath&&Math.random()>0.55?{...d,hasGrampo:true,physicalReady:false}:d));addToast("☕ Café molhou docs — re-prepare alguns!","error");}
      if(ev.effect==="wifi_print"){setPrinter(p=>({...p,wifiMode:true,jammed:true}));return;}
      if(ev.effect==="intern"){
        const pd=docsRef.current.filter(d=>!d.scanned&&!d.savedPath);
        if(pd.length>0){
          const target=rf(pd); const correct=Math.random()>0.5;
          if(correct){addToast(`🧑‍💼 Estagiário processou ${target.type} corretamente! +10`,"success");setScore(s=>s+10);setDocs(ds=>ds.map(d=>d.id===target.id?{...d,scanned:true}:d));setStats(s=>{const ns={...s,internCorrect:(s.internCorrect||0)+1};checkAch(ns,null);return ns;});}
          else{addToast("🧑‍💼 Estagiário errou... -20 pts","error");setScore(s=>Math.max(0,s-20));setDocs(ds=>ds.filter(d=>d.id!==target.id));}
        }
      }
      if(ev.id!=="colleague") setTimeout(()=>{setActiveEvent(null);setFrozen(false);},ev.duration);
    },14000);
    return()=>clearInterval(eventRef.current);
  },[phase,addToast,checkAch]);

  // Printer events
  useEffect(()=>{
    if(phase!=="playing") return;
    printerRef.current=setInterval(()=>{
      const p=printerSRef.current;
      if(p.health<=0||p.onStrike||p.wifiMode) return;
      if(Math.random()<0.18+level*0.04){
        const ev=rf(PRINTER_EVENTS);
        if(p.reputation>70) addToast(`⚠ ${PRINTER_NAME} avisa: ${ev.label} iminente!`,"info");
        else if(p.reputation<=40){/* silent fail */}
        else addToast(`🖨️ ${ev.label}`,"error");
        playSound("printer_jam",0.7);
        setPrinter(prev=>({...prev,currentIssue:ev,jammed:true,mood:Math.max(0,prev.mood-15),health:Math.max(0,prev.health-7)}));
      }
    },9000);
    return()=>clearInterval(printerRef.current);
  },[phase,level,addToast]);

  function handlePrinterAction(action) {
    setPrinter(p=>{
      if(p.health<=0) return p;
      if(p.wifiMode&&action==="restart"){
        playSound("printer_fix",0.7);
        addToast(`📶 ${PRINTER_NAME} parou de imprimir receitas.`,"success");
        return{...p,wifiMode:false,jammed:false,currentIssue:null};
      }
      const issue=p.currentIssue; const correct=issue&&issue.fix===action;
      if(action==="tap"){
        playSound("printer_tap",0.5);
        const newTaps=(p.tapCount||0)+1;
        setStats(s=>{const ns={...s,taps:(s.taps||0)+1};checkAch(ns,null);return ns;});
        if(newTaps%10===0){
          playSound("greve",0.9);
          addToast(`✊ ${PRINTER_NAME} entrou em GREVE após ${newTaps} tapinhas!`,"error");
          setStats(s=>{const ns={...s,printerStrikes:(s.printerStrikes||0)+1};checkAch(ns,{onStrike:true});return ns;});
          return{...p,onStrike:true,strikeCountdown:20,jammed:true,tapCount:newTaps,reputation:Math.max(0,p.reputation-15)};
        }
        const r=Math.random();
        if(r<0.25&&p.jammed){addToast("🤜 Tapinha resolveu! Milagre.","success");return{...p,jammed:false,currentIssue:null,tapCount:newTaps,mood:Math.min(100,p.mood+5),reputation:Math.max(0,p.reputation-2)};}
        if(r<0.55){addToast("🤜 Tapinha... sem efeito.","info");return{...p,tapCount:newTaps,reputation:Math.max(0,p.reputation-1)};}
        addToast("🤜 PIOROU! A impressora ficou furiosa.","error");
        const nh=Math.max(0,p.health-14);
        if(nh===0) playSound("printer_dead",0.8);
        return{...p,health:nh,mood:Math.max(0,p.mood-22),tapCount:newTaps,reputation:Math.max(0,p.reputation-5)};
      }
      if(correct){playSound("printer_fix",0.7);addToast(`✓ Consertado: ${issue.label}`,"success");return{...p,jammed:false,currentIssue:null,mood:Math.min(100,p.mood+12),reputation:Math.min(100,p.reputation+3)};}
      if(p.jammed){playSound("error_buzz",0.5);addToast("❌ Ação incorreta.","error");return{...p,health:Math.max(0,p.health-5),reputation:Math.max(0,p.reputation-2)};}
      addToast("A impressora está bem. Por enquanto.","info");
      return p;
    });
  }

  function handleAddWeight(item){
    setPrinter(p=>{
      const tw=p.weightItems.reduce((a,w)=>a+w.weight,0)+item.weight;
      if(tw>7){addToast("Pesado demais! O alimentador vai quebrar!","error");return{...p,health:Math.max(0,p.health-10)};}
      addToast(`${item.emoji} ${item.label} colocado.`,"info");
      return{...p,weightItems:[...p.weightItems,item]};
    });
  }
  function handleRemoveWeight(id){
    setPrinter(p=>{const item=p.weightItems.find(w=>w.id===id);if(item)addToast(`${item.emoji} removido.`,"info");return{...p,weightItems:p.weightItems.filter(w=>w.id!==id)};});
  }

  function handlePrepared(docId){
    playSound("paper_rustle",0.6);
    setDocs(ds=>ds.map(d=>d.id===docId?{...d,physicalReady:true,aligned:true,hasGrampo:false}:d));
    setSelectedDoc(prev=>prev?.id===docId?{...prev,physicalReady:true,aligned:true,hasGrampo:false}:prev);
    addToast("⚙ Documento preparado!","success");
  }

  function handleApprove(doc){
    if(printer.health<=0){addToast("💀 Impressora morta — aguarde técnico.","error");flashScreen("#ff220033");return;}
    if(printer.jammed){playSound("error_buzz",0.5);addToast("⛔ Impressora travada!","error");flashScreen("#ff220033");return;}
    if(!doc.physicalReady){playSound("error_buzz",0.5);addToast("⚙ Prepare o documento primeiro!","error");flashScreen("#ff220033");return;}
    const tw=printer.weightItems.reduce((a,w)=>a+w.weight,0);
    const badWeight = tw < 2;
    setScanning({doc, progress:0});
    playSound("printer_start",0.6);
    let prog = 0;
    const scanInt = setInterval(() => {
      prog += Math.random() * 18 + (badWeight ? 4 : 10);
      if (prog >= 100) {
        prog = 100;
        clearInterval(scanInt);
        setScanning(null);
        if(badWeight){
          addToast("⚠ Sem peso — digitalização torta! -10 pts","error");
          setScore(s=>Math.max(0,s-10));
        }
        if(!doc.isValid){
          const pen=35+(doc.issues.length>2?20:0);
          playSound("error_buzz",0.4);
          flashScreen("#ff220033");
          setScore(s=>Math.max(0,s-pen));
          setStats(s=>{const ns={...s,errors:s.errors+1,dayErrors:(s.dayErrors||0)+1};checkAch(ns,null);return ns;});
          addToast(`⚠ Aprovado com ${doc.issues.length} erro(s)! -${pen} pts`,"error");
          addDecision("⚠",`${doc.type} aprovado c/ erros`,  "#cc5555");
          setWrongDocs(w=>[...w,{...doc,decision:"approved_wrong"}]);
        } else {
          const pts=50+Math.floor(timeLeftRef.current/12);
          playSound("stamp",0.7);
          flashScreen("#00ff4422");
          setScore(s=>s+pts);
          setStats(s=>{const ns={...s,approved:s.approved+1};checkAch(ns,null);return ns;});
          addToast(`✓ Digitalizado! +${pts} pts`,"success");
          addDecision("✓",`${doc.type} aprovado`,  "#55aa55");
          bumpDpm();
        }
        const updated={...doc,scanned:true};
        setDocs(ds=>ds.map(d=>d.id===doc.id?updated:d));
        setSaveModal(updated);
        setSelectedDoc(null);
      } else {
        setScanning({doc, progress: Math.min(prog, 99)});
      }
    }, 80);
  }

  function handleReject(doc){
    if(doc.isValid){
      playSound("error_buzz",0.5);
      flashScreen("#ff220033");
      setScore(s=>Math.max(0,s-40));
      setStats(s=>{const ns={...s,errors:s.errors+1,dayErrors:(s.dayErrors||0)+1};checkAch(ns,null);return ns;});
      addToast("❌ Válido rejeitado! -40 pts","error");
      addDecision("❌",`${doc.type} rejeitado indevidamente`,"#cc3333");
      setWrongDocs(w=>[...w,{...doc,decision:"rejected_wrong"}]);
    } else {
      playSound("reject",0.7);
      flashScreen("#00ff4422");
      const pts=25+doc.issues.length*5;
      setScore(s=>s+pts);
      setStats(s=>{const ns={...s,rejected:s.rejected+1,correctRejections:(s.correctRejections||0)+1};checkAch(ns,null);return ns;});
      addToast(`✓ Erro detectado! +${pts} pts`,"success");
      addDecision("🔍",`${doc.type} rejeitado corretamente`,"#aa8800");
      bumpDpm();
    }
    setDocs(ds=>ds.filter(d=>d.id!==doc.id)); setSelectedDoc(null);
  }

  // handleSave — just update the doc; day-end detection is in a useEffect
  function handleSave(doc, path, correct){
    playSound(correct?"save_correct":"save_wrong", 0.7);
    setScore(s=>Math.max(0,s+(correct?20:-28)));
    setStats(s=>{
      const ns={...s,saved:s.saved+1,errors:correct?s.errors:s.errors+1,wrongFolders:correct?s.wrongFolders:(s.wrongFolders||0)+1,dayErrors:correct?s.dayErrors:(s.dayErrors||0)+1};
      checkAch(ns,null); return ns;
    });
    setDocs(ds=>ds.map(d=>d.id===doc.id?{...d,savedPath:path}:d));
    setSaveModal(null);
    addToast(correct?`💾 Salvo corretamente! +20 pts`:`💾 Pasta errada! -28 pts | Correto: ${CORRECT_FOLDER[doc.type]}`,correct?"success":"error");
  }

  function handleDailyLogClose(){
    setShowDailyLog(false);
    playSound("day_complete", 0.8);
    if(pendingNext){
      const nextLevel = pendingNext;
      setLevel(nextLevel);
      setDocs(genLevel(nextLevel));
      setTimeLeft(t=>t+70);
      setShowStory(true);
      setPendingNext(null);
      setShowRules(false); // will show after story closes
      addToast(`🎉 DIA ${nextLevel-1} CONCLUÍDO! +70s bônus`,"success");
    }
  }

  // FIX: show rules only after story is dismissed
  function handleStoryClose(){
    setShowStory(false);
    // Show daily rules briefing after story on days 2+
    if(level > 1){
      setShowRules(true);
    }
  }

  function handleColleagueAccept(){
    setTimeLeft(t=>t+15);
    if(Math.random()<0.4){addToast("🙋 O colega assinou errado... -20 pts","error");setScore(s=>Math.max(0,s-20));}
    else addToast("🙋 Colega assinou. Sem problemas.","success");
    setActiveEvent(null); setFrozen(false);
  }
  function handleColleagueDecline(){ setActiveEvent(null); setFrozen(false); }

  function handleFieldCompare(){
    setStats(s=>{const ns={...s,fieldsCompared:(s.fieldsCompared||0)+1};checkAch(ns,null);return ns;});
  }

  function startGame(withTutorial=true){
    stopMusic();
    const d=genLevel(1);
    setDocs(d);setLevel(1);setScore(0);setTimeLeft(200);
    setPhase(withTutorial?"tutorial":"playing");
    setTutorialStep(0);
    setShowStory(!withTutorial);
    setStats({approved:0,rejected:0,saved:0,errors:0,taps:0,wrongFolders:0,correctRejections:0,dayErrors:0,timeBonus:0,internCorrect:0,printerStrikes:0,fieldsCompared:0});
    setPrinter({health:100,mood:80,jammed:false,currentIssue:null,tapCount:0,weightItems:[],reputation:60,onStrike:false,strikeCountdown:0,wifiMode:false});
    setSelectedDoc(null);setSaveModal(null);setFrozen(false);setBlackout(false);setActiveEvent(null);
    setUnlocked([]);setPendingNext(null);setShowDailyLog(false);setSuspectedMap({});
    setDecisionLog([]);setWrongDocs([]);setScanning(null);setFlashColor(null);
    setShowRules(false);
    dpmRef.current = {count:0, since:Date.now()};
    // Start music after a short delay (user interaction ensures autoplay is allowed)
    setTimeout(() => startMusic(), 400);
  }

  const tc = timeLeft>80?"#448844":timeLeft>30?"#aa8800":"#aa3333";
  const pending = docs.filter(d=>!d.savedPath&&!d.scanned);
  const scannedUnsaved = docs.filter(d=>d.scanned&&!d.savedPath);
  const docSuspected = selectedDoc ? (suspectedMap[selectedDoc.id]||[]) : [];

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if(phase==="intro") return (
    <div style={{minHeight:"100vh",background:"#030307",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Courier New',monospace",backgroundImage:"radial-gradient(ellipse at 40% 55%, #0c0818 0%, #030307 65%)"}}>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes slideIn{from{transform:translateY(10px);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes flicker{0%,96%,100%{opacity:1}97%{opacity:0.5}}*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#1a1a2e}`}</style>
      <div style={{textAlign:"center",maxWidth:560,padding:40}}>
        <div style={{fontSize:52,marginBottom:14}}>🖨️</div>
        <div style={{fontSize:24,fontWeight:"bold",color:"#ddd",letterSpacing:5,marginBottom:6,animation:"flicker 4s infinite"}}>BUROCRACIA SIMULATOR</div>
        <div style={{color:"#6688bb",fontSize:10,letterSpacing:3,marginBottom:28}}>DIGITALIZAÇÕES INFERNAIS LTDA. — v4.1</div>
        <div style={{background:"#080812",border:"1px solid #1a1a2e",borderRadius:7,padding:22,marginBottom:22,textAlign:"left"}}>
          <div style={{color:"#aaa",fontSize:12,lineHeight:2.1}}>
            Segunda-feira, 08h47. Sua mesa está coberta de papéis.<br/>
            A {PRINTER_NAME} te observa com <span style={{color:"#ddaa00"}}>desconfiança</span>.<br/><br/>
            <span style={{color:"#ffcc44"}}>Missão:</span> digitalizar, validar e arquivar antes do expediente acabar.<br/>
            <span style={{color:"#88aadd"}}>Clique nos campos</span> para comparar valores entre documentos.<br/>
            <span style={{color:"#77cc77"}}>Prepare</span> fisicamente cada doc antes de digitalizar.<br/>
            <span style={{color:"#aa77cc"}}>Gerencie</span> a {PRINTER_NAME} — ela tem personalidade própria.
          </div>
        </div>
        <div style={{display:"flex",gap:12,justifyContent:"center"}}>
          <button onClick={()=>startGame(true)} style={{background:"#3a5a99",border:"none",color:"#fff",padding:"12px 28px",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:13,fontWeight:"bold",letterSpacing:1}}>▶ COM TUTORIAL</button>
          <button onClick={()=>startGame(false)} style={{background:"#1a1a2e",border:"1px solid #444",color:"#aaa",padding:"12px 28px",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:13,letterSpacing:1}}>▷ SEM TUTORIAL</button>
        </div>
        <div style={{color:"#777",fontSize:10,marginTop:14}}>Sons carregados de <code style={{color:"#6688aa"}}>/public/sounds/</code></div>
      </div>
    </div>
  );

  // ── TUTORIAL ───────────────────────────────────────────────────────────────
  if(phase==="tutorial") return (
    <div style={{minHeight:"100vh",background:"#030307"}}>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes slideIn{from{transform:translateY(10px);opacity:0}to{transform:translateY(0);opacity:1}}*{box-sizing:border-box}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#1a1a2e}`}</style>
      <TutorialOverlay step={tutorialStep} onNext={()=>{ if(tutorialStep>=TUTORIAL_STEPS.length-1){ setPhase("playing"); setShowStory(true); } else setTutorialStep(s=>s+1); }} onSkip={()=>{ setPhase("playing"); setShowStory(true); }}/>
    </div>
  );

  // ── GAME OVER ──────────────────────────────────────────────────────────────
  if(phase==="gameover"){
    const grade=score>800?"S":score>500?"A":score>300?"B":score>150?"C":"D";
    const gc={S:"#ffcc00",A:"#44bb44",B:"#4488ff",C:"#dd8800",D:"#dd4444"}[grade];
    return(
      <div style={{minHeight:"100vh",background:"#030307",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Courier New',monospace"}}>
        <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes slideIn{from{transform:translateY(8px);opacity:0}to{transform:translateY(0);opacity:1}}*{box-sizing:border-box}`}</style>
        <GameOverReviewWrapper wrongDocs={wrongDocs} grade={grade} gc={gc} score={score} stats={stats} unlocked={unlocked} onStartGame={startGame} onMenu={()=>{stopMusic();setPhase("intro");}}/>
      </div>
    );
  }

  // ── PLAYING ────────────────────────────────────────────────────────────────
  return (
    <div style={{height:"100vh",background:"#030307",fontFamily:"'Courier New',monospace",color:"#ccc",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes slideIn{from{transform:translateY(8px);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes flashFade{0%{opacity:1}100%{opacity:0}}*{box-sizing:border-box}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#111}`}</style>

      {showStory&&<StoryDialog day={level} onClose={handleStoryClose}/>}
      {showDailyLog&&<DailyLogModal stats={stats} level={level} score={score} timeLeft={timeLeft} onClose={handleDailyLogClose}/>}
      {showRules&&!showStory&&<DailyRulesBriefing day={level} onClose={()=>setShowRules(false)}/>}
      <AchievementPopup achievement={achievement}/>
      <EventBanner event={activeEvent} onColleagueAccept={handleColleagueAccept} onColleagueDecline={handleColleagueDecline}/>
      <ScanningOverlay scanning={scanning}/>
      <ScreenFlash color={flashColor}/>
      <DecisionLog decisions={decisionLog}/>
      <DocTooltip doc={hoveredDoc} visible={!!hoveredDoc}/>

      {/* TOP BAR */}
      <div style={{flexShrink:0,background:"#060610",borderBottom:"1px solid #1a1a2e",padding:"6px 16px",display:"flex",alignItems:"center",gap:14}}>
        <div><div style={{color:"#888",fontSize:9}}>DIA</div><div style={{color:"#5a90dd",fontSize:15,fontWeight:"bold"}}>{level}</div></div>

        <div style={{background:"#0a0a18",border:"1px solid #1a1a2e",borderRadius:4,padding:"3px 8px",textAlign:"center"}}>
          <div style={{color:"#888",fontSize:9}}>PENDENTES</div>
          <div style={{color:pending.length>5?"#ff6666":pending.length>2?"#ddaa00":"#55cc55",fontSize:13,fontWeight:"bold"}}>{pending.length}</div>
        </div>

        <div style={{background:"#0a0a18",border:`1px solid ${printer.health<=0?"#880000":printer.onStrike?"#884400":"#1a1a2e"}`,borderRadius:4,padding:"3px 8px",textAlign:"center",minWidth:54}}>
          <div style={{color:"#888",fontSize:9}}>BEATRIZ</div>
          <div style={{color:printer.health<=0?"#ff4444":printer.health<30?"#ff7700":printer.onStrike?"#ffaa00":"#55cc55",fontSize:11,fontWeight:"bold"}}>
            {printer.health<=0?"💀":printer.onStrike?"✊":`${printer.health}%`}
          </div>
        </div>

        <div style={{background:"#0a0a18",border:"1px solid #1a1a2e",borderRadius:4,padding:"3px 8px",textAlign:"center"}}>
          <div style={{color:"#888",fontSize:9}}>RITMO</div>
          <div style={{color:"#55aaaa",fontSize:11,fontWeight:"bold"}}>{docsPerMin}<span style={{color:"#777",fontSize:8}}>/min</span></div>
        </div>

        <div style={{flex:1,textAlign:"center"}}>
          <div style={{color:"#666",fontSize:9}}>DIGITALIZAÇÕES INFERNAIS LTDA.</div>
          <div style={{color:"#555",fontSize:9}}>
            <span title="[A] Aprovar  [R] Rejeitar  [Tab] Próx. doc" style={{cursor:"help",color:"#668866"}}>⌨ atalhos: A/R/Tab</span>
          </div>
        </div>

        {unlocked.length>0&&(
          <div style={{display:"flex",gap:3}}>
            {ACHIEVEMENTS.filter(a=>unlocked.includes(a.id)).map(a=>(
              <span key={a.id} title={a.label} style={{fontSize:11,opacity:0.55}}>{a.emoji}</span>
            ))}
          </div>
        )}

        <button onClick={toggleMute} title={muted?"Ativar sons":"Silenciar"} style={{background:"transparent",border:"1px solid #1a1a2e",color:muted?"#553333":"#336633",padding:"3px 8px",borderRadius:3,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:12}}>
          {muted?"🔇":"🔊"}
        </button>
        <div style={{textAlign:"center"}}>
          <div style={{color:"#888",fontSize:9}}>TEMPO</div>
          <div style={{color:tc,fontSize:17,fontWeight:"bold",animation:timeLeft<30?"blink 0.8s infinite":"none"}}>{p2(Math.floor(timeLeft/60))}:{p2(timeLeft%60)}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{color:"#888",fontSize:9}}>PONTOS</div>
          <div style={{color:"#aa8800",fontSize:15,fontWeight:"bold"}}>{score}</div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div style={{flex:1,display:"grid",gridTemplateColumns:"210px 1fr 250px",overflow:"hidden",minHeight:0}}>

        {/* LEFT */}
        <div style={{borderRight:"1px solid #0a0a14",padding:9,overflowY:"auto",background:"#050510",display:"flex",flexDirection:"column",gap:5}}>
          <div style={{color:"#99aacc",fontSize:9,letterSpacing:1,flexShrink:0}}>PENDENTES ({pending.length})</div>
          {pending.map(doc=>(
            <DocumentCard key={doc.id} doc={doc} selected={selectedDoc?.id===doc.id}
              onClick={()=>{playSound("paper_rustle",0.3);setSelectedDoc(docs.find(d=>d.id===doc.id)||doc);}}
              onMouseEnter={()=>setHoveredDoc(doc)}
              onMouseLeave={()=>setHoveredDoc(null)}
              now={now}/>
          ))}
          {scannedUnsaved.length>0&&(
            <>
              <div style={{color:"#6699cc",fontSize:9,marginTop:6,letterSpacing:1,flexShrink:0}}>AGUARDANDO SALVAR ({scannedUnsaved.length})</div>
              {scannedUnsaved.map(doc=>(
                <div key={doc.id} onClick={()=>setSaveModal(doc)} style={{background:"#050a14",border:"1px solid #1a2a44",borderRadius:4,padding:"7px 10px",cursor:"pointer"}}>
                  <div style={{color:"#5588cc",fontSize:10}}>💾 {doc.type}</div>
                  <div style={{color:"#bbb",fontSize:10}}>{doc.data.name}</div>
                  <div style={{color:"#777",fontSize:9}}>clique para salvar</div>
                </div>
              ))}
            </>
          )}
          {docs.filter(d=>d.savedPath).length>0&&(
            <div style={{color:"#55aa55",fontSize:9,marginTop:4}}>✓ {docs.filter(d=>d.savedPath).length} salvo(s)</div>
          )}
        </div>

        {/* CENTER */}
        <div style={{display:"flex",flexDirection:"column",overflow:"hidden",minHeight:0}}>
          {selectedDoc&&!selectedDoc.physicalReady&&(
            <div style={{flexShrink:0,padding:"8px 14px 0"}}>
              <PhysicalPrepPanel doc={selectedDoc} onPrepared={handlePrepared}/>
            </div>
          )}
          <div style={{flex:1,minHeight:0}}>
            <InspectionPanel
              doc={selectedDoc}
              onApprove={handleApprove}
              onReject={handleReject}
              frozen={frozen}
              blackout={blackout}
              onFieldCompare={handleFieldCompare}
              suspectedFields={docSuspected}
              onToggleSuspect={(fid)=>{
                if(!selectedDoc) return;
                setSuspectedMap(m=>{
                  const cur=m[selectedDoc.id]||[];
                  return{...m,[selectedDoc.id]:cur.includes(fid)?cur.filter(x=>x!==fid):[...cur,fid]};
                });
              }}
            />
          </div>
        </div>

        {/* RIGHT */}
        <div style={{borderLeft:"1px solid #0a0a14",padding:9,overflowY:"auto",background:"#050510",display:"flex",flexDirection:"column",gap:9}}>
          <PrinterPanel printer={printer} onAction={handlePrinterAction} onAddWeight={handleAddWeight} onRemoveWeight={handleRemoveWeight}/>

          <div style={{background:"#070710",border:"1px solid #0f0f1a",borderRadius:6,padding:11}}>
            <div style={{color:"#88aa88",fontSize:9,marginBottom:7,letterSpacing:1}}>ESTATÍSTICAS</div>
            {[{label:"Aprovados",val:stats.approved,color:"#55cc55"},{label:"Rejeitados certos",val:stats.correctRejections||0,color:"#ddaa00"},{label:"Salvos",val:stats.saved,color:"#5588ff"},{label:"Erros",val:stats.errors,color:"#ff5555"},{label:"Campos comparados",val:stats.fieldsCompared||0,color:"#55bbbb"},{label:"Tapinhas",val:stats.taps||0,color:"#cc7766"}].map(s=>(
              <div key={s.label} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:"1px solid #111120"}}>
                <span style={{color:"#999",fontSize:10}}>{s.label}</span>
                <span style={{color:s.color,fontSize:11,fontWeight:"bold"}}>{s.val}</span>
              </div>
            ))}
          </div>

          <div style={{background:"#070710",border:"1px solid #0f0f1a",borderRadius:6,padding:11}}>
            <div style={{color:"#88aa88",fontSize:9,marginBottom:7,letterSpacing:1}}>CONQUISTAS</div>
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {ACHIEVEMENTS.map(a=>{
                const u=unlocked.includes(a.id);
                return(
                  <div key={a.id} style={{display:"flex",gap:6,alignItems:"center",opacity:u?1:0.3}}>
                    <span style={{fontSize:12}}>{a.emoji}</span>
                    <div>
                      <div style={{color:u?"#ffcc00":"#777",fontSize:10}}>{a.label}</div>
                      <div style={{color:u?"#999":"#555",fontSize:9}}>{a.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{background:"#070710",border:"1px solid #0f0f1a",borderRadius:6,padding:11}}>
            <div style={{color:"#88aa88",fontSize:9,marginBottom:7,letterSpacing:1}}>GUIA RÁPIDO</div>
            <div style={{color:"#aaa",fontSize:10,lineHeight:2.0}}>
              1. Selecione documento<br/>
              2. Prepare (grampos + alinhamento)<br/>
              3. <span style={{color:"#6699cc"}}>Clique nos campos</span> para comparar<br/>
              4. Verifique assinatura e foto<br/>
              5. Aprove ou rejeite<br/>
              6. Salve na pasta correta<br/>
              <span style={{color:"#ddaa00"}}>⚖</span> Coloque 2–5kg na impressora<br/>
              <span style={{color:"#77bbbb"}}>💡</span> Reputação alta = avisos antecipados
            </div>
          </div>
        </div>
      </div>

      {saveModal&&<FileSaveModal doc={saveModal} onSave={handleSave} onClose={()=>setSaveModal(null)}/>}
      <Toast messages={toasts}/>
    </div>
  );
}
