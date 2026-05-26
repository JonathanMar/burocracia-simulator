export default function DocTooltip({ doc, visible }) {
  if (!visible || !doc) return null;
  return (
    <div style={{position:"fixed",left:228,top:120,background:"#0c0c1e",border:"1px solid #2a2a3e",borderRadius:6,padding:"10px 14px",zIndex:400,fontFamily:"'Courier New',monospace",pointerEvents:"none",minWidth:200,boxShadow:"0 4px 16px #00000066",animation:"slideIn 0.15s ease"}}>
      <div style={{color:"#6688bb",fontSize:10,fontWeight:"bold",marginBottom:6}}>{doc.type} — prévia</div>
      {[["Nome",doc.data.name],["CPF",doc.data.cpf],["Cidade",doc.data.city],["Validade",doc.data.expiryDate]].map(([l,v])=>(
        <div key={l} style={{display:"flex",gap:8,marginBottom:3}}>
          <span style={{color:"#666",fontSize:9,minWidth:50}}>{l}</span>
          <span style={{color:"#999",fontSize:10}}>{v}</span>
        </div>
      ))}
      {!doc.physicalReady && <div style={{color:"#886600",fontSize:9,marginTop:5,borderTop:"1px solid #1a1a2e",paddingTop:4}}>⚙ Precisa de preparação</div>}
      {doc.urgentDeadline && <div style={{color:"#cc3333",fontSize:9,marginTop:3,animation:"blink 0.8s infinite"}}>⏰ URGENTE</div>}
    </div>
  );
}
