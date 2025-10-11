// src/components/ColorSwatch.tsx

"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // <-- Importujemy komponenty Tooltip

// Definicja typu dla naszych nowych danych
export type ColorData = {
  value: string;
  name: string;
  id: number;
};

interface ColorSwatchProps {
  colors: ColorData[];
  selectedColor: string;
  onSelect: (colorValue: string) => void;
}

export default function ColorSwatch({
  colors,
  selectedColor,
  onSelect,
}: ColorSwatchProps) {
  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-2">
        {colors.map((color) => (
          <Tooltip key={color.id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onSelect(color.value)}
                className={cn(
                  "rounded-full w-8 h-8 border-2 border-transparent transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500",
                  selectedColor.toLowerCase() === color.value.toLowerCase()
                    ? "ring-2 ring-offset-2 ring-foreground"
                    : "hover:scale-110"
                )}
                style={{ backgroundColor: color.value }}
              >
                {selectedColor.toLowerCase() === color.value.toLowerCase() && (
                  <Check className="w-5 h-5 text-white mix-blend-difference" />
                )}
              </button>
            </TooltipTrigger>
            {/* <TooltipContent className="bg-~~white/25">
              <div className="flex flex-col items-center p-2">
              
                <div
                  className="w-16 h-16 rounded-md mb-2 border"
                  style={{ backgroundColor: color.value }}
                ></div>
      
                <p className="text-sm font-semibold">{color.name}</p>
              </div>
            </TooltipContent> */}
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
