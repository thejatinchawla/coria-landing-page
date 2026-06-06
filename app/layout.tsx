import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://coria-landing-page.vercel.app";
const title = "Coria: Agents that act with your team's permission";
const description =
  "AI-native team workspace with channels, multi-agent @mentions, human-in-the-loop approvals, workspace memory, and audit. Open source.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  // opengraph-image.png / twitter-image.png in app/ are picked up automatically
  // and resolved to absolute URLs via metadataBase.
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Coria",
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
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
      className={`${inter.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
