import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Header } from "@/components/Header";
import "../globals.css";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages = await getMessages({ locale });
  const t = (messages as Record<string, unknown>).metadata as Record<string, string>;

  return {
    title: t.title,
    description: t.description,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} className={`${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages}>
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
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
