import { useState, useEffect, useRef, useCallback } from 'react';
import { playSound } from '../audio/sounds.js';
import { startMusic, stopMusic } from '../audio/music.js';
import { useSoundToggle } from '../audio/useSoundToggle.js';
import { genLevel, rf, p2 } from '../game/docGenerator.js';
import { CORRECT_FOLDER, ISSUE_EXPLANATIONS } from '../constants/game.js';
import { ACHIEVEMENTS } from '../constants/achievements.js';
import { RANDOM_EVENTS } from '../constants/events.js';
import { PRINTER_NAME, PRINTER_EVENTS } from '../constants/printer.js';
import { REJECTION_REACTIONS } from '../constants/story.js';

import TopBar from '../components/game/TopBar.jsx';
import EventBanner from '../components/game/EventBanner.jsx';
import DocTooltip from '../components/game/DocTooltip.jsx';
import DocumentList from '../components/panels/DocumentList.jsx';
import InspectionPanel from '../components/panels/InspectionPanel.jsx';
import PhysicalPrepPanel from '../components/panels/PhysicalPrepPanel.jsx';
import PrinterPanel from '../components/panels/PrinterPanel.jsx';
import FileSaveModal from '../components/modals/FileSaveModal.jsx';
import DailyLogModal from '../components/modals/DailyLogModal.jsx';
import StoryDialog from '../components/modals/StoryDialog.jsx';
import DailyRulesBriefing from '../components/modals/DailyRulesBriefing.jsx';
import RulebookModal from '../components/modals/RulebookModal.jsx';
import BriberyModal from '../components/modals/BriberyModal.jsx';
import ScanningOverlay from '../components/modals/ScanningOverlay.jsx';
import Toast from '../components/ui/Toast.jsx';
import ScreenFlash from '../components/ui/ScreenFlash.jsx';
import AchievementPopup from '../components/ui/AchievementPopup.jsx';
import DecisionLog from '../components/ui/DecisionLog.jsx';

const GLOBAL_STYLES = `@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes slideIn{from{transform:translateY(8px);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes flashFade{0%{opacity:1}100%{opacity:0}}*{box-sizing:border-box}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#111}`;

