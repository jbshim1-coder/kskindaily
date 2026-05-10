// 블로그 상세 페이지
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const siteId = process.env.SITE_ID || "kskindaily";
const siteName = process.env.SITE_NAME || "K Blog";
const siteDomain = process.env.SITE_DOMAIN || "";
const siteColor = process.env.SITE_COLOR || "#0071e3";
const kbbgUrl = process.env.KBBG_URL || "https://kbeautybuyersguide.com";
const KMEDI_CHANNEL_ID = "UCpre0SxB5ElWp-LFMIqv_mw";

async function getMatchingVideo(postTitle: string, postCategory: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${KMEDI_CHANNEL_ID}`,
      { next: { revalidate: 3600 } }
    );
    const xml = await res.text();
    const entries = [...xml.matchAll(/<yt:videoId>(.*?)<\/yt:videoId>[\s\S]*?<media:title>(.*?)<\/media:title>/g)];
    if (!entries.length) return null;
    const keywords = [...postTitle.toLowerCase().split(/\s+/), postCategory.toLowerCase()];
    let best = { videoId: entries[0][1], score: 0 };
    for (const [, videoId, videoTitle] of entries) {
      const score = keywords.filter(kw => kw.length > 3 && videoTitle.toLowerCase().includes(kw)).length;
      if (score > best.score) best = { videoId, score };
    }
    return best.videoId;
  } catch {
    return null;
  }
}

interface Post {
  slug: string;
  title_en: string;
  content_en: string;
  excerpt_en: string | null;
  image_url: string | null;
  image_alt: string | null;
  category: string;
  hashtags: string[];
  published_at: string;
  updated_at: string;
}

async function getPost(slug: string): Promise<Post | null> {
  const { data } = await supabase
    .from("blog_posts")
    .select("slug, title_en, content_en, excerpt_en, image_url, image_alt, category, hashtags, published_at, updated_at")
    .eq("slug", slug)
    .eq("is_published", true)
    .eq("site", siteId)
    .single();
  return data;
}

async function getRelatedPosts(category: string, currentSlug: string) {
  const { data } = await supabase
    .from("blog_posts")
    .select("slug, title_en, image_url, published_at")
    .eq("is_published", true)
    .eq("site", siteId)
    .eq("category", category)
    .neq("slug", currentSlug)
    .order("published_at", { ascending: false })
    .limit(4);
  return data || [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  return {
    title: post.title_en,
    description: post.excerpt_en || post.title_en,
    openGraph: {
      title: post.title_en,
      description: post.excerpt_en || post.title_en,
      url: `${siteDomain}/${slug}`,
      type: "article",
      ...(post.image_url ? { images: [{ url: post.image_url }] } : {}),
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const [related, videoId] = await Promise.all([
    getRelatedPosts(post.category, slug),
    getMatchingVideo(post.title_en, post.category),
  ]);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title_en,
    description: post.excerpt_en || post.title_en,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { "@type": "Organization", name: siteName, url: siteDomain },
    ...(post.image_url ? { image: post.image_url } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <article className="mx-auto max-w-2xl px-4 py-10">
        {/* 브레드크럼 */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-gray-600">Home</Link>
          <span>/</span>
          <span className="text-gray-600">{post.category}</span>
        </nav>

        {/* 카테고리 + 제목 */}
        <span
          className="inline-block px-3 py-1 text-xs font-medium rounded-full text-white mb-3"
          style={{ backgroundColor: siteColor }}
        >
          {post.category}
        </span>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{post.title_en}</h1>
        <p className="text-xs text-gray-400 mb-8">
          {new Date(post.published_at).toLocaleDateString("en-US", {
            year: "numeric", month: "long", day: "numeric",
          })}
        </p>

        {/* 대표 이미지 */}
        {post.image_url && (
          <div className="rounded-2xl overflow-hidden mb-8 bg-gray-100">
            <img
              src={post.image_url}
              alt={post.image_alt || post.title_en}
              className="w-full h-auto max-h-[400px] object-cover"
            />
          </div>
        )}

        {/* 본문 */}
        <div
          className="prose prose-sm prose-gray max-w-none
            prose-headings:font-bold prose-headings:text-gray-900
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
            prose-a:text-blue-600 prose-img:rounded-xl prose-img:my-6
            prose-li:text-gray-700 prose-strong:text-gray-900
            prose-h2:mt-10 prose-h2:mb-4 prose-h3:mt-6 prose-h3:mb-3
            prose-hr:my-8"
          dangerouslySetInnerHTML={{ __html: post.content_en }}
        />

        {/* K-MEDI TV 유튜브 쇼츠 */}
        {videoId && (
          <div className="mt-10 text-center">
            <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide">Watch on K-MEDI TV</p>
            <div className="mx-auto rounded-2xl overflow-hidden bg-black" style={{ maxWidth: 320, aspectRatio: "9/16" }}>
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
                className="w-full h-full"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* 해시태그 */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-100">
            {post.hashtags.map((tag: string) => (
              <span key={tag} className="text-xs" style={{ color: siteColor }}>{tag}</span>
            ))}
          </div>
        )}

        {/* KBBG CTA */}
        <div className="mt-10 rounded-2xl p-6 text-white text-center" style={{ background: `linear-gradient(135deg, ${siteColor}, #1a1a2e)` }}>
          <h2 className="text-lg font-bold mb-2">Find Your Perfect Korean Clinic</h2>
          <p className="text-xs text-white/70 mb-4">
            Get personalized AI recommendations from verified government data
          </p>
          <a
            href={`${kbbgUrl}/en/ai-search`}
            target="_blank"
            rel="noopener"
            className="inline-block px-6 py-3 bg-white text-gray-900 text-sm font-semibold rounded-full hover:bg-gray-100 transition-colors"
          >
            Try KBBG AI Search →
          </a>
        </div>

        {/* 관련 글 */}
        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="text-base font-bold text-gray-900 mb-4">Related Articles</h2>
            <div className="grid grid-cols-2 gap-3">
              {related.map((rp) => (
                <Link
                  key={rp.slug}
                  href={`/${rp.slug}`}
                  className="p-3 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow"
                >
                  {rp.image_url && (
                    <img src={rp.image_url} alt="" className="w-full h-20 object-cover rounded-lg mb-2" loading="lazy" />
                  )}
                  <p className="text-xs font-medium text-gray-700 line-clamp-2">{rp.title_en}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </>
  );
}
