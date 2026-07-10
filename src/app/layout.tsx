import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InvestAI – AI-Powered Investment Research Agent",
  description:
    "Research any company with AI. Get in-depth financial analysis, news sentiment, and an Invest or Pass decision powered by LangGraph.",
  keywords: ["investment research", "AI", "financial analysis", "stock analysis"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
