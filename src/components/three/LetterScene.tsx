"use client"; // Komponenty 3D muszą być renderowane po stronie klienta

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stage } from "@react-three/drei";
import TextModel from "./TextModel";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";
import SvgModel from "./SvgModel";
import PathModel from "./PathModel";
import { Card } from "@/components/ui/card";

// Komponent do wyświetlania pozycji kamery
function CameraPosition() {
  const { camera } = useThree();

  useFrame(() => {
    console.log("Camera position:", {
      x: camera.position.x.toFixed(2),
      y: camera.position.y.toFixed(2),
      z: camera.position.z.toFixed(2),
    });
  });

  return null;
}

// Definiujemy typy dla propsów
interface SceneProps {
  text: string;
  length: number;
  depth: number;
  color: string;
  x: number;
  y: number;
  rodThickness: number;
  rodOffset: number;
  secondColor: string;
  showRods: boolean;
  showGlow: boolean;
  svgData: string | null;
  showDark: boolean;
  tapeDepth: number;
  totalPrice: number;
  pathData: any | null;
}

export default function Scene3D({
  text,
  length,
  depth,
  color,
  x,
  y,
  rodThickness,
  rodOffset,
  secondColor,
  showRods,
  showGlow,
  svgData,
  showDark,
  tapeDepth,
  totalPrice,
  pathData,
}: SceneProps) {
  return (
    <div className="relative w-full h-full">
      <Canvas
        dpr={[1, 2]} // Pixel ratio dla lepszej jakości na ekranach HiDPI
        camera={{ fov: 45, position: [3.3, 1.75, 5.5] }} // Ustawienia kamery
        style={{ width: "100%", height: "100%" }}
      >
        {showDark && <color attach="background" args={["#101010"]} />}
        {/* Stage to pomocnik, który centruje model i dodaje domyślne oświetlenie */}
        <Stage
          key={showGlow.toString()}
          environment="city"
          intensity={0.6}
          shadows={{
            type: "contact", // Domyślny typ cienia
            opacity: 0.3, // Cień będzie w 50% przezroczysty
            blur: 1.5, // Krawędzie cienia będą bardziej rozmyte
            color: showDark ? "white" : "black", // Możesz zmienić kolor, np. na '#333333'
            scale: 25,
          }}
        >
          {pathData ? (
            // Jeśli mamy dane ścieżki z PDF, renderuj model ścieżki
            <PathModel
              pathData={pathData}
              text={text}
              depth={depth}
              color={color}
              secondColor={secondColor}
              x={x}
              y={y}
              showRods={showRods}
            />
          ) : svgData ? (
            // Jeśli mamy dane SVG, renderuj model SVG
            <SvgModel
              svgData={svgData}
              depth={depth}
              color={color}
              secondColor={secondColor}
              x={x}
              y={y}
              showRods={showRods}
            />
          ) : (
            // W przeciwnym razie, renderuj standardowy model z tekstu
            <TextModel
              text={text}
              depth={depth}
              color={color}
              x={x}
              y={y}
              rodThickness={rodThickness}
              rodOffset={rodOffset}
              secondColor={secondColor}
              showRods={showRods}
            />
          )}
        </Stage>

        {/* Kontrolery pozwalające na obracanie kamery myszką */}
        <OrbitControls makeDefault />
        {showGlow && (
          <EffectComposer>
            <Bloom
              kernelSize={KernelSize.LARGE}
              luminanceSmoothing={0.5}
              intensity={0.3}
              luminanceThreshold={0.5}
              mipmapBlur={false} // <-- Lepsza jakość rozmycia
            />
          </EffectComposer>
        )}

        {/* Komponent wyświetlający pozycję kamery */}
      </Canvas>

      {/* Card w lewym dolnym narożniku */}
      <Card className="absolute bottom-6 left-6 p-4 bg-white/95 backdrop-blur-sm border-[#D1D5DB] shadow-lg">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[#111827]">Informacje</h3>
          <div className="text-xs text-[#111827]/70 space-y-1">
            <p>
              Długość:{" "}
              <span className="font-medium">{length.toFixed(0)} mm</span>
            </p>
            <p>
              Głębokość taśmy:{" "}
              <span className="font-medium">{tapeDepth.toFixed(2)}</span>
            </p>
            <p>
              Kolor: <span className="font-medium">{color}</span>
            </p>
            <div className="pt-2 border-t border-gray-200">
              <p className="text-sm font-semibold text-[#111827]">
                Cena:{" "}
                <span className="text-green-600">
                  {totalPrice.toFixed(2)} zł
                </span>
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
