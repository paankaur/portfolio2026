// src/apps/Cube-Simulator/utils/initialCubeData.ts
import type { CubieFaceConfig } from '@/apps/Cube-Simulator/components/Cubie';

export interface CubieData {
  id: string; // e.g. "cubie-1-1-1"
  initialPosition: [number, number, number];
  faces: CubieFaceConfig[];
}

const DEFAULT_COLORS = {
  right: '#B71234',  // Red (+X)
  left: '#D47E33',   // Orange (-X)
  top: '#FFFFFF',    // White (+Y)
  bottom: '#FFD500',   // Yellow (-Y)
  front: '#009E60', // Green (+Z)
  back: '#0051BA',  // Blue (-Z)
  inner: '#111111',  // Hidden inner core faces
};

export const generateInitialCubies = (): CubieData[] => {
  const cubies: CubieData[] = [];

  for (let x of [-1, 0, 1]) {
    for (let y of [-1, 0, 1]) {
      for (let z of [-1, 0, 1]) {
        // Assign external face color if on outer edge, else use inner core color
        const faces: CubieFaceConfig[] = [
          { color: x === 1 ? DEFAULT_COLORS.right : DEFAULT_COLORS.inner },  // +X Right
          { color: x === -1 ? DEFAULT_COLORS.left : DEFAULT_COLORS.inner },  // -X Left
          { color: y === 1 ? DEFAULT_COLORS.top : DEFAULT_COLORS.inner },   // +Y Top
          { color: y === -1 ? DEFAULT_COLORS.bottom : DEFAULT_COLORS.inner },// -Y Bottom
          { color: z === 1 ? DEFAULT_COLORS.front : DEFAULT_COLORS.inner },  // +Z Front
          { color: z === -1 ? DEFAULT_COLORS.back : DEFAULT_COLORS.inner },  // -Z Back
        ];

        cubies.push({
          id: `cubie-${x}-${y}-${z}`,
          initialPosition: [x, y, z],
          faces,
        });
      }
    }
  }

  return cubies;
};