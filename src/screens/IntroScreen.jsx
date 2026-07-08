import { PRINTER_NAME } from '../constants/printer.js';

const GLOBAL_STYLES = `@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes slideIn{from{transform:translateY(10px);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes flicker{0%,96%,100%{opacity:1}97%{opacity:0.5}}*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#1a1a2e}`;

export default function IntroScreen({ onStart }) {
  return (
    <div style={{minHeight:"100vh",background:"#030307",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Courier New',monospace",backgroundImage:"radial-gradient(ellipse at 40% 55%, #0c0818 0%, #030307 65%)"}}>
      <style>{GLOBAL_STYLES}</style>
      <div style={{textAlign:"center",maxWidth:560,padding:40}}>
        <div style={{fontSize:52,marginBottom:14}}>🖨️</div>
        <div style={{fontSize:24,fontWeight:"bold",color:"#ddd",letterSpacing:5,marginBottom:6,animation:"flicker 4s infinite"}}>BUROCRACIA SIMULATOR</div>
        <div style={{color:"#6688bb",fontSize:10,letterSpacing:3,marginBottom:28}}>DIGITALIZAÇÕES INFERNAIS LTDA. — v4.1</div>
        <div style={{background:"#080812",border:"1px solid #1a1a2e",borderRadius:7,padding:22,marginBottom:22,textAlign:"left"}}>
          <div style={{color:"#aaa",fontSize:12,lineHeight:2.1}}>
            Segunda-feira, 08h47. Sua mesa está coberta de papéis.<br/>
            A {PRINTER_NAME} te observa com <span style={{color:"#ddaa00"}}>desconfiança</span>.<br/><br/>
            <span style={{color:"#ffcc44"}}>Missão:</span> digitalizar, validar e arquivar antes do expediente acabar.<br/>
            <span style={{color:"#88aadd"}}>Clique nos campos</span> para comparar valores entre documentos.<br/>
            <span style={{color:"#77cc77"}}>Prepare</span> fisicamente cada doc antes de digitalizar.<br/>
            <span style={{color:"#aa77cc"}}>Gerencie</span> a {PRINTER_NAME} — ela tem personalidade própria.
          </div>
        </div>
        <div style={{display:"flex",gap:12,justifyContent:"center"}}>
          <button onClick={()=>onStart(true)} style={{background:"#3a5a99",border:"none",color:"#fff",padding:"12px 28px",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:13,fontWeight:"bold",letterSpacing:1}}>▶ COM TUTORIAL</button>
          <button onClick={()=>onStart(false)} style={{background:"#1a1a2e",border:"1px solid #444",color:"#aaa",padding:"12px 28px",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:13,letterSpacing:1}}>▷ SEM TUTORIAL</button>
        </div>
      </div>
    </div>
  );
}
