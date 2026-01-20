import { handlers } from "../../../../lib/auth";

// Ustawiamy Node.js runtime, ponieważ NextAuth używa Prisma
export const runtime = 'nodejs';

// Logowanie dla debugowania
const { GET, POST } = handlers;

// Wrap handlers z logowaniem
export { GET, POST };

