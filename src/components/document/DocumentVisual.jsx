import DocSheet from './DocSheet.jsx';
import ClickableField from './ClickableField.jsx';
import SignatureField from './SignatureField.jsx';
import PhotoPlaceholder from './PhotoPlaceholder.jsx';

export default function DocumentVisual({ doc, page=1, selectedField, onFieldClick, suspectedFields=[] }) {
  const expired = doc.issues.includes("Documento vencido");
  const expiredStamp = expired ? (
    <div style={{position:"absolute",bottom:10,right:10,border:"2px solid #aa000044",color:"#aa0000",padding:"1px 8px",fontSize:9,fontWeight:"bold",letterSpacing:1,borderRadius:2,transform:"rotate(-7deg)",opacity:0.7}}>VENCIDO</div>
  ) : null;
  const sf = suspectedFields;
  const fp = (name) => sf.includes(`doc:${name}`);

  const field = (label, value, name) => (
    <ClickableField fieldId={`doc:${name}`} label={label} value={value} side="documento" selectedField={selectedField} onFieldClick={onFieldClick} suspicious={fp(name)}/>
  );

  // Post-it context note rendered at the bottom of every doc that has one
  const contextNote = doc.context ? (
    <div style={{marginTop:8,background:"#fffde0",border:"1px solid #ccaa00",borderRadius:3,padding:"5px 8px",fontSize:9,color:"#775500",lineHeight:1.5}}>
      {doc.context}
    </div>
  ) : null;

  if (doc.type === "RG") return (
    <DocSheet title="CARTEIRA DE IDENTIDADE" subtitle={`República Federativa do Brasil • ${doc.data.organ}`} headerColor="#7a1515" seal="🏛️">
      <div style={{display:"flex",gap:8,marginBottom:4}}>
        <div style={{flexShrink:0}}>
          <div style={{fontSize:7,color:"#999",marginBottom:2,textAlign:"center"}}>FOTO DOC</div>
          <PhotoPlaceholder features={doc.data.docPhotoFeatures} mismatch={doc.photoMismatch}/>
        </div>
        <div style={{flex:1}}>
          {field("Nome", doc.data.name, "name")}
          {field("CPF", doc.hasRasura ? "███.███.███-██  ⚠rasura" : doc.data.cpf, "cpf")}
          {field("RG", doc.data.rg, "rg")}
          {field("Cidade", doc.data.city, "city")}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
        {field("Emissão", doc.data.issueDate, "issueDate")}
        <div title="Verifique se a validade não expirou">{field("⏳ Validade", doc.data.expiryDate, "expiryDate")}</div>
      </div>
      <SignatureField path={doc.data.signature} label="Assinatura do Titular" missing={doc.missingSignature}/>
      {contextNote}
      {expiredStamp}
    </DocSheet>
  );

  if (doc.type === "CNH") return (
    <DocSheet title="CARTEIRA NACIONAL DE HABILITAÇÃO" subtitle={`DETRAN • ${doc.data.organ}`} headerColor="#1a5a7a" bg="#eef5fa" borderCol="#90b8d0" seal="🚗">
      <div style={{display:"flex",gap:8,marginBottom:4}}>
        <div style={{flexShrink:0}}>
          <div style={{fontSize:7,color:"#999",marginBottom:2,textAlign:"center"}}>FOTO DOC</div>
          <PhotoPlaceholder features={doc.data.docPhotoFeatures} mismatch={doc.photoMismatch}/>
        </div>
        <div style={{flex:1}}>
          {field("Nome", doc.data.name, "name")}
          {field("CPF", doc.hasRasura ? "███.███.███-██  ⚠rasura" : doc.data.cpf, "cpf")}
          {field("Registro", doc.data.cnhNumber, "cnhNumber")}
          {field("Categoria CNH", doc.data.cnhCategory, "cnhCategory")}
        </div>
      </div>
      {field("Cidade", doc.data.city, "city")}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
        {field("Emissão", doc.data.issueDate, "issueDate")}
        <div title="Verifique se a validade não expirou">{field("⏳ Validade", doc.data.expiryDate, "expiryDate")}</div>
      </div>
      <SignatureField path={doc.data.signature} label="Assinatura do Condutor" missing={doc.missingSignature}/>
      {contextNote}
      {expiredStamp}
    </DocSheet>
  );

  if (doc.type === "CONTRATO" || doc.type === "PROCESSO") {
    if (page === 2 && doc.issues.includes("Página faltando")) return (
      <div style={{background:"#f4efe6",border:"1px dashed #c0aa88",borderRadius:3,minHeight:200,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8,opacity:0.5}}>
        <div style={{fontSize:26}}>📄</div>
        <div style={{color:"#aa0000",fontWeight:"bold",fontSize:12,fontFamily:"Georgia,serif"}}>PÁGINA 2 AUSENTE</div>
      </div>
    );
    return (
      <DocSheet title={doc.type==="CONTRATO"?"CONTRATO DE PRESTAÇÃO DE SERVIÇOS":"PROCESSO ADMINISTRATIVO"} subtitle={`Nº ${String(doc.id).padStart(6,"0")}/2026 • Pág. ${page} de 2`} headerColor="#1e3d7a" bg="#eef2f8" borderCol="#a0b8d8" seal="⚖️">
        {page===1 ? (
          <>
            {field("Nome", doc.data.formName, "name")}
            {field("CPF", doc.data.cpf, "cpf")}
            {field("Cidade", doc.data.formCity, "city")}
            {field("Emissão", doc.data.issueDate, "issueDate")}
            {doc.missingStamp && <div style={{background:"#fff8e0",border:"1px solid #d4a000",borderRadius:2,padding:"4px 8px",fontSize:9,color:"#a06000",marginTop:6}}>⚠ Área de carimbo: vazia</div>}
            <div style={{marginTop:8,color:"#666",fontSize:9,lineHeight:1.6,borderTop:"1px dashed #c0aa88",paddingTop:6}}>Pelo presente instrumento, as partes acordam os termos e condições aqui estabelecidos...</div>
            <div style={{marginTop:6,background:"#eef2ff",border:"1px dashed #8899cc",borderRadius:2,padding:"4px 8px",fontSize:9,color:"#4466aa"}}>✍ Assinatura do titular na <strong>Página 2</strong></div>
            {contextNote}
          </>
        ) : (
          <>
            {field("Nome", doc.data.name, "name")}
            <div style={{marginTop:8,color:"#666",fontSize:9,lineHeight:1.6}}>...sendo a validade de 12 meses a contar da data de assinatura.</div>
            <div style={{marginTop:12,display:"flex",gap:12}}>
              <div style={{flex:1}}><SignatureField path={doc.data.signature} label="Assinatura do Titular" missing={doc.missingSignature}/></div>
              <div style={{flex:1}}><SignatureField path={doc.data.signature ? doc.data.signature + " M2" : null} label="Testemunha"/></div>
            </div>
          </>
        )}
      </DocSheet>
    );
  }

  if (doc.type === "DECLARAÇÃO") {
    if (page === 2 && doc.issues.includes("Página faltando")) return (
      <div style={{background:"#f4efe6",border:"1px dashed #c0aa88",borderRadius:3,minHeight:200,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8,opacity:0.5}}>
        <div style={{fontSize:26}}>📄</div>
        <div style={{color:"#aa0000",fontWeight:"bold",fontSize:12,fontFamily:"Georgia,serif"}}>PÁGINA 2 AUSENTE</div>
      </div>
    );
    return (
      <DocSheet title="DECLARAÇÃO DE IMPOSTO DE RENDA" subtitle={`Exercício 2026 • IRPF • Pág. ${page} de 2`} headerColor="#3a5a1a" bg="#f0f5ea" borderCol="#90b870" seal="💰">
        {page===1 ? (
          <>
            {field("Nome", doc.data.formName, "name")}
            {field("CPF", doc.data.cpf, "cpf")}
            {field("Cidade", doc.data.formCity, "city")}
            {field("Ano-Calendário", doc.data.issueDate.split("/")[2], "issueDate")}
            {doc.missingStamp && <div style={{background:"#fff8e0",border:"1px solid #d4a000",borderRadius:2,padding:"4px 8px",fontSize:9,color:"#a06000",marginTop:6}}>⚠ Carimbo da Receita Federal: ausente</div>}
            <div style={{marginTop:8,color:"#666",fontSize:9,lineHeight:1.6,borderTop:"1px dashed #90b870",paddingTop:6}}>Declaro que as informações prestadas neste formulário são verdadeiras...</div>
            {contextNote}
          </>
        ) : (
          <>
            {field("Nome", doc.data.name, "name")}
            <div style={{marginTop:8,color:"#666",fontSize:9}}>Bens, direitos e obrigações declarados conforme legislação vigente.</div>
            <SignatureField path={doc.data.signature} label="Assinatura do Declarante" missing={doc.missingSignature}/>
          </>
        )}
      </DocSheet>
    );
  }

  if (doc.type === "LAUDO") return (
    <DocSheet title="LAUDO MÉDICO / TÉCNICO" subtitle={`Protocolo ${String(doc.id).padStart(5,"0")}`} headerColor="#165a30" bg="#f0f5f0" borderCol="#90b8a0" seal="🏥">
      {field("Nome", doc.data.formName, "name")}
      {field("CPF", doc.data.cpf, "cpf")}
      {field("Cidade", doc.data.formCity, "city")}
      {field("CID", doc.data.cid, "cid")}
      <div title="Verifique se a validade não expirou">{field("⏳ Validade", doc.data.expiryDate, "expiryDate")}</div>
      <div style={{marginTop:6,fontSize:9,color:"#666"}}>Responsável: {doc.data.doctor} — {doc.data.crm}</div>
      <SignatureField path={doc.data.signature} label="Assinatura do Médico" missing={doc.missingSignature}/>
      {contextNote}
    </DocSheet>
  );

  if (doc.type === "ATESTADO") return (
    <DocSheet title="ATESTADO MÉDICO" subtitle={`Emitido em ${doc.data.issueDate}`} headerColor="#5a1a5a" bg="#f5f0f5" borderCol="#b090b8" seal="🩺">
      {field("Nome", doc.data.formName, "name")}
      {field("CPF", doc.data.cpf, "cpf")}
      {field("Cidade", doc.data.formCity, "city")}
      {field("CID", doc.data.cid, "cid")}
      <div title="Verifique se a validade não expirou">{field("⏳ Validade", doc.data.expiryDate, "expiryDate")}</div>
      <div style={{marginTop:8,background:"#ede0ed",borderRadius:2,padding:8,fontSize:9,color:"#444",lineHeight:1.6}}>Atesto que o(a) paciente acima necessita de afastamento por período determinado.</div>
      <div style={{marginTop:6,fontSize:9,color:"#666"}}>Dr(a): {doc.data.doctor} — {doc.data.crm}</div>
      <SignatureField path={doc.data.signature} label="Assinatura e Carimbo" missing={doc.missingSignature}/>
      {contextNote}
      {expiredStamp}
    </DocSheet>
  );

  return (
    <DocSheet title="CERTIDÃO OFICIAL" subtitle={`Cartório Oficial • Reg. nº ${String(doc.id).padStart(7,"0")}`} headerColor="#5a3010" bg="#f5f0e0" borderCol="#c0a060" seal="🏛️">
      {field("Nome", doc.data.formName, "name")}
      {field("CPF", doc.data.cpf, "cpf")}
      {field("Cidade", doc.data.formCity, "city")}
      {field("Emissão", doc.data.issueDate, "issueDate")}
      <div title="Verifique se a validade não expirou">{field("⏳ Validade", doc.data.expiryDate, "expiryDate")}</div>
      <SignatureField path={doc.data.signature} label="Assinatura do Escrivão" missing={doc.missingSignature}/>
      {contextNote}
      {expiredStamp}
    </DocSheet>
  );
}
