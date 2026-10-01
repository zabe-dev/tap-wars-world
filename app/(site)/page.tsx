import { Counter } from "../_components/counter";

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Tap Wars World",
    url: "https://tapwars.world/",
    description: "A live global tap counter with country rankings and friendly tap battles.",
    applicationCategory: "GameApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><Counter /></>;
}
