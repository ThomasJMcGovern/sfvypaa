import type { Metadata, Viewport } from "next";
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

const themeInitScript = `try{if(localStorage.getItem("sfv-theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}`;

export const viewport: Viewport = {
  themeColor: "#F2EDE1",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://valleypaa.org"),
  title: "VALLEYPAA | Valley Young People in AA",
  description:
    "Sober fellowship, service, meetings, and premium young people events across the San Fernando Valley.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "VALLEYPAA",
    description: "Valley Young People in Alcoholics Anonymous.",
    type: "website",
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
      suppressHydrationWarning
    >
      <body className="grain-page flex min-h-full flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
      </body>
    </html>
  );
}
