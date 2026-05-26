export default function DocSheet({ children, headerColor="#7a1515", bg="#f4efe6", borderCol="#c0aa88", title, subtitle, seal }) {
  return (
    <div style={{background:bg,border:`1px solid ${borderCol}`,borderRadius:3,padding:"12px 14px",fontFamily:"Georgia,serif",color:"#1a1a1a",boxShadow:"2px 4px 10px #00000028",fontSize:11,position:"relative"}}>
      <div style={{borderBottom:`2px solid ${headerColor}`,paddingBottom:6,marginBottom:9}}>
        <div style={{fontSize:12,fontWeight:"bold",color:headerColor,letterSpacing:0.8}}>{title}</div>
        {subtitle && <div style={{fontSize:9,color:"#777",marginTop:2}}>{subtitle}</div>}
      </div>
      {seal && <div style={{position:"absolute",top:10,right:12,fontSize:20,opacity:0.3}}>{seal}</div>}
      {children}
    </div>
  );
}
