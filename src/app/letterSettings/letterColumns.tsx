// src/app/letterSettings/letterColumns.tsx
"use client";

import { useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";

export type LetterSettings = {
  id: string;
  name: string;
  description: string;
  price: number;
  elementType: string;
  elementValue: string;
  margin: number;
  unit: string;
};

// Funkcja do tworzenia kolumn z możliwością edycji
export const createEditableColumns = (
  onSave: (id: string, data: Partial<LetterSettings>) => Promise<void>,
  onEdit: (id: string, changes: Partial<LetterSettings>) => Promise<void>,
  onDelete: (id: string) => Promise<void>
) => {
  const columnHelper = createColumnHelper<LetterSettings>();

  const EditableCell = ({
    value,
    onSave,
    field,
    rowId,
  }: {
    value: string | number;
    onSave: (id: string, field: string, value: string | number) => void;
    field: string;
    rowId: string;
  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);

    const handleSave = () => {
      onSave(rowId, field, editValue);
      setIsEditing(false);
    };

    const handleCancel = () => {
      setEditValue(value);
      setIsEditing(false);
    };

    if (isEditing) {
      return (
        <div className="flex gap-1">
          <input
            type={field === "price" || field === "margin" ? "number" : "text"}
            value={editValue}
            onChange={(e) =>
              setEditValue(
                field === "price" || field === "margin"
                  ? parseFloat(e.target.value)
                  : e.target.value
              )
            }
            className="w-full px-2 py-1 border rounded text-sm"
            autoFocus
          />
          <button
            onClick={handleSave}
            className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
          >
            ✓
          </button>
          <button
            onClick={handleCancel}
            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            ✗
          </button>
        </div>
      );
    }

    return (
      <div
        onClick={() => setIsEditing(true)}
        className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
        title="Kliknij aby edytować"
      >
        {value}
      </div>
    );
  };

  return [
    columnHelper.accessor("id", {
      header: "ID",
      cell: (cell) => <div>{cell.getValue()}</div>,
    }),
    columnHelper.accessor("name", {
      header: "Nazwa",
      cell: ({ getValue, row }) => (
        <EditableCell
          value={getValue()}
          onSave={(id, field, value) => onSave(id, { [field]: value })}
          field="name"
          rowId={row.original.id}
        />
      ),
    }),
    columnHelper.accessor("description", {
      header: "Opis",
      cell: ({ getValue, row }) => (
        <EditableCell
          value={getValue()}
          onSave={(id, field, value) => onSave(id, { [field]: value })}
          field="description"
          rowId={row.original.id}
        />
      ),
    }),
    columnHelper.accessor("price", {
      header: "Cena",
      cell: ({ getValue, row }) => (
        <EditableCell
          value={getValue()}
          onSave={(id, field, value) => onSave(id, { [field]: value })}
          field="price"
          rowId={row.original.id}
        />
      ),
    }),
    columnHelper.accessor("elementType", {
      header: "Typ elementu",
      cell: ({ getValue, row }) => (
        <EditableCell
          value={getValue()}
          onSave={(id, field, value) => onSave(id, { [field]: value })}
          field="elementType"
          rowId={row.original.id}
        />
      ),
    }),
    columnHelper.accessor("elementValue", {
      header: "Wartość",
      cell: ({ getValue, row }) => (
        <EditableCell
          value={getValue()}
          onSave={(id, field, value) => onSave(id, { [field]: value })}
          field="elementValue"
          rowId={row.original.id}
        />
      ),
    }),
    columnHelper.accessor("margin", {
      header: "Marża",
      cell: ({ getValue, row }) => (
        <EditableCell
          value={getValue()}
          onSave={(id, field, value) => onSave(id, { [field]: value })}
          field="margin"
          rowId={row.original.id}
        />
      ),
    }),
    columnHelper.accessor("unit", {
      header: "Jednostka",
      cell: ({ getValue, row }) => (
        <EditableCell
          value={getValue()}
          onSave={(id, field, value) => onSave(id, { [field]: value })}
          field="unit"
          rowId={row.original.id}
        />
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Akcje",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => onDelete(row.original.id)}
            className="px-3 py-1 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
            title="Usuń rekord"
          >
            Usuń
          </button>
        </div>
      ),
    }),
  ];
};
