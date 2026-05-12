import { useState, useEffect, useRef, useCallback } from "react";

// ── DATA ──────────────────────────────────────────────────────────────────────
const CITIES = ["São Paulo", "Belo Horizonte", "Rio de Janeiro", "Curitiba", "Salvador"];
const NAMES = ["João Silva", "Maria Oliveira", "Carlos Souza", "Ana Lima", "Pedro Costa", "Fernanda Rocha"];
const DOC_TYPES = ["RG", "CONTRATO", "LAUDO", "CERTIDÃO", "PROCESSO"];

function generateCPF(valid = true) {
  const rand = () => Math.floor(Math.random() * 9);
  const d = Array.from({ length: 9 }, rand);
  if (!valid) {
    return `${d[0]}${d[1]}${d[2]}.${d[3]}${d[4]}${d[5]}.${d[6]}${d[7]}${d[8]}-99`;
  }
  let s1 = d.reduce((a, v, i) => a + v * (10 - i), 0);
  let r1 = (s1 * 10) % 11; if (r1 >= 10) r1 = 0;
  let s2 = d.reduce((a, v, i) => a + v * (11 - i), 0) + r1 * 2;
  let r2 = (s2 * 10) % 11; if (r2 >= 10) r2 = 0;
  return `${d[0]}${d[1]}${d[2]}.${d[3]}${d[4]}${d[5]}.${d[6]}${d[7]}${d[8]}-${r1}${r2}`;
}

function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generateDocument(id, level) {
  const type = randomFrom(DOC_TYPES);
  const name = randomFrom(NAMES);
  const city = randomFrom(CITIES);
  const validCPF = Math.random() > 0.3;
  const cityMismatch = Math.random() > 0.65;
  const nameMismatch = Math.random() > 0.75;
  const expired = Math.random() > 0.8;
  const missingPages = level > 1 && Math.random() > 0.75;

  const year = expired ? 2019 + Math.floor(Math.random() * 3) : 2025;
  const expiryYear = expired ? 2022 : 2027;

  const issues = [];
  if (!validCPF) issues.push("CPF inválido");
  if (cityMismatch) issues.push("Cidade incompatível entre páginas");
  if (nameMismatch) issues.push("Nome divergente");
  if (expired) issues.push("Documento vencido");
  if (missingPages) issues.push("Página faltando");

  return {
    id,
    type,
    pages: missingPages ? 1 : (type === "CONTRATO" || type === "PROCESSO" ? 2 : 1),
    expectedPages: type === "CONTRATO" || type === "PROCESSO" ? 2 : 1,
    data: {
      name,
      cpf: generateCPF(validCPF),
      city,
      formCity: cityMismatch ? randomFrom(CITIES.filter(c => c !== city)) : city,
      formName: nameMismatch ? randomFrom(NAMES.filter(n => n !== name)) : name,
      issueDate: `${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}/${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}/${year}`,
      expiryDate: `31/12/${expiryYear}`,
    },
    issues,
    isValid: issues.length === 0,
    scanned: false,
    savedPath: null,
    aligned: false,
  };
}

// ── PRINTER STATES ─────────────────────────────────────────────────────────────
const PRINTER_EVENTS = [
  { id: "jam", label: "ATOLAMENTO!", color: "#ff3b3b", fix: "pull" },
  { id: "toner", label: "SEM TONER", color: "#ff8c00", fix: "replace" },
  { id: "overheat", label: "SUPERAQUECIMENTO", color: "#ff5500", fix: "wait" },
  { id: "skewed", label: "PAPEL TORTO", color: "#f0c000", fix: "align" },
  { id: "ghost", label: "MODO FANTASMA ATIVADO", color: "#9b59b6", fix: "restart" },
];

// ── FOLDER STRUCTURE ───────────────────────────────────────────────────────────
const FOLDER_TREE = {
  "CLIENTES": {
    "2026": {
      "RG": {},
      "CONTRATOS": {},
      "LAUDOS": {},
      "CERTIDÕES": {},
      "PROCESSOS": {},
    }
  }
};

