import { useState } from 'react';
import { CORRECT_FOLDER } from '../../constants/game.js';

export default function FileSaveModal({ doc, onSave, onClose }) {
  const [path, setPath] = useState("");
  const [saved, setSaved] = useState(null); // null | 'correct' | 'wrong'
  const folders = Object.values(CORRECT_FOLDER);
  const correct = CORRECT_FOLDER[doc.type];

  function handleSave() {
    if (!path) return;
    const isCorrect = path === correct;
    setSaved(isCorrect ? 'correct' : 'wrong');
    // Brief visual feedback before closing
    setTimeout(() => onSave(doc, path, isCorrect), 700);
  }

  return (
    <div style={{position:"fixed",inset:0,background:"#000000cc",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100}}>
      <div style={{background:"#0a0a18",border:"1px solid #2a2a3e",borderRadius:9,padding:22,width:440,fontFamily:"'Courier New',monospace",position:"relative",overflow:"hidden"}}>

        {/* Save result flash overlay */}
        {saved && (
          <div style={{
            position:"absolute",inset:0,zIndex:10,
            display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10,
            background: saved==="correct" ? "#003311ee" : "#330000ee",
            borderRadius:9,
            animation:"slideIn 0.2s ease",
          }}>
            <div style={{fontSize:40}}>{saved==="correct" ? "✅" : "⚠"}</div>
            <div style={{color: saved==="correct" ? "#55cc55" : "#cc4444", fontSize:14, fontWeight:"bold"}}>
              {saved==="correct" ? "Pasta correta!" : "Pasta errada!"}
            </div>
            <div style={{color:"#888",fontSize:10}}>
              {saved==="correct" ? path : `Deveria ser: ${correct}`}
            </div>
          </div>
        )}

        <div style={{color:"#ccc",fontSize:14,fontWeight:"bold",marginBottom:4}}>💾 SALVAR ARQUIVO</div>
        <div style={{color:"#777",fontSize:10,marginBottom:14}}>{doc.type}_{String(doc.id).padStart(4,"0")}_{doc.data.name.replace(/ /g,"_")}.pdf</div>
        <div style={{color:"#666",fontSize:9,marginBottom:4}}>
          Tipo: <span style={{color:"#9999cc"}}>{doc.type}</span> — selecione o diretório correto:
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:16,maxHeight:260,overflowY:"auto"}}>
          {folders.map(f=>(
            <div key={f} onClick={()=>setPath(f)} style={{
              padding:"7px 12px",
              background: path===f ? "#0a1a2a" : "#0f0f18",
              border:`1px solid ${path===f ? "#3a6aaa" : "#2a2a3e"}`,
              borderRadius:4,cursor:"pointer",fontSize:11,
              color: path===f ? "#6a9eff" : "#777",
              transition:"all 0.1s",
              display:"flex",alignItems:"center",gap:8,
            }}>
              <span>📁</span>
              <span style={{flex:1}}>{f}</span>
              {path===f && <span style={{color:"#3a6aaa",fontSize:10}}>← selecionado</span>}
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:8}}>
          <button
            onClick={handleSave}
            disabled={!path}
            style={{flex:1,padding:"9px 0",background:path?"#0a1a2a":"#0a0a14",border:`1px solid ${path?"#3a6aaa":"#1a1a2e"}`,color:path?"#6a9eff":"#444",borderRadius:4,cursor:path?"pointer":"default",fontFamily:"'Courier New',monospace",fontSize:12,fontWeight:"bold"}}
          >
            SALVAR AQUI
          </button>
          <button onClick={onClose} style={{padding:"9px 14px",background:"transparent",border:"1px solid #2a2a3e",color:"#777",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:11}}>✕</button>
        </div>
      </div>
    </div>
  );
}
