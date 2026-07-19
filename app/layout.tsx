import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VoiceSiriAssistant from "@/components/VoiceSiriAssistant";

export const metadata: Metadata = {
  title: {
    default: "Nivaas — Homes you can walk through before you visit",
    template: "%s — Nivaas",
  },
  description:
    "Curated homes across Dhaka with full room-by-room walkthroughs: living, dining, kitchen, bedrooms, washrooms, balconies and pools — see everything before the first visit.",
  keywords: [
    "Dhaka real estate",
    "homes for sale Dhaka",
    "property walkthrough",
    "Nivaas",
    "Gulshan apartments",
  ],
};

export const viewport: Viewport = {
  themeColor: "#0A1210",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600&family=Manrope:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        <Navbar />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
        <VoiceSiriAssistant />
      </body>
    </html>
  );
}
