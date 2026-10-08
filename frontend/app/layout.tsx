import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
