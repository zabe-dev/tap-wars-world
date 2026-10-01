import { Counter } from "../_components/counter";

export default async function CountryPage({ params }: { params: Promise<{ country: string }> }) {
	const country = (await params).country.toLowerCase();
	if (!/^[a-z]{2}$/.test(country)) return null;
	return <Counter scope={country.toUpperCase()} />;
}
