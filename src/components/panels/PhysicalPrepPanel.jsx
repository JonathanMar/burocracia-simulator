import { useState, useEffect } from 'react';
import { playSound } from '../../audio/sounds.js';

export default function PhysicalPrepPanel({ doc, onPrepared }) {
  const [grampoOk,  setGrampoOk]  = useState(!doc.hasGrampo);
  const [alignOk,   setAlignOk]   = useState(doc.aligned);
  useEffect(() => {
    if (grampoOk && alignOk) { const t = setTimeout(() => onPrepared(doc.id), 200); return () => clearTimeout(t); }
  }, [grampoOk, alignOk, doc.id, onPrepared]);
  return (
    <div style={{flexShrink:0,background:"#0e0e1c",border:"1px solid #cc880033",borderRadius:7,padding:11,fontFamily:"'Courier New',monospace",margin:"0 0 8px"}}>
      <div style={{color:"#cc8800",fontSize:10,marginBottom:9,letterSpacing:1}}>⚙ PREPARAÇÃO FÍSICA</div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {doc.hasGrampo && (
          <div style={{display:"flex",alignItems:"center",gap:10,background:grampoOk?"#0a180a":"#1a1000",border:`1px solid ${grampoOk?"#336633":"#664400"}`,borderRadius:5,padding:"7px 11px"}}>
            <span style={{fontSize:16}}>{grampoOk?"✅":"📎"}</span>
            <div style={{flex:1,color:grampoOk?"#55aa55":"#cc8800",fontSize:11}}>{grampoOk?"Grampo removido":"Documento grampeado — o scanner não aceita"}</div>
            {!grampoOk && <button onClick={()=>{playSound("staple_remove");setGrampoOk(true);}} style={{background:"#332200",border:"1px solid #cc8800",color:"#cc8800",padding:"3px 10px",borderRadius:3,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:11}}>Remover</button>}
          </div>
        )}
        {doc.misaligned && (
          <div style={{display:"flex",alignItems:"center",gap:10,background:alignOk?"#0a180a":"#181200",border:`1px solid ${alignOk?"#336633":"#887700"}`,borderRadius:5,padding:"7px 11px"}}>
            <span style={{fontSize:16}}>{alignOk?"✅":"📄"}</span>
            <div style={{flex:1,color:alignOk?"#55aa55":"#aaaa00",fontSize:11}}>{alignOk?"Folhas alinhadas":"Folhas desalinhadas — vai digitalizar torto"}</div>
            {!alignOk && <button onClick={()=>{playSound("align");setAlignOk(true);}} style={{background:"#221a00",border:"1px solid #aaaa00",color:"#aaaa00",padding:"3px 10px",borderRadius:3,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:11}}>Alinhar</button>}
          </div>
        )}
      </div>
      {grampoOk && alignOk && <div style={{color:"#55aa55",fontSize:10,marginTop:7,textAlign:"center"}}>✓ Pronto para digitalizar</div>}
    </div>
  );
}
