// src/apps/Cube-Simulator/components/UIControls.tsx
import { useEffect, useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Square,
  Repeat,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useCubeStore } from "../state/useCubeStore";
import { BUILT_IN_RECORDINGS } from "@/apps/Cube-Simulator/recordings/builtInRecordings";
import { createLocalStorageRecordingRepository } from "@/apps/Cube-Simulator/recordings/localStorageRecordingRepository";
import {
  MAX_RECORDING_MOVES,
  RECORDING_WARNING_THRESHOLD,
  type Recording,
} from "@/apps/Cube-Simulator/recordings/recordingTypes";

type Category = "outer" | "slice" | "wide" | "rotations" | "recordings";

const recordingRepository = createLocalStorageRecordingRepository();

export const UIControls = () => {
  const enqueueMove = useCubeStore((state) => state.enqueueMove);
  const resetCube = useCubeStore((state) => state.resetCube);
  const isAnimating = useCubeStore((state) => state.isAnimating);
  const recordingStatus = useCubeStore((state) => state.recordingStatus);
  const recordingSession = useCubeStore((state) => state.recordingSession);
  const startRecording = useCubeStore((state) => state.startRecording);
  const cancelRecording = useCubeStore((state) => state.cancelRecording);
  const stopRecording = useCubeStore((state) => state.stopRecording);
  const startPlayback = useCubeStore((state) => state.startPlayback);
  const pausePlayback = useCubeStore((state) => state.pausePlayback);
  const resumePlayback = useCubeStore((state) => state.resumePlayback);
  const stepPlayback = useCubeStore((state) => state.stepPlayback);
  const stopPlayback = useCubeStore((state) => state.stopPlayback);
  const playbackStatus = useCubeStore((state) => state.playbackStatus);
  const playbackRecording = useCubeStore((state) => state.playbackRecording);
  const playbackHighlightedIndex = useCubeStore(
    (state) => state.playbackHighlightedIndex,
  );
  const playbackLoopMode = useCubeStore((state) => state.playbackLoopMode);
  const togglePlaybackLoopMode = useCubeStore(
    (state) => state.togglePlaybackLoopMode,
  );
  const playbackMoveDelayMs = useCubeStore((state) => state.playbackMoveDelayMs);
  const setPlaybackMoveDelayMs = useCubeStore(
    (state) => state.setPlaybackMoveDelayMs,
  );
  const animationDurationMs = useCubeStore((state) => state.animationDurationMs);
  const setAnimationDurationMs = useCubeStore(
    (state) => state.setAnimationDurationMs,
  );
  const [isPrime, setIsPrime] = useState(false); // Inverse (') toggle
  const [isDouble, setIsDouble] = useState(false); // Double turn (2) toggle
  const [activeCategory, setActiveCategory] = useState<Category>("outer");
  const [isResetPending, setIsResetPending] = useState(false);
  const [recordingName, setRecordingName] = useState("Recording nr. 1");
  const [savedRecordingCount, setSavedRecordingCount] = useState(0);
  const [recordingMessage, setRecordingMessage] = useState("");
  const [savedRecordings, setSavedRecordings] = useState<Recording[]>([]);
  const [isTimingExpanded, setIsTimingExpanded] = useState(false);

  useEffect(() => {
    recordingRepository.list().then((recordings) => {
      setSavedRecordings(
        recordings.filter((recording) => recording.source === "user"),
      );
      const userRecordingCount = recordings.filter(
        (recording) => recording.source === "user",
      ).length;
      setSavedRecordingCount(userRecordingCount);
      setRecordingName(`Recording nr. ${userRecordingCount + 1}`);
    });
  }, []);

  useEffect(() => {
    if (!isResetPending) return;

    const timeoutId = window.setTimeout(() => {
      setIsResetPending(false);
    }, 1500);

    return () => window.clearTimeout(timeoutId);
  }, [isResetPending]);

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
    recordings: {
      label: "Recordings",
      moves: [],
    },
  };

  const handleMoveClick = (baseMove: string, isReverse = false) => {
    if (isAnimating) return;

    let notation = baseMove;
    if (isDouble) notation += "2";
    if (isPrime !== isReverse) notation += "'";
    enqueueMove(notation);
  };

  const handleResetClick = () => {
    if (isAnimating) return;
    if (isResetPending) {
      resetCube();
      setIsResetPending(false);
      return;
    }
    setIsResetPending(true);
  };

  const handleStartRecording = () => {
    if (startRecording(recordingName)) {
      setActiveCategory("outer");
      setRecordingMessage("");
    }
  };

  const handleCancelRecording = () => {
    cancelRecording();
    setRecordingMessage("");
  };

  const handleStopRecording = async () => {
    const recording = stopRecording();
    if (!recording) return;

    try {
      await recordingRepository.save(recording);
      setSavedRecordings((recordings) => [...recordings, recording]);
      const nextCount = savedRecordingCount + 1;
      setSavedRecordingCount(nextCount);
      setRecordingName(`Recording nr. ${nextCount + 1}`);
      setRecordingMessage("Recording saved");
    } catch {
      setRecordingMessage("Recording could not be saved");
    }
  };

  const handleDeleteRecording = async (id: string) => {
    await recordingRepository.delete(id);
    setSavedRecordings((recordings) =>
      recordings.filter((recording) => recording.id !== id),
    );
  };

  const handlePlayRecording = (recording: Recording, direction: 'forward' | 'reverse' = 'forward') => {
    startPlayback(recording, direction);
  };

  const availableRecordings = [...BUILT_IN_RECORDINGS, ...savedRecordings];

  return (
    <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 rounded-xl border border-white/10 bg-[rgba(20,20,20,0.85)] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md">
      {(activeCategory === "recordings" || recordingStatus !== "idle") && (
        <>
          {/* Recording actions */}
          <div className="flex flex-wrap items-center justify-center gap-2">
        <input
          type="text"
          value={recordingSession?.name ?? recordingName}
          onChange={(event) => setRecordingName(event.target.value)}
          disabled={recordingStatus !== "idle"}
          aria-label="Recording name"
          className="w-40 rounded-md border border-white/20 bg-[#252525] px-3 py-1.5 text-xs text-white outline-none placeholder:text-[#888] focus:border-white/50 disabled:opacity-60"
        />
        <button
          type="button"
          disabled={isAnimating || recordingStatus !== "idle"}
          onClick={handleStartRecording}
          className="rounded-md border border-[#2ecc71] bg-[#176b3a] px-4 py-1.5 text-xs font-bold text-white transition-colors duration-150 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {recordingStatus === "idle" ? "Start recording" : "Recording..."}
        </button>
        <button
          type="button"
          disabled={
            isAnimating ||
            recordingStatus === "idle" ||
            recordingSession?.moves.length === 0
          }
          onClick={handleStopRecording}
          className="rounded-md border border-[#e67e22] bg-[#7a4214] px-4 py-1.5 text-xs font-bold text-white transition-colors duration-150 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Stop & save
        </button>
        {recordingStatus !== "idle" && recordingSession?.moves.length === 0 && (
          <button
            type="button"
            disabled={isAnimating}
            onClick={handleCancelRecording}
            className="rounded-md border border-white/20 bg-[#333] px-4 py-1.5 text-xs font-bold text-white transition-colors duration-150 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        {recordingStatus !== "idle" && recordingSession && (
          <span className="text-xs text-[#bbb]">
            {recordingSession.moves.length}/{MAX_RECORDING_MOVES}
            {recordingSession.moves.length >= RECORDING_WARNING_THRESHOLD &&
              recordingStatus === "recording" && " nearing limit"}
          </span>
        )}
        {recordingMessage && (
          <span className="text-xs text-[#8fceaa]">{recordingMessage}</span>
        )}
          </div>
        </>
      )}

      <div className="flex justify-center">
        <button
          type="button"
          disabled={isAnimating}
          onClick={handleResetClick}
          className={`rounded-md border px-4 py-1.5 text-xs font-bold text-white transition-colors duration-150 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 ${
            isResetPending
              ? "border-[#e74c3c] bg-[#e74c3c]"
              : "border-white/20 bg-[#333]"
          }`}
        >
          {isResetPending ? "Confirm reset" : "Reset cube"}
        </button>
      </div>

      {/* Timing Controls - Collapsible */}
      <div className="w-full min-w-72 rounded-md border border-white/10 bg-[#1a1a1a]">
        <button
          type="button"
          onClick={() => setIsTimingExpanded(!isTimingExpanded)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-white hover:bg-white/5 transition-colors"
        >
          <span>Timing</span>
          {isTimingExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
        
        {isTimingExpanded && (
          <div className="border-t border-white/10 px-3 py-3 space-y-3">
            <div>
              <div className="mb-1 flex items-center justify-between text-[11px] text-[#bbb]">
                <label htmlFor="animation-duration">Animation Duration</label>
                <span className="text-white">{animationDurationMs}ms</span>
              </div>
              <input
                id="animation-duration"
                type="range"
                min="100"
                max="2000"
                step="50"
                value={animationDurationMs}
                onChange={(e) => setAnimationDurationMs(Number(e.target.value))}
                className="w-full cursor-pointer accent-[#4b8ac4]"
              />
              <div className="mt-0.5 text-[10px] text-[#666]">Single move animation time</div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-[11px] text-[#bbb]">
                <label htmlFor="move-delay">Move Delay</label>
                <span className="text-white">{playbackMoveDelayMs}ms</span>
              </div>
              <input
                id="move-delay"
                type="range"
                min="50"
                max="2000"
                step="25"
                value={playbackMoveDelayMs}
                onChange={(e) => setPlaybackMoveDelayMs(Number(e.target.value))}
                className="w-full cursor-pointer accent-[#4b8ac4]"
              />
              <div className="mt-0.5 text-[10px] text-[#666]">Delay between playback moves</div>
            </div>
          </div>
        )}
      </div>

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
            {cat === "recordings" ? "Recordings" : categories[cat].label}
          </button>
        ))}
      </div>

      {activeCategory === "recordings" ? (
        recordingStatus === "idle" ? (
          <div className="flex max-h-48 w-full min-w-72 flex-col gap-2 overflow-y-auto">
            {availableRecordings.map((recording) => (
              <div
                key={recording.id}
                className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-[#252525] px-3 py-2 text-left"
              >
                <div className="min-w-0">
                  <div className="truncate text-xs font-bold text-white">
                    {recording.name}
                  </div>
                  <div className="text-[11px] text-[#999]">
                    {recording.moves.length} moves · {recording.source}
                  </div>
                  <div className="truncate text-[11px] text-[#bbb]">
                    {recording.moves.map((move, index) => (
                      <span
                        key={`${recording.id}-${index}`}
                        className={
                          playbackRecording?.id === recording.id &&
                          playbackHighlightedIndex === index
                            ? "rounded bg-[#2ecc71] px-1 text-black"
                            : ""
                        }
                      >
                        {index > 0 && " "}
                        {move}
                      </span>
                    ))}
                  </div>
                  <div className="mt-1 flex gap-2">
                    <button
                      type="button"
                      disabled={isAnimating || playbackStatus === "playing"}
                      onClick={() => handlePlayRecording(recording, 'forward')}
                      className="rounded border border-[#4b8ac4] bg-[#23496b] p-1.5 text-white transition-opacity hover:brightness-110 disabled:opacity-40"
                      title="Play forward"
                    >
                      <Play size={16} />
                    </button>
                    <button
                      type="button"
                      disabled={isAnimating || playbackStatus === "playing"}
                      onClick={() => handlePlayRecording(recording, 'reverse')}
                      className="rounded border border-[#4b8ac4] bg-[#23496b] p-1.5 text-white transition-opacity hover:brightness-110 disabled:opacity-40"
                      title="Play reverse"
                    >
                      <SkipBack size={16} />
                    </button>
                  </div>
                  {playbackRecording?.id === recording.id && (
                      <>
                        <div className="mt-2 flex gap-2">
                          {/* Previous (Step Back) */}
                          <button
                            type="button"
                            disabled={
                              playbackStatus !== "paused" || isAnimating
                            }
                            onClick={() => stepPlayback("previous")}
                            className="rounded border border-[#777] bg-[#3b3b3b] p-1.5 text-white transition-opacity hover:brightness-110 disabled:opacity-40"
                            title="Previous step"
                          >
                            <SkipBack size={16} />
                          </button>

                          {/* Play/Pause */}
                          <button
                            type="button"
                            disabled={playbackStatus === "pause-requested"}
                            onClick={
                              playbackStatus === "paused"
                                ? resumePlayback
                                : pausePlayback
                            }
                            className="rounded border border-[#a77b31] bg-[#634819] p-1.5 text-white transition-opacity hover:brightness-110 disabled:opacity-40"
                            title={
                              playbackStatus === "paused"
                                ? "Resume playback"
                                : "Pause playback"
                            }
                          >
                            {playbackStatus === "paused" ? (
                              <Play size={16} />
                            ) : (
                              <Pause size={16} />
                            )}
                          </button>

                          {/* Next (Step Forward) */}
                          <button
                            type="button"
                            disabled={
                              playbackStatus !== "paused" || isAnimating
                            }
                            onClick={() => stepPlayback("next")}
                            className="rounded border border-[#777] bg-[#3b3b3b] p-1.5 text-white transition-opacity hover:brightness-110 disabled:opacity-40"
                            title="Next step"
                          >
                            <SkipForward size={16} />
                          </button>

                          {/* Stop */}
                          <button
                            type="button"
                            disabled={playbackStatus === "finished"}
                            onClick={stopPlayback}
                            className="rounded border border-[#7a3030] bg-[#4a2020] p-1.5 text-white transition-opacity hover:brightness-110 disabled:opacity-40"
                            title="Stop playback"
                          >
                            <Square size={16} />
                          </button>

                          {/* Loop */}
                          <button
                            type="button"
                            disabled={playbackStatus === "idle" || playbackStatus === "finished"}
                            onClick={togglePlaybackLoopMode}
                            className={`rounded border p-1.5 transition-opacity ${
                              playbackLoopMode === "bidirectional"
                                ? "border-[#27ae60] bg-[#1e5631] text-white hover:brightness-110"
                                : playbackLoopMode === "single"
                                  ? "border-[#e67e22] bg-[#7a4214] text-white hover:brightness-110"
                                  : "border-[#666] bg-[#333] text-white hover:brightness-110"
                            } disabled:opacity-40`}
                            title={
                              playbackLoopMode === "off"
                                ? "Loop off (click: single direction)"
                                : playbackLoopMode === "single"
                                  ? "Single direction loop (click: bidirectional)"
                                  : "Bidirectional loop (click: loop off)"
                            }
                          >
                            <Repeat size={16} />
                          </button>
                        </div>
                      </>
                    )}
                </div>
                {recording.source === "user" && (
                  <button
                    type="button"
                    onClick={() => handleDeleteRecording(recording.id)}
                    className="shrink-0 rounded border border-[#7a3030] bg-[#4a2020] px-2 py-1 text-[11px] text-white hover:brightness-110"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : null
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};
