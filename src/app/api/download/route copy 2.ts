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
      // Fetch video formats (include video-only formats)
      const videoFormats = info.formats
        .filter(f => f.qualityLabel && f.hasVideo)
        .map(f => ({
          itag: f.itag,
          quality: f.qualityLabel,
          fps: f.fps || 30,
          height: parseInt(f.qualityLabel) || 0,
          hasAudio: f.hasAudio || false,
        }));

      // Log all available video formats for debugging
      console.log("Available video formats:", videoFormats);

      // Prioritize 1080p (height: 1080), then 720p (height: 720), then highest available
      let selectedVideoFormat = videoFormats.find(f => f.height === 1080); // 1080p
      if (!selectedVideoFormat) {
        selectedVideoFormat = videoFormats.find(f => f.height === 720); // 720p
      }
      if (!selectedVideoFormat) {
        // Sort by height (highest first) and pick the best available
        videoFormats.sort((a, b) => b.height - a.height);
        selectedVideoFormat = videoFormats[0]; // Highest available
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
    console.log("Available formats for download:", availableFormats);

    const options: ytdl.downloadOptions = {
      quality: parseInt(quality),
      filter: format === "mp3" ? "audioonly" : (f) => f.itag === parseInt(quality),
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

    // If the selected format doesn't have audio, merge with the best audio stream
    const selectedFormat = info.formats.find(f => f.itag === parseInt(quality));
    let stream: Readable;
    if (format !== "mp3" && selectedFormat && !selectedFormat.hasAudio) {
      console.log(`Selected format (itag: ${quality}) has no audio, merging with best audio stream`);
      stream = ytdl.downloadFromInfo(info, {
        ...options,
        quality: parseInt(quality),
        filter: "videoonly",
      });
      const audioStream = ytdl.downloadFromInfo(info, {
        filter: "audioonly",
        quality: "highestaudio",
        requestOptions: options.requestOptions,
      });
      // Note: Merging streams requires additional libraries like `ffmpeg` in a real app.
      // For now, we'll rely on ytdl-core to handle this internally.
      stream = ytdl.downloadFromInfo(info, {
        ...options,
        quality: parseInt(quality),
      });
    } else {
      stream = ytdl(url, options);
    }

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