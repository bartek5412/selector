"use client"; // Komponenty 3D muszą być renderowane po stronie klienta

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stage } from "@react-three/drei";
import TextModel from "./TextModel";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";
import SvgModel from "./SvgModel";
import PathModel from "./PathModel";
import { Card } from "@/components/ui/card";
import { MojDokumentPDF } from "@/app/pdf-viewer/document";
import { PDFDownloadLink } from "@react-pdf/renderer";

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
  offerData: {
    tapeType: string;
  }
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
  tapeDepth,
  totalPrice,
  pathData,
}: SceneProps) {
  // Przelicznik punktów PDF na mm
  const PT_TO_MM = 25.4 / 72.0;

  // BBOX dla zaznaczonego napisu (tylko bieżący pathData)
  const bbox = (() => {
    if (!pathData?.path?.items) return null;
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const item of pathData.path.items as Array<[string, ...any[]]>) {
      const points = item.slice(1);
      for (const p of points) {
        if (p?.type === "point") {
          if (p.x < minX) minX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.x > maxX) maxX = p.x;
          if (p.y > maxY) maxY = p.y;
        } else if (p?.type === "rect") {
          if (p.x0 < minX) minX = p.x0;
          if (p.y0 < minY) minY = p.y0;
          if (p.x1 > maxX) maxX = p.x1;
          if (p.y1 > maxY) maxY = p.y1;
        }
      }
    }
    if (
      !isFinite(minX) ||
      !isFinite(minY) ||
      !isFinite(maxX) ||
      !isFinite(maxY)
    )
      return null;
    const widthPt = Math.max(0, maxX - minX);
    const heightPt = Math.max(0, maxY - minY);
    const areaPt2 = widthPt * heightPt;
    const widthMm = widthPt * PT_TO_MM;
    const heightMm = heightPt * PT_TO_MM;
    const areaMm2 = areaPt2 * PT_TO_MM ** 2;
    return { widthMm, heightMm, areaMm2 };
  })();
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

      {/* Card w lewym dolnym narożniku */}
      <Card className="absolute bottom-6 left-6 p-4 bg-white/95 backdrop-blur-sm border-[#D1D5DB] shadow-lg">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[#111827]">Informacje</h3>
          <div className="text-xs text-[#111827]/70 space-y-1">
            {bbox && (
              <div className="pt-2 border-t border-gray-200 space-y-1">
                <p>
                  Długość:{" "}
                  <span className="font-medium">{length.toFixed(0)} mm</span>
                </p>
                <p>
                  Szerokość × Wysokość:{" "}
                  <span className="font-medium">
                    {bbox.widthMm.toFixed(1)} mm × {bbox.heightMm.toFixed(1)} mm
                  </span>
                </p>
                <p>
                  Powierzchnia:{" "}
                  <span className="font-medium">
                    {(bbox.areaMm2 / 10000).toFixed(2)} m²
                  </span>
                </p>
              </div>
            )}
            <div className="pt-2 border-t border-gray-200">
              <p className="text-sm font-semibold text-[#111827]">
                Cena:{" "}
                <span className="text-green-600">
                  {totalPrice.toFixed(2)} zł
                </span>
              </p>
            </div>
            <PDFDownloadLink
              document={<MojDokumentPDF offerData={offerData}/>}
              fileName="faktura-test.pdf"
            >
              {/* Używamy "children as a function", aby uzyskać dostęp 
      do stanu 'loading' i dezaktywować przycisk podczas generowania.
    */}
              {({ loading }) => (
                <button
                  className="bg-primary hover:bg-primary/90 text-white text-md p-2 rounded-lg font-bold w-full mt-4"
                  disabled={loading}
                >
                  {loading ? "Generowanie..." : "Wygeneruj ofertę PDF"}
                </button>
              )}
            </PDFDownloadLink>
          </div>
        </div>
      </Card>
    </div>
  );
}
