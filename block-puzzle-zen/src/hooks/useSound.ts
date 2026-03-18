import { useCallback, useRef, useState, useEffect } from 'react';

// Create audio context and oscillator for simple sounds
const createSound = (
  type: 'place' | 'clear' | 'combo' | 'gameover' | 'click'
) => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const now = audioContext.currentTime;

    switch (type) {
      case 'place':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, now);
        oscillator.frequency.exponentialRampToValueAtTime(220, now + 0.1);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        oscillator.start(now);
        oscillator.stop(now + 0.1);
        break;

      case 'clear':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523, now);
        oscillator.frequency.exponentialRampToValueAtTime(784, now + 0.15);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        oscillator.start(now);
        oscillator.stop(now + 0.2);
        break;

      case 'combo':
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(523, now);
        oscillator.frequency.setValueAtTime(659, now + 0.1);
        oscillator.frequency.setValueAtTime(784, now + 0.2);
        oscillator.frequency.setValueAtTime(1047, now + 0.3);
        gainNode.gain.setValueAtTime(0.25, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        oscillator.start(now);
        oscillator.stop(now + 0.4);
        break;

      case 'gameover':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(440, now);
        oscillator.frequency.exponentialRampToValueAtTime(110, now + 0.5);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        oscillator.start(now);
        oscillator.stop(now + 0.5);
        break;

      case 'click':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, now);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        oscillator.start(now);
        oscillator.stop(now + 0.05);
        break;
    }
  } catch (e) {
    // Audio not supported
  }
};

export const useSound = () => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('blockPuzzleSound');
      return saved !== 'false';
    } catch {
      return true;
    }
  });

  const lastClearTime = useRef<number>(0);
  const comboCount = useRef<number>(0);

  useEffect(() => {
    try {
      localStorage.setItem('blockPuzzleSound', soundEnabled.toString());
    } catch {
      // Ignore
    }
  }, [soundEnabled]);

  const playPlace = useCallback(() => {
    if (!soundEnabled) return;
    createSound('place');
  }, [soundEnabled]);

  const playClear = useCallback((linesCleared: number) => {
    if (!soundEnabled) return;

    const now = Date.now();
    if (now - lastClearTime.current < 1000) {
      comboCount.current++;
    } else {
      comboCount.current = 0;
    }
    lastClearTime.current = now;

    if (comboCount.current > 0 || linesCleared > 1) {
      createSound('combo');
    } else {
      createSound('clear');
    }
  }, [soundEnabled]);

  const playGameOver = useCallback(() => {
    if (!soundEnabled) return;
    createSound('gameover');
  }, [soundEnabled]);

  const playClick = useCallback(() => {
    if (!soundEnabled) return;
    createSound('click');
  }, [soundEnabled]);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  return {
    soundEnabled,
    toggleSound,
    playPlace,
    playClear,
    playGameOver,
    playClick,
  };
};
