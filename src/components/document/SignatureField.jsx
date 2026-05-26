export default function SignatureField({ path, label="Assinatura", missing=false }) {
  return (
    <div style={{marginTop:8,borderTop:"1px dashed #c0aa88",paddingTop:6}}>
      <div style={{fontSize:8,color:"#999",marginBottom:2}}>{label}</div>
      {missing ? (
        <div style={{height:28,background:"#fff8e0",border:"1px dashed #cc8800",borderRadius:2,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <span style={{color:"#cc6600",fontSize:10,fontWeight:"bold"}}>⚠ ASSINATURA AUSENTE</span>
        </div>
      ) : (
        <svg width="120" height="35" style={{display:"block",overflow:"visible"}}>
          <path d={path} stroke="#1a3080" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  );
}
