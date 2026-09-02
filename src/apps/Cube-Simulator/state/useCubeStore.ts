// src/apps/Cube-Simulator/state/useCubeStore.ts
import { create } from 'zustand';
import { generateInitialCubies, type CubieData } from '@/apps/Cube-Simulator/utils/initialCubeData';
import { MOVE_MAP, type MoveDefinition } from '@/apps/Cube-Simulator/utils/constants';
import {
  cloneCubies,
  MAX_RECORDING_MOVES,
  type Recording,
  type RecordingSession,
  type RecordingStatus,
  type PlaybackStatus,
  type PlaybackDirection,
  type PlaybackLoopMode,
} from '@/apps/Cube-Simulator/recordings/recordingTypes';
import { invertNotation } from '@/apps/Cube-Simulator/utils/notationUtils';

interface ActiveMove extends MoveDefinition {
  notation: string;
  source: MoveSource;
  executionId: number;
  playbackIndex?: number;
  playbackDelta?: number;
}

export type MoveSource = 'manual' | 'playback';

interface QueuedMove {
  notation: string;
  source: MoveSource;
  playbackIndex?: number;
  playbackDelta?: number;
}

interface CubeState {
  cubies: CubieData[];
  moveQueue: QueuedMove[];
  activeMove: ActiveMove | null;
  isAnimating: boolean;
  nextExecutionId: number;
  recordingStatus: RecordingStatus;
  recordingSession: RecordingSession | null;
  playbackStatus: PlaybackStatus;
  playbackRecording: Recording | null;
  playbackPosition: number;
  playbackHighlightedIndex: number | null;
  playbackDirection: PlaybackDirection;
  playbackLoopMode: PlaybackLoopMode;
  playbackMoveDelayMs: number;
  animationDurationMs: number;

  // Actions
  enqueueMove: (notation: string, source?: MoveSource) => void;
  startRecording: (name: string) => boolean;
  cancelRecording: () => void;
  stopRecording: () => Recording | null;
  startPlayback: (recording: Recording, direction?: PlaybackDirection) => void;
  pausePlayback: () => void;
  resumePlayback: () => void;
  stepPlayback: (direction: 'previous' | 'next') => void;
  togglePlaybackLoopMode: () => void;
  stopPlayback: () => void;
  setPlaybackMoveDelayMs: (delay: number) => void;
  setAnimationDurationMs: (duration: number) => void;
  resetCube: () => void;
  startNextMove: () => void;
  finishActiveMove: (executionId: number, updatedCubies: CubieData[]) => void;
}

