import { useState, useEffect } from "react";

export type Letter = {
  id: string;
  kolorRamy: string;
  kolorSzkla: string;
  szerokosc: number;
  wysokosc: number;
};

export type LetterSettings = {
  id: string;
  name: string;
  description: string;
  price: number;
  elementType: string;
  elementValue: number;
  margin: number;
  unit: string;
};

export function useLetters() {
  const [data, setData] = useState<LetterSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pobieranie danych
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/server/letter");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const letters = await response.json();
      setData(letters);
    } catch (err) {
      console.error("Error fetching letters:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Wystąpił błąd podczas ładowania danych"
      );
    } finally {
      setLoading(false);
    }
  };

  // Zapisywanie zmian
  const updateLetter = async (id: string, changes: Partial<LetterSettings>) => {
    try {
      const response = await fetch(`/server/letter/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(changes),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedLetter = await response.json();

      // Odśwież dane z serwera
      await fetchData();

      return updatedLetter;
    } catch (err) {
      console.error("Error updating letter:", err);
      throw new Error("Wystąpił błąd podczas zapisywania zmian");
    }
  };

  // Usuwanie
  const deleteLetter = async (id: string) => {
    try {
      const response = await fetch(`/server/letter/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Usuń z lokalnych danych
      setData((prevData) => prevData.filter((letter) => letter.id !== id));
    } catch (err) {
      console.error("Error deleting letter:", err);
      throw new Error("Wystąpił błąd podczas usuwania rekordu");
    }
  };

  // Dodawanie nowego rekordu
  const addLetter = async (letterData: Omit<LetterSettings, "id">) => {
    try {
      const response = await fetch("/server/letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(letterData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newLetter = await response.json();
      // Odśwież dane z serwera
      await fetchData();
      return newLetter;
    } catch (err) {
      console.error("Error adding letter:", err);
      throw new Error("Wystąpił błąd podczas dodawania rekordu");
    }
  };
  const filterLetters = async (elementType: string) => {
    try {
      const response = await fetch(`/server/letter?elementType=${elementType}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const letters = await response.json();
      setData(letters);
    } catch (err) {
      console.error("Error filtering letters:", err);
      throw new Error("Wystąpił błąd podczas filtrowania danych");
    }
  };

  // Pobieranie unikalnych typów elementów
  const getUniqueElementTypes = () => {
    const types = data.map((letter) => letter.elementType);
    return [...new Set(types)].filter((type) => type && type.trim() !== "");
  };

  // Pobieranie opcji dla konkretnego elementType
  const getOptionsByElementType = (elementType: string) => {
    return data.filter((item) => item.elementType === elementType);
  };
  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    updateLetter,
    deleteLetter,
    filterLetters,
    addLetter,
    getUniqueElementTypes,
    getOptionsByElementType,
    refetch: fetchData,
  };
}
