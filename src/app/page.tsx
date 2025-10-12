"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-[#E5E7EB] via-white to-[#F9FAFB] min-h-[calc(100vh-57px)]">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#059669]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-60 -left-40 w-96 h-96 bg-[#D97706]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-[#059669]/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 lg:px-12 py-8 overflow-y-auto">
        {/* Hero section */}
        <div className="text-center max-w-4xl mx-auto space-y-3 md:space-y-4 lg:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {/* Main heading */}
          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#111827] leading-tight">
            Twórz niesamowite
            <span className="block bg-gradient-to-r from-[#059669] to-[#D97706] bg-clip-text text-transparent">
              oferty 3D
            </span>
            w kilka sekund
          </h1>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
            <Link href="/letter">
              <Button className="text-base md:text-lg px-6 py-5 md:px-8 md:py-6 bg-[#059669] hover:bg-[#048557] shadow-lg shadow-[#059669]/20 transition-all hover:scale-105">
                Rozpocznij teraz
                <svg
                  className="w-4 h-4 md:w-5 md:h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Button>
            </Link>
            <Button
              variant="outline"
              className="text-base md:text-lg px-6 py-5 md:px-8 md:py-6 border-2 border-[#111827]/20 hover:border-[#ffffff] hover:text-[#ffffff] transition-all"
            >
              Zobacz przykłady
            </Button>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 md:mt-12 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <Card className="relative overflow-hidden p-3 md:p-4 bg-white/80 backdrop-blur-sm border-[#D1D5DB] hover:shadow-xl hover:shadow-[#059669]/10 transition-all hover:scale-105 hover:border-[#059669]/50 group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-[#059669]/0 to-[#059669]/0 group-hover:from-[#059669]/5 group-hover:to-transparent transition-all duration-300"></div>
            <div className="relative w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-[#059669] to-[#048557] rounded-lg flex items-center justify-center mb-2 md:mb-3 group-hover:rotate-6 transition-transform shadow-lg shadow-[#059669]/20">
              <svg
                className="w-4 h-4 md:w-5 md:h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                />
              </svg>
            </div>
            <h3 className="relative text-base md:text-lg font-semibold text-[#111827] mb-1 md:mb-2 group-hover:text-[#059669] transition-colors">
              Pełna Personalizacja
            </h3>
            <p className="relative text-xs md:text-sm text-[#111827]/70">
              Kontroluj każdy aspekt - od kolorów po głębokość i efekty świetlne
            </p>
          </Card>

          <Card className="relative overflow-hidden p-4 md:p-6 bg-white/80 backdrop-blur-sm border-[#D1D5DB] hover:shadow-xl hover:shadow-[#D97706]/10 transition-all hover:scale-105 hover:border-[#D97706]/50 group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-[#D97706]/0 to-[#D97706]/0 group-hover:from-[#D97706]/5 group-hover:to-transparent transition-all duration-300"></div>
            <div className="relative w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#D97706] to-[#B45309] rounded-lg flex items-center justify-center mb-3 md:mb-4 group-hover:rotate-6 transition-transform shadow-lg shadow-[#D97706]/20">
              <svg
                className="w-4 h-4 md:w-5 md:h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="relative text-lg md:text-xl font-semibold text-[#111827] mb-1.5 md:mb-2 group-hover:text-[#D97706] transition-colors">
              Szybki i Wydajny
            </h3>
            <p className="relative text-xs md:text-sm text-[#111827]/70">
              Renderowanie w czasie rzeczywistym dzięki nowoczesnej technologii
              WebGL
            </p>
          </Card>

          <Card className="relative overflow-hidden p-3 md:p-4 bg-white/80 backdrop-blur-sm border-[#D1D5DB] hover:shadow-xl hover:shadow-[#059669]/10 transition-all hover:scale-105 hover:border-[#059669]/50 group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-[#059669]/0 to-[#059669]/0 group-hover:from-[#059669]/5 group-hover:to-transparent transition-all duration-300"></div>
            <div className="relative w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#059669] to-[#10B981] rounded-lg flex items-center justify-center mb-3 md:mb-4 group-hover:rotate-6 transition-transform shadow-lg shadow-[#059669]/20">
              <svg
                className="w-4 h-4 md:w-5 md:h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="relative text-base md:text-lg font-semibold text-[#111827] mb-1 md:mb-2 group-hover:text-[#059669] transition-colors">
              Export Gotowy
            </h3>
            <p className="relative text-xs md:text-sm text-[#111827]/70">
              Pobieraj projekty w wysokiej jakości do dalszego wykorzystania
            </p>
          </Card>
        </div>
      </div>

      {/* Floating elements decoration - hidden on mobile */}
      <div className="hidden xl:block absolute bottom-20 left-10 w-12 h-12 border-2 border-[#059669]/15 rounded-lg rotate-12 animate-bounce"></div>
      <div className="hidden xl:block absolute top-32 right-10 w-10 h-10 border-2 border-[#D97706]/15 rounded-full animate-ping"></div>
    </main>
  );
}
