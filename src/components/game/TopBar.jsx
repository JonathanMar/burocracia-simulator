import { p2 } from '../../game/docGenerator.js';
import { ACHIEVEMENTS } from '../../constants/achievements.js';

export default function TopBar({ level, pending, printer, docsPerMin, muted, toggleMute, timeLeft, score, unlocked, combo, comboMult, onOpenRulebook, corruption }) {
  const tc = timeLeft>80?"#448844":timeLeft>30?"#aa8800":"#aa3333";
  return (
    <div style={{flexShrink:0,background:"#060610",borderBottom:"1px solid #1a1a2e",padding:"6px 16px",display:"flex",alignItems:"center",gap:14}}>
      <div><div style={{color:"#888",fontSize:9}}>DIA</div><div style={{color:"#5a90dd",fontSize:15,fontWeight:"bold"}}>{level}</div></div>
      <div style={{background:"#0a0a18",border:"1px solid #1a1a2e",borderRadius:4,padding:"3px 8px",textAlign:"center"}}>
        <div style={{color:"#888",fontSize:9}}>PENDENTES</div>
        <div style={{color:pending>5?"#ff6666":pending>2?"#ddaa00":"#55cc55",fontSize:13,fontWeight:"bold"}}>{pending}</div>
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

      {/* Rulebook button */}
      <button
        onClick={onOpenRulebook}
        title="Ver regulamento do dia (regras ativas + memorandos)"
        style={{
          background:"#0a0a18",border:"1px solid #2a3a2a",color:"#558855",
          padding:"4px 10px",borderRadius:4,cursor:"pointer",
          fontFamily:"'Courier New',monospace",fontSize:11,
          display:"flex",alignItems:"center",gap:5,transition:"all 0.15s",
        }}
      >
        📋 <span style={{letterSpacing:0.5}}>REGRAS</span>
      </button>

      {/* Corruption badge */}
      {corruption > 0 && (
        <div title={`${corruption} registro(s) de corrupção — 3 = auditoria`} style={{
          background:"#1a0800",border:`1px solid ${corruption>=3?"#cc3300":"#664400"}`,
          borderRadius:4,padding:"3px 8px",textAlign:"center",minWidth:44,
          animation:corruption>=3?"blink 0.8s infinite":"none",
        }}>
          <div style={{color:"#666",fontSize:8}}>CORRUPÇÃO</div>
          <div style={{color:corruption>=3?"#ff4400":"#cc7700",fontSize:12,fontWeight:"bold"}}>{'💰'.repeat(corruption)}</div>
        </div>
      )}

      <div style={{flex:1,textAlign:"center"}}>
        <div style={{color:"#666",fontSize:9}}>DIGITALIZAÇÕES INFERNAIS LTDA.</div>
        <div style={{color:"#555",fontSize:9}}><span title="[A] Aprovar  [R] Rejeitar  [Tab] Próx. doc  [K] Regulamento" style={{cursor:"help",color:"#668866"}}>⌨ atalhos: A/R/Tab/K</span></div>
      </div>

      {/* Combo badge */}
      {combo >= 2 && (
        <div style={{background:combo>=7?"#1a0a00":combo>=4?"#1a1000":"#0a0a18",border:`1px solid ${combo>=7?"#ff6600":combo>=4?"#ffaa00":"#4466aa"}`,borderRadius:5,padding:"3px 10px",textAlign:"center",minWidth:60,animation:combo>=7?"blink 0.6s infinite":"none"}}>
          <div style={{color:"#888",fontSize:8}}>COMBO</div>
          <div style={{color:combo>=7?"#ff6600":combo>=4?"#ffcc00":"#5577ff",fontSize:12,fontWeight:"bold"}}>{combo}x <span style={{fontSize:9,opacity:0.8}}>×{comboMult.toFixed(2)}</span></div>
        </div>
      )}
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
  );
}
