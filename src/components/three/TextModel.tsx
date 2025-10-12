"use client";

import * as THREE from "three";
import { useMemo } from "react";
// @ts-ignore
import { TextGeometry } from "three-stdlib";
// @ts-ignore
import { FontLoader } from "three-stdlib";
import helvetiker from "three/examples/fonts/helvetiker_regular.typeface.json";
interface TextModelProps {
  text: string;
  depth: number;
  color: string;
  x: number;
  y: number;
  rodThickness: number;
  rodOffset: number;
  secondColor: string;
  showRods: boolean;
}

export default function TextModel({
  text,
  depth,
  color,
  x,
  y,
  rodThickness,
  rodOffset,
  secondColor,
  showRods,
}: TextModelProps) {
  // Ładujemy czcionkę za pomocą useMemo, by nie przeładowywać jej na każdym renderze
  // @ts-expect-error - helvetiker json structure matches FontData but types are not fully compatible
  const font = useMemo(() => new FontLoader().parse(helvetiker), []);
  const material = useMemo(
    () => [
      new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 1,
      }),
      new THREE.MeshStandardMaterial({ color: secondColor }),
    ],
    [color, secondColor]
  );
  // Używamy useMemo, aby uniknąć ponownego tworzenia geometrii przy każdym re-renderze,
  // jeśli tekst lub jego głębokość się nie zmieniły.
  const geometry = useMemo(() => {
    return new TextGeometry(text, {
      font: font,
      size: 1.5, // Wielkość czcionki
      height: depth, // Grubość/głębokość tekstu (extrusion)
      curveSegments: 30,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelOffset: 0,
      // @ts-expect-error - for three-stdlib TextGeometry, bevelSegments is allowed
      bevelSegments: 0,
    });
  }, [text, depth, font]);

  const textDimensions = useMemo(() => {
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

  // Centrujemy geometrię, aby jej środek był w punkcie (0,0,0)
  useMemo(() => geometry.center(), [geometry]);

  return (
    <group scale={[x, y, 1]}>
      <mesh geometry={geometry} material={material} scale={[x, y, 1]}>
        {/* Definiujemy materiał, z którego wykonany jest model */}
        {/* <meshStandardMaterial color={color} 
        // map={texture}
         /> */}
      </mesh>
      {/* Siatka z prętem */}
      {textDimensions.width > 0 && showRods && (
        <>
          <mesh
            // Pozycja pręta: z tyłu tekstu
            position={[0, 0.1, depth / 2 + rodOffset]}
          >
            <boxGeometry
              args={[
                textDimensions.width * 1.05 * x, // Szerokość pręta (trochę szerszy niż tekst)
                rodThickness, // Wysokość (grubość) pręta
                rodThickness, // Głębokość pręta
              ]}
            />
            <meshStandardMaterial
              color="#444444"
              metalness={0.8}
              roughness={0.3}
            />
          </mesh>
          <mesh
            // Pozycja pręta: z tyłu tekstu
            position={[0, -0.4, depth / 2 + rodOffset]}
          >
            <boxGeometry
              args={[
                textDimensions.width * 1.05 * x, // Szerokość pręta (trochę szerszy niż tekst)
                rodThickness, // Wysokość (grubość) pręta
                rodThickness, // Głębokość pręta
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
