import React, { useMemo } from "react";
import * as THREE from "three";
import type { PathData, PathPoint } from "@/types/path";

interface PathModelProps {
  pathData: PathData;
  color?: string;
  height?: number;
}

export default function PathModel({
  pathData,
  color = "#000000",
}: PathModelProps) {
  // Generowanie osobnych linii dla każdego elementu ścieżki
  const pathLines = useMemo(() => {
    if (!pathData?.path?.items) return [];

    const path = pathData.path;
    const lines: THREE.Vector3[][] = [];

    // Skalowanie do wymiarów 3D (mniejsze dla lepszego wyglądu)
    const scaleX = 0.005; // Mniejsza skala
    const scaleY = 0.005;

    console.log("PathModel - przetwarzanie ścieżki:", path);
    console.log("PathModel - liczba elementów ścieżki:", path.items?.length ?? 0);

    // Każdy element ścieżki jako osobna linia
    if (!path.items) return [];
    
    path.items.forEach((item) => {
      const [, ...points_data] = item;
      const linePoints: THREE.Vector3[] = [];

      // Przetwarzamy wszystkie punkty w elemencie
      points_data.forEach((point_data: PathPoint) => {
        if (point_data.type === "point") {
          const point = new THREE.Vector3(
            point_data.x * scaleX,
            -point_data.y * scaleY,
            0
          );
          linePoints.push(point);
        } else if (point_data.type === "rect") {
          // Dla prostokątów dodajemy punkty narożników
          const rect = point_data;
          const rectPoints = [
            new THREE.Vector3(rect.x0 * scaleX, -rect.y0 * scaleY, 0),
            new THREE.Vector3(rect.x1 * scaleX, -rect.y0 * scaleY, 0),
            new THREE.Vector3(rect.x1 * scaleX, -rect.y1 * scaleY, 0),
            new THREE.Vector3(rect.x0 * scaleX, -rect.y1 * scaleY, 0),
          ];
          linePoints.push(...rectPoints);
        }
      });

      // Dodaj linię jeśli ma wystarczająco punktów
      if (linePoints.length >= 2) {
        lines.push(linePoints);
      }
    });

    console.log("PathModel - wygenerowano linii:", lines.length);
    console.log("PathModel - pierwsze 3 linie:", lines.slice(0, 3));

    return lines;
  }, [pathData]);

  // Materiał dla ścieżki (linia)
  const pathMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: color,
        linewidth: 4,
        transparent: true,
        opacity: 0.9,
      }),
    [color]
  );

  // Animacja wyłączona
  // useFrame((state) => {
  //   if (pathGeometry) {
  //     pathGeometry.rotateY(0.01);
  //   }
  // });

  if (pathLines.length === 0) {
    return null;
  }

  return (
    <group>
      {/* Renderuj każdą linię osobno */}
      {pathLines.map((linePoints, index) => {
        if (linePoints.length < 2) return null;

        const geometry = new THREE.BufferGeometry().setFromPoints(linePoints);

        return (
          <primitive
            key={index}
            object={new THREE.Line(geometry, pathMaterial)}
          />
        );
      })}

      {/* Wskaźniki problemów */}
      {pathData.path?.hasHoles && (
        <mesh position={[0, 0, 0.1]}>
          <planeGeometry args={[0.1, 0.1]} />
          <meshBasicMaterial color="red" transparent opacity={0.5} />
        </mesh>
      )}

      {pathData.path?.validation?.issues &&
        pathData.path.validation.issues.length > 0 && (
          <mesh position={[0.2, 0, 0.1]}>
            <planeGeometry args={[0.1, 0.1]} />
            <meshBasicMaterial color="orange" transparent opacity={0.5} />
          </mesh>
        )}
    </group>
  );
}
