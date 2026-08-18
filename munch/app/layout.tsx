import type { Metadata } from "next";
import { Baloo_2, Manrope } from "next/font/google";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const logoFont = Baloo_2({
  variable: "--font-logo",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Munch",
  description: "Munch - find anyone, instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${logoFont.variable} h-full antialiased`}>
      <body className="min-h-full bg-white text-slate-900">
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
