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
  title: {
    default: 'FATH — Algorithmic Trading System | MT5 Savdo Roboti',
    template: '%s | FATH Algorithmic Trading',
  },
  description:
    'FATH — Gann metodologiyasiga asoslangan avtomatlashtirilgan MT5 savdo roboti. 24/7 ishlaydi, Telegram nazorat, Recovery himoya. Litsenziya oling va bugun boshlang.',
  keywords: [
    'FATH', 'trading robot', 'MT5', 'MetaTrader 5', 'savdo roboti',
    'Gann', 'algorithmic trading', 'forex robot', 'avtomatik savdo',
    'XAUUSD', 'oltin savdo', 'expert advisor', 'EA',
  ],
  authors: [{ name: 'FATH Trading' }],
  creator: 'FATH Trading',
  metadataBase: new URL('https://fathrobot.uz'),
  openGraph: {
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'FATH Algorithmic Trading',
    title: 'FATH — Algorithmic Trading System | MT5 Savdo Roboti',
    description:
      'Gann strategiyasiga asoslangan algoritm. Hissiyotsiz, intizomli, 24/7 ishlaydigan savdo tizimi. Litsenziya oling va bugun boshlang.',
    images: [{ url: '/logos/logo2.png', width: 800, height: 800, alt: 'FATH Trading Robot' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FATH — MT5 Algorithmic Trading System',
    description: 'Gann strategiyasiga asoslangan avtomatlashtirilgan savdo roboti.',
    images: ['/logos/logo2.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  },
  icons: {
    icon: '/logos/fath-robot.png',
    apple: '/logos/fath-robot.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className={`h-full antialiased ${headingFont.variable} ${bodyFont.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'FATH Algorithmic Trading System',
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'MetaTrader 5',
              description:
                'Gann metodologiyasiga asoslangan avtomatlashtirilgan MT5 savdo roboti. 24/7 ishlaydigan professional trading tizimi.',
              offers: {
                '@type': 'Offer',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
              },
              creator: {
                '@type': 'Organization',
                name: 'FATH Trading',
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
