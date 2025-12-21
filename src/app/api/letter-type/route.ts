import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Funkcja do pobierania wszystkich rodzajów liter (GET)
export async function GET(request: Request) {
  try {
    const letters = await prisma.letter.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(letters);
  } catch (error) {
    console.error("❌ API Error:", error);
    console.error("❌ Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    return NextResponse.json(
      {
        message: "Wystąpił błąd serwera",
        error:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "Unknown error"
            : undefined,
      },
      { status: 500 }
    );
  }
}

// Funkcja do zapisywania nowego rodzaju litery (POST)
export async function POST(request: Request) {
  try {
    const data = await request.json();

    const newLetter = await prisma.letter.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
      },
    });

    return NextResponse.json(newLetter, { status: 201 });
  } catch (error) {
    console.error("❌ POST API Error:", error);
    return NextResponse.json(
      {
        message: "Wystąpił błąd podczas zapisywania",
        error:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "Unknown error"
            : undefined,
      },
      { status: 500 }
    );
  }
}

