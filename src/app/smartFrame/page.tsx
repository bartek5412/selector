"use client"; // Potrzebujemy interaktywności, więc to musi być komponent kliencki

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { GithubPicker } from "react-color";
import { Switch } from "@/components/ui/switch";
import SmartFrameScene from "@/components/three/SmartFrameScene";

export default function SmartFramePage() {
  const [x, setX] = useState(1);
  const [y, setY] = useState(1);
  const [firstColor, setFirstColor] = useState("#999999");
  const [secondColor] = useState("#ffffff");
  const [print, setPrint] = useState(true);
  const handleYChange = (value: number[]) => {
    setY(value[0]);
  };
  const handleXChange = (value: number[]) => {
    setX(value[0]);
  };

  return (
    <main className="flex h-screen w-screen flex-col lg:flex-row">
      {/* Panel kontrolny */}
      <div className="w-full lg:w-1/4 h-full bg-[#E5E7EB] px-6 overflow-y-auto dark:bg-gray-900">
        <Card className="grid grid-cols-1 gap-2 mt-20 border bg-white border-[#D1D5DB] p-4 rounded-md shadow-lg">
          <div className="">
            <Label>Szerokość</Label>
            <div className="flex items-center gap-2">
              <Slider
                className="w-3/4"
                min={0.1}
                max={2}
                step={0.01}
                value={[x]}
                onValueChange={handleXChange}
              />{" "}
              <Input
                className="w-1/4"
                type="number"
                value={x}
                onChange={(e) => setX(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="">
            <Label>Wysokość</Label>
            <div className="flex items-center gap-2">
              <Slider
                className="w-3/4"
                min={0.1}
                max={2}
                step={0.01}
                value={[y]}
                onValueChange={handleYChange}
              />{" "}
              <Input
                className="w-1/4"
                type="number"
                value={y}
                onChange={(e) => setY(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="w-full">
            <div className="grid grid-cols-2 gap-4">
              {/* Pierwszy przełącznik: Konstrukcja */}
              <div className="flex items-center justify-between py-2">
                <Label htmlFor="rods-switch" className="text-sm font-medium">
                  Druk
                </Label>
                <Switch checked={print} onCheckedChange={setPrint} />
              </div>

              {/* Drugi przełącznik: Podświetlenie
              <div className="flex items-center justify-between">
                <Label htmlFor="glow-switch" className="text-sm font-medium">
                  Podświetlenie
                </Label>
                <Switch
                  id="glow-switch"
        
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="glow-switch" className="text-sm font-medium">
                  Ciemne tło
                </Label>
                <Switch
                  id="dark-switch"
          
                />
              </div> */}
            </div>
          </div>
          <div className="">
            <Label>Kolor ramy</Label>
            <div className="flex items-center gap-2 pt-2 w-auto">
              <GithubPicker
                styles={{
                  default: {
                    card: {
                      width: "auto",
                      background: "#f3f4f6", // bg-gray-100
                      border: "2px solid #e5e7eb", // border-gray-200
                      borderRadius: "8px", // rounded-lg
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", // shadow-lg
                    },
                  },
                }}
                color={firstColor}
                onChange={(color: { hex: string }) => setFirstColor(color.hex)}
                colors={["#FFFFFF", "#000000", "#808080", "#36454F", "#A8A8A8"]}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Widok 3D */}
      <div className="flex-1 h-full bg-[#D1D5DB] dark:bg-gray-800">
        <SmartFrameScene
          scaleX={x}
          scaleY={y}
          firstColor={firstColor}
          secondColor={secondColor}
          print={print}
        />
      </div>
    </main>
  );
}
