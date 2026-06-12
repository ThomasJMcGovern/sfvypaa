import type { Metadata } from "next";
import {
  Anton,
  JetBrains_Mono,
  Permanent_Marker,
  Public_Sans,
} from "next/font/google";
import "./globals.css";

const anton = Anton({
  weight: "400",
  variable: "--font-anton",
  subsets: ["latin"],
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

const permanentMarker = Permanent_Marker({
  weight: "400",
  variable: "--font-marker",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SFVYPAA Admin",
  description: "Publishing portal for SFVYPAA events and newsletters.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${publicSans.variable} ${permanentMarker.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="grain-page min-h-full bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
