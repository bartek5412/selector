// src/lib/prisma.ts

import { PrismaClient } from "../generated/prisma";

// Sprawdź czy DATABASE_URL jest ustawiony
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set!");
  throw new Error("DATABASE_URL environment variable is required");
}

// Deklarujemy globalną zmienną, aby przechować instancję Prisma
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Jeśli instancja już istnieje, użyj jej. Jeśli nie, stwórz nową.
// To zapobiega tworzeniu wielu połączeń w trybie deweloperskim.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
