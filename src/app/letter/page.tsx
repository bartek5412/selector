"use client"; // Potrzebujemy interaktywności, więc to musi być komponent kliencki

import { useRef, useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLetters } from "@/hooks/useLetters";
import { useLetterCalculation } from "@/hooks/useLetterCalculation";
import { useLetterTypes } from "@/hooks/useLetterTypes";
import { useSearchParams } from "next/navigation";
import { SelectWithTooltip } from "@/components/ui/select-with-tooltip";
import { calculateBbox } from "@/utils/bbox";
import LetterTypeScene from "@/components/three/LetterTypeScene";
import { Card } from "@/components/ui/card";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { MojDokumentPDF } from "@/app/pdf-viewer/document";

export default function LetterPage() {
  // Hook do pobierania danych z bazy (potrzebny do renderowania opcji w selectach)
  const { data, getOptionsByElementType, loading, error } = useLetters();

  // Hook do pobierania rodzajów liter
  const {
    data: letterTypes,
    loading: letterTypesLoading,
    error: letterTypesError,
  } = useLetterTypes();

  // Stan przechowujący rodzaj litery
  const [letterType, setLetterType] = useState("");
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

  // Stany dla selectów - inicjalizujemy pustymi stringami
  const [frontLetter, setFrontLetter] = useState<string>("");
  const [backLetter, setBackLetter] = useState<string>("");
  const [frontLetterAdd, setFrontLetterAdd] = useState<string>("");
  const [tapeDepth, setTapeDepth] = useState<string>("");

  const [tapeModel, setTapeModel] = useState<string>("");
  const [tapeColor, setTapeColor] = useState<string>("");
  // const [tapeColor2, setTapeColor2] = useState<string>(""); // Opcjonalne
  const [lighting, setLighting] = useState<string>("");
  const [mounting, setMounting] = useState<string>("");
  const [substructure, setSubstructure] = useState<string>("");
  const [dimmer, setDimmer] = useState<string>("");

  // Flaga aby zapobiec resetowaniu wartości wybranych przez użytkownika
  const [isInitialized, setIsInitialized] = useState(false);

  // Stan dla ręcznej skali
  const [manualScale, setManualScale] = useState(1);

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
          console.log("Załadowane dane ścieżki:", decodedPathData);
          console.log("pathData.path:", decodedPathData?.path);
          console.log("pathData.path.items:", decodedPathData?.path?.items);
          setPathData(decodedPathData);
        }
      } catch (error) {
        console.error("Błąd podczas przetwarzania danych ścieżki:", error);
      }
    }
  }, [pathSessionKey]);

  // Oblicz bbox dla aktualnego pathData (logika wizualna/wymiarowa)
  const bbox = useMemo(() => calculateBbox(pathData), [pathData]);

  const templateValue = useMemo(() => {
    if (!bbox) return "";
    return `${(bbox.widthMm + 20).toFixed(1)} x ${(bbox.heightMm + 20).toFixed(
      1
    )} mm`;
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

  // Ref do canvas do renderowania 2D ścieżki
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Renderowanie ścieżki 2D na canvas
  useEffect(() => {
    if (!pathData?.path?.items) {
      console.log("Renderowanie canvas - brak danych ścieżki:", {
        hasPathData: !!pathData,
        hasPath: !!pathData?.path,
        hasItems: !!pathData?.path?.items,
        itemsLength: pathData?.path?.items?.length,
      });
      return;
    }

    // Użyj requestAnimationFrame aby upewnić się, że canvas jest w DOM
    const renderPath = () => {
      if (!canvasRef.current) {
        console.log("Renderowanie canvas - canvas jeszcze nie jest w DOM");
        requestAnimationFrame(renderPath);
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("Nie można uzyskać kontekstu 2D canvas");
        return;
      }

      console.log(
        "Renderowanie ścieżki - liczba elementów:",
        pathData.path.items.length
      );

      // Oblicz bbox ścieżki (minX, minY, maxX, maxY)
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;

      pathData.path.items.forEach((item: any) => {
        const [cmd, ...points] = item;
        points.forEach((p: any) => {
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
          } else if (p?.x !== undefined && p?.y !== undefined) {
            // Obsługa prostych obiektów {x, y}
            if (p.x < minX) minX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.x > maxX) maxX = p.x;
            if (p.y > maxY) maxY = p.y;
          }
        });
      });

      // Jeśli nie znaleziono żadnych punktów, użyj wymiarów strony
      if (
        !isFinite(minX) ||
        !isFinite(minY) ||
        !isFinite(maxX) ||
        !isFinite(maxY)
      ) {
        minX = 0;
        minY = 0;
        maxX = pathData.pageDimensions?.width || 800;
        maxY = pathData.pageDimensions?.height || 600;
      }

      // Oblicz wymiary ścieżki
      const pathWidth = maxX - minX;
      const pathHeight = maxY - minY;

      // Dodaj padding wokół ścieżki (10% z każdej strony)
      const padding = Math.max(pathWidth, pathHeight) * 0.1;
      const paddedWidth = pathWidth + padding * 2;
      const paddedHeight = pathHeight + padding * 2;

      // Ustaw rozmiar canvas (skalowanie do kontenera)
      const maxWidth = 800;
      const maxHeight = 600;
      const baseScale = Math.min(
        maxWidth / paddedWidth,
        maxHeight / paddedHeight,
        1
      );

      // Zwiększ skalę 2x i zastosuj ręczną skalę
      const scale = baseScale * 2 * manualScale;

      canvas.width = paddedWidth * scale;
      canvas.height = paddedHeight * scale;

      // Wyczyść canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Przesunięcie, aby ścieżka była wyśrodkowana z paddingiem
      const offsetX = -minX + padding;
      const offsetY = -minY + padding;

      // Rysuj ścieżkę
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;

      pathData.path.items.forEach((item: any) => {
        const [cmd, ...points] = item;
        ctx.beginPath();

        try {
          if (cmd === "l") {
            // Linia
            const [p1, p2] = points;
            const x1 = (p1.x + offsetX) * scale;
            const y1 = (p1.y + offsetY) * scale;
            const x2 = (p2.x + offsetX) * scale;
            const y2 = (p2.y + offsetY) * scale;
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
          } else if (cmd === "re") {
            // Prostokąt
            const [rect] = points;
            const x0 = (rect.x0 + offsetX) * scale;
            const y0 = (rect.y0 + offsetY) * scale;
            const width = (rect.x1 - rect.x0) * scale;
            const height = (rect.y1 - rect.y0) * scale;
            ctx.rect(x0, y0, width, height);
          } else if (cmd === "c") {
            // Krzywa Beziera
            const [p0, p1, p2, p3] = points;
            ctx.moveTo((p0.x + offsetX) * scale, (p0.y + offsetY) * scale);
            ctx.bezierCurveTo(
              (p1.x + offsetX) * scale,
              (p1.y + offsetY) * scale,
              (p2.x + offsetX) * scale,
              (p2.y + offsetY) * scale,
              (p3.x + offsetX) * scale,
              (p3.y + offsetY) * scale
            );
          }
          ctx.stroke();
        } catch (e) {
          console.warn("Błąd podczas rysowania elementu ścieżki:", e);
        }
      });
    };

    // Rozpocznij renderowanie
    requestAnimationFrame(renderPath);
  }, [pathData, manualScale]);

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

  // Obiekt przekazywany do PDF
  const comprehensiveOfferData = useMemo(
    () => ({
      components: components, // Lista wygenerowana przez hook
      totalLength: length,
      text: letterType || "A", // Używamy letterType, jeśli puste to "A"
      dimensions: templateValue,
      finalPrice: totalPrice, // Cena wyliczona przez hook
      creationDate: new Date().toLocaleDateString("pl-PL"),
      pathData: pathData, // Dodajemy dane ścieżki do faktury
    }),
    [components, length, letterType, templateValue, totalPrice, pathData]
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
            {/* Rodzaj litery */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Rodzaj litery</h3>
              <div className="space-y-4">
                <div>
                  <SelectWithTooltip
                    label="Rodzaj litery"
                    value={letterType}
                    onValueChange={setLetterType}
                    options={letterTypes.map((lt) => ({
                      id: lt.id,
                      name: lt.name,
                      description: lt.description,
                    }))}
                    placeholder="Wybierz rodzaj litery"
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
          </div>
        </ScrollArea>
      </div>

      {/* Widok 2-kolumnowy: Lewa (3D) | Prawa (Canvas + Podsumowanie) */}
      <div className="flex-1 h-screen bg-[#D1D5DB] dark:bg-gray-800 flex gap-4 p-4">
        {/* Lewa kolumna - Model 3D */}
        <div className="w-1/3 h-full">
          <LetterTypeScene
            letterType={
              letterTypes.find((lt) => lt.id === letterType)?.name ||
              letterType ||
              "A"
            }
            pathData={pathData}
          />
        </div>

        {/* Prawa kolumna - Canvas + Podsumowanie */}
        <div className="w-2/3 h-full relative">
          {pathData?.path?.items && pathData.path.items.length > 0 ? (
            <>
              {/* Canvas z wymiarami - wyśrodkowany */}
              <div className="h-full flex flex-col items-center justify-center gap-2">
                {/* Długość ścieżki nad szerokością */}
                <div className="flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-gray-400">
                      Długość ścieżki:
                    </span>
                    <span>{length ? `${length.toFixed(1)} mm` : "-"}</span>
                  </div>
                </div>

                {/* Szerokość nad canvas */}
                <div className="flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-gray-400">
                      Szerokość:
                    </span>
                    <span>
                      {bbox?.widthMm ? `${bbox.widthMm.toFixed(1)} mm` : "-"}
                    </span>
                  </div>
                </div>

                {/* Canvas z wymiarami obok */}
                <div className="flex items-start gap-3">
                  {/* Wysokość po lewej */}
                  <div className="flex flex-col items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-gray-500 dark:text-gray-400 text-xs">
                        Wysokość
                      </span>
                      <span className="text-lg">
                        {bbox?.heightMm ? `${bbox.heightMm.toFixed(1)}` : "-"}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        mm
                      </span>
                    </div>
                  </div>

                  {/* Canvas */}
                  <div className="bg-white rounded-lg shadow-lg p-4 max-w-full max-h-full overflow-auto">
                    <canvas
                      ref={canvasRef}
                      className="max-w-full h-auto border border-gray-300 rounded"
                    />
                  </div>

                  {/* Przyciski skali po prawej */}
                  <div className="flex flex-col items-center justify-center gap-2">
                    <button
                      onClick={() =>
                        setManualScale((prev) => Math.min(prev + 0.1, 5))
                      }
                      className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-lg font-semibold text-gray-700 dark:text-gray-300 transition-colors"
                      title="Zwiększ skalę"
                    >
                      +
                    </button>
                    <button
                      onClick={() =>
                        setManualScale((prev) => Math.max(prev - 0.1, 0.1))
                      }
                      className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-lg font-semibold text-gray-700 dark:text-gray-300 transition-colors"
                      title="Zmniejsz skalę"
                    >
                      −
                    </button>
                  </div>
                </div>
              </div>

              {/* Podsumowanie w prawym dolnym rogu */}
              <Card className="absolute bottom-0 right-0 p-4 bg-white/95 w-fit backdrop-blur-sm border-[#D1D5DB] shadow-lg">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-[#111827]">
                    Informacje
                  </h3>
                  <div className="text-xs text-[#111827]/70 space-y-1">
                    {bbox && (
                      <div className="pt-2 border-t border-gray-200 space-y-1">
                        <p>
                          Długość:{" "}
                          <span className="font-medium">
                            {length.toFixed(0)} mm
                          </span>
                        </p>
                        <p>
                          Szerokość × Wysokość:{" "}
                          <span className="font-medium">
                            {bbox.widthMm.toFixed(1)} mm ×{" "}
                            {bbox.heightMm.toFixed(1)} mm
                          </span>
                        </p>
                        <p>
                          Powierzchnia:{" "}
                          <span className="font-medium">
                            {(bbox.areaMm2 / 10000).toFixed(2)} m²
                          </span>
                        </p>
                      </div>
                    )}
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-sm font-semibold text-[#111827]">
                        Cena netto:{" "}
                        <span className="text-green-600">
                          {totalPrice.toFixed(2)} zł
                        </span>
                      </p>
                    </div>
                    <PDFDownloadLink
                      document={
                        <MojDokumentPDF offerData={comprehensiveOfferData} />
                      }
                      fileName="faktura-test.pdf"
                    >
                      {({ loading }) => (
                        <button
                          className="bg-primary hover:bg-primary/90 text-white text-md p-2 rounded-lg font-bold w-full mt-4"
                          disabled={loading}
                        >
                          {loading ? "Generowanie..." : "Wygeneruj ofertę PDF"}
                        </button>
                      )}
                    </PDFDownloadLink>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <div className="text-center text-gray-500">
              <p className="text-lg">Brak danych ścieżki</p>
              <p className="text-sm mt-2">
                Wgraj plik PDF, aby zobaczyć podgląd ścieżki
              </p>
              {pathData && (
                <p className="text-xs mt-2 text-gray-400">
                  Debug: pathData istnieje, ale path?.items nie jest dostępne
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
