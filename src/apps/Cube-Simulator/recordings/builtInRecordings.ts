import { generateInitialCubies } from '@/apps/Cube-Simulator/utils/initialCubeData';
import {
  RECORDING_SCHEMA_VERSION,
  type Recording,
} from '@/apps/Cube-Simulator/recordings/recordingTypes';

export const BUILT_IN_RECORDINGS: Recording[] = [
  {
    id: 'built-in-sexy-move',
    name: 'the Sexy Move',
    createdAt: '2026-08-28T00:00:00.000Z',
    version: RECORDING_SCHEMA_VERSION,
    source: 'built-in',
    startState: generateInitialCubies(),
    moves: ['R', 'U', "R'", "U'"],
  },
];
