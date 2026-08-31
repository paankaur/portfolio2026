import type { Recording } from '@/apps/Cube-Simulator/recordings/recordingTypes';
import { RECORDING_SCHEMA_VERSION } from '@/apps/Cube-Simulator/recordings/recordingTypes';
import type { RecordingRepository } from '@/apps/Cube-Simulator/recordings/recordingRepository';

const STORAGE_KEY = 'cube-simulator.recordings.v1';

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null;

const isRecording = (value: unknown): value is Recording => {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.createdAt === 'string' &&
    value.version === RECORDING_SCHEMA_VERSION &&
    (value.source === 'user' || value.source === 'built-in') &&
    Array.isArray(value.startState) &&
    Array.isArray(value.moves) &&
    value.moves.every((move) => typeof move === 'string')
  );
};

const readRecordings = (storage: Storage): Recording[] => {
  const rawValue = storage.getItem(STORAGE_KEY);
  if (!rawValue) return [];

  try {
    const parsed: unknown = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRecording);
  } catch {
    return [];
  }
};

const writeRecordings = (storage: Storage, recordings: Recording[]): void => {
  storage.setItem(STORAGE_KEY, JSON.stringify(recordings));
};

export const createLocalStorageRecordingRepository = (
  storage: Storage = window.localStorage
): RecordingRepository => ({
  async list() {
    return readRecordings(storage);
  },

  async get(id) {
    return readRecordings(storage).find((recording) => recording.id === id);
  },

  async save(recording) {
    const recordings = readRecordings(storage);
    const existingIndex = recordings.findIndex((item) => item.id === recording.id);

    if (existingIndex === -1) {
      recordings.push(recording);
    } else {
      recordings[existingIndex] = recording;
    }

    writeRecordings(storage, recordings);
  },

  async delete(id) {
    const recordings = readRecordings(storage).filter(
      (recording) => recording.id !== id
    );
    writeRecordings(storage, recordings);
  },
});
