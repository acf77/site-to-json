import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { Header } from "@/components/Header";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-ibm-sans",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-ibm-mono",
});

export const metadata: Metadata = {
  title: "Site to JSON",
  description: "Convert any website URL into a structured JSON spec using json-render",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
      <body>
        <Header />
        <style>{`
          body { font-family: var(--font-ibm-sans), -apple-system, sans-serif; }
          button:hover:not(:disabled) { opacity: 0.85; }
          input:focus { outline: 2px solid #0f62fe !important; outline-offset: -2px; }
          .spinner {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255,255,255,0.3);
            border-top-color: #fff;
            border-radius: 50%;
            display: inline-block;
            animation: spin 0.7s linear infinite;
          }
        `}</style>
        {children}
      </body>
    </html>
  );
}
