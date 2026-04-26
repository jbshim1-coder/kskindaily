import type { MetadataRoute } from "next";

const siteDomain = process.env.SITE_DOMAIN || "https://example.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
    ],
    sitemap: `${siteDomain}/sitemap.xml`,
  };
}
