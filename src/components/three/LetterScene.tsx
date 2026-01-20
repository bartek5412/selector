"use client"; // Komponenty 3D muszą być renderowane po stronie klienta

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stage } from "@react-three/drei";
import TextModel from "./TextModel";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";
import SvgModel from "./SvgModel";
import PathModel from "./PathModel";
import type { PathData, PathPoint } from "@/types/path";

interface OfferComponent {
  category: string;
  name: string;
  price: number;
}

interface DetailedOfferData {
  components: OfferComponent[];
  totalLength: number;
  text: string;
  dimensions: string;
  finalPrice: number;
  creationDate: string;
  pathData?: PathData; // Opcjonalne dane ścieżki dla faktury
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
  pathData: PathData | null;
  offerData: DetailedOfferData;
}

export default function Scene3D({
  offerData,
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
              //text={text}
              // depth={depth}
              color={"#000000"}
              // secondColor={secondColor}
              // x={x}
              // y={y}
              // showRods={showRods}
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
    </div>
  );
}
