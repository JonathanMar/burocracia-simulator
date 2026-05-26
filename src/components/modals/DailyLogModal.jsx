import { p2 } from '../../game/docGenerator.js';

export default function DailyLogModal({ stats, level, score, timeLeft, onClose }) {
  const grade = score>800?"S":score>500?"A":score>300?"B":score>150?"C":"D";
  const gc = {S:"#ffcc00",A:"#44bb44",B:"#4488ff",C:"#dd8800",D:"#dd4444"}[grade];
  const lines = [
    `> RELATÓRIO DIÁRIO — DIA ${level}`,`> =============================`,
    `> Aprovados corretamente:  ${stats.approved}`,
    `> Rejeitados corretamente: ${stats.correctRejections||0}`,
    `> Erros cometidos:         ${stats.errors}`,
    `> Pastas erradas:          ${stats.wrongFolders||0}`,
    `> Tapinhas na impressora:  ${stats.taps||0}`,
    `> Campos comparados:       ${stats.fieldsCompared||0}`,
    `> =============================`,
    `> Pontuação do dia: ${score} pts`,
    `> Nota: ${grade}`,`> Tempo restante: ${p2(Math.floor(timeLeft/60))}:${p2(timeLeft%60)}`,
    `> =============================`,
    grade==="D"?`> STATUS: AVISO FORMAL EMITIDO`:grade==="C"?`> STATUS: DESEMPENHO INSUFICIENTE`:grade==="B"?`> STATUS: DENTRO DO ESPERADO`:grade==="A"?`> STATUS: PARABÉNS (quase)`:"> STATUS: EXCEPCIONAL. Suspeito.",
  ];
  // Day 5 is the final day of the main campaign — show a special victory banner
  const isVictoryDay = level === 5;
  return (
    <div style={{position:"fixed",inset:0,background:"#000000ee",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>
      <div style={{background:"#050510",border:"1px solid #1a2a1a",borderRadius:8,padding:24,maxWidth:440,width:"90%",fontFamily:"'Courier New',monospace"}}>
        {isVictoryDay ? (
          <div style={{background:"#0a1400",border:"1px solid #336600",borderRadius:6,padding:"12px 14px",marginBottom:14,textAlign:"center"}}>
            <div style={{fontSize:28,marginBottom:6}}>🏆</div>
            <div style={{color:"#88ff44",fontSize:13,fontWeight:"bold",marginBottom:4}}>CAMPANHA CONCLUÍDA!</div>
            <div style={{color:"#66aa33",fontSize:10,lineHeight:1.7}}>
              Você sobreviveu aos 5 dias de expediente.<br/>
              Contrato renovado. Por enquanto.<br/>
              <span style={{color:"#44cc44"}}>➜ Modo Endless disponível no Game Over!</span>
            </div>
          </div>
        ) : (
          <div style={{color:"#336633",fontSize:10,marginBottom:12,letterSpacing:1}}>📊 FIM DO DIA — RELATÓRIO GERADO</div>
        )}
        <div style={{background:"#020a02",border:"1px solid #0a1a0a",borderRadius:4,padding:14,marginBottom:16,fontSize:11,lineHeight:1.9}}>
          {lines.map((l,i)=><div key={i} style={{color:l.includes("Nota")||l.includes("Pontuação")||l.includes("STATUS")?gc:"#336633"}}>{l}</div>)}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{color:gc,fontSize:22,fontWeight:"bold"}}>{grade}</div>
          <button onClick={onClose} style={{background:"#0a1a0a",border:"1px solid #336633",color:"#55aa55",padding:"8px 22px",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:12,fontWeight:"bold"}}>{isVictoryDay ? "Ver resultado final ▶" : "Próximo dia ▶"}</button>
        </div>
      </div>
    </div>
  );
}
