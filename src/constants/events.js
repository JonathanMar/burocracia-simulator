import { PRINTER_NAME } from './printer.js';

export const RANDOM_EVENTS = [
  { id:"coffee",   emoji:"☕", title:"CAFÉ DERRAMADO!",       desc:"Alguns documentos ficaram grudados e precisam ser preparados novamente.", duration:7000,  effect:"staple" },
  { id:"boss",     emoji:"👔", title:"CHEFE APARECEU!",       desc:'"Como estamos indo? Espero que sem erros…" Ele fica te olhando por 10 segundos.', duration:10000, effect:"pressure" },
  { id:"antivirus",emoji:"🛡️",title:"ANTIVÍRUS ATIVADO!",    desc:"O antivírus decidiu escanear TUDO agora. PC travado por 8 segundos.", duration:8000,  effect:"freeze" },
  { id:"cat",      emoji:"🐱", title:"GATO NA SALA!",         desc:"O gato sentou em cima dos documentos. Nada pode ser feito.", duration:6000,  effect:"block" },
  { id:"power",    emoji:"⚡", title:"ENERGIA PISCANDO!",     desc:"A impressora reiniciou e perdeu o humor acumulado.", duration:5000,  effect:"printer_reset" },
  { id:"phone",    emoji:"📞", title:"CLIENTE LIGANDO!",      desc:'"Cadê meu documento?!" Você perde 15 pontos.', duration:7000,  effect:"penalty" },
  { id:"update",   emoji:"💻", title:"WINDOWS UPDATE!",       desc:"Agora. Sem negociação. PC travado por 10 segundos.", duration:10000, effect:"freeze" },
  { id:"intern",   emoji:"🧑💼",title:"ESTAGIÁRIO AJUDANDO!", desc:"O estagiário processou um doc aleatório. Será que foi correto?", duration:5000,  effect:"intern" },
  { id:"meeting",  emoji:"📊", title:"REUNIÃO OBRIGATÓRIA!",  desc:"Todos na sala. Agora. PC travado por 12 segundos.", duration:12000, effect:"freeze" },
  { id:"wifi",     emoji:"📶", title:"IMPRESSORA COM WI-FI!", desc:`A ${PRINTER_NAME} conectou na internet e está imprimindo receitas. Clique em REINICIAR para parar.`, duration:99999, effect:"wifi_print" },
  { id:"blackout", emoji:"🌑", title:"QUEDA DE ENERGIA!",     desc:"Tela às escuras por 6 segundos.", duration:6000,  effect:"blackout" },
  { id:"colleague",emoji:"🙋", title:"COLEGA PEDINDO AJUDA!", desc:'"Você pode assinar por mim? É só um doc…" Aceitar: +15s, mas risco de erro extra.', duration:8000,  effect:"colleague" },
];
