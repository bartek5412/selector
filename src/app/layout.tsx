import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import HeaderCustom from "@/components/ui/headerCustom";
import FontRegistry from "@/components/FontRegistry";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Selector Generator - Generator Liter 3D",
  description:
    "Profesjonalny generator liter 3D z zaawansowanymi opcjami personalizacji.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <FontRegistry />
          <HeaderCustom />
          {children}
        </Providers>
      </body>
    </html>
  );
}
