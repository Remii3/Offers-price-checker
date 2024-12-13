import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ContextProviderWrapper from "@/context/ContextProviderWrapper";
import HeaderContent from "@/components/layout/headerContent";

const rubik = localFont({
  src: "./fonts/Rubik-VariableFont_wght.ttf",
  variable: "--font-rubik",
  weight: "100 300 400 500 900",
});

export const metadata: Metadata = {
  title: "Offer price checker",
  description:
    "This is a simple application that allows you to check the price of a given offer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${rubik.variable} antialiased grid grid-rows-[64px_1fr_64px] min-h-screen`}
      >
        <ContextProviderWrapper>
          <header className="h-16 flex items-center px-4 shadow-sm w-full justify-between">
            <HeaderContent />
          </header>
          <main>{children}</main>
          <footer className="h-16 flex items-center justify-center border-t border-input">
            <span className="text-sm text-gray-600">
              Created by Remigiusz Woźniak
            </span>
          </footer>
        </ContextProviderWrapper>
      </body>
    </html>
  );
}
