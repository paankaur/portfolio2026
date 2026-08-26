// src/apps/Cube-Simulator/state/useCubeStore.ts
import { create } from 'zustand';
import { generateInitialCubies, type CubieData } from '@/apps/Cube-Simulator/utils/initialCubeData';
import { MOVE_MAP, type MoveDefinition } from '@/apps/Cube-Simulator/utils/constants';

interface ActiveMove extends MoveDefinition {
  notation: string;
}

interface CubeState {
  cubies: CubieData[];
  moveQueue: string[];
  activeMove: ActiveMove | null;
  isAnimating: boolean;

  // Actions
  enqueueMove: (notation: string) => void;
  startNextMove: () => void;
  finishActiveMove: (updatedCubies: CubieData[]) => void;
}

export const useCubeStore = create<CubeState>((set, get) => ({
  cubies: generateInitialCubies(),
  moveQueue: [],
  activeMove: null,
  isAnimating: false,

  enqueueMove: (notation: string) => {
    if (!MOVE_MAP[notation]) {
      console.warn(`Invalid move notation: ${notation}`);
      return;
    }
    set((state) => ({ moveQueue: [...state.moveQueue, notation] }));
    if (!get().isAnimating) {
      get().startNextMove();
    }
  },

  startNextMove: () => {
    const { moveQueue, isAnimating } = get();
    if (moveQueue.length === 0 || isAnimating) return;

    const nextNotation = moveQueue[0];
    const moveDef = MOVE_MAP[nextNotation];

    set({
      activeMove: { ...moveDef, notation: nextNotation },
      moveQueue: moveQueue.slice(1),
      isAnimating: true,
    });
  },

  finishActiveMove: (updatedCubies: CubieData[]) => {
    set({
      cubies: updatedCubies,
      activeMove: null,
      isAnimating: false,
    });
    // Trigger next queued move if any exist
    get().startNextMove();
  },
}));