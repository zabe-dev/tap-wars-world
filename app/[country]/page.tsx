import { Counter } from "../_components/counter";
import { SiteFrame } from "../_components/site-frame";
import { notFound } from "next/navigation";

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
const COUNTRY_CODES = Array.from({ length: 26 }, (_, first) => Array.from({ length: 26 }, (_, second) => `${String.fromCharCode(65 + first)}${String.fromCharCode(65 + second)}`)).flat();

export function generateStaticParams() {
	return COUNTRY_CODES.filter((code) => regionNames.of(code) && regionNames.of(code) !== code).map((country) => ({ country: country.toLowerCase() }));
}

export default async function CountryPage({ params }: { params: Promise<{ country: string }> }) {
	const country = (await params).country.toLowerCase();
	if (!/^[a-z]{2}$/.test(country) || !regionNames.of(country.toUpperCase()) || regionNames.of(country.toUpperCase()) === country.toUpperCase()) notFound();
	return <SiteFrame><Counter scope={country.toUpperCase()} /></SiteFrame>;
}
