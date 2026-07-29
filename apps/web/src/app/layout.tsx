import type { Metadata, Viewport } from "next";
import {
  Anton,
  JetBrains_Mono,
  Permanent_Marker,
  Public_Sans,
} from "next/font/google";
import "./globals.css";

import { JsonLd } from "@/components/json-ld";
import { baseOpenGraph, siteUrl } from "@/lib/seo";
import { organizationJsonLd, websiteJsonLd } from "@/lib/structured-data";

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
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "VALLEYPAA — Sober Events & Young People in AA | San Fernando Valley, Los Angeles",
    template: "%s | VALLEYPAA",
  },
  description:
    "VALLEYPAA is a young people in Alcoholics Anonymous committee in the San Fernando Valley, Los Angeles. Sober events, AA meetings, and service — free, and open to anyone who wants to stop drinking.",
  // No `alternates` here on purpose. Metadata merges shallowly, so a canonical
  // set at the root leaks to every child that doesn't declare its own — which
  // previously pointed all five pages at the homepage. Each page sets its own.
  openGraph: {
    ...baseOpenGraph,
    title: "VALLEYPAA",
    description:
      "Valley Young People in Alcoholics Anonymous — sober events and service in the San Fernando Valley, Los Angeles.",
    url: "/",
    images: [
      {
        url: "/sfv-sunset.jpg",
        width: 1920,
        height: 1056,
        alt: "The San Fernando Valley at sunset",
      },
    ],
  },
  // Bing Webmaster Tools site ownership. Must stay in place — removing it
  // un-verifies the property. Bing matters more than Google for this site's
  // goal: it backs ChatGPT's search layer.
  verification: {
    other: {
      "msvalidate.01": "DFF284D67F2ED8A6DA804DA56B4F4A3F",
    },
  },
  twitter: {
    card: "summary_large_image",
    title: "VALLEYPAA",
    description:
      "Sober events and service for young people in AA — San Fernando Valley, Los Angeles.",
    images: ["/sfv-sunset.jpg"],
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
        {/* Sitewide so every URL carries the entity anchor — retrieval
            pipelines often see a single page, not a whole crawl graph. */}
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        {children}
      </body>
    </html>
  );
}
