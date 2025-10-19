"use client";
import { useEffect, useState } from "react";

interface SmartFrame {
  id: string;
  kolorRamy: string;
  kolorSzkla: string;
  szerokosc: number;
  wysokosc: number;
}

export default function TestPage() {
  const [ramki, setRamki] = useState<SmartFrame[]>([]);
  const [ladowanie, setLadowanie] = useState(true);
  const [nowaRamka, setNowaRamka] = useState({
    kolorRamy: "",
    kolorSzkla: "",
    szerokosc: 0,
    wysokosc: 0,
  });
  const [zapisywanie, setZapisywanie] = useState(false);
  const [edytowanaRamka, setEdytowanaRamka] = useState<string | null>(null);
  const [daneEdycji, setDaneEdycji] = useState({
    kolorRamy: "",
    kolorSzkla: "",
    szerokosc: 0,
    wysokosc: 0,
  });

  // useEffect z pustą tablicą [] uruchomi się tylko raz,
  // gdy komponent zostanie załadowany. Idealne do pobierania danych.
  useEffect(() => {
    const pobierzRamki = async () => {
      try {
        // 1. Wysyłamy zapytanie na adres naszego API
        const odpowiedz = await fetch("/api/letter");

        // 2. Sprawdzamy, czy serwer nie zwrócił błędu (np. 404, 500)
        if (!odpowiedz.ok) {
          throw new Error("Problem z pobraniem danych");
        }

        // 3. Zmieniamy odpowiedź z formatu JSON na obiekt JavaScript
        const dane = await odpowiedz.json();
        setRamki(dane); // Zapisujemy dane w stanie komponentu
      } catch (error) {
        console.error("Wystąpił błąd:", error);
      } finally {
        setLadowanie(false); // Kończymy ładowanie, niezależnie od wyniku
      }
    };

    pobierzRamki();
  }, []);

  // Funkcja do obsługi wysyłania formularza
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setZapisywanie(true);

    try {
      const odpowiedz = await fetch("/api/letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nowaRamka),
      });

      if (!odpowiedz.ok) {
        throw new Error("Problem z zapisaniem ramki");
      }

      const nowaRamkaZSerwera = await odpowiedz.json();

      // Dodaj nową ramkę do listy
      setRamki([...ramki, nowaRamkaZSerwera]);

      // Wyczyść formularz
      setNowaRamka({
        kolorRamy: "",
        kolorSzkla: "",
        szerokosc: 0,
        wysokosc: 0,
      });

      alert("Ramka została zapisana!");
    } catch (error) {
      console.error("Wystąpił błąd:", error);
      alert("Wystąpił błąd podczas zapisywania ramki");
    } finally {
      setZapisywanie(false);
    }
  };

  // Funkcja do obsługi zmian w formularzu
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNowaRamka({
      ...nowaRamka,
      [name]:
        name === "szerokosc" || name === "wysokosc"
          ? parseFloat(value) || 0
          : value,
    });
  };

  // Funkcja do rozpoczęcia edycji ramki
  const rozpocznijEdycje = (ramka: SmartFrame) => {
    setEdytowanaRamka(ramka.id);
    setDaneEdycji({
      kolorRamy: ramka.kolorRamy,
      kolorSzkla: ramka.kolorSzkla,
      szerokosc: ramka.szerokosc,
      wysokosc: ramka.wysokosc,
    });
  };

  // Funkcja do anulowania edycji
  const anulujEdycje = () => {
    setEdytowanaRamka(null);
    setDaneEdycji({
      kolorRamy: "",
      kolorSzkla: "",
      szerokosc: 0,
      wysokosc: 0,
    });
  };

  // Funkcja do obsługi zmian w edycji
  const handleEdycjaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDaneEdycji({
      ...daneEdycji,
      [name]:
        name === "szerokosc" || name === "wysokosc"
          ? parseFloat(value) || 0
          : value,
    });
  };

  // Funkcja do zapisania edycji
  const zapiszEdycje = async (id: string) => {
    setZapisywanie(true);

    try {
      const odpowiedz = await fetch(`/api/letter/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(daneEdycji),
      });

      if (!odpowiedz.ok) {
        throw new Error("Problem z zapisaniem zmian");
      }

      const zaktualizowanaRamka = await odpowiedz.json();

      // Aktualizuj listę ramek
      setRamki(
        ramki.map((ramka) => (ramka.id === id ? zaktualizowanaRamka : ramka))
      );

      // Zakończ edycję
      setEdytowanaRamka(null);
      alert("Ramka została zaktualizowana!");
    } catch (error) {
      console.error("Wystąpił błąd:", error);
      alert("Wystąpił błąd podczas zapisywania zmian");
    } finally {
      setZapisywanie(false);
    }
  };

  // Funkcja do usunięcia ramki
  const usunRamke = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć tę ramkę?")) {
      return;
    }

    setZapisywanie(true);

    try {
      const odpowiedz = await fetch(`/api/letter/${id}`, {
        method: "DELETE",
      });

      if (!odpowiedz.ok) {
        throw new Error("Problem z usunięciem ramki");
      }

      // Usuń ramkę z listy
      setRamki(ramki.filter((ramka) => ramka.id !== id));
      alert("Ramka została usunięta!");
    } catch (error) {
      console.error("Wystąpił błąd:", error);
      alert("Wystąpił błąd podczas usuwania ramki");
    } finally {
      setZapisywanie(false);
    }
  };

  if (ladowanie) return <p>Ładowanie...</p>;
  return (
    <>
      <div className="h-screen overflow-y-auto">
        <div className="mt-20 max-w-4xl mx-auto p-6">
          <h1 className="text-3xl font-bold mb-8">Test API - SmartFrame</h1>

          {/* Formularz dodawania nowej ramki */}
          <div className="bg-gray-100 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Dodaj nową ramkę</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="kolorRamy"
                    className="block text-sm font-medium mb-1"
                  >
                    Kolor ramy:
                  </label>
                  <input
                    type="text"
                    id="kolorRamy"
                    name="kolorRamy"
                    value={nowaRamka.kolorRamy}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="np. #ff0000 lub red"
                  />
                </div>

                <div>
                  <label
                    htmlFor="kolorSzkla"
                    className="block text-sm font-medium mb-1"
                  >
                    Kolor szkła:
                  </label>
                  <input
                    type="text"
                    id="kolorSzkla"
                    name="kolorSzkla"
                    value={nowaRamka.kolorSzkla}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="np. #00ff00 lub green"
                  />
                </div>

                <div>
                  <label
                    htmlFor="szerokosc"
                    className="block text-sm font-medium mb-1"
                  >
                    Szerokość (cm):
                  </label>
                  <input
                    type="number"
                    id="szerokosc"
                    name="szerokosc"
                    value={nowaRamka.szerokosc}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.1"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="np. 30.5"
                  />
                </div>

                <div>
                  <label
                    htmlFor="wysokosc"
                    className="block text-sm font-medium mb-1"
                  >
                    Wysokość (cm):
                  </label>
                  <input
                    type="number"
                    id="wysokosc"
                    name="wysokosc"
                    value={nowaRamka.wysokosc}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.1"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="np. 40.2"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={zapisywanie}
                className="w-full md:w-auto px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {zapisywanie ? "Zapisywanie..." : "Dodaj ramkę"}
              </button>
            </form>
          </div>

          {/* Lista istniejących ramek */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">
              Zapisane ramki ({ramki.length})
            </h2>
            {ramki.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg">Brak zapisanych ramek</p>
                <p className="text-sm">
                  Użyj formularza powyżej, aby dodać pierwszą ramkę
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ramki.map((ramka) => (
                  <div
                    key={ramka.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">ID:</span>
                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                          {ramka.id}
                        </span>
                      </div>

                      {/* Kolor ramy */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Kolor ramy:</span>
                        {edytowanaRamka === ramka.id ? (
                          <input
                            type="text"
                            name="kolorRamy"
                            value={daneEdycji.kolorRamy}
                            onChange={handleEdycjaChange}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded border border-gray-300"
                              style={{ backgroundColor: ramka.kolorRamy }}
                            ></div>
                            <span className="text-sm">{ramka.kolorRamy}</span>
                          </div>
                        )}
                      </div>

                      {/* Kolor szkła */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Kolor szkła:
                        </span>
                        {edytowanaRamka === ramka.id ? (
                          <input
                            type="text"
                            name="kolorSzkla"
                            value={daneEdycji.kolorSzkla}
                            onChange={handleEdycjaChange}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded border border-gray-300"
                              style={{ backgroundColor: ramka.kolorSzkla }}
                            ></div>
                            <span className="text-sm">{ramka.kolorSzkla}</span>
                          </div>
                        )}
                      </div>

                      {/* Szerokość */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Szerokość:</span>
                        {edytowanaRamka === ramka.id ? (
                          <input
                            type="number"
                            name="szerokosc"
                            value={daneEdycji.szerokosc}
                            onChange={handleEdycjaChange}
                            step="0.1"
                            min="0"
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                          />
                        ) : (
                          <span className="text-sm">{ramka.szerokosc} cm</span>
                        )}
                      </div>

                      {/* Wysokość */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Wysokość:</span>
                        {edytowanaRamka === ramka.id ? (
                          <input
                            type="number"
                            name="wysokosc"
                            value={daneEdycji.wysokosc}
                            onChange={handleEdycjaChange}
                            step="0.1"
                            min="0"
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                          />
                        ) : (
                          <span className="text-sm">{ramka.wysokosc} cm</span>
                        )}
                      </div>

                      {/* Przyciski akcji */}
                      <div className="flex gap-2 pt-2">
                        {edytowanaRamka === ramka.id ? (
                          <>
                            <button
                              onClick={() => zapiszEdycje(ramka.id)}
                              disabled={zapisywanie}
                              className="flex-1 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:bg-gray-400"
                            >
                              {zapisywanie ? "Zapisywanie..." : "Zapisz"}
                            </button>
                            <button
                              onClick={anulujEdycje}
                              disabled={zapisywanie}
                              className="flex-1 px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 disabled:bg-gray-400"
                            >
                              Anuluj
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => rozpocznijEdycje(ramka)}
                              disabled={zapisywanie || edytowanaRamka !== null}
                              className="flex-1 px-3 py-1 bg-primary text-white text-xs rounded hover:bg-primary/90 disabled:bg-gray-400"
                            >
                              Edytuj
                            </button>
                            <button
                              onClick={() => usunRamke(ramka.id)}
                              disabled={zapisywanie || edytowanaRamka !== null}
                              className="flex-1 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:bg-gray-400"
                            >
                              Usuń
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
