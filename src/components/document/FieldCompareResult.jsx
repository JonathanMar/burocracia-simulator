export default function FieldCompareResult({ first, second, onDismiss }) {
  if (!first || !second) return null;
  const same = first.value === second.value;
  return (
    <div style={{position:"fixed",bottom:80,left:"50%",transform:"translateX(-50%)",background:same?"#0a1a0a":"#1a0a0a",border:`1px solid ${same?"#336633":"#663333"}`,borderRadius:8,padding:"12px 20px",zIndex:400,fontFamily:"'Courier New',monospace",textAlign:"center",boxShadow:`0 0 20px ${same?"#33663322":"#66333322"}`,animation:"slideIn 0.2s ease",minWidth:320}}>
      <div style={{color:"#888",fontSize:10,marginBottom:6}}>COMPARAÇÃO DE CAMPOS</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:10,alignItems:"center",marginBottom:10}}>
        <div style={{background:"#0f0f1a",border:"1px solid #333",borderRadius:4,padding:"6px 10px"}}>
          <div style={{color:"#888",fontSize:9,marginBottom:2}}>{first.side.toUpperCase()}</div>
          <div style={{color:"#ddd",fontSize:11,fontWeight:"bold"}}>{first.label}</div>
          <div style={{color:"#bbb",fontSize:12,marginTop:2,fontFamily:"Georgia,serif"}}>{first.value}</div>
        </div>
        <div style={{fontSize:20}}>{same ? "=" : "≠"}</div>
        <div style={{background:"#0f0f1a",border:"1px solid #333",borderRadius:4,padding:"6px 10px"}}>
          <div style={{color:"#888",fontSize:9,marginBottom:2}}>{second.side.toUpperCase()}</div>
          <div style={{color:"#ddd",fontSize:11,fontWeight:"bold"}}>{second.label}</div>
          <div style={{color:"#bbb",fontSize:12,marginTop:2,fontFamily:"Georgia,serif"}}>{second.value}</div>
        </div>
      </div>
      <div style={{color:same?"#55aa55":"#cc5555",fontSize:13,fontWeight:"bold",marginBottom:8}}>{same?"✓ Valores coincidem":"≠ Valores divergem"}</div>
      <div style={{color:"#666",fontSize:10,marginBottom:10}}>{same?"Estes dois campos têm o mesmo conteúdo.":"Estes dois campos têm conteúdo diferente — avalie se é relevante."}</div>
      <button onClick={onDismiss} style={{background:"transparent",border:"1px solid #444",color:"#777",padding:"4px 16px",borderRadius:3,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:11}}>Fechar</button>
    </div>
  );
}
