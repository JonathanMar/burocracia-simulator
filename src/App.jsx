import { useState, useCallback } from 'react';
import { genLevel } from './game/docGenerator.js';
import { startMusic, stopMusic } from './audio/music.js';
import IntroScreen from './screens/IntroScreen.jsx';
import TutorialScreen from './screens/TutorialScreen.jsx';
import PlayingScreen from './screens/PlayingScreen.jsx';
import GameOverScreen from './screens/GameOverScreen.jsx';

export default function App() {
  const [phase,        setPhase]        = useState('intro');
  const [tutorialStep, setTutorialStep] = useState(0);
  const [gameData,     setGameData]     = useState(null);
  const [gameOverData, setGameOverData] = useState(null);

  const startGame = useCallback((withTutorial = true) => {
    stopMusic();
    const docs = genLevel(1);
    setGameData({ docs, level: 1 });
    setGameOverData(null);
    setTutorialStep(0);
    setTimeout(() => startMusic(), 400);
    setPhase(withTutorial ? 'tutorial' : 'playing');
  }, []);

  const handleGameOver = useCallback((result) => {
    setGameOverData(result);
    setPhase('gameover');
  }, []);

  const startEndless = useCallback(() => {
    stopMusic();
    const docs = genLevel(5); // Endless = sempre nível 5
    setGameData({ docs, level: 5 });
    setGameOverData(null);
    setTimeout(() => startMusic(), 400);
    setPhase('playing');
  }, []);

  if (phase === 'intro') {
    return <IntroScreen onStart={startGame} />;
  }

  if (phase === 'tutorial') {
    return (
      <TutorialScreen
        tutorialStep={tutorialStep}
        setTutorialStep={setTutorialStep}
        onFinish={() => setPhase('playing')}
      />
    );
  }

  if (phase === 'gameover' && gameOverData) {
    return (
      <GameOverScreen
        score={gameOverData.score}
        stats={gameOverData.stats}
        wrongDocs={gameOverData.wrongDocs}
        unlocked={gameOverData.unlocked}
        onStartGame={startGame}
        onMenu={() => { stopMusic(); setPhase('intro'); }}
        onEndless={startEndless}
      />
    );
  }

  if (phase === 'playing' && gameData) {
    return (
      <PlayingScreen
        key={`${gameData.level}-${Date.now()}`}
        initialDocs={gameData.docs}
        initialLevel={gameData.level}
        onGameOver={handleGameOver}
        onStartGame={startGame}
      />
    );
  }

  return null;
}
