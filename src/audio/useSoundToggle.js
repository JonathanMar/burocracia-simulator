import { useState, useCallback } from 'react';
import { setGlobalMuted } from './audioContext.js';
import { startMusic, stopMusic } from './music.js';

export function useSoundToggle() {
  const [muted, setMuted] = useState(false);
  const toggle = useCallback(() => {
    setMuted(m => {
      const next = !m;
      setGlobalMuted(next);
      if (next) stopMusic();
      else startMusic();
      return next;
    });
  }, []);
  return [muted, toggle];
}
