import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Ustawiamy Node.js runtime, poniewa‘• u‘•ywamy Prisma
export const runtime = "nodejs";

// Funkcja do aktualizacji ramki (PUT)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Sprawd‘­ uprawnienia do edycji parametrÆˆw
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

    const { id } = await params;
    const data = await request.json();

    const updatedFrame = await prisma.letterOption.update({
      where: { id },
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

    return NextResponse.json(updatedFrame);
  } catch (error) {
    console.error("B‘'Žd aktualizacji:", error);
    return NextResponse.json(
      { message: "WystŽpi‘' b‘'Žd podczas aktualizacji ramki" },
      { status: 500 }
    );
  }
}

// Funkcja do usuwania ramki (DELETE)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Sprawd‘­ uprawnienia do edycji parametrÆˆw
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

    const { id } = await params;

    await prisma.letterOption.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Ramka zosta‘'a usuniŽtta" });
  } catch (error) {
    console.error("B‘'Žd usuwania:", error);
    return NextResponse.json(
      { message: "WystŽpi‘' b‘'Žd podczas usuwania ramki" },
      { status: 500 }
    );
  }
}
