import { PRINTER_NAME } from './printer.js';

export const ACHIEVEMENTS = [
  { id:"tap10",       label:"Percussionista",     desc:"Deu 10 tapinhas na impressora",       emoji:"🥁", check:s=>s.taps>=10 },
  { id:"perfect",     label:"Sem Erros!",         desc:"Completou um dia sem erros",          emoji:"✨", check:s=>s.dayErrors===0 },
  { id:"wrongfolder", label:"Arquivista Caótico", desc:"Salvou em pasta errada 3 vezes",      emoji:"🗄️", check:s=>(s.wrongFolders||0)>=3 },
  { id:"rejected5",   label:"Rigoroso",           desc:"Rejeitou 5 docs inválidos corretamente",emoji:"🔍",check:s=>(s.correctRejections||0)>=5 },
  { id:"speedrun",    label:"Turbo Burocrático",  desc:"Completou dia com +120s sobrando",    emoji:"⚡", check:s=>(s.timeBonus||0)>=120 },
  { id:"intern",      label:"Confia no Estagiário",desc:"Estagiário acertou 3 vezes",        emoji:"🧑💼",check:s=>(s.internCorrect||0)>=3 },
  { id:"greve",       label:"Negociador",         desc:`A ${PRINTER_NAME} entrou em greve`,   emoji:"✊", check:s=>(s.printerStrikes||0)>=1 },
  { id:"investigator",label:"Investigador",       desc:"Comparou 20 campos manualmente",      emoji:"🕵️", check:s=>(s.fieldsCompared||0)>=20 },
];
