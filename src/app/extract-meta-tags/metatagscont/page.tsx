"use client";

import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios"; // Import AxiosError
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Send, RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Interface for meta tag data
interface MetaTag {
  name: string;
  content: string;
  usedByGoogle: string;
  usedByBing: string;
}

// Interface for counter data
interface CounterData {
  activeUsers: number;
  totalTests: number;
  uniqueUrls: number;
}

export default function MetaTagExtractor() {
  const [url, setUrl] = useState("");
  const [path, setPath] = useState("/");
  const [results, setResults] = useState<MetaTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [counter, setCounter] = useState<CounterData>({
    activeUsers: 0,
    totalTests: 0,
    uniqueUrls: 0,
  });

  // Fetch counter data on component mount and periodically
  useEffect(() => {
    const fetchCounter = async () => {
      try {
        const response = await axios.get<CounterData>("/api/extract-meta-tags");
        setCounter(response.data);
      } catch (_) {
        // Use _ to indicate unused error variable
        console.error("Failed to fetch counter data");
      }
    };

    fetchCounter(); // Initial fetch
    const interval = setInterval(fetchCounter, 5000); // Update every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  // Handle URL input change and automatically extract the path
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputUrl = e.target.value;
    setUrl(inputUrl);

    try {
      const parsedUrl = new URL(inputUrl);
      const baseUrl = `${parsedUrl.protocol}//${parsedUrl.hostname}`;
      const pathName = parsedUrl.pathname === "/" ? "/" : parsedUrl.pathname;

      setUrl(baseUrl);
      setPath(pathName);
    } catch (_) {
      // If URL parsing fails, keep the path as is
      setPath("/");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullUrl = `${url}${path}`.replace(/\/$/, ""); // Remove trailing slash if present

    if (!fullUrl || !fullUrl.startsWith("http")) {
      setError("Please enter a valid URL starting with http or https.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await axios.post<{ metaTags: MetaTag[] }>(
        "/api/extract-meta-tags",
        { url: fullUrl }
      );
      setResults(response.data.metaTags);
      // Fetch updated counter after a successful test
      const counterResponse = await axios.get<CounterData>("/api/extract-meta-tags");
      setCounter(counterResponse.data);
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      setError(
        axiosError.response?.data?.error || "Failed to extract meta tags."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUrl("");
    setPath("/");
    setResults([]);
    setError(null);
  };

  const shareOnWhatsApp = () => {
    const message = `Check out this awesome Meta Tag Extractor:\n\nhttps://yourwebsite.com/extract-meta-tags`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="container mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Left Section - Calculator */}
      <div className="md:col-span-8 bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 flex items-center">
          <span className="mr-2">⚙️</span> Extract Meta Tags
        </h1>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Test Another Page</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col md:flex-row items-center gap-2">
              <Input
                type="text"
                placeholder="Enter domain (e.g., http://example.com)"
                value={url}
                onChange={handleUrlChange}
                className="w-full md:w-7/12"
              />
              <Input
                type="text"
                placeholder="Enter path (e.g., /)"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                className="w-full md:w-5/12"
              />
            </div>

            <div className="flex space-x-2">
              <Button type="submit" disabled={loading}>
                <Send /> {loading ? "Loading..." : "Submit"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={loading}
              >
                <RefreshCw /> Reset
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Meta Tags</h2>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <div className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="max-w-xs">Name</TableHead>
                    <TableHead className="max-w-xs">Content</TableHead>
                    <TableHead className="max-w-xs">Used by Google</TableHead>
                    <TableHead className="max-w-xs">Used by Bing</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.length > 0 ? (
                    results.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="max-w-xs break-words">
                          {item.name}
                        </TableCell>
                        <TableCell className="max-w-xs break-words whitespace-normal">
                          {item.content}
                        </TableCell>
                        <TableCell className="max-w-xs break-words">
                          {item.usedByGoogle}
                        </TableCell>
                        <TableCell className="max-w-xs break-words">
                          {item.usedByBing}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        {loading
                          ? "Loading..."
                          : "No meta tags found. Please test a URL."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Usage Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Active Users Testing</p>
                <p className="text-xl font-bold">{counter.activeUsers}</p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Pages Tested</p>
                <p className="text-xl font-bold">{counter.totalTests}</p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Unique URLs Tested</p>
                <p className="text-xl font-bold">{counter.uniqueUrls}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Share on WhatsApp Button */}
        <div className="flex justify-center items-center mt-6 mb-4">
          <button
            onClick={shareOnWhatsApp}
            className="inline-flex items-center justify-center rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 bg-[#25D366] hover:bg-[#128C7E] text-white font-medium px-6 py-2"
          >
            Share on WhatsApp
          </button>
        </div>

        <section className="mt-12 prose max-w-none opacity-100 transform-none">
          <h2 className="text-2xl font-semibold mb-4">
            About Meta Tag Extractor
          </h2>
          <div className="space-y-4">
            <p>
              Our Meta Tag Extractor is a powerful tool designed to retrieve and
              display meta tags from any webpage. It helps you analyze how search
              engines like Google and Bing interpret your site’s metadata,
              aiding in SEO optimization and content strategy.
            </p>
            <h3 className="text-xl font-medium">Features:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Meta Tag Extraction:</strong> Pulls all meta tags from a URL.
              </li>
              <li>
                <strong>Search Engine Insights:</strong> Shows which tags are used by Google and Bing.
              </li>
              <li>
                <strong>Real-Time Stats:</strong> Tracks active users, total tests, and unique URLs.
              </li>
              <li>
                <strong>Easy Interface:</strong> Simple input for domain and path.
              </li>
            </ul>
            <h3 className="text-xl font-medium">Common Uses:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>SEO audits</li>
              <li>Competitor analysis</li>
              <li>Website debugging</li>
              <li>Content optimization</li>
              <li>Metadata validation</li>
            </ul>
            <h3 className="text-xl font-medium">How to Use:</h3>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Enter the domain (e.g., http://example.com).</li>
              <li>Specify the path (e.g., /about).</li>
              <li>Click "Submit" to extract meta tags.</li>
              <li>View the results in a detailed table.</li>
              <li>Use "Reset" to clear and start over.</li>
            </ol>
            <p>
              This tool provides instant feedback on meta tag usage, helping you
              optimize your website for better search engine visibility and user
              experience.
            </p>
          </div>
        </section>
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
          <h4 className="font-semibold mb-2">Tool Stats</h4>
          <p className="text-sm">Trusted by developers and SEO experts</p>
          <p className="text-xs mt-1 text-muted-foreground">
            Over 5,000 URLs tested daily
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
                .fill(0)
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
                      .fill(0)
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
vocab          </div>

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