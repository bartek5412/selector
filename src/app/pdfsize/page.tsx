// components/PdfViewer.tsx
"use client";

import { useState, useRef, useEffect, MouseEvent } from "react";
import { useRouter } from "next/navigation";

// Definicje typów dla danych z API
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
  fill?: boolean;
  stroke?: boolean;
  evenodd?: boolean;
  closePath?: boolean;
  rect?: any;
  hasHoles?: boolean;
  isClosed?: boolean;
  complexity?: string;
  validation?: {
    valid: boolean;
    issues: string[];
    warnings: string[];
    is_closed: boolean;
    has_holes: boolean;
    complexity: string;
  };
}
interface PageDimensions {
  width: number;
  height: number;
}
interface ApiResponse {
  pageImage: string;
  paths: PathData[];
  pageDimensions: PageDimensions;
}

export default function PdfViewer() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPathIndex, setSelectedPathIndex] = useState<number | null>(
    null
  );
  const [pathLength, setPathLength] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setApiData(null);
      setSelectedPathIndex(null);
      setPathLength(null);
    }
  };

  const handleProcessClick = async () => {
    if (!file) return;
    setIsLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("/api/process-pdf", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Błąd serwera przy przetwarzaniu PDF.");
      const data: ApiResponse = await response.json();
      setApiData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCanvasClick = async (event: MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !apiData) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = (event.clientX - rect.left) * scaleX;
    const canvasY = (event.clientY - rect.top) * scaleY;
    const pdfX = canvasX * (apiData.pageDimensions.width / canvas.width);
    const pdfY = canvasY * (apiData.pageDimensions.height / canvas.height);

    try {
      const response = await fetch("/api/get-length", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paths: apiData.paths,
          click: { x: pdfX, y: pdfY },
        }),
      });
      if (!response.ok)
        throw new Error("Błąd serwera przy obliczaniu długości.");

      const result = await response.json();
      console.log("Odpowiedź z backendu:", result); // Zostaw to do debugowania!

      if (result.closestPathIndex !== -1 && result.length_mm !== null) {
        setSelectedPathIndex(result.closestPathIndex);
        setPathLength(result.length_mm);

        // Wyświetl informacje o ścieżce w konsoli dla debugowania
        if (result.hasHoles) {
          console.log(
            "Ścieżka ma dziury - będzie wymagała specjalnej obsługi w 3D"
          );
        }
        if (!result.isClosed) {
          console.log(
            "Ścieżka nie jest domknięta - może być problemem w renderowaniu 3D"
          );
        }
        console.log("Złożoność ścieżki:", result.complexity);

        // Wyświetl informacje o walidacji
        if (result.validation) {
          console.log("Walidacja ścieżki:", result.validation);
          if (result.validation.issues && result.validation.issues.length > 0) {
            console.warn("Problemy ze ścieżką:", result.validation.issues);
          }
          if (
            result.validation.warnings &&
            result.validation.warnings.length > 0
          ) {
            console.warn(
              "Ostrzeżenia dla ścieżki:",
              result.validation.warnings
            );
          }
        }
      } else {
        setSelectedPathIndex(null);
        setPathLength(null);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleNavigateToLetter = () => {
    if (pathLength !== null && selectedPathIndex !== null && apiData) {
      // Zapisz dane ścieżki w localStorage
      const selectedPath = apiData.paths[selectedPathIndex];
      const pathData = {
        length: pathLength,
        pathIndex: selectedPathIndex,
        path: selectedPath,
        pageDimensions: apiData.pageDimensions,
      };

      // Generuj unikalny klucz dla sesji
      const sessionKey = `pathData_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      localStorage.setItem(sessionKey, JSON.stringify(pathData));

      // Przekaż tylko klucz sesji przez URL
      router.push(`/letter?pathSession=${sessionKey}`);
    }
  };

  useEffect(() => {
    if (!apiData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = apiData.pageImage;
    img.onload = () => {
      // 1. Wyczyść i narysuj obraz tła
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const scaleX = canvas.width / apiData.pageDimensions.width;
      const scaleY = canvas.height / apiData.pageDimensions.height;

      // 2. Narysuj wszystkie ścieżki od nowa, uwzględniając zaznaczenie
      apiData.paths.forEach((path, index) => {
        const isSelected = index === selectedPathIndex;
        ctx.strokeStyle = isSelected ? "lime" : "red";
        ctx.lineWidth = isSelected ? 3 : 1.5;

        path.items.forEach((item) => {
          const [cmd, ...points] = item;
          ctx.beginPath();
          try {
            if (cmd === "l") {
              // Linia
              const [p1, p2] = points as Point[];
              ctx.moveTo(p1.x * scaleX, p1.y * scaleY);
              ctx.lineTo(p2.x * scaleX, p2.y * scaleY);
            } else if (cmd === "re") {
              // Prostokąt
              const [rect] = points as Rect[];
              ctx.rect(
                rect.x0 * scaleX,
                rect.y0 * scaleY,
                (rect.x1 - rect.x0) * scaleX,
                (rect.y1 - rect.y0) * scaleY
              );
            } else if (cmd === "c") {
              // Krzywa Beziera
              const [p0, p1, p2, p3] = points as Point[];
              ctx.moveTo(p0.x * scaleX, p0.y * scaleY);
              ctx.bezierCurveTo(
                p1.x * scaleX,
                p1.y * scaleY,
                p2.x * scaleX,
                p2.y * scaleY,
                p3.x * scaleX,
                p3.y * scaleY
              );
            }
            ctx.stroke();
          } catch (e) {
            console.warn("Błąd podczas rysowania elementu ścieżki:", e);
          }
        });
      });
    };
  }, [apiData, selectedPathIndex]); // Zależności: odśwież rysunek, gdy dane lub zaznaczenie się zmienią

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            PDF Path Analyzer
          </h1>
          <p className="text-muted-foreground text-lg">
            Wgraj plik PDF i analizuj ścieżki, aby zmierzyć ich długość
          </p>
        </div>

        {/* File Upload Section */}
        <div className="bg-card rounded-lg border p-6 mb-8 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Wybierz plik PDF
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
              />
            </div>

            <button
              onClick={handleProcessClick}
              disabled={isLoading || !file}
              className="w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent"></div>
                  <span>Przetwarzanie...</span>
                </div>
              ) : (
                "Wgraj i pokaż ścieżki"
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-destructive font-medium">Błąd: {error}</p>
            </div>
          )}
        </div>

        {/* Results Section */}
        {apiData && (
          <div className="space-y-6">
            {/* Path Length Display */}
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              {pathLength !== null ? (
                <div className="text-center">
                  <h3 className="text-2xl font-semibold text-foreground mb-2">
                    Zaznaczona ścieżka
                  </h3>
                  <div className="text-4xl font-bold text-primary mb-4">
                    {pathLength.toFixed(0)} mm
                  </div>

                  {/* Wyświetl informacje o ścieżce */}
                  {apiData && selectedPathIndex !== null && (
                    <div className="mb-6 p-4 bg-muted/30 rounded-lg border">
                      <h4 className="font-semibold text-sm mb-2">
                        Informacje o ścieżce:
                      </h4>
                      <div className="text-xs text-muted-foreground space-y-1">
                        {apiData.paths[selectedPathIndex]?.hasHoles && (
                          <p className="text-orange-600">
                            ⚠️ Ścieżka ma dziury (wymaga specjalnej obsługi)
                          </p>
                        )}
                        {apiData.paths[selectedPathIndex]?.isClosed ===
                          false && (
                          <p className="text-yellow-600">
                            ⚠️ Ścieżka nie jest domknięta
                          </p>
                        )}
                        {apiData.paths[selectedPathIndex]?.complexity && (
                          <p>
                            Złożoność:{" "}
                            {apiData.paths[selectedPathIndex].complexity}
                          </p>
                        )}

                        {/* Wyświetl informacje o walidacji */}
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <h5 className="font-medium text-xs mb-1">
                            Walidacja:
                          </h5>
                          {apiData.paths[selectedPathIndex]?.validation && (
                            <>
                              {apiData.paths[selectedPathIndex].validation
                                .valid ? (
                                <p className="text-green-600">
                                  ✅ Ścieżka jest poprawna
                                </p>
                              ) : (
                                <p className="text-red-600">
                                  ❌ Ścieżka ma problemy
                                </p>
                              )}

                              {apiData.paths[selectedPathIndex].validation
                                .issues &&
                                apiData.paths[selectedPathIndex].validation
                                  .issues.length > 0 && (
                                  <div className="mt-1">
                                    {apiData.paths[
                                      selectedPathIndex
                                    ].validation.issues.map(
                                      (issue: string, index: number) => (
                                        <p key={index} className="text-red-600">
                                          • {issue}
                                        </p>
                                      )
                                    )}
                                  </div>
                                )}

                              {apiData.paths[selectedPathIndex].validation
                                .warnings &&
                                apiData.paths[selectedPathIndex].validation
                                  .warnings.length > 0 && (
                                  <div className="mt-1">
                                    {apiData.paths[
                                      selectedPathIndex
                                    ].validation.warnings.map(
                                      (warning: string, index: number) => (
                                        <p
                                          key={index}
                                          className="text-yellow-600"
                                        >
                                          • {warning}
                                        </p>
                                      )
                                    )}
                                  </div>
                                )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="text-muted-foreground mb-6">
                    Kliknij na inną ścieżkę, aby zmierzyć jej długość
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={handleNavigateToLetter}
                      className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors duration-200 shadow-sm hover:shadow-md"
                    >
                      Przejdź do generatora liter
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <h3 className="text-2xl font-semibold text-foreground mb-2">
                    Gotowy do analizy
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    Kliknij na ścieżkę, aby zmierzyć jej długość
                  </p>
                </div>
              )}
            </div>

            {/* Canvas Container */}
            <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-muted/30">
                <h4 className="font-semibold text-foreground">
                  Podgląd PDF z zaznaczonymi ścieżkami
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Czerwone linie to wszystkie ścieżki, zielone to zaznaczona
                  ścieżka
                </p>
              </div>
              <div className="p-4">
                <div className="relative inline-block max-w-full">
                  <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    className="max-w-full h-auto cursor-pointer border border-border rounded-md shadow-sm hover:shadow-md transition-shadow duration-200"
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
