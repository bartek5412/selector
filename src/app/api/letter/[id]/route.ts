import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Funkcja do aktualizacji ramki (PUT)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();

    const updatedFrame = await prisma.smartFrame.update({
      where: { id },
      data: {
        kolorRamy: data.kolorRamy,
        kolorSzkla: data.kolorSzkla,
        szerokosc: data.szerokosc,
        wysokosc: data.wysokosc,
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.smartFrame.delete({
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
