import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════
const CITIES = ["São Paulo", "Belo Horizonte", "Rio de Janeiro", "Curitiba", "Salvador"];
const NAMES  = ["João Silva","Maria Oliveira","Carlos Souza","Ana Lima","Pedro Costa","Fernanda Rocha","Roberto Alves","Cláudia Mendes"];
const DOC_TYPES = ["RG","CONTRATO","LAUDO","CERTIDÃO","PROCESSO"];
const PRINTER_NAME = "Beatriz";

const STORY_DAYS = [
  { day:1, boss:`Bom dia, novo funcionário. Você vai digitalizar documentos, validar os dados e salvar tudo na pasta certa antes do fim do expediente. Simples. A ${PRINTER_NAME}… está razoável hoje.`, bossName:"Sr. Figueiredo", bossEmoji:"👔" },
  { day:2, boss:"Ontem foi aceitável. Hoje o volume aumenta. Alguém derramou café na impressora — ela está de péssimo humor. Ah, e sem erros.", bossName:"Sr. Figueiredo", bossEmoji:"👔" },
  { day:3, boss:"A auditoria vem semana que vem. ZERO erros. O TI instalou uma 'atualização' hoje cedo. Boa sorte.", bossName:"Sr. Figueiredo", bossEmoji:"😤" },
  { day:4, boss:"Recebi reclamações. Documentos chegando tortos, pastas erradas. E a impressora… prefiro não comentar. Corrija isso.", bossName:"Sr. Figueiredo", bossEmoji:"😤" },
  { day:5, boss:"Última chance. A diretoria quer resultados. Se passar hoje com nota mínima B, seu contrato é renovado. Talvez.", bossName:"Sra. Diretora", bossEmoji:"💼" },
];

const MEMORANDOS = [
  { day:2, text:"A partir de hoje, documentos de CURITIBA devem ser verificados com atenção redobrada ao campo 'Validade'. Memorando 04/2026 — Dep. Jurídico." },
  { day:3, text:"Atenção: documentos com rasura no campo CPF são automaticamente INVÁLIDOS, independente do restante. Memorando 07/2026." },
  { day:4, text:"Novo protocolo: páginas faltando em CONTRATOS geram penalidade dobrada. Memorando 11/2026 — Auditoria Interna." },
  { day:5, text:"ALERTA MÁXIMO: qualquer documento salvo na pasta errada será debitado do salário do responsável. Memorando 13/2026." },
];

const RANDOM_EVENTS = [
  { id:"coffee",  emoji:"☕", title:"CAFÉ DERRAMADO!",        desc:"O copo tombou. Alguns documentos ficaram grudados e precisam ser preparados novamente.", duration:7000,  effect:"staple" },
  { id:"boss",    emoji:"👔", title:"CHEFE APARECEU!",        desc:'"Como estamos indo? Espero que sem erros…" Ele fica te olhando por 10 segundos.', duration:10000, effect:"pressure" },
  { id:"antivirus",emoji:"🛡️",title:"ANTIVÍRUS ATIVADO!",    desc:"O antivírus decidiu escanear TUDO agora. PC travado por 8 segundos.", duration:8000,  effect:"freeze" },
  { id:"cat",     emoji:"🐱", title:"GATO NA SALA!",          desc:"O gato do escritório sentou em cima dos documentos. Nada pode ser feito.", duration:6000,  effect:"block" },
  { id:"power",   emoji:"⚡", title:"ENERGIA PISCANDO!",      desc:"A luz piscou. A impressora reiniciou e perdeu o humor acumulado.", duration:5000,  effect:"printer_reset" },
  { id:"phone",   emoji:"📞", title:"CLIENTE LIGANDO!",       desc:'"Cadê meu documento?! Já faz 3 dias!" Você perde 15 pontos.', duration:7000,  effect:"penalty" },
  { id:"update",  emoji:"💻", title:"WINDOWS UPDATE!",        desc:"Agora. Sem negociação. PC travado por 10 segundos.", duration:10000, effect:"freeze" },
  { id:"intern",  emoji:"🧑‍💼",title:"ESTAGIÁRIO AJUDANDO!",  desc:"O estagiário processou um doc aleatório pra você. Mas será que ele fez certo?", duration:5000,  effect:"intern" },
  { id:"meeting", emoji:"📊", title:"REUNIÃO OBRIGATÓRIA!",   desc:"Todos na sala. Agora. Slide com bullet points inúteis por 12 segundos.", duration:12000, effect:"freeze" },
  { id:"wifi",    emoji:"📶", title:"IMPRESSORA COM WI-FI!",  desc:`A ${PRINTER_NAME} conectou na internet e está imprimindo receitas de bolo. Clique em REINICIAR para parar.`, duration:99999, effect:"wifi_print" },
  { id:"blackout",emoji:"🌑", title:"QUEDA DE ENERGIA!",      desc:"Tela às escuras por 6 segundos. Um relâmpago ilumina brevemente.", duration:6000,  effect:"blackout" },
  { id:"colleague",emoji:"🙋",title:"COLEGA PEDINDO AJUDA!",  desc:'"Você pode assinar por mim? É só um doc…" Aceitar: +15s, mas risco de erro extra.', duration:8000,  effect:"colleague" },
];

const PRINTER_EVENTS = [
  { id:"jam",     label:"ATOLAMENTO!",        color:"#e05555", fix:"pull" },
  { id:"toner",   label:"SEM TONER",          color:"#d4820a", fix:"replace" },
  { id:"overheat",label:"SUPERAQUECIMENTO",   color:"#cc5500", fix:"wait" },
  { id:"skewed",  label:"PAPEL TORTO",        color:"#b8a000", fix:"align" },
  { id:"ghost",   label:`MODO FANTASMA`,      color:"#8855cc", fix:"restart" },
];

const PRINTER_LCD_MSGS = [
  `Eu sei o que você fez ontem.`,
  `Detectei 0 motivos para cooperar.`,
  `Humor: péssimo. Motivo: existência.`,
  `Por favor não me bata de novo.`,
  `ERRO 404: vontade de trabalhar não encontrada.`,
  `Processando... na verdade não.`,
  `Toner: 12%. Paciência: 0%.`,
];

const WEIGHT_ITEMS = [
  { id:"stapler", label:"Grampeador",    emoji:"📎", weight:1 },
  { id:"monitor", label:"Monitor Velho", emoji:"🖥️", weight:4 },
  { id:"coffee",  label:"Copo de Café",  emoji:"☕", weight:1 },
  { id:"books",   label:"Pilha de Livros",emoji:"📚",weight:3 },
  { id:"binder",  label:"Fichário",      emoji:"🗂️", weight:2 },
];

const CORRECT_FOLDER = {
  "RG":      "CLIENTES/2026/RG",
  "CONTRATO":"CLIENTES/2026/CONTRATOS",
  "LAUDO":   "CLIENTES/2026/LAUDOS",
  "CERTIDÃO":"CLIENTES/2026/CERTIDÕES",
  "PROCESSO":"CLIENTES/2026/PROCESSOS",
};

const ACHIEVEMENTS = [
  { id:"tap10",     label:"Percussionista",   desc:"Deu 10 tapinhas na impressora",      emoji:"🥁", check:(s)=>s.taps>=10 },
  { id:"perfect",   label:"Sem Erros!",       desc:"Completou um dia sem nenhum erro",   emoji:"✨", check:(s)=>s.dayErrors===0 },
  { id:"wrongfolder",label:"Arquivista Caótico",desc:"Salvou em pasta errada 3 vezes",  emoji:"🗄️", check:(s)=>s.wrongFolders>=3 },
  { id:"rejected3", label:"Rigoroso",         desc:"Rejeitou 5 documentos inválidos",    emoji:"🔍", check:(s)=>s.correctRejections>=5 },
  { id:"speedrun",  label:"Turbo Burocrático",desc:"Completou um dia com +120s sobrando",emoji:"⚡",check:(s)=>s.timeBonus>=120 },
  { id:"intern",    label:"Confia no Estagiário",desc:"O estagiário acertou 3 vezes",   emoji:"🧑‍💼",check:(s)=>s.internCorrect>=3 },
  { id:"greve",     label:"Negociador",       desc:`A ${PRINTER_NAME} entrou em greve`,  emoji:"✊", check:(s)=>s.printerStrikes>=1 },
];

