import { TUTORIAL_STEPS } from '../constants/story.js';
import TutorialOverlay from '../components/modals/TutorialOverlay.jsx';

const GLOBAL_STYLES = `@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes slideIn{from{transform:translateY(10px);opacity:0}to{transform:translateY(0);opacity:1}}*{box-sizing:border-box}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#1a1a2e}`;

export default function TutorialScreen({ tutorialStep, setTutorialStep, onFinish }) {
  return (
    <div style={{minHeight:"100vh",background:"#030307"}}>
      <style>{GLOBAL_STYLES}</style>
      <TutorialOverlay
        step={tutorialStep}
        onNext={() => {
          if (tutorialStep >= TUTORIAL_STEPS.length - 1) onFinish();
          else setTutorialStep(s => s + 1);
        }}
        onSkip={onFinish}
      />
    </div>
  );
}
