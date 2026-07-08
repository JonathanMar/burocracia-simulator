function isValidCPF(cpf) {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  let sum1 = 0;
  for (let i = 0; i < 9; i++) sum1 += parseInt(digits[i]) * (10 - i);
  let r1 = (sum1 * 10) % 11; if (r1 >= 10) r1 = 0;
  if (r1 !== parseInt(digits[9])) return false;
  let sum2 = 0;
  for (let i = 0; i < 10; i++) sum2 += parseInt(digits[i]) * (11 - i);
  let r2 = (sum2 * 10) % 11; if (r2 >= 10) r2 = 0;
  return r2 === parseInt(digits[10]);
}

export default function FieldCompareResult({ first, second, onDismiss, onCite }) {
  if (!first || !second) return null;
  const same = first.value === second.value;
  
  // Extra logic: if they matched and it's a CPF, check the math!
  const isCpf = first.label === "CPF";
  const invalidMath = isCpf && same && !isValidCPF(first.value);
  
  // We treat a math failure as a divergence for the sake of the UI color
  const isError = !same || invalidMath;

  return (
    <div style={{
      position:"fixed",bottom:80,left:"50%",transform:"translateX(-50%)",
      background:isError?"#1a0800":"#0a1a0a",
      border:`1px solid ${isError?"#663300":"#336633"}`,
      borderRadius:8,padding:"12px 20px",zIndex:400,
      fontFamily:"'Courier New',monospace",textAlign:"center",
      boxShadow:`0 0 20px ${isError?"#66330022":"#33663322"}`,
      animation:"slideIn 0.2s ease",minWidth:340,
    }}>
      <div style={{color:"#888",fontSize:10,marginBottom:6}}>COMPARAÇÃO DE CAMPOS</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:10,alignItems:"center",marginBottom:10}}>
        <div style={{background:"#0f0f1a",border:"1px solid #333",borderRadius:4,padding:"6px 10px"}}>
          <div style={{color:"#888",fontSize:9,marginBottom:2}}>{first.side.toUpperCase()}</div>
          <div style={{color:"#ddd",fontSize:11,fontWeight:"bold"}}>{first.label}</div>
          <div style={{color:"#bbb",fontSize:12,marginTop:2,fontFamily:"Georgia,serif"}}>{first.value}</div>
        </div>
        <div style={{fontSize:20,color:!isError?"#55aa55":"#cc5500"}}>{!isError ? "=" : (invalidMath ? "⚠" : "≠")}</div>
        <div style={{background:"#0f0f1a",border:"1px solid #333",borderRadius:4,padding:"6px 10px"}}>
          <div style={{color:"#888",fontSize:9,marginBottom:2}}>{second.side.toUpperCase()}</div>
          <div style={{color:"#ddd",fontSize:11,fontWeight:"bold"}}>{second.label}</div>
          <div style={{color:"#bbb",fontSize:12,marginTop:2,fontFamily:"Georgia,serif"}}>{second.value}</div>
        </div>
      </div>
      
      <div style={{color:!isError?"#55aa55":"#ff7744",fontSize:13,fontWeight:"bold",marginBottom:4}}>
        {!isError ? "✓ Valores coincidem" : (invalidMath ? "⚠ CPF FALSO DETECTADO" : "≠ Valores DIVERGEM")}
      </div>
      <div style={{color:"#666",fontSize:10,marginBottom:12}}>
        {!isError
          ? "Estes dois campos têm o mesmo conteúdo."
          : (invalidMath ? "O texto é idêntico, mas os dígitos verificadores do CPF não fecham a conta matemática. É falso!" : "Estes campos têm conteúdo diferente. Você pode citar oficialmente como discrepância.")}
      </div>
      
      <div style={{display:"flex",gap:8,justifyContent:"center"}}>
        {isError && onCite && (
          <button
            onClick={onCite}
            style={{
              background:"#2a0a00",border:"1px solid #cc4400",color:"#ff7744",
              padding:"5px 16px",borderRadius:3,cursor:"pointer",
              fontFamily:"'Courier New',monospace",fontSize:11,fontWeight:"bold",
            }}
          >
            ⚑ {invalidMath ? "Citar CPF falso" : "Citar discrepância"}
          </button>
        )}
        <button
          onClick={onDismiss}
          style={{background:"transparent",border:"1px solid #444",color:"#777",padding:"5px 16px",borderRadius:3,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:11}}
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
