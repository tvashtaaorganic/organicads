"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RefreshCcw, Sparkle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function WebsiteSpeedTest() {
  const [url, setUrl] = useState("");
  const [isMobile, setIsMobile] = useState(true); // Default to Mobile
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0); // Progress bar value
  const [error, setError] = useState("");
  const [speedData, setSpeedData] = useState(null);
  const [analytics, setAnalytics] = useState({ live: 0, totalGenerated: 0, totalUsers: 0 });

  // Load and save analytics client-side only
  useEffect(() => {
    // Load initial analytics from localStorage
    const totalGenerated = parseInt(localStorage.getItem("totalGenerated") || "0", 10);
    const totalUsers = parseInt(localStorage.getItem("totalUsers") || "0", 10);
    const live = parseInt(localStorage.getItem("liveUsersGenerating") || "0", 10);

    setAnalytics({ live, totalGenerated, totalUsers });

    // Generate or retrieve a unique user ID using localStorage
    let storedUserId = localStorage.getItem("userId");
    if (!storedUserId) {
      storedUserId = Math.random().toString(36).substr(2, 9); // Generate a random ID
      localStorage.setItem("userId", storedUserId);

      // Increment total users in localStorage
      const newTotalUsers = totalUsers + 1;
      localStorage.setItem("totalUsers", newTotalUsers.toString());
      setAnalytics((prev) => ({ ...prev, totalUsers: newTotalUsers }));
    }

    // Cleanup: Decrement live users if an analysis is in progress when the component unmounts
    return () => {
      if (isLoading) {
        setAnalytics((prev) => {
          const newLive = Math.max(0, prev.live - 1);
          localStorage.setItem("liveUsersGenerating", newLive.toString());
          return { ...prev, live: newLive };
        });
      }
    };
  }, [isLoading]); // Added isLoading as a dependency for cleanup

  // Save analytics to localStorage whenever they change
  useEffect(() => {
    if (analytics.live > 0 || analytics.totalGenerated > 0 || analytics.totalUsers > 0) {
      localStorage.setItem("liveUsersGenerating", analytics.live.toString());
      localStorage.setItem("totalGenerated", analytics.totalGenerated.toString());
      localStorage.setItem("totalUsers", analytics.totalUsers.toString());
    }
  }, [analytics.live, analytics.totalGenerated, analytics.totalUsers]);

  // Simulate progress bar animation
  useEffect(() => {
    let interval;
    if (isLoading) {
      setProgress(0); // Start at 0
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 90) return prev + 10; // Gradually move to 90%
          return prev;
        });
      }, 300); // Update every 300ms
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Function to validate URL
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const handleAnalyze = async () => {
    // Validate URL
    if (!url) {
      setError("Please enter a URL to analyze!");
      return;
    }

    if (!isValidUrl(url)) {
      setError("Please enter a valid URL!");
      return;
    }

    setError("");
    setIsLoading(true);
    setSpeedData(null);

    // Increment live users generating
    setAnalytics((prev) => {
      const newLive = prev.live + 1;
      localStorage.setItem("liveUsersGenerating", newLive.toString());
      return { ...prev, live: newLive };
    });

    try {
      // Use Google PageSpeed Insights API for speed data
      const apiKey = "AIzaSyBen0ocEkPT6jz5H7lK7cBv3rFlnRGYSbI";
      const strategy = isMobile ? "mobile" : "desktop";
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
        url
      )}&strategy=${strategy}&key=${apiKey}`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      // Extract relevant data from the API response
      const score = Math.round(data.lighthouseResult.categories.performance.score * 100);
      const pageSize = (
        data.lighthouseResult.audits["total-byte-weight"].numericValue / (1024 * 1024)
      ).toFixed(2); // Convert bytes to MB
      const httpRequests = data.lighthouseResult.audits["network-requests"].details.items.length;

      // Use the custom API route to capture the screenshot
      const screenshotApiUrl = `/api/screenshot?url=${encodeURIComponent(url)}&isMobile=${isMobile}`;
      const screenshotResponse = await fetch(screenshotApiUrl);
      const screenshotData = await screenshotResponse.json();

      if (screenshotData.error) {
        throw new Error(screenshotData.error);
      }

      const speedData = {
        score,
        pageSize,
        httpRequests,
        screenshot: `data:image/png;base64,${screenshotData.screenshot}`, // Base64 screenshot
      };

      setSpeedData(speedData);

      // Increment total generated
      setAnalytics((prev) => {
        const newTotalGenerated = prev.totalGenerated + 1;
        localStorage.setItem("totalGenerated", newTotalGenerated.toString());
        return { ...prev, totalGenerated: newTotalGenerated };
      });
    } catch (error) {
      console.error("Error fetching speed data or screenshot:", error);
      setError("Failed to fetch speed data or screenshot. Please try again.");
    } finally {
      // Decrement live users generating
      setAnalytics((prev) => {
        const newLive = Math.max(0, prev.live - 1);
        localStorage.setItem("liveUsersGenerating", newLive.toString());
        return { ...prev, live: newLive };
      });
      setIsLoading(false);
      setProgress(100); // Ensure progress bar reaches 100%
    }
  };

  // Reset function to clear the form and results
  const handleReset = () => {
    setUrl("");
    setSpeedData(null);
    setError("");
    setIsLoading(false);
    setProgress(0);
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
            Website Speed Test
          </h1>
          <p className="text-center text-gray-600 mb-6 text-sm sm:text-base">
            Test your page load speed
          </p>

          {/* Toggle Buttons */}
          <div className="flex justify-center space-x-4 mb-6">
            <Toggle
              pressed={isMobile}
              onPressedChange={() => setIsMobile(true)}
              className={`px-4 py-2 rounded-full text-sm sm:text-base ${
                isMobile ? "bg-black text-white" : "border bg-black text-white"
              }`}
            >
              Mobile
            </Toggle>
            <Toggle
              pressed={!isMobile}
              onPressedChange={() => setIsMobile(false)}
              className={`px-4 py-2 rounded-full text-sm sm:text-base ${
                !isMobile ? "bg-black text-white" : "border bg-black text-white"
              }`}
            >
              Desktop
            </Toggle>
          </div>

          {/* Input Field */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6">
            <Input
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="mb-4 text-sm sm:text-base"
            />
            {error && <p className="text-red-500 mb-4 text-sm sm:text-base">{error}</p>}
            <div className="flex justify-center space-x-4">
              <Button
                onClick={handleAnalyze}
                className="bg-green-600 text-white px-4 sm:px-6 py-2 text-sm sm:text-base"
                disabled={isLoading}
              >
                <Sparkle /> {isLoading ? "Analyzing..." : "Analyze"}
              </Button>
              {speedData && (
                <Button
                  onClick={handleReset}
                  className="bg-black text-white px-4 sm:px-6 py-2 text-sm sm:text-base"
                >
                  <RefreshCcw /> Reset
                </Button>
              )}
            </div>
            {isLoading && (
              <div className="mt-4">
                <Progress value={progress} className="w-full" />
              </div>
            )}
          </div>

          {/* Speed Test Results */}
          {speedData && (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">Page speed score</h2>
              <div className="flex flex-col sm:flex-row sm:space-x-6">
                {/* Left Section: Screenshot and Details */}
                <div className="w-full sm:w-2/3 mb-6 sm:mb-0">
                  <div className="mb-4">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">Screenshot</h3>
                    <div className="border p-4 rounded-lg">
                      {speedData.screenshot ? (
                        <Image
                          src={speedData.screenshot}
                          alt="Page Screenshot"
                          width={500} // Arbitrary width, adjust as needed
                          height={300} // Arbitrary height, adjust as needed
                          className="w-full h-auto rounded-lg"
                          onError={() => console.log("Error loading screenshot")}
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500 rounded-lg">
                          Screenshot not available
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold">Site</h3>
                      <p className="text-blue-600 text-sm sm:text-base">{url}</p>
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold">Page size</h3>
                      <p className="text-gray-600 text-sm sm:text-base">
                        {speedData.pageSize} MB
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold">HTTP requests</h3>
                      <p className="text-gray-600 text-sm sm:text-base">
                        {speedData.httpRequests}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Section: Speed Score */}
                <div className="w-full sm:w-1/3">
                  <Card className="border-none shadow-none">
                    <CardHeader>
                      <CardTitle className="text-center text-sm sm:text-base font-semibold text-gray-800">
                        Total speed score
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-4">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="3"
                          />
                          <path
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="3"
                            strokeDasharray={`${speedData.score}, 100`}
                            strokeDashoffset="0"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl sm:text-3xl font-bold text-gray-800">
                            {speedData.score}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm sm:text-base font-semibold text-gray-800">
                        Your result: {speedData.score}/100
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 mt-2">
                        Your page loads fast and provides an outstanding user experience.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Statistics Section */}
          <div className="mt-6 bg-gray-50 rounded-md p-6 shadow-sm">
            <h2 className="text-md font-semibold mb-2">Statistics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Live Users Generating</p>
                <span className="text-black text-2xl font-bold">{analytics.live}</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Generated</p>
                <p className="text-black text-2xl font-bold">{analytics.totalGenerated}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Users</p>
                <p className="text-black text-2xl font-bold">{analytics.totalUsers}</p>
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