export default function PlayingScreen({ initialDocs, initialLevel, onGameOver, onStartGame }) {
  const [level,         setLevel]         = useState(initialLevel);
  const [score,         setScore]         = useState(0);
  const [docs,          setDocs]          = useState(initialDocs);
  const [selectedDoc,   setSelectedDoc]   = useState(null);
  const [saveModal,     setSaveModal]     = useState(null);
  const [timeLeft,      setTimeLeft]      = useState(200);
  const [frozen,        setFrozen]        = useState(false);
  const [blackout,      setBlackout]      = useState(false);
  const [activeEvent,   setActiveEvent]   = useState(null);
  const [toasts,        setToasts]        = useState([]);
  const [showStory,     setShowStory]     = useState(true);
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
  const [showRulebook,  setShowRulebook]  = useState(false);
  const [showBribery,   setShowBribery]   = useState(false);
  const [wrongDocs,     setWrongDocs]     = useState([]);
  const [docsPerMin,    setDocsPerMin]    = useState(0);
  const [combo,         setCombo]         = useState(0);
  const [comboMult,     setComboMult]     = useState(1.0);
  const [corruption,    setCorruption]    = useState(0);
  const comboMultRef = useRef(1.0);
  const dpmRef = useRef({count:0, since:Date.now()});
  useEffect(()=>{ comboMultRef.current = comboMult; },[comboMult]);

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

  const toastId     = useRef(0);
  const timerRef    = useRef(null);
  const eventRef    = useRef(null);
  const printerRef  = useRef(null);
  const deathRef    = useRef(null);
  const strikeRef   = useRef(null);
  const nowRef      = useRef(null);
  const docsRef     = useRef(docs);
  const statsRef    = useRef(stats);
  const printerSRef = useRef(printer);
  const timeLeftRef = useRef(timeLeft);
  useEffect(()=>{ docsRef.current    = docs;    },[docs]);
  useEffect(()=>{ statsRef.current   = stats;   },[stats]);
  useEffect(()=>{ printerSRef.current= printer; },[printer]);
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
    ACHIEVEMENTS.forEach(a => { if (a.check(s || statsRef.current)) triggerAchievement(a); });
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
  useEffect(()=>{
    nowRef.current = setInterval(()=>{
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
    }, 1000);
    return()=>clearInterval(nowRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[addToast]);

  // Printer death drain
  useEffect(()=>{
    deathRef.current = setInterval(()=>{
      if(printerSRef.current.health<=0&&!printerSRef.current.onStrike){
        setScore(s=>Math.max(0,s-5));
        addToast("💀 Técnico ainda não chegou... -5 pts","error");
      }
    },2000);
    return()=>clearInterval(deathRef.current);
  },[addToast]);

  // Strike countdown
  useEffect(()=>{
    strikeRef.current = setInterval(()=>{
      setPrinter(p=>{
        if(!p.onStrike) return p;
        const c=p.strikeCountdown-1;
        if(c<=0){ addToast(`✊ ${PRINTER_NAME} voltou da greve.`,"info"); return{...p,onStrike:false,strikeCountdown:0,health:Math.min(100,p.health+10),jammed:false,currentIssue:null}; }
        return{...p,strikeCountdown:c};
      });
    },1000);
    return()=>clearInterval(strikeRef.current);
  },[addToast]);

  // Game-over capture — uses refs to get latest values
  const scoreRef    = useRef(0);
  const wrongDocRef = useRef([]);
  const unlockedRef = useRef([]);
  useEffect(()=>{ scoreRef.current    = score;    },[score]);
  useEffect(()=>{ wrongDocRef.current = wrongDocs;},[wrongDocs]);
  useEffect(()=>{ unlockedRef.current = unlocked; },[unlocked]);
  const corruptionRef = useRef(0);
  useEffect(()=>{ corruptionRef.current = corruption; },[corruption]);

  // Re-wire timer with stable refs
  useEffect(()=>{
    clearInterval(timerRef.current);
    timerRef.current = setInterval(()=>{
      setTimeLeft(t=>{
        if(t<=1){
          clearInterval(timerRef.current);
          stopMusic();
          playSound("blackout", 0.9);
          onGameOver({ score: scoreRef.current, stats: statsRef.current, wrongDocs: wrongDocRef.current, unlocked: unlockedRef.current, corruption: corruptionRef.current });
          return 0;
        }
        return t-1;
      });
    },1000);
    return()=>clearInterval(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[onGameOver]);

  // Day-end detection:
  // - All docs saved → normal completion
  // - All docs rejected (docs.length === 0) → also triggers daily log, otherwise the level is stuck
  useEffect(() => {
    if (showDailyLog || pendingNext) return;
    // All rejected: docs array is empty and game has started (level > 0 check via initialLevel prop)
    const allRejected = docs.length === 0;
    // All remaining docs are saved
    const everySaved = docs.length > 0 && docs.every(d => d.savedPath !== null);
    if (allRejected || everySaved) {
      setStats(s => ({ ...s, timeBonus: timeLeftRef.current }));
      setPendingNext(level + 1);
      setShowDailyLog(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docs]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e) {
      if (saveModal || showStory || showDailyLog || frozen || blackout) return;
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "a" || e.key === "A") { if (selectedDoc) handleApprove(selectedDoc); }
      if (e.key === "r" || e.key === "R") { if (selectedDoc) handleReject(selectedDoc); }
      if (e.key === "k" || e.key === "K") { setShowRulebook(r => !r); }
      if (e.key === "Tab") {
        e.preventDefault();
        const p = docsRef.current.filter(d => !d.savedPath && !d.scanned);
        if (p.length === 0) return;
        const idx = selectedDoc ? p.findIndex(d => d.id === selectedDoc.id) : -1;
        const next = p[(idx + 1) % p.length];
        if (next) { playSound("paper_rustle", 0.3); setSelectedDoc(next); }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDoc, saveModal, showStory, showDailyLog, frozen, blackout]);

  // Random events
  useEffect(()=>{
    eventRef.current = setInterval(()=>{
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
      if(ev.effect==="bribery"){
        // Only available from day 3+, and only when there are pending invalid docs
        const invalidPending = docsRef.current.filter(d=>!d.scanned&&!d.savedPath&&!d.isValid);
        if(level >= 3 && invalidPending.length > 0){
          setShowBribery(true);
          return; // don't auto-dismiss — BriberyModal handles dismissal
        } else {
          // Not eligible: skip silently
          return;
        }
      }
      if(ev.id!=="colleague") setTimeout(()=>{setActiveEvent(null);setFrozen(false);},ev.duration);
    },14000);
    return()=>clearInterval(eventRef.current);
  },[addToast,checkAch,activeEvent,level]);

  // Printer random events
  useEffect(()=>{
    printerRef.current = setInterval(()=>{
      const p=printerSRef.current;
      if(p.health<=0||p.onStrike||p.wifiMode) return;
      if(Math.random()<0.18+level*0.04){
        const ev=rf(PRINTER_EVENTS);
        if(p.reputation>70) addToast(`⚠ ${PRINTER_NAME} avisa: ${ev.label} iminente!`,"info");
        else if(p.reputation>40) addToast(`🖨️ ${ev.label}`,"error");
        playSound("printer_jam",0.7);
        setPrinter(prev=>({...prev,currentIssue:ev,jammed:true,mood:Math.max(0,prev.mood-15),health:Math.max(0,prev.health-7)}));
      }
    },9000);
    return()=>clearInterval(printerRef.current);
  },[level,addToast]);

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

  function breakCombo() {
    setCombo(0);
    setComboMult(1.0);
    comboMultRef.current = 1.0;
  }
  function hitCombo() {
    setCombo(c => {
      const next = c + 1;
      // x1.0 → x1.1 at 2 → x1.25 at 4 → x1.5 at 7+
      const mult = next >= 7 ? 1.5 : next >= 4 ? 1.25 : next >= 2 ? 1.1 : 1.0;
      setComboMult(mult);
      comboMultRef.current = mult;
      if (next === 2) addToast("🔥 2 acertos seguidos! Bônus +10%", "success");
      if (next === 4) addToast("🔥🔥 4 acertos seguidos! Bônus +25%", "success");
      if (next === 7) addToast("⚡ SEQUÊNCIA MÁXIMA! Bônus +50%", "achievement");
      return next;
    });
  }

  function handleApprove(doc){
    if(printer.health<=0){addToast("💀 Impressora morta — aguarde técnico.","error");flashScreen("#ff220033");return;}
    if(printer.jammed){playSound("error_buzz",0.5);addToast("⛔ Impressora travada!","error");flashScreen("#ff220033");return;}
    if(!doc.physicalReady){playSound("error_buzz",0.5);addToast("⚙ Prepare o documento primeiro!","error");flashScreen("#ff220033");return;}
    const tw=printer.weightItems.reduce((a,w)=>a+w.weight,0);
    const badWeight = tw < 2;
    // Mood affects scan speed: high mood = faster, low mood = sluggish
    const moodFactor = printerSRef.current.mood > 70 ? 1.4 : printerSRef.current.mood < 40 ? 0.55 : 1.0;
    setScanning({doc, progress:0});
    playSound("printer_start",0.6);
    let prog = 0;
    const scanInt = setInterval(() => {
      const baseInc = badWeight ? 4 : 10;
      prog += (Math.random() * 18 + baseInc) * moodFactor;
      if (prog >= 100) {
        prog = 100;
        clearInterval(scanInt);
        setScanning(null);
        if(badWeight){ addToast("⚠ Sem peso — digitalização torta! -10 pts","error"); setScore(s=>Math.max(0,s-10)); }
        if(!doc.isValid){
          const pen=35+(doc.issues.length>2?20:0);
          playSound("error_buzz",0.4); flashScreen("#ff220033");
          setScore(s=>Math.max(0,s-pen));
          setStats(s=>{const ns={...s,errors:s.errors+1,dayErrors:(s.dayErrors||0)+1};checkAch(ns,null);return ns;});
          addToast(`⚠ Aprovado com erro: "${doc.issues[0] || 'erro'}" — -${pen} pts`,"error");
          addDecision("⚠",`${doc.type} aprovado c/ erros`,"#cc5555");
          setWrongDocs(w=>[...w,{...doc,decision:"approved_wrong"}]);
          breakCombo();
        } else {
          const basePts = 50 + Math.floor(timeLeftRef.current/12);
          // Use ref to avoid stale closure inside scan interval
          const pts = Math.round(basePts * comboMultRef.current);
          playSound("stamp",0.7); flashScreen("#00ff4422");
          setScore(s=>s+pts);
          setStats(s=>{const ns={...s,approved:s.approved+1};checkAch(ns,null);return ns;});
          addToast(`✓ Digitalizado! +${pts} pts${comboMultRef.current>1?` (x${comboMultRef.current.toFixed(2)})`:""}`  ,"success");
          addDecision("✓",`${doc.type} aprovado`,"#55aa55");
          bumpDpm();
          hitCombo();
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
    // Pick a reaction message based on context
    const reactionPool = doc.isValid
      ? REJECTION_REACTIONS.wrongRejection
      : (doc.context ? REJECTION_REACTIONS.urgent : REJECTION_REACTIONS.correct);
    const reaction = rf(reactionPool);

    if(doc.isValid){
      playSound("error_buzz",0.5); flashScreen("#ff220033");
      setScore(s=>Math.max(0,s-40));
      setStats(s=>{const ns={...s,errors:s.errors+1,dayErrors:(s.dayErrors||0)+1};checkAch(ns,null);return ns;});
      addToast(`❌ Documento válido rejeitado! Era válido. -40 pts`,"error");
      addDecision("❌",`${doc.type} rejeitado indevidamente`,"#cc3333");
      setWrongDocs(w=>[...w,{...doc,decision:"rejected_wrong"}]);
      breakCombo();
    } else {
      playSound("reject",0.7); flashScreen("#00ff4422");
      const basePts = 25 + doc.issues.length * 5;
      const pts = Math.round(basePts * comboMultRef.current);
      setScore(s=>s+pts);
      setStats(s=>{const ns={...s,rejected:s.rejected+1,correctRejections:(s.correctRejections||0)+1};checkAch(ns,null);return ns;});
      addToast(`✓ Erro detectado! +${pts} pts${comboMultRef.current>1?` (x${comboMultRef.current.toFixed(2)})`:""}`,"success");
      addDecision("🔍",`${doc.type} rejeitado corretamente`,"#aa8800");
      bumpDpm();
      hitCombo();
    }
    // Show reaction after a brief delay
    setTimeout(() => addToast(`💬 "${reaction}"`, "info"), 400);
    setDocs(ds=>ds.filter(d=>d.id!==doc.id)); setSelectedDoc(null);
  }

  function handleBriberyAccept(amount){
    setCorruption(c => c + 1);
    setScore(s => s + amount);
    addToast(`💰 Suborno aceito: +${amount} pts. Corrupção registrada.`,"error");
    addDecision("💰",`Suborno aceito (R$ ${amount})`,"#cc8800");
    setActiveEvent(null);
    setShowBribery(false);
    // If 3 corruptions accumulated, warn
    setCorruption(c => {
      if(c >= 3) addToast("⚠ 3 registros de corrupção — auditoria no final!","error");
      return c;
    });
  }

  function handleBriberyRefuse(){
    addToast("🚫 Suborno recusado. Integridade mantida.","success");
    addDecision("🚫","Suborno recusado","#4488ff");
    setActiveEvent(null);
    setShowBribery(false);
  }

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
      setShowRules(false);
      // Reset per-day counters so achievements like "Sem Erros" are achievable every day
      setStats(s=>({...s, dayErrors:0, timeBonus:0}));
      addToast(`🎉 DIA ${nextLevel-1} CONCLUÍDO! +70s bônus`,"success");
    }
  }

  function handleStoryClose(){
    setShowStory(false);
    if(level > 1){ setShowRules(true); }
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

  const pending       = docs.filter(d=>!d.savedPath&&!d.scanned);
  const scannedUnsaved= docs.filter(d=>d.scanned&&!d.savedPath);
  const docSuspected  = selectedDoc ? (suspectedMap[selectedDoc.id]||[]) : [];

  return (
    <div style={{height:"100vh",background:"#030307",fontFamily:"'Courier New',monospace",color:"#ccc",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <style>{GLOBAL_STYLES}</style>

      {showStory&&<StoryDialog day={level} onClose={handleStoryClose}/>}
      {showDailyLog&&<DailyLogModal stats={stats} level={level} score={score} timeLeft={timeLeft} onClose={handleDailyLogClose}/>}
      {showRules&&!showStory&&<DailyRulesBriefing day={level} onClose={()=>setShowRules(false)}/>}
      {showRulebook&&<RulebookModal day={level} onClose={()=>setShowRulebook(false)}/>}
      {showBribery&&<BriberyModal onAccept={handleBriberyAccept} onRefuse={handleBriberyRefuse}/>}
      <AchievementPopup achievement={achievement}/>
      <EventBanner event={activeEvent} onColleagueAccept={handleColleagueAccept} onColleagueDecline={handleColleagueDecline}/>
      <ScanningOverlay scanning={scanning}/>
      <ScreenFlash color={flashColor}/>
      <DecisionLog decisions={decisionLog}/>
      <DocTooltip doc={hoveredDoc} visible={!!hoveredDoc}/>

      <TopBar
        level={level}
        pending={pending.length}
        printer={printer}
        docsPerMin={docsPerMin}
        muted={muted}
        toggleMute={toggleMute}
        timeLeft={timeLeft}
        score={score}
        unlocked={unlocked}
        combo={combo}
        comboMult={comboMult}
        onOpenRulebook={() => setShowRulebook(true)}
        corruption={corruption}
      />

      <div style={{flex:1,display:"grid",gridTemplateColumns:"210px 1fr 250px",overflow:"hidden",minHeight:0}}>
        <DocumentList
          pending={pending}
          scannedUnsaved={scannedUnsaved}
          saved={docs.filter(d=>d.savedPath).length}
          selectedDoc={selectedDoc}
          onSelect={(doc)=>{playSound("paper_rustle",0.3);setSelectedDoc(docs.find(d=>d.id===doc.id)||doc);}}
          onOpenSave={setSaveModal}
          now={now}
        />

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
                return(<div key={a.id} style={{display:"flex",gap:6,alignItems:"center",opacity:u?1:0.3}}><span style={{fontSize:12}}>{a.emoji}</span><div><div style={{color:u?"#ffcc00":"#777",fontSize:10}}>{a.label}</div><div style={{color:u?"#999":"#555",fontSize:9}}>{a.desc}</div></div></div>);
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
