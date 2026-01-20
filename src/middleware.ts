import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Check if a valid session cookie exists (Edge Runtime compatible)
 * This function does NOT use Prisma or decode JWT, so it can be used in middleware
 * It only checks for the presence of the session cookie
 * Full authentication is handled in API routes with Node.js runtime
 */
function hasSessionCookie(cookieHeader: string | null): boolean {
  if (!cookieHeader) {
    return false;
  }

  // Extract cookies
  const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
    const [key] = cookie.trim().split("=");
    acc[key] = true;
    return acc;
  }, {} as Record<string, boolean>);

  // Check for NextAuth session cookie (both production and development names)
  return !!(
    cookies["__Secure-next-auth.session-token"] ||
    cookies["next-auth.session-token"]
  );
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Log do konsoli serwera - sprawdź czy middleware jest wywoływany
  console.log('🔒 Middleware executed for path:', path);

  // ZAWSZE dodaj nagłówek, żeby sprawdzić czy middleware działa
  const response = NextResponse.next();
  response.headers.set('x-middleware-executed', 'true');
  response.headers.set('x-middleware-path', path);

  // Publiczne routy - dostępne bez logowania
  const publicRoutes = [
    "/auth",
    "/api/auth",
  ];

  // Sprawdź czy to publiczna ścieżka
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route));
  
  // Strona główna jest publiczna (tylko dokładnie "/")
  const isHomePage = path === "/";

  // Jeśli to publiczna ścieżka lub strona główna, pozwól przejść
  if (isPublicRoute || isHomePage) {
    response.headers.set('x-middleware-public', 'true');
    return response;
  }

  // Wszystkie inne ścieżki wymagają logowania
  // Użyj Edge-compatible auth do weryfikacji sesji (bez Prisma)
  // Sprawdzamy tylko obecność cookie sesji - pełna weryfikacja w API routes
  const cookieHeader = request.headers.get("cookie");
  
  // Debug: loguj dostępne cookie (tylko nazwy, nie wartości)
  if (cookieHeader) {
    const cookieNames = cookieHeader.split(";").map(c => c.trim().split("=")[0]);
    console.log('🍪 Available cookies:', cookieNames.join(", "));
  } else {
    console.log('🍪 No cookies found');
  }
  
  const hasSession = hasSessionCookie(cookieHeader);
  
  if (!hasSession) {
    console.log('❌ No session cookie found, redirecting to login');
    // Przekieruj do logowania
    if (path.startsWith("/api/")) {
      return NextResponse.json(
        { message: "Wymagane zalogowanie" },
        { status: 401 }
      );
    }

    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  console.log('✅ Session cookie found');
  response.headers.set('x-middleware-authenticated', 'true');
  return response;
}

export const config = {
  matcher: [
    "/letterSettings",
    "/letter",
    "/letter/:path*",
  ],
};

