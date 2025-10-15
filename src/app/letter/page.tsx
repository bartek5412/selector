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
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectLabel,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  backLetterOptions,
  dimmerOptions,
  fontTypeOptions,
  frontLetterAdditionalOptions,
  frontLetterOptions,
  lightingOptions,
  mountingOptions,
  substructureOptions,
  tapeColorOptions,
  tapeDepthOptions,
  tapeModelOptions,
} from "@/lib/letterConst";

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

  // Stany dla selectów
  const [fontType, setFontType] = useState("text");
  const [frontLetter, setFrontLetter] = useState("standard");
  const [backLetter, setBackLetter] = useState("flat");
  const [frontLetterAdd, setFrontLetterAdd] = useState("none");
  const [tapeDepth, setTapeDepth] = useState("medium");
  const [tapeModel, setTapeModel] = useState("led-strip");
  const [tapeColor, setTapeColor] = useState("white");
  const [tapeColor2, setTapeColor2] = useState("white");
  const [lighting, setLighting] = useState("static");
  const [mounting, setMounting] = useState("screws");
  const [substructure, setSubstructure] = useState("aluminum");
  const [dimmer, setDimmer] = useState("none");
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
      <div className="w-full lg:w-2/6 h-full bg-white px-6 overflow-y-auto dark:bg-gray-900">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-8">
            {/* Tekst */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Tekst</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Wprowadź tekst
                  </Label>
                  <Input
                    id="text-input"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Wpisz tekst..."
                    className="w-full"
                  />
                </div>
                <Button
                  onClick={handleUploadClick}
                  className="w-full"
                  variant="outline"
                >
                  Wgraj SVG
                </Button>
                <Input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".svg"
                  className="hidden"
                />
              </div>
            </div>

            {/* Wygląd */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Wygląd</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Front litery
                  </Label>
                  <Select value={frontLetter} onValueChange={setFrontLetter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Wybierz typ" />
                    </SelectTrigger>
                    <SelectContent>
                      {frontLetterOptions.map((option) => (
                        <SelectItem key={option.id} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Tył litery
                  </Label>
                  <Select value={backLetter} onValueChange={setBackLetter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Wybierz typ" />
                    </SelectTrigger>
                    <SelectContent>
                      {backLetterOptions.map((option) => (
                        <SelectItem key={option.id} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Dodatki
                  </Label>
                  <Select
                    value={frontLetterAdd}
                    onValueChange={setFrontLetterAdd}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Wybierz opcję" />
                    </SelectTrigger>
                    <SelectContent>
                      {frontLetterAdditionalOptions.map((option) => (
                        <SelectItem key={option.id} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Głębokość taśmy
                  </Label>
                  <Select value={tapeDepth} onValueChange={setTapeDepth}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Wybierz głębokość" />
                    </SelectTrigger>
                    <SelectContent>
                      {tapeDepthOptions.map((option) => (
                        <SelectItem key={option.id} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Oświetlenie */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Oświetlenie</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Głębokość taśmy
                  </Label>
                  <Select value={tapeDepth} onValueChange={setTapeDepth}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Wybierz głębokość" />
                    </SelectTrigger>
                    <SelectContent>
                      {tapeDepthOptions.map((option) => (
                        <SelectItem key={option.id} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Model taśmy
                  </Label>
                  <Select value={tapeModel} onValueChange={setTapeModel}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Wybierz model" />
                    </SelectTrigger>
                    <SelectContent>
                      {tapeModelOptions.map((option) => (
                        <SelectItem key={option.id} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Kolor taśmy
                  </Label>
                  <Select value={tapeColor} onValueChange={setTapeColor}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Wybierz kolor" />
                    </SelectTrigger>
                    <SelectContent>
                      {tapeColorOptions.map((option) => (
                        <SelectItem key={option.id} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Kolor drugi
                  </Label>
                  <Select value={tapeColor2} onValueChange={setTapeColor2}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Wybierz kolor" />
                    </SelectTrigger>
                    <SelectContent>
                      {tapeColorOptions.map((option) => (
                        <SelectItem key={option.id} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Typ oświetlenia
                  </Label>
                  <Select value={lighting} onValueChange={setLighting}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Wybierz oświetlenie" />
                    </SelectTrigger>
                    <SelectContent>
                      {lightingOptions.map((option) => (
                        <SelectItem key={option.id} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Ściemniacz
                  </Label>
                  <Select value={dimmer} onValueChange={setDimmer}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Wybierz typ" />
                    </SelectTrigger>
                    <SelectContent>
                      {dimmerOptions.map((option) => (
                        <SelectItem key={option.id} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Montaż */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Montaż</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Mocowanie
                  </Label>
                  <Select value={mounting} onValueChange={setMounting}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Wybierz mocowanie" />
                    </SelectTrigger>
                    <SelectContent>
                      {mountingOptions.map((option) => (
                        <SelectItem key={option.id} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Materiał
                  </Label>
                  <Select value={substructure} onValueChange={setSubstructure}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Wybierz materiał" />
                    </SelectTrigger>
                    <SelectContent>
                      {substructureOptions.map((option) => (
                        <SelectItem key={option.id} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Wymiar (cm)
                  </Label>
                  <Input
                    type="number"
                    placeholder="Wprowadź wymiar"
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Szablon
                  </Label>
                  <Input
                    type="text"
                    placeholder="Wybierz szablon"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Ustawienia */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Ustawienia</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Skalowanie X
                    </Label>
                    <div className="space-y-2">
                      <Slider
                        min={0}
                        max={2}
                        step={0.01}
                        value={[x]}
                        onValueChange={(value) => handleXChange(value[0])}
                      />
                      <span className="text-sm text-gray-500">
                        {x.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Skalowanie Y
                    </Label>
                    <div className="space-y-2">
                      <Slider
                        min={0}
                        max={2}
                        step={0.01}
                        value={[y]}
                        onValueChange={(value) => handleYChange(value[0])}
                      />
                      <span className="text-sm text-gray-500">
                        {y.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Opcje wyświetlania
                  </Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Konstrukcja</span>
                      <Switch
                        checked={showRods}
                        onCheckedChange={setShowRods}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Podświetlenie</span>
                      <Switch
                        checked={showGlow}
                        onCheckedChange={setShowGlow}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Ciemne tło</span>
                      <Switch
                        checked={showDark}
                        onCheckedChange={setShowDark}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Kolory
                  </Label>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm text-gray-600 mb-2 block">
                        Kolor frontu
                      </span>
                      <ColorSwatch
                        colors={definedColor as unknown as ColorData[]}
                        selectedColor={color}
                        onSelect={setColor}
                      />
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 mb-2 block">
                        Kolor taśmy
                      </span>
                      <ColorSwatch
                        colors={definedColor2 as unknown as ColorData[]}
                        selectedColor={secondColor}
                        onSelect={setSecondColor}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
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
