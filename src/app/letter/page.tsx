"use client"; // Potrzebujemy interaktywności, więc to musi być komponent kliencki

import { useRef, useState, useEffect, useMemo } from "react";
import Scene3D from "@/components/three/LetterScene";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLetters } from "@/hooks/useLetters";
import { useLetterCalculation } from "@/hooks/useLetterCalculation";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SelectWithTooltip } from "@/components/ui/select-with-tooltip";
import { calculateBbox } from "@/utils/bbox";

export default function LetterPage() {
  // Hook do pobierania danych z bazy (potrzebny do renderowania opcji w selectach)
  const { data, getOptionsByElementType, loading, error } = useLetters();

  // Stan przechowujący tekst do wygenerowania
  const [text, setText] = useState("Sample");
  const searchParams = useSearchParams();
  const pathSessionKey = searchParams.get("pathSession");
  const pathLength = searchParams.get("pathLength"); // Zachowujemy kompatybilność wsteczną

  // Przetwarzanie danych ścieżki
  const [pathData, setPathData] = useState<any>(null);

  // Obliczamy długość (używana zarówno do wizualizacji jak i wyceny)
  const length = pathData
    ? pathData.length
    : pathLength
    ? parseFloat(pathLength)
    : 0;

  const [showGlow, setShowGlow] = useState(false);
  const [color] = useState("#ffffff"); // Przykładowy domyślny kolor, można zmienić na definedColor
  const [secondColor] = useState("#000000");
  const [showDark, setShowDark] = useState(false);
  const [showRods, setShowRods] = useState(true);
  const [svgData, setSvgData] = useState<string | null>(null);

  // Stany dla selectów - inicjalizujemy pustymi stringami
  const [frontLetter, setFrontLetter] = useState<string>("");
  const [backLetter, setBackLetter] = useState<string>("");
  const [frontLetterAdd, setFrontLetterAdd] = useState<string>("");
  const [tapeDepth, setTapeDepth] = useState<string>("");

  // Stan przechowujący głębokość (grubość) liter - używamy tapeDepth bezpośrednio
  const depth = parseFloat(tapeDepth) || 1.0;

  const [tapeModel, setTapeModel] = useState<string>("");
  const [tapeColor, setTapeColor] = useState<string>("");
  // const [tapeColor2, setTapeColor2] = useState<string>(""); // Opcjonalne
  const [lighting, setLighting] = useState<string>("");
  const [mounting, setMounting] = useState<string>("");
  const [substructure, setSubstructure] = useState<string>("");
  const [dimmer, setDimmer] = useState<string>("");

  // Flaga aby zapobiec resetowaniu wartości wybranych przez użytkownika
  const [isInitialized, setIsInitialized] = useState(false);

  // Wyłącz przewijanie strony
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
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
        }
      } catch (error) {
        console.error("Błąd podczas przetwarzania danych ścieżki:", error);
      }
    }
  }, [pathSessionKey]);

  // Obliczane wartości wizualne
  const rodThickness = 0.1;
  const rodOffset = -depth - 0.05;

  // Oblicz bbox dla aktualnego pathData (logika wizualna/wymiarowa)
  const bbox = useMemo(() => calculateBbox(pathData), [pathData]);

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
        // setTapeColor2(tapeColorOptions[0].id);
      }
      if (lightingOptions.length > 0) setLighting(lightingOptions[0].id);
      if (mountingOptions.length > 0) setMounting(mountingOptions[0].id);
      if (substructureOptions.length > 0)
        setSubstructure(substructureOptions[0].id);
      if (dimmerOptions.length > 0) {
        setDimmer(dimmerOptions[0].id);
      }

      setIsInitialized(true);
    }
  }, [loading, data, isInitialized, getOptionsByElementType]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setSvgData(text);
    };
    reader.readAsText(file);
  };

  // --- INTEGRACJA NOWEGO HOOKA DO OBLICZEŃ ---
  const { totalPrice, components, isReady } = useLetterCalculation({
    frontLetter,
    backLetter,
    frontLetterAdd,
    tapeDepth,
    tapeModel,
    tapeColor,
    lighting,
    mounting,
    substructure,
    dimmer,
    length: length || 0,
    area: bbox?.areaMm2 || 0,
  });

  // Obiekt przekazywany do Scene3D -> PDF
  const comprehensiveOfferData = useMemo(
    () => ({
      components: components, // Lista wygenerowana przez hook
      totalLength: length,
      text: text,
      dimensions: templateValue,
      finalPrice: totalPrice, // Cena wyliczona przez hook
      creationDate: new Date().toLocaleDateString("pl-PL"),
      pathData: pathData, // Dodajemy dane ścieżki do faktury
    }),
    [components, length, text, templateValue, totalPrice, pathData]
  );

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
                <SelectWithTooltip
                  label="Front litery"
                  value={frontLetter}
                  onValueChange={setFrontLetter}
                  options={getOptionsByElementType("frontLetterOptions")}
                  placeholder="Wybierz typ"
                />
                <SelectWithTooltip
                  label="Tył litery"
                  value={backLetter}
                  onValueChange={setBackLetter}
                  options={getOptionsByElementType("backLetterOptions")}
                  placeholder="Wybierz typ"
                />
                <SelectWithTooltip
                  label="Dodatki do lica"
                  value={frontLetterAdd}
                  onValueChange={setFrontLetterAdd}
                  options={getOptionsByElementType(
                    "frontLetterAdditionalOptions"
                  )}
                  placeholder="Wybierz opcję"
                />
                <SelectWithTooltip
                  label="Głębokość taśmy"
                  value={tapeDepth}
                  onValueChange={setTapeDepth}
                  options={getOptionsByElementType("tapeDepthOptions")}
                  placeholder="Wybierz głębokość"
                />
              </div>
            </div>

            {/* Oświetlenie */}
            <div>
              <div className="grid grid-cols-2 gap-4">
                <SelectWithTooltip
                  label="Model taśmy"
                  value={tapeModel}
                  onValueChange={setTapeModel}
                  options={getOptionsByElementType("tapeModelOptions")}
                  placeholder="Wybierz model"
                />
                <SelectWithTooltip
                  label="Kolor taśmy"
                  value={tapeColor}
                  onValueChange={setTapeColor}
                  options={getOptionsByElementType("tapeColorOptions")}
                  placeholder="Wybierz kolor"
                />
                <SelectWithTooltip
                  label="Oświetlenie"
                  value={lighting}
                  onValueChange={setLighting}
                  options={getOptionsByElementType("lightingOptions")}
                  placeholder="Wybierz oświetlenie"
                />
                <SelectWithTooltip
                  label="Ściemniacz"
                  value={dimmer}
                  onValueChange={setDimmer}
                  options={getOptionsByElementType("dimmerOptions")}
                  placeholder="Wybierz typ"
                />
              </div>
            </div>

            {/* Montaż */}
            <div>
              <div className="grid grid-cols-2 gap-4">
                <SelectWithTooltip
                  label="Mocowanie do podkonstrukcji"
                  value={mounting}
                  onValueChange={setMounting}
                  options={getOptionsByElementType("mountingOptions")}
                  placeholder="Wybierz mocowanie"
                />
                <SelectWithTooltip
                  label="Podkonstrukcja"
                  value={substructure}
                  onValueChange={setSubstructure}
                  options={getOptionsByElementType("substructureOptions")}
                  placeholder="Wybierz materiał"
                />

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
          offerData={comprehensiveOfferData}
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
