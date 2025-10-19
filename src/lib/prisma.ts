// src/lib/prisma.ts

import { PrismaClient } from "../generated/prisma";

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
