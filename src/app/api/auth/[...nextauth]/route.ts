import { handlers } from "../../../../lib/auth";

// Ustawiamy Node.js runtime, ponieważ NextAuth używa Prisma
export const runtime = 'nodejs';

// Eksportuj handlers bezpośrednio - NextAuth 5 wymaga tego formatu
export const { GET, POST } = handlers;

