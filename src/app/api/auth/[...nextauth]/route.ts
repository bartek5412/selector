import { handlers } from "../../../../lib/auth";

// Ustawiamy Node.js runtime, ponieważ NextAuth używa Prisma
export const runtime = 'nodejs';

export const { GET, POST } = handlers;

