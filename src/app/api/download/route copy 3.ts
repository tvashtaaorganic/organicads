import { NextRequest, NextResponse } from "next/server";
import ytdl from "@distube/ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

// Explicitly set FFmpeg path to the Chocolatey install location
const ffmpegPath = "C:\\ProgramData\\chocolatey\\bin\\ffmpeg.exe";
if (fs.existsSync(ffmpegPath)) {
  ffmpeg.setFfmpegPath(ffmpegPath);
  console.log(`FFmpeg explicitly set to: ${ffmpegPath}`);
} else {
  console.error(`FFmpeg not found at: ${ffmpegPath}. Please check the path.`);
}

// Path to store download stats
const statsFilePath = path.join(process.cwd(), "download-stats.json");

// Initialize stats if the file doesn't exist
if (!fs.existsSync(statsFilePath)) {
  fs.writeFileSync(
    statsFilePath,
    JSON.stringify({ totalVideoDownloads: 0, totalAudioDownloads: 0, liveDownloads: 0 }, null, 2)
  );
}

// In-memory counter for live downloads
let liveDownloads = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  const action = searchParams.get("action") || "download";
  const format = searchParams.get("format") || "mp4";
  let quality = searchParams.get("quality") || (format === "mp3" ? "140" : "137");

  if (action === "stats") {
    const stats = JSON.parse(fs.readFileSync(statsFilePath, "utf-8"));
    stats.liveDownloads = liveDownloads;
    return NextResponse.json(stats);
  }

  if (!url || !ytdl.validateURL(url)) {
    return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
  }

  try {
    const info = await ytdl.getInfo(url, {
      requestOptions: {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Connection": "keep-alive",
          "Referer": "https://www.youtube.com/",
          "Origin": "https://www.youtube.com",
        },
      },
    });

    if (action === "info") {
      const videoFormatsMap = new Map();
      info.formats
        .filter((f) => f.qualityLabel && f.hasVideo)
        .forEach((f) => {
          const height = parseInt(f.qualityLabel) || 0;
          const fps = f.fps || 30;
          const key = `${height}-${fps}`;
          if (!videoFormatsMap.has(key) || videoFormatsMap.get(key).itag < f.itag) {
            videoFormatsMap.set(key, {
              itag: f.itag,
              quality: f.qualityLabel,
              fps: fps,
              height: height,
              hasAudio: f.hasAudio || false,
            });
          }
        });

      let videoFormats = Array.from(videoFormatsMap.values()).sort((a, b) => b.height - a.height);

      if (videoFormats.length === 0) {
        return NextResponse.json({ error: "No video formats available" }, { status: 500 });
      }

      console.log("Available video formats (deduplicated):", videoFormats);

      const audioFormatsMap = new Map();
      info.formats
        .filter((f) => f.audioBitrate && f.itag === 140)
        .forEach((f) => {
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
        videoFormats,
        audioFormats,
      });
    }

    const title = info.videoDetails.title || "download";
    const availableFormats = info.formats.reduce((acc, f) => {
      if (f.qualityLabel) acc[f.itag] = f.qualityLabel;
      if (f.audioBitrate) acc[f.itag] = `${f.audioBitrate}kbps`;
      return acc;
    }, {} as Record<string, string>);
    console.log("Available formats for download:", availableFormats);

    if (!availableFormats[quality]) {
      console.log(`Quality ${quality} not found, falling back to default`);
      quality = format === "mp3" ? "140" : "136";
    }

    liveDownloads++;
    console.log(`Live downloads: ${liveDownloads}`);

    const stats = JSON.parse(fs.readFileSync(statsFilePath, "utf-8"));
    stats.liveDownloads = liveDownloads;
    fs.writeFileSync(statsFilePath, JSON.stringify(stats, null, 2));

    let stream: Readable;
    if (format === "mp3") {
      stream = ytdl(url, {
        quality: parseInt(quality),
        filter: "audioonly",
        requestOptions: {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Connection": "keep-alive",
            "Referer": "https://www.youtube.com/",
            "Origin": "https://www.youtube.com",
          },
        },
      });

      stats.totalAudioDownloads = (stats.totalAudioDownloads || 0) + 1;
      fs.writeFileSync(statsFilePath, JSON.stringify(stats, null, 2));
    } else {
      const videoStream = ytdl(url, {
        quality: parseInt(quality),
        filter: (f) => f.itag === parseInt(quality),
        requestOptions: {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Connection": "keep-alive",
            "Referer": "https://www.youtube.com/",
            "Origin": "https://www.youtube.com",
          },
        },
      });

      const audioStream = ytdl(url, {
        quality: "highestaudio",
        filter: "audioonly",
        requestOptions: {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Connection": "keep-alive",
            "Referer": "https://www.youtube.com/",
            "Origin": "https://www.youtube.com",
          },
        },
      });

      const tempDir = path.join(process.cwd(), "temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }

      const videoFilePath = path.join(tempDir, `video-${Date.now()}.mp4`);
      const audioFilePath = path.join(tempDir, `audio-${Date.now()}.mp3`);
      const outputFilePath = path.join(tempDir, `output-${Date.now()}.mp4`);

      await new Promise((resolve, reject) => {
        const videoWriteStream = fs.createWriteStream(videoFilePath);
        videoStream.pipe(videoWriteStream);
        videoStream.on("end", resolve);
        videoStream.on("error", reject);
      });

      await new Promise((resolve, reject) => {
        const audioWriteStream = fs.createWriteStream(audioFilePath);
        audioStream.pipe(audioWriteStream);
        audioStream.on("end", resolve);
        audioStream.on("error", reject);
      });

      console.log(`Merging video (itag: ${quality}) with audio`);
      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(videoFilePath)
          .input(audioFilePath)
          .outputOptions(["-c:v copy", "-c:a aac", "-map 0:v:0", "-map 1:a:0"])
          .output(outputFilePath)
          .on("end", () => {
            console.log("FFmpeg merge completed successfully");
            resolve(null);
          })
          .on("error", (err) => {
            console.error("FFmpeg merge error:", err.message);
            reject(err);
          })
          .run();
      });

      stream = fs.createReadStream(outputFilePath);

      stream.on("end", () => {
        fs.unlinkSync(videoFilePath);
        fs.unlinkSync(audioFilePath);
        fs.unlinkSync(outputFilePath);
      });

      stream.on("error", (err) => {
        if (fs.existsSync(videoFilePath)) fs.unlinkSync(videoFilePath);
        if (fs.existsSync(audioFilePath)) fs.unlinkSync(audioFilePath);
        if (fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);
      });

      stats.totalVideoDownloads = (stats.totalVideoDownloads || 0) + 1;
      fs.writeFileSync(statsFilePath, JSON.stringify(stats, null, 2));
    }

    const timeout = setTimeout(() => {
      stream.destroy(new Error("Stream timeout: Took too long to start"));
    }, 30000);

    stream.on("response", () => {
      clearTimeout(timeout);
    });

    stream.on("end", () => {
      liveDownloads--;
      console.log(`Live downloads: ${liveDownloads}`);
      const updatedStats = JSON.parse(fs.readFileSync(statsFilePath, "utf-8"));
      updatedStats.liveDownloads = liveDownloads;
      fs.writeFileSync(statsFilePath, JSON.stringify(updatedStats, null, 2));
    });

    stream.on("error", (err) => {
      liveDownloads--;
      console.log(`Live downloads: ${liveDownloads}`);
      const updatedStats = JSON.parse(fs.readFileSync(statsFilePath, "utf-8"));
      updatedStats.liveDownloads = liveDownloads;
      fs.writeFileSync(statsFilePath, JSON.stringify(updatedStats, null, 2));
    });

    const encodedTitle = encodeURIComponent(title);
    return new NextResponse(stream as any, {
      headers: {
        "Content-Disposition": `attachment; filename*=UTF-8''${encodedTitle}.${format}`,
        "Content-Type": format === "mp3" ? "audio/mpeg" : "video/mp4",
      },
    });
  } catch (error) {
    liveDownloads--;
    console.log(`Live downloads: ${liveDownloads}`);
    const updatedStats = JSON.parse(fs.readFileSync(statsFilePath, "utf-8"));
    updatedStats.liveDownloads = liveDownloads;
    fs.writeFileSync(statsFilePath, JSON.stringify(updatedStats, null, 2));

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