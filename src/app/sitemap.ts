import type { MetadataRoute } from "next";
import { getPublishedIssues } from "@/lib/data/issues";
import { getPublishedNews } from "@/lib/data/news";

const BASE_URL = "https://www.morphoseeditions.fr";

// Le sitemap interroge Firestore : il doit être recalculé à chaque requête.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/catalogue`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/lecture`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/actu`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/a-propos`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/soutenir`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/libraires`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/cgv`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/confidentialite`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/mentions-legales`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const [issues, news] = await Promise.all([
    getPublishedIssues().catch(() => []),
    getPublishedNews().catch(() => []),
  ]);

  const issueRoutes: MetadataRoute.Sitemap = issues.flatMap((issue) => [
    {
      url: `${BASE_URL}/catalogue/${issue.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/lecture/${issue.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ]);

  const newsRoutes: MetadataRoute.Sitemap = news.map((post) => ({
    url: `${BASE_URL}/actu/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "yearly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...issueRoutes, ...newsRoutes];
}
