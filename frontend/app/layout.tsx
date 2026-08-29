import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import CookieBanner from "./components/CookieBanner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#17211f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://ccrsk.vercel.app"),

  title: {
    default: "CCR | Zero-PII Indian Credit Card Recommender",
    template: "%s | CCR",
  },
  description:
    "Find the top Indian credit card that maximizes your annual rewards and cashbacks based on your actual monthly spending — 100% anonymous, zero personal data required.",
  keywords: [
    "credit card recommender",
    "best credit cards India",
    "credit card reward calculator",
    "HDFC credit cards",
    "Axis credit cards",
    "SBI credit cards",
    "ICICI credit cards",
    "cashback credit card India",
    "zero PII financial tool",
  ],
  authors: [{ name: "CCR Team" }],
  creator: "CCR",
  publisher: "CCR",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "CCR - Indian Credit Card Recommender",
    title: "Find Your Best Credit Card in India | Anonymous & Zero-PII",
    description:
      "Calculate your net annual rewards after fees across top Indian credit cards. No email, phone, or bank details needed.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CCR - Indian Credit Card Recommender Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CCR | Zero-PII Indian Credit Card Recommender",
    description:
      "Find the Indian credit card that pays you back, without sharing personal data.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
