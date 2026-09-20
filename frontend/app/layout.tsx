import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BodyCurve Analyzer — AI/ML Body Proportions & Wellness Insights",
  description:
    "An AI/ML-assisted web platform for analyzing body measurements, understanding anatomical proportions, and receiving personalized fitness and style guidance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
