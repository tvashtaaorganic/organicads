// app/sitemap-generator/page.jsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Download, RefreshCcw, Search } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

export default function SitemapGenerator() {
    const [url, setUrl] = useState("");
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);
    const [urlCount, setUrlCount] = useState(0);
    const [progress, setProgress] = useState(0);
    const [analytics, setAnalytics] = useState({
      live: 0,
      totalGenerated: 0,
      totalUsers: 0,
    });
  
    // Load and save analytics client-side only
    useEffect(() => {
      const totalGenerated = parseInt(localStorage.getItem("totalGenerated") || "0", 10);
      const totalUsers = parseInt(localStorage.getItem("totalUsers") || "0", 10);
      setAnalytics({ live: 0, totalGenerated, totalUsers });
  
      return () => {
        if (loading) {
          setAnalytics((prev) => ({ ...prev, live: Math.max(0, prev.live - 1) }));
        }
      };
    }, []);
  
    useEffect(() => {
      if (analytics.totalGenerated > 0 || analytics.totalUsers > 0) {
        localStorage.setItem("totalGenerated", analytics.totalGenerated.toString());
        localStorage.setItem("totalUsers", analytics.totalUsers.toString());
      }
    }, [analytics.totalGenerated, analytics.totalUsers]);
  
    // Simulate progress while generating
    useEffect(() => {
      let interval;
      if (loading) {
        setProgress(0); // Start at 0
        interval = setInterval(() => {
          setProgress((prev) => {
            if (prev < 50) return prev + 2; // Gradually move to 50%
            return prev;
          });
        }, 200); // Update every 200ms
      }
      return () => clearInterval(interval);
    }, [loading]);
  
    const generateSitemap = async (e) => {
      e.preventDefault();
      setLoading(true);
      setResult("");
      setAnalytics((prev) => ({ ...prev, live: prev.live + 1 }));
  
      try {
        const response = await fetch("/api/generate-sitemap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
  
        const data = await response.json();
        if (data.error) {
          setResult(data.error);
          setLoading(false);
          setProgress(0); // Reset progress on error
          setAnalytics((prev) => ({ ...prev, live: Math.max(0, prev.live - 1) }));
          return;
        }
  
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${data.urls.map((url) => `
    <url>
      <loc>${url}</loc>
      <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`).join("")}
  </urlset>`;
  
        setResult(xml);
        setUrlCount(data.urls.length);
        setProgress(100); // Complete to 100% when done
        setAnalytics((prev) => ({
          live: Math.max(0, prev.live - 1),
          totalGenerated: prev.totalGenerated + 1,
          totalUsers: prev.totalUsers + 1,
        }));
      } catch (error) {
        setResult("Error: Could not generate sitemap");
        setProgress(0); // Reset progress on error
        setAnalytics((prev) => ({ ...prev, live: Math.max(0, prev.live - 1) }));
      }
      setLoading(false);
    };
  
    const downloadSitemap = () => {
      if (!result) return;
      const blob = new Blob([result], { type: "text/xml" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "sitemap.xml";
      link.click();
    };
  
    const resetForm = () => {
      setUrl("");
      setResult("");
      setUrlCount(0);
      setProgress(0); // Reset progress on reset
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
      
        <h1 className="text-2xl font-bold mb-4 text-left">Sitemap Generator</h1>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>XML Sitemap Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={generateSitemap} className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
              <Button type="submit" disabled={loading}>
              <Search /> {loading ? "Generating..." : "Generate"}
              </Button>
            </div>
            {loading && (
              <div className="mt-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-center mt-1">{progress}%</p>
              </div>
            )}
          </form>
          {result && (
            <div className="space-y-4 mt-4">
              <div className="flex gap-2">
                <Button onClick={downloadSitemap} disabled={!result}>
                <Download /> Download XML
                </Button>
                <Button onClick={resetForm} variant="outline">
                <RefreshCcw /> Reset
                </Button>
              </div>
              <pre className="bg-gray-50 p-4 rounded-md overflow-auto max-h-[400px] text-sm mt-4">
                {result}
              </pre>
              <p className="text-sm font-medium text-gray-600">Total URLs: {urlCount}</p>
            </div>
          )}
          
          <div className="mt-6 bg-gray-50 rounded-md p-6 shadow-sm">
        <h2 className="text-md font-semibold mb-2">Statistics</h2>
          <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Live Users Generating</p>
            <span className="text-black text-2xl font-bold"> {analytics.live}</span>
          </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Generated</p>
              <p className="text-black text-2xl font-bold"> {analytics.totalGenerated}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Users</p>
              <p className="text-black text-2xl font-bold"> {analytics.totalUsers}</p>
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