import { useState } from 'react';
import { playSound } from '../../audio/sounds.js';
import DocumentVisual from '../document/DocumentVisual.jsx';
import FichaCadastral from '../document/FichaCadastral.jsx';
import FieldCompareResult from '../document/FieldCompareResult.jsx';

export default function InspectionPanel({ doc, onApprove, onReject, frozen, blackout, onFieldCompare, suspectedFields, onToggleSuspect }) {
  const [activePage, setActivePage]     = useState(1);
  const [notes, setNotes]               = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [compareResult, setCompareResult] = useState(null);

  // Reset on doc change - use useEffect from React (imported in parent but need it here)
  // We'll use a key-based reset via the parent instead, but for safety use a useState pattern
  const [lastDocId, setLastDocId] = useState(doc?.id);
  if (doc?.id !== lastDocId) {
    setLastDocId(doc?.id);
    setActivePage(1);
    setNotes([]);
    setSelectedField(null);
    setCompareResult(null);
  }

  function handleFieldClick(field) {
    playSound("click_field", 0.5);
    if (!selectedField) {
      setSelectedField(field);
      return;
    }
    if (selectedField.side === field.side) {
      setSelectedField(field);
      return;
    }
    if (selectedField.label !== field.label) {
      setSelectedField(field);
      return;
    }
    const same = selectedField.value === field.value;
    playSound(same ? "match_ok" : "match_diff", 0.7);
    setCompareResult({ first: selectedField, second: field });
    setSelectedField(null);
    onFieldCompare();
  }

  if (!doc) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",flexDirection:"column",gap:12,padding:20}}>
      <div style={{fontSize:44,opacity:0.12}}>📋</div>
      <div style={{fontFamily:"'Courier New',monospace",fontSize:13,color:"#777",textAlign:"center"}}>Selecione um documento para inspecionar</div>
      <div style={{fontFamily:"'Courier New',monospace",fontSize:11,color:"#555",textAlign:"center",maxWidth:280,lineHeight:1.7}}>Compare manualmente os campos entre o documento e a ficha cadastral — clique nos campos para comparar valores</div>
    </div>
  );

  const hasMulti  = doc.expectedPages > 1;
  const canAct    = !frozen && !blackout;
  const canApprove = doc.physicalReady && canAct;

  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",fontFamily:"'Courier New',monospace",gap:0,position:"relative"}}>

      {/* Freeze / Blackout overlay */}
      {(frozen || blackout) && (
        <div style={{position:"absolute",inset:0,background:blackout?"#000000f0":"#00000099",zIndex:20,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:8,transition:"background 0.3s"}}>
          {blackout
            ? <div style={{color:"#ffffffcc",textAlign:"center",animation:"blink 0.8s infinite"}}><div style={{fontSize:36,marginBottom:8}}>🌑</div><div style={{fontSize:13}}>QUEDA DE ENERGIA</div></div>
            : <div style={{color:"#5a8fff",textAlign:"center"}}><div style={{fontSize:30,marginBottom:8}}>🔒</div><div style={{fontSize:13}}>PC TRAVADO</div></div>}
        </div>
      )}

      {/* Header */}
      <div style={{flexShrink:0,padding:"10px 14px 8px",borderBottom:"1px solid #0f0f1a",display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
        <span style={{background:"#1a2a4a",border:"1px solid #2a4a6a",color:"#6a9eff",padding:"2px 8px",borderRadius:3,fontSize:11}}>DOC #{doc.id}</span>
        <span style={{color:"#999",fontSize:12}}>{doc.type}</span>
        {doc.urgentDeadline && Date.now()<doc.urgentDeadline && (
          <span style={{color:"#ff5555",fontSize:10,background:"#300000",border:"1px solid #ff333355",padding:"1px 6px",borderRadius:3,animation:"blink 0.8s infinite"}}>🔴 URGENTE</span>
        )}
        {!doc.physicalReady && (
          <span style={{color:"#cc8800",fontSize:10,background:"#221800",border:"1px solid #cc880033",padding:"1px 6px",borderRadius:3}}>⚙ Prepare antes de digitalizar</span>
        )}
        {hasMulti && (
          <div style={{marginLeft:"auto",display:"flex",gap:5}}>
            {[1,2].map(p=>(
              <button key={p} onClick={()=>setActivePage(p)} style={{background:activePage===p?"#1a2a4a":"transparent",border:`1px solid ${activePage===p?"#4a9eff":"#333"}`,color:activePage===p?"#6a9eff":"#777",padding:"3px 10px",borderRadius:3,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:11}}>Pág {p}</button>
            ))}
          </div>
        )}
      </div>

      {/* Compare hint */}
      {selectedField && (
        <div style={{flexShrink:0,background:"#1a1a08",borderBottom:"1px solid #333300",padding:"6px 14px",display:"flex",alignItems:"center",gap:10}}>
          <span style={{color:"#aaaa00",fontSize:10}}>🖱️ Campo selecionado:</span>
          <span style={{color:"#dddd44",fontSize:11,fontWeight:"bold"}}>{selectedField.label}</span>
          <span style={{color:"#999",fontSize:10}}>"{selectedField.value}"</span>
          <span style={{color:"#777",fontSize:10,marginLeft:"auto"}}>Clique no mesmo campo do outro lado para comparar</span>
          <button onClick={()=>setSelectedField(null)} style={{background:"transparent",border:"1px solid #444",color:"#777",padding:"2px 8px",borderRadius:3,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:10}}>✕</button>
        </div>
      )}

      {/* Scrollable documents area */}
      <div style={{flex:1,overflow:"auto",padding:"10px 14px",display:"flex",flexDirection:"column",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8,opacity:0.7}}>
          <div style={{flex:1,height:"1px",background:"#1a1a2e"}}/>
          <span style={{color:"#666",fontSize:9,letterSpacing:1,whiteSpace:"nowrap"}}>← CLIQUE NOS CAMPOS PARA COMPARAR →</span>
          <div style={{flex:1,height:"1px",background:"#1a1a2e"}}/>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>
            <div style={{color:"#777",fontSize:9,marginBottom:5,letterSpacing:1}}>{hasMulti?`DOCUMENTO — PÁG. ${activePage}`:"DOCUMENTO ORIGINAL"}</div>
            <DocumentVisual doc={doc} page={activePage} selectedField={selectedField} onFieldClick={handleFieldClick} suspectedFields={suspectedFields}/>
          </div>
          <div>
            <div style={{color:"#777",fontSize:9,marginBottom:5,letterSpacing:1}}>FICHA CADASTRAL</div>
            <FichaCadastral doc={doc} selectedField={selectedField} onFieldClick={handleFieldClick} suspectedFields={suspectedFields}/>
          </div>
        </div>

        {/* Notepad */}
        <div style={{background:"#0c0c1a",border:"1px solid #252535",borderRadius:4,padding:"6px 10px",display:"flex",gap:5,flexWrap:"wrap",alignItems:"center",minHeight:34}}>
          <span style={{color:"#777",fontSize:10}}>📝</span>
          {notes.map((n,i)=>(
            <span key={i} style={{background:"#2a1010",border:"1px solid #553333",color:"#cc7070",fontSize:10,padding:"0 6px",borderRadius:3}}>
              {n} <span style={{cursor:"pointer",opacity:0.6}} onClick={()=>setNotes(u=>u.filter((_,j)=>j!==i))}>×</span>
            </span>
          ))}
          {["CPF suspeito","Cidade diverge","Nome diferente","Vencido","Pág. faltando","Rasura","Carimbo ausente","CPF duplicado","Assinatura ausente","Foto suspeita"]
            .filter(n=>!notes.includes(n))
            .map(n=>(
              <span key={n} onClick={()=>setNotes(u=>[...u,n])} style={{color:"#666",fontSize:10,cursor:"pointer",padding:"0 5px",borderRadius:3,border:"1px solid #252535"}}>+{n}</span>
            ))}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{flexShrink:0,padding:"10px 14px",borderTop:"1px solid #0f0f1a",display:"flex",gap:10,background:"#030307"}}>
        <button
          onClick={() => { playSound("approve"); onApprove(doc); }}
          disabled={!canApprove}
          style={{flex:1,padding:"12px 0",background:canApprove?"#0a200a":"#080810",border:`1px solid ${canApprove?"#337733":"#1a1a1a"}`,color:canApprove?"#55bb55":"#333",borderRadius:5,cursor:canApprove?"pointer":"default",fontFamily:"'Courier New',monospace",fontSize:13,fontWeight:"bold",transition:"all 0.2s"}}
        >✓ APROVADO — DIGITALIZAR</button>
        <button
          onClick={() => { playSound("reject"); onReject(doc); }}
          disabled={!canAct}
          style={{flex:1,padding:"12px 0",background:canAct?"#200a0a":"#080810",border:`1px solid ${canAct?"#773333":"#1a1a1a"}`,color:canAct?"#bb5555":"#333",borderRadius:5,cursor:canAct?"pointer":"default",fontFamily:"'Courier New',monospace",fontSize:13,fontWeight:"bold",transition:"all 0.2s"}}
        >✗ REJEITAR</button>
      </div>

      {/* Compare result popup */}
      {compareResult && (
        <FieldCompareResult
          first={compareResult.first}
          second={compareResult.second}
          onDismiss={() => setCompareResult(null)}
        />
      )}
    </div>
  );
}
