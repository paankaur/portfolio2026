// src/apps/Cube-Simulator/components/UIControls.tsx
import { useState } from "react";
import { useCubeStore } from "../state/useCubeStore";

type Category = "outer" | "slice" | "wide" | "rotations";

export const UIControls = () => {
  const enqueueMove = useCubeStore((state) => state.enqueueMove);
  const isAnimating = useCubeStore((state) => state.isAnimating);
  const [isPrime, setIsPrime] = useState(false); // Inverse (') toggle
  const [isDouble, setIsDouble] = useState(false); // Double turn (2) toggle
  const [activeCategory, setActiveCategory] = useState<Category>("outer");

  // Move definitions per category
  const categories: Record<Category, { label: string; moves: string[] }> = {
    outer: {
      label: "Outer Faces",
      moves: ["U", "D", "L", "R", "F", "B"],
    },
    slice: {
      label: "Middle Slices",
      moves: ["M", "E", "S"],
    },
    wide: {
      label: "Wide (2-Layer)",
      moves: ["u", "d", "l", "r", "f", "b"],
    },
    rotations: {
      label: "Cube Rotations",
      moves: ["x", "y", "z"],
    },
  };

  const handleMoveClick = (baseMove: string, isReverse = false) => {
    if (isAnimating) return;

    let notation = baseMove;
    if (isDouble) notation += "2";
    if (isPrime !== isReverse) notation += "'";
    enqueueMove(notation);
  };

  return (
    <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 rounded-xl border border-white/10 bg-[rgba(20,20,20,0.85)] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md">
      {/* Category Tabs */}
      <div className="flex gap-1.5">
        {(Object.keys(categories) as Category[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-md border-0 px-3 py-1.5 text-[13px] font-semibold transition-all duration-200 ${
              activeCategory === cat
                ? "bg-white/15 text-white"
                : "bg-transparent text-[#888] hover:bg-white/10 hover:text-white"
            }`}
          >
            {categories[cat].label}
          </button>
        ))}
      </div>

      {/* Modifier Toggles: Inverse (') & Double (2) */}
      <div className="flex gap-2">
        <button
          onClick={() => setIsPrime(!isPrime)}
          className={`rounded-md border border-white/20 px-3.5 py-1.5 text-xs font-bold text-white transition-colors duration-150 hover:brightness-110 ${
            isPrime ? "bg-[#e74c3c]" : "bg-[#333]"
          }`}
        >
          Prime (')
        </button>
        <button
          onClick={() => setIsDouble(!isDouble)}
          className={`rounded-md border border-white/20 px-3.5 py-1.5 text-xs font-bold text-white transition-colors duration-150 hover:brightness-110 ${
            isDouble ? "bg-[#3498db]" : "bg-[#333]"
          }`}
        >
          Double (2)
        </button>
      </div>

      {/* Move Buttons Grid */}
      <div className="flex justify-center gap-2">
        {categories[activeCategory].moves.map((baseMove) => {
          let displayLabel = baseMove;
          if (isDouble) displayLabel += "2";
          if (isPrime) displayLabel += "'";

          return (
            <button
              key={baseMove}
              disabled={isAnimating}
              onClick={() => handleMoveClick(baseMove)}
              onContextMenu={(event) => {
                event.preventDefault();
                handleMoveClick(baseMove, true);
              }}
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#444] bg-[#2a2a2a] text-base font-bold text-white transition-[transform,background-color] duration-150 hover:bg-[#3a3a3a] active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {displayLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
};
