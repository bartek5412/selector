// src/components/three/SvgModel.tsx

"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";

interface SvgModelProps {
  svgData: string;
  depth: number;
  color: string;
  secondColor: string;
  x: number;
  y: number;
  showRods: boolean;
}

export default function SvgModel({
  svgData,
  depth,
  color,
  secondColor,
  x,
  y,
  showRods,
}: SvgModelProps) {
  const shapes = useMemo(() => {
    const loader = new SVGLoader();
    const { paths } = loader.parse(svgData);
    return paths.flatMap((path) => path.toShapes(true));
  }, [svgData]);

  const geometry = useMemo(() => {
    if (shapes.length === 0) return new THREE.BufferGeometry();
    const extrudeSettings = {
      steps: 2,
      depth: depth,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelSegments: 5,
    };
    const geom = new THREE.ExtrudeGeometry(shapes, extrudeSettings);

    // --- KLUCZOWA ZMIANA ---
    // 1. Obliczamy rozmiar oryginalnej geometrii
    geom.computeBoundingBox();
    const boundingBox = geom.boundingBox;
    if (boundingBox) {
      const originalSize = new THREE.Vector3();
      boundingBox.getSize(originalSize);

      // 2. Ustalamy docelową szerokość modelu w scenie 3D
      const targetWidth = 1; // np. 5 jednostek

      // 3. Obliczamy współczynnik skali
      const scaleFactor = targetWidth / originalSize.x;

      // 4. Skalujemy geometrię, zachowując proporcje
      geom.scale(scaleFactor, scaleFactor, 0.03);
    }
    // --- KONIEC ZMIANY ---

    // Centrujemy geometrię PO przeskalowaniu
    geom.center();

    return geom;
  }, [shapes, depth]);

  const materials = useMemo(
    () => [
      new THREE.MeshStandardMaterial({ color: color }),
      new THREE.MeshStandardMaterial({ color: secondColor }),
    ],
    [color, secondColor]
  );

  const svgDimensions = useMemo(() => {
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    if (box) {
      return {
        width: box.max.x - box.min.x,
        height: box.max.y - box.min.y,
      };
    }
    return { width: 0, height: 0 };
  }, [geometry]);

  return (
    <group scale={[x, y, 1]}>
      <mesh
        geometry={geometry}
        material={materials}
        scale={[x, y, 1]}
        // Usuwamy ekstremalnie małą skalę z mesha
        // Możemy zostawić obrót, jeśli jest potrzebny
        rotation={[0, 0, Math.PI]}
      ></mesh>
      {/* Pręty */}
      {svgDimensions.width > 0 && showRods && (
        <>
          <mesh
            // Pozycja pręta: z tyłu SVG - górny pręt
            position={[0, 0.1, -depth / 14]}
          >
            <boxGeometry
              args={[
                svgDimensions.width * 1.05 * x, // Szerokość pręta (trochę szerszy niż SVG)
                0.05, // Wysokość (grubość) pręta
                0.05, // Głębokość pręta
              ]}
            />
            <meshStandardMaterial
              color="#444444"
              metalness={0.8}
              roughness={0.3}
            />
          </mesh>
          <mesh
            // Pozycja pręta: z tyłu SVG - dolny pręt
            position={[0, -0.4, -depth / 14]}
          >
            <boxGeometry
              args={[
                svgDimensions.width * 1.05 * x, // Szerokość pręta (trochę szerszy niż SVG)
                0.05, // Wysokość (grubość) pręta
                0.05, // Głębokość pręta
              ]}
            />
            <meshStandardMaterial
              color="#444444"
              metalness={0.8}
              roughness={0.3}
            />
          </mesh>
        </>
      )}
    </group>
  );
}
