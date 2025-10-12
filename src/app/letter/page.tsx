"use client"; // Potrzebujemy interaktywności, więc to musi być komponent kliencki

import { useRef, useState } from "react";
import Scene3D from "@/components/three/LetterScene";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { definedColor, definedColor2 } from "@/components/three/untils";
import ColorSwatch, { ColorData } from "@/components/ui/colorSwatch";
import { Switch } from "@/components/ui/switch";

export default function LetterPage() {
  // Stan przechowujący tekst do wygenerowania
  const [text, setText] = useState("sample");
  const rodThickness = 0.1;
  const [showGlow, setShowGlow] = useState(false);
  // Stan przechowujący głębokość (grubość) liter
  const [depth, setDepth] = useState(0.5);
  const [color, setColor] = useState(definedColor[0].value);
  const [secondColor, setSecondColor] = useState("#000000");
  const [x, setX] = useState(1);
  const [y, setY] = useState(1);
  const [showDark, setShowDark] = useState(false);
  const rodOffset = -depth - 0.05;
  const [showRods, setShowRods] = useState(true);
  const [svgData, setSvgData] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setSvgData(text); // Zapisujemy zawartość pliku SVG do stanu
    };
    reader.readAsText(file);
  };

  const handleUploadClick = () => {
    // Kliknięcie przycisku symuluje kliknięcie na ukryty input
    fileInputRef.current?.click();
  };
  const handleXChange = (value: number) => {
    setX(value);
  };
  const handleYChange = (value: number) => {
    setY(value);
  };

  const handleDepthChange = (value: number) => {
    // Zabezpieczenie przed wpisaniem wartości spoza zakresu lub nie-liczby
    if (!isNaN(value) && value >= 0.1 && value <= 2) {
      setDepth(value);
    }
  };

  return (
    <main className="flex h-screen w-screen flex-col lg:flex-row">
      {/* Panel kontrolny */}
      <div className="w-full lg:w-1/4 h-full bg-[#E5E7EB] px-6 overflow-y-auto dark:bg-gray-900">
        <Card className="grid grid-cols-1 gap-4 mt-20 border bg-white border-[#D1D5DB] p-4 rounded-md shadow-lg">
          <div>
            <Label htmlFor="text-input">Tekst</Label>
            <Input
              id="text-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Wpisz tekst..."
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="depth-slider">Grubość ({depth.toFixed(2)})</Label>
            <div className="flex items-center gap-2">
              <Slider
                id="depth-slider"
                min={0.1}
                max={2}
                step={0.05}
                value={[depth]}
                onValueChange={(value) => setDepth(value[0])}
                className="mt-2 "
              />
              <Input
                type="number" // Ustawiamy typ na number dla lepszej obsługi
                min={0.1}
                max={2}
                step={0.01}
                value={depth.toFixed(2)} // Wyświetlamy wartość z dwoma miejscami po przecinku
                onChange={(e) => handleDepthChange(parseFloat(e.target.value))}
                className="w-20" // Nadajemy inputowi stałą szerokość
              />
            </div>
          </div>

          <div className="w-full">
            <div className="grid grid-cols-2 gap-4">
              {/* Pierwszy przełącznik: Konstrukcja */}
              <div className="flex items-center justify-between">
                <Label htmlFor="rods-switch" className="text-sm font-medium">
                  Konstrukcja
                </Label>
                <Switch
                  id="rods-switch"
                  checked={showRods}
                  onCheckedChange={setShowRods}
                />
              </div>

              {/* Drugi przełącznik: Podświetlenie */}
              <div className="flex items-center justify-between">
                <Label htmlFor="glow-switch" className="text-sm font-medium">
                  Podświetlenie
                </Label>
                <Switch
                  id="glow-switch"
                  checked={showGlow}
                  onCheckedChange={setShowGlow}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="glow-switch" className="text-sm font-medium">
                  Ciemne tło
                </Label>
                <Switch
                  id="dark-switch"
                  checked={showDark}
                  onCheckedChange={setShowDark}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="color-picker" className="text-sm flex-start">
              Kolor frontu
            </Label>
            <div className="flex items-center gap-2">
              <ColorSwatch
                colors={definedColor as unknown as ColorData[]}
                selectedColor={color}
                onSelect={setColor}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="color-picker-second">Kolor taśmy</Label>
              <div className="flex items-center gap-2">
                <ColorSwatch
                  colors={definedColor2 as unknown as ColorData[]}
                  selectedColor={secondColor}
                  onSelect={setSecondColor}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Skalowanie</Label>
            <div className="flex items-center gap-2">
              <Label htmlFor="x-slider">X</Label>
              <Slider
                className="mt-2"
                id="x-slider"
                min={0}
                max={2}
                step={0.01}
                value={[x]}
                onValueChange={(value) => handleXChange(value[0])}
              />
              <Label htmlFor="y-slider">Y</Label>
              <Slider
                className="mt-2"
                id="x-slider"
                min={0}
                max={2}
                step={0.01}
                value={[y]}
                onValueChange={(value) => handleYChange(value[0])}
              />
              <Button
                variant="outline"
                onClick={() => {
                  setX(1);
                  setY(1);
                }}
              >
                Reset
              </Button>
            </div>
          </div>
          <div>
            <Button
              onClick={handleUploadClick}
              className="w-full"
              disabled={true}
            >
              Wgraj własne SVG
            </Button>
            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".svg"
              className="hidden" // Ukrywamy domyślny, brzydki input
            />
          </div>
        </Card>
      </div>

      {/* Widok 3D */}
      <div className="flex-1 h-full bg-[#D1D5DB] dark:bg-gray-800">
        <Scene3D
          text={text}
          depth={depth}
          color={color}
          x={x}
          y={y}
          rodThickness={rodThickness}
          rodOffset={rodOffset}
          secondColor={secondColor}
          showRods={showRods}
          showGlow={showGlow}
          svgData={svgData}
          showDark={showDark}
        />
      </div>
    </main>
  );
}
