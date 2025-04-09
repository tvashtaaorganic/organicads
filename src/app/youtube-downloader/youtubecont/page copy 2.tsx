"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";

interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: string;
  videoFormats: { itag: number; quality: string; fps: number }[];
  audioFormats: { itag: number; quality: string }[];
}

export default function YoutubeDownloader() {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState("mp4");
  const [quality, setQuality] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);

  // Auto-switch quality when format or videoInfo changes
  useEffect(() => {
    if (!videoInfo) return;

    if (format === "mp4" && videoInfo.videoFormats.length > 0) {
      setQuality(videoInfo.videoFormats[0].itag.toString());
    } else if (format === "mp3" && videoInfo.audioFormats.length > 0) {
      setQuality(videoInfo.audioFormats[0].itag.toString());
    }
  }, [format, videoInfo]);

  const fetchVideoInfo = async () => {
    setLoading(true);
    setError("");
    setVideoInfo(null);

    try {
      const response = await fetch(`/api/download?url=${encodeURIComponent(url)}&action=info`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch video info");
      }
      const data = await response.json();
      setVideoInfo(data);
    } catch (err) {
      setError(err.message || "Error fetching video info");
      console.error("Info fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    setError("");
    setProgress(0);

    try {
      const response = await fetch(
        `/api/download?url=${encodeURIComponent(url)}&format=${format}&quality=${quality}`,
        { method: "GET" }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || "Failed to fetch");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const contentLength = +response.headers.get("Content-Length")! || 0;
      let receivedLength = 0;
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedLength += value.length;

        if (contentLength > 0) {
          const percent = Math.min(100, Math.round((receivedLength / contentLength) * 100));
          setProgress(percent);
        }
      }

      const blob = new Blob(chunks);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setError(err.message || "Error downloading file");
      console.error("Client error:", err);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="p-6 bg-white rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">YouTube Downloader</h1>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="url">YouTube URL</Label>
            <div className="flex gap-2">
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube link here"
                className="w-full"
              />
              <Button onClick={fetchVideoInfo} disabled={loading || !url}>
                Search
              </Button>
            </div>
          </div>

          {videoInfo && (
            <>
              <div className="flex gap-4">
                <div className="relative w-[120px] h-[90px] flex-shrink-0">
                  <Image
                    src={videoInfo.thumbnail}
                    alt="Thumbnail"
                    fill
                    className="rounded"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{videoInfo.title}</p>
                  <p className="text-xs text-gray-500">
                    Duration: {Math.floor(parseInt(videoInfo.duration) / 60)}:{(parseInt(videoInfo.duration) % 60).toString().padStart(2, "0")}
                  </p>
                </div>
              </div>

              <div>
                <Label>Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mp4">MP4 (Video)</SelectItem>
                    <SelectItem value="mp3">MP3 (Audio)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Quality</Label>
                <Select value={quality} onValueChange={setQuality}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    {format === "mp4" && videoInfo.videoFormats.length > 0 ? (
                      videoInfo.videoFormats.map((f) => (
                        <SelectItem key={f.itag} value={f.itag.toString()}>
                          {f.quality} ({f.fps}FPS)
                        </SelectItem>
                      ))
                    ) : (
                      videoInfo.audioFormats.map((f) => (
                        <SelectItem key={f.itag} value={f.itag.toString()}>
                          {f.quality}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {loading && (
                <div>
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-center mt-1">{progress}%</p>
                </div>
              )}

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="space-y-2">
                <Button
                  onClick={handleDownload}
                  disabled={loading || !url || !videoInfo}
                  className="w-full"
                >
                  {loading ? "Downloading..." : "Download"}
                </Button>
                <Button
                  onClick={() => {
                    setUrl("");
                    setVideoInfo(null);
                    setFormat("mp4");
                    setQuality("");
                    setError("");
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Reset
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}