'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InstagramDownloader() {
  const [url, setUrl] = useState('');
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const extractMedia = async () => {
    setLoading(true);
    setError('');
    setMedia([]);

    try {
      const response = await fetch('/api/instagram-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch media');

      setMedia(data.media);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (mediaUrl, type, index) => {
    const link = document.createElement('a');
    link.href = mediaUrl;
    link.download = `instagram_${type}_${index}.${type === 'video' ? 'mp4' : 'jpg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Instagram Media Downloader</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Paste Instagram URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
              />
              <Button onClick={extractMedia} disabled={loading || !url}>
                {loading ? 'Fetching...' : 'Get Media'}
              </Button>
            </div>

            {error && <div className="text-red-500 text-center">{error}</div>}

            {media.length > 0 && (
              <div className="space-y-4">
                {media.map((item, index) => (
                  <div key={index} className="flex flex-col items-center">
                    {item.type === 'image' ? (
                      <img src={item.url} alt="Instagram post" className="max-w-full rounded" />
                    ) : (
                      <video controls className="max-w-full rounded">
                        <source src={item.url} type="video/mp4" />
                      </video>
                    )}
                    <Button onClick={() => handleDownload(item.url, item.type, index)} className="mt-2">
                      Download {item.type}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
