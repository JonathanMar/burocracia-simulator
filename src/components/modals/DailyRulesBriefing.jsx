import { DAY_RULES, MEMORANDOS } from '../../constants/story.js';

// Fictional personal expenses for stakes
const PERSONAL_EXPENSES = [
  { label: "Aluguel (vence sexta)",     amount: 780 },
  { label: "Plano de saúde",            amount: 190 },
  { label: "Mercado — semana",          amount: 340 },
];

function getTotalExpenses() {
  return PERSONAL_EXPENSES.reduce((a, e) => a + e.amount, 0);
}

function getSaldo(day) {
  // Saldo decreases each day to create tension
  const base = 980;
  return Math.max(0, base - (day - 1) * 180);
}

export default function DailyRulesBriefing({ day, onClose }) {
  const rules = DAY_RULES[Math.min(day, 8)] || DAY_RULES[5];
  // Find the memorando for today (if any) — this is the "new rule"
  const todayMemo = MEMORANDOS.find(m => m.day === day);
  const saldo = getSaldo(day);
  const total = getTotalExpenses();
  const deficit = total - saldo;

  return (
    <div style={{position:"fixed",inset:0,background:"#000000cc",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>
      <div style={{
        background:"#0a0a18",border:"1px solid #2a3a1a",borderRadius:9,
        padding:24,maxWidth:430,width:"90%",fontFamily:"'Courier New',monospace",
        animation:"slideIn 0.3s ease",maxHeight:"88vh",overflow:"auto",
      }}>
        <div style={{color:"#558855",fontSize:10,letterSpacing:2,marginBottom:14}}>📋 REGRAS ATIVAS — DIA {day}</div>

        {/* ⚠ NEW RULE banner if today has a memorando */}
        {todayMemo && (
          <div style={{
            background:"#1a0800",border:"2px solid #cc5500",borderRadius:6,
            padding:"10px 14px",marginBottom:14,
          }}>
            <div style={{color:"#ff7700",fontSize:9,letterSpacing:1,marginBottom:5,fontWeight:"bold"}}>
              ⚠ NOVA REGRA HOJE — LEIA COM ATENÇÃO
            </div>
            <div style={{color:"#ffbb66",fontSize:11,lineHeight:1.6}}>{todayMemo.text}</div>
          </div>
        )}

        {/* Rules list */}
        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:18}}>
          {rules.map((r,i) => (
            <div key={i} style={{
              display:"flex",gap:10,alignItems:"flex-start",
              background:r.startsWith("⚠")?"#1a1200":"#0a0a12",
              border:`1px solid ${r.startsWith("⚠")?"#554400":"#1a1a2e"}`,
              borderRadius:5,padding:"8px 12px",
            }}>
              <span style={{fontSize:14,flexShrink:0,color:r.startsWith("⚠")?"#cc8800":"#336633"}}>
                {r.startsWith("⚠") ? "⚠" : "✓"}
              </span>
              <span style={{color:r.startsWith("⚠")?"#aa8800":"#558855",fontSize:11,lineHeight:1.5}}>
                {r.replace("⚠ ","")}
              </span>
            </div>
          ))}
        </div>

        {/* Personal finances / stakes */}
        <div style={{
          background:"#0a0800",border:`1px solid ${deficit>0?"#553300":"#1a2a1a"}`,
          borderRadius:6,padding:"10px 14px",marginBottom:18,
        }}>
          <div style={{color:"#664422",fontSize:9,letterSpacing:1,marginBottom:8}}>💰 SUAS CONTAS — ESTA SEMANA</div>
          {PERSONAL_EXPENSES.map((e,i) => (
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",fontSize:10}}>
              <span style={{color:"#666"}}>{e.label}</span>
              <span style={{color:"#cc8844"}}>R$ {e.amount.toLocaleString('pt-BR')},00</span>
            </div>
          ))}
          <div style={{borderTop:"1px solid #222",marginTop:6,paddingTop:6,display:"flex",justifyContent:"space-between"}}>
            <span style={{color:"#555",fontSize:10}}>Saldo atual</span>
            <span style={{color:saldo>=total?"#55aa55":"#cc4444",fontSize:11,fontWeight:"bold"}}>
              R$ {saldo.toLocaleString('pt-BR')},00
            </span>
          </div>
          {deficit > 0 ? (
            <div style={{color:"#cc3333",fontSize:9,marginTop:4,textAlign:"right"}}>
              ⚠ Faltam R$ {deficit},00 — não erre hoje.
            </div>
          ) : (
            <div style={{color:"#446644",fontSize:9,marginTop:4,textAlign:"right"}}>
              ✓ Saldo suficiente — mas não relaxe.
            </div>
          )}
        </div>

        <div style={{display:"flex",justifyContent:"flex-end"}}>
          <button onClick={onClose} style={{
            background:"#224422",border:"1px solid #336633",color:"#55aa55",
            padding:"8px 22px",borderRadius:4,cursor:"pointer",
            fontFamily:"'Courier New',monospace",fontSize:12,fontWeight:"bold",
          }}>
            Entendido ▶
          </button>
        </div>
      </div>
    </div>
  );
}
