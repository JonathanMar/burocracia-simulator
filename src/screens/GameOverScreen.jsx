import GameOverReviewWrapper from '../components/modals/GameOverReview.jsx';
import { stopMusic } from '../audio/music.js';

const GLOBAL_STYLES = `@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes slideIn{from{transform:translateY(8px);opacity:0}to{transform:translateY(0);opacity:1}}*{box-sizing:border-box}`;

export default function GameOverScreen({ score, stats, wrongDocs, unlocked, onStartGame, onMenu, onEndless }) {
  const grade = score>800?"S":score>500?"A":score>300?"B":score>150?"C":"D";
  const gc = {S:"#ffcc00",A:"#44bb44",B:"#4488ff",C:"#dd8800",D:"#dd4444"}[grade];
  return (
    <div style={{minHeight:"100vh",background:"#030307",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Courier New',monospace"}}>
      <style>{GLOBAL_STYLES}</style>
      <GameOverReviewWrapper
        wrongDocs={wrongDocs}
        grade={grade}
        gc={gc}
        score={score}
        stats={stats}
        unlocked={unlocked}
        onStartGame={onStartGame}
        onMenu={() => { stopMusic(); onMenu(); }}
        onEndless={onEndless}
      />
    </div>
  );
}
