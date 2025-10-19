// src/app/letterSettings/page.tsx
"use client";
import { DataTable } from "@/components/ui/dataTable";
import {
  createEditableColumns,
  LetterSettings,
} from "@/app/letterSettings/letterColumns";
import { useLetters } from "@/hooks/useLetters";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function LetterSettingsPage() {
  const {
    data,
    loading,
    error,
    filterLetters,
    updateLetter,
    deleteLetter,
    addLetter,
    getUniqueElementTypes,
    refetch,
  } = useLetters();
  const [newLetter, setNewLetter] = useState<LetterSettings>({
    id: "",
    name: "",
    description: "",
    price: 0,
    elementType: "",
    elementValue: "",
    margin: 0,
    unit: "",
  });
  const [selectedFilter, setSelectedFilter] = useState<string>("");

  // Obsługa filtrowania
  const handleFilter = async (elementType: string) => {
    try {
      if (elementType === "") {
        await refetch(); // Pobierz wszystkie dane
      } else {
        await filterLetters(elementType);
      }
      setSelectedFilter(elementType);
    } catch {
      alert("Wystąpił błąd podczas filtrowania danych");
    }
  };

  // Resetowanie filtra
  const handleResetFilter = async () => {
    try {
      await refetch();
      setSelectedFilter("");
    } catch {
      alert("Wystąpił błąd podczas resetowania filtra");
    }
  };

  // Obsługa zapisywania z alertami
  const handleSave = async (id: string, changes: Partial<LetterSettings>) => {
    try {
      await updateLetter(id, changes);
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Wystąpił błąd podczas zapisywania"
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await addLetter(newLetter);
      alert("Ramka została zapisana!");
      setNewLetter({
        id: "",
        name: "",
        description: "",
        price: 0,
        elementType: "",
        elementValue: "",
        margin: 0,
        unit: "",
      });
    } catch (error) {
      console.error("Wystąpił błąd:", error);
      alert("Wystąpił błąd podczas zapisywania ramki");
    }
  };

  // Obsługa usuwania z potwierdzeniem
  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć ten rekord?")) {
      return;
    }

    try {
      await deleteLetter(id);
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Wystąpił błąd podczas usuwania"
      );
    }
  };

  // Tworzenie kolumn z funkcjami edycji
  const columns = createEditableColumns(handleSave, handleSave, handleDelete);
  return (
    <>
      <main className="container mx-auto mt-10 py-10">
        <h1 className="mb-6 text-3xl font-bold">
          Parametry konfiguracyjne liter
        </h1>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-lg">Ładowanie danych...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Błąd:</strong> {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Interfejs filtrowania */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">
                Filtruj po typie elementu
              </h3>
              <div className="flex gap-4 items-center">
                <select
                  value={selectedFilter}
                  onChange={(e) => handleFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Wszystkie typy</option>
                  {getUniqueElementTypes().map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={handleResetFilter}
                  variant="outline"
                  className="px-4 py-2"
                >
                  Resetuj filtr
                </Button>
              </div>
              {selectedFilter && (
                <p className="mt-2 text-sm text-gray-600">
                  Wyświetlane są tylko elementy typu:{" "}
                  <strong>{selectedFilter}</strong>
                </p>
              )}
            </div>

            <div className="mb-4 text-sm text-gray-600">
              Znaleziono {data.length} rekordów
            </div>
            <ScrollArea className="h-[250px]">
              <DataTable
                columns={columns as ColumnDef<LetterSettings>[]}
                data={data as LetterSettings[]}
              />
            </ScrollArea>
          </>
        )}
      </main>

      <div className="container mx-auto mt-5 py-5">
        <h1 className="mb-6 text-3xl font-bold">Dodaj nowy parametr</h1>
        <div className=""></div>
        <Card className="p-4 bg-white items-center justify-center">
          <form onSubmit={handleSubmit} className="flex flex-col-2 gap-4">
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Nazwa
              </label>
              <input
                type="text"
                id="name"
                value={newLetter.name}
                onChange={(e) =>
                  setNewLetter({ ...newLetter, name: e.target.value })
                }
                className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Opis
              </label>
              <input
                type="text"
                id="description"
                value={newLetter.description}
                onChange={(e) =>
                  setNewLetter({ ...newLetter, description: e.target.value })
                }
                className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Cena
              </label>
              <input
                type="text"
                id="price"
                value={newLetter.price}
                onChange={(e) =>
                  setNewLetter({
                    ...newLetter,
                    price: parseFloat(e.target.value),
                  })
                }
                className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Typ elementu
              </label>
              <input
                type="text"
                id="elementType"
                value={newLetter.elementType}
                onChange={(e) =>
                  setNewLetter({ ...newLetter, elementType: e.target.value })
                }
                className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Wartość
              </label>
              <input
                type="text"
                id="elementValue"
                value={newLetter.elementValue}
                onChange={(e) =>
                  setNewLetter({ ...newLetter, elementValue: e.target.value })
                }
                className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Marża
              </label>
              <input
                type="text"
                id="margin"
                value={newLetter.margin}
                onChange={(e) =>
                  setNewLetter({
                    ...newLetter,
                    margin: parseFloat(e.target.value),
                  })
                }
                className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Jednostka
              </label>
              <input
                type="text"
                id="unit"
                value={newLetter.unit}
                onChange={(e) =>
                  setNewLetter({ ...newLetter, unit: e.target.value })
                }
                className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <button
                type="submit"
                className="bg-blue-500 w-full text-white p-2 rounded-md hover:bg-blue-600"
              >
                Wyślij
              </button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
