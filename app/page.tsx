// 블로그 홈 — 최신 글 목록
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const siteId = process.env.SITE_ID || "kskindaily";
const siteName = process.env.SITE_NAME || "K Blog";
const siteDesc = process.env.SITE_DESCRIPTION || "";
const siteColor = process.env.SITE_COLOR || "#0071e3";

interface Post {
  slug: string;
  title_en: string;
  excerpt_en: string | null;
  image_url: string | null;
  category: string;
  published_at: string;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = parseInt(page || "1");
  const perPage = 12;

  const { data } = await supabase
    .from("blog_posts")
    .select("slug, title_en, excerpt_en, image_url, category, published_at")
    .eq("is_published", true)
    .eq("site", siteId)
    .order("published_at", { ascending: false })
    .range((currentPage - 1) * perPage, currentPage * perPage - 1);

  const posts: Post[] = data || [];

  return (
    <div className="mx-auto max-w-3xl px-4">
      <section className="py-12 text-center">
        <h1 className="text-3xl font-bold mb-2" style={{ color: siteColor }}>
          {siteName}
        </h1>
        <p className="text-sm text-gray-500">{siteDesc}</p>
      </section>

      {posts.length > 0 ? (
        <div className="grid gap-6 pb-12">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/${post.slug}`}
              className="group flex gap-4 p-4 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow"
            >
              {post.image_url && (
                <div className="shrink-0 w-28 h-28 rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={post.image_url}
                    alt={post.title_en}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span
                  className="inline-block px-2 py-0.5 text-xs font-medium rounded-full text-white mb-2"
                  style={{ backgroundColor: siteColor }}
                >
                  {post.category}
                </span>
                <h2 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:underline">
                  {post.title_en}
                </h2>
                {post.excerpt_en && (
                  <p className="text-xs text-gray-500 line-clamp-2">{post.excerpt_en}</p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(post.published_at).toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric",
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-gray-400">Coming soon — new articles every day!</p>
        </div>
      )}

      {posts.length >= perPage && (
        <div className="flex justify-center gap-3 pb-12">
          {currentPage > 1 && (
            <Link
              href={`/?page=${currentPage - 1}`}
              className="px-4 py-2 border border-gray-200 rounded-full text-xs hover:bg-gray-50"
            >
              Prev
            </Link>
          )}
          <Link
            href={`/?page=${currentPage + 1}`}
            className="px-4 py-2 text-white rounded-full text-xs"
            style={{ backgroundColor: siteColor }}
          >
            Next
          </Link>
        </div>
      )}
    </div>
  );
}
