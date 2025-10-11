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
}

export default function SvgModel({
  svgData,
  depth,
  color,
  secondColor,
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

  return (
    <mesh
      geometry={geometry}
      material={materials}
      // Usuwamy ekstremalnie małą skalę z mesha
      // Możemy zostawić obrót, jeśli jest potrzebny
      rotation={[-0.25, -1, 0.1]}
    ></mesh>
  );
}
