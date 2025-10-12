// src/components/three/KonfiguratorModel.tsx

import React from "react";
import { useGLTF } from "@react-three/drei";
import type { Mesh } from "three";

// Przyjmujemy propsy zdefiniowane w komponencie Scene
export default function KonfiguratorModel({
  scaleX,
  scaleY,
  firstColor,
  secondColor,
  stops,
}: {
  scaleX: number;
  scaleY: number;
  firstColor: string;
  secondColor: string;
  stops: boolean;
}) {
  // `nodes` zawiera geometrię, `materials` oryginalne materiały
  const { nodes } = useGLTF("/pylonv1-transformed.glb");

  return (
    // `group` to kontener na wszystkie części modelu
    <group dispose={null} scale={[scaleX, scaleY, 1]}>
      {/* Główna część modelu */}
      {nodes.empty_2 && (nodes.empty_2 as Mesh).geometry && stops && (
        <mesh
          geometry={(nodes.empty_2 as Mesh).geometry}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          {/* Podmieniamy oryginalny materiał na nowy, sterowany stanem z UI */}
          <meshStandardMaterial color={secondColor} />
        </mesh>
      )}
      {nodes.empty_4 && (nodes.empty_4 as Mesh).geometry && (
        <mesh
          geometry={(nodes.empty_4 as Mesh).geometry}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <meshStandardMaterial color={firstColor} />
        </mesh>
      )}
    </group>
  );
}

// Pre-ładowanie modelu dla szybszego startu
useGLTF.preload("/pylon-transformed.glb");
