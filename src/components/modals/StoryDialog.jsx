import { useState } from 'react';
import { STORY_DAYS, MEMORANDOS } from '../../constants/story.js';

function MemorandoModal({ memo, onClose }) {
  if (!memo) return null;
  return (
    <div style={{position:"fixed",inset:0,background:"#000000cc",display:"flex",alignItems:"center",justifyContent:"center",zIndex:280}}>
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

export default function StoryDialog({ day, onClose }) {
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
