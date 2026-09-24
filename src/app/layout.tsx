import type { Metadata, Viewport } from "next";
import { Great_Vibes, Manrope } from "next/font/google";
import { content } from "@/content";
import "./globals.css";

const script = Great_Vibes({
  variable: "--font-script",
  weight: "400",
  subsets: ["latin"],
});

const sans = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${content.name} — Portfolio`,
  description: content.tagline,
};

export const viewport: Viewport = {
  themeColor: "#e02b0c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${script.variable} ${sans.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
