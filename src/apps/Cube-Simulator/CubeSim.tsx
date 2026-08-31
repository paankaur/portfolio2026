import { CanvasView } from "@/apps/Cube-Simulator/components/CanvasView";
import { UIControls } from "@/apps/Cube-Simulator/components/UIControls";

export default function CubeSim() {
  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        background: "#121212",
        overflow: "hidden",
      }}
    >
      <CanvasView />
      <UIControls />
    </div>
  );
}
