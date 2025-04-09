"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import qrcode from "qrcode-generator";
import { nanoid } from "nanoid";
import Image from "next/image";
import Link from "next/link";
import { Link2 } from "lucide-react";

export default function URLShortenerPage() {
  const [longUrl, setLongUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [domain, setDomain] = useState("xyz.ly"); // Default domain
  const [customDomain, setCustomDomain] = useState("");
  const [expirationType, setExpirationType] = useState("none");
  const [expirationValue, setExpirationValue] = useState("");
  const [password, setPassword] = useState("");
  const [shortenedLinks, setShortenedLinks] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [bulkUrls, setBulkUrls] = useState([]);
  const [isPremium] = useState(false); // Simulate premium access, no setter needed
  const qrCodeRef = useRef(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedLinks = localStorage.getItem("shortenedLinks");
    const storedAnalytics = localStorage.getItem("analytics");
    if (storedLinks) setShortenedLinks(JSON.parse(storedLinks));
    if (storedAnalytics) setAnalytics(JSON.parse(storedAnalytics));
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("shortenedLinks", JSON.stringify(shortenedLinks));
    localStorage.setItem("analytics", JSON.stringify(analytics));
  }, [shortenedLinks, analytics]);

  // Generate QR Code
  useEffect(() => {
    if (!qrCodeRef.current || !shortenedLinks.length) return;

    const latestLink = shortenedLinks[shortenedLinks.length - 1];
    if (!latestLink) return;

    const qr = qrcode(0, "L");
    qr.addData(latestLink.shortUrl);
    qr.make();
    const qrSvg = qr.createSvgTag({ scalable: true });
    const svgBlob = new Blob([qrSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);
    qrCodeRef.current.innerHTML = `<img src="${url}" style="width: 200px; height: 200px;" />`;
  }, [shortenedLinks]);

  const shortenUrl = () => {
    if (!longUrl.trim()) return;

    // Validate URL
    try {
      new URL(longUrl);
    } catch {
      alert("Please enter a valid URL.");
      return;
    }

    // Generate slug
    const slug = customSlug.trim() || nanoid(8);
    const selectedDomain = customDomain.trim() || domain;
    const shortUrl = `https://${selectedDomain}/${slug}`;

    // Check for duplicate slug
    if (shortenedLinks.some((link) => link.shortUrl === shortUrl)) {
      alert("This slug is already in use. Please choose a different one.");
      return;
    }

    // Simulate analytics data
    const clickData = {
      clicks: 0,
      geo: "Unknown",
      device: "Unknown",
      os: "Unknown",
      browser: "Unknown",
      referrer: "Direct",
      history: [],
    };

    const newLink = {
      id: nanoid(),
      longUrl,
      shortUrl,
      slug,
      domain: selectedDomain,
      expirationType,
      expirationValue: expirationType !== "none" ? expirationValue : null,
      password: password.trim() || null,
      createdAt: new Date().toISOString(),
    };

    setShortenedLinks([...shortenedLinks, newLink]);
    setAnalytics({ ...analytics, [newLink.id]: clickData });

    // Reset form
    setLongUrl("");
    setCustomSlug("");
    setExpirationType("none");
    setExpirationValue("");
    setPassword("");
  };

  const handleBulkUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target.result;
      const lines = csv.split("\n").map((line) => line.trim()).filter((line) => line);
      const urls = lines.slice(1).map((line) => {
        const [longUrl] = line.split(",");
        return longUrl;
      });

      const newLinks = urls.map((url) => {
        const slug = nanoid(8);
        const selectedDomain = customDomain.trim() || domain;
        const shortUrl = `https://${selectedDomain}/${slug}`;
        const clickData = {
          clicks: 0,
          geo: "Unknown",
          device: "Unknown",
          os: "Unknown",
          browser: "Unknown",
          referrer: "Direct",
          history: [],
        };

        const newLink = {
          id: nanoid(),
          longUrl: url,
          shortUrl,
          slug,
          domain: selectedDomain,
          expirationType: "none",
          expirationValue: null,
          password: null,
          createdAt: new Date().toISOString(),
        };

        setAnalytics((prev) => ({ ...prev, [newLink.id]: clickData }));
        return newLink;
      });

      setShortenedLinks((prev) => [...prev, ...newLinks]);
    };
    reader.readAsText(file);
  };

  const downloadBulkLinks = (format) => {
    if (!bulkUrls.length) return;

    if (format === "csv") {
      const csvContent = [
        "Long URL,Short URL",
        ...bulkUrls.map((link) => `${link.longUrl},${link.shortUrl}`),
      ].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "shortened-links.csv";
      link.click();
    } else if (format === "json") {
      const jsonContent = JSON.stringify(bulkUrls, null, 2);
      const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "shortened-links.json";
      link.click();
    }
  };

  const trackClick = (linkId) => {
    const link = shortenedLinks.find((l) => l.id === linkId);
    if (!link) return;

    // Check expiration
    if (link.expirationType === "date") {
      const expirationDate = new Date(link.expirationValue);
      if (new Date() > expirationDate) {
        alert("This link has expired.");
        return;
      }
    } else if (link.expirationType === "clicks") {
      const clicks = analytics[linkId]?.clicks || 0;
      if (clicks >= parseInt(link.expirationValue)) {
        alert("This link has reached its click limit.");
        return;
      }
    }

    // Check password
    if (link.password) {
      const enteredPassword = prompt("Enter password to access this link:");
      if (enteredPassword !== link.password) {
        alert("Incorrect password.");
        return;
      }
    }

    // Simulate analytics data
    setAnalytics((prev) => {
      const linkAnalytics = prev[linkId] || { clicks: 0, history: [] };
      return {
        ...prev,
        [linkId]: {
          ...linkAnalytics,
          clicks: linkAnalytics.clicks + 1,
          geo: "Unknown",
          device: "Mobile",
          os: "iOS",
          browser: "Safari",
          referrer: "Direct",
          history: [
            ...linkAnalytics.history,
            { date: new Date().toISOString(), clicks: linkAnalytics.clicks + 1 },
          ],
        },
      };
    });

    // Redirect to long URL
    window.open(link.longUrl, "_blank");
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
          {/* Dark Mode Toggle */}
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">URL Shortener</h1>
          </div>

          {/* URL Shortener Form */}
          <Card className="dark:bg-gray-800 dark:text-gray-100 mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Shorten a URL</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white p-4 rounded-lg border mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="long-url" className="mb-2">Long URL</Label>
                    <Input
                      id="long-url"
                      type="text"
                      value={longUrl}
                      onChange={(e) => setLongUrl(e.target.value)}
                      placeholder="https://example.com/very/long/url"
                    />
                  </div>
                  <div>
                    <Label htmlFor="custom-slug" className="mb-2">Custom Slug (Optional)</Label>
                    <Input
                      id="custom-slug"
                      type="text"
                      value={customSlug}
                      onChange={(e) => setCustomSlug(e.target.value)}
                      placeholder="e.g., sale2025"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="domain" className="mb-2">Domain</Label>
                    <Select value={domain} onValueChange={setDomain}>
                      <SelectTrigger id="domain">
                        <SelectValue placeholder="Select Domain" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="xyz.ly">xyz.ly</SelectItem>
                        <SelectItem value="short.link">short.link</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="custom-domain" className="mb-2">Custom Domain (Optional)</Label>
                    <Input
                      id="custom-domain"
                      type="text"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      placeholder="e.g., mystore.in"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="expiration-type" className="mb-2">Expiration Type</Label>
                    <Select value={expirationType} onValueChange={setExpirationType}>
                      <SelectTrigger id="expiration-type">
                        <SelectValue placeholder="Select Expiration Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="date">Expiration Date</SelectItem>
                        <SelectItem value="clicks">Click Limit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {expirationType !== "none" && (
                    <div>
                      <Label htmlFor="expiration-value" className="mb-2">
                        {expirationType === "date" ? "Expiration Date" : "Click Limit"}
                      </Label>
                      <Input
                        id="expiration-value"
                        type={expirationType === "date" ? "date" : "number"}
                        value={expirationValue}
                        onChange={(e) => setExpirationValue(e.target.value)}
                        placeholder={expirationType === "date" ? "Select date" : "Enter click limit"}
                      />
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <Label htmlFor="password" className="mb-2">Password (Optional)</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Set a password for this link"
                  />
                </div>

                <Button onClick={shortenUrl} className="bg-blue-600 text-white">
                  <Link2 /> Shorten URL
                </Button>
              </div>

              {shortenedLinks.length > 0 && (
                <div className="bg-white p-4 rounded-lg border mb-4">
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Latest Shortened URL</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Short URL:{" "}
                      <a
                        href="#"
                        onClick={() => trackClick(shortenedLinks[shortenedLinks.length - 1].id)}
                        className="text-blue-600"
                      >
                        {shortenedLinks[shortenedLinks.length - 1].shortUrl}
                      </a>
                    </p>
                    <div className="flex justify-center mt-2" ref={qrCodeRef}></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Custom Domain Guide */}
          <Card className="dark:bg-gray-800 dark:text-gray-100 mb-6">
            <CardHeader>
              <CardTitle>Custom Domain Setup Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                To use a custom domain (e.g., mystore.in), follow these steps:
              </p>
              <ol className="list-decimal list-inside mt-2 text-sm text-gray-600 dark:text-gray-400">
                <li>Add a CNAME record in your DNS settings pointing to our server (e.g., cname.xyz.ly).</li>
                <li>Enter your custom domain in the field above.</li>
                <li>Wait for DNS propagation (up to 48 hours).</li>
                <li>Start creating branded short links!</li>
              </ol>
            </CardContent>
          </Card>

          {/* Shortened Links Table */}
          {shortenedLinks.length > 0 && (
            <Card className="dark:bg-gray-800 dark:text-gray-100 mb-6">
              <CardHeader>
                <CardTitle>Shortened Links</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Short URL</TableHead>
                      <TableHead>Long URL</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shortenedLinks.map((link) => (
                      <TableRow key={link.id}>
                        <TableCell>
                          <a
                            href="#"
                            onClick={() => trackClick(link.id)}
                            className="text-blue-600"
                          >
                            {link.shortUrl}
                          </a>
                        </TableCell>
                        <TableCell>{link.longUrl}</TableCell>
                        <TableCell>{analytics[link.id]?.clicks || 0}</TableCell>
                        <TableCell>{new Date(link.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Analytics Dashboard */}
          {shortenedLinks.length > 0 && (
            <Card className="dark:bg-gray-800 dark:text-gray-100 mb-6">
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                {shortenedLinks.map((link) => (
                  <div key={link.id} className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">{link.shortUrl}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Clicks: {analytics[link.id]?.clicks || 0}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Geo: {analytics[link.id]?.geo || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Device: {analytics[link.id]?.device || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          OS: {analytics[link.id]?.os || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Browser: {analytics[link.id]?.browser || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Referrer: {analytics[link.id]?.referrer || "Direct"}
                        </p>
                      </div>
                      <div>
                        <LineChart
                          width={300}
                          height={200}
                          data={analytics[link.id]?.history || []}
                          className="dark:text-gray-100"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="clicks" stroke="#2563eb" />
                        </LineChart>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Bulk URL Shortening (Premium Feature) */}
          <Card className="dark:bg-gray-800 dark:text-gray-100">
            <CardHeader>
              <CardTitle>Bulk URL Shortening (Premium)</CardTitle>
            </CardHeader>
            <CardContent>
              {isPremium ? (
                <div>
                  <Label>Upload CSV (Format: Long URL)</Label>
                  <div className="border-2 border-dashed border-gray-300 p-4 text-center rounded-md dark:border-gray-600">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Drag & drop your CSV here or{" "}
                      <label className="text-blue-600 cursor-pointer">
                        click to upload
                        <input
                          type="file"
                          accept=".csv"
                          className="hidden"
                          onChange={handleBulkUpload}
                        />
                      </label>
                    </p>
                  </div>
                  {shortenedLinks.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      <Button
                        onClick={() => {
                          setBulkUrls(shortenedLinks);
                          downloadBulkLinks("csv");
                        }}
                      >
                        Download as CSV
                      </Button>
                      <Button
                        onClick={() => {
                          setBulkUrls(shortenedLinks);
                          downloadBulkLinks("json");
                        }}
                      >
                        Download as JSON
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upgrade to premium to unlock bulk URL shortening.
                </p>
              )}
            </CardContent>
          </Card>
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