import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "./_components/site-footer";
import { SiteControls, SiteControlsProvider } from "./_components/site-controls";

export const metadata: Metadata = {
	metadataBase: new URL("https://tapwars.world"),
	title: "Tap Wars World",
	description: "Tap around the world, climb global rankings, and help your country win battles. The perfect button for bored fingers and friendly global competition!",
	openGraph: {
		type: "website",
		url: "https://tapwars.world/",
		title: "Tap Wars World",
		description: "Tap around the world, climb global rankings, and help your country win battles. The perfect button for bored fingers and friendly global competition!",
		images: [{ url: "/logo-256x256.png", width: 256, height: 256, alt: "Tap Wars World" }],
	},
	twitter: {
		card: "summary",
		title: "Tap Wars World",
		description: "Tap around the world, climb global rankings, and help your country win battles. The perfect button for bored fingers and friendly global competition!",
		images: ["/logo-256x256.png"],
	},
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
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        <link rel="apple-touch-icon" sizes="57x57" href="/apple-icon-57x57.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/apple-icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/apple-icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/apple-icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/apple-icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/apple-icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon-180x180.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="256x256" href="/logo-256x256.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body><SiteControlsProvider><SiteControls />{children}</SiteControlsProvider><SiteFooter /></body>
    </html>
  );
}
