import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "B's Bastard Beats",
  description: "Professional AI music creation studio",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
