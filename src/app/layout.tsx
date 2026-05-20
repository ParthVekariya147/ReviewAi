import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Reevo — Turn customer visits into authentic Google reviews",
    template: "%s | Reevo",
  },
  description:
    "The AI-powered QR funnel that helps local businesses convert real, happy customers into 5-star Google reviews — in under a minute, from any phone.",
  keywords: ["AI review generator", "Google reviews", "QR code reviews", "reputation management", "local business"],
  openGraph: {
    title: "Reevo — Turn customer visits into authentic Google reviews",
    description:
      "The AI-powered QR funnel that converts happy customers into 5-star Google reviews in under a minute.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800&family=Geist+Mono:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning className="antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
