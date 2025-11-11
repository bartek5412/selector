"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function HeaderCustom() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Strona główna" },
    { href: "/letter", label: "Litery" },
   //  { href: "/pylons", label: "Pylony" },
   //  { href: "/smartFrame", label: "Smart Frame" },
    //  { href: "/test-frame", label: "Test 3D" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-[#D1D5DB] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container flex h-14 items-center mx-auto">
        <div className="mr-4 flex">
          <Link href="/" className=" ml-8 mr-6 flex items-center space-x-2">
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
                  : "text-[#111827]/70"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
