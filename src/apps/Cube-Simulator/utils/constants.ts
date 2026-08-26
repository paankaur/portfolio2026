// src/apps/Cube-Simulator/utils/constants.ts

export type Axis = 'x' | 'y' | 'z';

export interface MoveDefinition {
  axis: Axis;
  // Layers to include: single index [1], double [0, 1], slice [0], or all [-1, 0, 1]
  layers: number[];
  // Angle in radians: -Math.PI/2, Math.PI/2, -Math.PI, or Math.PI
  angle: number;
}

export const MOVE_MAP: Record<string, MoveDefinition> = {
  // --- Outer Single Face Moves ---
  U:  { axis: 'y', layers: [1], angle: -Math.PI / 2 },
  "U'": { axis: 'y', layers: [1], angle: Math.PI / 2 },
  U2: { axis: 'y', layers: [1], angle: -Math.PI },
  "U2'": { axis: 'y', layers: [1], angle: Math.PI },

  D:  { axis: 'y', layers: [-1], angle: Math.PI / 2 },
  "D'": { axis: 'y', layers: [-1], angle: -Math.PI / 2 },
  D2: { axis: 'y', layers: [-1], angle: Math.PI },
  "D2'": { axis: 'y', layers: [-1], angle: -Math.PI },

  R:  { axis: 'x', layers: [1], angle: -Math.PI / 2 },
  "R'": { axis: 'x', layers: [1], angle: Math.PI / 2 },
  R2: { axis: 'x', layers: [1], angle: -Math.PI },
  "R2'": { axis: 'x', layers: [1], angle: Math.PI },

  L:  { axis: 'x', layers: [-1], angle: Math.PI / 2 },
  "L'": { axis: 'x', layers: [-1], angle: -Math.PI / 2 },
  L2: { axis: 'x', layers: [-1], angle: Math.PI },
  "L2'": { axis: 'x', layers: [-1], angle: -Math.PI },

  F:  { axis: 'z', layers: [1], angle: -Math.PI / 2 },
  "F'": { axis: 'z', layers: [1], angle: Math.PI / 2 },
  F2: { axis: 'z', layers: [1], angle: -Math.PI },
  "F2'": { axis: 'z', layers: [1], angle: Math.PI },

  B:  { axis: 'z', layers: [-1], angle: Math.PI / 2 },
  "B'": { axis: 'z', layers: [-1], angle: -Math.PI / 2 },
  B2: { axis: 'z', layers: [-1], angle: Math.PI },
  "B2'": { axis: 'z', layers: [-1], angle: -Math.PI },

  // --- Slice Moves ---
  M:  { axis: 'x', layers: [0], angle: Math.PI / 2 },
  "M'": { axis: 'x', layers: [0], angle: -Math.PI / 2 },
  M2: { axis: 'x', layers: [0], angle: Math.PI },
  "M2'": { axis: 'x', layers: [0], angle: -Math.PI },

  E:  { axis: 'y', layers: [0], angle: Math.PI / 2 },
  "E'": { axis: 'y', layers: [0], angle: -Math.PI / 2 },
  E2: { axis: 'y', layers: [0], angle: Math.PI },
  "E2'": { axis: 'y', layers: [0], angle: -Math.PI },

  S:  { axis: 'z', layers: [0], angle: -Math.PI / 2 },
  "S'": { axis: 'z', layers: [0], angle: Math.PI / 2 },
  S2: { axis: 'z', layers: [0], angle: -Math.PI },
  "S2'": { axis: 'z', layers: [0], angle: Math.PI },

  // --- Wide Moves (Two Layers) ---
  u:  { axis: 'y', layers: [0, 1], angle: -Math.PI / 2 },
  "u'": { axis: 'y', layers: [0, 1], angle: Math.PI / 2 },
  u2: { axis: 'y', layers: [0, 1], angle: -Math.PI },
  "u2'": { axis: 'y', layers: [0, 1], angle: Math.PI },

  d:  { axis: 'y', layers: [-1, 0], angle: Math.PI / 2 },
  "d'": { axis: 'y', layers: [-1, 0], angle: -Math.PI / 2 },
  d2: { axis: 'y', layers: [-1, 0], angle: Math.PI },
  "d2'": { axis: 'y', layers: [-1, 0], angle: -Math.PI },

  r:  { axis: 'x', layers: [0, 1], angle: -Math.PI / 2 },
  "r'": { axis: 'x', layers: [0, 1], angle: Math.PI / 2 },
  r2: { axis: 'x', layers: [0, 1], angle: -Math.PI },
  "r2'": { axis: 'x', layers: [0, 1], angle: Math.PI },

  l:  { axis: 'x', layers: [-1, 0], angle: Math.PI / 2 },
  "l'": { axis: 'x', layers: [-1, 0], angle: -Math.PI / 2 },
  l2: { axis: 'x', layers: [-1, 0], angle: Math.PI },
  "l2'": { axis: 'x', layers: [-1, 0], angle: -Math.PI },

  f:  { axis: 'z', layers: [0, 1], angle: -Math.PI / 2 },
  "f'": { axis: 'z', layers: [0, 1], angle: Math.PI / 2 },
  f2: { axis: 'z', layers: [0, 1], angle: -Math.PI },
  "f2'": { axis: 'z', layers: [0, 1], angle: Math.PI },

  b:  { axis: 'z', layers: [-1, 0], angle: Math.PI / 2 },
  "b'": { axis: 'z', layers: [-1, 0], angle: -Math.PI / 2 },
  b2: { axis: 'z', layers: [-1, 0], angle: Math.PI },
  "b2'": { axis: 'z', layers: [-1, 0], angle: -Math.PI },

  // --- Whole Cube Rotations ---
  x:  { axis: 'x', layers: [-1, 0, 1], angle: -Math.PI / 2 },
  "x'": { axis: 'x', layers: [-1, 0, 1], angle: Math.PI / 2 },
  x2: { axis: 'x', layers: [-1, 0, 1], angle: -Math.PI },
  "x2'": { axis: 'x', layers: [-1, 0, 1], angle: Math.PI },

  y:  { axis: 'y', layers: [-1, 0, 1], angle: -Math.PI / 2 },
  "y'": { axis: 'y', layers: [-1, 0, 1], angle: Math.PI / 2 },
  y2: { axis: 'y', layers: [-1, 0, 1], angle: -Math.PI },
  "y2'": { axis: 'y', layers: [-1, 0, 1], angle: Math.PI },

  z:  { axis: 'z', layers: [-1, 0, 1], angle: -Math.PI / 2 },
  "z'": { axis: 'z', layers: [-1, 0, 1], angle: Math.PI / 2 },
  z2: { axis: 'z', layers: [-1, 0, 1], angle: -Math.PI },
  "z2'": { axis: 'z', layers: [-1, 0, 1], angle: Math.PI },
};