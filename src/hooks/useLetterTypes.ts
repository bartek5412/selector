import { useState, useEffect } from "react";

export type LetterType = {
  id: string;
  name: string;
  description: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
};

export function useLetterTypes() {
  const [data, setData] = useState<LetterType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pobieranie danych
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/letter-type");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const letterTypes = await response.json();
      setData(letterTypes);
    } catch (err) {
      console.error("Error fetching letter types:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Wystąpił błąd podczas ładowania danych"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

