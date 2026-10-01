import { notFound } from "next/navigation";
import { Counter } from "../_components/counter";

const COUNTRIES = new Set(["ph", "us"]);

export default async function CountryPage({ params }: { params: Promise<{ country: string }> }) {
	const country = (await params).country.toLowerCase();
	if (!COUNTRIES.has(country)) notFound();
	return <Counter scope={country.toUpperCase()} />;
}