const CORRECT_FOLDER = {
  "RG": "CLIENTES/2026/RG",
  "CONTRATO": "CLIENTES/2026/CONTRATOS",
  "LAUDO": "CLIENTES/2026/LAUDOS",
  "CERTIDÃO": "CLIENTES/2026/CERTIDÕES",
  "PROCESSO": "CLIENTES/2026/PROCESSOS",
};

// ── COMPONENTS ────────────────────────────────────────────────────────────────
function PrinterDisplay({ printer, onAction }) {
  const issue = printer.currentIssue;
  const health = printer.health;
  const mood = printer.mood;

  const moodFace = mood > 70 ? "( ◕‿◕)" : mood > 40 ? "(-_-;)" : mood > 15 ? "(╯°□°)╯" : "(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧";
  const healthColor = health > 60 ? "#00ff88" : health > 30 ? "#f0c000" : "#ff3b3b";

  return (
    <div style={{
      background: "#1a1a2e",
      border: `2px solid ${issue ? issue.color : "#333"}`,
      borderRadius: 8,
      padding: 16,
      fontFamily: "'Courier New', monospace",
      boxShadow: issue ? `0 0 20px ${issue.color}44` : "none",
      transition: "all 0.3s",
    }}>
      {/* Printer body */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={{ fontSize: 36 }}>🖨️</div>
        <div>
          <div style={{ color: "#888", fontSize: 10 }}>SCANJET PRO X-2000</div>
          <div style={{ color: "#00ff88", fontSize: 12 }}>Humor: {moodFace}</div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ color: "#888", fontSize: 10 }}>SAÚDE</div>
          <div style={{ color: healthColor, fontSize: 18, fontWeight: "bold" }}>{health}%</div>
        </div>
      </div>

      {/* Status bar */}
      <div style={{ height: 6, background: "#111", borderRadius: 3, marginBottom: 10, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${health}%`,
          background: healthColor,
          transition: "width 0.5s, background 0.5s",
          borderRadius: 3,
        }} />
      </div>

      {/* Issue display */}
      {issue ? (
        <div style={{
          background: `${issue.color}22`,
          border: `1px solid ${issue.color}`,
          borderRadius: 6,
          padding: 10,
          marginBottom: 10,
          animation: "blink 1s infinite",
        }}>
          <div style={{ color: issue.color, fontWeight: "bold", fontSize: 13 }}>⚠ {issue.label}</div>
          <div style={{ color: "#aaa", fontSize: 11, marginTop: 4 }}>
            Ação necessária: {
              issue.fix === "pull" ? "Puxar papel atolado" :
                issue.fix === "replace" ? "Trocar toner" :
                  issue.fix === "wait" ? "Aguardar resfriamento" :
                    issue.fix === "align" ? "Realinhar papel" :
                      "Reiniciar sistema"
            }
          </div>
        </div>
      ) : (
        <div style={{ color: "#00ff88", fontSize: 12, marginBottom: 10 }}>✓ PRONTA PARA DIGITALIZAR</div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {[
          { label: "🤜 TAPINHA", action: "tap", color: "#ff6b35" },
          { label: "📄 PUXAR PAPEL", action: "pull", color: "#f0c000" },
          { label: "🔄 REINICIAR", action: "restart", color: "#4a9eff" },
          { label: "🖊️ TONER", action: "replace", color: "#888" },
          { label: "❄️ RESFRIAR", action: "wait", color: "#00bcd4" },
        ].map(btn => (
          <button
            key={btn.action}
            onClick={() => onAction(btn.action)}
            style={{
              background: `${btn.color}22`,
              border: `1px solid ${btn.color}`,
              color: btn.color,
              padding: "4px 8px",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 11,
              fontFamily: "'Courier New', monospace",
              transition: "all 0.1s",
            }}
            onMouseEnter={e => e.target.style.background = `${btn.color}44`}
            onMouseLeave={e => e.target.style.background = `${btn.color}22`}
          >
            {btn.label}
          </button>
        ))}
      </div>
      {printer.jammed && (
        <div style={{ color: "#ff3b3b", fontSize: 11, marginTop: 8, animation: "blink 0.5s infinite" }}>
          ⛔ Digitalização bloqueada — conserte primeiro!
        </div>
      )}
    </div>
  );
}

function DocumentCard({ doc, selected, onClick }) {
  const hasIssues = doc.issues.length > 0;
  return (
    <div
      onClick={onClick}
      style={{
        background: selected ? "#1a2a3a" : "#0f0f1a",
        border: `2px solid ${selected ? "#4a9eff" : hasIssues ? "#ff3b3b44" : "#222"}`,
        borderRadius: 8,
        padding: 12,
        cursor: "pointer",
        transition: "all 0.2s",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <span style={{
            background: hasIssues ? "#ff3b3b22" : "#00ff8822",
            border: `1px solid ${hasIssues ? "#ff3b3b" : "#00ff88"}`,
            color: hasIssues ? "#ff3b3b" : "#00ff88",
            padding: "2px 6px",
            borderRadius: 3,
            fontSize: 10,
            fontFamily: "'Courier New', monospace",
          }}>{doc.type}</span>
          <div style={{ color: "#fff", fontSize: 13, marginTop: 6, fontWeight: "bold" }}>{doc.data.name}</div>
          <div style={{ color: "#666", fontSize: 11 }}>CPF: {doc.data.cpf}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          {doc.scanned && <div style={{ color: "#00ff88", fontSize: 11 }}>✓ DIGITALIZADO</div>}
          {doc.savedPath && <div style={{ color: "#4a9eff", fontSize: 10 }}>💾 SALVO</div>}
          <div style={{ color: "#555", fontSize: 10, marginTop: 4 }}>{doc.pages}/{doc.expectedPages} pgs</div>
        </div>
      </div>
      {hasIssues && (
        <div style={{ marginTop: 8, display: "flex", gap: 4, flexWrap: "wrap" }}>
          {doc.issues.map(issue => (
            <span key={issue} style={{
              background: "#ff3b3b11",
              border: "1px solid #ff3b3b44",
              color: "#ff6b6b",
              fontSize: 9,
              padding: "1px 5px",
              borderRadius: 3,
              fontFamily: "'Courier New', monospace",
            }}>⚠ {issue}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function InspectionPanel({ doc, onApprove, onReject }) {
  if (!doc) return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100%", color: "#333", fontFamily: "'Courier New', monospace",
      flexDirection: "column", gap: 8,
    }}>
      <div style={{ fontSize: 40 }}>📋</div>
      <div>Selecione um documento para inspecionar</div>
    </div>
  );

  const checks = [
    { label: "CPF", ok: doc.issues.indexOf("CPF inválido") === -1, val: doc.data.cpf },
    { label: "Cidade (RG)", ok: true, val: doc.data.city },
    { label: "Cidade (Form.)", ok: doc.data.city === doc.data.formCity, val: doc.data.formCity },
    { label: "Nome (RG)", ok: true, val: doc.data.name },
    { label: "Nome (Form.)", ok: doc.data.name === doc.data.formName, val: doc.data.formName },
    { label: "Validade", ok: doc.issues.indexOf("Documento vencido") === -1, val: doc.data.expiryDate },
    { label: "Páginas", ok: doc.pages === doc.expectedPages, val: `${doc.pages}/${doc.expectedPages}` },
  ];

  return (
    <div style={{ fontFamily: "'Courier New', monospace", height: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{
          background: "#4a9eff22", border: "1px solid #4a9eff",
          color: "#4a9eff", padding: "2px 8px", borderRadius: 3, fontSize: 12,
        }}>DOC #{doc.id}</span>
        <span style={{ color: "#fff", fontWeight: "bold" }}>{doc.type} — {doc.data.name}</span>
      </div>

      {/* Check table */}
      <div style={{
        background: "#0a0a14", border: "1px solid #1a1a2e",
        borderRadius: 6, overflow: "hidden", flex: 1,
      }}>
        <div style={{ background: "#111", padding: "6px 12px", borderBottom: "1px solid #1a1a2e" }}>
          <span style={{ color: "#555", fontSize: 11 }}>VERIFICAÇÃO DE DADOS</span>
        </div>
        {checks.map(c => (
          <div key={c.label} style={{
            display: "flex", padding: "7px 12px",
            borderBottom: "1px solid #0f0f1a",
            background: !c.ok ? "#ff3b3b08" : "transparent",
          }}>
            <div style={{ color: "#555", fontSize: 11, width: 100, flexShrink: 0 }}>{c.label}</div>
            <div style={{ color: c.ok ? "#ccc" : "#ff3b3b", fontSize: 12, flex: 1 }}>{c.val}</div>
            <div style={{ color: c.ok ? "#00ff88" : "#ff3b3b", fontSize: 14 }}>{c.ok ? "✓" : "✗"}</div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={() => onApprove(doc)}
          style={{
            flex: 1, padding: "10px 0",
            background: "#00ff8811", border: "1px solid #00ff88",
            color: "#00ff88", borderRadius: 6, cursor: "pointer",
            fontFamily: "'Courier New', monospace", fontSize: 13, fontWeight: "bold",
          }}
        >✓ APROVADO — DIGITALIZAR</button>
        <button
          onClick={() => onReject(doc)}
          style={{
            flex: 1, padding: "10px 0",
            background: "#ff3b3b11", border: "1px solid #ff3b3b",
            color: "#ff3b3b", borderRadius: 6, cursor: "pointer",
            fontFamily: "'Courier New', monospace", fontSize: 13, fontWeight: "bold",
          }}
        >✗ REJEITAR</button>
      </div>
    </div>
  );
}

function FileSaveModal({ doc, onSave, onClose }) {
  const [selectedPath, setSelectedPath] = useState("");
  const correct = CORRECT_FOLDER[doc.type];

  const folders = Object.entries(CORRECT_FOLDER).map(([type, path]) => path);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#000000cc",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
    }}>
      <div style={{
        background: "#0f0f1a", border: "1px solid #333",
        borderRadius: 10, padding: 24, width: 420,
        fontFamily: "'Courier New', monospace",
      }}>
        <div style={{ color: "#fff", fontSize: 15, fontWeight: "bold", marginBottom: 4 }}>
          💾 SALVAR ARQUIVO
        </div>
        <div style={{ color: "#555", fontSize: 11, marginBottom: 16 }}>
          {doc.type}_{doc.id}_{doc.data.name.replace(" ", "_")}.pdf
        </div>

        <div style={{ color: "#888", fontSize: 11, marginBottom: 8 }}>Selecione o diretório:</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
          {folders.map(folder => (
            <div
              key={folder}
              onClick={() => setSelectedPath(folder)}
              style={{
                padding: "8px 12px",
                background: selectedPath === folder ? "#4a9eff22" : "#111",
                border: `1px solid ${selectedPath === folder ? "#4a9eff" : "#222"}`,
                borderRadius: 5, cursor: "pointer", fontSize: 12,
                color: selectedPath === folder ? "#4a9eff" : "#666",
                transition: "all 0.15s",
              }}
            >
              📁 {folder}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => selectedPath && onSave(doc, selectedPath, selectedPath === correct)}
            disabled={!selectedPath}
            style={{
              flex: 1, padding: "9px 0",
              background: selectedPath ? "#4a9eff22" : "#111",
              border: `1px solid ${selectedPath ? "#4a9eff" : "#333"}`,
              color: selectedPath ? "#4a9eff" : "#555",
              borderRadius: 6, cursor: selectedPath ? "pointer" : "default",
              fontFamily: "'Courier New', monospace", fontSize: 12, fontWeight: "bold",
            }}
          >SALVAR AQUI</button>
          <button onClick={onClose} style={{
            padding: "9px 16px",
            background: "transparent", border: "1px solid #333",
            color: "#666", borderRadius: 6, cursor: "pointer",
            fontFamily: "'Courier New', monospace", fontSize: 12,
          }}>CANCELAR</button>
        </div>
      </div>
    </div>
  );
}

function Toast({ messages }) {
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24,
      display: "flex", flexDirection: "column-reverse", gap: 8, zIndex: 200,
    }}>
      {messages.map(m => (
        <div key={m.id} style={{
          background: m.type === "error" ? "#2a0a0a" : m.type === "success" ? "#0a2a0a" : "#0a0a2a",
          border: `1px solid ${m.type === "error" ? "#ff3b3b" : m.type === "success" ? "#00ff88" : "#4a9eff"}`,
          color: m.type === "error" ? "#ff6b6b" : m.type === "success" ? "#00ff88" : "#4a9eff",
          padding: "8px 14px", borderRadius: 6,
          fontFamily: "'Courier New', monospace", fontSize: 12,
          animation: "slideIn 0.2s ease",
          maxWidth: 280,
        }}>{m.text}</div>
      ))}
    </div>
  );
}

// ── MAIN GAME ─────────────────────────────────────────────────────────────────
export default function BurocraciaSimulator() {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [docs, setDocs] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [saveModal, setSaveModal] = useState(null);
  const [timeLeft, setTimeLeft] = useState(180);
  const [gameOver, setGameOver] = useState(false);
  const [phase, setPhase] = useState("intro"); // intro | playing | gameover
  const [printer, setPrinter] = useState({
    health: 100,
    mood: 80,
    jammed: false,
    currentIssue: null,
    tapCount: 0,
  });
  const [stats, setStats] = useState({ approved: 0, rejected: 0, saved: 0, errors: 0 });
  const toastId = useRef(0);
  const timerRef = useRef(null);

  const addToast = useCallback((text, type = "info") => {
    const id = ++toastId.current;
    setToasts(t => [...t.slice(-4), { id, text, type }]);
    setTimeout(() => setToasts(t => t.filter(m => m.id !== id)), 3000);
  }, []);

  const generateLevel = useCallback((lv) => {
    const count = 3 + lv * 2;
    return Array.from({ length: count }, (_, i) => generateDocument(i + 1, lv));
  }, []);

  // Timer
  useEffect(() => {
    if (phase !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setPhase("gameover");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // Random printer events
  useEffect(() => {
    if (phase !== "playing") return;
    const interval = setInterval(() => {
      if (Math.random() < 0.15 + level * 0.05) {
        const event = randomFrom(PRINTER_EVENTS);
        setPrinter(p => ({
          ...p,
          currentIssue: event,
          jammed: true,
          mood: Math.max(0, p.mood - 15),
          health: Math.max(0, p.health - 8),
        }));
        addToast(`🖨️ Impressora: ${event.label}`, "error");
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [phase, level, addToast]);

  function startGame() {
    const newDocs = generateLevel(1);
    setDocs(newDocs);
    setLevel(1);
    setScore(0);
    setTimeLeft(180);
    setPhase("playing");
    setStats({ approved: 0, rejected: 0, saved: 0, errors: 0 });
    setPrinter({ health: 100, mood: 80, jammed: false, currentIssue: null, tapCount: 0 });
  }

  function handlePrinterAction(action) {
    setPrinter(p => {
      const issue = p.currentIssue;
      const isCorrect = issue && issue.fix === action;

      if (action === "tap") {
        const roll = Math.random();
        if (roll < 0.3 && p.jammed) {
          addToast("🤜 Tapinha resolveu! Impressora voltou!", "success");
          return { ...p, jammed: false, currentIssue: null, tapCount: p.tapCount + 1, mood: Math.min(100, p.mood + 5) };
        } else if (roll < 0.6) {
          addToast("🤜 Tapinha não ajudou... mas foi satisfatório.", "info");
          return { ...p, tapCount: p.tapCount + 1 };
        } else {
          addToast("🤜 PIOROU! A impressora ficou com raiva.", "error");
          return { ...p, health: Math.max(0, p.health - 12), mood: Math.max(0, p.mood - 20), tapCount: p.tapCount + 1 };
        }
      }

      if (isCorrect) {
        addToast(`✓ Problema resolvido: ${issue.label}`, "success");
        return { ...p, jammed: false, currentIssue: null, mood: Math.min(100, p.mood + 10) };
      } else if (p.jammed) {
        addToast("❌ Ação incorreta — tente outra coisa.", "error");
        return { ...p, health: Math.max(0, p.health - 5) };
      } else {
        addToast("A impressora está bem. Por enquanto.", "info");
        return p;
      }
    });
  }

  function handleApprove(doc) {
    if (printer.jammed) {
      addToast("⛔ Impressora travada! Conserte primeiro.", "error");
      return;
    }

    // Wrong approval
    if (!doc.isValid) {
      const penalty = 30;
      setScore(s => Math.max(0, s - penalty));
      setStats(s => ({ ...s, errors: s.errors + 1 }));
      addToast(`⚠ Documento com ${doc.issues.length} erro(s) aprovado! -${penalty} pontos`, "error");
      // Still scan it (badly)
      setDocs(ds => ds.map(d => d.id === doc.id ? { ...d, scanned: true } : d));
      setSaveModal(doc);
    } else {
      const pts = 50 + Math.floor(timeLeft / 10);
      setScore(s => s + pts);
      setStats(s => ({ ...s, approved: s.approved + 1 }));
      addToast(`✓ Documento correto digitalizado! +${pts} pts`, "success");
      setDocs(ds => ds.map(d => d.id === doc.id ? { ...d, scanned: true } : d));
      setSaveModal(doc);
    }
    setSelectedDoc(null);
  }

  function handleReject(doc) {
    if (doc.isValid) {
      const penalty = 40;
      setScore(s => Math.max(0, s - penalty));
      setStats(s => ({ ...s, errors: s.errors + 1 }));
      addToast(`❌ Documento válido rejeitado! -${penalty} pts`, "error");
    } else {
      const pts = 30;
      setScore(s => s + pts);
      setStats(s => ({ ...s, rejected: s.rejected + 1 }));
      addToast(`✓ Erro detectado e rejeitado! +${pts} pts`, "success");
    }
    setDocs(ds => ds.filter(d => d.id !== doc.id));
    setSelectedDoc(null);
  }

  function handleSave(doc, path, correct) {
    const pts = correct ? 20 : -25;
    setScore(s => Math.max(0, s + pts));
    setStats(s => ({ ...s, saved: s.saved + 1, errors: correct ? s.errors : s.errors + 1 }));
    setDocs(ds => ds.map(d => d.id === doc.id ? { ...d, savedPath: path } : d));
    setSaveModal(null);

    if (correct) {
      addToast(`💾 Salvo em ${path} +20 pts`, "success");
    } else {
      addToast(`💾 Pasta errada! -25 pts | Correto: ${CORRECT_FOLDER[doc.type]}`, "error");
    }

    // Check level complete
    const remaining = docs.filter(d => d.id !== doc.id && !d.savedPath && !d.scanned);
    if (remaining.length === 0) {
      setTimeout(() => {
        const nextLevel = level + 1;
        setLevel(nextLevel);
        setDocs(generateLevel(nextLevel));
        setTimeLeft(t => t + 60);
        addToast(`🎉 FASE ${level} CONCLUÍDA! +60s de bônus — Fase ${nextLevel}!`, "success");
      }, 500);
    }
  }

  const timeColor = timeLeft > 60 ? "#00ff88" : timeLeft > 30 ? "#f0c000" : "#ff3b3b";
  const pendingDocs = docs.filter(d => !d.savedPath && !d.scanned);
  const scannedUnsaved = docs.filter(d => d.scanned && !d.savedPath);

  // ── INTRO SCREEN ──────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div style={{
        minHeight: "100vh", background: "#050508",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Courier New', monospace",
        backgroundImage: "radial-gradient(ellipse at 50% 50%, #0d0d1f 0%, #050508 70%)",
      }}>
        <style>{`
          @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
          @keyframes slideIn { from{transform:translateX(20px);opacity:0} to{transform:translateX(0);opacity:1} }
          @keyframes flicker { 0%,100%{opacity:1} 92%{opacity:0.9} 93%{opacity:0.6} 94%{opacity:0.9} }
        `}</style>
        <div style={{ textAlign: "center", maxWidth: 520, padding: 40 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🖨️</div>
          <div style={{
            fontSize: 28, fontWeight: "bold", color: "#fff",
            letterSpacing: 4, marginBottom: 4,
            animation: "flicker 3s infinite",
          }}>BUROCRACIA SIMULATOR</div>
          <div style={{ color: "#4a9eff", fontSize: 13, letterSpacing: 2, marginBottom: 32 }}>
            DIGITALIZAÇÕES INFERNAIS LTDA.
          </div>
          <div style={{
            background: "#0f0f1a", border: "1px solid #1a1a2e",
            borderRadius: 8, padding: 20, marginBottom: 28, textAlign: "left",
          }}>
            <div style={{ color: "#888", fontSize: 12, lineHeight: 1.8 }}>
              É segunda-feira. São 08h47.<br />
              Sua mesa está coberta de documentos.<br />
              A impressora olha para você com desconfiança.<br /><br />
              <span style={{ color: "#f0c000" }}>Sua missão:</span> digitalizar, validar e salvar<br />
              todos os documentos antes do fim do expediente.<br /><br />
              <span style={{ color: "#ff3b3b" }}>Cuidado</span> com CPFs inválidos, cidades incompatíveis,<br />
              documentos vencidos... e a impressora.
            </div>
          </div>
          <button
            onClick={startGame}
            style={{
              background: "#4a9eff", border: "none",
              color: "#000", padding: "14px 40px",
              borderRadius: 6, cursor: "pointer",
              fontFamily: "'Courier New', monospace",
              fontSize: 15, fontWeight: "bold", letterSpacing: 2,
            }}
          >▶ ENTRAR NO ESCRITÓRIO</button>
        </div>
      </div>
    );
  }

  // ── GAME OVER SCREEN ──────────────────────────────────────────────────────
  if (phase === "gameover") {
    return (
      <div style={{
        minHeight: "100vh", background: "#050508",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Courier New', monospace",
      }}>
        <div style={{ textAlign: "center", maxWidth: 420, padding: 40 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>⏰</div>
          <div style={{ fontSize: 24, color: "#ff3b3b", fontWeight: "bold", letterSpacing: 3, marginBottom: 4 }}>
            FIM DO EXPEDIENTE
          </div>
          <div style={{ color: "#555", fontSize: 12, marginBottom: 28 }}>
            O chefe não ficou satisfeito.
          </div>
          <div style={{
            background: "#0f0f1a", border: "1px solid #1a1a2e",
            borderRadius: 8, padding: 20, marginBottom: 24,
          }}>
            <div style={{ color: "#f0c000", fontSize: 28, fontWeight: "bold" }}>{score} pts</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
              {[
                { label: "Aprovados", val: stats.approved, color: "#00ff88" },
                { label: "Rejeitados", val: stats.rejected, color: "#ff8c00" },
                { label: "Salvos", val: stats.saved, color: "#4a9eff" },
                { label: "Erros", val: stats.errors, color: "#ff3b3b" },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ color: s.color, fontSize: 22, fontWeight: "bold" }}>{s.val}</div>
                  <div style={{ color: "#555", fontSize: 11 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={startGame}
            style={{
              background: "#ff3b3b", border: "none",
              color: "#fff", padding: "12px 32px",
              borderRadius: 6, cursor: "pointer",
              fontFamily: "'Courier New', monospace",
              fontSize: 13, fontWeight: "bold", letterSpacing: 2,
            }}
          >↺ TENTAR DE NOVO</button>
        </div>
      </div>
    );
  }

  // ── PLAYING SCREEN ────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh", background: "#050508",
      fontFamily: "'Courier New', monospace", color: "#ccc",
      display: "flex", flexDirection: "column",
    }}>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes slideIn { from{transform:translateX(20px);opacity:0} to{transform:translateX(0);opacity:1} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a14; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 2px; }
      `}</style>

      {/* TOP BAR */}
      <div style={{
        background: "#0a0a14", borderBottom: "1px solid #1a1a2e",
        padding: "10px 20px", display: "flex", alignItems: "center", gap: 20,
      }}>
        <div>
          <div style={{ color: "#555", fontSize: 10 }}>FASE</div>
          <div style={{ color: "#4a9eff", fontSize: 18, fontWeight: "bold" }}>{level}</div>
        </div>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ color: "#555", fontSize: 10 }}>DIGITALIZAÇÕES INFERNAIS LTDA.</div>
          <div style={{ color: "#888", fontSize: 12 }}>Sistema de Gestão Documental v2.4.1</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#555", fontSize: 10 }}>TEMPO</div>
          <div style={{ color: timeColor, fontSize: 20, fontWeight: "bold", animation: timeLeft < 30 ? "blink 1s infinite" : "none" }}>
            {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:{String(timeLeft % 60).padStart(2, "0")}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#555", fontSize: 10 }}>PONTOS</div>
          <div style={{ color: "#f0c000", fontSize: 18, fontWeight: "bold" }}>{score}</div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 280px", flex: 1, overflow: "hidden" }}>

        {/* LEFT: Document pile */}
        <div style={{
          borderRight: "1px solid #1a1a2e", padding: 12,
          overflowY: "auto", background: "#080810",
        }}>
          <div style={{ color: "#555", fontSize: 10, marginBottom: 8, letterSpacing: 1 }}>
            DOCUMENTOS PENDENTES ({pendingDocs.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pendingDocs.map(doc => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                selected={selectedDoc?.id === doc.id}
                onClick={() => setSelectedDoc(doc)}
              />
            ))}
          </div>

          {scannedUnsaved.length > 0 && (
            <>
              <div style={{ color: "#4a9eff44", fontSize: 10, margin: "12px 0 8px", letterSpacing: 1 }}>
                AGUARDANDO SALVAR ({scannedUnsaved.length})
              </div>
              {scannedUnsaved.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => setSaveModal(doc)}
                  style={{
                    background: "#0a1a2a", border: "1px solid #4a9eff44",
                    borderRadius: 6, padding: 10, cursor: "pointer", marginBottom: 6,
                  }}
                >
                  <div style={{ color: "#4a9eff", fontSize: 11 }}>💾 {doc.type} — {doc.data.name}</div>
                  <div style={{ color: "#555", fontSize: 10 }}>Clique para salvar</div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* CENTER: Inspection */}
        <div style={{ padding: 20, overflowY: "auto" }}>
          <InspectionPanel
            doc={selectedDoc}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </div>

        {/* RIGHT: Printer + stats */}
        <div style={{
          borderLeft: "1px solid #1a1a2e", padding: 12,
          overflowY: "auto", background: "#080810",
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          <PrinterDisplay printer={printer} onAction={handlePrinterAction} />

          {/* Stats */}
          <div style={{
            background: "#0a0a14", border: "1px solid #1a1a2e",
            borderRadius: 8, padding: 12,
          }}>
            <div style={{ color: "#555", fontSize: 10, marginBottom: 8, letterSpacing: 1 }}>ESTATÍSTICAS</div>
            {[
              { label: "Aprovados", val: stats.approved, color: "#00ff88" },
              { label: "Rejeitados", val: stats.rejected, color: "#ff8c00" },
              { label: "Salvos", val: stats.saved, color: "#4a9eff" },
              { label: "Erros", val: stats.errors, color: "#ff3b3b" },
            ].map(s => (
              <div key={s.label} style={{
                display: "flex", justifyContent: "space-between",
                padding: "4px 0", borderBottom: "1px solid #111",
              }}>
                <span style={{ color: "#555", fontSize: 11 }}>{s.label}</span>
                <span style={{ color: s.color, fontSize: 13, fontWeight: "bold" }}>{s.val}</span>
              </div>
            ))}
          </div>

          {/* Quick guide */}
          <div style={{
            background: "#0a0a14", border: "1px solid #1a1a2e",
            borderRadius: 8, padding: 12,
          }}>
            <div style={{ color: "#555", fontSize: 10, marginBottom: 8, letterSpacing: 1 }}>GUIA RÁPIDO</div>
            <div style={{ color: "#444", fontSize: 10, lineHeight: 1.8 }}>
              ✓ Verifique CPF, cidade,<br />
              &nbsp;&nbsp;nome e validade<br />
              ✓ Aprovado → digitaliza<br />
              ✓ Salve na pasta correta<br />
              ✗ Erros de salvamento<br />
              &nbsp;&nbsp;custam pontos<br />
              🖨️ Conserte a impressora<br />
              &nbsp;&nbsp;com a ação certa
            </div>
          </div>
        </div>
      </div>

      {/* Save modal */}
      {saveModal && (
        <FileSaveModal
          doc={saveModal}
          onSave={handleSave}
          onClose={() => setSaveModal(null)}
        />
      )}

      <Toast messages={toasts} />
    </div>
  );
}