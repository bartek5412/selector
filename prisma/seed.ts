// prisma/seed.ts
import { PrismaClient } from "../src/generated/prisma";
import {
  fontTypeOptions,
  frontLetterOptions,
  backLetterOptions,
  frontLetterAdditionalOptions,
  tapeDepthOptions,
  tapeModelOptions,
  tapeColorOptions,
  lightingOptions,
  mountingOptions,
  substructureOptions,
  dimmerOptions,
  templateOptions,
} from "../src/lib/letterConst";

const prisma = new PrismaClient();

async function main() {
  // Dodaj domyślne elementy LetterOption
  const existingElements = await prisma.letterOption.count();
  if (existingElements > 0) {
    console.log("✅ Elementy już istnieją!");
  } else {
    // Funkcja pomocnicza do konwersji opcji z letterConst na format bazy danych
    const createLetterOptions = (
      options: Array<{ id: number; value: string; label: string }>,
      elementType: string,
      basePrice: number = 100.0,
      baseMargin: number = 10.0,
      unit: string = "szt"
    ) => {
      return options.map((option) => ({
        name: option.label,
        description: option.label,
        price: basePrice + option.id * 10, // Cena zależy od ID
        elementType: elementType,
        elementValue: option.id,
        margin: baseMargin + option.id,
        unit: unit,
      }));
    };

    // Tworzenie wszystkich opcji z letterConst
    const allLetterOptions = [
      ...createLetterOptions(
        fontTypeOptions,
        "fontTypeOptions",
        100,
        10,
        "kpl"
      ),
      ...createLetterOptions(
        frontLetterOptions,
        "frontLetterOptions",
        150,
        15,
        "m2"
      ),
      ...createLetterOptions(
        backLetterOptions,
        "backLetterOptions",
        150,
        15,
        "m2"
      ),
      ...createLetterOptions(
        frontLetterAdditionalOptions,
        "frontLetterAdditionalOptions",
        150,
        15,
        "m2"
      ),
      ...createLetterOptions(
        tapeDepthOptions,
        "tapeDepthOptions",
        100,
        10,
        "mm"
      ),
      ...createLetterOptions(
        tapeModelOptions,
        "tapeModelOptions",
        150,
        15,
        "mm"
      ),
      ...createLetterOptions(
        tapeColorOptions,
        "tapeColorOptions",
        150,
        15,
        "mm"
      ),
      ...createLetterOptions(
        lightingOptions,
        "lightingOptions",
        150,
        15,
        "szt"
      ),
      ...createLetterOptions(
        mountingOptions,
        "mountingOptions",
        150,
        15,
        "szt"
      ),
      ...createLetterOptions(
        substructureOptions,
        "substructureOptions",
        150,
        15,
        "szt"
      ),
      ...createLetterOptions(dimmerOptions, "dimmerOptions", 150, 15, "szt"),
      ...createLetterOptions(
        templateOptions,
        "templateOptions",
        150,
        15,
        "szt"
      ),
    ];

    for (const letter of allLetterOptions) {
      await prisma.letterOption.create({
        data: letter,
      });
    }

    console.log(
      `✅ Dodano ${allLetterOptions.length} domyślnych elementów LetterOption z letterConst!`
    );
  }

  // Dodaj przykładowe rodzaje liter (Letter)
  const existingLetterTypes = await prisma.letter.count();
  if (existingLetterTypes === 0) {
    const defaultLetterTypes = [
      {
        name: "A",
        description: "Litera A",
        type: "standard",
      },
      {
        name: "B",
        description: "Litera B",
        type: "standard",
      },
      {
        name: "C",
        description: "Litera C",
        type: "standard",
      },
    ];

    for (const letterType of defaultLetterTypes) {
      await prisma.letter.create({
        data: letterType,
      });
    }

    console.log("✅ Domyślne rodzaje liter zostały dodane!");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
