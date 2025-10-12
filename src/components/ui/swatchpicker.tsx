// src/components/ui/SwatchPicker.tsx

"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";

// Uniwersalna definicja typu dla próbki (koloru lub tekstury)
export type SwatchItem = {
  id: string | number;
  name: string;
  preview: string; // Może to być kod HEX (#...) lub ścieżka do obrazka (/...)
  value: SwatchItem; // Pełna wartość do zwrócenia po kliknięciu
};

interface SwatchPickerProps {
  items: SwatchItem[];
  selectedValue: SwatchItem | null;
  onSelect: (value: SwatchItem) => void;
}

export default function SwatchPicker({
  items,
  selectedValue,
  onSelect,
}: SwatchPickerProps) {
  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-2">
        {items.map((item) => {
          const isSelected = selectedValue?.id === item.id;
          const isColor = item.preview?.startsWith("#") ?? false;

          return (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSelect(item.value)}
                  className={cn(
                    "rounded-full w-8 h-8 border-2 border-transparent transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 overflow-hidden",
                    isSelected
                      ? "ring-2 ring-offset-2 ring-foreground"
                      : "hover:scale-110"
                  )}
                  style={isColor ? { backgroundColor: item.preview } : {}}
                >
                  {!isColor && (
                    <Image
                      src={item.preview}
                      alt={item.name}
                      width={32}
                      height={32}
                      className="object-cover w-full h-full"
                    />
                  )}
                  {isSelected && (
                    <Check className="w-5 h-5 text-white mix-blend-difference absolute" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="flex flex-col items-center p-2">
                  {isColor ? (
                    <div
                      className="w-16 h-16 rounded-md mb-2 border"
                      style={{ backgroundColor: item.preview }}
                    ></div>
                  ) : (
                    <Image
                      src={item.preview}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="rounded-md mb-2 border"
                    />
                  )}
                  <p className="text-sm font-semibold">{item.name}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
