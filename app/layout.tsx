import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "./_components/site-footer";

export const metadata: Metadata = {
  title: "tapwars.world",
  description: "One tap from every corner of the world.",
};

const themeBootstrap = `(() => {
  try {
    const saved = localStorage.getItem("wc-theme");
    const dark = saved === "dark" || (saved !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  } catch {}
})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeBootstrap }} /></head>
      <body>{children}<SiteFooter /></body>
    </html>
  );
}
