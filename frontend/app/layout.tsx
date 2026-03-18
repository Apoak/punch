import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Punch - Shift Scheduler",
  description: "AI-powered employee shift scheduling",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
