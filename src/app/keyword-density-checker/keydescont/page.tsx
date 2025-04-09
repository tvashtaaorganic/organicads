"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import Link from "next/link";
import { Download, RefreshCcw } from 'lucide-react';

export default function KeywordDensityChecker() {
  const [keywords, setKeywords] = useState("");
  const [content, setContent] = useState("");
  const [totalWords, setTotalWords] = useState(0);
  const [keywordResults, setKeywordResults] = useState([]);

  const calculateDensity = useCallback(() => {
    if (!keywords.trim() || !content.trim()) {
      setTotalWords(0);
      setKeywordResults([]);
      return;
    }

    // Split content into words to count total words (remove punctuation and convert to lowercase)
    const words = content
      .toLowerCase()
      .replace(/[^\w\s]/g, "") // Remove punctuation
      .split(/\s+/)
      .filter((word) => word.length > 0);

    setTotalWords(words.length);

    // Split keywords by comma and trim
    const keywordList = keywords
      .toLowerCase()
      .split(",")
      .map((keyword) => keyword.trim())
      .filter((keyword) => keyword.length > 0);

    // Calculate density for each keyword/phrase
    const results = keywordList.map((keyword) => {
      // Use regex to count occurrences of the keyword/phrase in the content
      const contentLower = content.toLowerCase().replace(/[^\w\s]/g, "");
      const keywordRegex = new RegExp(`\\b${keyword}\\b`, "g");
      const matches = contentLower.match(keywordRegex) || [];
      const occurrences = matches.length;
      const density = (occurrences / words.length) * 100;
      let status;
      if (density >= 1 && density <= 3) {
        status = "Good";
      } else if (density < 1) {
        status = "Low";
      } else {
        status = "High";
      }
      return {
        keyword,
        occurrences,
        density: density.toFixed(2),
        status,
      };
    });

    setKeywordResults(results);
  }, [keywords, content]);

  // Use useEffect to update density in real-time as the user types
  useEffect(() => {
    calculateDensity();
  }, [calculateDensity]);

  const resetFields = () => {
    setKeywords("");
    setContent("");
    setTotalWords(0);
    setKeywordResults([]);
  };

  const exportReport = () => {
    if (keywordResults.length === 0) return;

    const report = `
Keyword Density Report
---------------------
Total Words: ${totalWords}

${keywordResults
  .map(
    (result) =>
      `Keyword: "${result.keyword}"
Occurrences: ${result.occurrences}
Density: ${result.density}%
Status: ${result.status}`
  )
  .join("\n\n")}
    `;

    const blob = new Blob([report], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "keyword-density-report.txt";
    a.click();
    window.URL.revokeObjectURL(url);
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
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Keyword Density Checker</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-black">Keywords (comma-separated)</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="Enter keywords (e.g., keyword density, seo tool)"
            className="mb-4"
          />

          <label className="block text-sm font-medium text-black mb-2">Content</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your content here..."
            rows={6}
            className="mb-4 h-30"
          />

          <div className="flex justify-end gap-2">
            <Button onClick={resetFields} variant="outline">
            <RefreshCcw /> Reset
            </Button>
            <Button onClick={exportReport} className="bg-blue-600 text-white">
            <Download /> Export Report
            </Button>
          </div>

          {totalWords > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-black mb-2">Analysis Results</h2>
              <p className="text-sm text-gray-600 mb-4">Total Words: {totalWords}</p>
              {keywordResults.map((result, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-muted p-3 rounded-md mb-2"
                >
                  <div>
                    <p className="text-sm font-medium text-black mb-2">&quot;{result.keyword}&quot;</p>
                    <p className="text-xs text-gray-500 mb-1">Ideal range: 1% - 3%</p>
                    <p className="text-sm font-medium text-black">{result.density}% density</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{result.occurrences} occurrences</p>
                    <p
                      className={`text-sm font-medium ${
                        result.status === "Good"
                          ? "text-green-600"
                          : result.status === "Low"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {result.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
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
              <li>Click &quot;Calculate Difference&quot; to see results.</li>
              <li>Use Reset to start a new calculation.</li>
            </ol>
            <p>
              The calculator automatically handles date order, so you don&apos;t need
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