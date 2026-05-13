import { useState, useEffect, useRef, useCallback } from "react";

const CITIES = ["São Paulo", "Belo Horizonte", "Rio de Janeiro", "Curitiba", "Salvador"];
const NAMES = ["João Silva", "Maria Oliveira", "Carlos Souza", "Ana Lima", "Pedro Costa", "Fernanda Rocha"];
const DOC_TYPES = ["RG", "CONTRATO", "LAUDO", "CERTIDÃO", "PROCESSO"];

const STORY_DAYS = [
  { day: 1, boss: "Bom dia, novo funcionário. Aqui é simples: digitalize tudo, não cometa erros. A impressora está… razoável.", bossName: "Sr. Figueiredo", bossEmoji: "👔" },
  { day: 2, boss: "Ontem foi aceitável. Hoje temos mais volume. Ah — alguém derramou café na impressora ontem. Ela está de mau humor.", bossName: "Sr. Figueiredo", bossEmoji: "👔" },
  { day: 3, boss: "A auditoria vem semana que vem. ZERO erros. O TI também instalou uma 'atualização'. Boa sorte.", bossName: "Sr. Figueiredo", bossEmoji: "😤" },
  { day: 4, boss: "Recebi reclamações de clientes. Documentos chegando tortos. E a impressora… não quero nem comentar.", bossName: "Sr. Figueiredo", bossEmoji: "😤" },
  { day: 5, boss: "Última chance. A diretoria quer resultados. Se passar de hoje, você tem emprego. Talvez.", bossName: "Sra. Diretora", bossEmoji: "💼" },
];

const RANDOM_EVENTS = [
  { id: "coffee", emoji: "☕", title: "CAFÉ DERRAMADO!", desc: "O copo tombou. Alguns documentos ficaram grudados e precisam ser preparados novamente.", duration: 7000, effect: "staple" },
  { id: "boss", emoji: "👔", title: "CHEFE APARECEU!", desc: "\"Como estamos indo? Espero que sem erros…\" Ele fica te olhando por 10 segundos.", duration: 10000, effect: "pressure" },
  { id: "antivirus", emoji: "🛡️", title: "ANTIVÍRUS ATIVADO!", desc: "O antivírus decidiu escanear TUDO agora. PC travado por 8 segundos.", duration: 8000, effect: "freeze" },
  { id: "cat", emoji: "🐱", title: "GATO NA SALA!", desc: "O gato do escritório sentou em cima dos documentos. Nada pode ser feito.", duration: 6000, effect: "block" },
  { id: "power", emoji: "⚡", title: "ENERGIA PISCANDO!", desc: "A luz piscou. A impressora reiniciou sozinha e perdeu o humor acumulado.", duration: 5000, effect: "printer_reset" },
  { id: "phone", emoji: "📞", title: "CLIENTE LIGANDO!", desc: "\"Cadê meu documento?! Já faz 3 dias!\" Você perde 15 pontos.", duration: 7000, effect: "penalty" },
  { id: "update", emoji: "💻", title: "WINDOWS UPDATE!", desc: "Agora. Sem negociação. PC travado por 10 segundos.", duration: 10000, effect: "freeze" },
];

const PRINTER_EVENTS = [
  { id: "jam", label: "ATOLAMENTO!", color: "#ff3b3b", fix: "pull" },
  { id: "toner", label: "SEM TONER", color: "#ff8c00", fix: "replace" },
  { id: "overheat", label: "SUPERAQUECIMENTO", color: "#ff5500", fix: "wait" },
  { id: "skewed", label: "PAPEL TORTO", color: "#f0c000", fix: "align" },
  { id: "ghost", label: "MODO FANTASMA", color: "#9b59b6", fix: "restart" },
];

const WEIGHT_ITEMS = [
  { id: "stapler", label: "Grampeador", emoji: "📎", weight: 1 },
  { id: "monitor", label: "Monitor Velho", emoji: "🖥️", weight: 4 },
  { id: "coffee", label: "Copo de Café", emoji: "☕", weight: 1 },
  { id: "books", label: "Pilha de Livros", emoji: "📚", weight: 3 },
  { id: "binder", label: "Fichário", emoji: "🗂️", weight: 2 },
];

const CORRECT_FOLDER = {
  "RG": "CLIENTES/2026/RG",
  "CONTRATO": "CLIENTES/2026/CONTRATOS",
  "LAUDO": "CLIENTES/2026/LAUDOS",
  "CERTIDÃO": "CLIENTES/2026/CERTIDÕES",
  "PROCESSO": "CLIENTES/2026/PROCESSOS",
};

function generateCPF(valid = true) {
  const rand = () => Math.floor(Math.random() * 9);
  const d = Array.from({ length: 9 }, rand);
  if (!valid) return `${d[0]}${d[1]}${d[2]}.${d[3]}${d[4]}${d[5]}.${d[6]}${d[7]}${d[8]}-99`;
  let s1 = d.reduce((a, v, i) => a + v * (10 - i), 0);
  let r1 = (s1 * 10) % 11; if (r1 >= 10) r1 = 0;
  let s2 = d.reduce((a, v, i) => a + v * (11 - i), 0) + r1 * 2;
  let r2 = (s2 * 10) % 11; if (r2 >= 10) r2 = 0;
  return `${d[0]}${d[1]}${d[2]}.${d[3]}${d[4]}${d[5]}.${d[6]}${d[7]}${d[8]}-${r1}${r2}`;
}
function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pad2(n) { return String(n).padStart(2, "0"); }

function generateDocument(id, level) {
  const type = randomFrom(DOC_TYPES);
  const name = randomFrom(NAMES);
  const city = randomFrom(CITIES);
  const validCPF = Math.random() > 0.3;
  const cityMismatch = Math.random() > 0.6;
  const nameMismatch = Math.random() > 0.72;
  const expired = Math.random() > 0.78;
  const missingPages = level > 1 && Math.random() > 0.72;
  const hasGrampo = Math.random() > 0.45;
  const misaligned = Math.random() > 0.5;
  const issueYear = expired ? 2019 + Math.floor(Math.random() * 3) : 2024;
  const expiryYear = expired ? 2022 + Math.floor(Math.random() * 2) : 2027;
  const issues = [];
  if (!validCPF) issues.push("CPF inválido");
  if (cityMismatch) issues.push("Cidade incompatível entre páginas");
  if (nameMismatch) issues.push("Nome divergente");
  if (expired) issues.push("Documento vencido");
  if (missingPages) issues.push("Página faltando");
  return {
    id, type,
    pages: missingPages ? 1 : (type === "CONTRATO" || type === "PROCESSO" ? 2 : 1),
    expectedPages: type === "CONTRATO" || type === "PROCESSO" ? 2 : 1,
    data: {
      name, cpf: generateCPF(validCPF), city,
      formCity: cityMismatch ? randomFrom(CITIES.filter(c => c !== city)) : city,
      formName: nameMismatch ? randomFrom(NAMES.filter(n => n !== name)) : name,
      issueDate: `${pad2(Math.floor(Math.random() * 28) + 1)}/${pad2(Math.floor(Math.random() * 12) + 1)}/${issueYear}`,
      expiryDate: `31/12/${expiryYear}`,
      rg: `${Math.floor(Math.random() * 90000000) + 10000000}-${Math.floor(Math.random() * 9)}`,
      organ: randomFrom(["SSP/SP", "SSP/RJ", "SSP/MG", "DETRAN/PR"]),
    },
    issues, isValid: issues.length === 0,
    scanned: false, savedPath: null,
    aligned: !misaligned, hasGrampo, misaligned,
    physicalReady: !misaligned && !hasGrampo,
  };
}

