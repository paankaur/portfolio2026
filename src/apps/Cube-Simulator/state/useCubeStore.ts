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
} from '@/apps/Cube-Simulator/recordings/recordingTypes';
import { invertNotation } from '@/apps/Cube-Simulator/utils/notationUtils';

const PLAYBACK_MOVE_PAUSE_MS = 250;

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

  // Actions
  enqueueMove: (notation: string, source?: MoveSource) => void;
  startRecording: (name: string) => boolean;
  cancelRecording: () => void;
  stopRecording: () => Recording | null;
  startPlayback: (recording: Recording) => void;
  pausePlayback: () => void;
  resumePlayback: () => void;
  stepPlayback: (direction: 'previous' | 'next') => void;
  stopPlayback: () => void;
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

  startPlayback: (recording: Recording) => {
    if (get().isAnimating || recording.moves.length === 0) return;

    clearPlaybackTimer();
    set({
      playbackStatus: 'playing',
      playbackRecording: recording,
      playbackPosition: 0,
      playbackHighlightedIndex: null,
      moveQueue: [
        {
          notation: recording.moves[0],
          source: 'playback',
          playbackIndex: 0,
          playbackDelta: 1,
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
    } = get();
    if (
      playbackRecording === null ||
      playbackStatus !== 'paused' ||
      isAnimating
    ) {
      return;
    }

    const playbackIndex =
      direction === 'next'
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
      direction === 'next'
        ? playbackRecording.moves[playbackIndex]
        : invertNotation(playbackRecording.moves[playbackIndex]);
    set({
      playbackPosition:
        direction === 'previous' && playbackHighlightedIndex === 0
          ? playbackRecording.moves.length
          : playbackPosition,
      moveQueue: [
        {
          notation,
          source: 'playback',
          playbackIndex,
          playbackDelta: direction === 'next' ? 1 : -1,
        },
      ],
      playbackStatus: 'pause-requested',
    });
    get().startNextMove();
  },

  stopPlayback: () => {
    clearPlaybackTimer();
    set({
      playbackStatus: 'idle',
      playbackRecording: null,
      playbackPosition: 0,
      playbackHighlightedIndex: null,
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
                      notation: playbackRecording.moves[nextPlaybackPosition],
                      source: 'playback' as const,
                      playbackIndex: nextPlaybackPosition,
                      playbackDelta: 1,
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
      }, PLAYBACK_MOVE_PAUSE_MS);
      return;
    }

    if (!isPlaybackMove) {
      get().startNextMove();
    }
  },
  });
});