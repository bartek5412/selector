import { handlers } from "../../../../lib/auth";
import type { NextRequest } from "next/server";

// Ustawiamy Node.js runtime, ponieważ NextAuth używa Prisma
export const runtime = 'nodejs';

// Wrap handlers z logowaniem dla debugowania
const { GET: originalGET, POST: originalPOST } = handlers;

export const GET = async (request: NextRequest) => {
  console.log('🔐 NextAuth GET handler called:', request.url);
  const response = await originalGET(request);
  console.log('🔐 NextAuth GET response status:', response.status);
  // Loguj nagłówki Set-Cookie
  const setCookieHeaders = response.headers.getSetCookie();
  if (setCookieHeaders.length > 0) {
    console.log('🍪 NextAuth setting cookies:', setCookieHeaders.map(c => c.split(';')[0]).join(", "));
  } else {
    console.log('🍪 NextAuth NOT setting any cookies');
  }
  return response;
};

export const POST = async (request: NextRequest) => {
  console.log('🔐 NextAuth POST handler called:', request.url);
  const response = await originalPOST(request);
  console.log('🔐 NextAuth POST response status:', response.status);
  // Loguj nagłówki Set-Cookie
  const setCookieHeaders = response.headers.getSetCookie();
  if (setCookieHeaders.length > 0) {
    console.log('🍪 NextAuth setting cookies:', setCookieHeaders.map(c => c.split(';')[0]).join(", "));
  } else {
    console.log('🍪 NextAuth NOT setting any cookies');
  }
  return response;
};

