import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const siteName = process.env.SITE_NAME || "K Blog";
const siteDomain = process.env.SITE_DOMAIN || "https://example.com";
const siteDesc = process.env.SITE_DESCRIPTION || "Korean beauty and culture blog";
const siteColor = process.env.SITE_COLOR || "#0071e3";
const kbbgUrl = process.env.KBBG_URL || "https://kbeautybuyersguide.com";

export const metadata: Metadata = {
  title: { default: siteName, template: `%s — ${siteName}` },
  description: siteDesc,
  openGraph: { siteName, type: "website", url: siteDomain },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen flex flex-col bg-white text-gray-900">
        {/* 헤더 */}
        <header className="border-b border-gray-100 px-4 py-4">
          <div className="mx-auto max-w-3xl flex items-center justify-between">
            <Link href="/" className="text-lg font-bold" style={{ color: siteColor }}>
              {siteName}
            </Link>
            <a
              href={kbbgUrl}
              target="_blank"
              rel="noopener"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Find Clinics →
            </a>
          </div>
        </header>

        {/* 본문 */}
        <main className="flex-1">{children}</main>

        {/* 푸터 */}
        <footer className="border-t border-gray-100 px-4 py-8 mt-12">
          <div className="mx-auto max-w-3xl text-center space-y-3">
            <p className="text-xs text-gray-400">
              Looking for Korean beauty clinics?{" "}
              <a href={kbbgUrl} target="_blank" rel="noopener" className="underline hover:text-gray-600">
                Get AI-powered clinic recommendations at KBBG
              </a>
            </p>
            <p className="text-xs text-gray-300">
              © {new Date().getFullYear()} {siteName}. This content was created with the assistance of AI.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
