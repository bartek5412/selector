import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Pobierz wszystkie konfiguracje
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { message: "Wymagane zalogowanie" },
        { status: 401 }
      );
    }

    const user = session.user;

    // Jeśli użytkownik może widzieć wszystkie konfiguracje lub jest adminem
    const whereClause =
      user.canViewAllConfigs || user.role === "ADMIN"
        ? {}
        : { userId: user.id };

    const configurations = await prisma.letterConfiguration.findMany({
      where: whereClause,
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(configurations);
  } catch (error) {
    console.error("❌ API Error:", error);
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

// POST - Zapisz nową konfigurację
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { message: "Wymagane zalogowanie" },
        { status: 401 }
      );
    }

    const user = session.user;

    const data = await request.json();

    // Sprawdź czy model jest dostępny
    if (!prisma.letterConfiguration) {
      console.error("❌ letterConfiguration model is not available in Prisma Client");
      console.error("Available models:", Object.keys(prisma).filter(key => !key.startsWith('_') && !key.startsWith('$')));
      return NextResponse.json(
        {
          message: "Model letterConfiguration nie jest dostępny. Zrestartuj serwer deweloperski.",
          error: "Prisma Client needs to be regenerated. Please restart the dev server.",
        },
        { status: 500 }
      );
    }

    const newConfiguration = await prisma.letterConfiguration.create({
      data: {
        name: data.name || `Konfiguracja ${new Date().toLocaleString("pl-PL")}`,
        letterType: data.letterType || null,
        frontLetter: data.frontLetter || null,
        backLetter: data.backLetter || null,
        frontLetterAdd: data.frontLetterAdd || null,
        tapeDepth: data.tapeDepth || null,
        tapeModel: data.tapeModel || null,
        tapeColor: data.tapeColor || null,
        lighting: data.lighting || null,
        mounting: data.mounting || null,
        substructure: data.substructure || null,
        dimmer: data.dimmer || null,
        pathData: data.pathData || null,
        userId: user.id,
      },
    });

    return NextResponse.json(newConfiguration, { status: 201 });
  } catch (error) {
    console.error("❌ POST API Error:", error);
    return NextResponse.json(
      {
        message: "Wystąpił błąd podczas zapisywania konfiguracji",
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

