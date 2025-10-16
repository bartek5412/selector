// src/app/letterSettings/page.tsx
"use client";
import { DataTable } from "@/components/ui/dataTable";
import { createEditableColumns } from "@/app/letterSettings/letterColumns";
import { useLetters, Letter } from "@/hooks/useLetters";
import { ColumnDef } from "@tanstack/react-table";

export default function LetterSettingsPage() {
  const { data, loading, error, updateLetter, deleteLetter } = useLetters();

  // Obsługa zapisywania z alertami
  const handleSave = async (id: string, changes: any) => {
    try {
      await updateLetter(id, changes);
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Wystąpił błąd podczas zapisywania"
      );
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
  const columns = createEditableColumns(handleSave, handleDelete);
  return (
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
          <div className="mb-4 text-sm text-gray-600">
            Znaleziono {data.length} rekordów
          </div>
          <DataTable columns={columns as ColumnDef<Letter>[]} data={data} />
        </>
      )}
    </main>
  );
}
