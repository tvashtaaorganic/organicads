'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image";
import Link from "next/link";
import { Copy, RefreshCcw, Tag } from "lucide-react";


// Main component
export default function OGTagGenerator() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [siteName, setSiteName] = useState('')
  const [siteUrl, setSiteUrl] = useState('')
  const [facebookType, setFacebookType] = useState('article')
  const [numImages, setNumImages] = useState('1')
  const [imageUrls, setImageUrls] = useState([''])
  const [twitterCardType, setTwitterCardType] = useState('summary_large_image')
  const [twitterDomain, setTwitterDomain] = useState('')
  const [twitterTitle, setTwitterTitle] = useState('')
  const [twitterDescription, setTwitterDescription] = useState('')
  const [generatedTags, setGeneratedTags] = useState('')
  const [copyStatus, setCopyStatus] = useState('')

  // Handle image URL change
  const handleImageUrlChange = (index, value) => {
    const updatedUrls = [...imageUrls]
    updatedUrls[index] = value
    setImageUrls(updatedUrls)
  }

  // Add new image URL input
  const addImageUrl = () => {
    if (imageUrls.length < parseInt(numImages)) {
      setImageUrls([...imageUrls, ''])
    }
  }

  // Generate OG and Twitter tags
  const generateTags = () => {
    // Required fields check (Title, Description, Site Name)
    if (!title.trim() || !description.trim() || !siteName.trim()) {
      setGeneratedTags('')
      return
    }

    // Build tags
    let tags = ''
    
    // Facebook Meta Tags
    tags += `<!-- Facebook Meta Tags -->\n`
    if (siteUrl.trim()) tags += `<meta property="og:url" content="${siteUrl.trim()}">\n`
    tags += `<meta property="og:type" content="${facebookType}">\n`
    tags += `<meta property="og:title" content="${title.trim()}">\n`
    tags += `<meta property="og:description" content="${description.trim()}">\n`
    tags += `<meta property="og:site_name" content="${siteName.trim()}">\n`
    imageUrls.forEach((url, index) => {
      if (url.trim() && index < parseInt(numImages)) {
        tags += `<meta property="og:image" content="${url.trim()}">\n`
      }
    })

    // Twitter Meta Tags
    tags += `\n<!-- Twitter Meta Tags -->\n`
    tags += `<meta name="twitter:card" content="${twitterCardType}">\n`
    if (twitterDomain.trim()) tags += `<meta property="twitter:domain" content="${twitterDomain.trim()}">\n`
    if (siteUrl.trim()) tags += `<meta property="twitter:url" content="${siteUrl.trim()}">\n`
    if (twitterTitle.trim()) tags += `<meta name="twitter:title" content="${twitterTitle.trim()}">\n`
    if (twitterDescription.trim()) tags += `<meta name="twitter:description" content="${twitterDescription.trim()}">\n`
    imageUrls.forEach((url, index) => {
      if (url.trim() && index < parseInt(numImages)) {
        tags += `<meta name="twitter:image" content="${url.trim()}">\n`
      }
    })

    setGeneratedTags(tags)
  }

  // Reset form
  const resetForm = () => {
    setTitle('')
    setDescription('')
    setSiteName('')
    setSiteUrl('')
    setFacebookType('article')
    setNumImages('1')
    setImageUrls([''])
    setTwitterCardType('summary_large_image')
    setTwitterDomain('')
    setTwitterTitle('')
    setTwitterDescription('')
    setGeneratedTags('')
    setCopyStatus('')
  }

  // Copy to clipboard
  const handleCopy = () => {
    if (generatedTags) {
      navigator.clipboard.writeText(generatedTags)
      setCopyStatus('Copied to clipboard!')
      setTimeout(() => setCopyStatus(''), 2000)
    }
  }

  // Sync image URL inputs with number of images
  const handleNumImagesChange = (value) => {
    const num = parseInt(value)
    setNumImages(value)
    if (num < imageUrls.length) {
      setImageUrls(imageUrls.slice(0, num))
    } else if (num > imageUrls.length) {
      const newUrls = [...imageUrls]
      while (newUrls.length < num) newUrls.push('')
      setImageUrls(newUrls)
    }
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
          <CardTitle className="text-xl font-bold">Open Graph (OG) Tag Generator</CardTitle>
          <p className="text-sm text-muted-foreground">Create OG and Twitter tags for better social sharing previews.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Fill In Required Fields</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="og-title">Title</Label>
                <Input
                  id="og-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Your page title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="og-description">Description</Label>
                <Input
                  id="og-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., A brief description of your page"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="og-site-name">Site Name</Label>
                <Input
                  id="og-site-name"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="e.g., Your site name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="og-site-url">Site URL</Label>
                <Input
                  id="og-site-url"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  placeholder="e.g., https://yourdomain.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="og-type">Facebook Type</Label>
                <Select value={facebookType} onValueChange={setFacebookType}>
                  <SelectTrigger id="og-type" className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="article" defaultChecked>Article</SelectItem>
                    <SelectItem value="book">Book</SelectItem>
                    <SelectItem value="books.author">Book Author</SelectItem>
                    <SelectItem value="books.genre">Book Genre</SelectItem>
                    <SelectItem value="business.business">Business</SelectItem>
                    <SelectItem value="fitness.course">Fitness Course</SelectItem>
                    <SelectItem value="music.album">Music Album</SelectItem>
                    <SelectItem value="music.musician">Music Musician</SelectItem>
                    <SelectItem value="music.playlist">Music Playlist</SelectItem>
                    <SelectItem value="music.radio_station">Music Radio Station</SelectItem>
                    <SelectItem value="music.song">Music Song</SelectItem>
                    <SelectItem value="object">Object (Generic Object)</SelectItem>
                    <SelectItem value="place">Place</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="product.group">Product Group</SelectItem>
                    <SelectItem value="product.item">Product Item</SelectItem>
                    <SelectItem value="profile">Profile</SelectItem>
                    <SelectItem value="quick_election.election">Election</SelectItem>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="restaurant.menu">Restaurant Menu</SelectItem>
                    <SelectItem value="restaurant.menu_item">Restaurant Menu Item</SelectItem>
                    <SelectItem value="restaurant.menu_section">Restaurant Menu Section</SelectItem>
                    <SelectItem value="video.episode">Video Episode</SelectItem>
                    <SelectItem value="video.movie">Video Movie</SelectItem>
                    <SelectItem value="video.tv_show">Video TV Show</SelectItem>
                    <SelectItem value="video.other">Video Other</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="og-num-images">Number of Images</Label>
                <Select value={numImages} onValueChange={handleNumImagesChange}>
                  <SelectTrigger id="og-num-images" className="w-full">
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {Array.from({ length: parseInt(numImages) }, (_, i) => (
              <div key={i} className="space-y-2">
                <Label htmlFor={`og-image-${i}`}>Image {i + 1} URL</Label>
                <Input
                  id={`og-image-${i}`}
                  value={imageUrls[i] || ''}
                  onChange={(e) => handleImageUrlChange(i, e.target.value)}
                  placeholder="e.g., https://yourdomain.com/image.jpg"
                />
              </div>
            ))}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="twitter-card-type">Twitter Card Type</Label>
                <Select value={twitterCardType} onValueChange={setTwitterCardType}>
                  <SelectTrigger id="twitter-card-type" className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">Summary</SelectItem>
                    <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                    <SelectItem value="app">App</SelectItem>
                    <SelectItem value="player">Player</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter-domain">Twitter Domain</Label>
                <Input
                  id="twitter-domain"
                  value={twitterDomain}
                  onChange={(e) => setTwitterDomain(e.target.value)}
                  placeholder="e.g., yourdomain.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter-title">Twitter Title</Label>
                <Input
                  id="twitter-title"
                  value={twitterTitle}
                  onChange={(e) => setTwitterTitle(e.target.value)}
                  placeholder="e.g., Your Twitter title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter-description">Twitter Description</Label>
                <Input
                  id="twitter-description"
                  value={twitterDescription}
                  onChange={(e) => setTwitterDescription(e.target.value)}
                  placeholder="e.g., A brief Twitter description"
                />
              </div>
            </div>
            <Button onClick={generateTags} className="w-full">
            <Tag /> Generate Tags
            </Button>
            {generatedTags && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Result</h3>
                <Textarea
                  value={generatedTags}
                  readOnly
                  className="bg-white p-4 rounded-md h-60"
                />
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleCopy} className="flex-1">
                  <Copy /> Copy to Clipboard
                  </Button>
                  <Button variant="destructive" onClick={resetForm} className="flex-1">
                    <RefreshCcw /> Reset
                  </Button>
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