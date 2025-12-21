// src/app/api/frames/route.ts

// src/app/api/letter/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // <-- WAŻNY IMPORT! Zamiast @prisma/client

// Funkcja do pobierania wszystkich zapisanych ram (GET)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const elementType = searchParams.get("elementType");

    // Jeśli podano elementType, filtruj po tym polu
    const whereClause = elementType ? { elementType } : {};

    const letter = await prisma.letterOption.findMany({
      where: whereClause,
    });

    return NextResponse.json(letter);
  } catch (error) {
    console.error("❌ API Error:", error);
    console.error("❌ Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      DATABASE_URL: process.env.DATABASE_URL ? "✅ Set" : "❌ Not set"
    });
    return NextResponse.json(
      { 
        message: "Wystąpił błąd serwera",
        error: process.env.NODE_ENV === "development" ? error instanceof Error ? error.message : "Unknown error" : undefined
      },
      { status: 500 }
    );
  }
}

// ... reszta Twoich funkcji (POST, etc.)

// Funkcja do zapisywania nowej ramy (POST)
export async function POST(request: Request) {
  try {
    const data = await request.json(); // Pobieramy dane z frontendu

    const newFrame = await prisma.letterOption.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        elementType: data.elementType,
        elementValue: data.elementValue,
        margin: data.margin,
        unit: data.unit,
      },
    });

    return NextResponse.json(newFrame, { status: 201 });
  } catch (error) {
    console.error("❌ POST API Error:", error);
    console.error("❌ Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      DATABASE_URL: process.env.DATABASE_URL ? "✅ Set" : "❌ Not set"
    });
    return NextResponse.json(
      { 
        message: "Wystąpił błąd podczas zapisywania",
        error: process.env.NODE_ENV === "development" ? error instanceof Error ? error.message : "Unknown error" : undefined
      },
      { status: 500 }
    );
  }
}
