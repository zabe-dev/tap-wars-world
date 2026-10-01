import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	metadataBase: new URL("https://tapwars.world"),
	title: { default: "Tap Wars World", template: "%s | Tap Wars World" },
	description: "Tap the world's button, see live country rankings, and help your country win the global tap battle.",
	applicationName: "Tap Wars World",
	keywords: ["world tap counter", "global rankings", "country competition", "tap game", "live country rankings"],
	category: "games",
	creator: "tapwars.world",
	robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
	alternates: { canonical: "/" },
	openGraph: {
		type: "website",
		url: "/",
		siteName: "Tap Wars World",
		locale: "en_US",
		title: "Tap Wars World | Live Global Tap Counter",
		description: "Tap the world's button, see live country rankings, and help your country win the global tap battle.",
		images: [{ url: "/logo-1200x630.png", width: 1200, height: 630, alt: "Tap Wars World" }],
	},
	twitter: {
		card: "summary_large_image",
		title: "Tap Wars World | Live Global Tap Counter",
		description: "Tap the world's button, see live country rankings, and help your country win the global tap battle.",
		images: ["/logo-1200x630.png"],
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
      <body>{children}</body>
    </html>
  );
}
