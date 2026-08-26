// src/apps/Cube-Simulator/components/UIControls.tsx
import { useState, type CSSProperties } from 'react';
import { useCubeStore } from '../state/useCubeStore';


type Category = 'outer' | 'slice' | 'wide' | 'rotations';

export const UIControls = () => {
  const enqueueMove = useCubeStore((state) => state.enqueueMove);
  const [isPrime, setIsPrime] = useState(false); // Inverse (') toggle
  const [isDouble, setIsDouble] = useState(false); // Double turn (2) toggle
  const [activeCategory, setActiveCategory] = useState<Category>('outer');

  // Move definitions per category
  const categories: Record<Category, { label: string; moves: string[] }> = {
    outer: {
      label: 'Outer Faces',
      moves: ['U', 'D', 'L', 'R', 'F', 'B'],
    },
    slice: {
      label: 'Middle Slices',
      moves: ['M', 'E', 'S'],
    },
    wide: {
      label: 'Wide (2-Layer)',
      moves: ['u', 'd', 'l', 'r', 'f', 'b'],
    },
    rotations: {
      label: 'Cube Rotations',
      moves: ['x', 'y', 'z'],
    },
  };

  const handleMoveClick = (baseMove: string) => {
    let notation = baseMove;
    if (isDouble) notation += '2';
    if (isPrime) notation += "'";
    enqueueMove(notation);
  };

  return (
    <div style={containerStyle}>
      {/* Category Tabs */}
      <div style={tabContainerStyle}>
        {(Object.keys(categories) as Category[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              ...tabButtonStyle,
              ...(activeCategory === cat ? activeTabStyle : {}),
            }}
          >
            {categories[cat].label}
          </button>
        ))}
      </div>

      {/* Modifier Toggles: Inverse (') & Double (2) */}
      <div style={modifierContainerStyle}>
        <button
          onClick={() => setIsPrime(!isPrime)}
          style={{
            ...modifierButtonStyle,
            backgroundColor: isPrime ? '#e74c3c' : '#333',
          }}
        >
          Prime (')
        </button>
        <button
          onClick={() => setIsDouble(!isDouble)}
          style={{
            ...modifierButtonStyle,
            backgroundColor: isDouble ? '#3498db' : '#333',
          }}
        >
          Double (2)
        </button>
      </div>

      {/* Move Buttons Grid */}
      <div style={gridStyle}>
        {categories[activeCategory].moves.map((baseMove) => {
          let displayLabel = baseMove;
          if (isDouble) displayLabel += '2';
          if (isPrime) displayLabel += "'";

          return (
            <button
              key={baseMove}
              onClick={() => handleMoveClick(baseMove)}
              style={moveButtonStyle}
            >
              {displayLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Inline CSS Styles
const containerStyle: CSSProperties = {
  position: 'absolute',
  bottom: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: 'rgba(20, 20, 20, 0.85)',
  backdropFilter: 'blur(8px)',
  padding: '16px',
  borderRadius: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  alignItems: 'center',
  zIndex: 10,
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
};

const tabContainerStyle: CSSProperties = {
  display: 'flex',
  gap: '6px',
};

const tabButtonStyle: CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#888',
  padding: '6px 12px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 600,
  borderRadius: '6px',
  transition: 'all 0.2s ease',
};

const activeTabStyle: CSSProperties = {
  backgroundColor: 'rgba(255, 255, 255, 0.15)',
  color: '#fff',
};

const modifierContainerStyle: CSSProperties = {
  display: 'flex',
  gap: '8px',
};

const modifierButtonStyle: CSSProperties = {
  border: '1px solid rgba(255, 255, 255, 0.2)',
  color: '#fff',
  padding: '6px 14px',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'background-color 0.15s ease',
};

const gridStyle: CSSProperties = {
  display: 'flex',
  gap: '8px',
  justifyContent: 'center',
};

const moveButtonStyle: CSSProperties = {
  width: '44px',
  height: '44px',
  backgroundColor: '#2a2a2a',
  border: '1px solid #444',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'transform 0.05s ease, background-color 0.15s ease',
};