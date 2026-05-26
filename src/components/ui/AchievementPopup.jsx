export default function AchievementPopup({ achievement }) {
  if (!achievement) return null;
  return (
    <div style={{position:"fixed",top:18,right:18,background:"#1a1200",border:"1px solid #aa8800",borderRadius:8,padding:"12px 16px",zIndex:250,fontFamily:"'Courier New',monospace",animation:"slideIn 0.3s ease",boxShadow:"0 0 20px #aa880044"}}>
      <div style={{color:"#aa8800",fontSize:9,letterSpacing:1,marginBottom:3}}>🏆 CONQUISTA DESBLOQUEADA</div>
      <div style={{color:"#ffcc00",fontSize:13,fontWeight:"bold"}}>{achievement.emoji} {achievement.label}</div>
      <div style={{color:"#886600",fontSize:10,marginTop:2}}>{achievement.desc}</div>
    </div>
  );
}
