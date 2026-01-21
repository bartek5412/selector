import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Ustawiamy Node.js runtime, poniewa‘• u‘•ywamy Prisma
export const runtime = "nodejs";

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

    // Je‘>li u‘•ytkownik mo‘•e widzieŽÅ wszystkie konfiguracje lub jest adminem
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
    console.error("ƒœ— API Error:", error);
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

// POST - Zapisz nowŽ konfiguracjŽt
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

    // Sprawd‘­ czy model jest dostŽtpny
    if (!prisma.letterConfiguration) {
      console.error(
        "ƒœ— letterConfiguration model is not available in Prisma Client"
      );
      console.error(
        "Available models:",
        Object.keys(prisma).filter(
          (key) => !key.startsWith("_") && !key.startsWith("$")
        )
      );
      return NextResponse.json(
        {
          message:
            "Model letterConfiguration nie jest dostŽtpny. Zrestartuj serwer deweloperski.",
          error:
            "Prisma Client needs to be regenerated. Please restart the dev server.",
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
    console.error("ƒœ— POST API Error:", error);
    return NextResponse.json(
      {
        message: "WystŽpi‘' b‘'Žd podczas zapisywania konfiguracji",
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
