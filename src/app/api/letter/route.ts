// src/app/api/frames/route.ts

// src/app/api/letter/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // <-- WAŻNY IMPORT! Zamiast @prisma/client

// Funkcja do pobierania wszystkich zapisanych ram (GET)
export async function GET() {
  try {
    const frames = await prisma.smartFrame.findMany(); // Używamy naszej globalnej instancji
    return NextResponse.json(frames);
  } catch (error) {
    console.error('Błąd API:', error);
    return NextResponse.json({ message: 'Wystąpił błąd serwera' }, { status: 500 });
  }
}

// ... reszta Twoich funkcji (POST, etc.)

// Funkcja do zapisywania nowej ramy (POST)
export async function POST(request: Request) {
  const data = await request.json(); // Pobieramy dane z frontendu

  const newFrame = await prisma.smartFrame.create({
    data: {
      kolorRamy: data.kolorRamy,
      kolorSzkla: data.kolorSzkla,
      szerokosc: data.szerokosc,
      wysokosc: data.wysokosc,
    },
  });

  return NextResponse.json(newFrame, { status: 201 });
}
