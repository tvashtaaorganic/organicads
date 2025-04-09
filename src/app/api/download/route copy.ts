import { NextRequest, NextResponse } from "next/server";
import ytdl from "@distube/ytdl-core";
import { Readable } from "stream";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  const action = searchParams.get("action") || "download";
  const format = searchParams.get("format") || "mp4";
  const quality = searchParams.get("quality") || (format === "mp3" ? "140" : "136");

  if (!url || !ytdl.validateURL(url)) {
    return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
  }

  try {
    const info = await ytdl.getInfo(url, {
      requestOptions: {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      },
    });

    if (action === "info") {
      // Fetch video formats and select one (prefer 720p, max 1080p)
      const videoFormats = info.formats
        .filter(f => f.qualityLabel && f.hasVideo && f.hasAudio)
        .map(f => ({
          itag: f.itag,
          quality: f.qualityLabel,
          fps: f.fps || 30,
        }));

      // Prefer 720p (itag 136), otherwise 1080p (itag 137), or first available
      let selectedVideoFormat = videoFormats.find(f => f.itag === 136); // 720p
      if (!selectedVideoFormat) {
        selectedVideoFormat = videoFormats.find(f => f.itag === 137) || videoFormats[0]; // 1080p or first available
      }

      // Fetch and deduplicate audio formats (only 128kbps, itag 140)
      const audioFormatsMap = new Map();
      info.formats
        .filter(f => f.audioBitrate && f.itag === 140)
        .forEach(f => {
          const key = f.itag;
          if (!audioFormatsMap.has(key)) {
            audioFormatsMap.set(key, {
              itag: f.itag,
              quality: `${f.audioBitrate}kbps`,
            });
          }
        });
      const audioFormats = Array.from(audioFormatsMap.values());

      return NextResponse.json({
        title: info.videoDetails.title,
        thumbnail: info.videoDetails.thumbnails[0].url,
        duration: info.videoDetails.lengthSeconds,
        videoFormats: selectedVideoFormat ? [selectedVideoFormat] : [],
        audioFormats,
      });
    }

    // Download logic
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, "") || "download";
    const availableFormats = info.formats.reduce((acc, f) => {
      if (f.qualityLabel) acc[f.itag] = f.qualityLabel;
      if (f.audioBitrate) acc[f.itag] = `${f.audioBitrate}kbps`;
      return acc;
    }, {} as Record<string, string>);
    console.log("Available formats:", availableFormats);

    const options: ytdl.downloadOptions = {
      quality: parseInt(quality),
      filter: format === "mp3" ? "audioonly" : "audioandvideo",
      requestOptions: {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      },
    };

    if (!availableFormats[quality]) {
      console.log(`Quality ${quality} not found, falling back to default`);
      options.quality = format === "mp3" ? 140 : 136;
    }

    const stream = ytdl(url, options);

    return new Promise((resolve) => {
      const chunks: Buffer[] = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("end", () => {
        const buffer = Buffer.concat(chunks);
        const readable = new Readable();
        readable._read = () => {};
        readable.push(buffer);
        readable.push(null);

        resolve(
          new NextResponse(readable as any, {
            headers: {
              "Content-Disposition": `attachment; filename="${title}.${format}"`,
              "Content-Type": format === "mp3" ? "audio/mpeg" : "video/mp4",
              "Content-Length": buffer.length.toString(),
            },
          })
        );
      });
      stream.on("error", (err) => {
        console.error("Stream error:", err);
        resolve(NextResponse.json({ error: "Stream failed", details: err.message }, { status: 500 }));
      });
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Failed to download", details: error.message },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    responseLimit: false,
  },
};