const TUTORIAL_STEPS = [
  {
    title:"Bem-vindo ao Trabalho",
    emoji:"👋",
    content:"Você foi contratado para digitalizar documentos governamentais. Cada documento precisa ser inspecionado, preparado fisicamente e salvo no local correto.",
    highlight:null,
  },
  {
    title:"1. Escolha um Documento",
    emoji:"📋",
    content:"Na coluna ESQUERDA ficam os documentos pendentes. Clique em um para inspecioná-lo. Documentos com ícone ⚙ precisam de preparação física antes de serem digitalizados.",
    highlight:"left",
  },
  {
    title:"2. Prepare Fisicamente",
    emoji:"⚙",
    content:"Antes de digitalizar, verifique se o documento tem grampos (precisam ser removidos) ou folhas desalinhadas (precisam ser ajustadas). Esses botões aparecem acima da inspeção.",
    highlight:"prep",
  },
  {
    title:"3. Compare os Documentos",
    emoji:"🔍",
    content:"No CENTRO você vê dois lados: o documento original (esquerda) e a Ficha Cadastral (direita). Compare cada campo manualmente — Nome, CPF, Cidade e Validade. NÃO há marcação automática de erros. Os erros são seus para encontrar.",
    highlight:"center",
  },
  {
    title:"4. Anote Suspeitas",
    emoji:"📝",
    content:"Use o bloco de notas abaixo da inspeção para marcar campos suspeitos. Clique em '+ CPF suspeito', '+ Cidade diverge' etc. Essas anotações são só para você se organizar.",
    highlight:"notes",
  },
  {
    title:"5. Aprove ou Rejeite",
    emoji:"⚖",
    content:"Se o documento estiver correto, clique APROVADO para digitalizar. Se encontrou erros (CPF inválido, cidade diferente, nome diferente, vencido, páginas faltando), clique REJEITAR. Erros custam pontos!",
    highlight:"actions",
  },
  {
    title:"6. Salve no Lugar Certo",
    emoji:"💾",
    content:"Após digitalizar, escolha a pasta correta. RG → pasta RG, Contrato → CONTRATOS, etc. Pasta errada = penalidade. Os documentos digitalizados aparecem na seção 'SALVAR' na coluna esquerda.",
    highlight:"save",
  },
  {
    title:"7. A Impressora",
    emoji:"🖨️",
    content:`A ${PRINTER_NAME} é instável. Coloque peso em cima dela (2–5 kg) para ela digitalizar direito. Quando travar, use a ação correta: Atolamento→Puxar, Sem Toner→Trocar, Superaquecimento→Resfriar, Papel Torto→Reiniciar. O Tapinha é uma aposta.`,
    highlight:"printer",
  },
  {
    title:"8. Impressora com Vida Zero",
    emoji:"💀",
    content:`Se a saúde de ${PRINTER_NAME} chegar a 0%, ela QUEBRA e entra em modo pane. Você perde tempo e pontos até chamarem o técnico. Cuide dela!`,
    highlight:"printer",
  },
  {
    title:"Pronto para Trabalhar!",
    emoji:"🚀",
    content:"Eventos aleatórios vão acontecer: café derramado, chefe aparecendo, antivírus, queda de energia e mais. Fique atento às conquistas — elas aparecem no canto superior. Boa sorte!",
    highlight:null,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
function generateCPF(valid=true){
  const r=()=>Math.floor(Math.random()*9);
  const d=Array.from({length:9},r);
  if(!valid) return `${d[0]}${d[1]}${d[2]}.${d[3]}${d[4]}${d[5]}.${d[6]}${d[7]}${d[8]}-99`;
  let s1=d.reduce((a,v,i)=>a+v*(10-i),0);
  let r1=(s1*10)%11; if(r1>=10)r1=0;
  let s2=d.reduce((a,v,i)=>a+v*(11-i),0)+r1*2;
  let r2=(s2*10)%11; if(r2>=10)r2=0;
  return `${d[0]}${d[1]}${d[2]}.${d[3]}${d[4]}${d[5]}.${d[6]}${d[7]}${d[8]}-${r1}${r2}`;
}
const rf=arr=>arr[Math.floor(Math.random()*arr.length)];
const p2=n=>String(n).padStart(2,"0");

function generateDoc(id,level,allDocs=[]){
  const type=rf(DOC_TYPES);
  const name=rf(NAMES);
  const city=rf(CITIES);
  const validCPF=Math.random()>0.32;
  const cityMismatch=Math.random()>0.62;
  const nameMismatch=Math.random()>0.74;
  const expired=Math.random()>0.8;
  const missingPages=level>1&&Math.random()>0.74;
  const hasGrampo=Math.random()>0.45;
  const misaligned=Math.random()>0.5;
  const hasRasura=level>2&&Math.random()>0.8;
  const missingStamp=level>1&&(type==="CONTRATO"||type==="PROCESSO")&&Math.random()>0.75;
  // duplicate CPF mechanic (level 3+)
  const isDuplicate=level>2&&allDocs.length>0&&Math.random()>0.82;
  const dupSource=isDuplicate?rf(allDocs.filter(d=>!d.isDuplicate)):null;
  const cpfToUse=isDuplicate&&dupSource?dupSource.data.cpf:generateCPF(validCPF);

  const issueYear=expired?2019+Math.floor(Math.random()*3):2024;
  const expiryYear=expired?2022+Math.floor(Math.random()*2):2027;
  const issues=[];
  if(!validCPF&&!isDuplicate) issues.push("CPF inválido");
  if(isDuplicate) issues.push("CPF duplicado");
  if(cityMismatch) issues.push("Cidade incompatível");
  if(nameMismatch) issues.push("Nome divergente");
  if(expired) issues.push("Documento vencido");
  if(missingPages) issues.push("Página faltando");
  if(hasRasura) issues.push("Rasura no CPF");
  if(missingStamp) issues.push("Carimbo ausente");

  return {
    id,type,
    pages:missingPages?1:(type==="CONTRATO"||type==="PROCESSO"?2:1),
    expectedPages:type==="CONTRATO"||type==="PROCESSO"?2:1,
    data:{
      name,city,
      cpf:cpfToUse,
      formCity:cityMismatch?rf(CITIES.filter(c=>c!==city)):city,
      formName:nameMismatch?rf(NAMES.filter(n=>n!==name)):name,
      issueDate:`${p2(Math.floor(Math.random()*28)+1)}/${p2(Math.floor(Math.random()*12)+1)}/${issueYear}`,
      expiryDate:`31/12/${expiryYear}`,
      rg:`${Math.floor(Math.random()*90000000)+10000000}-${Math.floor(Math.random()*9)}`,
      organ:rf(["SSP/SP","SSP/RJ","SSP/MG","DETRAN/PR"]),
    },
    issues,isValid:issues.length===0,
    scanned:false,savedPath:null,
    aligned:!misaligned,hasGrampo,misaligned,
    physicalReady:!misaligned&&!hasGrampo,
    hasRasura,missingStamp,isDuplicate,
    urgentDeadline:Math.random()>0.85?Date.now()+30000:null,
  };
}

function generateLevel(lv){
  const count=3+lv*2;
  const docs=[];
  for(let i=0;i<count;i++) docs.push(generateDoc(i+1,lv,docs));
  return docs;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENT VISUAL — Papers Please style, NO red highlights on errors
// ═══════════════════════════════════════════════════════════════════════════════
function DocSheet({children,headerColor="#7a1515",bg="#f4efe6",borderCol="#c0aa88",title,subtitle,seal}){
  return(
    <div style={{background:bg,border:`1px solid ${borderCol}`,borderRadius:3,padding:"12px 14px",fontFamily:"Georgia,serif",color:"#1a1a1a",boxShadow:"2px 4px 10px #00000028",fontSize:11,minHeight:200,position:"relative"}}>
      <div style={{borderBottom:`2px solid ${headerColor}`,paddingBottom:6,marginBottom:9}}>
        <div style={{fontSize:12,fontWeight:"bold",color:headerColor,letterSpacing:0.8}}>{title}</div>
        {subtitle&&<div style={{fontSize:9,color:"#777",marginTop:2}}>{subtitle}</div>}
      </div>
      {seal&&<div style={{position:"absolute",top:10,right:12,fontSize:20,opacity:0.35}}>{seal}</div>}
      {children}
    </div>
  );
}

function DocField({label,value}){
  return(
    <div style={{display:"flex",gap:8,marginBottom:7}}>
      <span style={{color:"#888",fontSize:9,textTransform:"uppercase",letterSpacing:0.4,minWidth:70,paddingTop:3}}>{label}</span>
      <span style={{background:"#e5ddc8",border:"1px solid #c0aa88",padding:"2px 6px",borderRadius:2,fontSize:12,fontWeight:"bold",color:"#111",flex:1}}>{value}</span>
    </div>
  );
}

function DocumentVisual({doc,page=1}){
  const expired=doc.issues.includes("Documento vencido");
  const expiredStamp=expired?(
    <div style={{position:"absolute",bottom:10,right:10,border:"2px solid #aa000044",color:"#aa0000",padding:"1px 8px",fontSize:9,fontWeight:"bold",letterSpacing:1,borderRadius:2,transform:"rotate(-7deg)",opacity:0.7}}>VENCIDO</div>
  ):null;

  if(doc.type==="RG") return(
    <DocSheet title="CARTEIRA DE IDENTIDADE" subtitle={`República Federativa do Brasil • ${doc.data.organ}`} headerColor="#7a1515" seal="🏛️">
      <DocField label="Nome" value={doc.data.name}/>
      <DocField label="CPF" value={doc.hasRasura?"███.███.███-██ ⚠rasura":doc.data.cpf}/>
      <DocField label="RG" value={doc.data.rg}/>
      <DocField label="Naturalidade" value={doc.data.city}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
        <DocField label="Emissão" value={doc.data.issueDate}/>
        <DocField label="Validade" value={doc.data.expiryDate}/>
      </div>
      {expiredStamp}
    </DocSheet>
  );

  if(doc.type==="CONTRATO"||doc.type==="PROCESSO"){
    if(page===2&&doc.issues.includes("Página faltando")) return(
      <div style={{background:"#f4efe6",border:"1px dashed #c0aa88",borderRadius:3,minHeight:200,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8,opacity:0.5}}>
        <div style={{fontSize:26}}>📄</div>
        <div style={{color:"#aa0000",fontWeight:"bold",fontSize:12,fontFamily:"Georgia,serif"}}>PÁGINA 2 AUSENTE</div>
      </div>
    );
    return(
      <DocSheet title={doc.type==="CONTRATO"?"CONTRATO DE PRESTAÇÃO DE SERVIÇOS":"PROCESSO ADMINISTRATIVO"} subtitle={`Nº ${String(doc.id).padStart(6,"0")}/2026 • Pág. ${page} de 2`} headerColor="#1e3d7a" bg="#eef2f8" borderCol="#a0b8d8" seal="⚖️">
        {page===1?(
          <>
            <DocField label="Contratante" value={doc.data.formName}/>
            <DocField label="CPF" value={doc.data.cpf}/>
            <DocField label="Cidade" value={doc.data.formCity}/>
            <DocField label="Data" value={doc.data.issueDate}/>
            {doc.missingStamp&&<div style={{background:"#fff8e0",border:"1px solid #d4a000",borderRadius:2,padding:"4px 8px",fontSize:9,color:"#a06000",marginTop:6}}>⚠ Área de carimbo: vazia</div>}
            <div style={{marginTop:8,color:"#999",fontSize:9,lineHeight:1.6,borderTop:"1px dashed #c0aa88",paddingTop:6}}>Pelo presente instrumento, as partes acima identificadas acordam os termos e condições aqui estabelecidos...</div>
          </>
        ):(
          <>
            <DocField label="Titular" value={doc.data.name}/>
            <div style={{marginTop:8,color:"#999",fontSize:9,lineHeight:1.6}}>...sendo a validade de 12 meses a contar da data de assinatura. Qualquer alteração deverá ser feita por escrito.</div>
            <div style={{marginTop:16,display:"flex",justifyContent:"space-around"}}>
              {["Assinatura do Titular","Testemunha"].map(l=>(
                <div key={l} style={{textAlign:"center",borderTop:"1px solid #1e3d7a",paddingTop:4,width:90}}>
                  <div style={{fontSize:8,color:"#aaa"}}>{l}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </DocSheet>
    );
  }

  if(doc.type==="LAUDO") return(
    <DocSheet title="LAUDO MÉDICO / TÉCNICO" subtitle={`Protocolo ${String(doc.id).padStart(5,"0")}`} headerColor="#165a30" bg="#f0f5f0" borderCol="#90b8a0" seal="🏥">
      <DocField label="Paciente" value={doc.data.formName}/>
      <DocField label="CPF" value={doc.data.cpf}/>
      <DocField label="Cidade" value={doc.data.formCity}/>
      <DocField label="Data" value={doc.data.issueDate}/>
      <div style={{marginTop:8,background:"#dceee3",borderRadius:2,padding:8,fontSize:9,color:"#444",lineHeight:1.6}}><strong>Parecer:</strong> Paciente apto para as atividades descritas. Sem restrições observadas no exame clínico.</div>
    </DocSheet>
  );

  return(
    <DocSheet title="CERTIDÃO OFICIAL" subtitle={`Cartório Oficial • Reg. nº ${String(doc.id).padStart(7,"0")}`} headerColor="#5a3010" bg="#f5f0e0" borderCol="#c0a060" seal="🏛️">
      <DocField label="Requerente" value={doc.data.formName}/>
      <DocField label="CPF" value={doc.data.cpf}/>
      <DocField label="Comarca" value={doc.data.formCity}/>
      <DocField label="Emissão" value={doc.data.issueDate}/>
      <DocField label="Validade" value={doc.data.expiryDate}/>
      {expiredStamp}
    </DocSheet>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FICHA CADASTRAL — NO red highlights, plain display
// ═══════════════════════════════════════════════════════════════════════════════
function FichaCadastral({doc}){
  return(
    <div style={{background:"#eef2f8",border:"1px solid #a0b8d8",borderRadius:3,padding:"12px 14px",fontFamily:"Georgia,serif",boxShadow:"2px 4px 10px #00000020",fontSize:11,minHeight:200}}>
      <div style={{borderBottom:"2px solid #1e3d7a",paddingBottom:6,marginBottom:9}}>
        <div style={{fontSize:11,fontWeight:"bold",color:"#1e3d7a",letterSpacing:0.8}}>FORMULÁRIO DE CADASTRO</div>
        <div style={{fontSize:9,color:"#888",marginTop:2}}>Digitalizações Infernais Ltda. • Uso Interno</div>
      </div>
      {[
        {label:"Nome Completo",  val:doc.data.formName},
        {label:"CPF",            val:doc.data.cpf},
        {label:"Cidade/Município",val:doc.data.formCity},
        {label:"Data Referência",val:doc.data.issueDate},
      ].map(row=>(
        <div key={row.label} style={{display:"flex",gap:8,marginBottom:8}}>
          <span style={{color:"#888",fontSize:9,textTransform:"uppercase",letterSpacing:0.4,minWidth:82,paddingTop:3}}>{row.label}</span>
          <span style={{background:"#dde8f5",border:"1px solid #a0b8d8",padding:"2px 6px",borderRadius:2,fontSize:12,fontWeight:"bold",color:"#111",flex:1}}>{row.val}</span>
        </div>
      ))}
      <div style={{marginTop:12,borderTop:"1px dashed #a0b8d8",paddingTop:8,display:"flex",justifyContent:"flex-end",gap:8}}>
        {["Responsável","Data"].map(l=>(
          <div key={l} style={{textAlign:"center",borderTop:"1px solid #1e3d7a",paddingTop:3,width:68}}>
            <div style={{fontSize:8,color:"#aaa"}}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INSPECTION PANEL
// ═══════════════════════════════════════════════════════════════════════════════
function InspectionPanel({doc,onApprove,onReject,frozen,blackout}){
  const [activePage,setActivePage]=useState(1);
  const [notes,setNotes]=useState([]);
  useEffect(()=>{setActivePage(1);setNotes([]);},[doc?.id]);

  if(!doc) return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",flexDirection:"column",gap:12}}>
      <div style={{fontSize:44,opacity:0.15}}>📋</div>
      <div style={{fontFamily:"'Courier New',monospace",fontSize:13,color:"#555"}}>Selecione um documento para inspecionar</div>
      <div style={{fontFamily:"'Courier New',monospace",fontSize:11,color:"#333",textAlign:"center",maxWidth:300}}>Compare manualmente os campos entre o documento e a ficha cadastral — os erros são seus para encontrar</div>
    </div>
  );

  const hasMulti=doc.expectedPages>1;
  const canApprove=doc.physicalReady&&!frozen&&!blackout;

  return(
    <div style={{fontFamily:"'Courier New',monospace",height:"100%",display:"flex",flexDirection:"column",gap:9,position:"relative"}}>
      {(frozen||blackout)&&(
        <div style={{position:"absolute",inset:0,background:blackout?"#000000ee":"#00000099",zIndex:20,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:8,transition:"background 0.3s"}}>
          {blackout
            ?<div style={{color:"#ffffffcc",textAlign:"center",animation:"blink 0.8s infinite"}}><div style={{fontSize:36,marginBottom:8}}>🌑</div><div style={{fontSize:13}}>QUEDA DE ENERGIA</div></div>
            :<div style={{color:"#5a8fff",textAlign:"center"}}><div style={{fontSize:30,marginBottom:8}}>🔒</div><div style={{fontSize:13}}>PC TRAVADO</div></div>
          }
        </div>
      )}

      {/* Header row */}
      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
        <span style={{background:"#1a2a4a",border:"1px solid #2a4a6a",color:"#6a9eff",padding:"2px 8px",borderRadius:3,fontSize:11}}>DOC #{doc.id}</span>
        <span style={{color:"#666",fontSize:12}}>{doc.type}</span>
        {doc.urgentDeadline&&Date.now()<doc.urgentDeadline&&(
          <span style={{color:"#ff5555",fontSize:10,background:"#300000",border:"1px solid #ff333355",padding:"1px 6px",borderRadius:3,animation:"blink 0.8s infinite"}}>🔴 URGENTE</span>
        )}
        {!doc.physicalReady&&(
          <span style={{color:"#cc8800",fontSize:10,background:"#221800",border:"1px solid #cc880033",padding:"1px 6px",borderRadius:3}}>⚙ Prepare antes de digitalizar</span>
        )}
        {hasMulti&&(
          <div style={{marginLeft:"auto",display:"flex",gap:5}}>
            {[1,2].map(p=>(
              <button key={p} onClick={()=>setActivePage(p)} style={{background:activePage===p?"#1a2a4a":"transparent",border:`1px solid ${activePage===p?"#4a9eff":"#222"}`,color:activePage===p?"#6a9eff":"#555",padding:"3px 10px",borderRadius:3,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:11}}>Pág {p}</button>
            ))}
          </div>
        )}
      </div>

      {/* Side-by-side documents */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,flex:1,overflow:"auto"}}>
        <div>
          <div style={{color:"#444",fontSize:9,marginBottom:5,letterSpacing:1}}>{hasMulti?`DOCUMENTO — PÁG. ${activePage}`:"DOCUMENTO ORIGINAL"}</div>
          <DocumentVisual doc={doc} page={activePage}/>
        </div>
        <div>
          <div style={{color:"#444",fontSize:9,marginBottom:5,letterSpacing:1}}>FICHA CADASTRAL</div>
          <FichaCadastral doc={doc}/>
        </div>
      </div>

      {/* Notepad */}
      <div style={{background:"#0c0c1a",border:"1px solid #181828",borderRadius:4,padding:"5px 9px",display:"flex",gap:5,flexWrap:"wrap",alignItems:"center",minHeight:32}}>
        <span style={{color:"#333",fontSize:10}}>📝 Anotações:</span>
        {notes.map((n,i)=>(
          <span key={i} style={{background:"#2a1010",border:"1px solid #553333",color:"#cc7070",fontSize:10,padding:"0 6px",borderRadius:3}}>
            {n} <span style={{cursor:"pointer",opacity:0.6}} onClick={()=>setNotes(u=>u.filter((_,j)=>j!==i))}>×</span>
          </span>
        ))}
        {["CPF suspeito","Cidade diverge","Nome diferente","Vencido","Pág. faltando","Rasura","Carimbo ausente","CPF duplicado"].filter(n=>!notes.includes(n)).map(n=>(
          <span key={n} onClick={()=>setNotes(u=>[...u,n])} style={{color:"#333",fontSize:10,cursor:"pointer",padding:"0 5px",borderRadius:3,border:"1px solid #181828"}}>+{n}</span>
        ))}
      </div>

      {/* Action buttons */}
      <div style={{display:"flex",gap:10}}>
        <button onClick={()=>onApprove(doc)} disabled={!canApprove} style={{flex:1,padding:"11px 0",background:canApprove?"#0a200a":"#080810",border:`1px solid ${canApprove?"#337733":"#1a1a1a"}`,color:canApprove?"#55bb55":"#222",borderRadius:5,cursor:canApprove?"pointer":"default",fontFamily:"'Courier New',monospace",fontSize:13,fontWeight:"bold",transition:"all 0.2s"}}>✓ APROVADO — DIGITALIZAR</button>
        <button onClick={()=>onReject(doc)} disabled={frozen||blackout} style={{flex:1,padding:"11px 0",background:!frozen&&!blackout?"#200a0a":"#080810",border:`1px solid ${!frozen&&!blackout?"#773333":"#1a1a1a"}`,color:!frozen&&!blackout?"#bb5555":"#222",borderRadius:5,cursor:!frozen&&!blackout?"pointer":"default",fontFamily:"'Courier New',monospace",fontSize:13,fontWeight:"bold",transition:"all 0.2s"}}>✗ REJEITAR</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHYSICAL PREP
// ═══════════════════════════════════════════════════════════════════════════════
function PhysicalPrepPanel({doc,onPrepared}){
  const [grampoOk,setGrampoOk]=useState(!doc.hasGrampo);
  const [alignOk,setAlignOk]=useState(doc.aligned);
  useEffect(()=>{
    if(grampoOk&&alignOk){const t=setTimeout(()=>onPrepared(doc.id),200);return()=>clearTimeout(t);}
  },[grampoOk,alignOk,doc.id,onPrepared]);
  return(
    <div style={{background:"#0e0e1c",border:"1px solid #cc880033",borderRadius:7,padding:11,fontFamily:"'Courier New',monospace"}}>
      <div style={{color:"#cc8800",fontSize:10,marginBottom:9,letterSpacing:1}}>⚙ PREPARAÇÃO FÍSICA DO DOCUMENTO</div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {doc.hasGrampo&&(
          <div style={{display:"flex",alignItems:"center",gap:10,background:grampoOk?"#0a180a":"#1a1000",border:`1px solid ${grampoOk?"#336633":"#664400"}`,borderRadius:5,padding:"7px 11px"}}>
            <span style={{fontSize:18}}>{grampoOk?"✅":"📎"}</span>
            <div style={{flex:1}}>
              <div style={{color:grampoOk?"#55aa55":"#cc8800",fontSize:11}}>{grampoOk?"Grampo removido":"Documento grampeado — o scanner não aceita"}</div>
            </div>
            {!grampoOk&&<button onClick={()=>setGrampoOk(true)} style={{background:"#332200",border:"1px solid #cc8800",color:"#cc8800",padding:"3px 10px",borderRadius:3,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:11}}>Remover</button>}
          </div>
        )}
        {doc.misaligned&&(
          <div style={{display:"flex",alignItems:"center",gap:10,background:alignOk?"#0a180a":"#181200",border:`1px solid ${alignOk?"#336633":"#887700"}`,borderRadius:5,padding:"7px 11px"}}>
            <span style={{fontSize:18}}>{alignOk?"✅":"📄"}</span>
            <div style={{flex:1}}>
              <div style={{color:alignOk?"#55aa55":"#aaaa00",fontSize:11}}>{alignOk?"Folhas alinhadas":"Folhas desalinhadas — digitalização vai sair torta"}</div>
            </div>
            {!alignOk&&<button onClick={()=>setAlignOk(true)} style={{background:"#221a00",border:"1px solid #aaaa00",color:"#aaaa00",padding:"3px 10px",borderRadius:3,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:11}}>Alinhar</button>}
          </div>
        )}
      </div>
      {grampoOk&&alignOk&&<div style={{color:"#55aa55",fontSize:10,marginTop:7,textAlign:"center"}}>✓ Pronto para digitalizar</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRINTER PANEL — with strikes, greve, wifi mode, death
// ═══════════════════════════════════════════════════════════════════════════════
function PrinterPanel({printer,onAction,onAddWeight,onRemoveWeight}){
  const [lcdMsg]=useState(()=>rf(PRINTER_LCD_MSGS));
  const issue=printer.currentIssue;
  const dead=printer.health<=0;
  const onStrike=printer.onStrike;
  const wifiMode=printer.wifiMode;
  const hc=printer.health>60?"#448844":printer.health>30?"#aa8800":"#aa3333";
  const moodFace=printer.mood>70?"( ◕‿◕)":printer.mood>40?"(-_-;)":printer.mood>15?"(╯°□°)╯":"(ﾉ◕ヮ◕)ﾉ✧";
  const tw=printer.weightItems.reduce((a,w)=>a+w.weight,0);
  const optimal=tw>=2&&tw<=5;

  return(
    <div style={{background:"#111122",border:`2px solid ${dead?"#660000":onStrike?"#aa3300":wifiMode?"#0066aa":issue?issue.color+"88":"#1e1e2e"}`,borderRadius:8,padding:13,fontFamily:"'Courier New',monospace",boxShadow:dead?"0 0 20px #66000066":onStrike?"0 0 16px #aa330044":"none",transition:"all 0.3s"}}>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:9}}>
        <div style={{fontSize:30,position:"relative",filter:dead?"grayscale(1)":"none"}}>
          🖨️
          {printer.weightItems.length>0&&<span style={{position:"absolute",top:-6,right:-8,fontSize:12}}>{printer.weightItems[printer.weightItems.length-1].emoji}</span>}
          {wifiMode&&<span style={{position:"absolute",top:-6,left:-8,fontSize:12,animation:"blink 0.5s infinite"}}>📶</span>}
        </div>
        <div style={{flex:1}}>
          <div style={{color:"#333",fontSize:9}}>{PRINTER_NAME.toUpperCase()} — SCANJET PRO X-2000</div>
          {dead
            ?<div style={{color:"#aa3333",fontSize:11,animation:"blink 1s infinite"}}>💀 FORA DE SERVIÇO</div>
            :onStrike
            ?<div style={{color:"#cc6600",fontSize:11,animation:"blink 0.8s infinite"}}>✊ EM GREVE</div>
            :<div style={{color:"#336633",fontSize:11}}>{moodFace}</div>
          }
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{color:"#333",fontSize:9}}>SAÚDE</div>
          <div style={{color:hc,fontSize:15,fontWeight:"bold"}}>{printer.health}%</div>
        </div>
      </div>

      {/* Health bar */}
      <div style={{height:4,background:"#0a0a14",borderRadius:2,marginBottom:9,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${printer.health}%`,background:hc,transition:"width 0.5s,background 0.5s",borderRadius:2}}/>
      </div>

      {/* LCD message */}
      {!dead&&!onStrike&&(
        <div style={{background:"#0a1a0a",border:"1px solid #1a2a1a",borderRadius:3,padding:"4px 8px",marginBottom:9,fontSize:9,color:"#449944",fontFamily:"'Courier New',monospace"}}>
          📟 {lcdMsg}
        </div>
      )}

      {/* States */}
      {dead&&(
        <div style={{background:"#1a0000",border:"1px solid #660000",borderRadius:5,padding:10,marginBottom:9}}>
          <div style={{color:"#cc3333",fontWeight:"bold",fontSize:12}}>💀 IMPRESSORA MORTA</div>
          <div style={{color:"#663333",fontSize:10,marginTop:4}}>Aguardando técnico... (-5 pts/s)</div>
          <div style={{color:"#443333",fontSize:9,marginTop:3}}>Ela morreu de tantos tapinhas. Ou falta de toner. Ou os dois.</div>
        </div>
      )}
      {onStrike&&!dead&&(
        <div style={{background:"#1a0800",border:"1px solid #cc6600",borderRadius:5,padding:10,marginBottom:9}}>
          <div style={{color:"#cc6600",fontWeight:"bold",fontSize:12}}>✊ EM GREVE — {printer.strikeCountdown}s</div>
          <div style={{color:"#664400",fontSize:10,marginTop:3}}>Não faça nada. Ela está negociando com o sindicato.</div>
        </div>
      )}
      {wifiMode&&!dead&&!onStrike&&(
        <div style={{background:"#000a1a",border:"1px solid #0066aa",borderRadius:5,padding:10,marginBottom:9,animation:"blink 1s infinite"}}>
          <div style={{color:"#0088ff",fontWeight:"bold",fontSize:12}}>📶 IMPRIMINDO RECEITAS</div>
          <div style={{color:"#004488",fontSize:10,marginTop:3}}>Clique em REINICIAR para parar.</div>
        </div>
      )}
      {!dead&&!onStrike&&!wifiMode&&issue&&(
        <div style={{background:`${issue.color}15`,border:`1px solid ${issue.color}55`,borderRadius:5,padding:8,marginBottom:9,animation:"blink 1s infinite"}}>
          <div style={{color:issue.color,fontWeight:"bold",fontSize:12}}>⚠ {issue.label}</div>
          <div style={{color:"#666",fontSize:10,marginTop:2}}>
            Ação correta: {issue.fix==="pull"?"Puxar papel":issue.fix==="replace"?"Trocar toner":issue.fix==="wait"?"Resfriar":issue.fix==="align"?"Reiniciar":"Reiniciar"}
          </div>
        </div>
      )}
      {!dead&&!onStrike&&!wifiMode&&!issue&&(
        <div style={{color:"#336633",fontSize:10,marginBottom:9}}>✓ {optimal?"PRONTA (peso ideal)":"PRONTA"}</div>
      )}

      {/* Buttons */}
      {!dead&&(
        <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
          {[
            {label:"🤜 Tapinha",action:"tap",color:"#cc5500"},
            {label:"📄 Puxar",  action:"pull",   color:"#aa9900"},
            {label:"🔄 Reiniciar",action:"restart",color:"#3366aa"},
            {label:"🖊️ Toner", action:"replace", color:"#666"},
            {label:"❄️ Resfriar",action:"wait",  color:"#006688"},
          ].map(b=>(
            <button key={b.action} onClick={()=>onAction(b.action)}
              style={{background:`${b.color}18`,border:`1px solid ${b.color}55`,color:b.color,padding:"3px 7px",borderRadius:3,cursor:"pointer",fontSize:10,fontFamily:"'Courier New',monospace"}}
              onMouseEnter={e=>e.target.style.background=`${b.color}30`}
              onMouseLeave={e=>e.target.style.background=`${b.color}18`}
            >{b.label}</button>
          ))}
        </div>
      )}

      {/* Weight */}
      <div style={{borderTop:"1px solid #1a1a2e",paddingTop:10}}>
        <div style={{color:"#252535",fontSize:9,marginBottom:6}}>⚖ PESO IMPROVISADO (ideal: 2–5 kg)</div>
        <div style={{color:optimal?"#336633":tw>5?"#aa3333":"#555",fontSize:9,marginBottom:5}}>
          Atual: {tw}kg {optimal?"✓ ideal":tw>5?"⚠ pesado demais":tw>0?"⚠ muito leve":"— sem peso"}
        </div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {WEIGHT_ITEMS.map(item=>{
            const on=printer.weightItems.some(w=>w.id===item.id);
            return(
              <button key={item.id} onClick={()=>on?onRemoveWeight(item.id):onAddWeight(item)}
                style={{background:on?"#0a1a0a":"#0a0a14",border:`1px solid ${on?"#336633":"#1a1a2e"}`,color:on?"#449944":"#444",padding:"3px 7px",borderRadius:3,cursor:"pointer",fontSize:11,fontFamily:"'Courier New',monospace",transition:"all 0.2s"}}
                title={`${item.label} (${item.weight}kg)`}
              >{item.emoji}{on?" ✓":" +"}</button>
            );
          })}
        </div>
        {printer.jammed&&!dead&&<div style={{color:"#aa3333",fontSize:10,marginTop:6,animation:"blink 0.5s infinite"}}>⛔ Bloqueada — conserte primeiro</div>}
      </div>

      {/* Reputation */}
      <div style={{marginTop:10,borderTop:"1px solid #1a1a2e",paddingTop:8}}>
        <div style={{color:"#252535",fontSize:9,marginBottom:4}}>REPUTAÇÃO COM {PRINTER_NAME.toUpperCase()}</div>
        <div style={{height:3,background:"#0a0a14",borderRadius:2,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${printer.reputation}%`,background:printer.reputation>60?"#336633":printer.reputation>30?"#886600":"#660000",transition:"width 0.5s",borderRadius:2}}/>
        </div>
        <div style={{color:printer.reputation>60?"#336633":printer.reputation>30?"#886600":"#660000",fontSize:9,marginTop:3}}>
          {printer.reputation>70?"Ela gosta de você (avisa antes de travar)":printer.reputation>40?"Relação neutra":"Ela te odeia (falha silenciosamente)"}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENT CARD
// ═══════════════════════════════════════════════════════════════════════════════
function DocumentCard({doc,selected,onClick,now}){
  const urgent=doc.urgentDeadline&&now<doc.urgentDeadline;
  const urgentExpired=doc.urgentDeadline&&now>doc.urgentDeadline;
  return(
    <div onClick={onClick} style={{background:selected?"#0e1622":"#080810",border:`2px solid ${selected?"#3a6aaa":urgent?"#cc222288":urgentExpired?"#441111":"#111"}`,borderRadius:5,padding:"9px 11px",cursor:"pointer",transition:"all 0.15s",position:"relative"}}>
      {urgent&&<div style={{position:"absolute",top:4,right:6,color:"#cc2222",fontSize:9,animation:"blink 0.6s infinite"}}>⏰ URGENTE</div>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <span style={{background:"#111122",border:"1px solid #222233",color:"#6688aa",padding:"1px 5px",borderRadius:2,fontSize:9}}>{doc.type}</span>
          <div style={{color:"#bbb",fontSize:11,marginTop:4,fontWeight:"bold"}}>{doc.data.name}</div>
          <div style={{color:"#333",fontSize:10}}>{doc.data.cpf}</div>
        </div>
        <div style={{textAlign:"right",fontSize:10}}>
          {!doc.physicalReady&&<div style={{color:"#886600"}}>⚙</div>}
          {doc.scanned&&<div style={{color:"#336633"}}>✓</div>}
          {doc.savedPath&&<div style={{color:"#3355aa"}}>💾</div>}
          <div style={{color:"#252535",marginTop:2}}>{doc.pages}/{doc.expectedPages}p</div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FILE SAVE MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function FileSaveModal({doc,onSave,onClose}){
  const [path,setPath]=useState("");
  const folders=Object.values(CORRECT_FOLDER);
  const correct=CORRECT_FOLDER[doc.type];
  return(
    <div style={{position:"fixed",inset:0,background:"#000000cc",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100}}>
      <div style={{background:"#0a0a18",border:"1px solid #1a1a2e",borderRadius:9,padding:22,width:400,fontFamily:"'Courier New',monospace"}}>
        <div style={{color:"#ccc",fontSize:14,fontWeight:"bold",marginBottom:4}}>💾 SALVAR ARQUIVO</div>
        <div style={{color:"#333",fontSize:10,marginBottom:14}}>{doc.type}_{String(doc.id).padStart(4,"0")}_{doc.data.name.replace(/ /g,"_")}.pdf</div>
        <div style={{color:"#444",fontSize:10,marginBottom:8}}>Selecione o diretório:</div>
        <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:16}}>
          {folders.map(f=>(
            <div key={f} onClick={()=>setPath(f)} style={{padding:"7px 12px",background:path===f?"#0a1a2a":"#0f0f18",border:`1px solid ${path===f?"#3a6aaa":"#1a1a2e"}`,borderRadius:4,cursor:"pointer",fontSize:11,color:path===f?"#6a9eff":"#444",transition:"all 0.1s"}}>📁 {f}</div>
          ))}
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>path&&onSave(doc,path,path===correct)} disabled={!path} style={{flex:1,padding:"9px 0",background:path?"#0a1a2a":"#0a0a14",border:`1px solid ${path?"#3a6aaa":"#1a1a2e"}`,color:path?"#6a9eff":"#333",borderRadius:4,cursor:path?"pointer":"default",fontFamily:"'Courier New',monospace",fontSize:12,fontWeight:"bold"}}>SALVAR AQUI</button>
          <button onClick={onClose} style={{padding:"9px 14px",background:"transparent",border:"1px solid #1a1a2e",color:"#444",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:11}}>✕</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVENT BANNER
// ═══════════════════════════════════════════════════════════════════════════════
function EventBanner({event,onColleagueAccept,onColleagueDecline}){
  if(!event) return null;
  const isColleague=event.effect==="colleague";
  return(
    <div style={{position:"fixed",top:58,left:"50%",transform:"translateX(-50%)",background:"#130820",border:"1px solid #7744aa",borderRadius:8,padding:"11px 20px",zIndex:150,fontFamily:"'Courier New',monospace",maxWidth:420,textAlign:"center",boxShadow:"0 0 20px #7744aa33",animation:"slideIn 0.3s ease"}}>
      <div style={{fontSize:26,marginBottom:3}}>{event.emoji}</div>
      <div style={{color:"#cc99ff",fontWeight:"bold",fontSize:12,marginBottom:3}}>{event.title}</div>
      <div style={{color:"#666",fontSize:10,marginBottom:isColleague?10:0}}>{event.desc}</div>
      {isColleague&&(
        <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:8}}>
          <button onClick={onColleagueAccept} style={{background:"#0a2a0a",border:"1px solid #336633",color:"#55aa55",padding:"5px 14px",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:11}}>Aceitar (+15s)</button>
          <button onClick={onColleagueDecline} style={{background:"#1a0a0a",border:"1px solid #554444",color:"#776666",padding:"5px 14px",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:11}}>Recusar</button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MEMORANDO MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function MemorandoModal({memo,onClose}){
  if(!memo) return null;
  return(
    <div style={{position:"fixed",inset:0,background:"#000000cc",display:"flex",alignItems:"center",justifyContent:"center",zIndex:180}}>
      <div style={{background:"#f5f0e0",border:"1px solid #c0a060",borderRadius:6,padding:24,maxWidth:420,width:"90%",fontFamily:"Georgia,serif",boxShadow:"0 8px 30px #00000066"}}>
        <div style={{borderBottom:"2px solid #8b4513",paddingBottom:8,marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:"bold",color:"#8b4513",letterSpacing:1}}>📋 MEMORANDO INTERNO</div>
          <div style={{fontSize:9,color:"#888",marginTop:2}}>Digitalizações Infernais Ltda. — Circulação Obrigatória</div>
        </div>
        <div style={{color:"#222",fontSize:12,lineHeight:1.8,marginBottom:16}}>{memo.text}</div>
        <div style={{display:"flex",justifyContent:"flex-end"}}>
          <button onClick={onClose} style={{background:"#8b4513",border:"none",color:"#fff",padding:"7px 20px",borderRadius:4,cursor:"pointer",fontFamily:"Georgia,serif",fontSize:11,fontWeight:"bold"}}>Ciente. Assinar e arquivar.</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ACHIEVEMENT TOAST
// ═══════════════════════════════════════════════════════════════════════════════
function AchievementPopup({achievement}){
  if(!achievement) return null;
  return(
    <div style={{position:"fixed",top:18,right:18,background:"#1a1200",border:"1px solid #aa8800",borderRadius:8,padding:"12px 16px",zIndex:250,fontFamily:"'Courier New',monospace",animation:"slideIn 0.3s ease",boxShadow:"0 0 20px #aa880044"}}>
      <div style={{color:"#aa8800",fontSize:9,letterSpacing:1,marginBottom:3}}>🏆 CONQUISTA DESBLOQUEADA</div>
      <div style={{color:"#ffcc00",fontSize:13,fontWeight:"bold"}}>{achievement.emoji} {achievement.label}</div>
      <div style={{color:"#886600",fontSize:10,marginTop:2}}>{achievement.desc}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DAILY LOG MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function DailyLogModal({stats,level,score,timeLeft,onClose}){
  const grade=score>800?"S":score>500?"A":score>300?"B":score>150?"C":"D";
  const gc={S:"#ffcc00",A:"#44bb44",B:"#4488ff",C:"#dd8800",D:"#dd4444"}[grade];
  const lines=[
    `> RELATÓRIO DIÁRIO — DIA ${level}`,`> =============================`,
    `> Aprovados corretamente: ${stats.approved}`,
    `> Rejeitados corretamente: ${stats.correctRejections||0}`,
    `> Erros cometidos:        ${stats.errors}`,
    `> Pastas erradas:         ${stats.wrongFolders||0}`,
    `> Tapinhas na impressora: ${stats.taps||0}`,
    `> =============================`,
    `> Pontuação do dia: ${score} pts`,
    `> Nota: ${grade}`,
    `> Tempo restante: ${p2(Math.floor(timeLeft/60))}:${p2(timeLeft%60)}`,
    `> =============================`,
    grade==="D"?"> STATUS: AVISO FORMAL EMITIDO":grade==="C"?"> STATUS: DESEMPENHO INSUFICIENTE":grade==="B"?"> STATUS: DENTRO DO ESPERADO":grade==="A"?"> STATUS: PARABÉNS (quase)":"> STATUS: EXCEPCIONAL. SUSPEITO.",
  ];
  return(
    <div style={{position:"fixed",inset:0,background:"#000000ee",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>
      <div style={{background:"#050510",border:"1px solid #1a2a1a",borderRadius:8,padding:24,maxWidth:440,width:"90%",fontFamily:"'Courier New',monospace"}}>
        <div style={{color:"#336633",fontSize:10,marginBottom:12,letterSpacing:1}}>📊 FIM DO DIA — RELATÓRIO GERADO</div>
        <div style={{background:"#020a02",border:"1px solid #0a1a0a",borderRadius:4,padding:14,marginBottom:16,fontSize:11,lineHeight:1.9}}>
          {lines.map((l,i)=>(
            <div key={i} style={{color:l.includes("Nota")?"":l.includes("Pontuação")?gc:l.includes("STATUS")?gc:"#336633"}}>{l}</div>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{color:gc,fontSize:22,fontWeight:"bold"}}>{grade}</div>
          <button onClick={onClose} style={{background:"#0a1a0a",border:"1px solid #336633",color:"#55aa55",padding:"8px 22px",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:12,fontWeight:"bold"}}>Próximo dia ▶</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STORY DIALOG
// ═══════════════════════════════════════════════════════════════════════════════
function StoryDialog({day,onClose}){
  const d=STORY_DAYS[Math.min(day-1,STORY_DAYS.length-1)];
  const memo=MEMORANDOS.find(m=>m.day===day);
  const [showMemo,setShowMemo]=useState(false);
  return(
    <>
      <div style={{position:"fixed",inset:0,background:"#000000ee",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:200,paddingBottom:36}}>
        <div style={{background:"#0a0a18",border:"1px solid #1a1a2e",borderRadius:9,padding:22,maxWidth:480,width:"90%",fontFamily:"'Courier New',monospace",animation:"slideIn 0.4s ease"}}>
          <div style={{display:"flex",gap:14,alignItems:"flex-start",marginBottom:14}}>
            <div style={{fontSize:38}}>{d.bossEmoji}</div>
            <div>
              <div style={{color:"#4a9eff",fontSize:10,marginBottom:5,letterSpacing:1}}>{d.bossName.toUpperCase()} — DIA {day}</div>
              <div style={{color:"#bbb",fontSize:13,lineHeight:1.8}}>"{d.boss}"</div>
            </div>
          </div>
          {memo&&(
            <div onClick={()=>setShowMemo(true)} style={{background:"#1a1400",border:"1px solid #664400",borderRadius:4,padding:"7px 12px",marginBottom:14,cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:16}}>📋</span>
              <div>
                <div style={{color:"#aa8800",fontSize:10,fontWeight:"bold"}}>Memorando novo na sua mesa</div>
                <div style={{color:"#554400",fontSize:9}}>Clique para ler — leitura obrigatória</div>
              </div>
            </div>
          )}
          <div style={{display:"flex",justifyContent:"flex-end"}}>
            <button onClick={onClose} style={{background:"#4a9eff",border:"none",color:"#000",padding:"8px 22px",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:12,fontWeight:"bold"}}>Ao trabalho. ▶</button>
          </div>
        </div>
      </div>
      {showMemo&&memo&&<MemorandoModal memo={memo} onClose={()=>setShowMemo(false)}/>}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TUTORIAL OVERLAY
// ═══════════════════════════════════════════════════════════════════════════════
function TutorialOverlay({step,onNext,onSkip}){
  const s=TUTORIAL_STEPS[step];
  if(!s) return null;
  const isLast=step===TUTORIAL_STEPS.length-1;
  return(
    <div style={{position:"fixed",inset:0,background:"#000000cc",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}}>
      <div style={{background:"#0c0c20",border:"2px solid #3355aa",borderRadius:10,padding:28,maxWidth:500,width:"90%",fontFamily:"'Courier New',monospace",animation:"slideIn 0.3s ease",boxShadow:"0 0 40px #3355aa33"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
          <div style={{fontSize:40}}>{s.emoji}</div>
          <div>
            <div style={{color:"#6a9eff",fontSize:10,letterSpacing:2,marginBottom:4}}>TUTORIAL — {step+1}/{TUTORIAL_STEPS.length}</div>
            <div style={{color:"#fff",fontSize:16,fontWeight:"bold"}}>{s.title}</div>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{height:3,background:"#1a1a2e",borderRadius:2,marginBottom:16,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${((step+1)/TUTORIAL_STEPS.length)*100}%`,background:"#3355aa",borderRadius:2,transition:"width 0.3s"}}/>
        </div>
        <div style={{color:"#aaa",fontSize:13,lineHeight:1.9,marginBottom:20,background:"#080818",border:"1px solid #1a1a2e",borderRadius:6,padding:"12px 16px"}}>{s.content}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <button onClick={onSkip} style={{background:"transparent",border:"1px solid #222",color:"#444",padding:"7px 14px",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:11}}>Pular tutorial</button>
          <button onClick={onNext} style={{background:"#3355aa",border:"none",color:"#fff",padding:"9px 24px",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:13,fontWeight:"bold"}}>
            {isLast?"Começar! 🚀":"Próximo →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════════════════════════════════
function Toast({messages}){
  return(
    <div style={{position:"fixed",bottom:18,right:18,display:"flex",flexDirection:"column-reverse",gap:5,zIndex:300}}>
      {messages.map(m=>(
        <div key={m.id} style={{background:m.type==="error"?"#1c0808":m.type==="success"?"#081808":m.type==="achievement"?"#1a1200":"#080818",border:`1px solid ${m.type==="error"?"#883333":m.type==="success"?"#338833":m.type==="achievement"?"#aa8800":"#334488"}`,color:m.type==="error"?"#cc5555":m.type==="success"?"#55aa55":m.type==="achievement"?"#ffcc00":"#5577cc",padding:"6px 11px",borderRadius:5,fontFamily:"'Courier New',monospace",fontSize:11,animation:"slideIn 0.2s ease",maxWidth:300}}>{m.text}</div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN GAME
// ═══════════════════════════════════════════════════════════════════════════════
export default function BurocraciaSimulator(){
  const [phase,setPhase]=useState("intro"); // intro|tutorial|playing|gameover
  const [tutorialStep,setTutorialStep]=useState(0);
  const [level,setLevel]=useState(1);
  const [score,setScore]=useState(0);
  const [docs,setDocs]=useState([]);
  const [selectedDoc,setSelectedDoc]=useState(null);
  const [saveModal,setSaveModal]=useState(null);
  const [timeLeft,setTimeLeft]=useState(200);
  const [frozen,setFrozen]=useState(false);
  const [blackout,setBlackout]=useState(false);
  const [activeEvent,setActiveEvent]=useState(null);
  const [toasts,setToasts]=useState([]);
  const [showStory,setShowStory]=useState(true);
  const [showDailyLog,setShowDailyLog]=useState(false);
  const [pendingNextLevel,setPendingNextLevel]=useState(null);
  const [now,setNow]=useState(Date.now());
  const [achievement,setAchievement]=useState(null);
  const [unlockedAchievements,setUnlockedAchievements]=useState([]);
  const [stats,setStats]=useState({approved:0,rejected:0,saved:0,errors:0,taps:0,wrongFolders:0,correctRejections:0,dayErrors:0,timeBonus:0,internCorrect:0,printerStrikes:0});
  const [printer,setPrinter]=useState({health:100,mood:80,jammed:false,currentIssue:null,tapCount:0,weightItems:[],reputation:60,onStrike:false,strikeCountdown:0,wifiMode:false,deathTimer:0});

  const toastId=useRef(0);
  const timerRef=useRef(null);
  const eventRef=useRef(null);
  const printerRef=useRef(null);
  const deathRef=useRef(null);
  const strikeRef=useRef(null);
  const nowRef=useRef(null);
  const docsRef=useRef(docs);
  const statsRef=useRef(stats);
  const printerStateRef=useRef(printer);
  useEffect(()=>{docsRef.current=docs;},[docs]);
  useEffect(()=>{statsRef.current=stats;},[stats]);
  useEffect(()=>{printerStateRef.current=printer;},[printer]);

  const addToast=useCallback((text,type="info")=>{
    const id=++toastId.current;
    setToasts(t=>[...t.slice(-5),{id,text,type}]);
    setTimeout(()=>setToasts(t=>t.filter(m=>m.id!==id)),3500);
  },[]);

  const triggerAchievement=useCallback((ach)=>{
    setUnlockedAchievements(u=>{
      if(u.includes(ach.id)) return u;
      setAchievement(ach);
      setTimeout(()=>setAchievement(null),4000);
      addToast(`🏆 ${ach.emoji} ${ach.label} desbloqueado!`,"achievement");
      return [...u,ach.id];
    });
  },[addToast]);

  const checkAchievements=useCallback((newStats,newPrinter)=>{
    ACHIEVEMENTS.forEach(a=>{
      if(a.check(newStats||statsRef.current)) triggerAchievement(a);
    });
    if(newPrinter?.onStrike&&!(statsRef.current.printerStrikes>0)){
      const a=ACHIEVEMENTS.find(x=>x.id==="greve");
      if(a) triggerAchievement(a);
    }
  },[triggerAchievement]);

  // Now ticker
  useEffect(()=>{
    nowRef.current=setInterval(()=>setNow(Date.now()),1000);
    return()=>clearInterval(nowRef.current);
  },[]);

  // Main timer
  useEffect(()=>{
    if(phase!=="playing") return;
    timerRef.current=setInterval(()=>{
      setTimeLeft(t=>{
        if(t<=1){clearInterval(timerRef.current);setPhase("gameover");return 0;}
        return t-1;
      });
    },1000);
    return()=>clearInterval(timerRef.current);
  },[phase]);

  // Printer death drain
  useEffect(()=>{
    if(phase!=="playing") return;
    deathRef.current=setInterval(()=>{
      const p=printerStateRef.current;
      if(p.health<=0&&!p.onStrike){
        setScore(s=>Math.max(0,s-5));
        addToast("💀 Técnico ainda não chegou... -5 pts","error");
      }
    },2000);
    return()=>clearInterval(deathRef.current);
  },[phase,addToast]);

  // Strike countdown
  useEffect(()=>{
    if(phase!=="playing") return;
    strikeRef.current=setInterval(()=>{
      setPrinter(p=>{
        if(!p.onStrike) return p;
        const c=p.strikeCountdown-1;
        if(c<=0){
          addToast(`✊ ${PRINTER_NAME} voltou da greve. Por ora.`,"info");
          return{...p,onStrike:false,strikeCountdown:0,health:Math.min(100,p.health+10),jammed:false,currentIssue:null};
        }
        return{...p,strikeCountdown:c};
      });
    },1000);
    return()=>clearInterval(strikeRef.current);
  },[phase,addToast]);

  // Random events
  useEffect(()=>{
    if(phase!=="playing") return;
    eventRef.current=setInterval(()=>{
      if(activeEvent||Math.random()>0.28) return;
      const ev=rf(RANDOM_EVENTS.filter(e=>e.id!=="wifi"||!printerStateRef.current.wifiMode));
      setActiveEvent(ev);
      if(ev.effect==="freeze"||ev.effect==="block"||ev.effect==="meeting") setFrozen(true);
      if(ev.effect==="blackout"){setBlackout(true);setTimeout(()=>setBlackout(false),ev.duration);}
      if(ev.effect==="printer_reset"){setPrinter(p=>({...p,jammed:false,currentIssue:null,mood:Math.max(0,p.mood-10),reputation:Math.max(0,p.reputation-5)}));addToast("⚡ Impressora reiniciada pelo apagão!","info");}
      if(ev.effect==="penalty"){setScore(s=>Math.max(0,s-15));addToast("📞 Cliente furioso! -15 pts","error");}
      if(ev.effect==="staple"){setDocs(ds=>ds.map(d=>!d.scanned&&!d.savedPath&&Math.random()>0.55?{...d,hasGrampo:true,physicalReady:false}:d));addToast("☕ Café molhou docs — re-prepare alguns!","error");}
      if(ev.effect==="wifi_print"){setPrinter(p=>({...p,wifiMode:true,jammed:true}));return;}
      if(ev.effect==="intern"){
        const pendingDocs=docsRef.current.filter(d=>!d.scanned&&!d.savedPath);
        if(pendingDocs.length>0){
          const target=rf(pendingDocs);
          const correct=Math.random()>0.5;
          if(correct){
            addToast(`🧑‍💼 Estagiário processou ${target.type} corretamente! +10 pts`,"success");
            setScore(s=>s+10);
            setDocs(ds=>ds.map(d=>d.id===target.id?{...d,scanned:true}:d));
            setStats(s=>{const ns={...s,internCorrect:(s.internCorrect||0)+1};checkAchievements(ns,null);return ns;});
          } else {
            addToast("🧑‍💼 Estagiário rejeitou um doc válido (ou aprovou um inválido)... -20 pts","error");
            setScore(s=>Math.max(0,s-20));
            setDocs(ds=>ds.filter(d=>d.id!==target.id));
          }
        }
      }
      if(ev.id!=="colleague") setTimeout(()=>{setActiveEvent(null);setFrozen(false);},ev.duration);
    },14000);
    return()=>clearInterval(eventRef.current);
  },[phase,activeEvent,addToast,checkAchievements]);

  // Printer events
  useEffect(()=>{
    if(phase!=="playing") return;
    printerRef.current=setInterval(()=>{
      const p=printerStateRef.current;
      if(p.health<=0||p.onStrike||p.wifiMode) return;
      if(Math.random()<0.18+level*0.04){
        const ev=rf(PRINTER_EVENTS);
        // if reputation high, warn player
        if(p.reputation>70) addToast(`⚠ ${PRINTER_NAME} avisa: ${ev.label} iminente!`,"info");
        setPrinter(prev=>({...prev,currentIssue:ev,jammed:true,mood:Math.max(0,prev.mood-15),health:Math.max(0,prev.health-7)}));
        if(p.reputation<=40){
          // fail silently (no toast for low reputation)
        } else {
          addToast(`🖨️ ${ev.label}`,"error");
        }
      }
    },9000);
    return()=>clearInterval(printerRef.current);
  },[phase,level,addToast]);

  function handlePrinterAction(action){
    setPrinter(p=>{
      if(p.health<=0) return p;
      if(p.wifiMode&&action==="restart"){
        addToast(`📶 ${PRINTER_NAME} parou de imprimir receitas.`,"success");
        return{...p,wifiMode:false,jammed:false,currentIssue:null};
      }
      const issue=p.currentIssue;
      const correct=issue&&issue.fix===action;
      if(action==="tap"){
        const newTaps=(p.tapCount||0)+1;
        setStats(s=>{const ns={...s,taps:(s.taps||0)+1};checkAchievements(ns,null);return ns;});
        // greve trigger
        if(newTaps>0&&newTaps%10===0){
          addToast(`✊ ${PRINTER_NAME} entrou em GREVE após ${newTaps} tapinhas!`,"error");
          setStats(s=>{const ns={...s,printerStrikes:(s.printerStrikes||0)+1};checkAchievements(ns,{onStrike:true});return ns;});
          return{...p,onStrike:true,strikeCountdown:20,jammed:true,tapCount:newTaps,reputation:Math.max(0,p.reputation-15)};
        }
        const r=Math.random();
        if(r<0.25&&p.jammed){addToast("🤜 Tapinha resolveu! Milagre.","success");return{...p,jammed:false,currentIssue:null,tapCount:newTaps,mood:Math.min(100,p.mood+5),reputation:Math.max(0,p.reputation-2)};}
        if(r<0.55){addToast("🤜 Tapinha... sem efeito.","info");return{...p,tapCount:newTaps,reputation:Math.max(0,p.reputation-1)};}
        addToast("🤜 PIOROU! Ela ficou furiosa.","error");
        return{...p,health:Math.max(0,p.health-14),mood:Math.max(0,p.mood-22),tapCount:newTaps,reputation:Math.max(0,p.reputation-5)};
      }
      if(correct){addToast(`✓ Consertado: ${issue.label}`,"success");return{...p,jammed:false,currentIssue:null,mood:Math.min(100,p.mood+12),reputation:Math.min(100,p.reputation+3)};}
      if(p.jammed){addToast("❌ Ação incorreta.","error");return{...p,health:Math.max(0,p.health-5),reputation:Math.max(0,p.reputation-2)};}
      addToast("A impressora está bem. Por enquanto.","info");
      return p;
    });
  }

  function handleAddWeight(item){
    setPrinter(p=>{
      const tw=p.weightItems.reduce((a,w)=>a+w.weight,0)+item.weight;
      if(tw>7){addToast("Pesado demais! O alimentador vai quebrar!","error");return{...p,health:Math.max(0,p.health-10)};}
      addToast(`${item.emoji} ${item.label} colocado.`,"info");
      return{...p,weightItems:[...p.weightItems,item]};
    });
  }

  function handleRemoveWeight(id){
    setPrinter(p=>{const item=p.weightItems.find(w=>w.id===id);if(item)addToast(`${item.emoji} ${item.label} removido.`,"info");return{...p,weightItems:p.weightItems.filter(w=>w.id!==id)};});
  }

  function handlePrepared(docId){
    setDocs(ds=>ds.map(d=>d.id===docId?{...d,physicalReady:true,aligned:true,hasGrampo:false}:d));
    setSelectedDoc(prev=>prev?.id===docId?{...prev,physicalReady:true,aligned:true,hasGrampo:false}:prev);
    addToast("⚙ Documento preparado!","success");
  }

  function handleApprove(doc){
    if(printer.health<=0){addToast("💀 Impressora morta — aguarde o técnico.","error");return;}
    if(printer.jammed){addToast("⛔ Impressora travada!","error");return;}
    if(!doc.physicalReady){addToast("⚙ Prepare o documento primeiro!","error");return;}
    const tw=printer.weightItems.reduce((a,w)=>a+w.weight,0);
    if(tw<2&&Math.random()>0.45){addToast("⚠ Sem peso suficiente — digitalização torta! -10 pts","error");setScore(s=>Math.max(0,s-10));}
    if(!doc.isValid){
      const pen=35+(doc.issues.length>2?20:0);
      setScore(s=>Math.max(0,s-pen));
      setStats(s=>{const ns={...s,errors:s.errors+1,dayErrors:(s.dayErrors||0)+1};checkAchievements(ns,null);return ns;});
      addToast(`⚠ Aprovado com ${doc.issues.length} erro(s)! -${pen} pts`,"error");
    } else {
      const pts=50+Math.floor(timeLeft/12);
      setScore(s=>s+pts);
      setStats(s=>{const ns={...s,approved:s.approved+1};checkAchievements(ns,null);return ns;});
      addToast(`✓ Digitalizado! +${pts} pts`,"success");
    }
    const updated={...doc,scanned:true};
    setDocs(ds=>ds.map(d=>d.id===doc.id?updated:d));
    setSaveModal(updated);
    setSelectedDoc(null);
  }

  function handleReject(doc){
    if(doc.isValid){
      setScore(s=>Math.max(0,s-40));
      setStats(s=>{const ns={...s,errors:s.errors+1,dayErrors:(s.dayErrors||0)+1};checkAchievements(ns,null);return ns;});
      addToast("❌ Válido rejeitado! -40 pts","error");
    } else {
      const pts=25+doc.issues.length*5;
      setScore(s=>s+pts);
      setStats(s=>{const ns={...s,rejected:s.rejected+1,correctRejections:(s.correctRejections||0)+1};checkAchievements(ns,null);return ns;});
      addToast(`✓ Erro detectado! +${pts} pts`,"success");
    }
    setDocs(ds=>ds.filter(d=>d.id!==doc.id));
    setSelectedDoc(null);
  }

  function handleSave(doc,path,correct){
    setScore(s=>Math.max(0,s+(correct?20:-28)));
    setStats(s=>{
      const ns={...s,saved:s.saved+1,errors:correct?s.errors:s.errors+1,wrongFolders:correct?s.wrongFolders:(s.wrongFolders||0)+1,dayErrors:correct?s.dayErrors:(s.dayErrors||0)+1};
      checkAchievements(ns,null);
      return ns;
    });
    setDocs(ds=>ds.map(d=>d.id===doc.id?{...d,savedPath:path}:d));
    setSaveModal(null);
    addToast(correct?`💾 Salvo corretamente! +20 pts`:`💾 Pasta errada! -28 pts | Correto: ${CORRECT_FOLDER[doc.type]}`,correct?"success":"error");

    const remaining=docsRef.current.filter(d=>d.id!==doc.id&&!d.savedPath);
    if(remaining.length===0){
      // Day complete
      const bonus=timeLeft;
      setStats(s=>{const ns={...s,timeBonus:bonus,dayErrors:0};checkAchievements(ns,null);return ns;});
      if(stats.dayErrors===0){const a=ACHIEVEMENTS.find(x=>x.id==="perfect");if(a)triggerAchievement(a);}
      if(bonus>=120){const a=ACHIEVEMENTS.find(x=>x.id==="speedrun");if(a)triggerAchievement(a);}
      setPendingNextLevel(level+1);
      setShowDailyLog(true);
    }
  }

  function handleDailyLogClose(){
    setShowDailyLog(false);
    const next=pendingNextLevel;
    if(next){
      setLevel(next);
      setDocs(generateLevel(next));
      setTimeLeft(t=>t+70);
      setShowStory(true);
      setPendingNextLevel(null);
      addToast(`🎉 DIA ${next-1} CONCLUÍDO! +70s bônus`,"success");
    }
  }

  function handleColleagueAccept(){
    setTimeLeft(t=>t+15);
    // 40% chance of error on a random doc
    if(Math.random()<0.4){
      const targets=docsRef.current.filter(d=>!d.scanned&&!d.savedPath);
      if(targets.length>0){
        addToast("🙋 O colega assinou errado... um doc ficou inválido.","error");
        setScore(s=>Math.max(0,s-20));
      }
    } else {
      addToast("🙋 Colega assinou. Sem problemas.","success");
    }
    setActiveEvent(null);setFrozen(false);
  }
  function handleColleagueDecline(){setActiveEvent(null);setFrozen(false);}

  function startGame(withTutorial=true){
    const d=generateLevel(1);
    setDocs(d);setLevel(1);setScore(0);setTimeLeft(200);
    setPhase(withTutorial?"tutorial":"playing");
    setTutorialStep(0);setShowStory(true);
    setStats({approved:0,rejected:0,saved:0,errors:0,taps:0,wrongFolders:0,correctRejections:0,dayErrors:0,timeBonus:0,internCorrect:0,printerStrikes:0});
    setPrinter({health:100,mood:80,jammed:false,currentIssue:null,tapCount:0,weightItems:[],reputation:60,onStrike:false,strikeCountdown:0,wifiMode:false,deathTimer:0});
    setSelectedDoc(null);setSaveModal(null);setFrozen(false);setBlackout(false);setActiveEvent(null);setUnlockedAchievements([]);setPendingNextLevel(null);setShowDailyLog(false);
  }

  const tc=timeLeft>80?"#448844":timeLeft>30?"#aa8800":"#aa3333";
  const pending=docs.filter(d=>!d.savedPath&&!d.scanned);
  const scannedUnsaved=docs.filter(d=>d.scanned&&!d.savedPath);

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if(phase==="intro") return(
    <div style={{minHeight:"100vh",background:"#030307",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Courier New',monospace",backgroundImage:"radial-gradient(ellipse at 40% 55%, #0c0818 0%, #030307 65%)"}}>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes slideIn{from{transform:translateY(10px);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes flicker{0%,96%,100%{opacity:1}97%{opacity:0.5}}*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#1a1a2e}`}</style>
      <div style={{textAlign:"center",maxWidth:560,padding:40}}>
        <div style={{fontSize:52,marginBottom:14}}>🖨️</div>
        <div style={{fontSize:24,fontWeight:"bold",color:"#ccc",letterSpacing:5,marginBottom:6,animation:"flicker 4s infinite"}}>BUROCRACIA SIMULATOR</div>
        <div style={{color:"#3a5a99",fontSize:10,letterSpacing:3,marginBottom:28}}>DIGITALIZAÇÕES INFERNAIS LTDA. — v3.0</div>
        <div style={{background:"#080812",border:"1px solid #111",borderRadius:7,padding:22,marginBottom:22,textAlign:"left"}}>
          <div style={{color:"#666",fontSize:12,lineHeight:2.1}}>
            Segunda-feira, 08h47. Sua mesa está coberta de papéis.<br/>
            A {PRINTER_NAME} te observa com <span style={{color:"#886600"}}>desconfiança</span>.<br/><br/>
            <span style={{color:"#aa8800"}}>Missão:</span> digitalizar, validar e arquivar antes do fim do expediente.<br/>
            <span style={{color:"#6688aa"}}>Compare</span> documentos visualmente — <span style={{color:"#cc6666"}}>não há marcação automática de erros.</span><br/>
            <span style={{color:"#446644"}}>Prepare</span> fisicamente cada documento antes de digitalizar.<br/>
            <span style={{color:"#664488"}}>Gerencie</span> a {PRINTER_NAME} — ela tem personalidade própria.
          </div>
        </div>
        <div style={{display:"flex",gap:12,justifyContent:"center"}}>
          <button onClick={()=>startGame(true)} style={{background:"#3a5a99",border:"none",color:"#fff",padding:"12px 28px",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:13,fontWeight:"bold",letterSpacing:1}}>▶ COM TUTORIAL</button>
          <button onClick={()=>startGame(false)} style={{background:"#1a1a2e",border:"1px solid #333",color:"#666",padding:"12px 28px",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:13,letterSpacing:1}}>▷ SEM TUTORIAL</button>
        </div>
        <div style={{color:"#252535",fontSize:10,marginTop:14}}>Dica: recomendamos o tutorial na primeira vez</div>
      </div>
    </div>
  );

  // ── TUTORIAL ───────────────────────────────────────────────────────────────
  if(phase==="tutorial") return(
    <div style={{minHeight:"100vh",background:"#030307",fontFamily:"'Courier New',monospace"}}>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes slideIn{from{transform:translateY(10px);opacity:0}to{transform:translateY(0);opacity:1}}*{box-sizing:border-box}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#1a1a2e}`}</style>
      <TutorialOverlay
        step={tutorialStep}
        onNext={()=>{
          if(tutorialStep>=TUTORIAL_STEPS.length-1){setPhase("playing");}
          else setTutorialStep(s=>s+1);
        }}
        onSkip={()=>setPhase("playing")}
      />
    </div>
  );

  // ── GAME OVER ──────────────────────────────────────────────────────────────
  if(phase==="gameover"){
    const grade=score>800?"S":score>500?"A":score>300?"B":score>150?"C":"D";
    const gc={S:"#ffcc00",A:"#44bb44",B:"#4488ff",C:"#dd8800",D:"#dd4444"}[grade];
    return(
      <div style={{minHeight:"100vh",background:"#030307",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Courier New',monospace"}}>
        <div style={{textAlign:"center",maxWidth:440,padding:40}}>
          <div style={{fontSize:48,marginBottom:10}}>⏰</div>
          <div style={{fontSize:20,color:"#aa3333",fontWeight:"bold",letterSpacing:3,marginBottom:6}}>FIM DO EXPEDIENTE</div>
          <div style={{color:"#333",fontSize:11,marginBottom:22}}>
            {grade==="D"?'"Você está despedido." — Sr. Figueiredo':grade==="C"?'"Precisa melhorar muito." — Sr. Figueiredo':grade==="B"?'"Aceitável. Por hoje." — Sr. Figueiredo':grade==="A"?'"Bom trabalho. Sem aumento." — Sr. Figueiredo':'"...Quem é você?" — Sr. Figueiredo'}
          </div>
          <div style={{background:"#080812",border:"1px solid #111",borderRadius:8,padding:20,marginBottom:18}}>
            <div style={{color:gc,fontSize:44,fontWeight:"bold",marginBottom:4}}>{grade}</div>
            <div style={{color:"#aa8800",fontSize:24,fontWeight:"bold",marginBottom:14}}>{score} pts</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              {[{label:"Aprovados",val:stats.approved,color:"#448844"},{label:"Rejeitados",val:stats.rejected,color:"#aa6600"},{label:"Salvos",val:stats.saved,color:"#334488"},{label:"Erros",val:stats.errors,color:"#aa3333"}].map(s=>(
                <div key={s.label} style={{textAlign:"center"}}>
                  <div style={{color:s.color,fontSize:20,fontWeight:"bold"}}>{s.val}</div>
                  <div style={{color:"#333",fontSize:10}}>{s.label}</div>
                </div>
              ))}
            </div>
            {unlockedAchievements.length>0&&(
              <div style={{borderTop:"1px solid #111",paddingTop:10}}>
                <div style={{color:"#554400",fontSize:9,marginBottom:6,letterSpacing:1}}>CONQUISTAS</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center"}}>
                  {ACHIEVEMENTS.filter(a=>unlockedAchievements.includes(a.id)).map(a=>(
                    <span key={a.id} title={a.desc} style={{fontSize:18}}>{a.emoji}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"center"}}>
            <button onClick={()=>startGame(false)} style={{background:"#aa3333",border:"none",color:"#fff",padding:"10px 22px",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:13,fontWeight:"bold",letterSpacing:1}}>↺ DE NOVO</button>
            <button onClick={()=>setPhase("intro")} style={{background:"#1a1a2e",border:"1px solid #333",color:"#666",padding:"10px 22px",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:12}}>Menu</button>
          </div>
        </div>
      </div>
    );
  }

  // ── PLAYING ────────────────────────────────────────────────────────────────
  return(
    <div style={{minHeight:"100vh",background:"#030307",fontFamily:"'Courier New',monospace",color:"#ccc",display:"flex",flexDirection:"column"}}>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes slideIn{from{transform:translateY(8px);opacity:0}to{transform:translateY(0);opacity:1}}*{box-sizing:border-box}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#111}`}</style>

      {showStory&&<StoryDialog day={level} onClose={()=>setShowStory(false)}/>}
      {showDailyLog&&<DailyLogModal stats={stats} level={level} score={score} timeLeft={timeLeft} onClose={handleDailyLogClose}/>}
      <AchievementPopup achievement={achievement}/>
      <EventBanner event={activeEvent} onColleagueAccept={handleColleagueAccept} onColleagueDecline={handleColleagueDecline}/>

      {/* TOP BAR */}
      <div style={{background:"#060610",borderBottom:"1px solid #0f0f1a",padding:"7px 16px",display:"flex",alignItems:"center",gap:16}}>
        <div><div style={{color:"#252535",fontSize:9}}>DIA</div><div style={{color:"#4a80cc",fontSize:15,fontWeight:"bold"}}>{level}</div></div>
        <div style={{flex:1,textAlign:"center"}}>
          <div style={{color:"#151520",fontSize:9}}>DIGITALIZAÇÕES INFERNAIS LTDA.</div>
          <div style={{color:"#222235",fontSize:10}}>Sistema Documental v3.0</div>
        </div>
        {/* Achievements strip */}
        {unlockedAchievements.length>0&&(
          <div style={{display:"flex",gap:4}}>
            {ACHIEVEMENTS.filter(a=>unlockedAchievements.includes(a.id)).map(a=>(
              <span key={a.id} title={a.label} style={{fontSize:14,opacity:0.7}}>{a.emoji}</span>
            ))}
          </div>
        )}
        <div style={{textAlign:"center"}}>
          <div style={{color:"#252535",fontSize:9}}>TEMPO</div>
          <div style={{color:tc,fontSize:17,fontWeight:"bold",animation:timeLeft<30?"blink 0.8s infinite":"none"}}>{p2(Math.floor(timeLeft/60))}:{p2(timeLeft%60)}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{color:"#252535",fontSize:9}}>PONTOS</div>
          <div style={{color:"#aa8800",fontSize:15,fontWeight:"bold"}}>{score}</div>
        </div>
      </div>

      {/* LAYOUT */}
      <div style={{display:"grid",gridTemplateColumns:"220px 1fr 260px",flex:1,overflow:"hidden"}}>

        {/* LEFT — doc list */}
        <div style={{borderRight:"1px solid #0a0a14",padding:9,overflowY:"auto",background:"#050510"}}>
          <div style={{color:"#333",fontSize:9,marginBottom:7,letterSpacing:1}}>PENDENTES ({pending.length})</div>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {pending.map(doc=>(
              <DocumentCard key={doc.id} doc={doc} selected={selectedDoc?.id===doc.id} onClick={()=>setSelectedDoc(docs.find(d=>d.id===doc.id)||doc)} now={now}/>
            ))}
          </div>
          {scannedUnsaved.length>0&&(
            <>
              <div style={{color:"#334488",fontSize:9,margin:"10px 0 5px",letterSpacing:1}}>AGUARDANDO SALVAR ({scannedUnsaved.length})</div>
              {scannedUnsaved.map(doc=>(
                <div key={doc.id} onClick={()=>setSaveModal(doc)} style={{background:"#050a14",border:"1px solid #1a2a44",borderRadius:4,padding:"7px 10px",cursor:"pointer",marginBottom:4}}>
                  <div style={{color:"#4466aa",fontSize:10}}>💾 {doc.type} — {doc.data.name}</div>
                  <div style={{color:"#252535",fontSize:9}}>clique para salvar</div>
                </div>
              ))}
            </>
          )}
          {docs.filter(d=>d.savedPath).length>0&&(
            <div style={{marginTop:10,color:"#1a2a1a",fontSize:9,letterSpacing:1}}>
              ✓ {docs.filter(d=>d.savedPath).length} salvo(s)
            </div>
          )}
        </div>

        {/* CENTER */}
        <div style={{padding:14,overflowY:"auto",display:"flex",flexDirection:"column",gap:10}}>
          {selectedDoc&&!selectedDoc.physicalReady&&(
            <PhysicalPrepPanel doc={selectedDoc} onPrepared={handlePrepared}/>
          )}
          <div style={{flex:1}}>
            <InspectionPanel doc={selectedDoc} onApprove={handleApprove} onReject={handleReject} frozen={frozen} blackout={blackout}/>
          </div>
        </div>

        {/* RIGHT — printer + stats */}
        <div style={{borderLeft:"1px solid #0a0a14",padding:9,overflowY:"auto",background:"#050510",display:"flex",flexDirection:"column",gap:9}}>
          <PrinterPanel printer={printer} onAction={handlePrinterAction} onAddWeight={handleAddWeight} onRemoveWeight={handleRemoveWeight}/>

          <div style={{background:"#070710",border:"1px solid #0f0f1a",borderRadius:6,padding:11}}>
            <div style={{color:"#222233",fontSize:9,marginBottom:7,letterSpacing:1}}>ESTATÍSTICAS</div>
            {[
              {label:"Aprovados",val:stats.approved,color:"#336633"},
              {label:"Rejeitados certos",val:stats.correctRejections||0,color:"#886600"},
              {label:"Salvos",val:stats.saved,color:"#334488"},
              {label:"Erros",val:stats.errors,color:"#883333"},
              {label:"Tapinhas",val:stats.taps||0,color:"#553333"},
            ].map(s=>(
              <div key={s.label} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:"1px solid #080810"}}>
                <span style={{color:"#333",fontSize:10}}>{s.label}</span>
                <span style={{color:s.color,fontSize:11,fontWeight:"bold"}}>{s.val}</span>
              </div>
            ))}
          </div>

          <div style={{background:"#070710",border:"1px solid #0f0f1a",borderRadius:6,padding:11}}>
            <div style={{color:"#222233",fontSize:9,marginBottom:7,letterSpacing:1}}>CONQUISTAS</div>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              {ACHIEVEMENTS.map(a=>{
                const unlocked=unlockedAchievements.includes(a.id);
                return(
                  <div key={a.id} style={{display:"flex",gap:6,alignItems:"center",opacity:unlocked?1:0.25}}>
                    <span style={{fontSize:12}}>{a.emoji}</span>
                    <div>
                      <div style={{color:unlocked?"#aa8800":"#333",fontSize:10}}>{a.label}</div>
                      <div style={{color:"#252525",fontSize:9}}>{a.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{background:"#070710",border:"1px solid #0f0f1a",borderRadius:6,padding:11}}>
            <div style={{color:"#222233",fontSize:9,marginBottom:7,letterSpacing:1}}>GUIA RÁPIDO</div>
            <div style={{color:"#333",fontSize:10,lineHeight:1.9}}>
              1. Selecione documento<br/>
              2. Prepare (grampos + alinhamento)<br/>
              3. Compare doc ↔ ficha (sem dicas!)<br/>
              4. Aprove ou rejeite<br/>
              5. Salve na pasta correta<br/>
              ⚖ Coloque 2–5kg na impressora<br/>
              💡 Reputação alta = avisos antecipados
            </div>
          </div>
        </div>
      </div>

      {saveModal&&<FileSaveModal doc={saveModal} onSave={handleSave} onClose={()=>setSaveModal(null)}/>}
      <Toast messages={toasts}/>
    </div>
  );
}
