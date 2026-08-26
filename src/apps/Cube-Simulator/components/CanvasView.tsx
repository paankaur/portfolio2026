// src/apps/Cube-Simulator/components/CanvasView.tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { CubeGroup } from './CubeGroup';

export const CanvasView = () => {
  return (
    <Canvas
      camera={{ position: [6, 6, 6], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 10]} intensity={1.2} />
      <directionalLight position={[-10, -10, -10]} intensity={0.4} />

      <CubeGroup />

      <OrbitControls makeDefault enablePan={false} />
    </Canvas>
  );
};