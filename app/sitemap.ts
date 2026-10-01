import type { MetadataRoute } from "next";

const baseUrl = "https://tapwars.world";

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{ url: baseUrl, priority: 1, changeFrequency: "hourly" },
		{ url: `${baseUrl}/milestones`, priority: 0.7, changeFrequency: "daily" },
		{ url: `${baseUrl}/privacy`, priority: 0.2, changeFrequency: "yearly" },
		{ url: `${baseUrl}/terms`, priority: 0.2, changeFrequency: "yearly" },
	];
}
