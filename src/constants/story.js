import { PRINTER_NAME } from './printer.js';

export const STORY_DAYS = [
  { day:1, boss:`Bom dia, novo funcionário. Digitalize os documentos, valide os dados e salve na pasta certa antes do expediente acabar. A ${PRINTER_NAME} está… razoável hoje.`, bossName:"Sr. Figueiredo", bossEmoji:"👔" },
  { day:2, boss:"Ontem foi aceitável. Hoje o volume aumenta. Alguém derramou café na impressora — ela está de péssimo humor. Ah, e sem erros.", bossName:"Sr. Figueiredo", bossEmoji:"👔" },
  { day:3, boss:"Auditoria na semana que vem. ZERO erros. O TI instalou uma 'atualização' hoje cedo. Boa sorte.", bossName:"Sr. Figueiredo", bossEmoji:"😤" },
  { day:4, boss:"Recebi reclamações. Documentos tortos, pastas erradas. Corrija isso hoje.", bossName:"Sr. Figueiredo", bossEmoji:"😤" },
  { day:5, boss:"Última chance. Nota mínima B e seu contrato é renovado. Talvez.", bossName:"Sra. Diretora", bossEmoji:"💼" },
  { day:6, boss:"A auditoria aprovou o relatório. Surpreendentemente. Não relaxe — o volume dobrou e a impressora está... filosofando sobre o sentido da vida.", bossName:"Sra. Diretora", bossEmoji:"💼" },
  { day:7, boss:"Dois novos estagiários começam hoje. Não deixe que eles vejam o caos. Processe tudo antes do almoço.", bossName:"Sra. Diretora", bossEmoji:"😰" },
  { day:8, boss:"Você ainda está aqui? Impressionante. O sistema vai migrar pro novo ERP amanhã. Hoje é o último dia no sistema antigo. Não perca nada.", bossName:"TI Departamento", bossEmoji:"🖥️" },
];

export const MEMORANDOS = [
  { day:2, text:"A partir de hoje, documentos de CURITIBA devem ser verificados com atenção redobrada ao campo Validade. Memorando 04/2026 — Dep. Jurídico." },
  { day:3, text:"Atenção: documentos com rasura no campo CPF são automaticamente INVÁLIDOS. Memorando 07/2026." },
  { day:4, text:"Novo protocolo: páginas faltando em CONTRATOS geram penalidade dobrada. Memorando 11/2026 — Auditoria Interna." },
  { day:5, text:"ALERTA: qualquer documento salvo na pasta errada será debitado do salário. Memorando 13/2026." },
  { day:6, text:"Volume dobrado. Prioridade: laudos e atestados médicos devem ser processados primeiro. Memorando 15/2026." },
  { day:7, text:"Dois estagiários em formação. Não delegar documentos com CPF duplicado a eles. Memorando 17/2026." },
  { day:8, text:"MIGRAÇÃO DE SISTEMA: backup de todos os laudos e certidões obrigatório hoje. Memorando 19/2026." },
];

