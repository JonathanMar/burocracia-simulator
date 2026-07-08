import { useState } from 'react';
import { genSignature } from '../../game/docGenerator.js';
import DocumentList from '../panels/DocumentList.jsx';
import InspectionPanel from '../panels/InspectionPanel.jsx';
import PhysicalPrepPanel from '../panels/PhysicalPrepPanel.jsx';

const FEATURES_VALID   = { hair: 'short', glasses: false, beard: false };
const FEATURES_INVALID = { hair: 'long',  glasses: false, beard: false };

function makeDocs() {
  return [
    {
      id: 't2', type: 'RG', pages: 1, expectedPages: 1,
      data: {
        name: 'Maria Oliveira', formName: 'Maria Oliveira',
        city: 'Belo Horizonte', formCity: 'Belo Horizonte',
        cpf: '123.456.789-99', // invalid check digits
        issueDate: '15/06/2022', expiryDate: '31/12/2028',
        rg: '98.765.432-1', organ: 'SSP/MG',
        cnhCategory: 'A', cnhNumber: '87654321',
        signature: genSignature(), photoMismatch: false,
        docPhotoFeatures: FEATURES_INVALID, fichaPhotoFeatures: FEATURES_INVALID,
        cid: 'I10.0', doctor: 'Dra. Sandra Melo', crm: 'CRM-SP 67890',
      },
      issues: ['CPF inválido'], isValid: false, scanned: false, savedPath: null,
      aligned: false, hasGrampo: true, misaligned: true, physicalReady: false,
      hasRasura: false, missingStamp: false, missingSignature: false,
      isDuplicate: false, photoMismatch: false, urgentDeadline: null,
      suspectedFields: [], context: null,
    },
  ];
}

const STEPS = {
  intro:   { n: 0, emoji: '👋', title: 'Tutorial prático',          color: '#4a9eff' },
  select:  { n: 1, emoji: '📋', title: '1/4 — Selecione o documento', color: '#4a9eff' },
  prepare: { n: 2, emoji: '⚙',  title: '2/4 — Prepare o documento',  color: '#cc8800' },
  compare: { n: 3, emoji: '🔍', title: '3/4 — Compare o CPF',        color: '#9955cc' },
  decide:  { n: 4, emoji: '⚖',  title: '4/4 — Tome uma decisão',     color: '#cc3333' },
  done:    { n: 5, emoji: '🎉', title: 'Você está pronto!',           color: '#55cc55' },
};

const HINTS = {
  select:  'Clique em "Maria Oliveira" na lista à esquerda para inspecioná-la.',
  prepare: 'O documento tem grampo 📎 e folhas desalinhadas 📄. Clique nos botões de preparação acima para resolver.',
  compare: 'Clique no campo CPF no DOCUMENTO (esquerda), depois clique no CPF na FICHA (direita). Veja se os valores são iguais.',
  decide:  'O dígito verificador do CPF está errado — os dois últimos dígitos não batem. Clique em ✗ REJEITAR.',
};

const STYLES = `
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
  @keyframes slideIn{from{transform:translateY(8px);opacity:0}to{transform:translateY(0);opacity:1}}
  @keyframes pulse{0%,100%{box-shadow:0 0 0 0 #4a9eff44}50%{box-shadow:0 0 0 8px #4a9eff11}}
  *{box-sizing:border-box}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#111}
`;

