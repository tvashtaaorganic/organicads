// app/api/generate-sitemap/route.js
import { NextResponse } from "next/server";
import fetch from "node-fetch";

export async function POST(request) {
  const { url } = await request.json();

  if (!url || !url.startsWith("http")) {
    return NextResponse.json({ error: "Please provide a valid URL starting with http/https" }, { status: 400 });
  }

  const urls = new Set();
  const visited = new Set();
  const baseUrl = new URL(url).origin;

  async function crawl(pageUrl, depth = 0) {
    if (depth > 5 || visited.has(pageUrl) || !pageUrl.startsWith(baseUrl)) return;

    visited.add(pageUrl);

    try {
      const res = await fetch(pageUrl, {
        headers: { "User-Agent": "SitemapBot/1.0" },
        timeout: 5000,
      });

      if (!res.ok) return;

      const html = await res.text();
      urls.add(pageUrl);

      const links = html.match(/href=["'](.*?)["']/g) || [];
      for (let link of links) {
        const href = link.replace(/href=["'](.*?)["']/, "$1");
        let absoluteUrl;

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
      console.log(`Skipped ${pageUrl}: ${error.message}`);
    }
  }

  try {
    await crawl(url);
    const urlArray = Array.from(urls);
    if (urlArray.length === 0) {
      return NextResponse.json({ error: "No valid URLs found" }, { status: 404 });
    }
    return NextResponse.json({ urls: urlArray });
  } catch (error) {
    return NextResponse.json({ error: "Server error while generating sitemap" }, { status: 500 });
  }
}