export const TUTORIAL_STEPS = [
  { title:"Bem-vindo ao Trabalho", emoji:"👋", content:"Você foi contratado para digitalizar documentos governamentais. Cada documento precisa ser inspecionado, preparado fisicamente e salvo no local correto antes do fim do expediente." },
  { title:"1. Escolha um Documento", emoji:"📋", content:"Na coluna ESQUERDA ficam os documentos pendentes. Clique em qualquer um para inspecioná-lo no painel central. Documentos com ⚙ precisam de preparação física antes de digitalizar." },
  { title:"2. Prepare Fisicamente", emoji:"⚙", content:"Antes de digitalizar, verifique se o doc tem grampos (remover) ou folhas desalinhadas (alinhar). Os botões aparecem acima da área de inspeção quando necessário." },
  { title:"3. Compare os Documentos", emoji:"🔍", content:"No centro você vê o DOCUMENTO ORIGINAL (esquerda) e a FICHA CADASTRAL (direita). Compare cada campo manualmente — Nome, CPF, Cidade, Validade. NÃO há marcação automática de erros. Os erros são seus para encontrar." },
  { title:"4. Clique nos Campos para Comparar", emoji:"🖱️", content:"Clique em qualquer campo do documento ou da ficha para selecioná-lo. Em seguida, clique no campo correspondente do outro lado. O sistema dirá apenas se os valores COINCIDEM ou DIVERGEM — não dirá se é erro ou não. Você decide." },
  { title:"5. Bloco de Notas", emoji:"📝", content:"Use o bloco de notas abaixo para marcar suspeitas. Clique nos botões '+CPF suspeito', '+Cidade diverge' etc. São só para sua organização — não afetam o jogo diretamente." },
  { title:"6. Aprove ou Rejeite", emoji:"⚖", content:"APROVADO: digitaliza o doc (mesmo com erros — você arca com a penalidade). REJEITAR: descarta o doc. Rejeitar um doc válido perde 40 pts. Aprovar um inválido perde 35+ pts. Rejeitar corretamente ganha pontos." },
  { title:"7. Salve no Lugar Certo", emoji:"💾", content:"Após digitalizar, escolha a pasta correta na modal. RG → RG, CNH → CNH, Contrato → CONTRATOS, etc. Pasta errada = -28 pts. Os docs digitalizados ficam na seção 'AGUARDANDO SALVAR' na lista esquerda." },
  { title:"8. A Beatriz (Impressora)", emoji:"🖨️", content:`Coloque peso em cima dela (2–5 kg) para digitalizar direito. Quando travar, use a ação CORRETA: Atolamento→Puxar, Sem Toner→Trocar Toner, Superaquecimento→Resfriar, Papel Torto/Fantasma→Reiniciar. Tapinha é uma aposta — pode piorar.` },
  { title:"9. Vida Zero = Pane Total", emoji:"💀", content:`Se a saúde da ${PRINTER_NAME} chegar a 0%, ela para completamente e drena seus pontos até o técnico chegar. Muitos tapinhas levam à GREVE (20s parada). Cuide bem dela.` },
  { title:"Pronto!", emoji:"🚀", content:"Eventos aleatórios vão acontecer: café, chefe, antivírus, queda de energia, estagiário e mais. Alta reputação com a Beatriz = ela avisa antes de quebrar. Boa sorte!" },
];

export const DAY_RULES = {
  1: ["Valide: Nome, CPF, Cidade, Validade, Assinatura","Remova grampos antes de digitalizar","Coloque 2–5kg na impressora"],
  2: ["⚠ Atenção redobrada à Validade em docs de Curitiba","Documentos desalinhados precisam ser ajustados","A impressora está de mau humor hoje"],
  3: ["⚠ CPF com rasura = inválido automaticamente","Documentos podem ter CPF duplicado (verifique)","Atualizações do sistema podem travar o PC"],
  4: ["⚠ Páginas faltando em CONTRATOS = penalidade dobrada","Mais eventos aleatórios hoje","Carimbo ausente em contratos é motivo de rejeição"],
  5: ["⚠ Pasta errada = débito em salário","Volume máximo de documentos","A impressora começa com saúde reduzida"],
  6: ["⚠ Volume dobrado — priorize laudos e atestados","Subornos podem ocorrer — recuse para manter reputação","CPF duplicado mais frequente nesta fase"],
  7: ["⚠ Estagiários ativos — documentos críticos não delegar","Foto suspeita a partir de agora é motivo de rejeição","Verifique assinatura em TODOS os documentos"],
  8: ["⚠ DIA DE BACKUP: salve todo laudo e certidão imediatamente","Sistema legado com instabilidade — mais eventos de PC","Último dia — sem segunda chance"],
};

// Reactions shown briefly when a document is rejected (or wrongly approved)
export const REJECTION_REACTIONS = {
  // Player rejected an invalid doc correctly
  correct: [
    "Tudo bem, vou providenciar a correção...",
    "Entendido. Volto quando regularizar.",
    "Ok... obrigado pela atenção.",
    "Mas eu vim de tão longe...",
    "Vou tentar de novo amanhã.",
    "Esse CPF foi gerado pelo cartório! Eles que erraram...",
    "[A pessoa sai cabisbaixa]",
  ],
  // Player wrongly rejected a valid doc
  wrongRejection: [
    "Mas está tudo correto! Pode checar de novo?",
    "Posso falar com o supervisor?",
    "Esse documento foi validado em outra agência!",
    "Minha advogada vai ouvir sobre isso.",
    "[A pessoa exige recibo da rejeição]",
  ],
  // Doc had an urgent context and was rejected
  urgent: [
    "A cirurgia está marcada para amanhã...",
    "Minha família está esperando lá fora.",
    "Tenho um embarque em 6 horas.",
    "O paciente está em estado crítico.",
    "[A pessoa chora discretamente]",
  ],
};
