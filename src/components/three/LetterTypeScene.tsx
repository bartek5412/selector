"use client"; // Komponenty 3D muszą być renderowane po stronie klienta

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage } from "@react-three/drei";
import TextModel from "./TextModel";
import type { PathData } from "@/types/path";

interface LetterTypeSceneProps {
  letterType: string;
  pathData: PathData | null;
}

export default function LetterTypeScene({
  letterType,
}: LetterTypeSceneProps) {
  // Wyświetlamy literę z letterType lub domyślnie "A"
  const displayText = letterType || "A";

  return (
    <div className="h-full w-full">
      <Canvas
        camera={{
          position: [3, 2, 5],
          fov: 50,
        }}
        style={{ background: "#D1D5DB" }}
      >
        <Stage
          environment="city"
          intensity={0.6}
          adjustCamera={true}
          shadows={{
            type: "contact",
            opacity: 0.2,
            scale: 10,
            color: "#000000",
          }}
        >
          {/* Renderuj literę z letterType lub domyślnie "A" */}
          <TextModel
            text={displayText}
            depth={0.5}
            color="#ffffff"
            x={1}
            y={1}
            rodThickness={5}
            rodOffset={0}
            secondColor="#008e61"
            showRods={false}
          />
        </Stage>

        {/* Kontrolery pozwalające na obracanie kamery myszką */}
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}