// ── DOCUMENT VISUAL (Papers Please style) ─────────────────────────────────────
function DocPaper({ children, color = "#8b1a1a", bg = "#f5f0e8", borderColor = "#c8b89a" }) {
  return (
    <div style={{
      background: bg, border: `1px solid ${borderColor}`, borderRadius: 3,
      padding: "13px 15px", fontFamily: "Georgia, serif", color: "#1a1a1a",
      boxShadow: "2px 4px 10px #00000030", fontSize: 11, minHeight: 210, position: "relative",
    }}>
      {children}
    </div>
  );
}

function FieldRow({ label, value, highlight, onClick }) {
  return (
    <div onClick={onClick} style={{
      display: "flex", gap: 8, marginBottom: 7, cursor: onClick ? "pointer" : "default",
      background: highlight ? "#ffe06622" : "transparent",
      padding: "1px 3px", borderRadius: 2, transition: "background 0.2s",
    }}>
      <span style={{ color: "#777", fontSize: 9, textTransform: "uppercase", letterSpacing: 0.4, minWidth: 72, paddingTop: 3 }}>{label}</span>
      <span style={{
        background: "#e8e0d0", border: "1px solid #c8b89a",
        padding: "2px 6px", borderRadius: 2, fontSize: 12, fontWeight: "bold",
        color: "#111", flex: 1,
      }}>{value}</span>
    </div>
  );
}

