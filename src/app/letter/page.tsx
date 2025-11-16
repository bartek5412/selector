"use client"; // Potrzebujemy interaktywności, więc to musi być komponent kliencki

import { useRef, useState, useEffect, useMemo } from "react";
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
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

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

  // Wyłącz przewijanie strony
  useEffect(() => {
    // Zapisz oryginalny styl overflow
    const originalOverflow = document.body.style.overflow;
    // Wyłącz przewijanie
    document.body.style.overflow = "hidden";

    // Przywróć oryginalny styl przy odmontowaniu
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

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


  // Przelicznik PDF pt -> mm
  const PT_TO_MM = 25.4 / 72.0;

  // Oblicz bbox dla aktualnego pathData
  const bbox = useMemo(() => {
    if (!pathData?.path?.items)
      return null as null | {
        widthMm: number;
        heightMm: number;
        areaMm2: number;
      };
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const item of pathData.path.items as Array<[string, ...any[]]>) {
      const points = item.slice(1);
      for (const p of points) {
        if (p?.type === "point") {
          if (p.x < minX) minX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.x > maxX) maxX = p.x;
          if (p.y > maxY) maxY = p.y;
        } else if (p?.type === "rect") {
          if (p.x0 < minX) minX = p.x0;
          if (p.y0 < minY) minY = p.y0;
          if (p.x1 > maxX) maxX = p.x1;
          if (p.y1 > maxY) maxY = p.y1;
        }
      }
    }
    if (
      !isFinite(minX) ||
      !isFinite(minY) ||
      !isFinite(maxX) ||
      !isFinite(maxY)
    )
      return null;
    const widthPt = Math.max(0, maxX - minX);
    const heightPt = Math.max(0, maxY - minY);
    const areaPt2 = widthPt * heightPt;
    const widthMm = widthPt * PT_TO_MM;
    const heightMm = heightPt * PT_TO_MM;
    const areaMm2 = areaPt2 * PT_TO_MM ** 2;
    return { widthMm, heightMm, areaMm2 };
  }, [pathData]);

  const templateValue = useMemo(() => {
    if (!bbox) return "";
    return `${bbox.widthMm.toFixed(1)} x ${bbox.heightMm.toFixed(1)} mm`;
  }, [bbox]);

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
    const totalData = {tapeType: tapeModel}

  return (
    <main className="flex h-screen w-screen flex-col lg:flex-row overflow-hidden">
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Front litery
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <Select
                        value={frontLetter}
                        onValueChange={(value) => setFrontLetter(value)}
                      >
                        <TooltipTrigger asChild>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Wybierz typ" />
                          </SelectTrigger>
                        </TooltipTrigger>
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
                      <TooltipContent
                        className="bg-primary text-white"
                        arrowClassName="bg-primary fill-primary"
                      >
                        {getOptionsByElementType("frontLetterOptions").find(
                          (option) => option.id === frontLetter
                        )?.description || "Brak opisu"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Tył litery
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <Select
                        value={backLetter}
                        onValueChange={(value) => setBackLetter(value)}
                      >
                        <TooltipTrigger asChild>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Wybierz typ" />
                          </SelectTrigger>
                        </TooltipTrigger>
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
                      <TooltipContent
                        className="bg-primary text-white"
                        arrowClassName="bg-primary fill-primary"
                      >
                        <p>
                          {getOptionsByElementType("backLetterOptions").find(
                            (option) => option.id === backLetter
                          )?.description || "Brak opisu"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Dodatki do lica
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <Select
                        value={frontLetterAdd}
                        onValueChange={(value) => setFrontLetterAdd(value)}
                      >
                        <TooltipTrigger asChild>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Wybierz opcję" />
                          </SelectTrigger>
                        </TooltipTrigger>
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
                      <TooltipContent
                        className="bg-primary text-white"
                        arrowClassName="bg-primary fill-primary"
                      >
                        <p>
                          {getOptionsByElementType(
                            "frontLetterAdditionalOptions"
                          ).find((option) => option.id === frontLetterAdd)
                            ?.description || "Brak opisu"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Głębokość taśmy
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <Select
                        value={tapeDepth}
                        onValueChange={(value) => setTapeDepth(value)}
                      >
                        <TooltipTrigger asChild>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Wybierz głębokość" />
                          </SelectTrigger>
                        </TooltipTrigger>
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
                      <TooltipContent
                        className="bg-primary text-white"
                        arrowClassName="bg-primary fill-primary"
                      >
                        <p>
                          {getOptionsByElementType("tapeDepthOptions").find(
                            (option) => option.id === tapeDepth
                          )?.description || "Brak opisu"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>

            {/* Oświetlenie */}
            <div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Model taśmy
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <Select
                        value={tapeModel}
                        onValueChange={(value) => setTapeModel(value)}
                      >
                        <TooltipTrigger asChild>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Wybierz model" />
                          </SelectTrigger>
                        </TooltipTrigger>
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
                      <TooltipContent
                        className="bg-primary text-white"
                        arrowClassName="bg-primary fill-primary"
                      >
                        <p>
                          {getOptionsByElementType("tapeModelOptions").find(
                            (option) => option.id === tapeModel
                          )?.description || "Brak opisu"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Kolor taśmy
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <Select
                        value={tapeColor}
                        onValueChange={(value) => setTapeColor(value)}
                      >
                        <TooltipTrigger asChild>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Wybierz kolor" />
                          </SelectTrigger>
                        </TooltipTrigger>
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
                      <TooltipContent
                        className="bg-primary text-white"
                        arrowClassName="bg-primary fill-primary"
                      >
                        <p>
                          {getOptionsByElementType("tapeColorOptions").find(
                            (option) => option.id === tapeColor
                          )?.description || "Brak opisu"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* <div>
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
                </div> */}

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Oświetlenie
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <Select
                        value={lighting}
                        onValueChange={(value) => setLighting(value)}
                      >
                        <TooltipTrigger asChild>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Wybierz oświetlenie" />
                          </SelectTrigger>
                        </TooltipTrigger>
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
                      <TooltipContent
                        className="bg-primary text-white"
                        arrowClassName="bg-primary fill-primary"
                      >
                        <p>
                          {getOptionsByElementType("lightingOptions").find(
                            (option) => option.id === lighting
                          )?.description || "Brak opisu"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Ściemniacz
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <Select
                        value={dimmer}
                        onValueChange={(value) => setDimmer(value)}
                      >
                        <TooltipTrigger asChild>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Wybierz typ" />
                          </SelectTrigger>
                        </TooltipTrigger>
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
                      <TooltipContent
                        className="bg-primary text-white"
                        arrowClassName="bg-primary fill-primary"
                      >
                        <p>
                          {getOptionsByElementType("dimmerOptions").find(
                            (option) => option.id === dimmer
                          )?.description || "Brak opisu"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>

            {/* Montaż */}
            <div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Mocowanie do podkonstrukcji
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <Select
                        value={mounting}
                        onValueChange={(value) => setMounting(value)}
                      >
                        <TooltipTrigger asChild>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Wybierz mocowanie" />
                          </SelectTrigger>
                        </TooltipTrigger>
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
                      <TooltipContent
                        className="bg-primary text-white"
                        arrowClassName="bg-primary fill-primary"
                      >
                        <p>
                          {getOptionsByElementType("mountingOptions").find(
                            (option) => option.id === mounting
                          )?.description || "Brak opisu"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Podkonstrukcja
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <Select
                        value={substructure}
                        onValueChange={(value) => setSubstructure(value)}
                      >
                        <TooltipTrigger asChild>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Wybierz materiał" />
                          </SelectTrigger>
                        </TooltipTrigger>
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
                      <TooltipContent
                        className="bg-primary text-white"
                        arrowClassName="bg-primary fill-primary"
                      >
                        <p>
                          {getOptionsByElementType("substructureOptions").find(
                            (option) => option.id === substructure
                          )?.description || "Brak opisu"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Wymiar podkonstrukcji (cm)
                  </Label>
                  <Input
                    type="number"
                    placeholder="Wprowadź wymiar"
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Szablon wymiar
                  </Label>
                  <Input
                    name="template"
                    type="text"
                    placeholder="Wybierz szablon"
                    value={templateValue}
                    readOnly
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
      <div className="flex-1 h-screen bg-[#D1D5DB] dark:bg-gray-800">
        <Scene3D
          offerData={totalData}
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
