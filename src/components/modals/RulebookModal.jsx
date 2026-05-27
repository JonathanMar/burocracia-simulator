import { DAY_RULES, MEMORANDOS } from '../../constants/story.js';

export default function RulebookModal({ day, onClose }) {
  const rules = DAY_RULES[Math.min(day, 8)] || DAY_RULES[5];
  // Memorandos acumulados até o dia atual
  const activeMemos = MEMORANDOS.filter(m => m.day <= day);
  return (
    <div style={{position:"fixed",inset:0,background:"#000000cc",display:"flex",alignItems:"center",justifyContent:"center",zIndex:250}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:"#08080f",border:"1px solid #2a2a4a",borderRadius:9,
        padding:24,maxWidth:440,width:"90%",maxHeight:"85vh",overflow:"auto",
        fontFamily:"'Courier New',monospace",animation:"slideIn 0.25s ease",
      }}>
        <div style={{color:"#5a8fff",fontSize:10,letterSpacing:2,marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span>📋 REGULAMENTO VIGENTE — DIA {day}</span>
          <button onClick={onClose} style={{background:"transparent",border:"1px solid #333",color:"#666",padding:"2px 8px",borderRadius:3,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:11}}>✕</button>
        </div>

        {/* Daily rules */}
        <div style={{marginBottom:18}}>
          <div style={{color:"#446644",fontSize:9,letterSpacing:1,marginBottom:8}}>VERIFICAÇÕES OBRIGATÓRIAS</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {rules.map((r,i) => (
              <div key={i} style={{
                display:"flex",gap:10,alignItems:"flex-start",
                background:r.startsWith("⚠")?"#1a1100":"#0a0a14",
                border:`1px solid ${r.startsWith("⚠")?"#443300":"#1a1a2e"}`,
                borderRadius:5,padding:"8px 12px",
              }}>
                <span style={{fontSize:13,flexShrink:0,color:r.startsWith("⚠")?"#cc8800":"#336633"}}>
                  {r.startsWith("⚠") ? "⚠" : "✓"}
                </span>
                <span style={{color:r.startsWith("⚠")?"#cc9900":"#558855",fontSize:11,lineHeight:1.5}}>
                  {r.replace("⚠ ","")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Memorandos acumulados */}
        {activeMemos.length > 0 && (
          <div>
            <div style={{color:"#664433",fontSize:9,letterSpacing:1,marginBottom:8}}>MEMORANDOS RECEBIDOS</div>
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {activeMemos.map((m,i) => (
                <div key={i} style={{
                  background:"#120a00",border:"1px solid #332200",borderRadius:4,
                  padding:"7px 12px",fontSize:10,color:"#bb8844",lineHeight:1.5,
                }}>
                  <span style={{color:"#555",fontSize:9,marginRight:6}}>DIA {m.day}</span>
                  {m.text}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{marginTop:16,borderTop:"1px solid #111",paddingTop:12,display:"flex",justifyContent:"center"}}>
          <button onClick={onClose} style={{
            background:"#1a2a1a",border:"1px solid #336633",color:"#55aa55",
            padding:"8px 24px",borderRadius:4,cursor:"pointer",
            fontFamily:"'Courier New',monospace",fontSize:12,fontWeight:"bold",
          }}>
            Fechar regulamento
          </button>
        </div>
      </div>
    </div>
  );
}
