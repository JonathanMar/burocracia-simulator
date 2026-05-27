import { useState } from 'react';

const BRIBE_AMOUNTS = [80, 100, 120, 150, 200];

export default function BriberyModal({ onAccept, onRefuse }) {
  const [amount] = useState(() => BRIBE_AMOUNTS[Math.floor(Math.random() * BRIBE_AMOUNTS.length)]);
  const [decision, setDecision] = useState(null);

  function accept() {
    setDecision('accept');
    setTimeout(() => onAccept(amount), 700);
  }
  function refuse() {
    setDecision('refuse');
    setTimeout(() => onRefuse(), 600);
  }

  return (
    <div style={{
      position:"fixed",inset:0,background:"#000000dd",
      display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,
    }}>
      <div style={{
        background:"#0a0800",border:"1px solid #443300",borderRadius:10,
        padding:28,maxWidth:380,width:"90%",fontFamily:"'Courier New',monospace",
        animation:"slideIn 0.3s ease",position:"relative",overflow:"hidden",
      }}>
        {/* Decision flash overlay */}
        {decision && (
          <div style={{
            position:"absolute",inset:0,zIndex:10,borderRadius:10,
            background: decision==="accept" ? "#002200ee" : "#110000ee",
            display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8,
          }}>
            <div style={{fontSize:36}}>{decision==="accept" ? "💰" : "🚫"}</div>
            <div style={{color:decision==="accept"?"#55cc55":"#888",fontSize:13,fontWeight:"bold"}}>
              {decision==="accept" ? `R$ ${amount},00 aceitos` : "Envelope recusado"}
            </div>
            <div style={{color:"#666",fontSize:10}}>
              {decision==="accept" ? "A corrupção fica registrada." : "Sua integridade foi mantida."}
            </div>
          </div>
        )}

        <div style={{fontSize:36,textAlign:"center",marginBottom:10}}>💰</div>
        <div style={{color:"#cc9900",fontSize:13,fontWeight:"bold",textAlign:"center",letterSpacing:1,marginBottom:6}}>
          ENVELOPE SUSPEITO
        </div>
        <div style={{color:"#888",fontSize:10,textAlign:"center",marginBottom:18,lineHeight:1.7}}>
          Um envelope foi deixado junto ao próximo documento.
        </div>

        <div style={{
          background:"#0f0a00",border:"1px solid #554400",borderRadius:6,
          padding:"14px 20px",marginBottom:20,textAlign:"center",
        }}>
          <div style={{color:"#666",fontSize:9,marginBottom:4}}>CONTEÚDO ENCONTRADO</div>
          <div style={{color:"#ffcc00",fontSize:28,fontWeight:"bold"}}>R$ {amount},00</div>
          <div style={{color:"#554400",fontSize:9,marginTop:4}}>em espécie, não rastreável</div>
        </div>

        <div style={{
          background:"#0a0a00",border:"1px solid #333300",borderRadius:4,
          padding:"8px 12px",marginBottom:18,fontSize:10,color:"#666",lineHeight:1.6,
        }}>
          <div style={{color:"#aa8800",marginBottom:4,fontSize:9,letterSpacing:0.5}}>CONSEQUÊNCIAS:</div>
          <div>✓ Aceitar: <span style={{color:"#55cc55"}}>+{amount} pts</span> imediatos, mas <span style={{color:"#cc4444"}}>corrupção registrada</span></div>
          <div>✓ Recusar: sem pts extras, mas <span style={{color:"#4488ff"}}>integridade mantida</span></div>
          <div style={{color:"#553333",marginTop:4,fontSize:9}}>⚠ 3 registros de corrupção = auditoria no game over</div>
        </div>

        <div style={{display:"flex",gap:10}}>
          <button onClick={accept} style={{
            flex:1,padding:"11px 0",background:"#1a1200",
            border:"1px solid #665500",color:"#ffcc44",
            borderRadius:5,cursor:"pointer",fontFamily:"'Courier New',monospace",
            fontSize:12,fontWeight:"bold",
          }}>
            💰 ACEITAR
          </button>
          <button onClick={refuse} style={{
            flex:1,padding:"11px 0",background:"#0a0a18",
            border:"1px solid #334499",color:"#5577ff",
            borderRadius:5,cursor:"pointer",fontFamily:"'Courier New',monospace",
            fontSize:12,fontWeight:"bold",
          }}>
            🚫 RECUSAR
          </button>
        </div>
      </div>
    </div>
  );
}
