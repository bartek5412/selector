import { handlers } from "../../../../lib/auth";

// Ustawiamy Node.js runtime, poniewa‘• NextAuth u‘•ywa Prisma
export const runtime = "nodejs";

// Eksportuj handlers bezpo‘>rednio - NextAuth 5 wymaga tego formatu
export const { GET, POST } = handlers;
