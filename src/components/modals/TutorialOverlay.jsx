import { TUTORIAL_STEPS } from '../../constants/story.js';

export default function TutorialOverlay({ step, onNext, onSkip }) {
  const s = TUTORIAL_STEPS[step];
  if (!s) return null;
  const isLast = step === TUTORIAL_STEPS.length - 1;
  return (
    <div style={{position:"fixed",inset:0,background:"#000000cc",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}}>
      <div style={{background:"#0c0c20",border:"2px solid #3355aa",borderRadius:10,padding:28,maxWidth:500,width:"90%",fontFamily:"'Courier New',monospace",animation:"slideIn 0.3s ease",boxShadow:"0 0 40px #3355aa33"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
          <div style={{fontSize:36}}>{s.emoji}</div>
          <div>
            <div style={{color:"#6a9eff",fontSize:10,letterSpacing:2,marginBottom:4}}>TUTORIAL — {step+1}/{TUTORIAL_STEPS.length}</div>
            <div style={{color:"#fff",fontSize:16,fontWeight:"bold"}}>{s.title}</div>
          </div>
        </div>
        <div style={{height:3,background:"#1a1a2e",borderRadius:2,marginBottom:16,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${((step+1)/TUTORIAL_STEPS.length)*100}%`,background:"#3355aa",borderRadius:2,transition:"width 0.3s"}}/>
        </div>
        <div style={{color:"#bbb",fontSize:13,lineHeight:1.9,marginBottom:20,background:"#080818",border:"1px solid #1a1a2e",borderRadius:6,padding:"12px 16px"}}>{s.content}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <button onClick={onSkip} style={{background:"transparent",border:"1px solid #333",color:"#666",padding:"7px 14px",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:11}}>Pular tutorial</button>
          <button onClick={onNext} style={{background:"#3355aa",border:"none",color:"#fff",padding:"9px 24px",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:13,fontWeight:"bold"}}>
            {isLast ? "Começar! 🚀" : "Próximo →"}
          </button>
        </div>
      </div>
    </div>
  );
}