export const useCubeStore = create<CubeState>((set, get) => {
  let playbackTimer: ReturnType<typeof setTimeout> | null = null;

  const clearPlaybackTimer = () => {
    if (playbackTimer !== null) {
      clearTimeout(playbackTimer);
      playbackTimer = null;
    }
  };

  return ({
  cubies: generateInitialCubies(),
  moveQueue: [],
  activeMove: null,
  isAnimating: false,
  nextExecutionId: 1,
  recordingStatus: 'idle',
  recordingSession: null,
  playbackStatus: 'idle',
  playbackRecording: null,
  playbackPosition: 0,
  playbackHighlightedIndex: null,
  playbackDirection: 'forward',
  playbackLoopMode: 'off',
  playbackMoveDelayMs: 250,
  animationDurationMs: 300,

  enqueueMove: (notation: string, source: MoveSource = 'manual') => {
    if (!MOVE_MAP[notation]) {
      console.warn(`Invalid move notation: ${notation}`);
      return;
    }
    set((state) => ({
      moveQueue: [...state.moveQueue, { notation, source }],
    }));
    if (!get().isAnimating) {
      get().startNextMove();
    }
  },

  startRecording: (name: string) => {
    if (get().isAnimating || get().recordingStatus !== 'idle') return false;

    set({
      recordingStatus: 'recording',
      recordingSession: {
        name: name.trim() || 'Recording',
        startState: cloneCubies(get().cubies),
        moves: [],
      },
    });
    return true;
  },

  cancelRecording: () => {
    set({ recordingStatus: 'idle', recordingSession: null });
  },

  stopRecording: () => {
    const { recordingSession, recordingStatus } = get();
    if (!recordingSession || recordingStatus === 'idle') return null;

    const recording: Recording = {
      id: crypto.randomUUID(),
      name: recordingSession.name,
      createdAt: new Date().toISOString(),
      version: 1,
      source: 'user',
      startState: cloneCubies(recordingSession.startState),
      moves: [...recordingSession.moves],
    };

    set({ recordingStatus: 'idle', recordingSession: null });
    return recording;
  },

  startPlayback: (recording: Recording, direction: PlaybackDirection = 'forward') => {
    if (get().isAnimating || recording.moves.length === 0) return;

    clearPlaybackTimer();
    const isReverse = direction === 'reverse';
    const startIndex = isReverse ? recording.moves.length - 1 : 0;
    const moveNotation = isReverse
      ? invertNotation(recording.moves[startIndex])
      : recording.moves[startIndex];

    set({
      playbackStatus: 'playing',
      playbackRecording: recording,
      playbackPosition: startIndex,
      playbackHighlightedIndex: null,
      playbackDirection: direction,
      moveQueue: [
        {
          notation: moveNotation,
          source: 'playback',
          playbackIndex: startIndex,
          playbackDelta: isReverse ? -1 : 1,
        },
      ],
    });
    get().startNextMove();
  },

  pausePlayback: () => {
    const { isAnimating, playbackStatus } = get();
    if (playbackStatus !== 'playing') return;

    if (isAnimating) {
      set({ playbackStatus: 'pause-requested' });
      return;
    }

    clearPlaybackTimer();
    set({ playbackStatus: 'paused' });
  },

  resumePlayback: () => {
    const { playbackStatus, moveQueue } = get();
    if (playbackStatus !== 'paused') return;

    set({ playbackStatus: 'playing' });
    if (moveQueue.length > 0) {
      get().startNextMove();
    }
  },

  stepPlayback: (direction: 'previous' | 'next') => {
    const {
      playbackRecording,
      playbackPosition,
      playbackStatus,
      isAnimating,
      playbackHighlightedIndex,
      playbackDirection,
    } = get();
    if (
      playbackRecording === null ||
      playbackStatus !== 'paused' ||
      isAnimating
    ) {
      return;
    }

    // For reverse playback, flip the step direction
    const isReversePlayback = playbackDirection === 'reverse';
    const effectiveDirection = isReversePlayback
      ? direction === 'next'
        ? 'previous'
        : 'next'
      : direction;

    const playbackIndex =
      effectiveDirection === 'next'
        ? playbackPosition
        : playbackHighlightedIndex === 0
          ? playbackRecording.moves.length - 1
          : playbackPosition - 1;
    if (
      playbackIndex < 0 ||
      playbackIndex >= playbackRecording.moves.length
    ) {
      return;
    }

    const notation =
      effectiveDirection === 'next'
        ? playbackRecording.moves[playbackIndex]
        : invertNotation(playbackRecording.moves[playbackIndex]);
    set({
      playbackPosition:
        effectiveDirection === 'previous' && playbackHighlightedIndex === 0
          ? playbackRecording.moves.length
          : playbackPosition,
      moveQueue: [
        {
          notation,
          source: 'playback',
          playbackIndex,
          playbackDelta: effectiveDirection === 'next' ? 1 : -1,
        },
      ],
      playbackStatus: 'pause-requested',
    });
    get().startNextMove();
  },

  togglePlaybackLoopMode: () => {
    set((state) => {
      const modes: PlaybackLoopMode[] = ['off', 'single', 'bidirectional'];
      const currentIndex = modes.indexOf(state.playbackLoopMode);
      const nextIndex = (currentIndex + 1) % modes.length;
      return { playbackLoopMode: modes[nextIndex] };
    });
  },

  setPlaybackMoveDelayMs: (delay: number) => {
    set({ playbackMoveDelayMs: Math.max(50, Math.min(2000, delay)) });
  },

  setAnimationDurationMs: (duration: number) => {
    set({ animationDurationMs: Math.max(100, Math.min(2000, duration)) });
  },

  stopPlayback: () => {
    clearPlaybackTimer();
    set({
      playbackStatus: 'idle',
      playbackRecording: null,
      playbackPosition: 0,
      playbackHighlightedIndex: null,
      playbackDirection: 'forward',
      moveQueue: [],
    });
  },

  resetCube: () => {
    clearPlaybackTimer();
    set((state) => ({
      cubies: generateInitialCubies(),
      moveQueue: [],
      activeMove: null,
      isAnimating: false,
      nextExecutionId: state.nextExecutionId + 1,
    }));
  },

  startNextMove: () => {
    const { moveQueue, isAnimating, nextExecutionId } = get();
    if (moveQueue.length === 0 || isAnimating) return;

    const nextMove = moveQueue[0];
    const { notation: nextNotation, source } = nextMove;
    const moveDef = MOVE_MAP[nextNotation];

    set({
      activeMove: {
        ...moveDef,
        notation: nextNotation,
        source,
        executionId: nextExecutionId,
        playbackIndex: nextMove.playbackIndex,
        playbackDelta: nextMove.playbackDelta,
      },
      moveQueue: moveQueue.slice(1),
      isAnimating: true,
      ...(source === 'playback'
        ? {
            playbackHighlightedIndex:
              nextMove.playbackIndex ?? get().playbackPosition,
          }
        : {}),
      nextExecutionId: nextExecutionId + 1,
    });
  },

  finishActiveMove: (executionId: number, updatedCubies: CubieData[]) => {
    if (get().activeMove?.executionId !== executionId) return;

    const {
      activeMove,
      recordingSession,
      recordingStatus,
      playbackRecording,
      playbackStatus,
      playbackPosition,
    } = get();
    const shouldRecordMove =
      activeMove !== null &&
      recordingSession !== null &&
      recordingStatus === 'recording';
    const recordedMoves = shouldRecordMove
      ? [...recordingSession.moves, activeMove.notation]
      : recordingSession?.moves;
    const reachedLimit = recordedMoves?.length === MAX_RECORDING_MOVES;
    const isPlaybackMove = activeMove?.source === 'playback';
    const nextPlaybackPosition = isPlaybackMove
      ? playbackPosition + (activeMove.playbackDelta ?? 1)
      : playbackPosition;
    const hasNextPlaybackMove =
      isPlaybackMove &&
      playbackRecording !== null &&
      nextPlaybackPosition >= 0 &&
      nextPlaybackPosition < playbackRecording.moves.length;
    const shouldPauseAfterMove = playbackStatus === 'pause-requested';

    const playbackDelta = activeMove?.playbackDelta ?? 1;
    const nextMoveNotation = hasNextPlaybackMove
      ? playbackRecording?.moves[nextPlaybackPosition]
      : '';
    const nextMoveFormatted =
      hasNextPlaybackMove && playbackDelta === -1
        ? invertNotation(nextMoveNotation ?? '')
        : nextMoveNotation;

    set({
      cubies: updatedCubies,
      activeMove: null,
      isAnimating: false,
      ...(isPlaybackMove
        ? {
            playbackPosition: nextPlaybackPosition,
            playbackHighlightedIndex: activeMove.playbackIndex ?? null,
            playbackStatus: shouldPauseAfterMove
              ? 'paused'
              : hasNextPlaybackMove
                ? 'playing'
                : 'finished',
            moveQueue:
              hasNextPlaybackMove && playbackRecording
                ? [
                    {
                      notation: nextMoveFormatted ?? '',
                      source: 'playback' as const,
                      playbackIndex: nextPlaybackPosition,
                      playbackDelta: playbackDelta,
                    },
                  ]
                : [],
          }
        : {}),
      ...(shouldRecordMove && recordedMoves
        ? {
            recordingSession: { ...recordingSession, moves: recordedMoves },
            recordingStatus: reachedLimit ? 'limit-reached' : 'recording',
          }
        : {}),
    });

    // Handle loop mode: when playback finishes, either restart or reverse direction
    if (
      isPlaybackMove &&
      !hasNextPlaybackMove &&
      !shouldPauseAfterMove &&
      playbackStatus === 'playing'
    ) {
      const { playbackLoopMode, playbackRecording: recording, playbackDirection: currentDirection } = get();
      if (playbackLoopMode !== 'off' && recording) {
        const nextDirection = playbackLoopMode === 'bidirectional' ? (currentDirection === 'forward' ? 'reverse' : 'forward') : currentDirection;
        clearPlaybackTimer();
        playbackTimer = setTimeout(() => {
          playbackTimer = null;
          if (get().playbackLoopMode !== 'off' && get().playbackStatus === 'finished') {
            get().startPlayback(recording, nextDirection);
          }
        }, get().playbackMoveDelayMs);
        return;
      }
    }

    if (
      isPlaybackMove &&
      hasNextPlaybackMove &&
      !shouldPauseAfterMove &&
      playbackStatus === 'playing'
    ) {
      clearPlaybackTimer();
      playbackTimer = setTimeout(() => {
        playbackTimer = null;
        if (get().playbackStatus === 'playing') {
          get().startNextMove();
        }
      }, get().playbackMoveDelayMs);
      return;
    }

    if (!isPlaybackMove) {
      get().startNextMove();
    }
  },
  });
});