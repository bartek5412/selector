// src/app/letterSettings/letterColumns.tsx
"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { EditableCell, ColorEditableCell } from "@/components/ui/editableCell";

export type Letter = {
  id: string;
  kolorRamy: string;
  kolorSzkla: string;
  szerokosc: number;
  wysokosc: number;
};

// Funkcja do tworzenia kolumn z możliwością edycji
export const createEditableColumns = (
  onSave: (id: string, data: Partial<Letter>) => Promise<void>,
  onDelete: (id: string) => Promise<void>
) => {
  const columnHelper = createColumnHelper<Letter>();

  return [
    // Kolor ramy - edytowalny
    columnHelper.accessor("kolorRamy", {
      header: "Kolor ramy",
      cell: ({ getValue, row, column: { id } }) => (
        <ColorEditableCell
          value={getValue()}
          onSave={(value) => onSave(row.original.id, { [id]: value })}
        />
      ),
    }),

    // Kolor szkła - edytowalny
    columnHelper.accessor("kolorSzkla", {
      header: "Kolor szkła",
      cell: ({ getValue, row, column: { id } }) => (
        <ColorEditableCell
          value={getValue()}
          onSave={(value) => onSave(row.original.id, { [id]: value })}
        />
      ),
    }),

    // Szerokość - edytowalna
    columnHelper.accessor("szerokosc", {
      header: "Szerokość (cm)",
      cell: ({ getValue, row, column: { id } }) => (
        <EditableCell
          value={getValue()}
          type="number"
          step="0.1"
          min="0"
          onSave={(value) => onSave(row.original.id, { [id]: value })}
          className="after:content-['cm'] after:ml-1 after:text-gray-500"
        />
      ),
    }),

    // Wysokość - edytowalna
    columnHelper.accessor("wysokosc", {
      header: "Wysokość (cm)",
      cell: ({ getValue, row, column: { id } }) => (
        <EditableCell
          value={getValue()}
          type="number"
          step="0.1"
          min="0"
          onSave={(value) => onSave(row.original.id, { [id]: value })}
          className="after:content-['cm'] after:ml-1 after:text-gray-500"
        />
      ),
    }),

    // Akcje - usuń
    columnHelper.display({
      id: "actions",
      header: "Akcje",
      cell: ({ row }) => (
        <button
          onClick={() => onDelete(row.original.id)}
          className="px-3 py-1 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
          title="Usuń rekord"
        >
          Usuń
        </button>
      ),
    }),
  ];
};
