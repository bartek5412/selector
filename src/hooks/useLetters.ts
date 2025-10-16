import { useState, useEffect } from "react";

export type Letter = {
  id: string;
  kolorRamy: string;
  kolorSzkla: string;
  szerokosc: number;
  wysokosc: number;
};

export function useLetters() {
  const [data, setData] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pobieranie danych
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/letter");

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
  const updateLetter = async (id: string, changes: Partial<Letter>) => {
    try {
      const response = await fetch(`/api/letter/${id}`, {
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

      // Aktualizuj lokalne dane
      setData((prevData) =>
        prevData.map((letter) =>
          letter.id === id ? { ...letter, ...changes } : letter
        )
      );

      return updatedLetter;
    } catch (err) {
      console.error("Error updating letter:", err);
      throw new Error("Wystąpił błąd podczas zapisywania zmian");
    }
  };

  // Usuwanie
  const deleteLetter = async (id: string) => {
    try {
      const response = await fetch(`/api/letter/${id}`, {
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
  const addLetter = async (letterData: Omit<Letter, "id">) => {
    try {
      const response = await fetch("/api/letter", {
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
      setData((prevData) => [...prevData, newLetter]);
      return newLetter;
    } catch (err) {
      console.error("Error adding letter:", err);
      throw new Error("Wystąpił błąd podczas dodawania rekordu");
    }
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
    addLetter,
    refetch: fetchData,
  };
}
