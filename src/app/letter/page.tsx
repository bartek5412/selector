"use client"; // Potrzebujemy interaktywności, więc to musi być komponent kliencki

import { useRef, useState, useEffect } from "react";
import Scene3D from "@/components/three/LetterScene";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { definedColor } from "@/components/three/untils";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLetters } from "@/hooks/useLetters";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function LetterPage() {
  // Hook do pobierania danych z bazy
  const { data, getOptionsByElementType, loading, error } = useLetters();

  // Stan przechowujący tekst do wygenerowania
  const [text, setText] = useState("Sample");
  const searchParams = useSearchParams();
  const pathSessionKey = searchParams.get("pathSession");
  const pathLength = searchParams.get("pathLength"); // Zachowujemy kompatybilność wsteczną

  // Przetwarzanie danych ścieżki
  const [pathData, setPathData] = useState<any>(null);
  const length = pathData
    ? pathData.length
    : pathLength
    ? parseFloat(pathLength)
    : 0;
  const [showGlow, setShowGlow] = useState(false);
  const [color] = useState(definedColor[0].value);
  const [secondColor] = useState("#000000");
  const [showDark, setShowDark] = useState(false);
  const [showRods, setShowRods] = useState(true);
  const [svgData, setSvgData] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stany dla selectów - inicjalizujemy domyślnymi wartościami
  const [frontLetter, setFrontLetter] = useState<string>("");
  const [backLetter, setBackLetter] = useState<string>("");
  const [frontLetterAdd, setFrontLetterAdd] = useState<string>("");
  const [tapeDepth, setTapeDepth] = useState<string>("");

  // Stan przechowujący głębokość (grubość) liter - używamy tapeDepth bezpośrednio
  const depth = parseFloat(tapeDepth) || 1.0;

  const [tapeModel, setTapeModel] = useState<string>("");
  const [tapeColor, setTapeColor] = useState<string>("");
  const [tapeColor2, setTapeColor2] = useState<string>("");
  const [lighting, setLighting] = useState<string>("");
  const [mounting, setMounting] = useState<string>("");
  const [substructure, setSubstructure] = useState<string>("");
  const [dimmer, setDimmer] = useState<string>("");

  // Flaga aby zapobiec resetowaniu wartości wybranych przez użytkownika
  const [isInitialized, setIsInitialized] = useState(false);

  // Przetwarzanie danych ścieżki z PDF
  useEffect(() => {
    if (pathSessionKey) {
      try {
        const storedData = localStorage.getItem(pathSessionKey);
        if (storedData) {
          const decodedPathData = JSON.parse(storedData);
          setPathData(decodedPathData);

          // Opcjonalnie: usuń dane z localStorage po odczytaniu
          // localStorage.removeItem(pathSessionKey);
        }
      } catch (error) {
        console.error("Błąd podczas przetwarzania danych ścieżki:", error);
      }
    }
  }, [pathSessionKey]);

  // Obliczane wartości
  const rodThickness = 0.1;
  const rodOffset = -depth - 0.05;

  // Funkcja do pobierania ceny dla wybranej opcji
  const getPriceForOption = (elementType: string, selectedId: string) => {
    const options = getOptionsByElementType(elementType);
    const selectedOption = options.find((option) => option.id === selectedId);
    return selectedOption ? selectedOption.price : 0;
  };

  // Kalkulacja ceny - suma wszystkich wybranych opcji pomnożona przez długość
  const calculatePrice = () => {
    const prices = [
      getPriceForOption("frontLetterOptions", frontLetter),
      getPriceForOption("backLetterOptions", backLetter),
      getPriceForOption("frontLetterAdditionalOptions", frontLetterAdd),
      getPriceForOption("tapeDepthOptions", tapeDepth),
      getPriceForOption("tapeModelOptions", tapeModel),
      getPriceForOption("tapeColorOptions", tapeColor),
      getPriceForOption("tapeColorOptions", tapeColor2), // drugi kolor
      getPriceForOption("lightingOptions", lighting),
      getPriceForOption("mountingOptions", mounting),
      getPriceForOption("substructureOptions", substructure),
      getPriceForOption("dimmerOptions", dimmer),
    ];

    const totalPricePerUnit = prices.reduce((sum, price) => sum + price, 0);
    return (totalPricePerUnit * length) / 1000;
  };

  const totalPrice = calculatePrice();

  // Aktualizuj domyślne wartości gdy dane się załadują (tylko raz)
  useEffect(() => {
    if (!loading && data.length > 0 && !isInitialized) {
      const frontLetterOptions = getOptionsByElementType("frontLetterOptions");
      const backLetterOptions = getOptionsByElementType("backLetterOptions");
      const frontLetterAdditionalOptions = getOptionsByElementType(
        "frontLetterAdditionalOptions"
      );
      const tapeDepthOptions = getOptionsByElementType("tapeDepthOptions");
      const tapeModelOptions = getOptionsByElementType("tapeModelOptions");
      const tapeColorOptions = getOptionsByElementType("tapeColorOptions");
      const lightingOptions = getOptionsByElementType("lightingOptions");
      const mountingOptions = getOptionsByElementType("mountingOptions");
      const substructureOptions = getOptionsByElementType(
        "substructureOptions"
      );
      const dimmerOptions = getOptionsByElementType("dimmerOptions");

      if (frontLetterOptions.length > 0)
        setFrontLetter(frontLetterOptions[0].id);
      if (backLetterOptions.length > 0) setBackLetter(backLetterOptions[0].id);
      if (frontLetterAdditionalOptions.length > 0)
        setFrontLetterAdd(frontLetterAdditionalOptions[0].id);
      if (tapeDepthOptions.length > 0) setTapeDepth(tapeDepthOptions[0].id);
      if (tapeModelOptions.length > 0) setTapeModel(tapeModelOptions[0].id);
      if (tapeColorOptions.length > 0) {
        setTapeColor(tapeColorOptions[0].id);
        setTapeColor2(tapeColorOptions[0].id);
      }
      if (lightingOptions.length > 0) setLighting(lightingOptions[0].id);
      if (mountingOptions.length > 0) setMounting(mountingOptions[0].id);
      if (substructureOptions.length > 0)
        setSubstructure(substructureOptions[0].id);
      if (dimmerOptions.length > 0) {
        setDimmer(dimmerOptions[0].id);
      }

      // Oznacz jako zainicjalizowane
      setIsInitialized(true);
    }
  }, [loading, data, isInitialized]);
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

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Ładowanie opcji...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-lg">Błąd: {error}</div>
      </div>
    );
  }

  return (
    <main className="flex h-screen w-screen flex-col lg:flex-row">
      {/* Panel kontrolny */}
      <div className="w-full lg:w-2/6 h-full bg-white mt-10 px-6 overflow-y-auto dark:bg-gray-900">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-8">
            {/* Tekst */}
            <div>
              <div className="flex gap-4 justify-center">
                <Link
                  className="text-primary px-4 hover:text-primary/80 bg-primary/10 rounded-md p-1"
                  href="/letterSettings"
                >
                  Parametry konfiguracyjne
                </Link>
                <Link
                  className="text-primary px-4 hover:text-primary/80 bg-primary/10 rounded-md p-1"
                  href="/pdfsize"
                >
                  Wgraj PDF
                </Link>
              </div>
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
                  <Select
                    value={frontLetter}
                    onValueChange={(value) => setFrontLetter(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Wybierz typ" />
                    </SelectTrigger>
                    <SelectContent>
                      {getOptionsByElementType("frontLetterOptions").map(
                        (option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Tył litery
                  </Label>
                  <Select
                    value={backLetter}
                    onValueChange={(value) => setBackLetter(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Wybierz typ" />
                    </SelectTrigger>
                    <SelectContent>
                      {getOptionsByElementType("backLetterOptions").map(
                        (option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Dodatki
                  </Label>
                  <Select
                    value={frontLetterAdd}
                    onValueChange={(value) => setFrontLetterAdd(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Wybierz opcję" />
                    </SelectTrigger>
                    <SelectContent>
                      {getOptionsByElementType(
                        "frontLetterAdditionalOptions"
                      ).map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Głębokość taśmy
                  </Label>
                  <Select
                    value={tapeDepth}
                    onValueChange={(value) => setTapeDepth(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Wybierz głębokość" />
                    </SelectTrigger>
                    <SelectContent>
                      {getOptionsByElementType("tapeDepthOptions").map(
                        (option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                          </SelectItem>
                        )
                      )}
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
                    Model taśmy
                  </Label>
                  <Select
                    value={tapeModel}
                    onValueChange={(value) => setTapeModel(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Wybierz model" />
                    </SelectTrigger>
                    <SelectContent>
                      {getOptionsByElementType("tapeModelOptions").map(
                        (option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Kolor taśmy
                  </Label>
                  <Select
                    value={tapeColor}
                    onValueChange={(value) => setTapeColor(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Wybierz kolor" />
                    </SelectTrigger>
                    <SelectContent>
                      {getOptionsByElementType("tapeColorOptions").map(
                        (option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Kolor drugi
                  </Label>
                  <Select
                    value={tapeColor2}
                    onValueChange={(value) => setTapeColor2(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Wybierz kolor" />
                    </SelectTrigger>
                    <SelectContent>
                      {getOptionsByElementType("tapeColorOptions").map(
                        (option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Typ oświetlenia
                  </Label>
                  <Select
                    value={lighting}
                    onValueChange={(value) => setLighting(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Wybierz oświetlenie" />
                    </SelectTrigger>
                    <SelectContent>
                      {getOptionsByElementType("lightingOptions").map(
                        (option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Ściemniacz
                  </Label>
                  <Select
                    value={dimmer}
                    onValueChange={(value) => setDimmer(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Wybierz typ" />
                    </SelectTrigger>
                    <SelectContent>
                      {getOptionsByElementType("dimmerOptions").map(
                        (option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                          </SelectItem>
                        )
                      )}
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
                  <Select
                    value={mounting}
                    onValueChange={(value) => setMounting(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Wybierz mocowanie" />
                    </SelectTrigger>
                    <SelectContent>
                      {getOptionsByElementType("mountingOptions").map(
                        (option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Materiał
                  </Label>
                  <Select
                    value={substructure}
                    onValueChange={(value) => setSubstructure(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Wybierz materiał" />
                    </SelectTrigger>
                    <SelectContent>
                      {getOptionsByElementType("substructureOptions").map(
                        (option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                          </SelectItem>
                        )
                      )}
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
              <div className="space-y-6 mb-12">
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
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Widok 3D */}
      <div className="flex-1 h-full bg-[#D1D5DB] dark:bg-gray-800">
        <Scene3D
          text={text}
          length={length}
          depth={depth}
          color={color}
          x={1}
          y={1}
          rodThickness={rodThickness}
          rodOffset={rodOffset}
          secondColor={secondColor}
          showRods={showRods}
          showGlow={showGlow}
          svgData={svgData}
          showDark={showDark}
          tapeDepth={depth}
          totalPrice={totalPrice}
          pathData={pathData}
        />
      </div>
    </main>
  );
}
