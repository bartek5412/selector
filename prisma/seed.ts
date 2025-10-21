// prisma/seed.ts
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  // Dodaj domyślne elementy Letter
  const existingElements = await prisma.letter.count();
  if (existingElements > 0) {
    console.log("✅ Elementy już istnieją!");
    return;
  }
  const defaultLetters = [
    {
      name: "Standardowa",
      description: "Standardowa trzcionka",
      price: 100.0,
      elementType: "fontTypeOptions",
      elementValue: 1.0,
      margin: 10.0,
      unit: "kpl",
    },
    {
      name: "Plexi Opal 3mm",
      description: "Plexi Opal 3mm",
      price: 150.0,
      elementType: "frontLetterOptions",
      elementValue: 1.0,
      margin: 15.0,
      unit: "m2",
    },
    {
      name: "PCV spieniona 10mm",
      description: "PCV spieniona 10mm",
      price: 150.0,
      elementType: "backLetterOptions",
      elementValue: 1.0,
      margin: 15.0,
      unit: "m2",
    },
    {
      name: "Folia 8500",
      description: "Folia 8500",
      price: 150.0,
      elementType: "frontLetterAdditionalOptions",
      elementValue: 1.0,
      margin: 15.0,
      unit: "m2",
    },
    {
      name: "Cienka (0.5mm)",
      description: "Cienka taśma 0.5mm",
      price: 100.0,
      elementType: "tapeDepthOptions",
      elementValue: 0.5,
      margin: 10.0,
      unit: "mm",
    },
    {
      name: "Średnia (1mm)",
      description: "Średnia taśma 1mm",
      price: 120.0,
      elementType: "tapeDepthOptions",
      elementValue: 1.0,
      margin: 12.0,
      unit: "mm",
    },
    {
      name: "Gruba (1.5mm)",
      description: "Gruba taśma 1.5mm",
      price: 140.0,
      elementType: "tapeDepthOptions",
      elementValue: 1.5,
      margin: 14.0,
      unit: "mm",
    },
    {
      name: "Bardzo gruba (2mm)",
      description: "Bardzo gruba taśma 2mm",
      price: 160.0,
      elementType: "tapeDepthOptions",
      elementValue: 2.0,
      margin: 16.0,
      unit: "mm",
    },
    {
      name: "Gładka taśma",
      description: "Gładka taśma",
      price: 150.0,
      elementType: "tapeModelOptions",
      elementValue: 1.0,
      margin: 15.0,
      unit: "mm",
    },
    {
      name: "Biała taśma",
      description: "Biała taśma",
      price: 150.0,
      elementType: "tapeColorOptions",
      elementValue: 1.0,
      margin: 15.0,
      unit: "mm",
    },
    {
      name: "brak",
      description: "Brak oświetlenia",
      price: 150.0,
      elementType: "lightingOptions",
      elementValue: 0.0,
      margin: 15.0,
      unit: "szt",
    },
    {
      name: "Śruby",
      description: "Śruby",
      price: 150.0,
      elementType: "mountingOptions",
      elementValue: 1.0,
      margin: 15.0,
      unit: "szt",
    },
    {
      name: "Dystanse",
      description: "Dystanse",
      price: 150.0,
      elementType: "substructureOptions",
      elementValue: 1.0,
      margin: 15.0,
      unit: "szt",
    },
    {
      name: "Brak",
      description: "Brak ściemniacza",
      price: 150.0,
      elementType: "dimmerOptions",
      elementValue: 0.0,
      margin: 15.0,
      unit: "szt",
    },
    {
      name: "Szablon do modelu",
      description: "Szablon do modelu",
      price: 150.0,
      elementType: "templateOptions",
      elementValue: 1.0,
      margin: 15.0,
      unit: "szt",
    },
  ];

  for (const letter of defaultLetters) {
    await prisma.letter.create({
      data: letter,
    });
  }

  console.log("✅ Domyślne elementy zostały dodane!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
