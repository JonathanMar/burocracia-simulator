import { useState } from 'react';
import { ACHIEVEMENTS } from '../../constants/achievements.js';
import { ISSUE_EXPLANATIONS } from '../../constants/game.js';

function GameOverReviewModal({ wrongDocs, onClose }) {
  if (wrongDocs.length === 0) return null;
  return (
    <div style={{position:"fixed",inset:0,background:"#000000dd",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}}>
      <div style={{background:"#0a0a18",border:"1px solid #2a1a1a",borderRadius:9,padding:24,maxWidth:500,width:"90%",maxHeight:"80vh",overflow:"auto",fontFamily:"'Courier New',monospace",animation:"slideIn 0.3s ease"}}>
        <div style={{color:"#aa4444",fontSize:10,letterSpacing:2,marginBottom:14}}>🔍 REVISÃO DE ERROS — O QUE ACONTECEU</div>
        {wrongDocs.map((doc, i) => (
          <div key={i} style={{background:"#0f0a0a",border:"1px solid #2a1a1a",borderRadius:6,padding:"12px 14px",marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <span style={{color:"#7799bb",fontSize:11,fontWeight:"bold"}}>{doc.type} — {doc.data.name}</span>
              <span style={{fontSize:10,background:doc.decision==="approved_wrong"?"#2a0a0a":"#1a0000",border:`1px solid ${doc.decision==="approved_wrong"?"#663333":"#441111"}`,color:doc.decision==="approved_wrong"?"#cc5555":"#aa3333",padding:"2px 8px",borderRadius:3}}>
                {doc.decision==="approved_wrong"?"Aprovado c/ erro":"Rejeitado indevidamente"}
              </span>
            </div>

            {doc.decision === "approved_wrong" && doc.issues.length > 0 ? (
              <div>
                <div style={{color:"#666",fontSize:9,marginBottom:6,letterSpacing:0.5}}>O QUE ESTAVA ERRADO:</div>
                {doc.issues.map(iss => (
                  <div key={iss} style={{marginBottom:6,paddingLeft:8,borderLeft:"2px solid #664422"}}>
                    <div style={{color:"#cc7744",fontSize:11,fontWeight:"bold"}}>• {iss}</div>
                    {ISSUE_EXPLANATIONS[iss] && (
                      <div style={{color:"#888",fontSize:10,marginTop:2,lineHeight:1.5}}>
                        ↳ {ISSUE_EXPLANATIONS[iss]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{paddingLeft:8,borderLeft:"2px solid #224422"}}>
                <div style={{color:"#55aa55",fontSize:11,fontWeight:"bold"}}>• Documento era completamente válido</div>
                <div style={{color:"#888",fontSize:10,marginTop:2,lineHeight:1.5}}>
                  ↳ Não havia erros — você deveria ter aprovado e digitalizado.
                </div>
              </div>
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

export default function GameOverReviewWrapper({ wrongDocs, grade, gc, score, stats, unlocked, onStartGame, onMenu, onEndless }) {
  const [showReview, setShowReview] = useState(false);
  const quoteMap = {
    D:'"Você está despedido." — Sr. Figueiredo',
    C:'"Precisa melhorar muito." — Sr. Figueiredo',
    B:'"Aceitável. Por hoje." — Sr. Figueiredo',
    A:'"Bom trabalho. Sem aumento." — Sr. Figueiredo',
    S:'"...Quem é você?" — Sr. Figueiredo',
  };
  const salaryBase = { S: 4200, A: 3100, B: 2300, C: 1500, D: 0 }[grade];
  const salaryDeductions = stats.errors * 28 + (stats.wrongFolders || 0) * 15;
  const salaryFinal = Math.max(0, salaryBase - salaryDeductions);

  // Endless available for everyone — it's the natural continuation
  const canEndless = true;

  return (
    <div style={{textAlign:"center",maxWidth:480,padding:40}}>
      {showReview && <GameOverReviewModal wrongDocs={wrongDocs} onClose={()=>setShowReview(false)}/>}
      <div style={{fontSize:48,marginBottom:10}}>⏰</div>
      <div style={{fontSize:20,color:"#aa3333",fontWeight:"bold",letterSpacing:3,marginBottom:6}}>FIM DO EXPEDIENTE</div>
      <div style={{color:"#777",fontSize:11,marginBottom:22}}>{quoteMap[grade]}</div>
      <div style={{background:"#080812",border:"1px solid #1a1a2e",borderRadius:8,padding:20,marginBottom:18}}>
        <div style={{color:gc,fontSize:44,fontWeight:"bold",marginBottom:4}}>{grade}</div>
        <div style={{color:"#aa8800",fontSize:24,fontWeight:"bold",marginBottom:8}}>{score} pts</div>

        {/* Holerite */}
        <div style={{background:"#0a0a08",border:`1px solid ${salaryFinal>0?"#336633":"#663333"}`,borderRadius:5,padding:"10px 16px",marginBottom:14}}>
          <div style={{color:"#666",fontSize:9,letterSpacing:1,marginBottom:6}}>💰 HOLERITE — DIGITALIZAÇÕES INFERNAIS LTDA.</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:"4px 12px",fontSize:10}}>
            <span style={{color:"#777",textAlign:"left"}}>Salário base ({grade})</span>
            <span style={{color:"#55aa55"}}>R$ {salaryBase.toLocaleString('pt-BR')},00</span>
            {salaryDeductions > 0 && <>
              <span style={{color:"#777",textAlign:"left"}}>Descontos ({stats.errors} erro{stats.errors!==1?"s":""})</span>
              <span style={{color:"#cc5555"}}>-R$ {salaryDeductions.toLocaleString('pt-BR')},00</span>
            </>}
            <span style={{color:"#999",textAlign:"left",borderTop:"1px solid #222",paddingTop:4}}>Total líquido</span>
            <span style={{color:salaryFinal>0?"#ffcc00":"#cc3333",fontWeight:"bold",borderTop:"1px solid #222",paddingTop:4}}>R$ {salaryFinal.toLocaleString('pt-BR')},00</span>
          </div>
          {salaryFinal === 0 && <div style={{color:"#cc3333",fontSize:10,marginTop:6}}>⚠ Salário zerado. Você deve à empresa.</div>}
        </div>

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
          <button onClick={()=>setShowReview(true)} style={{background:"#1a0a0a",border:"1px solid #663333",color:"#cc6666",padding:"8px 16px",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:11,width:"100%"}}>
            🔍 Entender {wrongDocs.length} erro{wrongDocs.length!==1?"s":""}  que cometi
          </button>
        )}
      </div>

      <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
        <button onClick={()=>onStartGame(false)} style={{background:"#aa3333",border:"none",color:"#fff",padding:"10px 22px",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:13,fontWeight:"bold",letterSpacing:1}}>↺ DE NOVO</button>
        {onEndless && (
          <button onClick={onEndless} style={{background:"#1a4a1a",border:"1px solid #336633",color:"#55cc55",padding:"10px 22px",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:12,fontWeight:"bold"}}>▶ MODO ENDLESS</button>
        )}
        <button onClick={onMenu} style={{background:"#1a1a2e",border:"1px solid #333",color:"#888",padding:"10px 22px",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:12}}>Menu</button>
      </div>
    </div>
  );
}
