import puppeteer from "puppeteer";

export async function POST(req) {
  try {
    const { url } = await req.json();
    if (!url.includes("instagram.com")) {
      return new Response(JSON.stringify({ error: "Invalid Instagram URL" }), { status: 400 });
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"],
    });

    const page = await browser.newPage();

    // **Set Instagram session ID**
    await page.setCookie({
      name: "sessionid",
      value: "64277736436%3AdP0j83z5HeYtjE%3A20%3AAYdxtM8b8o6_UMqZ0VKPPBDCjIaa9lVxQUUF-cnktA",
      domain: ".instagram.com",
    });

    await page.goto(url, { waitUntil: "networkidle2" });

    // **Log the full page content for debugging**
    const pageContent = await page.content();
    console.log(pageContent);

    // **Extract Media URLs**
    const media = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll("img"));
      const videos = Array.from(document.querySelectorAll("video source"));
      return [
        ...imgs.map((img) => ({ type: "image", url: img.src })),
        ...videos.map((vid) => ({ type: "video", url: vid.src })),
      ];
    });

    await browser.close();

    if (media.length === 0) {
      return new Response(JSON.stringify({ error: "No media found. Ensure the post is public." }), { status: 500 });
    }

    return new Response(JSON.stringify({ media }), { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