export default function InteractiveTutorial({ onFinish }) {
  const [step, setStep] = useState('intro');
  const [docs, setDocs] = useState(makeDocs);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const s = STEPS[step];
  const pending = docs.filter(d => !d.savedPath && !d.scanned);

  function handleSelect(doc) {
    const fresh = docs.find(d => d.id === doc.id);
    setSelectedDoc(fresh || doc);
    if (doc.id === 't2' && step === 'select') setStep('prepare');
  }

  function handlePrepared(docId) {
    if (docId !== 't2') return;
    const updated = { ...docs.find(d => d.id === 't2'), physicalReady: true, aligned: true, hasGrampo: false };
    setDocs(ds => ds.map(d => d.id === 't2' ? updated : d));
    setSelectedDoc(updated);
    if (step === 'prepare') setStep('compare');
  }

  function handleFieldCompare() {
    if (step === 'compare') setStep('decide');
  }

  function handleReject(doc) {
    if (doc.id === 't2' && step === 'decide') {
      setDocs(ds => ds.filter(d => d.id !== 't2'));
      setSelectedDoc(null);
      setStep('done');
    }
  }

  const highlightList    = step === 'select';
  const highlightInspect = step === 'prepare' || step === 'compare' || step === 'decide';

  const glowStyle = (active) => active ? {
    outline: '2px solid #4a9eff',
    boxShadow: '0 0 18px #4a9eff33 inset',
    animation: 'pulse 1.8s infinite',
    transition: 'all 0.3s',
  } : {};

  return (
    <div style={{ height:'100vh', background:'#030307', display:'flex', flexDirection:'column', overflow:'hidden', fontFamily:"'Courier New',monospace", color:'#ccc' }}>
      <style>{STYLES}</style>

      {/* Header banner */}
      <div style={{ flexShrink:0, background:'#06061a', borderBottom:'1px solid #1a1a3a', padding:'8px 16px', display:'flex', gap:10, alignItems:'center' }}>
        <span style={{ fontSize:18 }}>{s.emoji}</span>
        <div>
          <div style={{ color: s.color, fontSize:10, letterSpacing:1, fontWeight:'bold' }}>{s.title}</div>
          {step !== 'intro' && step !== 'done' && (
            <div style={{ color:'#aaa', fontSize:11, marginTop:1 }}>{HINTS[step]}</div>
          )}
        </div>
        <button
          onClick={onFinish}
          style={{ marginLeft:'auto', background:'transparent', border:'1px solid #333', color:'#555', padding:'4px 12px', borderRadius:4, cursor:'pointer', fontSize:10, fontFamily:"'Courier New',monospace" }}
        >
          Pular tutorial
        </button>
      </div>

      {/* Intro screen */}
      {step === 'intro' && (
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:20, padding:40 }}>
          <div style={{ fontSize:52 }}>🖨️</div>
          <div style={{ color:'#fff', fontSize:20, fontWeight:'bold', letterSpacing:2 }}>TUTORIAL INTERATIVO</div>
          <div style={{ color:'#aaa', fontSize:12, maxWidth:420, textAlign:'center', lineHeight:2.0 }}>
            Em vez de ler slides, você vai <span style={{ color:'#4a9eff' }}>praticar de verdade</span>.<br/>
            Vamos processar 1 documento com CPF inválido.<br/>
            Siga as instruções no topo da tela — são <strong style={{ color:'#ffcc44' }}>4 passos</strong>.
          </div>
          <div style={{ display:'flex', gap:12 }}>
            <button
              onClick={() => setStep('select')}
              style={{ background:'#3355aa', border:'none', color:'#fff', padding:'12px 32px', borderRadius:6, cursor:'pointer', fontSize:14, fontWeight:'bold', fontFamily:"'Courier New',monospace" }}
            >
              Começar prática →
            </button>
            <button
              onClick={onFinish}
              style={{ background:'transparent', border:'1px solid #444', color:'#888', padding:'12px 22px', borderRadius:6, cursor:'pointer', fontSize:12, fontFamily:"'Courier New',monospace" }}
            >
              Ir direto ao jogo
            </button>
          </div>
        </div>
      )}

      {/* Game UI for steps 1-4 */}
      {step !== 'intro' && step !== 'done' && (
        <div style={{ flex:1, display:'grid', gridTemplateColumns:'210px 1fr', overflow:'hidden', minHeight:0 }}>
          <div style={{ ...glowStyle(highlightList), borderRight:'1px solid #0a0a14' }}>
            <DocumentList
              pending={pending}
              scannedUnsaved={[]}
              saved={0}
              selectedDoc={selectedDoc}
              onSelect={handleSelect}
              onOpenSave={() => {}}
              now={Date.now()}
            />
          </div>
          <div style={{ display:'flex', flexDirection:'column', overflow:'hidden', minHeight:0, ...glowStyle(highlightInspect) }}>
            {selectedDoc && !selectedDoc.physicalReady && (
              <div style={{ flexShrink:0, padding:'8px 14px 0' }}>
                <PhysicalPrepPanel doc={selectedDoc} onPrepared={handlePrepared}/>
              </div>
            )}
            <div style={{ flex:1, minHeight:0 }}>
              <InspectionPanel
                doc={selectedDoc}
                onApprove={() => {}}
                onReject={handleReject}
                frozen={false}
                blackout={false}
                onFieldCompare={handleFieldCompare}
                suspectedFields={[]}
                onToggleSuspect={() => {}}
              />
            </div>
          </div>
        </div>
      )}

      {/* Done screen */}
      {step === 'done' && (
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:20, padding:40 }}>
          <div style={{ fontSize:52 }}>🎉</div>
          <div style={{ color:'#55cc55', fontSize:20, fontWeight:'bold' }}>Perfeito!</div>
          <div style={{ background:'#05100a', border:'1px solid #224422', borderRadius:8, padding:'16px 24px', maxWidth:420, textAlign:'left' }}>
            <div style={{ color:'#77cc77', fontSize:11, marginBottom:8, fontWeight:'bold' }}>Você aprendeu o fluxo principal:</div>
            {['📋 Selecionar o documento', '⚙ Preparar fisicamente', '🔍 Comparar campos (CPF, nome, cidade...)', '⚖ Aprovar ou rejeitar'].map((t, i) => (
              <div key={i} style={{ color:'#aaa', fontSize:11, padding:'3px 0' }}>✓ {t}</div>
            ))}
            <div style={{ color:'#888', fontSize:10, marginTop:10, lineHeight:1.7 }}>
              No jogo real você também vai:<br/>
              • Gerenciar a impressora Beatriz<br/>
              • Lidar com eventos aleatórios<br/>
              • Salvar docs nas pastas corretas
            </div>
          </div>
          <button
            onClick={onFinish}
            style={{ background:'#336633', border:'none', color:'#fff', padding:'14px 40px', borderRadius:6, cursor:'pointer', fontSize:14, fontWeight:'bold', fontFamily:"'Courier New',monospace", letterSpacing:1 }}
          >
            🚀 Começar o jogo!
          </button>
        </div>
      )}
    </div>
  );
}
