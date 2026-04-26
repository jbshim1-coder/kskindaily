import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const siteDomain = process.env.SITE_DOMAIN || "https://example.com";
const siteId = process.env.SITE_ID || "kskindaily";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data } = await supabase
    .from("blog_posts")
    .select("slug, published_at")
    .eq("is_published", true)
    .eq("site", siteId)
    .order("published_at", { ascending: false });

  const posts = (data || []).map((p: { slug: string; published_at: string }) => ({
    url: `${siteDomain}/${p.slug}`,
    lastModified: new Date(p.published_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    { url: siteDomain, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    ...posts,
  ];
}
