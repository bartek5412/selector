// src/components/three/SmartFrameModel.tsx

import React from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Mesh } from "three";

// Definiujemy, jakie propsy będzie przyjmował nasz komponent
interface SmartFrameModelProps {
  firstColor: string;
  secondColor: string;
  // Możesz tu przekazać też scale, jeśli chcesz
  scaleX: number;
  scaleY: number;
  print: boolean;
}

export default function SmartFrameModel({
  firstColor,
  secondColor,
  scaleX,
  scaleY,
  print,
  ...props
}: SmartFrameModelProps) {
  const { nodes } = useGLTF("/SF-transformed.glb");
  const texture = useTexture("/sample-01.jpg");
  return (
    <group {...props} dispose={null} scale={[scaleX, scaleY, 1]}>
      {/* Rama - bez zmian */}
      <mesh geometry={(nodes.SMARTFRAME_v1 as Mesh).geometry}>
        <meshStandardMaterial color={firstColor} />
      </mesh>

      {/* Płaszczyzna */}
      {print && (
        <mesh geometry={(nodes.Płaszczyzna as Mesh).geometry}>
          <meshStandardMaterial
            color={secondColor}
            side={THREE.DoubleSide}
            map={texture}
          />
        </mesh>
      )}
    </group>
  );
}

useGLTF.preload("/SF-transformed.glb");
