export default function DecisionLog({ decisions }) {
  if (decisions.length === 0) return null;
  return (
    <div style={{position:"fixed",bottom:18,left:18,display:"flex",flexDirection:"column",gap:4,zIndex:200,pointerEvents:"none"}}>
      <div style={{color:"#778",fontSize:9,letterSpacing:1,marginBottom:2}}>ÚLTIMAS AÇÕES</div>
      {decisions.map((d,i) => (
        <div key={d.id} style={{background:"#08080f",border:`1px solid ${d.color}44`,borderRadius:4,padding:"4px 10px",fontFamily:"'Courier New',monospace",fontSize:10,color:d.color,opacity:0.4+(i*0.3),animation:"slideIn 0.2s ease"}}>
          {d.icon} {d.text}
        </div>
      ))}
    </div>
  );
}
