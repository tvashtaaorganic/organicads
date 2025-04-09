import { NextRequest, NextResponse } from "next/server";
import fetch from "node-fetch";

export async function POST(request: NextRequest) {
  const { url } = await request.json();

  if (!url || !url.startsWith("http")) {
    return NextResponse.json(
      { error: "Please provide a valid URL starting with http/https" },
      { status: 400 }
    );
  }

  const urls = new Set<string>();
  const visited = new Set<string>();
  const baseUrl = new URL(url).origin;

  async function crawl(pageUrl: string, depth = 0): Promise<void> {
    if (depth > 5 || visited.has(pageUrl) || !pageUrl.startsWith(baseUrl)) return;

    visited.add(pageUrl);

    try {
      const res = await fetch(pageUrl, {
        headers: { "User-Agent": "SitemapBot/1.0" },
        // Vercel compatibility: Use signal for timeout instead of fetch's timeout
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) return;

      const html = await res.text();
      urls.add(pageUrl);

      const links = html.match(/href=["'](.*?)["']/g) || [];
      for (const link of links) { // Changed 'let' to 'const'
        const href = link.replace(/href=["'](.*?)["']/, "$1");
        let absoluteUrl: string;

        try {
          absoluteUrl = new URL(href, baseUrl).href;
        } catch {
          continue;
        }

        if (
          absoluteUrl.startsWith(baseUrl) &&
          !absoluteUrl.match(/^(tel:|mailto:)/) &&
          !absoluteUrl.match(/\.(pdf|jpg|png|gif|jpeg|css|js|ico|svg|woff|woff2|ttf|eot)$/i) &&
          !absoluteUrl.includes("#") &&
          !absoluteUrl.includes("login") &&
          !absoluteUrl.includes("logout")
        ) {
          await crawl(absoluteUrl, depth + 1);
        }
      }
    } catch (error) {
      console.log(`Skipped ${pageUrl}: ${(error as Error).message}`);
    }
  }

  try {
    await crawl(url);
    const urlArray = Array.from(urls);
    if (urlArray.length === 0) {
      return NextResponse.json({ error: "No valid URLs found" }, { status: 404 });
    }
    return NextResponse.json({ urls: urlArray });
  } catch {
    // Removed unused 'error' parameter
    return NextResponse.json({ error: "Server error while generating sitemap" }, { status: 500 });
  }
}