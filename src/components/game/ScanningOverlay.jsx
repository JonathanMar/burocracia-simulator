export default function ScanningOverlay({ scanning }) {
  if (!scanning) return null;
  return (
    <div style={{position:"fixed",inset:0,background:"#000000bb",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
      <div style={{background:"#0a0a18",border:"1px solid #3366aa",borderRadius:10,padding:"24px 32px",fontFamily:"'Courier New',monospace",textAlign:"center",minWidth:280}}>
        <div style={{fontSize:36,marginBottom:10,animation:"blink 0.4s infinite"}}>🖨️</div>
        <div style={{color:"#6a9eff",fontSize:12,marginBottom:14,letterSpacing:1}}>DIGITALIZANDO...</div>
        <div style={{height:8,background:"#111",borderRadius:4,overflow:"hidden",marginBottom:10}}>
          <div style={{height:"100%",width:`${scanning.progress}%`,background:"linear-gradient(90deg,#2244aa,#4488ff)",borderRadius:4,transition:"width 0.08s linear",boxShadow:"0 0 8px #4488ff66"}}/>
        </div>
        <div style={{color:"#5577aa",fontSize:10}}>{scanning.doc.type} — {scanning.doc.data.name}</div>
        <div style={{color:"#444",fontSize:9,marginTop:4}}>{Math.round(scanning.progress)}%</div>
      </div>
    </div>
  );
}
