import { useState, useEffect, useRef } from 'react';

// ============================================================================
// GAME CONFIGURATION 
// ============================================================================
const CONFIG = {
  fadeTimeOut: 750,        // Time the slot takes to fade out after an action (0.75s)
  missFreezeDuration: 2000,// How long "too late" stays solid before fading (2s)
  spawnDelayInitial: 2000, // Delay after mount or when a streak is broken (2s)
  spawnDelayMin: 1000,     // Minimum random delay between hits (1s)
  spawnDelayMax: 5000,     // Maximum random delay between hits (5s)
  totalSlots: 16,          
};

const TIERS = {
  infinite: {
    duration: Infinity,
    styleClass: 'border-blue-500 text-blue-400 shadow-blue-500/10 duration-1000',
  },
  tier1: { 
    duration: 1500,
    styleClass: 'border-emerald-400 text-emerald-400 shadow-emerald-500/10 duration-500',
  },
  tier2: { 
    duration: 1000,
    styleClass: 'border-cyan-400 text-cyan-400 shadow-cyan-500/20 duration-300',
  },
  tier3: { 
    duration: 500,
    styleClass: 'border-amber-400 text-amber-400 shadow-amber-500/20 duration-200',
  },
  tier4: { 
    duration: 250,
    styleClass: 'border-orange-500 text-orange-400 shadow-orange-500/30 duration-150',
  },
  tier5: { 
    duration: 100,
    styleClass: 'border-red-500 text-red-500 shadow-red-500/50 font-black duration-75 animate-pulse',
  },
};

type SlotState = 'idle' | 'visible' | 'clicked' | 'missed' | 'fading-miss';

export function useWhackGame() {
  const [score, setScore] = useState<number>(() => {
    return Number(localStorage.getItem('whack_score') || 0);
  });
  const [highStreak, setHighStreak] = useState<number>(() => {
    return Number(localStorage.getItem('whack_high_streak') || 0);
  });
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [slotState, setSlotState] = useState<SlotState>('idle');

  const visibilityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spawnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const missTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getTierSettings = () => {
    if (currentStreak === 0) return TIERS.infinite;
    if (highStreak > 0 && currentStreak > highStreak * 2) return TIERS.tier5;
    if (currentStreak >= 10 && currentStreak > highStreak) return TIERS.tier4;
    if (currentStreak <= 5) return TIERS.tier1;
    if (currentStreak <= 10) return TIERS.tier2;
    return TIERS.tier3;
  };

  const currentTier = getTierSettings();

  const queueNextSpawn = (delay: number) => {
    if (spawnTimer.current) clearTimeout(spawnTimer.current);
    spawnTimer.current = setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * CONFIG.totalSlots);
      setActiveSlot(randomIndex);
      setSlotState('visible');
    }, delay);
  };

  // Mount setup
  useEffect(() => {
    queueNextSpawn(CONFIG.spawnDelayInitial);
    return () => {
      if (spawnTimer.current) clearTimeout(spawnTimer.current);
      if (visibilityTimer.current) clearTimeout(visibilityTimer.current);
      if (missTimer.current) clearTimeout(missTimer.current);
    };
  }, []);

  // Performance optimized LocalStorage writing on exit
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        localStorage.setItem('whack_score', score.toString());
        localStorage.setItem('whack_high_streak', highStreak.toString());
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [score, highStreak]);

  // --- Watcher 1: Monitor live visibility countdown window ---
  useEffect(() => {
    if (slotState !== 'visible' || currentTier.duration === Infinity) return;

    if (visibilityTimer.current) clearTimeout(visibilityTimer.current);

    visibilityTimer.current = setTimeout(() => {
      // Streak broken! Pivot state straight to missed
      setCurrentStreak(0);
      setSlotState('missed');
      localStorage.setItem('whack_score', score.toString());
    }, currentTier.duration);

    return () => {
      if (visibilityTimer.current) clearTimeout(visibilityTimer.current);
    };
  }, [slotState, activeSlot, currentTier.duration, score]);

// --- Watcher 2: Handles the "Too Late" animation sequence step-by-step ---
  useEffect(() => {
    // Step 1: The user missed. Wait 2 seconds, then trigger the fade.
    if (slotState === 'missed') {
      if (missTimer.current) clearTimeout(missTimer.current);
      missTimer.current = setTimeout(() => {
        setSlotState('fading-miss');
      }, CONFIG.missFreezeDuration);
    } 
    // Step 2: The fade started. Wait 0.75s, then restart the game loop.
    else if (slotState === 'fading-miss') {
      if (missTimer.current) clearTimeout(missTimer.current);
      missTimer.current = setTimeout(() => {
        setSlotState('idle');
        setActiveSlot(null);
        queueNextSpawn(CONFIG.spawnDelayInitial);
      }, CONFIG.fadeTimeOut);
    }

    // Cleanup: This safely clears timers between renders without cancelling the active step
    return () => {
      if (missTimer.current) clearTimeout(missTimer.current);
    };
  }, [slotState]);

  // Click Handler
  const handleSlotClick = (index: number) => {
    if (index !== activeSlot || slotState !== 'visible') return;

    if (visibilityTimer.current) clearTimeout(visibilityTimer.current);
    setSlotState('clicked');

    const nextScore = score + 1;
    const nextStreak = currentStreak + 1;

    setScore(nextScore);
    setCurrentStreak(nextStreak);

    if (nextStreak > highStreak) {
      setHighStreak(nextStreak);
      localStorage.setItem('whack_high_streak', nextStreak.toString());
    }

    setTimeout(() => {
      setSlotState('idle');
      setActiveSlot(null);
      const randomDelay =
        Math.floor(Math.random() * (CONFIG.spawnDelayMax - CONFIG.spawnDelayMin + 1)) +
        CONFIG.spawnDelayMin;
      
      queueNextSpawn(randomDelay);
    }, CONFIG.fadeTimeOut);
  };

  return {
    score,
    highStreak,
    currentStreak,
    activeSlot,
    slotState,
    currentTier,
    handleSlotClick,
  };
}