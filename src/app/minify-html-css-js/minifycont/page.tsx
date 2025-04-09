"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea"

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import Link from "next/link";
import { Copy, RefreshCcw, Minimize2 } from 'lucide-react';

export default function MinifierAll() {
  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");
  const [js, setJs] = useState("");
  const [minifiedOutput, setMinifiedOutput] = useState("");
  const [stats, setStats] = useState({
    liveUsers: 0,
    totalUsers: 0,
    totalBytesSaved: 0,
  });
  const [isMinifying, setIsMinifying] = useState(false); // Track minification state

  // Load stats from localStorage on mount
  useEffect(() => {
    const savedStats = JSON.parse(localStorage.getItem("minifierStats")) || {
      liveUsers: 0,
      totalUsers: 0,
      totalBytesSaved: 0,
    };
    setStats(savedStats);
  }, []);

  // Save stats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("minifierStats", JSON.stringify(stats));
  }, [stats]);

  // Minify function
  const minifyCode = () => {
    // Check if any input is provided
    if (!html && !css && !js) {
      return; // Do nothing if all fields are blank
    }

    // Increment liveUsers when minify is clicked, ensure non-negative
    setStats((prev) => ({
      ...prev,
      liveUsers: Math.max(0, prev.liveUsers + 1),
    }));
    setIsMinifying(true);

    const minify = (code) =>
      code
        .replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "") // Remove comments
        .replace(/\s+/g, " ") // Collapse whitespace
        .trim();

    const originalHtml = html;
    const originalCss = css;
    const originalJs = js;
    const minifiedHtml = minify(html);
    const minifiedCss = minify(css);
    const minifiedJs = minify(js);

    const originalSize = originalHtml.length + originalCss.length + originalJs.length;
    const minifiedSize = minifiedHtml.length + minifiedCss.length + minifiedJs.length;
    const bytesSaved = originalSize - minifiedSize;

    // Increment totalUsers only if it's a new user (first minify)
    const isNewUser = stats.totalUsers === 0;
    if (isNewUser) {
      setStats((prev) => ({
        ...prev,
        totalUsers: prev.totalUsers + 1,
      }));
    }

    setStats((prev) => ({
      ...prev,
      totalBytesSaved: prev.totalBytesSaved + bytesSaved,
    }));

    // Combine into a single line
    setMinifiedOutput(`${minifiedHtml} ${minifiedCss} ${minifiedJs}`);

    // Decrement liveUsers after minification (simulating completion)
    setTimeout(() => {
      setStats((prev) => ({
        ...prev,
        liveUsers: Math.max(0, prev.liveUsers - 1),
      }));
      setIsMinifying(false);
    }, 2000); // 2 seconds timeout
  };

  // Convert bytes to human-readable format
  const formatBytes = (bytes: number) => {
    if (bytes >= 1099511627776) return (bytes / 1099511627776).toFixed(2) + " TB";
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + " GB";
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + " MB";
    if (bytes >= 1024) return (bytes / 1024).toFixed(2) + " KB";
    return bytes + " bytes";
  };

  // Copy to clipboard with status update
  const copyToClipboard = () => {
    navigator.clipboard.writeText(minifiedOutput);
    const copyStatus = document.getElementById("copyStatus");
    copyStatus.classList.remove("hidden");
    setTimeout(() => copyStatus.classList.add("hidden"), 3000); // Hide after 3 seconds
  };

  // Reset fields
  const resetFields = () => {
    setHtml("");
    setCss("");
    setJs("");
    setMinifiedOutput("");
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
    
    <h1 className="text-2xl font-bold mb-4 text-center"> All-in-One Minifier</h1>

      {/* Input Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>HTML</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea  value={html}
              onChange={(e) => setHtml(e.target.value)}
              placeholder="Enter HTML..."
              className="w-full h-30 p-2 overflow-y-auto resize-y whitespace-pre-wrap" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>CSS</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea value={css}
              onChange={(e) => setCss(e.target.value)}
              placeholder="Enter CSS..."
              className="w-full h-30 p-2 overflow-y-auto resize-y whitespace-pre-wrap" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>JavaScript</CardTitle>
          </CardHeader>
          <CardContent>
          <Textarea value={js}
              onChange={(e) => setJs(e.target.value)}
              placeholder="Enter JS..."
              className="w-full h-30 p-2 overflow-y-auto resize-y whitespace-pre-wrap" />
          </CardContent>
        </Card>
      </div>

      {/* Buttons */}
      <div className="flex justify-center gap-4 mb-6">
        <Button onClick={minifyCode} className="bg-blue-500">
          <Minimize2 /> Minify
        </Button>
        <Button onClick={resetFields} variant="outline">
          <RefreshCcw /> Reset
        </Button>
      </div>

      {/* Output */}
      {minifiedOutput && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">View Minified Output</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogTitle>Minified Output</DialogTitle>
            <pre className="bg-gray-100 p-2 rounded overflow-auto h-64 text-wrap">
              {minifiedOutput}
            </pre>
            <div className="mt-2">
              <Button onClick={copyToClipboard} className="mb-2">
                <Copy /> Copy to Clipboard
              </Button>
              <p id="copyStatus" className="text-red-500 hidden">
                Copied to clipboard!
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Stats */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Live Users</p>
            <span className="text-black text-xl font-bold"> {stats.liveUsers}</span>
          </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Users</p>
              <p className="text-black text-xl font-bold"> {stats.totalUsers}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Bytes Saved</p>
              <p className="text-black text-xl font-bold"> {formatBytes(stats.totalBytesSaved)}</p>
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