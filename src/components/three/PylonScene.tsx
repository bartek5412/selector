// src/components/three/Scene.tsx

"use client";

import { Canvas } from "@react-three/fiber";
import { Stage, OrbitControls } from "@react-three/drei";
import KonfiguratorModel from "./KonfiguratorModel";
import { Card } from "../ui/card";

export default function Scene({scaleX, scaleY, firstColor, secondColor, stops}: {scaleX: number, scaleY: number, firstColor: string, secondColor: string, stops: boolean}) {
  return (
   <div className="relative w-full h-full">
      
      <Canvas
        dpr={[1, 2]}
        shadows
        camera={{ fov: 45, position: [3.3, 1.75, 5.5], zoom: 0.6 }}
      >
        <Stage
          environment="sunset"
          intensity={0.6}
          shadows={{ type: "contact", opacity: 0.5, blur: 1.5 }}
        >
          <KonfiguratorModel
            scaleX={scaleX}
            scaleY={scaleY}
            firstColor={firstColor}
            secondColor={secondColor}
            stops={stops}
          />
        </Stage>
        <OrbitControls
          makeDefault
          enableZoom={true}
          zoomSpeed={1.2}
          maxDistance={15}
          minDistance={2}
        />
      </Canvas>
      
        <Card className="absolute bottom-6 left-6 p-4 bg-white/95 backdrop-blur-sm border-[#D1D5DB] shadow-lg">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-[#111827]">Informacje</h3>
            <div className="text-xs text-[#111827]/70 space-y-1">
              <p>
                Tekst: <span className="font-medium"></span>
              </p>
              <p>
                Głębokość:{" "}
                <span className="font-medium"></span>
              </p>
              <p>
                Kolor: <span className="font-medium"></span>
              </p>
            </div>
          </div>
        </Card>
    
  </div>
  );
}
