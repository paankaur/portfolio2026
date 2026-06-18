import { useWhackGame } from '../hooks/useWhackGame';

interface GameBoardProps {
  children: React.ReactNode;
}

export default function GameBoard({ children }: GameBoardProps) {
  const slots = Array.from({ length: 16 });
  
  // Consume our performance-optimized game loop hook
  const {
    score,
    highStreak,
    currentStreak,
    activeSlot,
    slotState,
    currentTier,
    handleSlotClick,
  } = useWhackGame();

  // Maps static index offsets onto the outer boundary ring of the 6x6 grid
  const getSlotPositionClass = (index: number) => {
    switch (index) {
      // Top Row (0-3)
      case 0: return "row-start-1 col-start-2";
      case 1: return "row-start-1 col-start-3";
      case 2: return "row-start-1 col-start-4";
      case 3: return "row-start-1 col-start-5";
      
      // Right Column (4-7)
      case 4: return "col-start-6 row-start-2";
      case 5: return "col-start-6 row-start-3";
      case 6: return "col-start-6 row-start-4";
      case 7: return "col-start-6 row-start-5";
      
      // Bottom Row (8-11)
      case 8: return "row-start-6 col-start-5";
      case 9: return "row-start-6 col-start-4";
      case 10: return "row-start-6 col-start-3";
      case 11: return "row-start-6 col-start-2";
      
      // Left Column (12-15)
      case 12: return "col-start-1 row-start-5";
      case 13: return "col-start-1 row-start-4";
      case 14: return "col-start-1 row-start-3";
      case 15: return "col-start-1 row-start-2";
      
      default: return "";
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-slate-900 p-4 select-none overflow-hidden">
      
      {/* Live Dynamic Scoreboard */}
      <div className="absolute top-6 text-white text-center">
        <p className="text-sm text-slate-400 mt-1 font-mono">
          Score: <span className="text-white font-bold">{score}</span> | 
          Streak: <span className="text-emerald-400 font-bold">{currentStreak}</span> | 
          Best: <span className="text-orange-400 font-bold">{highStreak}</span>
        </p>
      </div>

      {/* The 6x6 Grid Container */}
      <div className="grid grid-cols-6 grid-rows-6 gap-3 w-full max-w-[650px] aspect-square items-center justify-items-center mt-12">
        
        {/* THE CENTRAL BUSINESS CARD */}
        <div className="col-span-4 row-span-4 w-full h-full flex items-center justify-center z-10 p-1">
          {children}
        </div>

        {/* THE 16 INTERACTIVE GRID SLOTS */}
        {slots.map((_, index) => {
          const isActive = index === activeSlot;
          
          return (
            <div
              key={index}
              onClick={() => handleSlotClick(index)}
              className={`
                w-full aspect-square max-w-[70px] rounded-xl border flex flex-col items-center justify-center 
                text-center font-mono select-none shadow-lg transition-all text-xs font-bold
                ${getSlotPositionClass(index)}
                
                ${/* STATE 1: Inactive / Idle Hidden State */ !isActive || slotState === 'idle' 
                  ? 'border-transparent bg-transparent opacity-0 pointer-events-none scale-75' 
                  : ''}

                ${/* STATE 2: Active & Waiting for Input */ isActive && slotState === 'visible' 
                  ? `bg-slate-800 border-2 cursor-pointer scale-100 opacity-100 ${currentTier.styleClass}` 
                  : ''}

                ${/* STATE 3: Post-Click Fade Transition Out (0.75s) */ isActive && slotState === 'clicked' 
                  ? 'border-slate-700 bg-slate-950 text-emerald-400 scale-90 opacity-0 duration-[750ms] ease-out pointer-events-none' 
                  : ''}

                ${/* STATE 4: Missed Penalty Freeze (Stays solid red for 2s) */ isActive && slotState === 'missed' 
                  ? 'border-red-500/80 bg-red-950/40 text-red-400 scale-100 opacity-100 pointer-events-none duration-200 shadow-red-900/30' 
                  : ''}

                ${/* STATE 5: Post-Miss Fade Transition Out (0.75s) */ isActive && slotState === 'fading-miss' 
                  ? 'border-red-500/0 bg-red-950/0 text-red-400/0 scale-90 opacity-0 duration-[750ms] ease-out pointer-events-none' 
                  : ''}
              `}
            >
              {/* Conditional Content rendering based on current state engine value */}
              {isActive && slotState === 'visible' && (
                <span className={currentStreak === 0 ? 'animate-pulse' : ''}>
                  click me
                </span>
              )}
              
              {isActive && slotState === 'clicked' && (
                <span className="text-[10px] uppercase font-black tracking-tight">
                  number go up
                </span>
              )}

              {isActive && (slotState === 'missed' || slotState === 'fading-miss') && (
                <span className="text-[10px] uppercase font-black tracking-wider text-red-400 animate-bounce">
                  too late
                </span>
              )}
            </div>
          );
        })}

      </div>
    </div>
  );
}