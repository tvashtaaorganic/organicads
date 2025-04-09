'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import Link from "next/link";
import { Sparkle, RefreshCw, Copy, Globe } from "lucide-react";

export default function SiteFetcher() {
  const [domain, setDomain] = useState('');
  const [siteData, setSiteData] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [error, setError] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const [showFavicon, setShowFavicon] = useState(true);
  const [showRating, setShowRating] = useState(true);
  const [showDate, setShowDate] = useState(true);
  const [device, setDevice] = useState('desktop');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const fetchSiteData = async () => {
    if (!domain.trim()) {
      setSiteData(null);
      setError('Domain is required');
      return;
    }

    setError('');
    setIsLoading(true);
    setProgress(10);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => (prev < 80 ? prev + 10 : prev));
      }, 300);

      const response = await fetch('/api/fetchsite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });

      const data = await response.json();

      clearInterval(progressInterval);
      setProgress(100);

      if (data.error) throw new Error(data.error);

      setSiteData(data);
      setEditedTitle(data.pageTitle);
      setEditedDescription(data.metaDescription);
    } catch (err) {
      console.error('Fetch Error:', err);
      setError('Failed to fetch site data: ' + err.message);
      setSiteData(null);
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(0), 500);
    }
  };

  const resetForm = () => {
    setDomain('');
    setSiteData(null);
    setEditedTitle('');
    setEditedDescription('');
    setError('');
    setCopyStatus('');
    setShowFavicon(true);
    setShowRating(true);
    setShowDate(true);
    setDevice('desktop');
    setIsLoading(false);
    setProgress(0);
  };

  const handleCopy = () => {
    if (siteData) {
      const content = `Title: ${editedTitle}\nDescription: ${editedDescription}\n${showRating ? `Rating: ${siteData.rating} ★★★★☆ (${siteData.reviews} reviews)\n` : ''}${showDate ? `Date: ${siteData.date}\n` : ''}Characters: Title: ${editedTitle.length}, Description: ${editedDescription.length}`;
      navigator.clipboard.writeText(content);
      setCopyStatus('Copied to clipboard!');
      setTimeout(() => setCopyStatus(''), 2000);
    }
  };

  useEffect(() => {
    if (siteData) {
      setEditedTitle(siteData.pageTitle);
      setEditedDescription(siteData.metaDescription);
    }
  }, [siteData]);

  const shareOnWhatsApp = () => {
    const message = `Check out this awesome Loan EMI Calculator:\n\nhttps://yourwebsite.com/loan-emi-calculator`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="container mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Left Section - Calculator */}
      <div className="md:col-span-8 bg-white p-6 rounded-lg shadow-md">
      <Card className="w-full mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">SERP Snippet Preview Generator</CardTitle>
          <p className="text-sm text-muted-foreground">Fetch and preview website details based on a domain.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Enter Domain</h3>
            <div className="flex space-x-2 items-center">
              <div className="flex-1">
                <Label htmlFor="domain" className="block mb-2">URL</Label>
                <Input
                  id="domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value.trim().replace(/^https?:\/\//, ''))}
                  placeholder="e.g., example.com"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={fetchSiteData}
                className="bg-blue-500 hover:bg-blue-600 text-white mt-5"
                disabled={isLoading}
              >
                <Sparkle /> {isLoading ? 'Fetching...' : 'FETCH'}
              </Button>
            </div>
            {isLoading && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Fetching data...</p>
                <Progress value={progress} className="w-full" />
              </div>
            )}
            <div className="flex space-x-4">
              <Button
                variant={device === 'desktop' ? 'default' : 'outline'}
                onClick={() => setDevice('desktop')}
                disabled={isLoading}
              >
                Desktop
              </Button>
              <Button
                variant={device === 'mobile' ? 'default' : 'outline'}
                onClick={() => setDevice('mobile')}
                disabled={isLoading}
              >
                Mobile
              </Button>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {siteData && !isLoading && (
              <div className="mt-6 space-y-6">
                {/* Editable Title */}
                <div className="bg-white p-4 rounded-lg shadow mt-6 space-y-6">
                <div>
                  <Label htmlFor="editedTitle" className="block mb-2">Edit Title</Label>
                  <Input
                    id="editedTitle"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    placeholder="Edit title here"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Character count: {editedTitle.length}
                  </p>
                </div>
                {/* Editable Description */}
                <div>
                  <Label htmlFor="editedDescription" className="block mb-2">Edit Description</Label>
                  <Input
                    id="editedDescription"
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    placeholder="Edit description here"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Character count: {editedDescription.length}
                  </p>
                </div>
                </div>

                {/* Preview */}
                <div style={{ maxWidth: device === 'mobile' ? '320px' : '720px', padding: '10px', border: '1px solid #dfe1e5', borderRadius: '8px', backgroundColor: '#fff' }}>
                  <div className="flex items-center space-x-2">
                    {showFavicon && siteData.faviconUrl && (
                      <img
                        src={siteData.faviconUrl}
                        alt="Favicon"
                        className="w-6 h-6 mr-2 mt-4"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <div>
                      <div className="flex items-center space-x-1">
                        <span className="text-red-500 text-sm"><Globe className="w-4 h-4" /></span>
                        <a href={`http://${domain}`} target="_blank" rel="noopener noreferrer" className="text-green-700 text-sm">
                          {domain}
                        </a>
                      </div>
                      <div className="text-blue-600 text-lg font-semibold">{editedTitle}</div>
                    </div>
                  </div>
                  {showRating && (
                    <div className="flex items-center space-x-2 mb-3 mt-3">
                      <span className="text-yellow-400">★★★★☆</span>
                      <span className="text-black">Rating: {siteData.rating} - {siteData.reviews} reviews</span>
                    </div>
                  )}
                  <p className="text-gray-600 mb-3 mt-3 space-x-2">
                    {showDate && <span className="text-black">{siteData.date} - </span>}
                    {editedDescription}
                  </p>
                  <div className="flex space-x-2 mb-5 mt-5">
                    <Button variant="outline" onClick={handleCopy} className="flex-1">
                    <Copy /> Copy to Clipboard
                    </Button>
                    <Button variant="destructive" onClick={resetForm} className="flex-1">
                      <RefreshCw /> Reset
                    </Button>
                  </div>
                  <div className="flex space-x-4 mb-3 mt-5">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="showFavicon"
                        checked={showFavicon}
                        onCheckedChange={(checked) => setShowFavicon(checked)}
                      />
                      <Label htmlFor="showFavicon">Show Favicon</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="showRating"
                        checked={showRating}
                        onCheckedChange={(checked) => setShowRating(checked)}
                      />
                      <Label htmlFor="showRating">Show Rating</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="showDate"
                        checked={showDate}
                        onCheckedChange={(checked) => setShowDate(checked)}
                      />
                      <Label htmlFor="showDate">Show Date</Label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {copyStatus && <p className="text-red-500 text-sm mt-4">{copyStatus}</p>}
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

        <section className="mt-12 prose max-w-none opacity-100 transform-none">
          <h2 className="text-2xl font-semibold mb-4">
            About Loan EMI Calculator
          </h2>
          <div className="space-y-4">
            <p>
              Our Loan EMI Calculator helps you plan your loans better by
              calculating your Equated Monthly Installments (EMI) based on the
              loan amount, interest rate, and tenure. This tool is essential for
              making informed decisions about loans and understanding your
              financial commitments.
            </p>
            <h3 className="text-xl font-medium">Features:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>EMI Calculation:</strong> Calculate your monthly loan
                payments
              </li>
              <li>
                <strong>Interest Breakdown:</strong> See total interest payable
              </li>
              <li>
                <strong>Loan Analysis:</strong> View total payment including
                principal and interest
              </li>
              <li>
                <strong>Flexible Inputs:</strong> Adjust values using sliders or
                enter them directly
              </li>
            </ul>
            <h3 className="text-xl font-medium">Common Uses:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Home loan planning</li>
              <li>Car loan calculations</li>
              <li>Personal loan assessment</li>
              <li>Business loan analysis</li>
              <li>Education loan planning</li>
            </ul>
            <h3 className="text-xl font-medium">How to Use:</h3>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Enter the loan amount using the slider or input field</li>
              <li>Set the interest rate</li>
              <li>Choose the loan tenure in years</li>
              <li>View your monthly EMI amount</li>
              <li>Check the total interest and payment details</li>
            </ol>
            <p>
              The calculator provides instant results as you adjust the values,
              helping you understand how different loan parameters affect your
              monthly payments. This makes it easier to choose a loan that fits
              your budget and financial goals.
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