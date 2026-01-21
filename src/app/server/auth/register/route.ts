import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Ustawiamy Node.js runtime, poniewa‘• u‘•ywamy Prisma
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { email, password, name } = data;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email i has‘'o sŽ wymagane" },
        { status: 400 }
      );
    }

    // Sprawd‘­ czy u‘•ytkownik ju‘• istnieje
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "U‘•ytkownik o tym emailu ju‘• istnieje" },
        { status: 400 }
      );
    }

    // Hash has‘'a
    const passwordHash = await bcrypt.hash(password, 10);

    // UtwÆˆrz u‘•ytkownika
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || null,
        role: "USER",
        canEditParameters: false,
        canViewAllConfigs: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { message: "U‘•ytkownik zosta‘' utworzony", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("ƒœ— Registration Error:", error);
    return NextResponse.json(
      {
        message: "WystŽpi‘' b‘'Žd podczas rejestracji",
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
