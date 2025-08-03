import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bitcoin Post-Reward Network Simulator",
  description:
    "Simulate Bitcoin network dynamics after block rewards end. Advanced economic modeling by Fabio Balielo.",
  keywords: [
    "Bitcoin",
    "blockchain",
    "economics",
    "mining",
    "fees",
    "simulation",
    "cryptocurrency",
  ],
  authors: [{ name: "Fabio Balielo" }],
  creator: "Fabio Balielo",
  publisher: "Fabio Balielo",
  viewport:
    "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  openGraph: {
    title: "Bitcoin Post-Reward Network Simulator",
    description:
      "Advanced economic modeling of Bitcoin network dynamics after block rewards end",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bitcoin Post-Reward Network Simulator",
    description: "Advanced economic modeling by Fabio Balielo",
    creator: "@fabio_balielo",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} touch-manipulation`}>
        {children}
      </body>
    </html>
  );
}
