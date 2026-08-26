// src/apps/Cube-Simulator/utils/rotationUtils.ts
import type { CubieData } from '@/apps/Cube-Simulator/utils/initialCubeData';
import type { Axis, MoveDefinition } from '@/apps/Cube-Simulator/utils/constants';
import type { CubieFaceConfig } from '@/apps/Cube-Simulator/components/Cubie';

/**
 * Rotates a 3D coordinate around a specified axis by angle in radians.
 */
export function rotatePosition(
  pos: [number, number, number],
  axis: Axis,
  angle: number
): [number, number, number] {
  let [x, y, z] = pos;
  const cos = Math.round(Math.cos(angle));
  const sin = Math.round(Math.sin(angle));

  switch (axis) {
    case 'x': {
      // Rotate y and z around X axis
      const newY = y * cos - z * sin;
      const newZ = y * sin + z * cos;
      return [x, newY, newZ];
    }
    case 'y': {
      // Rotate x and z around Y axis (inverting sin to match standard 3D right-hand rule)
      const newX = x * cos + z * sin;
      const newZ = -x * sin + z * cos;
      return [newX, y, newZ];
    }
    case 'z': {
      // Rotate x and y around Z axis
      const newX = x * cos - y * sin;
      const newY = x * sin + y * cos;
      return [newX, newY, z];
    }
  }
}

/**
 * Permutes the 6 face configurations array to mirror the physical rotation around an axis.
 */
export function rotateFaces(
  faces: CubieFaceConfig[],
  axis: Axis,
  angle: number
): CubieFaceConfig[] {
  const newFaces = [...faces];

  // Determine standard 90-degree step count (-1, 1, 2, or -2)
  const steps = Math.round(angle / (Math.PI / 2));
  // Normalize step count to standard positive 0..3 index shifts
  const shift = ((steps % 4) + 4) % 4;

  if (shift === 0) return newFaces;

  // Face Index Map: 0: +X, 1: -X, 2: +Y, 3: -Y, 4: +Z, 5: -Z
  let cycle: number[];

  if (axis === 'y') {
    // Rotation around Y shifts +X(0), +Z(4), -X(1), -Z(5)
    cycle = steps > 0 ? [0, 4, 1, 5] : [0, 5, 1, 4];
  } else if (axis === 'x') {
    // Rotation around X shifts +Y(2), +Z(4), -Y(3), -Z(5)
    cycle = steps > 0 ? [2, 4, 3, 5] : [2, 5, 3, 4];
  } else {
    // Rotation around Z shifts +X(0), +Y(2), -X(1), -Y(3)
    cycle = steps > 0 ? [0, 2, 1, 3] : [0, 3, 1, 2];
  }

  // Handle double turns (180 deg / 2 steps) vs single turns
  const count = Math.abs(steps);
  for (let s = 0; s < count; s++) {
    const temp = newFaces[cycle[0]];
    newFaces[cycle[0]] = newFaces[cycle[3]];
    newFaces[cycle[3]] = newFaces[cycle[2]];
    newFaces[cycle[2]] = newFaces[cycle[1]];
    newFaces[cycle[1]] = temp;
  }

  return newFaces;
}

/**
 * Applies a move to the entire cube dataset and returns a fresh updated copy.
 */
export function applyMoveToCubies(
  cubies: CubieData[],
  move: MoveDefinition
): CubieData[] {
  const { axis, layers, angle } = move;

  return cubies.map((cubie) => {
    // Check if cubie's current position lies within the active layers
    const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
    const currentLayerVal = cubie.initialPosition[axisIndex];

    if (!layers.includes(currentLayerVal)) {
      return cubie; // Not affected by this twist
    }

    const updatedPos = rotatePosition(cubie.initialPosition, axis, angle);
    const updatedFaces = rotateFaces(cubie.faces, axis, angle);

    return {
      ...cubie,
      initialPosition: updatedPos,
      faces: updatedFaces,
    };
  });
}