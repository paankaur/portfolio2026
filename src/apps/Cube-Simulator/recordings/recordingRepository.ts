import type { Recording } from '@/apps/Cube-Simulator/recordings/recordingTypes';

export interface RecordingRepository {
  list(): Promise<Recording[]>;
  get(id: string): Promise<Recording | undefined>;
  save(recording: Recording): Promise<void>;
  delete(id: string): Promise<void>;
}
