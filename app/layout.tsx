import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "World Counter",
  description: "One tap from every corner of the world.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
