import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canViewConfig } from "@/lib/auth-helpers";

// Ustawiamy Node.js runtime, ponieważ używamy Prisma
export const runtime = 'nodejs';

// GET - Pobierz jedną konfigurację
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { message: "Wymagane zalogowanie" },
        { status: 401 }
      );
    }

    const user = session.user;

    const { id } = await params;

    const configuration = await prisma.letterConfiguration.findUnique({
      where: { id },
    });

    if (!configuration) {
      return NextResponse.json(
        { message: "Konfiguracja nie została znaleziona" },
        { status: 404 }
      );
    }

    // Sprawdź uprawnienia do wyświetlenia
    if (!canViewConfig(user, configuration.userId)) {
      return NextResponse.json(
        { message: "Brak uprawnień do wyświetlenia tej konfiguracji" },
        { status: 403 }
      );
    }

    return NextResponse.json(configuration);
  } catch (error) {
    console.error("❌ GET API Error:", error);
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

// PUT - Aktualizuj konfigurację
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { message: "Wymagane zalogowanie" },
        { status: 401 }
      );
    }

    const user = session.user;

    const { id } = await params;
    const data = await request.json();

    // Sprawdź czy konfiguracja istnieje i czy użytkownik ma uprawnienia
    const existingConfig = await prisma.letterConfiguration.findUnique({
      where: { id },
    });

    if (!existingConfig) {
      return NextResponse.json(
        { message: "Konfiguracja nie została znaleziona" },
        { status: 404 }
      );
    }

    // Sprawdź uprawnienia do edycji
    if (existingConfig.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Brak uprawnień do edycji tej konfiguracji" },
        { status: 403 }
      );
    }

    const updatedConfiguration = await prisma.letterConfiguration.update({
      where: { id },
      data: {
        name: data.name,
        letterType: data.letterType,
        frontLetter: data.frontLetter,
        backLetter: data.backLetter,
        frontLetterAdd: data.frontLetterAdd,
        tapeDepth: data.tapeDepth,
        tapeModel: data.tapeModel,
        tapeColor: data.tapeColor,
        lighting: data.lighting,
        mounting: data.mounting,
        substructure: data.substructure,
        dimmer: data.dimmer,
        pathData: data.pathData,
      },
    });

    return NextResponse.json(updatedConfiguration);
  } catch (error) {
    console.error("❌ PUT API Error:", error);
    return NextResponse.json(
      {
        message: "Wystąpił błąd podczas aktualizacji konfiguracji",
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

// DELETE - Usuń konfigurację
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { message: "Wymagane zalogowanie" },
        { status: 401 }
      );
    }

    const user = session.user;

    const { id } = await params;

    // Sprawdź czy konfiguracja istnieje i czy użytkownik ma uprawnienia
    const existingConfig = await prisma.letterConfiguration.findUnique({
      where: { id },
    });

    if (!existingConfig) {
      return NextResponse.json(
        { message: "Konfiguracja nie została znaleziona" },
        { status: 404 }
      );
    }

    // Sprawdź uprawnienia do usunięcia
    if (existingConfig.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Brak uprawnień do usunięcia tej konfiguracji" },
        { status: 403 }
      );
    }

    await prisma.letterConfiguration.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Konfiguracja została usunięta" });
  } catch (error) {
    console.error("❌ DELETE API Error:", error);
    return NextResponse.json(
      {
        message: "Wystąpił błąd podczas usuwania konfiguracji",
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

