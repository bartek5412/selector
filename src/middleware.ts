import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

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
  // Użyj auth() z NextAuth do weryfikacji sesji
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      console.log('❌ No valid session found, redirecting to login');
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

    console.log('✅ Valid session found for user:', session.user.email);
    response.headers.set('x-middleware-authenticated', 'true');
    return response;
  } catch (error) {
    console.error('❌ Error checking session:', error);
    // W przypadku błędu, przekieruj do logowania
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
}

export const config = {
  matcher: [
    "/letterSettings",
    "/letter",
    "/letter/:path*",
  ],
};

