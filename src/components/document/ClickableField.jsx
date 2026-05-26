export default function ClickableField({ fieldId, label, value, side, selectedField, onFieldClick, suspicious }) {
  const isSelected = selectedField?.fieldId === fieldId;
  const isSameSide = selectedField?.side === side;
  const canCompare = selectedField && !isSameSide && selectedField.label === label;

  return (
    <div
      onClick={() => onFieldClick({ fieldId, label, value, side })}
      title={canCompare ? `Clique para comparar com "${selectedField.value}"` : `Clique para selecionar este campo`}
      style={{
        display:"flex", gap:8, marginBottom:7, cursor:"pointer",
        borderRadius:3, padding:"2px 4px", transition:"all 0.15s",
        background: isSelected ? "#2a2a10" : canCompare ? "#0a1a2a" : "transparent",
        outline: isSelected ? "1px solid #aaa900" : canCompare ? "1px solid #224466" : "none",
        position:"relative",
      }}
    >
      <span style={{color:"#aaa",fontSize:9,textTransform:"uppercase",letterSpacing:0.4,minWidth:70,paddingTop:3,flexShrink:0}}>{label}</span>
      <span style={{background:suspicious?"#1a1000":side==="ficha"?"#dde8f5":"#e5ddc8",border:`1px solid ${suspicious?"#664400":side==="ficha"?"#a0b8d8":"#c0aa88"}`,padding:"2px 6px",borderRadius:2,fontSize:12,fontWeight:"bold",color:suspicious?"#cc8800":"#111",flex:1,transition:"all 0.15s"}}>{value}</span>
      {suspicious && (<span style={{position:"absolute",top:-4,right:-4,fontSize:10,background:"#1a0800",borderRadius:"50%",width:16,height:16,display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid #664400"}}>🔖</span>)}
      {isSelected && (<span style={{position:"absolute",right:4,top:"50%",transform:"translateY(-50%)",color:"#aaa900",fontSize:10}}>← selecionado</span>)}
      {canCompare && (<span style={{position:"absolute",right:4,top:"50%",transform:"translateY(-50%)",color:"#446688",fontSize:10,animation:"blink 0.8s infinite"}}>comparar →</span>)}
    </div>
  );
}
