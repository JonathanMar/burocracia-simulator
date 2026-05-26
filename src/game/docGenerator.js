import { CITIES, NAMES, DOC_TYPES } from '../constants/game.js';

export const rf = arr => arr[Math.floor(Math.random()*arr.length)];
export const p2 = n => String(n).padStart(2,"0");

export function generateCPF(valid=true){
  const r=()=>Math.floor(Math.random()*9);
  const d=Array.from({length:9},r);
  if(!valid) return `${d[0]}${d[1]}${d[2]}.${d[3]}${d[4]}${d[5]}.${d[6]}${d[7]}${d[8]}-99`;
  let s1=d.reduce((a,v,i)=>a+v*(10-i),0);
  let r1=(s1*10)%11; if(r1>=10)r1=0;
  let s2=d.reduce((a,v,i)=>a+v*(11-i),0)+r1*2;
  let r2=(s2*10)%11; if(r2>=10)r2=0;
  return `${d[0]}${d[1]}${d[2]}.${d[3]}${d[4]}${d[5]}.${d[6]}${d[7]}${d[8]}-${r1}${r2}`;
}

export function genSignature() {
  const pts = [];
  let x = 10, y = 20;
  for (let i = 0; i < 6; i++) {
    x += 10 + Math.random() * 15;
    y = 15 + Math.random() * 15;
    pts.push(`${i===0?"M":"L"}${x.toFixed(0)},${y.toFixed(0)}`);
  }
  x += 8; pts.push(`Q${x+5},${y-10} ${x+10},${y}`);
  return pts.join(" ");
}

export function docsForLevel(lv) { return 3 + lv * 2; }

// Difficulty curve per level
function levelProb(lv, base, maxAdd) {
  // returns a threshold: Math.random() > threshold means the flag is TRUE
  // base = threshold at lv 1 (e.g. 0.95 = 5% chance), maxAdd = reduction at lv 5
  return Math.max(base - maxAdd * ((lv - 1) / 4), base - maxAdd);
}

export function generateDoc(id, level, allDocs=[]){
  const type = rf(DOC_TYPES), name = rf(NAMES), city = rf(CITIES);

  // --- probability thresholds scale with level ---
  const validCPF       = Math.random() > levelProb(level, 0.45, 0.20);  // lv1: 55% valid, lv5: 75% invalid
  const cityMismatch   = Math.random() > levelProb(level, 0.72, 0.20);  // lv1: 28%, lv5: 48%
  const nameMismatch   = Math.random() > levelProb(level, 0.82, 0.15);  // lv1: 18%, lv5: 33%
  const expired        = Math.random() > levelProb(level, 0.88, 0.12);  // lv1: 12%, lv5: 24%
  const missingPages   = level > 1 && Math.random() > levelProb(level, 0.82, 0.15);
  const hasGrampo      = Math.random() > 0.45;
  const misaligned     = Math.random() > 0.50;
  const hasRasura      = level > 2 && Math.random() > 0.80;
  const isDuplicate    = level > 2 && allDocs.length > 0 && Math.random() > 0.82;
  const photoMismatch  = level > 2 && Math.random() > 0.85;

  const isMultiPage    = type === "CONTRATO" || type === "PROCESSO" || type === "DECLARAÇÃO";
  const missingStamp   = level > 1 && isMultiPage && Math.random() > levelProb(level, 0.80, 0.15);

  // BUG FIX: missingSignature only from day 2+, and NOT on multi-page docs
  // that already have missingPages (signature lives on page 2 — player never sees it → silent false positive)
  const canHaveMissingSignature = level > 1 && !(isMultiPage && missingPages);
  const missingSignature = canHaveMissingSignature && Math.random() > levelProb(level, 0.88, 0.15);

  const dupSource = isDuplicate ? rf(allDocs.filter(d => !d.isDuplicate)) : null;
  const cpf = isDuplicate && dupSource ? dupSource.data.cpf : generateCPF(validCPF);
  const issueYear  = expired ? 2019 + Math.floor(Math.random() * 3) : 2024;
  const expiryYear = expired ? 2022 + Math.floor(Math.random() * 2) : 2027;
  const cnhCategory = rf(["A","B","AB","C","D","E"]);
  const cnhNumber   = `${Math.floor(Math.random() * 90000000) + 10000000}`;

  const issues = [];
  if (!validCPF && !isDuplicate) issues.push("CPF inválido");
  if (isDuplicate)               issues.push("CPF duplicado");
  if (cityMismatch)              issues.push("Cidade incompatível");
  if (nameMismatch)              issues.push("Nome divergente");
  if (expired)                   issues.push("Documento vencido");
  if (missingPages)              issues.push("Página faltando");
  if (hasRasura)                 issues.push("Rasura no CPF");
  if (missingStamp)              issues.push("Carimbo ausente");
  if (missingSignature)          issues.push("Assinatura ausente");
  if (photoMismatch)             issues.push("Foto suspeita");

  // Cap: at most 3 issues per doc (avoid unfair impossible docs)
  while (issues.length > 3) issues.pop();
  const isValid = issues.length === 0;

  return {
    id, type,
    pages: missingPages ? 1 : (isMultiPage ? 2 : 1),
    expectedPages: isMultiPage ? 2 : 1,
    data: {
      name, city, cpf,
      formCity:  cityMismatch ? rf(CITIES.filter(c => c !== city)) : city,
      formName:  nameMismatch ? rf(NAMES.filter(n => n !== name))  : name,
      issueDate: `${p2(Math.floor(Math.random()*28)+1)}/${p2(Math.floor(Math.random()*12)+1)}/${issueYear}`,
      expiryDate:`31/12/${expiryYear}`,
      rg:   `${Math.floor(Math.random()*90000000)+10000000}-${Math.floor(Math.random()*9)}`,
      organ: rf(["SSP/SP","SSP/RJ","SSP/MG","DETRAN/PR","SSP/BA","DETRAN/RS"]),
      cnhCategory, cnhNumber,
      signature:    missingSignature ? null : genSignature(),
      photoMismatch,
      cid:    `${rf(["J00","I10","F32","K21","M54","Z76","R50"])}.${Math.floor(Math.random()*9)}`,
      doctor: rf(["Dr. Henrique Costa","Dra. Sandra Melo","Dr. Paulo Ramos","Dra. Vera Lima"]),
      crm:    `CRM-SP ${Math.floor(Math.random()*90000)+10000}`,
    },
    issues, isValid,
    scanned: false, savedPath: null,
    aligned: !misaligned, hasGrampo, misaligned,
    physicalReady: !misaligned && !hasGrampo,
    hasRasura, missingStamp, missingSignature, isDuplicate, photoMismatch,
    urgentDeadline: Math.random() > 0.88 ? Date.now() + 35000 : null,
    suspectedFields: [],
  };
}

export function genLevel(lv){
  const docs=[];
  for(let i=0;i<docsForLevel(lv);i++) docs.push(generateDoc(i+1,lv,docs));
  return docs;
}
