import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Funkcja do aktualizacji ramki (PUT)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Sprawdź uprawnienia do edycji parametrów
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
        { message: "Brak uprawnień do edycji parametrów" },
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
    console.error("Błąd aktualizacji:", error);
    return NextResponse.json(
      { message: "Wystąpił błąd podczas aktualizacji ramki" },
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
    // Sprawdź uprawnienia do edycji parametrów
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
        { message: "Brak uprawnień do edycji parametrów" },
        { status: 403 }
      );
    }

    const { id } = await params;

    await prisma.letterOption.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Ramka została usunięta" });
  } catch (error) {
    console.error("Błąd usuwania:", error);
    return NextResponse.json(
      { message: "Wystąpił błąd podczas usuwania ramki" },
      { status: 500 }
    );
  }
}
