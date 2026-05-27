export default function FieldCompareResult({ first, second, onDismiss, onCite }) {
  if (!first || !second) return null;
  const same = first.value === second.value;
  return (
    <div style={{
      position:"fixed",bottom:80,left:"50%",transform:"translateX(-50%)",
      background:same?"#0a1a0a":"#1a0800",
      border:`1px solid ${same?"#336633":"#663300"}`,
      borderRadius:8,padding:"12px 20px",zIndex:400,
      fontFamily:"'Courier New',monospace",textAlign:"center",
      boxShadow:`0 0 20px ${same?"#33663322":"#66330022"}`,
      animation:"slideIn 0.2s ease",minWidth:340,
    }}>
      <div style={{color:"#888",fontSize:10,marginBottom:6}}>COMPARAÇÃO DE CAMPOS</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:10,alignItems:"center",marginBottom:10}}>
        <div style={{background:"#0f0f1a",border:"1px solid #333",borderRadius:4,padding:"6px 10px"}}>
          <div style={{color:"#888",fontSize:9,marginBottom:2}}>{first.side.toUpperCase()}</div>
          <div style={{color:"#ddd",fontSize:11,fontWeight:"bold"}}>{first.label}</div>
          <div style={{color:"#bbb",fontSize:12,marginTop:2,fontFamily:"Georgia,serif"}}>{first.value}</div>
        </div>
        <div style={{fontSize:20,color:same?"#55aa55":"#cc5500"}}>{same ? "=" : "≠"}</div>
        <div style={{background:"#0f0f1a",border:"1px solid #333",borderRadius:4,padding:"6px 10px"}}>
          <div style={{color:"#888",fontSize:9,marginBottom:2}}>{second.side.toUpperCase()}</div>
          <div style={{color:"#ddd",fontSize:11,fontWeight:"bold"}}>{second.label}</div>
          <div style={{color:"#bbb",fontSize:12,marginTop:2,fontFamily:"Georgia,serif"}}>{second.value}</div>
        </div>
      </div>
      <div style={{color:same?"#55aa55":"#ff7744",fontSize:13,fontWeight:"bold",marginBottom:4}}>
        {same ? "✓ Valores coincidem" : "≠ Valores DIVERGEM"}
      </div>
      <div style={{color:"#666",fontSize:10,marginBottom:12}}>
        {same
          ? "Estes dois campos têm o mesmo conteúdo."
          : "Estes campos têm conteúdo diferente. Você pode citar oficialmente como discrepância."}
      </div>
      <div style={{display:"flex",gap:8,justifyContent:"center"}}>
        {!same && onCite && (
          <button
            onClick={onCite}
            style={{
              background:"#2a0a00",border:"1px solid #cc4400",color:"#ff7744",
              padding:"5px 16px",borderRadius:3,cursor:"pointer",
              fontFamily:"'Courier New',monospace",fontSize:11,fontWeight:"bold",
            }}
          >
            ⚑ Citar discrepância
          </button>
        )}
        <button
          onClick={onDismiss}
          style={{background:"transparent",border:"1px solid #444",color:"#777",padding:"5px 16px",borderRadius:3,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:11}}
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
