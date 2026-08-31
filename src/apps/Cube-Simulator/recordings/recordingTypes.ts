import type { CubieData } from '@/apps/Cube-Simulator/utils/initialCubeData';

export const RECORDING_SCHEMA_VERSION = 1 as const;
export const RECORDING_WARNING_THRESHOLD = 200;
export const MAX_RECORDING_MOVES = 1000;

export type RecordingSource = 'user' | 'built-in';

export type RecordingStatus = 'idle' | 'recording' | 'limit-reached';

export type PlaybackStatus =
  | 'idle'
  | 'playing'
  | 'pause-requested'
  | 'paused'
  | 'finished';

export type PlaybackDirection = 'forward' | 'reverse';

export type PlaybackLoopMode = 'off' | 'single' | 'bidirectional';

export interface RecordingSession {
  name: string;
  startState: CubieData[];
  moves: string[];
}

export interface Recording {
  id: string;
  name: string;
  createdAt: string;
  version: typeof RECORDING_SCHEMA_VERSION;
  source: RecordingSource;
  startState: CubieData[];
  moves: string[];
}

export const cloneCubies = (cubies: CubieData[]): CubieData[] =>
  cubies.map((cubie) => ({
    ...cubie,
    initialPosition: [...cubie.initialPosition] as [number, number, number],
    faces: cubie.faces.map((face) => ({ ...face })),
  }));
