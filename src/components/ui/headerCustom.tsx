"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function HeaderCustom() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const navItems = [
    { href: "/", label: "Strona główna" },
    { href: "/letter/upload", label: "Litery" },
    { href: "/letterSettings", label: "Parametry konfiguracyjne" },
    { href: "/letter/configurations", label: "Konfiguracje liter" },
    //  { href: "/pylons", label: "Pylony" },
    //  { href: "/smartFrame", label: "Smart Frame" },
    //  { href: "/test-frame", label: "Test 3D" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-[#D1D5DB] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container flex h-14 items-center justify-between mx-auto">
        <div className="flex items-center">
          <div className="mr-4 flex">
            <Link href="/" className="ml-8 mr-6 flex items-center space-x-2">
              <span className="font-bold text-xl text-[#111827]">
                Selector Generator
              </span>
            </Link>
          </div>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "transition-colors hover:text-[#059669]",
                  pathname === item.href
                    ? "text-[#059669] font-semibold"
                    : "text-[#111827]/70",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4 mr-8">
          {status === "loading" ? (
            <span className="text-sm text-muted-foreground">Ładowanie...</span>
          ) : session ? (
            <>
              <span className="text-sm text-[#111827]/70">
                {session.user?.name || session.user?.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/auth/login" })}
              >
                Wyloguj
              </Button>
            </>
          ) : (
            <Link href="/auth/login">
              <Button variant="outline" size="sm">
                Zaloguj się
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