function DocumentVisual({ doc, page = 1 }) {
  const expired = doc.issues.includes("Documento vencido");
  const stamp = expired
    ? <div style={{ position: "absolute", bottom: 10, right: 10, border: "2px solid #cc000055", color: "#cc0000", padding: "1px 8px", fontSize: 9, fontWeight: "bold", letterSpacing: 1, borderRadius: 2, transform: "rotate(-7deg)", opacity: 0.75 }}>VENCIDO</div>
    : null;

  if (doc.type === "RG") {
    return (
      <DocPaper>
        <div style={{ position: "absolute", top: 10, right: 12, fontSize: 22, opacity: 0.4 }}>🏛️</div>
        <div style={{ borderBottom: "2px solid #8b1a1a", paddingBottom: 7, marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: "bold", color: "#8b1a1a", letterSpacing: 1 }}>CARTEIRA DE IDENTIDADE</div>
          <div style={{ fontSize: 9, color: "#888", marginTop: 2 }}>República Federativa do Brasil • {doc.data.organ}</div>
        </div>
        <FieldRow label="Nome" value={doc.data.name} />
        <FieldRow label="CPF" value={doc.data.cpf} />
        <FieldRow label="RG" value={doc.data.rg} />
        <FieldRow label="Naturalidade" value={doc.data.city} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          <FieldRow label="Emissão" value={doc.data.issueDate} />
          <FieldRow label="Validade" value={<span style={{ color: expired ? "#cc0000" : "#111" }}>{doc.data.expiryDate}</span>} />
        </div>
        {stamp}
      </DocPaper>
    );
  }

  if (doc.type === "CONTRATO" || doc.type === "PROCESSO") {
    if (page === 2 && doc.issues.includes("Página faltando")) {
      return (
        <div style={{ background: "#f5f0e8", border: "1px dashed #c8b89a", borderRadius: 3, minHeight: 210, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8, opacity: 0.5 }}>
          <div style={{ fontSize: 28 }}>📄</div>
          <div style={{ color: "#cc0000", fontWeight: "bold", fontSize: 12, fontFamily: "Georgia, serif" }}>PÁGINA 2 AUSENTE</div>
        </div>
      );
    }
    return (
      <DocPaper color="#2a4a8b">
        <div style={{ position: "absolute", top: 10, right: 12, fontSize: 22, opacity: 0.3 }}>⚖️</div>
        <div style={{ borderBottom: "2px solid #2a4a8b", paddingBottom: 7, marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: "bold", color: "#2a4a8b", letterSpacing: 0.8 }}>
            {doc.type === "CONTRATO" ? "CONTRATO DE PRESTAÇÃO DE SERVIÇOS" : "PROCESSO ADMINISTRATIVO"}
          </div>
          <div style={{ fontSize: 9, color: "#888", marginTop: 2 }}>Nº {String(doc.id).padStart(6, "0")}/2026 • Pág. {page} de 2</div>
        </div>
        {page === 1 ? (
          <>
            <FieldRow label="Contratante" value={doc.data.formName} />
            <FieldRow label="CPF" value={doc.data.cpf} />
            <FieldRow label="Cidade" value={doc.data.formCity} />
            <FieldRow label="Data" value={doc.data.issueDate} />
            <div style={{ marginTop: 8, color: "#999", fontSize: 9, lineHeight: 1.6, borderTop: "1px dashed #c8b89a", paddingTop: 7 }}>
              Pelo presente instrumento, as partes acima identificadas acordam os termos e condições aqui estabelecidos...
            </div>
          </>
        ) : (
          <>
            <FieldRow label="Titular" value={doc.data.name} />
            <div style={{ marginTop: 8, color: "#999", fontSize: 9, lineHeight: 1.6 }}>
              ...sendo a validade do presente instrumento de 12 (doze) meses a contar da data de assinatura. Qualquer alteração deverá ser feita por escrito.
            </div>
            <div style={{ marginTop: 16, display: "flex", justifyContent: "space-around" }}>
              {["Assinatura do Titular", "Testemunha"].map(l => (
                <div key={l} style={{ textAlign: "center", borderTop: "1px solid #2a4a8b", paddingTop: 4, width: 90 }}>
                  <div style={{ fontSize: 8, color: "#888" }}>{l}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </DocPaper>
    );
  }

  if (doc.type === "LAUDO") {
    return (
      <DocPaper color="#1a6b3a" bg="#f0f5f0" borderColor="#a0c0b0">
        <div style={{ position: "absolute", top: 10, right: 12, fontSize: 22, opacity: 0.3 }}>🏥</div>
        <div style={{ borderBottom: "2px solid #1a6b3a", paddingBottom: 7, marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: "bold", color: "#1a6b3a", letterSpacing: 0.8 }}>LAUDO MÉDICO / TÉCNICO</div>
          <div style={{ fontSize: 9, color: "#888", marginTop: 2 }}>Protocolo {String(doc.id).padStart(5, "0")}</div>
        </div>
        <FieldRow label="Paciente" value={doc.data.formName} />
        <FieldRow label="CPF" value={doc.data.cpf} />
        <FieldRow label="Cidade" value={doc.data.formCity} />
        <FieldRow label="Data" value={doc.data.issueDate} />
        <div style={{ marginTop: 8, background: "#e0ede5", borderRadius: 2, padding: 8, fontSize: 9, color: "#555", lineHeight: 1.6 }}>
          <strong>Parecer:</strong> Paciente apto para as atividades descritas. Sem restrições observadas no exame clínico.
        </div>
      </DocPaper>
    );
  }

  return (
    <DocPaper color="#6b3a1a" bg="#f5f0e0" borderColor="#c0a880">
      <div style={{ position: "absolute", top: 10, right: 12, fontSize: 22, opacity: 0.3 }}>🏛️</div>
      <div style={{ borderBottom: "2px solid #6b3a1a", paddingBottom: 7, marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: "bold", color: "#6b3a1a", letterSpacing: 0.8 }}>CERTIDÃO OFICIAL</div>
        <div style={{ fontSize: 9, color: "#888", marginTop: 2 }}>Cartório Oficial • Reg. nº {String(doc.id).padStart(7, "0")}</div>
      </div>
      <FieldRow label="Requerente" value={doc.data.formName} />
      <FieldRow label="CPF" value={doc.data.cpf} />
      <FieldRow label="Comarca" value={doc.data.formCity} />
      <FieldRow label="Emissão" value={doc.data.issueDate} />
      <FieldRow label="Validade" value={<span style={{ color: expired ? "#cc0000" : "#111" }}>{doc.data.expiryDate}</span>} />
      {stamp}
    </DocPaper>
  );
}

// ── INSPECTION PANEL ──────────────────────────────────────────────────────────
function InspectionPanel({ doc, onApprove, onReject, frozen }) {
  const [activePage, setActivePage] = useState(1);
  const [notes, setNotes] = useState([]);
  useEffect(() => { setActivePage(1); setNotes([]); }, [doc?.id]);

  if (!doc) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: 12, color: "#222" }}>
      <div style={{ fontSize: 44, opacity: 0.2 }}>📋</div>
      <div style={{ fontFamily: "'Courier New', monospace", fontSize: 13, color: "#2a2a3a" }}>Selecione um documento para inspecionar</div>
      <div style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: "#1a1a28" }}>Compare os campos entre o documento e a ficha cadastral</div>
    </div>
  );

  const hasMulti = doc.expectedPages > 1;
  const canApprove = doc.physicalReady && !frozen;

  return (
    <div style={{ fontFamily: "'Courier New', monospace", height: "100%", display: "flex", flexDirection: "column", gap: 10, position: "relative" }}>
      {frozen && (
        <div style={{ position: "absolute", inset: 0, background: "#00000099", zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8 }}>
          <div style={{ color: "#4a9eff", textAlign: "center" }}>
            <div style={{ fontSize: 30, marginBottom: 8 }}>🔒</div>
            <div style={{ fontSize: 13 }}>PC TRAVADO</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ background: "#4a9eff18", border: "1px solid #4a9eff44", color: "#4a9eff", padding: "2px 8px", borderRadius: 3, fontSize: 11 }}>DOC #{doc.id}</span>
        <span style={{ color: "#555", fontSize: 12 }}>{doc.type}</span>
        {!doc.physicalReady && (
          <span style={{ color: "#ff8c00", fontSize: 10, background: "#ff8c0011", border: "1px solid #ff8c0033", padding: "1px 6px", borderRadius: 3 }}>
            ⚙ Prepare antes de digitalizar
          </span>
        )}
        {hasMulti && (
          <div style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
            {[1, 2].map(p => (
              <button key={p} onClick={() => setActivePage(p)} style={{
                background: activePage === p ? "#4a9eff28" : "transparent",
                border: `1px solid ${activePage === p ? "#4a9eff" : "#222"}`,
                color: activePage === p ? "#4a9eff" : "#444",
                padding: "3px 10px", borderRadius: 3, cursor: "pointer",
                fontFamily: "'Courier New', monospace", fontSize: 11,
              }}>Pág {p}</button>
            ))}
          </div>
        )}
      </div>

      {/* Documents side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, flex: 1, overflow: "auto" }}>
        <div>
          <div style={{ color: "#2a2a3a", fontSize: 9, marginBottom: 5, letterSpacing: 1 }}>{hasMulti ? `DOCUMENTO — PÁG. ${activePage}` : "DOCUMENTO"}</div>
          <DocumentVisual doc={doc} page={activePage} />
        </div>
        <div>
          <div style={{ color: "#2a2a3a", fontSize: 9, marginBottom: 5, letterSpacing: 1 }}>FICHA CADASTRAL</div>
          <div style={{
            background: "#eef2f8", border: "1px solid #b0c4de", borderRadius: 3,
            padding: "13px 15px", fontFamily: "Georgia, serif",
            boxShadow: "2px 4px 10px #00000022", fontSize: 11, minHeight: 210,
          }}>
            <div style={{ borderBottom: "2px solid #2a4a8b", paddingBottom: 7, marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: "bold", color: "#2a4a8b", letterSpacing: 0.8 }}>FORMULÁRIO DE CADASTRO</div>
              <div style={{ fontSize: 9, color: "#888", marginTop: 2 }}>Digitalizações Infernais Ltda. • Uso Interno</div>
            </div>
            {[
              { label: "Nome Completo", val: doc.data.formName, compareVal: doc.data.name },
              { label: "CPF", val: doc.data.cpf, compareVal: null },
              { label: "Cidade/Município", val: doc.data.formCity, compareVal: doc.data.city },
              { label: "Data Referência", val: doc.data.issueDate, compareVal: null },
            ].map(row => {
              const mismatch = row.compareVal !== null && row.val !== row.compareVal;
              return (
                <div key={row.label} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <span style={{ color: "#888", fontSize: 9, textTransform: "uppercase", letterSpacing: 0.4, minWidth: 80, paddingTop: 3 }}>{row.label}</span>
                  <span style={{
                    background: mismatch ? "#fff0f0" : "#dde8f5",
                    border: `1px solid ${mismatch ? "#cc000066" : "#b0c4de"}`,
                    padding: "2px 6px", borderRadius: 2,
                    fontSize: 12, fontWeight: "bold",
                    color: mismatch ? "#cc0000" : "#111", flex: 1,
                  }}>{row.val}</span>
                </div>
              );
            })}
            <div style={{ marginTop: 12, borderTop: "1px dashed #b0c4de", paddingTop: 8, display: "flex", justifyContent: "flex-end", gap: 8 }}>
              {["Responsável", "Data"].map(l => (
                <div key={l} style={{ textAlign: "center", borderTop: "1px solid #2a4a8b", paddingTop: 3, width: 68 }}>
                  <div style={{ fontSize: 8, color: "#aaa" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Note pad */}
      <div style={{ background: "#080812", border: "1px solid #151525", borderRadius: 4, padding: "6px 10px", display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center", minHeight: 34 }}>
        <span style={{ color: "#252535", fontSize: 10 }}>📝</span>
        {notes.map((n, i) => (
          <span key={i} style={{ background: "#ff3b3b18", border: "1px solid #ff3b3b44", color: "#ff6b6b", fontSize: 10, padding: "0 6px", borderRadius: 3 }}>
            {n} <span style={{ cursor: "pointer", opacity: 0.6 }} onClick={() => setNotes(u => u.filter((_, j) => j !== i))}>×</span>
          </span>
        ))}
        {["CPF suspeito", "Cidade diverge", "Nome diferente", "Vencido", "Pág. faltando"].filter(n => !notes.includes(n)).map(n => (
          <span key={n} onClick={() => setNotes(u => [...u, n])} style={{ color: "#252535", fontSize: 10, cursor: "pointer", padding: "0 5px", borderRadius: 3, border: "1px solid #151525" }}>+ {n}</span>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => onApprove(doc)} disabled={!canApprove} style={{
          flex: 1, padding: "11px 0",
          background: canApprove ? "#00ff8811" : "#0a0a0a",
          border: `1px solid ${canApprove ? "#00ff88" : "#1a1a1a"}`,
          color: canApprove ? "#00ff88" : "#222",
          borderRadius: 5, cursor: canApprove ? "pointer" : "default",
          fontFamily: "'Courier New', monospace", fontSize: 13, fontWeight: "bold", transition: "all 0.2s",
        }}>✓ APROVADO — DIGITALIZAR</button>
        <button onClick={() => onReject(doc)} disabled={frozen} style={{
          flex: 1, padding: "11px 0",
          background: !frozen ? "#ff3b3b11" : "#0a0a0a",
          border: `1px solid ${!frozen ? "#ff3b3b" : "#1a1a1a"}`,
          color: !frozen ? "#ff3b3b" : "#222",
          borderRadius: 5, cursor: !frozen ? "pointer" : "default",
          fontFamily: "'Courier New', monospace", fontSize: 13, fontWeight: "bold", transition: "all 0.2s",
        }}>✗ REJEITAR</button>
      </div>
    </div>
  );
}

// ── PHYSICAL PREP ──────────────────────────────────────────────────────────────
function PhysicalPrepPanel({ doc, onPrepared }) {
  const [grampoOk, setGrampoOk] = useState(!doc.hasGrampo);
  const [alignOk, setAlignOk] = useState(doc.aligned);
  useEffect(() => {
    if (grampoOk && alignOk) { const t = setTimeout(() => onPrepared(doc.id), 250); return () => clearTimeout(t); }
  }, [grampoOk, alignOk, doc.id, onPrepared]);
  return (
    <div style={{ background: "#0c0c1c", border: "1px solid #f0c00033", borderRadius: 7, padding: 12, fontFamily: "'Courier New', monospace" }}>
      <div style={{ color: "#f0c000", fontSize: 10, marginBottom: 10, letterSpacing: 1 }}>⚙ PREPARAÇÃO FÍSICA</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {doc.hasGrampo && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: grampoOk ? "#00ff8810" : "#ff8c0010", border: `1px solid ${grampoOk ? "#00ff8833" : "#ff8c0033"}`, borderRadius: 5, padding: "8px 12px" }}>
            <span style={{ fontSize: 18 }}>{grampoOk ? "✅" : "📎"}</span>
            <div style={{ flex: 1 }}>
              <div style={{ color: grampoOk ? "#00ff88" : "#ff8c00", fontSize: 11 }}>{grampoOk ? "Grampo removido" : "Documento grampeado"}</div>
              <div style={{ color: "#333", fontSize: 10 }}>O scanner não aceita grampos</div>
            </div>
            {!grampoOk && <button onClick={() => setGrampoOk(true)} style={{ background: "#ff8c0018", border: "1px solid #ff8c0055", color: "#ff8c00", padding: "3px 10px", borderRadius: 3, cursor: "pointer", fontFamily: "'Courier New', monospace", fontSize: 11 }}>Remover</button>}
          </div>
        )}
        {doc.misaligned && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: alignOk ? "#00ff8810" : "#f0c00010", border: `1px solid ${alignOk ? "#00ff8833" : "#f0c00033"}`, borderRadius: 5, padding: "8px 12px" }}>
            <span style={{ fontSize: 18 }}>{alignOk ? "✅" : "📄"}</span>
            <div style={{ flex: 1 }}>
              <div style={{ color: alignOk ? "#00ff88" : "#f0c000", fontSize: 11 }}>{alignOk ? "Folhas alinhadas" : "Folhas desalinhadas"}</div>
              <div style={{ color: "#333", fontSize: 10 }}>Digitalização vai sair torta</div>
            </div>
            {!alignOk && <button onClick={() => setAlignOk(true)} style={{ background: "#f0c00018", border: "1px solid #f0c00055", color: "#f0c000", padding: "3px 10px", borderRadius: 3, cursor: "pointer", fontFamily: "'Courier New', monospace", fontSize: 11 }}>Alinhar</button>}
          </div>
        )}
      </div>
      {grampoOk && alignOk && <div style={{ color: "#00ff88", fontSize: 10, marginTop: 8, textAlign: "center" }}>✓ Pronto para digitalizar</div>}
    </div>
  );
}

