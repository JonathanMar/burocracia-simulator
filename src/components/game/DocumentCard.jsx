import { p2 } from '../../game/docGenerator.js';

export default function DocumentCard({ doc, selected, onClick, onMouseEnter, onMouseLeave, now }) {
  const urgent = doc.urgentDeadline && now < doc.urgentDeadline;
  const secsLeft = urgent ? Math.max(0, Math.floor((doc.urgentDeadline - now) / 1000)) : null;
  const urgentCritical = secsLeft !== null && secsLeft < 10;

  return (
    <div onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
      style={{
        background: selected ? "#0e1622" : "#080810",
        border: `2px solid ${selected ? "#3a6aaa" : urgent ? (urgentCritical ? "#cc2222" : "#cc222255") : "#111"}`,
        borderRadius: 5, padding: "9px 11px", cursor: "pointer",
        transition: "all 0.15s", position: "relative",
        animation: urgentCritical ? "blink 0.5s infinite" : "none",
      }}>

      {urgent && (
        <div style={{position:"absolute",top:4,right:6,display:"flex",alignItems:"center",gap:3,background:urgentCritical?"#2a0000":"#1a0800",border:`1px solid ${urgentCritical?"#cc2222":"#882200"}`,borderRadius:3,padding:"1px 5px"}}>
          <span style={{color:urgentCritical?"#ff4444":"#cc6633",fontSize:9,fontWeight:"bold"}}>
            ⏰ {p2(Math.floor(secsLeft/60))}:{p2(secsLeft%60)}
          </span>
        </div>
      )}

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",paddingRight:urgent?52:0}}>
        <div>
          <div style={{display:"flex",gap:4,alignItems:"center",flexWrap:"wrap"}}>
            <span style={{background:"#111122",border:"1px solid #2a2a44",color:"#6688bb",padding:"1px 5px",borderRadius:2,fontSize:9}}>{doc.type}</span>
            {doc.expectedPages > 1 && (
              <span style={{color:"#556677",fontSize:9}}>{doc.pages}/{doc.expectedPages}p</span>
            )}
          </div>
          <div style={{color:"#ccc",fontSize:11,marginTop:4,fontWeight:"bold"}}>{doc.data.name}</div>
          <div style={{color:"#666",fontSize:10}}>{doc.data.cpf}</div>
        </div>
        <div style={{textAlign:"right",fontSize:10,flexShrink:0}}>
          {!doc.physicalReady && <div style={{color:"#886600"}}>⚙</div>}
          {doc.scanned  && <div style={{color:"#336633"}}>✓</div>}
          {doc.savedPath && <div style={{color:"#3355aa"}}>💾</div>}
        </div>
      </div>
    </div>
  );
}
