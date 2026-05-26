export default function Toast({ messages }) {
  return (
    <div style={{position:"fixed",bottom:18,right:18,display:"flex",flexDirection:"column-reverse",gap:5,zIndex:300,pointerEvents:"none"}}>
      {messages.map(m=>(
        <div key={m.id} style={{background:m.type==="error"?"#1c0808":m.type==="success"?"#081808":m.type==="achievement"?"#1a1200":"#080818",border:`1px solid ${m.type==="error"?"#883333":m.type==="success"?"#338833":m.type==="achievement"?"#aa8800":"#334488"}`,color:m.type==="error"?"#cc5555":m.type==="success"?"#55aa55":m.type==="achievement"?"#ffcc00":"#5577cc",padding:"6px 11px",borderRadius:5,fontFamily:"'Courier New',monospace",fontSize:11,animation:"slideIn 0.2s ease",maxWidth:300}}>{m.text}</div>
      ))}
    </div>
  );
}
