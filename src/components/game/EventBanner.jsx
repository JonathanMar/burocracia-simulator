export default function EventBanner({ event, onColleagueAccept, onColleagueDecline }) {
  if (!event) return null;
  const isColleague = event.effect === "colleague";
  return (
    <div style={{position:"fixed",top:58,left:"50%",transform:"translateX(-50%)",background:"#130820",border:"1px solid #7744aa",borderRadius:8,padding:"11px 20px",zIndex:150,fontFamily:"'Courier New',monospace",maxWidth:420,textAlign:"center",boxShadow:"0 0 20px #7744aa33",animation:"slideIn 0.3s ease"}}>
      <div style={{fontSize:26,marginBottom:3}}>{event.emoji}</div>
      <div style={{color:"#cc99ff",fontWeight:"bold",fontSize:12,marginBottom:3}}>{event.title}</div>
      <div style={{color:"#999",fontSize:10,marginBottom:isColleague?10:0}}>{event.desc}</div>
      {isColleague && (
        <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:8}}>
          <button onClick={onColleagueAccept} style={{background:"#0a2a0a",border:"1px solid #336633",color:"#55aa55",padding:"5px 14px",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:11}}>Aceitar (+15s)</button>
          <button onClick={onColleagueDecline} style={{background:"#1a0a0a",border:"1px solid #554444",color:"#776666",padding:"5px 14px",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:11}}>Recusar</button>
        </div>
      )}
    </div>
  );
}
