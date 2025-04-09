"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function YoutubeDownloader() {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState("mp4");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/download?url=${encodeURIComponent(url)}&format=${format}`, {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || "Failed to download");
      }

      const blob = await response.blob();
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
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 bg-white rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">YouTube Downloader</h1>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="url">YouTube URL</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube link here"
              className="w-full"
            />
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

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button
            onClick={handleDownload}
            disabled={loading || !url}
            className="w-full"
          >
            {loading ? "Downloading..." : "Download"}
          </Button>
        </div>
      </div>
    </div>
  );
}