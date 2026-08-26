// src/apps/Cube-Simulator/components/CanvasView.tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Cubie } from '@/apps/Cube-Simulator/components/Cubie';
import { generateInitialCubies } from '@/apps/Cube-Simulator/utils/initialCubeData';

const cubieDataList = generateInitialCubies();

export const CanvasView = () => {
  return (
    <Canvas
      camera={{ position: [2, 3, 5], fov: 90 }}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 10]} intensity={1.2} />
      <directionalLight position={[-10, -10, -10]} intensity={0.4} />

      {/* Render all 27 Cubies */}
      <group>
        {cubieDataList.map((cubie) => (
          <Cubie
            key={cubie.id}
            position={cubie.initialPosition}
            faces={cubie.faces}
          />
        ))}
      </group>

      {/* Mouse/Touch Camera Rotation Controls */}
      <OrbitControls makeDefault enablePan={false} />
    </Canvas>
  );
};