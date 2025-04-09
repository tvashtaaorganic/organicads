import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

// Interface for meta tag data
interface MetaTag {
  name: string;
  content: string;
  usedByGoogle: string;
  usedByBing: string;
}

// In-memory counters (will reset on server restart)
let counters = {
  activeUsers: 0, // Number of users currently testing
  totalTests: 0, // Total number of tests performed
  uniqueUrls: new Set<string>(), // Set of unique URLs tested
};

// Logic to determine if a meta tag is used by Google or Bing
const determineUsage = (name: string, content: string): { usedByGoogle: string; usedByBing: string } => {
  const usedByGoogleTags = [
    "title",
    "description",
    "viewport",
    "robots",
    "google-site-verification",
  ];
  const usedByBingTags = [
    "title",
    "description",
    "viewport",
    "robots",
    "keywords",
    "msnbot",
  ];

  return {
    usedByGoogle: usedByGoogleTags.includes(name.toLowerCase()) ? "Yes" : "No",
    usedByBing: usedByBingTags.includes(name.toLowerCase()) ? "Yes" : "No",
  };
};

// GET: Return the current counter data
export async function GET() {
  return NextResponse.json({
    activeUsers: counters.activeUsers,
    totalTests: counters.totalTests,
    uniqueUrls: counters.uniqueUrls.size,
  });
}

// POST: Extract meta tags and update counters
export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || !url.startsWith("http")) {
      return NextResponse.json({ error: "Please provide a valid URL starting with http or https." }, { status: 400 });
    }

    // Increment active users
    counters.activeUsers += 1;

    // Fetch the webpage
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Extract meta tags
    const metaTags: MetaTag[] = [];
    const titleTag = $("title").text();
    if (titleTag) {
      const usage = determineUsage("title", titleTag);
      metaTags.push({
        name: "title",
        content: titleTag,
        usedByGoogle: usage.usedByGoogle,
        usedByBing: usage.usedByBing,
      });
    }

    $("meta").each((_, element) => {
      const name = $(element).attr("name") || $(element).attr("property") || $(element).attr("charset") || "unknown";
      const content = $(element).attr("content") || $(element).attr("charset") || "";
      if (name && content) {
        const usage = determineUsage(name, content);
        metaTags.push({
          name,
          content,
          usedByGoogle: usage.usedByGoogle,
          usedByBing: usage.usedByBing,
        });
      }
    });

    // Update counters
    counters.totalTests += 1;
    counters.uniqueUrls.add(url);
    counters.activeUsers -= 1; // Decrement active users after the request is complete

    return NextResponse.json({ metaTags }, { status: 200 });
  } catch (error) {
    console.error("Error extracting meta tags:", error);
    counters.activeUsers -= 1; // Ensure active users is decremented even on error
    return NextResponse.json({ error: "Failed to extract meta tags. The website may not be accessible or has restricted access." }, { status: 500 });
  }
}