// ── PRINTER PANEL ─────────────────────────────────────────────────────────────
function PrinterPanel({ printer, onAction, onAddWeight, onRemoveWeight }) {
  const issue = printer.currentIssue;
  const hc = printer.health > 60 ? "#00ff88" : printer.health > 30 ? "#f0c000" : "#ff3b3b";
  const moodFace = printer.mood > 70 ? "( ◕‿◕)" : printer.mood > 40 ? "(-_-;)" : printer.mood > 15 ? "(╯°□°)╯" : "(ﾉ◕ヮ◕)ﾉ✧";
  const tw = printer.weightItems.reduce((a, w) => a + w.weight, 0);
  const optimal = tw >= 2 && tw <= 5;
  return (
    <div style={{ background: "#111122", border: `2px solid ${issue ? issue.color : optimal ? "#00ff8855" : "#1a1a2e"}`, borderRadius: 8, padding: 13, fontFamily: "'Courier New', monospace", boxShadow: issue ? `0 0 14px ${issue.color}28` : "none", transition: "all 0.3s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
        <div style={{ fontSize: 30, position: "relative" }}>
          🖨️
          {printer.weightItems.length > 0 && <span style={{ position: "absolute", top: -6, right: -8, fontSize: 12 }}>{printer.weightItems[printer.weightItems.length - 1].emoji}</span>}
        </div>
        <div>
          <div style={{ color: "#333", fontSize: 9 }}>SCANJET PRO X-2000</div>
          <div style={{ color: "#00cc66", fontSize: 10 }}>{moodFace}</div>
          {printer.weightItems.length > 0 && (
            <div style={{ color: optimal ? "#00ff88" : "#ff8c00", fontSize: 9 }}>
              Peso: {tw}kg {optimal ? "✓ ideal" : tw > 5 ? "⚠ demais" : "⚠ leve"}
            </div>
          )}
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ color: "#333", fontSize: 9 }}>SAÚDE</div>
          <div style={{ color: hc, fontSize: 15, fontWeight: "bold" }}>{printer.health}%</div>
        </div>
      </div>
      <div style={{ height: 3, background: "#0a0a14", borderRadius: 2, marginBottom: 9, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${printer.health}%`, background: hc, transition: "width 0.5s", borderRadius: 2 }} />
      </div>
      {issue ? (
        <div style={{ background: `${issue.color}15`, border: `1px solid ${issue.color}55`, borderRadius: 5, padding: 8, marginBottom: 9, animation: "blink 1s infinite" }}>
          <div style={{ color: issue.color, fontWeight: "bold", fontSize: 12 }}>⚠ {issue.label}</div>
          <div style={{ color: "#666", fontSize: 10, marginTop: 2 }}>
            Ação: {issue.fix === "pull" ? "Puxar papel" : issue.fix === "replace" ? "Trocar toner" : issue.fix === "wait" ? "Aguardar" : issue.fix === "align" ? "Realinhar" : "Reiniciar"}
          </div>
        </div>
      ) : (
        <div style={{ color: "#00cc66", fontSize: 10, marginBottom: 9 }}>✓ PRONTA</div>
      )}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
        {[
          { label: "🤜 Tapinha", action: "tap", color: "#ff6b35" },
          { label: "📄 Puxar", action: "pull", color: "#f0c000" },
          { label: "🔄 Reiniciar", action: "restart", color: "#4a9eff" },
          { label: "🖊️ Toner", action: "replace", color: "#888" },
          { label: "❄️ Resfriar", action: "wait", color: "#00bcd4" },
        ].map(b => (
          <button key={b.action} onClick={() => onAction(b.action)}
            style={{ background: `${b.color}15`, border: `1px solid ${b.color}55`, color: b.color, padding: "3px 7px", borderRadius: 3, cursor: "pointer", fontSize: 10, fontFamily: "'Courier New', monospace" }}
            onMouseEnter={e => e.target.style.background = `${b.color}28`}
            onMouseLeave={e => e.target.style.background = `${b.color}15`}
          >{b.label}</button>
        ))}
      </div>
      <div style={{ borderTop: "1px solid #1a1a2e", paddingTop: 10 }}>
        <div style={{ color: "#252535", fontSize: 9, marginBottom: 6 }}>⚖ PESO IMPROVISADO (2–5 kg ideal)</div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {WEIGHT_ITEMS.map(item => {
            const on = printer.weightItems.some(w => w.id === item.id);
            return (
              <button key={item.id} onClick={() => on ? onRemoveWeight(item.id) : onAddWeight(item)} style={{ background: on ? "#00ff8815" : "#0a0a14", border: `1px solid ${on ? "#00ff8844" : "#1a1a2e"}`, color: on ? "#00ff88" : "#444", padding: "3px 7px", borderRadius: 3, cursor: "pointer", fontSize: 11, fontFamily: "'Courier New', monospace", transition: "all 0.2s" }}>
                {item.emoji}{on ? " ✓" : " +"}
              </button>
            );
          })}
        </div>
      </div>
      {printer.jammed && <div style={{ color: "#ff3b3b", fontSize: 10, marginTop: 7, animation: "blink 0.5s infinite" }}>⛔ Bloqueada — conserte primeiro</div>}
    </div>
  );
}

// ── DOCUMENT CARD ──────────────────────────────────────────────────────────────
function DocumentCard({ doc, selected, onClick }) {
  return (
    <div onClick={onClick} style={{ background: selected ? "#0f1622" : "#080810", border: `2px solid ${selected ? "#4a9eff" : doc.issues.length ? "#ff3b3b28" : "#111"}`, borderRadius: 5, padding: "9px 11px", cursor: "pointer", transition: "all 0.15s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <span style={{ background: doc.issues.length ? "#ff3b3b15" : "#00ff8815", border: `1px solid ${doc.issues.length ? "#ff3b3b44" : "#00ff8844"}`, color: doc.issues.length ? "#ff5555" : "#00cc66", padding: "1px 5px", borderRadius: 2, fontSize: 9 }}>{doc.type}</span>
          <div style={{ color: "#ccc", fontSize: 11, marginTop: 4, fontWeight: "bold" }}>{doc.data.name}</div>
          <div style={{ color: "#333", fontSize: 10 }}>{doc.data.cpf}</div>
        </div>
        <div style={{ textAlign: "right", fontSize: 10 }}>
          {!doc.physicalReady && <div style={{ color: "#ff8c00" }}>⚙</div>}
          {doc.scanned && <div style={{ color: "#00cc66" }}>✓</div>}
          {doc.savedPath && <div style={{ color: "#4a9eff" }}>💾</div>}
          <div style={{ color: "#252535", marginTop: 2 }}>{doc.pages}/{doc.expectedPages}p</div>
        </div>
      </div>
    </div>
  );
}

// ── FILE SAVE MODAL ────────────────────────────────────────────────────────────
function FileSaveModal({ doc, onSave, onClose }) {
  const [path, setPath] = useState("");
  const folders = Object.values(CORRECT_FOLDER);
  const correct = CORRECT_FOLDER[doc.type];
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000cc", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ background: "#0a0a18", border: "1px solid #1a1a2e", borderRadius: 9, padding: 22, width: 400, fontFamily: "'Courier New', monospace" }}>
        <div style={{ color: "#eee", fontSize: 14, fontWeight: "bold", marginBottom: 4 }}>💾 SALVAR ARQUIVO</div>
        <div style={{ color: "#333", fontSize: 10, marginBottom: 14 }}>{doc.type}_{String(doc.id).padStart(4, "0")}_{doc.data.name.replace(/ /g, "_")}.pdf</div>
        <div style={{ color: "#444", fontSize: 10, marginBottom: 8 }}>Selecione o diretório:</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 16 }}>
          {folders.map(f => (
            <div key={f} onClick={() => setPath(f)} style={{ padding: "7px 12px", background: path === f ? "#4a9eff15" : "#0f0f18", border: `1px solid ${path === f ? "#4a9eff" : "#1a1a2e"}`, borderRadius: 4, cursor: "pointer", fontSize: 11, color: path === f ? "#4a9eff" : "#444", transition: "all 0.1s" }}>📁 {f}</div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => path && onSave(doc, path, path === correct)} disabled={!path} style={{ flex: 1, padding: "9px 0", background: path ? "#4a9eff15" : "#0a0a14", border: `1px solid ${path ? "#4a9eff" : "#1a1a2e"}`, color: path ? "#4a9eff" : "#333", borderRadius: 4, cursor: path ? "pointer" : "default", fontFamily: "'Courier New', monospace", fontSize: 12, fontWeight: "bold" }}>SALVAR AQUI</button>
          <button onClick={onClose} style={{ padding: "9px 14px", background: "transparent", border: "1px solid #1a1a2e", color: "#444", borderRadius: 4, cursor: "pointer", fontFamily: "'Courier New', monospace", fontSize: 11 }}>✕</button>
        </div>
      </div>
    </div>
  );
}

// ── EVENT BANNER ───────────────────────────────────────────────────────────────
function EventBanner({ event }) {
  if (!event) return null;
  return (
    <div style={{ position: "fixed", top: 58, left: "50%", transform: "translateX(-50%)", background: "#160a24", border: "1px solid #9b59b6", borderRadius: 8, padding: "11px 20px", zIndex: 150, fontFamily: "'Courier New', monospace", maxWidth: 400, textAlign: "center", boxShadow: "0 0 20px #9b59b633", animation: "slideIn 0.3s ease" }}>
      <div style={{ fontSize: 26, marginBottom: 3 }}>{event.emoji}</div>
      <div style={{ color: "#d4a0ff", fontWeight: "bold", fontSize: 12, marginBottom: 3 }}>{event.title}</div>
      <div style={{ color: "#666", fontSize: 10 }}>{event.desc}</div>
    </div>
  );
}

// ── STORY DIALOG ───────────────────────────────────────────────────────────────
function StoryDialog({ day, onClose }) {
  const d = STORY_DAYS[Math.min(day - 1, STORY_DAYS.length - 1)];
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000ee", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 200, paddingBottom: 36 }}>
      <div style={{ background: "#0a0a18", border: "1px solid #1a1a2e", borderRadius: 9, padding: 22, maxWidth: 480, width: "90%", fontFamily: "'Courier New', monospace", animation: "slideIn 0.4s ease" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ fontSize: 38 }}>{d.bossEmoji}</div>
          <div>
            <div style={{ color: "#4a9eff", fontSize: 10, marginBottom: 5, letterSpacing: 1 }}>{d.bossName.toUpperCase()} — DIA {day}</div>
            <div style={{ color: "#bbb", fontSize: 13, lineHeight: 1.75 }}>"{d.boss}"</div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <button onClick={onClose} style={{ background: "#4a9eff", border: "none", color: "#000", padding: "8px 22px", borderRadius: 4, cursor: "pointer", fontFamily: "'Courier New', monospace", fontSize: 12, fontWeight: "bold" }}>Ao trabalho. ▶</button>
        </div>
      </div>
    </div>
  );
}

// ── TOAST ──────────────────────────────────────────────────────────────────────
function Toast({ messages }) {
  return (
    <div style={{ position: "fixed", bottom: 18, right: 18, display: "flex", flexDirection: "column-reverse", gap: 5, zIndex: 300 }}>
      {messages.map(m => (
        <div key={m.id} style={{ background: m.type === "error" ? "#1c0808" : m.type === "success" ? "#081c08" : "#080816", border: `1px solid ${m.type === "error" ? "#ff3b3b" : m.type === "success" ? "#00ff88" : "#4a9eff"}`, color: m.type === "error" ? "#ff6060" : m.type === "success" ? "#00ff88" : "#4a9eff", padding: "6px 11px", borderRadius: 5, fontFamily: "'Courier New', monospace", fontSize: 11, animation: "slideIn 0.2s ease", maxWidth: 290 }}>{m.text}</div>
      ))}
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function BurocraciaSimulator() {
  const [phase, setPhase] = useState("intro");
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [docs, setDocs] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [saveModal, setSaveModal] = useState(null);
  const [timeLeft, setTimeLeft] = useState(200);
  const [frozen, setFrozen] = useState(false);
  const [activeEvent, setActiveEvent] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [showStory, setShowStory] = useState(true);
  const [stats, setStats] = useState({ approved: 0, rejected: 0, saved: 0, errors: 0 });
  const [printer, setPrinter] = useState({ health: 100, mood: 80, jammed: false, currentIssue: null, tapCount: 0, weightItems: [] });

  const toastId = useRef(0);
  const timerRef = useRef(null);
  const eventTimerRef = useRef(null);
  const printerTimerRef = useRef(null);
  const docsRef = useRef(docs);
  useEffect(() => { docsRef.current = docs; }, [docs]);

  const addToast = useCallback((text, type = "info") => {
    const id = ++toastId.current;
    setToasts(t => [...t.slice(-5), { id, text, type }]);
    setTimeout(() => setToasts(t => t.filter(m => m.id !== id)), 3500);
  }, []);

  const generateLevel = useCallback((lv) => Array.from({ length: 3 + lv * 2 }, (_, i) => generateDocument(i + 1, lv)), []);

  useEffect(() => {
    if (phase !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); setPhase("gameover"); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing") return;
    eventTimerRef.current = setInterval(() => {
      if (activeEvent || Math.random() > 0.28) return;
      const ev = randomFrom(RANDOM_EVENTS);
      setActiveEvent(ev);
      if (ev.effect === "freeze" || ev.effect === "block") setFrozen(true);
      if (ev.effect === "printer_reset") { setPrinter(p => ({ ...p, jammed: false, currentIssue: null, mood: Math.max(0, p.mood - 10) })); addToast("⚡ Impressora reiniciada pelo apagão!", "info"); }
      if (ev.effect === "penalty") { setScore(s => Math.max(0, s - 15)); addToast("📞 Cliente furioso! -15 pts", "error"); }
      if (ev.effect === "staple") { setDocs(ds => ds.map(d => !d.scanned && !d.savedPath && Math.random() > 0.55 ? { ...d, hasGrampo: true, physicalReady: false } : d)); addToast("☕ Café molhou documentos — re-prepare alguns!", "error"); }
      setTimeout(() => { setActiveEvent(null); setFrozen(false); }, ev.duration);
    }, 13000);
    return () => clearInterval(eventTimerRef.current);
  }, [phase, activeEvent, addToast]);

  useEffect(() => {
    if (phase !== "playing") return;
    printerTimerRef.current = setInterval(() => {
      if (Math.random() < 0.18 + level * 0.04) {
        const ev = randomFrom(PRINTER_EVENTS);
        setPrinter(p => ({ ...p, currentIssue: ev, jammed: true, mood: Math.max(0, p.mood - 15), health: Math.max(0, p.health - 7) }));
        addToast(`🖨️ ${ev.label}`, "error");
      }
    }, 9000);
    return () => clearInterval(printerTimerRef.current);
  }, [phase, level, addToast]);

  function startGame() {
    const d = generateLevel(1);
    setDocs(d); setLevel(1); setScore(0); setTimeLeft(200);
    setPhase("playing"); setShowStory(true);
    setStats({ approved: 0, rejected: 0, saved: 0, errors: 0 });
    setPrinter({ health: 100, mood: 80, jammed: false, currentIssue: null, tapCount: 0, weightItems: [] });
    setSelectedDoc(null); setSaveModal(null); setFrozen(false); setActiveEvent(null);
  }

  function handlePrinterAction(action) {
    setPrinter(p => {
      const issue = p.currentIssue;
      const correct = issue && issue.fix === action;
      if (action === "tap") {
        const r = Math.random();
        if (r < 0.28 && p.jammed) { addToast("🤜 Tapinha RESOLVEU! Milagre técnico.", "success"); return { ...p, jammed: false, currentIssue: null, tapCount: p.tapCount + 1, mood: Math.min(100, p.mood + 5) }; }
        if (r < 0.55) { addToast("🤜 Tapinha... inócuo.", "info"); return { ...p, tapCount: p.tapCount + 1 }; }
        addToast("🤜 PIOROU! Ela ficou furiosa.", "error"); return { ...p, health: Math.max(0, p.health - 14), mood: Math.max(0, p.mood - 22), tapCount: p.tapCount + 1 };
      }
      if (correct) { addToast(`✓ Consertado: ${issue.label}`, "success"); return { ...p, jammed: false, currentIssue: null, mood: Math.min(100, p.mood + 12) }; }
      if (p.jammed) { addToast("❌ Ação incorreta.", "error"); return { ...p, health: Math.max(0, p.health - 5) }; }
      addToast("A impressora está bem. Por enquanto.", "info"); return p;
    });
  }

  function handleAddWeight(item) {
    setPrinter(p => {
      const tw = p.weightItems.reduce((a, w) => a + w.weight, 0) + item.weight;
      if (tw > 7) { addToast("Pesado demais! O alimentador vai quebrar!", "error"); return p; }
      addToast(`${item.emoji} ${item.label} colocado.`, "info");
      return { ...p, weightItems: [...p.weightItems, item] };
    });
  }

  function handleRemoveWeight(id) {
    setPrinter(p => { const item = p.weightItems.find(w => w.id === id); if (item) addToast(`${item.emoji} ${item.label} removido.`, "info"); return { ...p, weightItems: p.weightItems.filter(w => w.id !== id) }; });
  }

  function handlePrepared(docId) {
    setDocs(ds => ds.map(d => d.id === docId ? { ...d, physicalReady: true, aligned: true, hasGrampo: false } : d));
    setSelectedDoc(prev => prev?.id === docId ? { ...prev, physicalReady: true, aligned: true, hasGrampo: false } : prev);
    addToast("⚙ Documento preparado!", "success");
  }

  function handleApprove(doc) {
    if (printer.jammed) { addToast("⛔ Impressora travada!", "error"); return; }
    if (!doc.physicalReady) { addToast("⚙ Prepare o documento primeiro!", "error"); return; }
    const tw = printer.weightItems.reduce((a, w) => a + w.weight, 0);
    if (tw < 2 && Math.random() > 0.45) { addToast("⚠ Sem peso suficiente — digitalização torta! -10 pts", "error"); setScore(s => Math.max(0, s - 10)); }
    if (!doc.isValid) {
      setScore(s => Math.max(0, s - 35)); setStats(s => ({ ...s, errors: s.errors + 1 }));
      addToast(`⚠ Aprovado com ${doc.issues.length} erro(s)! -35 pts`, "error");
    } else {
      const pts = 50 + Math.floor(timeLeft / 12); setScore(s => s + pts); setStats(s => ({ ...s, approved: s.approved + 1 }));
      addToast(`✓ Digitalizado! +${pts} pts`, "success");
    }
    const updated = { ...doc, scanned: true };
    setDocs(ds => ds.map(d => d.id === doc.id ? updated : d));
    setSaveModal(updated); setSelectedDoc(null);
  }

  function handleReject(doc) {
    if (doc.isValid) { setScore(s => Math.max(0, s - 40)); setStats(s => ({ ...s, errors: s.errors + 1 })); addToast("❌ Válido rejeitado! -40 pts", "error"); }
    else { const pts = 25 + doc.issues.length * 5; setScore(s => s + pts); setStats(s => ({ ...s, rejected: s.rejected + 1 })); addToast(`✓ Erro detectado! +${pts} pts`, "success"); }
    setDocs(ds => ds.filter(d => d.id !== doc.id)); setSelectedDoc(null);
  }

  function handleSave(doc, path, correct) {
    setScore(s => Math.max(0, s + (correct ? 20 : -28)));
    setStats(s => ({ ...s, saved: s.saved + 1, errors: correct ? s.errors : s.errors + 1 }));
    setDocs(ds => ds.map(d => d.id === doc.id ? { ...d, savedPath: path } : d));
    setSaveModal(null);
    addToast(correct ? `💾 Salvo corretamente! +20 pts` : `💾 Pasta errada! -28 pts | Correto: ${CORRECT_FOLDER[doc.type]}`, correct ? "success" : "error");
    const remaining = docsRef.current.filter(d => d.id !== doc.id && !d.savedPath);
    if (remaining.length === 0) {
      setTimeout(() => {
        const next = level + 1; setLevel(next); setDocs(generateLevel(next));
        setTimeLeft(t => t + 70); setShowStory(true);
        addToast(`🎉 DIA ${level} CONCLUÍDO! +70s bônus`, "success");
      }, 600);
    }
  }

  const tc = timeLeft > 80 ? "#00ff88" : timeLeft > 30 ? "#f0c000" : "#ff3b3b";
  const pending = docs.filter(d => !d.savedPath && !d.scanned);
  const scannedUnsaved = docs.filter(d => d.scanned && !d.savedPath);

  if (phase === "intro") return (
    <div style={{ minHeight: "100vh", background: "#040407", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Courier New', monospace", backgroundImage: "radial-gradient(ellipse at 40% 55%, #0c0818 0%, #040407 65%)" }}>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes slideIn{from{transform:translateY(10px);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes flicker{0%,97%,100%{opacity:1}98%{opacity:0.5}}*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#1a1a2e}`}</style>
      <div style={{ textAlign: "center", maxWidth: 540, padding: 40 }}>
        <div style={{ fontSize: 52, marginBottom: 14 }}>🖨️</div>
        <div style={{ fontSize: 25, fontWeight: "bold", color: "#ddd", letterSpacing: 5, marginBottom: 6, animation: "flicker 4s infinite" }}>BUROCRACIA SIMULATOR</div>
        <div style={{ color: "#4a9eff", fontSize: 10, letterSpacing: 3, marginBottom: 28 }}>DIGITALIZAÇÕES INFERNAIS LTDA.</div>
        <div style={{ background: "#080812", border: "1px solid #111", borderRadius: 7, padding: 20, marginBottom: 22, textAlign: "left" }}>
          <div style={{ color: "#555", fontSize: 12, lineHeight: 2 }}>
            Segunda-feira, 08h47. Sua mesa está coberta de papéis.<br />
            A impressora te observa com desconfiança.<br /><br />
            <span style={{ color: "#f0c000" }}>Missão:</span> digitalizar, validar e arquivar tudo antes do expediente acabar.<br /><br />
            <span style={{ color: "#9b59b6" }}>Inspecione</span> documentos visualmente, compare os campos entre o documento e a ficha cadastral — os erros são seus para encontrar.<br /><br />
            <span style={{ color: "#ff8c00" }}>Prepare</span> cada documento: remova grampos, alinhe folhas e coloque peso na impressora para ela digitalizar direito.
          </div>
        </div>
        <button onClick={startGame} style={{ background: "#4a9eff", border: "none", color: "#000", padding: "12px 38px", borderRadius: 4, cursor: "pointer", fontFamily: "'Courier New', monospace", fontSize: 13, fontWeight: "bold", letterSpacing: 2 }}>▶ ENTRAR NO ESCRITÓRIO</button>
      </div>
    </div>
  );

  if (phase === "gameover") {
    const grade = score > 800 ? "S" : score > 500 ? "A" : score > 300 ? "B" : score > 150 ? "C" : "D";
    const gc = { S: "#f0c000", A: "#00ff88", B: "#4a9eff", C: "#ff8c00", D: "#ff3b3b" }[grade];
    return (
      <div style={{ minHeight: "100vh", background: "#040407", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Courier New', monospace" }}>
        <div style={{ textAlign: "center", maxWidth: 420, padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>⏰</div>
          <div style={{ fontSize: 20, color: "#ff3b3b", fontWeight: "bold", letterSpacing: 3, marginBottom: 6 }}>FIM DO EXPEDIENTE</div>
          <div style={{ color: "#333", fontSize: 11, marginBottom: 22 }}>
            {grade === "D" ? '"Você está despedido." — Sr. Figueiredo' : grade === "C" ? '"Precisa melhorar muito." — Sr. Figueiredo' : grade === "B" ? '"Aceitável. Por hoje." — Sr. Figueiredo' : grade === "A" ? '"Bom trabalho. Sem aumento." — Sr. Figueiredo' : '"...Quem é você?" — Sr. Figueiredo'}
          </div>
          <div style={{ background: "#080812", border: "1px solid #111", borderRadius: 8, padding: 20, marginBottom: 18 }}>
            <div style={{ color: gc, fontSize: 44, fontWeight: "bold", marginBottom: 4 }}>{grade}</div>
            <div style={{ color: "#f0c000", fontSize: 24, fontWeight: "bold", marginBottom: 14 }}>{score} pts</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[{ label: "Aprovados", val: stats.approved, color: "#00ff88" }, { label: "Rejeitados", val: stats.rejected, color: "#ff8c00" }, { label: "Salvos", val: stats.saved, color: "#4a9eff" }, { label: "Erros", val: stats.errors, color: "#ff3b3b" }].map(s => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ color: s.color, fontSize: 20, fontWeight: "bold" }}>{s.val}</div>
                  <div style={{ color: "#333", fontSize: 10 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <button onClick={startGame} style={{ background: "#ff3b3b", border: "none", color: "#fff", padding: "10px 28px", borderRadius: 4, cursor: "pointer", fontFamily: "'Courier New', monospace", fontSize: 13, fontWeight: "bold", letterSpacing: 2 }}>↺ TENTAR DE NOVO</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#040407", fontFamily: "'Courier New', monospace", color: "#ccc", display: "flex", flexDirection: "column" }}>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes slideIn{from{transform:translateY(8px);opacity:0}to{transform:translateY(0);opacity:1}}*{box-sizing:border-box}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#111}`}</style>

      {showStory && <StoryDialog day={level} onClose={() => setShowStory(false)} />}
      <EventBanner event={activeEvent} />

      {/* TOP BAR */}
      <div style={{ background: "#06060f", borderBottom: "1px solid #0f0f1a", padding: "7px 16px", display: "flex", alignItems: "center", gap: 16 }}>
        <div><div style={{ color: "#252535", fontSize: 9 }}>DIA</div><div style={{ color: "#4a9eff", fontSize: 15, fontWeight: "bold" }}>{level}</div></div>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ color: "#151520", fontSize: 9 }}>DIGITALIZAÇÕES INFERNAIS LTDA.</div>
          <div style={{ color: "#252535", fontSize: 10 }}>Sistema Documental v2.4.1</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#252535", fontSize: 9 }}>TEMPO</div>
          <div style={{ color: tc, fontSize: 17, fontWeight: "bold", animation: timeLeft < 30 ? "blink 0.8s infinite" : "none" }}>{pad2(Math.floor(timeLeft / 60))}:{pad2(timeLeft % 60)}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#252535", fontSize: 9 }}>PONTOS</div>
          <div style={{ color: "#f0c000", fontSize: 15, fontWeight: "bold" }}>{score}</div>
        </div>
      </div>

      {/* LAYOUT */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 255px", flex: 1, overflow: "hidden" }}>

        {/* LEFT */}
        <div style={{ borderRight: "1px solid #0a0a14", padding: 9, overflowY: "auto", background: "#060610" }}>
          <div style={{ color: "#151525", fontSize: 9, marginBottom: 7, letterSpacing: 1 }}>PENDENTES ({pending.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {pending.map(doc => (
              <DocumentCard key={doc.id} doc={doc} selected={selectedDoc?.id === doc.id} onClick={() => setSelectedDoc(docs.find(d => d.id === doc.id) || doc)} />
            ))}
          </div>
          {scannedUnsaved.length > 0 && (
            <>
              <div style={{ color: "#4a9eff22", fontSize: 9, margin: "10px 0 5px", letterSpacing: 1 }}>SALVAR ({scannedUnsaved.length})</div>
              {scannedUnsaved.map(doc => (
                <div key={doc.id} onClick={() => setSaveModal(doc)} style={{ background: "#060c14", border: "1px solid #4a9eff22", borderRadius: 4, padding: "7px 10px", cursor: "pointer", marginBottom: 4 }}>
                  <div style={{ color: "#4a9eff", fontSize: 10 }}>💾 {doc.type} — {doc.data.name}</div>
                  <div style={{ color: "#252535", fontSize: 9 }}>clique para salvar</div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* CENTER */}
        <div style={{ padding: 14, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
          {selectedDoc && !selectedDoc.physicalReady && (
            <PhysicalPrepPanel doc={selectedDoc} onPrepared={handlePrepared} />
          )}
          <div style={{ flex: 1 }}>
            <InspectionPanel doc={selectedDoc} onApprove={handleApprove} onReject={handleReject} frozen={frozen} />
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ borderLeft: "1px solid #0a0a14", padding: 9, overflowY: "auto", background: "#060610", display: "flex", flexDirection: "column", gap: 9 }}>
          <PrinterPanel printer={printer} onAction={handlePrinterAction} onAddWeight={handleAddWeight} onRemoveWeight={handleRemoveWeight} />
          <div style={{ background: "#080810", border: "1px solid #0f0f1a", borderRadius: 6, padding: 11 }}>
            <div style={{ color: "#151525", fontSize: 9, marginBottom: 7, letterSpacing: 1 }}>ESTATÍSTICAS</div>
            {[{ label: "Aprovados", val: stats.approved, color: "#00cc66" }, { label: "Rejeitados", val: stats.rejected, color: "#ff8c00" }, { label: "Salvos", val: stats.saved, color: "#4a9eff" }, { label: "Erros", val: stats.errors, color: "#ff3b3b" }].map(s => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: "1px solid #080810" }}>
                <span style={{ color: "#252535", fontSize: 10 }}>{s.label}</span>
                <span style={{ color: s.color, fontSize: 11, fontWeight: "bold" }}>{s.val}</span>
              </div>
            ))}
          </div>
          <div style={{ background: "#080810", border: "1px solid #0f0f1a", borderRadius: 6, padding: 11 }}>
            <div style={{ color: "#151525", fontSize: 9, marginBottom: 7, letterSpacing: 1 }}>COMO JOGAR</div>
            <div style={{ color: "#252535", fontSize: 10, lineHeight: 1.9 }}>
              1. Selecione documento<br />
              2. Prepare (grampos + alinhamento)<br />
              3. Compare doc ↔ ficha<br />
              4. Aprove ou rejeite<br />
              5. Salve na pasta correta<br />
              ⚖ Coloque 2–5kg na impressora
            </div>
          </div>
        </div>
      </div>

      {saveModal && <FileSaveModal doc={saveModal} onSave={handleSave} onClose={() => setSaveModal(null)} />}
      <Toast messages={toasts} />
    </div>
  );
}
