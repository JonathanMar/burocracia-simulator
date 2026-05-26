export const CITIES = ["São Paulo","Belo Horizonte","Rio de Janeiro","Curitiba","Salvador","Fortaleza","Manaus","Porto Alegre"];
export const NAMES = ["João Silva","Maria Oliveira","Carlos Souza","Ana Lima","Pedro Costa","Fernanda Rocha","Roberto Alves","Cláudia Mendes","Marcos Santos","Juliana Ferreira","Lucas Pereira","Amanda Gomes"];
export const DOC_TYPES = ["RG","CNH","CONTRATO","LAUDO","CERTIDÃO","PROCESSO","DECLARAÇÃO","ATESTADO"];
export const CORRECT_FOLDER = {
  "RG":         "CLIENTES/2026/RG",
  "CNH":        "CLIENTES/2026/CNH",
  "CONTRATO":   "CLIENTES/2026/CONTRATOS",
  "LAUDO":      "CLIENTES/2026/LAUDOS",
  "CERTIDÃO":   "CLIENTES/2026/CERTIDÕES",
  "PROCESSO":   "CLIENTES/2026/PROCESSOS",
  "DECLARAÇÃO": "CLIENTES/2026/DECLARAÇÕES",
  "ATESTADO":   "CLIENTES/2026/ATESTADOS",
};

// Shown in toast and game-over review to explain WHY the player was wrong
export const ISSUE_EXPLANATIONS = {
  "CPF inválido":        "Os dígitos verificadores do CPF estavam incorretos.",
  "CPF duplicado":       "Este CPF já apareceu em outro documento — possível fraude.",
  "Cidade incompatível": "A cidade no documento diferia da cidade na ficha cadastral.",
  "Nome divergente":     "O nome no documento não coincidia com o nome na ficha cadastral.",
  "Documento vencido":   "A data de validade já havia expirado.",
  "Página faltando":     "Documento de 2 páginas com apenas 1 página presente.",
  "Rasura no CPF":       "Campo CPF com rasura — automaticamente inválido por norma.",
  "Carimbo ausente":     "Carimbo oficial obrigatório estava ausente.",
  "Assinatura ausente":  "O campo de assinatura estava em branco.",
  "Foto suspeita":       "A foto no documento não correspondia à pessoa na ficha cadastral.",
};

// Narrative post-it notes attached to some documents (null = sem contexto)
export const DOC_CONTEXTS = [
  null, null, null, null, // maioria dos docs não tem contexto
  "⏰ URGENTE: Cirurgia agendada para amanhã. Família aguarda no corredor.",
  "🏠 Família perde acesso ao imóvel se este doc não for processado hoje.",
  "✈ Embarque internacional em 6 horas. Passaporte vinculado a este processo.",
  "💊 Renovação de receita controlada. Paciente em tratamento crítico.",
  "📞 Este solicitante passou pela recepção 4 vezes esta semana.",
  "⚠ ALERTA INTERNO: Suspeita de fraude. Analise com atenção redobrada.",
  "🙏 Reconhecimento de refúgio. Prazo legal: 48 horas.",
];
