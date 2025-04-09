// ./src/app/api/fetchsite/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { domain } = await req.json();

  if (!domain || !domain.trim()) {
    return NextResponse.json({ error: "Domain is required" }, { status: 400 });
  }

  try {
    // Try both HTTP and HTTPS
    let url = `https://${domain.trim().replace(/^https?:\/\//, "")}`;
    let response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      redirect: "follow", // Follow redirects
    });

    if (!response.ok) {
      // Fallback to HTTP if HTTPS fails
      url = `http://${domain.trim().replace(/^https?:\/\//, "")}`;
      response = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        redirect: "follow",
      });
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();

    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [];
    const metaDescriptionMatch =
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) || [];

    const metaTitle = (titleMatch[1] || "").trim() || `No title found for ${domain}`;
    const metaDescription =
      (metaDescriptionMatch[1] || "").trim() || `No description found for ${domain}`;
    const date = new Date().toLocaleDateString(); // Use current date

    const faviconUrl = await getFaviconUrl(domain);

    const data = {
      pageTitle: metaTitle,
      metaDescription: metaDescription,
      rating: 4.1,
      reviews: 974,
      date: date,
      characterCountTitle: metaTitle.length,
      characterCountDescription: metaDescription.length,
      faviconUrl: faviconUrl || `https://via.placeholder.com/16`,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json(
      {
        error: `Failed to fetch site data: ${(error as Error).message}`,
        details: (error as Error).stack,
      },
      { status: 500 }
    );
  }
}

async function getFaviconUrl(domain: string): Promise<string | null> {
  const baseUrl = `https://${domain.trim().replace(/^https?:\/\//, "")}`;
  const faviconPaths = [
    `${baseUrl}/favicon.ico`,
    `${baseUrl}/favicon.png`,
    `${baseUrl}/favicon.jpg`,
    `${baseUrl}/apple-touch-icon.png`,
  ];

  for (const url of faviconPaths) {
    try {
      const response = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
      });
      if (response.ok) return url;
    } catch {
      continue; // Removed unused 'err' parameter
    }
  }
  return null;
}