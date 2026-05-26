import { DAY_RULES } from '../../constants/story.js';

export default function DailyRulesBriefing({ day, onClose }) {
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
