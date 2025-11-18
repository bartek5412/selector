import { useMemo } from "react";
import { useLetters } from "@/hooks/useLetters";

interface LetterConfig {
  frontLetter: string;
  backLetter: string;
  frontLetterAdd: string;
  tapeDepth: string;
  tapeModel: string;
  tapeColor: string;
  lighting: string;
  mounting: string;
  substructure: string;
  dimmer: string;
  length: number; // w mm
  area: number; // w mm2
}

// Typ wyliczenia dla danej opcji
type CalculationMethod = "area" | "length" | "fixed";

export const useLetterCalculation = (config: LetterConfig) => {
  const { getOptionsByElementType, loading, error } = useLetters();

  const result = useMemo(() => {
    if (loading || error) {
      return {
        totalPrice: 0,
        components: [],
        isReady: false,
      };
    }

    // Funkcja pomocnicza
    const getDetails = (
      elementType: string,
      selectedId: string,
      categoryName: string,
      method: CalculationMethod
    ) => {
      const options = getOptionsByElementType(elementType);
      const selectedOption = options.find((opt) => opt.id === selectedId);

      if (!selectedOption) return null;

      return {
        category: categoryName,
        name: selectedOption.name,
        priceBase: selectedOption.price, // Cena bazowa z bazy
        id: selectedOption.id,
        method: method, // Zapamiętujemy metodę liczenia dla PDF/debugowania
      };
    };

    // Definicja mapowania opcji na metody liczenia
    const componentDefinitions = [
      // 1. Liczone z powierzchni (Area)
      {
        type: "frontLetterOptions",
        id: config.frontLetter,
        label: "Front litery",
        method: "area",
      },
      {
        type: "backLetterOptions",
        id: config.backLetter,
        label: "Tył litery",
        method: "area",
      },
      {
        type: "lightingOptions",
        id: config.lighting,
        label: "Oświetlenie",
        method: "area",
      },
      {
        type: "substructureOptions",
        id: config.substructure,
        label: "Podkonstrukcja",
        method: "area",
      },

      // 2. Liczone z długości (Length)
      {
        type: "tapeDepthOptions",
        id: config.tapeDepth,
        label: "Głębokość taśmy",
        method: "length",
      },
      {
        type: "tapeModelOptions",
        id: config.tapeModel,
        label: "Model taśmy",
        method: "length",
      },
      // Dodaję kolor taśmy do długości (zazwyczaj taśma kolorowa kosztuje per metr),
      // jeśli ma być za sztukę, zmień na "fixed"
      {
        type: "tapeColorOptions",
        id: config.tapeColor,
        label: "Kolor taśmy",
        method: "length",
      },

      // 3. Liczone za sztukę (Fixed)
      {
        type: "frontLetterAdditionalOptions",
        id: config.frontLetterAdd,
        label: "Dodatki do lica",
        method: "area",
      },
      {
        type: "mountingOptions",
        id: config.mounting,
        label: "Mocowanie",
        method: "fixed",
      },
      {
        type: "dimmerOptions",
        id: config.dimmer,
        label: "Ściemniacz",
        method: "fixed",
      },
    ] as const;

    // Przeliczniki jednostek
    const lengthInMeters = config.length / 1000;
    const areaInMetersSquared = config.area / 1000000;

    let runningTotal = 0;

    // Generowanie listy komponentów z obliczonymi cenami końcowymi dla każdego elementu
    const components = componentDefinitions
      .map((def) => {
        const details = getDetails(def.type, def.id, def.label, def.method);
        if (!details) return null;

        let finalPrice = 0;

        switch (def.method) {
          case "area":
            // Cena bazowa * metry kwadratowe
            finalPrice = details.priceBase * areaInMetersSquared;
            break;
          case "length":
            // Cena bazowa * metry bieżące
            finalPrice = details.priceBase * lengthInMeters;
            break;
          case "fixed":
            // Cena za sztukę (ilość = 1 dla całego napisu w tym kontekście,
            // chyba że mnożymy przez liczbę liter, ale tu zakładamy komplet)
            finalPrice = details.priceBase;
            break;
        }

        runningTotal += finalPrice;

        return {
          ...details,
          price: finalPrice, // To jest cena końcowa dla tego elementu w ofercie
          unitInfo:
            def.method === "area"
              ? `${areaInMetersSquared.toFixed(2)} m²`
              : def.method === "length"
              ? `${lengthInMeters.toFixed(2)} mb`
              : "kpl.",
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return {
      totalPrice: runningTotal,
      components,
      isReady: true,
    };
  }, [
    loading,
    error,
    getOptionsByElementType,
    config, // Możemy przekazać cały config jako zależność, bo to prosty obiekt
  ]);

  return { ...result, loading, error };
};
