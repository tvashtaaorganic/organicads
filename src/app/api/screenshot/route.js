import puppeteer from "puppeteer";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const isMobile = searchParams.get("isMobile") === "true";

  if (!url) {
    return new Response(JSON.stringify({ error: "URL is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    // Set viewport for mobile or desktop
    if (isMobile) {
      await page.setViewport({ width: 375, height: 667, isMobile: true });
      await page.setUserAgent(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1"
      );
    } else {
      await page.setViewport({ width: 1280, height: 800 });
    }

    // Navigate to the URL and take a screenshot
    await page.goto(url, { waitUntil: "networkidle2" });
    const screenshot = await page.screenshot({ encoding: "base64" });

    await browser.close();

    return new Response(JSON.stringify({ screenshot }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error capturing screenshot:", error);
    return new Response(JSON.stringify({ error: "Failed to capture screenshot" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}