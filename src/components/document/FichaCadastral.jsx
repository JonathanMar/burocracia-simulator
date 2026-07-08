import ClickableField from './ClickableField.jsx';
import PhotoPlaceholder from './PhotoPlaceholder.jsx';

export default function FichaCadastral({ doc, selectedField, onFieldClick, suspectedFields=[] }) {
  const sf = suspectedFields;
  const fp = name => sf.includes(`ficha:${name}`);
  const field = (label, value, name) => (
    <ClickableField fieldId={`ficha:${name}`} label={label} value={value} side="ficha" selectedField={selectedField} onFieldClick={onFieldClick} suspicious={fp(name)}/>
  );
  return (
    <div style={{background:"#eef2f8",border:"1px solid #a0b8d8",borderRadius:3,padding:"12px 14px",fontFamily:"Georgia,serif",boxShadow:"2px 4px 10px #00000020",fontSize:11}}>
      <div style={{borderBottom:"2px solid #1e3d7a",paddingBottom:6,marginBottom:9}}>
        <div style={{fontSize:11,fontWeight:"bold",color:"#1e3d7a",letterSpacing:0.8}}>FORMULÁRIO DE CADASTRO</div>
        <div style={{fontSize:9,color:"#777",marginTop:2}}>Digitalizações Infernais Ltda. • Uso Interno</div>
      </div>

      {/* Photo + main fields side by side */}
      <div style={{display:"flex",gap:8,marginBottom:4}}>
        <div style={{flexShrink:0}}>
          <div style={{fontSize:7,color:"#999",marginBottom:2,textAlign:"center"}}>FOTO FICHA</div>
          <PhotoPlaceholder features={doc.data.fichaPhotoFeatures} mismatch={false} label="ficha"/>
        </div>
        <div style={{flex:1}}>
          {field("Nome",            doc.data.name,      "name")}
          {field("CPF",             doc.data.cpf,       "cpf")}
          <div style={{fontSize:8,color:"#888",marginTop:-4,marginBottom:4,paddingLeft:78}} title="Os dígitos verificadores devem ser calculados manualmente">⚑ Verifique os dígitos verificadores</div>
          {field("Cidade",          doc.data.city,      "city")}
        </div>
      </div>

      {/* Date field — renamed for clarity */}
      <div title="Data em que o documento foi emitido — compare com o campo 'Emissão' no documento">
        {field("Emissão", doc.data.issueDate, "issueDate")}
      </div>

      {(doc.type==="CNH") && field("Categoria CNH", doc.data.cnhCategory, "cnhCategory")}
      {(doc.type==="LAUDO"||doc.type==="ATESTADO") && field("CID", doc.data.cid, "cid")}

      <div style={{marginTop:12,borderTop:"1px dashed #a0b8d8",paddingTop:8,display:"flex",justifyContent:"flex-end",gap:8}}>
        {["Responsável","Data"].map(l=>(
          <div key={l} style={{textAlign:"center",borderTop:"1px solid #1e3d7a",paddingTop:3,width:68}}>
            <div style={{fontSize:8,color:"#999"}}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
