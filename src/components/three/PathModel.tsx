"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

interface Point {
  x: number;
  y: number;
}

interface Rect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

type PathItem = [string, ...(Point | Rect)[]];

interface PathData {
  items: PathItem[];
}

interface PathModelProps {
  pathData: {
    length: number;
    pathIndex: number;
    path: PathData;
    pageDimensions: {
      width: number;
      height: number;
    };
  };
  text: string;
  depth: number;
  color: string;
  secondColor: string;
  x: number;
  y: number;
  showRods: boolean;
}

export default function PathModel({
  pathData,
  text,
  depth,
  color,
  secondColor,
  x,
  y,
  showRods,
}: PathModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Generowanie punktów wzdłuż ścieżki
  const pathPoints = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const path = pathData.path;

    // Skalowanie współrzędnych do rozmiaru sceny 3D
    const scaleX = 1.0 / pathData.pageDimensions.width;
    const scaleY = 1.0 / pathData.pageDimensions.height;

    path.items.forEach((item) => {
      const [cmd, ...coords] = item;

      if (cmd === "l") {
        // Linia - dodajemy punkty startowy i końcowy
        const [p1, p2] = coords as Point[];
        points.push(new THREE.Vector3(p1.x * scaleX, -p1.y * scaleY, 0));
        points.push(new THREE.Vector3(p2.x * scaleX, -p2.y * scaleY, 0));
      } else if (cmd === "re") {
        // Prostokąt - dodajemy punkty wzdłuż obwodu
        const [rect] = coords as Rect[];
        const width = rect.x1 - rect.x0;
        const height = rect.y1 - rect.y0;
        const segments = Math.max(4, Math.floor(Math.max(width, height) * 10));

        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          let px: number, py: number;

          if (t <= 0.25) {
            // Górna krawędź
            const localT = t * 4;
            px = rect.x0 + width * localT;
            py = rect.y0;
          } else if (t <= 0.5) {
            // Prawa krawędź
            const localT = (t - 0.25) * 4;
            px = rect.x1;
            py = rect.y0 + height * localT;
          } else if (t <= 0.75) {
            // Dolna krawędź
            const localT = (t - 0.5) * 4;
            px = rect.x1 - width * localT;
            py = rect.y1;
          } else {
            // Lewa krawędź
            const localT = (t - 0.75) * 4;
            px = rect.x0;
            py = rect.y1 - height * localT;
          }

          points.push(new THREE.Vector3(px * scaleX, -py * scaleY, 0));
        }
      } else if (cmd === "c") {
        // Krzywa Beziera - generujemy punkty wzdłuż krzywej
        const [p0, p1, p2, p3] = coords as Point[];
        const segments = 20;

        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          const point = new THREE.Vector3().fromArray([
            p0.x * scaleX,
            -p0.y * scaleY,
            0,
          ]);

          // Implementacja krzywej Beziera
          const oneMinusT = 1 - t;
          const oneMinusT2 = oneMinusT * oneMinusT;
          const oneMinusT3 = oneMinusT2 * oneMinusT;
          const t2 = t * t;
          const t3 = t2 * t;

          point.x =
            oneMinusT3 * p0.x +
            3 * oneMinusT2 * t * p1.x +
            3 * oneMinusT * t2 * p2.x +
            t3 * p3.x;
          point.y = -(
            oneMinusT3 * p0.y +
            3 * oneMinusT2 * t * p1.y +
            3 * oneMinusT * t2 * p2.y +
            t3 * p3.y
          );
          point.x *= scaleX;
          point.y *= scaleY;

          points.push(point);
        }
      }
    });

    return points;
  }, [pathData]);

  // Tworzenie geometrii dla tekstu wzdłuż ścieżki
  const textGeometry = useMemo(() => {
    if (pathPoints.length < 2) return null;

    // Dzielimy tekst na znaki
    const characters = text.split("");
    const totalLength = pathPoints.length;
    const charSpacing = Math.max(
      1,
      Math.floor(totalLength / characters.length)
    );

    const geometries: THREE.ExtrudeGeometry[] = [];

    characters.forEach((char, index) => {
      if (char === " ") return; // Pomijamy spacje

      const pointIndex = Math.min(index * charSpacing, totalLength - 1);
      const currentPoint = pathPoints[pointIndex];
      const nextPoint = pathPoints[Math.min(pointIndex + 1, totalLength - 1)];

      // Obliczamy kierunek wzdłuż ścieżki
      const direction = new THREE.Vector3()
        .subVectors(nextPoint, currentPoint)
        .normalize();
      const angle = Math.atan2(direction.y, direction.x);

      // Tworzymy geometrię dla znaku (uproszczona - prostokąt)
      const charGeometry = new THREE.PlaneGeometry(0.1, 0.15);
      const extrudeSettings = {
        steps: 2,
        depth: depth * 0.5,
        bevelEnabled: true,
        bevelThickness: 0.01,
        bevelSize: 0.01,
        bevelSegments: 3,
      };

      const extrudedGeometry = new THREE.ExtrudeGeometry(
        new THREE.Shape().setFromPoints([
          new THREE.Vector2(-0.05, -0.075),
          new THREE.Vector2(0.05, -0.075),
          new THREE.Vector2(0.05, 0.075),
          new THREE.Vector2(-0.05, 0.075),
          new THREE.Vector2(-0.05, -0.075),
        ]),
        extrudeSettings
      );

      // Pozycjonujemy i obracamy geometrię
      extrudedGeometry.translate(
        currentPoint.x,
        currentPoint.y,
        currentPoint.z
      );
      extrudedGeometry.rotateZ(angle);

      geometries.push(extrudedGeometry);
    });

    if (geometries.length === 0) return null;

    // Łączymy wszystkie geometrie w jedną
    const mergedGeometry = new THREE.BufferGeometry();
    const mergedAttributes: { [key: string]: any } = {};

    geometries.forEach((geom, index) => {
      const attributes = geom.attributes;
      Object.keys(attributes).forEach((key) => {
        if (!mergedAttributes[key]) {
          mergedAttributes[key] = [];
        }
        mergedAttributes[key].push(...attributes[key].array);
      });
    });

    Object.keys(mergedAttributes).forEach((key) => {
      const mergedArray = new Float32Array(mergedAttributes[key]);
      mergedGeometry.setAttribute(
        key,
        new THREE.BufferAttribute(
          mergedArray,
          mergedGeometry.getAttribute(key)?.itemSize || 3
        )
      );
    });

    return mergedGeometry;
  }, [pathPoints, text, depth]);

  // Geometria dla ścieżki (linia)
  const pathGeometry = useMemo(() => {
    if (pathPoints.length < 2) return null;

    const geometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
    return geometry;
  }, [pathPoints]);

  // Materiały
  const materials = useMemo(
    () => [
      new THREE.MeshStandardMaterial({ color: color }),
      new THREE.MeshStandardMaterial({ color: secondColor }),
    ],
    [color, secondColor]
  );

  const pathMaterial = useMemo(
    () => new THREE.LineBasicMaterial({ color: "#ff0000", linewidth: 2 }),
    []
  );

  // Obliczamy wymiary ścieżki
  const pathDimensions = useMemo(() => {
    if (pathPoints.length === 0) return { width: 0, height: 0 };

    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

    pathPoints.forEach((point) => {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    });

    return {
      width: maxX - minX,
      height: maxY - minY,
    };
  }, [pathPoints]);

  // Animacja
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef} scale={[x, y, 1]}>
      {/* Tekst wzdłuż ścieżki */}
      {textGeometry && <mesh geometry={textGeometry} material={materials} />}

      {/* Wizualizacja ścieżki (opcjonalna) */}
      {pathGeometry && <line geometry={pathGeometry} material={pathMaterial} />}

      {/* Pręty */}
      {pathDimensions.width > 0 && showRods && (
        <>
          <mesh position={[0, 0.1, -depth / 14]}>
            <boxGeometry args={[pathDimensions.width * 1.05 * x, 0.05, 0.05]} />
            <meshStandardMaterial
              color="#444444"
              metalness={0.8}
              roughness={0.3}
            />
          </mesh>
          <mesh position={[0, -0.4, -depth / 14]}>
            <boxGeometry args={[pathDimensions.width * 1.05 * x, 0.05, 0.05]} />
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
