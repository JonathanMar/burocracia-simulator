import DocumentCard from '../game/DocumentCard.jsx';

export default function DocumentList({ pending, scannedUnsaved, saved, selectedDoc, onSelect, onOpenSave, now }) {
  return (
    <div style={{borderRight:"1px solid #0a0a14",padding:9,overflowY:"auto",background:"#050510",display:"flex",flexDirection:"column",gap:5}}>
      <div style={{color:"#99aacc",fontSize:9,letterSpacing:1,flexShrink:0}}>PENDENTES ({pending.length})</div>
      {pending.map(doc=>(
        <DocumentCard key={doc.id} doc={doc} selected={selectedDoc?.id===doc.id}
          onClick={()=>onSelect(doc)}
          now={now}/>
      ))}
      {scannedUnsaved.length>0&&(
        <>
          <div style={{color:"#6699cc",fontSize:9,marginTop:6,letterSpacing:1,flexShrink:0}}>AGUARDANDO SALVAR ({scannedUnsaved.length})</div>
          {scannedUnsaved.map(doc=>(
            <div key={doc.id} onClick={()=>onOpenSave(doc)} style={{background:"#050a14",border:"1px solid #1a2a44",borderRadius:4,padding:"7px 10px",cursor:"pointer"}}>
              <div style={{color:"#5588cc",fontSize:10}}>💾 {doc.type}</div>
              <div style={{color:"#bbb",fontSize:10}}>{doc.data.name}</div>
              <div style={{color:"#777",fontSize:9}}>clique para salvar</div>
            </div>
          ))}
        </>
      )}
      {saved>0&&(<div style={{color:"#55aa55",fontSize:9,marginTop:4}}>✓ {saved} salvo(s)</div>)}
    </div>
  );
}
