import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // <-- WA‘¯NY IMPORT! Zamiast @prisma/client

// Ustawiamy Node.js runtime, poniewa‘• u‘•ywamy Prisma
export const runtime = "nodejs";

// Funkcja do pobierania wszystkich zapisanych ram (GET)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const elementType = searchParams.get("elementType");

    // Je‘>li podano elementType, filtruj po tym polu
    const whereClause = elementType ? { elementType } : {};

    const letter = await prisma.letterOption.findMany({
      where: whereClause,
    });

    return NextResponse.json(letter);
  } catch (error) {
    console.error("ƒœ— API Error:", error);
    console.error("ƒœ— Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      DATABASE_URL: process.env.DATABASE_URL ? "ƒ˜ Set" : "ƒœ— Not set",
    });
    return NextResponse.json(
      {
        message: "WystŽpi‘' b‘'Žd serwera",
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

// ... reszta Twoich funkcji (POST, etc.)

// Funkcja do zapisywania nowej ramy (POST)
export async function POST(request: Request) {
  try {
    // Sprawd‘­ uprawnienia do edycji parametrÆˆw
    const { auth } = await import("@/lib/auth");
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: "Wymagane zalogowanie" },
        { status: 401 }
      );
    }

    const user = session.user;

    if (!user.canEditParameters && user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Brak uprawnie‘" do edycji parametrÆˆw" },
        { status: 403 }
      );
    }

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
    console.error("ƒœ— POST API Error:", error);
    console.error("ƒœ— Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      DATABASE_URL: process.env.DATABASE_URL ? "ƒ˜ Set" : "ƒœ— Not set",
    });
    return NextResponse.json(
      {
        message: "WystŽpi‘' b‘'Žd podczas zapisywania",
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
