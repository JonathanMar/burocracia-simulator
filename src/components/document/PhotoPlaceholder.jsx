export default function PhotoPlaceholder({ mismatch=false }) {
  return (
    <div style={{width:52,height:64,border:`1px solid ${mismatch?"#cc6600":"#c0aa88"}`,background:mismatch?"#fff4e0":"#f0ece0",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,flexShrink:0,borderRadius:1,position:"relative"}}>
      <div style={{fontSize:20}}>{mismatch?"❓":"👤"}</div>
      <div style={{fontSize:7,color:mismatch?"#cc6600":"#aaa",textAlign:"center",lineHeight:1.2}}>{mismatch?"FOTO\nSUSPEITA":"3x4"}</div>
      {mismatch && (<div style={{position:"absolute",top:-5,right:-5,background:"#cc6600",color:"#fff",fontSize:8,borderRadius:"50%",width:14,height:14,display:"flex",alignItems:"center",justifyContent:"center"}}>⚠</div>)}
    </div>
  );
}
