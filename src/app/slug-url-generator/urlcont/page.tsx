'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, RefreshCcw, FileJson2 } from 'lucide-react';
import Image from "next/image";
import Link from "next/link";

// Function to generate an SEO-friendly slug from a title
const generateSlug = (title) => {
  return title
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading/trailing spaces
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
}

export default function SlugGenerator() {
  const [singleTitle, setSingleTitle] = useState('') // Single title input
  const [bulkTitles, setBulkTitles] = useState(['', '', '', '', '']) // Bulk titles (up to 5)
  const [generatedSingleSlug, setGeneratedSingleSlug] = useState('') // Single slug output
  const [generatedBulkSlugs, setGeneratedBulkSlugs] = useState([]) // Bulk slugs output
  const [copyStatus, setCopyStatus] = useState('') // Copy status message

  // Handle single title change
  const handleSingleTitleChange = (value) => {
    setSingleTitle(value)
    setGeneratedSingleSlug('') // Reset output when typing
  }

  // Handle bulk title change
  const handleBulkTitleChange = (index, value) => {
    const updatedTitles = [...bulkTitles]
    updatedTitles[index] = value
    setBulkTitles(updatedTitles)
    setGeneratedBulkSlugs([]) // Reset output when typing
  }

  // Generate single slug
  const generateSingleSlugHandler = () => {
    if (singleTitle.trim()) {
      const slug = generateSlug(singleTitle)
      setGeneratedSingleSlug(slug)
    }
  }

  // Generate bulk slugs
  const generateBulkSlugsHandler = () => {
    const slugs = bulkTitles
      .map((title) => (title.trim() ? generateSlug(title) : ''))
      .filter(Boolean) // Remove empty slugs
    setGeneratedBulkSlugs(slugs)
  }

  // Reset form
  const resetForm = () => {
    setSingleTitle('')
    setBulkTitles(['', '', '', '', ''])
    setGeneratedSingleSlug('')
    setGeneratedBulkSlugs([])
    setCopyStatus('')
  }

  // Copy single slug to clipboard
  const handleCopySingle = () => {
    navigator.clipboard.writeText(generatedSingleSlug)
    setCopyStatus('Single slug copied to clipboard!')
    setTimeout(() => setCopyStatus(''), 2000)
  }

  // Copy bulk slugs to clipboard
  const handleCopyBulk = () => {
    const bulkText = generatedBulkSlugs.join('\n')
    navigator.clipboard.writeText(bulkText)
    setCopyStatus('Bulk slugs copied to clipboard!')
    setTimeout(() => setCopyStatus(''), 2000)
  }

  const shareOnWhatsApp = () => {
    const message = `Check out this awesome Loan EMI Calculator:\n\nhttps://yourwebsite.com/loan-emi-calculator`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="container mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
    {/* Left Section - Calculator */}
    <div className="md:col-span-8 bg-white p-6 rounded-lg shadow-md">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Slug/URL Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="single" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">Single URL</TabsTrigger>
              <TabsTrigger value="bulk">Bulk URL</TabsTrigger>
            </TabsList>

            {/* Single URL Tab */}
            <TabsContent value="single" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="single-title">Single Title</Label>
                <Input
                  id="single-title"
                  value={singleTitle}
                  onChange={(e) => handleSingleTitleChange(e.target.value)}
                  placeholder="Enter a title (e.g., SEO Tools List)"
                />
              </div>
              <Button onClick={generateSingleSlugHandler} className="w-full">
              <FileJson2 /> Generate Single Slug
              </Button>
              {generatedSingleSlug && (
                <div className="space-y-2">
                  <Label>Generated Slug</Label>
                  <Textarea
                    value={generatedSingleSlug}
                    readOnly
                    className="bg-white p-4 rounded-md h-20"
                  />
                  <div className="flex space-x-2">
                    <Button onClick={handleCopySingle} className="flex-1 bg-blue-500 text-white">
                    <Copy /> Copy
                    </Button>
                    <Button variant="destructive" onClick={resetForm} className="flex-1">
                     <RefreshCcw /> Reset
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Bulk URL Tab */}
            <TabsContent value="bulk" className="space-y-4">
              <div className="space-y-2">
                <Label>Bulk Titles (Up to 5)</Label>
                {bulkTitles.map((title, index) => (
                  <Input
                    key={index}
                    value={title}
                    onChange={(e) => handleBulkTitleChange(index, e.target.value)}
                    placeholder={`Title ${index + 1} (e.g., SEO Master Tools)`}
                  />
                ))}
              </div>
              <Button onClick={generateBulkSlugsHandler} className="w-full">
               <FileJson2 /> Generate Bulk Slugs
              </Button>
              {generatedBulkSlugs.length > 0 && (
                <div className="space-y-2">
                  <Label>Generated Slugs</Label>
                  <Textarea
                    value={generatedBulkSlugs.join('\n')}
                    readOnly
                    className="bg-white p-4 rounded-md h-40"
                  />
                  <div className="flex space-x-2">
                    <Button onClick={handleCopyBulk} className="flex-1 bg-blue-500 text-white">
                    <Copy /> Copy
                    </Button>
                    <Button variant="destructive" onClick={resetForm} className="flex-1">
                    <RefreshCcw /> Reset
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
          {copyStatus && (
            <p className="text-red-500 text-sm mt-4">{copyStatus}</p>
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
  )
}