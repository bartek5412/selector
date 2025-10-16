"use client";

import { useState } from "react";

interface EditableCellProps {
  value: string | number;
  type?: "text" | "number";
  onSave: (value: string | number) => Promise<void>;
  className?: string;
  step?: string;
  min?: string;
}

export function EditableCell({
  value,
  type = "text",
  onSave,
  className = "",
  step,
  min,
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());

  const handleSave = async () => {
    try {
      const finalValue = type === "number" ? parseFloat(editValue) : editValue;
      await onSave(finalValue);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving:", error);
      // Revert to original value on error
      setEditValue(value.toString());
    }
  };

  const handleCancel = () => {
    setEditValue(value.toString());
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex gap-1">
        <input
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          step={step}
          min={min}
          className={`w-20 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-primary focus:border-transparent ${className}`}
          autoFocus
        />
        <button
          onClick={handleSave}
          className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          title="Zapisz (Enter)"
        >
          ✓
        </button>
        <button
          onClick={handleCancel}
          className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          title="Anuluj (Escape)"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <span
      className={`cursor-pointer hover:bg-gray-100 px-1 rounded transition-colors ${className}`}
      onClick={() => setIsEditing(true)}
      title="Kliknij aby edytować"
    >
      {value}
    </span>
  );
}

interface ColorEditableCellProps {
  value: string;
  onSave: (value: string) => Promise<void>;
}

export function ColorEditableCell({ value, onSave }: ColorEditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = async () => {
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving:", error);
      setEditValue(value);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex gap-1">
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-20 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-primary focus:border-transparent"
          autoFocus
        />
        <button
          onClick={handleSave}
          className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          title="Zapisz (Enter)"
        >
          ✓
        </button>
        <button
          onClick={handleCancel}
          className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          title="Anuluj (Escape)"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className="w-4 h-4 rounded border border-gray-300"
        style={{ backgroundColor: value }}
        title={`Kolor: ${value}`}
      ></div>
      <span
        className="cursor-pointer hover:bg-gray-100 px-1 rounded transition-colors"
        onClick={() => setIsEditing(true)}
        title="Kliknij aby edytować"
      >
        {value}
      </span>
    </div>
  );
}
