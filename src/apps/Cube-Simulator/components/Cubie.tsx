// src/apps/Cube-Simulator/components/Cubie.tsx

// Side indices in Three.js BoxGeometry:
// 0: Right (+X), 1: Left (-X), 2: Top (+Y), 3: Bottom (-Y), 4: Front (+Z), 5: Back (-Z)
export interface CubieFaceConfig {
  color: string;
  transparent?: boolean;
  opacity?: number;
}

interface CubieProps {
  position: [number, number, number];
  faces: CubieFaceConfig[]; // Array of exactly 6 face configurations
}

export const Cubie = ({ position, faces }: CubieProps) => {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.95, 0.95, 0.95]} />
      {faces.map((face, index) => (
        <meshStandardMaterial
          key={index}
          attach={`material-${index}`} // Attaches directly to the material array slot
          color={face.color}
          transparent={face.transparent ?? false}
          opacity={face.opacity ?? 1.0}
          roughness={0.2}
        />
      ))}
    </mesh>
  );
};