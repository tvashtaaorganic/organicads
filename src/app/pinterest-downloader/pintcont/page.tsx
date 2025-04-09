'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function PinterestDownloader() {
  const [videoUrl, setVideoUrl] = useState('');
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [abortController, setAbortController] = useState(null);

  const isValidPinterestUrl = (url) => {
    return /^https:\/\/[a-z]{2,3}?\.?pinterest\.com\/pin\/\d+\/?$/.test(url);
  };

  const fetchVideoData = async () => {
    if (!videoUrl.trim()) {
      setDownloadUrl(null);
      setError('Video URL is required');
      return;
    }

    if (!isValidPinterestUrl(videoUrl)) {
      setDownloadUrl(null);
      setError('Invalid Pinterest URL format. Example: https://in.pinterest.com/pin/123456789/');
      return;
    }

    setError('');
    setIsLoading(true);
    setProgress(10);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => (prev < 80 ? prev + 10 : prev));
      }, 300);

      const response = await fetch(`/api/pinterest-download?url=${encodeURIComponent(videoUrl)}`, {
        signal: controller.signal,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setDownloadUrl(url);
      } else {
        // Read the body once as text, then process it
        const responseText = await response.text();
        console.log('Response body:', responseText.slice(0, 200)); // Log for debugging

        let errorMessage = `Failed to fetch video (Status: ${response.status})`;
        if (responseText.includes('<!DOCTYPE') || responseText.includes('login')) {
          errorMessage = 'Pinterest returned an HTML page (login or CAPTCHA required)';
        } else {
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.details || errorData.error || errorMessage;
          } catch (jsonError) {
            console.error('Failed to parse response as JSON:', jsonError);
          }
        }
        throw new Error(errorMessage);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request cancelled');
      } else {
        console.error('Fetch Error:', err);
        setError(err.message);
      }
      setDownloadUrl(null);
    } finally {
      setIsLoading(false);
      setAbortController(null);
      setTimeout(() => setProgress(0), 500);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'pinterest-video.mp4';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    }
  };

  const handleCancel = () => {
    if (abortController) {
      abortController.abort();
    }
  };

  const resetForm = () => {
    setVideoUrl('');
    setDownloadUrl(null);
    setError('');
    setIsLoading(false);
    setProgress(0);
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Pinterest Downloader</CardTitle>
          <p className="text-sm text-muted-foreground">Download Pinterest videos by pasting the video URL.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Paste Video URL</h3>
            <div className="flex space-x-2 items-center">
              <div className="flex-1">
                <Label htmlFor="videoUrl" className="block mb-2">Pinterest Video URL</Label>
                <Input
                  id="videoUrl"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value.trim())}
                  placeholder="e.g., https://in.pinterest.com/pin/973340538216107873/"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={fetchVideoData}
                className="bg-blue-500 hover:bg-blue-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Fetching...' : 'FETCH'}
              </Button>
            </div>
            {isLoading && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Fetching video...</p>
                <Progress value={progress} className="w-full" />
                <Button onClick={handleCancel} variant="destructive" disabled={!isLoading}>
                  Cancel
                </Button>
              </div>
            )}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {downloadUrl && !isLoading && (
              <div className="mt-4 space-y-4">
                <div style={{ padding: '10px', border: '1px solid #dfe1e5', borderRadius: '8px', backgroundColor: '#fff' }}>
                  <p className="text-gray-600">Video ready to download!</p>
                  <div className="flex space-x-2 mt-2">
                    <Button onClick={handleDownload} className="flex-1 bg-green-500 hover:bg-green-600 text-white">
                      Download Video
                    </Button>
                    <Button variant="destructive" onClick={resetForm} className="flex-1">
                      Reset
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}