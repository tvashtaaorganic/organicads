"use client";

import { useState } from "react"; // Removed unused useEffect import
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Blocks, WholeWord, RefreshCcw, Sparkle, Asterisk } from "lucide-react"; // Importing icons from lucide-react
import Image from "next/image";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Simple CSS spinner for loading
const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
  </div>
);

export default function Home() {
  const [url, setUrl] = useState("");
  const [keyword, setKeyword] = useState("");
  const [isBulkCheck, setIsBulkCheck] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(""); // State for error message
  const [bulkResults, setBulkResults] = useState([]); // State for bulk analysis results
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator

  // Function to calculate pixel width (more accurate approximation)
  const calculatePixelWidth = (text) => {
    // Using 1 character ≈ 4.8 pixels for a typical font
    return Math.round(text.length * 4.8);
  };

  // Function to calculate SEO score
  const calculateSeoScore = (title, metaDescription) => {
    let score = 0;
    const titleChars = title.length;
    const metaChars = metaDescription.length;

    // Title length: Ideal is 55-60 characters
    if (titleChars >= 55 && titleChars <= 60) score += 40;
    else if (titleChars > 60 && titleChars <= 70) score += 20;
    else if (titleChars < 55 && titleChars >= 40) score += 20;

    // Meta description length: Ideal is 150-160 characters
    if (metaChars >= 150 && metaChars <= 160) score += 40;
    else if (metaChars > 160 && metaChars <= 170) score += 20;
    else if (metaChars < 150 && metaChars >= 120) score += 20;

    // Add points if keyword is present (if provided)
    if (keyword) {
      if (title.toLowerCase().includes(keyword.toLowerCase())) score += 10;
      if (metaDescription.toLowerCase().includes(keyword.toLowerCase()))
        score += 10;
    }

    // Penalty for excessive length
    if (titleChars > 70) score -= 10;
    if (metaChars > 170) score -= 10;

    return Math.min(Math.max(score, 0), 100); // Cap between 0 and 100
  };

  // Function to determine color based on value and range
  const getColorForCount = (value, idealMin, idealMax, warningMin, warningMax) => {
    if (value >= idealMin && value <= idealMax) return "text-green-500";
    if (value < warningMin || value > warningMax) return "text-red-500";
    return "text-orange-500";
  };

  // Function to determine color for SEO score
  const getColorForScore = (score) => {
    if (score <= 30) return "text-red-500";
    if (score <= 60) return "text-orange-500";
    return "text-green-500";
  };

  const handleAnalyze = async () => {
    if (!url) {
      setError("Please enter a URL to analyze!");
      return;
    }

    setError(""); // Clear any previous error
    setIsLoading(true); // Show loading spinner

    if (isBulkCheck) {
      // Handle bulk check
      const urls = url.split("\n").filter((u) => u.trim() !== "").slice(0, 5); // Limit to 5 URLs
      if (urls.length === 0) {
        setError("Please enter at least one URL to analyze!");
        setIsLoading(false);
        return;
      }

      const results = [];
      for (const singleUrl of urls) {
        try {
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
            singleUrl
          )}`;
          const response = await fetch(proxyUrl);
          const html = await response.text();

          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");
          const title = doc.querySelector("title")?.innerText || "No title found";
          const metaDescription =
            doc.querySelector('meta[name="description"]')?.content ||
            "No meta description found";

          const analysisData = {
            url: singleUrl,
            title,
            titleChars: title.length,
            titlePixels: calculatePixelWidth(title),
            metaDescription,
            metaChars: metaDescription.length,
            metaPixels: calculatePixelWidth(metaDescription),
            seoScore: calculateSeoScore(title, metaDescription),
          };

          results.push(analysisData);
        } catch (error) {
          console.error(`Error fetching data for ${singleUrl}:`, error);
          setError(`Failed to fetch data for ${singleUrl}. Please try again.`);
          setIsLoading(false);
          return; // Stop processing if one URL fails
        }
      }
      setBulkResults(results);
      setAnalysis(null); // Clear single analysis
      setIsLoading(false); // Hide loading spinner
    } else {
      // Handle single URL check
      try {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
          url
        )}`;
        const response = await fetch(proxyUrl);
        const html = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const title = doc.querySelector("title")?.innerText || "No title found";
        const metaDescription =
          doc.querySelector('meta[name="description"]')?.content ||
          "No meta description found";

        const analysisData = {
          title,
          titleChars: title.length,
          titlePixels: calculatePixelWidth(title),
          metaDescription,
          metaChars: metaDescription.length,
          metaPixels: calculatePixelWidth(metaDescription),
          seoScore: calculateSeoScore(title, metaDescription),
        };

        setAnalysis(analysisData);
        setBulkResults([]); // Clear bulk results
        setIsLoading(false); // Hide loading spinner
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data. Please try again.");
        setIsLoading(false); // Hide loading spinner
      }
    }
  };

  // Reset function to clear the form and analysis
  const handleReset = () => {
    setUrl("");
    setKeyword("");
    setAnalysis(null);
    setBulkResults([]);
    setError("");
    setIsLoading(false);
  };

  // Update analysis when title or meta description changes (for single URL)
  const handleTitleChange = (newTitle) => {
    setAnalysis((prev) => ({
      ...prev,
      title: newTitle,
      titleChars: newTitle.length,
      titlePixels: calculatePixelWidth(newTitle),
      seoScore: calculateSeoScore(newTitle, prev.metaDescription),
    }));
  };

  const handleMetaChange = (newMeta) => {
    setAnalysis((prev) => ({
      ...prev,
      metaDescription: newMeta,
      metaChars: newMeta.length,
      metaPixels: calculatePixelWidth(newMeta),
      seoScore: calculateSeoScore(prev.title, newMeta),
    }));
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">
          Title and Meta Description Checker
        </h1>
        <p className="text-center text-gray-600 mb-6 text-sm sm:text-base">
          Make titles and meta descriptions work for you in Google
        </p>

        {/* Toggle Buttons */} 
        <div className="flex justify-center space-x-4 mb-6">
          <Toggle
            pressed={!isBulkCheck}
            onPressedChange={() => setIsBulkCheck(false)}
            className={`px-4 py-2 rounded-full text-sm sm:text-base ${
              !isBulkCheck
                ? "bg-black text-white"
                : "bg-black text-white"
            }`}
          >
            One page check
          </Toggle>
          <Toggle
            pressed={isBulkCheck}
            onPressedChange={() => setIsBulkCheck(true)}
            className={`px-4 py-2 rounded-full text-sm sm:text-base ${
              isBulkCheck
                ? "bg-black text-white"
                : "bg-black text-white"
            }`}
          >
            Bulk check
          </Toggle>
        </div>

        {/* Input Fields */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6">
          {isBulkCheck ? (
            <Textarea
              placeholder="Enter up to 5 URLs for analysis (one per line)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="mb-4 h-32 text-sm sm:text-base"
            />
          ) : (
            <Input
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="mb-4 text-sm sm:text-base"
            />
          )}
          {!isBulkCheck && (
            <Input
              type="text"
              placeholder="Enter the target keyword (optional)"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="mb-4 text-sm sm:text-base"
            />
          )}
          {error && <p className="text-red-500 mb-4 text-sm sm:text-base">{error}</p>}
          <div className="flex justify-center space-x-4">
            <Button
              onClick={handleAnalyze}
              className="bg-green-600 text-white px-4 sm:px-6 py-2 text-sm sm:text-base"
              disabled={isLoading}
            >
            <Sparkle /> {isLoading ? "Analyzing..." : "Analyze"}
            </Button>
            {(analysis || bulkResults.length > 0) && (
              <Button
                onClick={handleReset}
                className="bg-black text-white px-4 sm:px-6 py-2 text-sm sm:text-base"
              >
             <RefreshCcw /> Reset
              </Button>
            )}
          </div>
          {isLoading && <div className="mt-4"><Spinner /></div>}
        </div>

        {/* Bulk Check Results (shown only for bulk check) */}
        {bulkResults.length > 0 && (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Bulk Analysis Results</h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-sm sm:text-base">URL</TableHead>
                    <TableHead className="text-sm sm:text-base">Title</TableHead>
                    <TableHead className="text-sm sm:text-base">Title Chars</TableHead>
                    <TableHead className="text-sm sm:text-base">Title Pixels</TableHead>
                    <TableHead className="text-sm sm:text-base">Meta Description</TableHead>
                    <TableHead className="text-sm sm:text-base">Meta Chars</TableHead>
                    <TableHead className="text-sm sm:text-base">Meta Pixels</TableHead>
                    <TableHead className="text-sm sm:text-base">SEO Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bulkResults.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-sm sm:text-base">{result.url}</TableCell>
                      <TableCell className="text-sm sm:text-base">{result.title}</TableCell>
                      <TableCell
                        className={`font-semibold ${getColorForCount(
                          result.titleChars,
                          55,
                          60,
                          40,
                          70
                        )} text-sm sm:text-base`}
                      >
                        {result.titleChars}
                      </TableCell>
                      <TableCell
                        className={`font-semibold ${getColorForCount(
                          result.titlePixels,
                          400,
                          600,
                          300,
                          700
                        )} text-sm sm:text-base`}
                      >
                        {result.titlePixels}
                      </TableCell>
                      <TableCell className="text-sm sm:text-base">{result.metaDescription}</TableCell>
                      <TableCell
                        className={`font-semibold ${getColorForCount(
                          result.metaChars,
                          150,
                          160,
                          120,
                          170
                        )} text-sm sm:text-base`}
                      >
                        {result.metaChars}
                      </TableCell>
                      <TableCell
                        className={`font-semibold ${getColorForCount(
                          result.metaPixels,
                          700,
                          920,
                          600,
                          1000
                        )} text-sm sm:text-base`}
                      >
                        {result.metaPixels}
                      </TableCell>
                      <TableCell
                        className={`font-semibold ${getColorForScore(result.seoScore)} text-sm sm:text-base`}
                      >
                        {result.seoScore}/100
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Single URL Analysis Results (shown only for single check) */}
        {analysis && !isBulkCheck && (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row sm:justify-between items-start mb-6 space-x-4 space-y-6 sm:space-y-0">
              <div className="w-full sm:w-3/4">
                {/* Page Title */}
                <div className="mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-2">Page Title</h2>
                  <Input
                    type="text"
                    value={analysis.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="mb-2 text-sm sm:text-base"
                  />
                  <div className="flex flex-wrap space-x-4 mt-2">
                    <span className="text-gray-600 flex items-center font-medium text-sm sm:text-base">
                      <WholeWord className="w-4 h-4 mr-1" />
                      Characters: {" "}
                      <span
                        className={`ml-2 font-semibold ${getColorForCount(
                          analysis.titleChars,
                          55,
                          60,
                          40,
                          70
                        )}`}
                      >
                        {analysis.titleChars}
                      </span>
                    </span>
                    <span className="text-gray-600 flex items-center font-medium text-sm sm:text-base">
                      <Blocks className="w-4 h-4 mr-1" />
                      Pixels: {" "}
                      <span
                        className={`ml-2 font-semibold ${getColorForCount(
                          analysis.titlePixels,
                          400,
                          600,
                          300,
                          700
                        )}`}
                      >
                        {analysis.titlePixels}
                      </span>
                    </span>
                  </div>
                  {(!keyword ||
                    !analysis.title.toLowerCase().includes(keyword.toLowerCase())) && (
                    <p className="text-yellow-600 text-sm mt-2 flex">
                       <Asterisk /> It is recommended to include your target keyword in the title.
                    </p>
                  )}
                </div>

                {/* Meta Description */}
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold mb-2">Meta Description</h2>
                  <Textarea
                    value={analysis.metaDescription}
                    onChange={(e) => handleMetaChange(e.target.value)}
                    className="mb-2 text-sm sm:text-base"
                  />
                  <div className="flex flex-wrap space-x-4 mt-2">
                    <span className="text-gray-600 flex items-center font-medium text-sm sm:text-base">
                      <WholeWord className="w-4 h-4 mr-1" />
                      Characters: {" "}
                      <span
                        className={`ml-2 font-semibold ${getColorForCount(
                          analysis.metaChars,
                          150,
                          160,
                          120,
                          170
                        )}`}
                      >
                        {analysis.metaChars}
                      </span>
                    </span>
                    <span className="text-gray-600 flex items-center font-medium text-sm sm:text-base">
                      <Blocks className="w-4 h-4 mr-1" />
                      Pixels: {" "}
                      <span
                        className={`ml-2 font-semibold ${getColorForCount(
                          analysis.metaPixels,
                          700,
                          920,
                          600,
                          1000
                        )}`}
                      >
                        {analysis.metaPixels}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* SEO Score in a Card */}
              <Card className="w-full sm:w-1/4">
                <CardHeader>
                  <CardTitle className="text-center text-sm sm:text-base">
                    Your snippet score:
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="2"
                      />
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2"
                        strokeDasharray={`${analysis.seoScore}, 100`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        className={`text-xl sm:text-xl font-bold ${getColorForScore(
                          analysis.seoScore
                        )}`}
                      >
                        {analysis.seoScore}/100
                      </span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mt-2">
                    Get custom recommendations for boosting your on-page SEO score
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Desktop and Mobile Snippets */}
            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                  Desktop snippet example
                </h3>
                <div className="border p-4 rounded-lg">
                  <p className="text-[#2a632a] text-xs sm:text-sm">{url}</p>
                  <p className="text-base sm:text-lg font-semibold">{analysis.title}</p>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    {analysis.metaDescription}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                  Mobile snippet example
                </h3>
                <div className="border p-4 rounded-lg">
                  <p className="text-[#2a632a] text-xs sm:text-sm">{url}</p>
                  <p className="text-base sm:text-lg font-semibold">{analysis.title}</p>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    {analysis.metaDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
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