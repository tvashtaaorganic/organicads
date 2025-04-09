"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Download, RefreshCcw, Search } from "lucide-react";

interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: string;
  videoFormats: { itag: number; quality: string; fps: number }[];
  audioFormats: { itag: number; quality: string }[];
}

interface DownloadStats {
  totalVideoDownloads: number;
  totalAudioDownloads: number;
  liveDownloads: number;
}

export default function YoutubeDownloader() {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState("mp4");
  const [quality, setQuality] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [stats, setStats] = useState<DownloadStats>({
    totalVideoDownloads: 0,
    totalAudioDownloads: 0,
    liveDownloads: 0,
  });

  // Fetch download stats
  const fetchStats = async () => {
    try {
      const response = await fetch("/api/download?action=stats");
      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error("Stats fetch error:", err);
    }
  };

  // Fetch stats on component mount and every 5 seconds
  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

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
      // Use the video title as the file name, sanitized
      const sanitizedTitle = (videoInfo?.title || "download").replace(/[^\w\s]/gi, "");
      link.download = `${sanitizedTitle}.${format}`;
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

  const shareOnWhatsApp = () => {
    const message = `Check out this awesome Loan EMI Calculator:\n\nhttps://yourwebsite.com/loan-emi-calculator`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="container mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Left Section - Calculator */}
      <div className="md:col-span-8 bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-left">YouTube Downloader</h1>

        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="mb-4">
              <Label htmlFor="url" className="mb-2">YouTube URL</Label>
              <div className="flex gap-2 mb-4">
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste YouTube link here"
                  className="w-full"
                />
                <Button onClick={fetchVideoInfo} disabled={loading || !url}>
                  <Search /> Search
                </Button>
              </div>
            </div>

            {videoInfo && (
              <>
                <div className="flex gap-4">
                  <div className="relative w-[120px] h-[90px] flex-shrink-0 mb-4 mt-4">
                    <Image
                      src={videoInfo.thumbnail}
                      alt="Thumbnail"
                      fill
                      className="rounded"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div className="flex-1 mb-4 mt-4">
                    <p className="font-semibold text-sm">{videoInfo.title}</p>
                    <p className="text-xs text-gray-500">
                      Duration: {Math.floor(parseInt(videoInfo.duration) / 60)}:
                      {(parseInt(videoInfo.duration) % 60).toString().padStart(2, "0")}
                    </p>
                  </div>
                </div>

                <div className="grid-cols-2 md:grid-cols-2 gap-3 mb-4 flex flex-wrap justify-center md:justify-start">
                  <div>
                    <Label className="mb-2">Format</Label>
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
                    <Label className="mb-2">Quality</Label>
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
                </div>

                {loading && (
                  <div>
                    <Progress value={progress} className="w-full" />
                    <p className="text-sm text-center mt-1">{progress}%</p>
                  </div>
                )}

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="space-y-2 flex flex-wrap justify-end gap-2 mb-4">
                  <Button onClick={handleDownload} disabled={loading || !url || !videoInfo}>
                    <Download /> {loading ? "Downloading..." : "Download"}
                  </Button>
                  <Button
                    onClick={() => {
                      setUrl("");
                      setVideoInfo(null);
                      setFormat("mp4");
                      setQuality("");
                      setError("");
                    }}
                    variant="destructive"
                  >
                    <RefreshCcw /> Reset
                  </Button>
                </div>
              </>
            )}

            <div className="mt-6 bg-gray-50 rounded-md p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">Download Statistics</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Live Downloads</p>
                  <span className="text-black text-2xl font-bold"> {stats.liveDownloads}</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Total Video Downloads</p>
                  <p className="text-black text-2xl font-bold"> {stats.totalVideoDownloads}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Total Audio Downloads</p>
                  <p className="text-black text-2xl font-bold"> {stats.totalAudioDownloads}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Share on WhatsApp Button */}
        <div className="flex justify-center items-center mt-6 mb-4">
          <button
            onClick={shareOnWhatsApp}
            className="inline-flex items-center justify-center rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 bg-[#25D366] hover:bg-[#128C7E] text-white font-medium px-6 py-2"
          >
            Share on WhatsApp
          </button>
        </div>

        <div className="mt-12 prose max-w-none opacity-100">
          <h2 className="text-2xl font-semibold mb-4">
            About Date Difference Calculator
          </h2>
          <div className="space-y-4">
            <p>
              Our Date Difference Calculator is a powerful tool that helps you
              find the exact duration between any two dates. Whether you need to
              calculate project timelines, age differences, or plan events, this
              calculator provides comprehensive time-based calculations.
            </p>
            <h3 className="text-xl font-medium">Features:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Precise Duration:</strong> Calculate exact years,
                months, and days between dates.
              </li>
              <li>
                <strong>Time Precision:</strong> Optional time inputs for more
                accurate calculations.
              </li>
              <li>
                <strong>Multiple Formats:</strong> View results in days, weeks,
                and working days.
              </li>
              <li>
                <strong>Working Days:</strong> Calculate business days excluding
                weekends.
              </li>
            </ul>
            <h3 className="text-xl font-medium">Common Uses:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Project timeline planning</li>
              <li>Contract duration calculations</li>
              <li>Event planning</li>
              <li>Age difference calculations</li>
              <li>Working days calculation</li>
              <li>Deadline management</li>
            </ul>
            <h3 className="text-xl font-medium">How to Use:</h3>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Enter the start date.</li>
              <li>Add start time (optional) for more precision.</li>
              <li>Enter the end date.</li>
              <li>Add end time (optional).</li>
              <li>Click "Calculate Difference" to see results.</li>
              <li>Use Reset to start a new calculation.</li>
            </ol>
            <p>
              The calculator automatically handles date order, so you don't need
              to worry about which date comes first. It provides comprehensive
              results including total days, weeks, working days, and weekends,
              making it useful for both personal and professional use.
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Quick Tips */}
      <div className="md:col-span-4 bg-white p-6 rounded-lg shadow-md space-y-6">
        <div className="bg-blue-100 rounded-lg p-4">
          <h3 className="font-medium text-lg mb-2">Quick Tips</h3>
          <ul className="text-sm space-y-2">
            <li>• Use tab key to move between fields</li>
            <li>• Results update automatically</li>
            <li>• Recent calculations are saved</li>
          </ul>
        </div>
        <div className="bg-muted rounded-lg p-4">
          <h4 className="font-semibold mb-2">Calculator Stats</h4>
          <p className="text-sm">Trusted by students and professionals</p>
          <p className="text-xs mt-1 text-muted-foreground">
            Over 10,000 calculations daily
          </p>
        </div>

        <div className="bg-muted rounded-lg p-4">
          <Image
            src="https://res.cloudinary.com/djiki7tvo/image/upload/v1743084283/website-redesign_kex22a.webp"
            alt="Best Web Development Company in Bangalore"
            width={500}
            height={300}
            className="w-full rounded-lg mb-3"
          />
          <h3 className="font-medium text-xl mb-2">
            Best Web Development Company in Bangalore
          </h3>

          <div className="flex items-center gap-1 mb-2">
            <div className="flex text-yellow-400">
              {Array(5)
                .fill()
                .map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
            </div>
            <span className="text-sm font-medium">4.8</span>
            <Link
              href=""
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline ml-2"
            >
              720+ Google Reviews
            </Link>
          </div>

          <div className="mb-3">
            <h4 className="font-semibold mb-2">Trustpilot Ratings</h4>
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-end gap-4 mb-4">
                <div>
                  <div className="text-5xl font-bold">4.8</div>
                  <div className="text-lg font-semibold">Excellent</div>
                  <div className="flex text-[#00b67a]">
                    {Array(5)
                      .fill()
                      .map((_, i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="currentColor"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                  </div>
                  <div className="text-sm mt-1">797 reviews</div>
                </div>
                <div className="flex-1 space-y-1">
                  {[92, 5, 2, 1, 0].map((width, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="text-sm w-12">{5 - i}-star</div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-[#00b67a] rounded-full"
                          style={{ width: `${width}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm mb-4">
            🎯 We build your business into a Brand. 🌐 Helping Businesses
            Increase Leads, Traffic & Sales!. 🚀 Google, Bing Rank Your Web Page
            in Just 4 Hours!. 🚀 Web Design | Digital Marketing | SEO, SEM, SMM
            | Google, Meta Ads | Branding
          </p>
          <Link
            href="https://www.organicads.in/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="w-full bg-primary text-white font-medium py-2 rounded-md hover:bg-primary/90 transition">
              Check details
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}