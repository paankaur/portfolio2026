// src/apps/Cube-Simulator/components/CubeGroup.tsx
import { useRef, useEffect } from 'react';
import type { Group } from 'three';
import { useSpring, animated } from '@react-spring/three';
import { useCubeStore } from '@/apps/Cube-Simulator/state/useCubeStore';
import { applyMoveToCubies } from '@/apps/Cube-Simulator/utils/rotationUtils';
import { Cubie } from '@/apps/Cube-Simulator/components/Cubie';
import type { CubieData } from '@/apps/Cube-Simulator/utils/initialCubeData';

export const CubeGroup = () => {
  const pivotRef = useRef<Group>(null);

  const cubies = useCubeStore((state) => state.cubies);
  const activeMove = useCubeStore((state) => state.activeMove);
  const finishActiveMove = useCubeStore((state) => state.finishActiveMove);

  // Set up rotation animation spring
  const [{ rotation }, api] = useSpring(() => ({
    rotation: [0, 0, 0] as [number, number, number],
    config: { tension: 280, friction: 30 },
  }));

  // Trigger animation when activeMove changes
  useEffect(() => {
    if (!activeMove) {
      // Reset pivot rotation instantly when no move is active
      api.set({ rotation: [0, 0, 0] });
      return;
    }

    const { axis, angle } = activeMove;
    const targetRotation: [number, number, number] = [
      axis === 'x' ? angle : 0,
      axis === 'y' ? angle : 0,
      axis === 'z' ? angle : 0,
    ];

    // Animate to target angle, then commit calculated state to store
    api.start({
      rotation: targetRotation,
      onRest: () => {
        const updatedCubies = applyMoveToCubies(cubies, activeMove);
        finishActiveMove(updatedCubies);
      },
    });
  }, [activeMove, api, cubies, finishActiveMove]);

  // Separate active (animating) cubies from static ones
  const activeCubieIds = new Set<string>();
  if (activeMove) {
    const { axis, layers } = activeMove;
    const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;

    cubies.forEach((cubie) => {
      if (layers.includes(cubie.initialPosition[axisIndex])) {
        activeCubieIds.add(cubie.id);
      }
    });
  }

  const staticCubies: CubieData[] = [];
  const rotatingCubies: CubieData[] = [];

  cubies.forEach((cubie) => {
    if (activeCubieIds.has(cubie.id)) {
      rotatingCubies.push(cubie);
    } else {
      staticCubies.push(cubie);
    }
  });

  return (
    <group>
      {/* Unaffected Cubies */}
      {staticCubies.map((cubie) => (
        <Cubie
          key={cubie.id}
          position={cubie.initialPosition}
          faces={cubie.faces}
        />
      ))}

      {/* Rotating Pivot Layer */}
      <animated.group ref={pivotRef} rotation={rotation as never}>
        {rotatingCubies.map((cubie) => (
          <Cubie
            key={cubie.id}
            position={cubie.initialPosition}
            faces={cubie.faces}
          />
        ))}
      </animated.group>
    </group>
  );
};