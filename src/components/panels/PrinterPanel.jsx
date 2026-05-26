import { useState } from 'react';
import { PRINTER_NAME, WEIGHT_ITEMS, PRINTER_LCD_MSGS } from '../../constants/printer.js';
import { rf } from '../../game/docGenerator.js';

export default function PrinterPanel({ printer, onAction, onAddWeight, onRemoveWeight }) {
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
