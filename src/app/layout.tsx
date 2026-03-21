import type { Metadata } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const bodyFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FATH ROBOT - MT5 Savdo Platformasi",
  description: "FATH ROBOT litsenziyalari, tariflar, versiyalar, statistika va yuridik shartnoma boshqaruvi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className={`h-full antialiased ${headingFont.variable} ${bodyFont.variable}`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
