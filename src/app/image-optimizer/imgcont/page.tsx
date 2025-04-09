"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react"; // Removed Send and RefreshCw
import Image from "next/image";
import Link from "next/link";

// Function to format size in appropriate unit
const formatSize = (bytes: number) => {
  if (bytes >= 1099511627776) return (bytes / 1099511627776).toFixed(2) + " TB";
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + " GB";
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(2) + " KB";
  return bytes + " B";
};

export default function ImageOptimizer() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ type: string; [key: string]: any } | null>(null);
  const [loading, setLoading] = useState(false);
  const [compressionType, setCompressionType] = useState<"lossy" | "lossless" | "custom">("lossy");
  const [reductionPercent, setReductionPercent] = useState<number>(0);
  const [stats, setStats] = useState({ users: 0, imagesConverted: 0, totalSizeReduced: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sliderValue, setSliderValue] = useState(50); // Initial slider position

  // Load stats from localStorage on mount and fetch initial stats
  useEffect(() => {
    const savedStats = localStorage.getItem("imageOptimizerStats");
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }

    const fetchStats = async () => {
      try {
        const response = await fetch("/api/optimize-image", { method: "GET" });
        const data = await response.json();
        if (data.error) {
          console.error("Stats error:", data.error);
        } else {
          // Merge server stats with local stats, prioritizing local for persistence
          const mergedStats = {
            users: data.stats.users, // Keep live user count from server
            imagesConverted: Math.max(
              data.stats.imagesConverted,
              JSON.parse(savedStats || '{"imagesConverted": 0}').imagesConverted
            ),
            totalSizeReduced: Math.max(
              data.stats.totalSizeReduced,
              JSON.parse(savedStats || '{"totalSizeReduced": 0}').totalSizeReduced
            ),
          };
          setStats(mergedStats);
          localStorage.setItem("imageOptimizerStats", JSON.stringify(mergedStats));
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/optimize-image", { method: "GET" });
      const data = await response.json();
      if (data.error) {
        console.error("Stats error:", data.error);
      } else {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    console.log("Selected file:", selectedFile);
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    console.log("Dropped file:", droppedFile);
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const optimizeImage = async () => {
    if (!file) {
      setResult({ type: "error", message: "Please select an image to optimize!" });
      return;
    }

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("compressionType", compressionType);
    formData.append("reductionPercent", reductionPercent.toString());
    console.log("Sending FormData entries:", Array.from(formData.entries()));

    try {
      const response = await fetch("/api/optimize-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("API Response:", data);
      if (data.error) {
        setResult({ type: "error", message: data.error });
      } else {
        setResult({
          type: "success",
          ...data,
        });
        // Update stats with new data and save to localStorage
        const newStats = {
          users: stats.users, // Keep live user count (could fetch again if needed)
          imagesConverted: stats.imagesConverted + 1,
          totalSizeReduced: stats.totalSizeReduced + (data.originalSize - data.compressedSize),
        };
        setStats(newStats);
        localStorage.setItem("imageOptimizerStats", JSON.stringify(newStats));
        fetchStats(); // Optional: Sync with server if needed
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setResult({ type: "error", message: "An error occurred while optimizing the image." });
    } finally {
      setLoading(false);
    }
  };

  const clearResult = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle slider movement
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderValue(parseInt(e.target.value));
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const slider = document.querySelector("[data-image-comparison-slider]");
      const thumb = document.querySelector("[data-image-comparison-thumb]");
      const range = document.querySelector("[data-image-comparison-range]");
      if (range && thumb && slider) {
        let position = e.clientY - range.getBoundingClientRect().top - 20;
        if (position <= 0) position = 0;
        if (position >= range.offsetHeight - 40) position = range.offsetHeight - 40;
        thumb.style.top = `${position}px`;
      }
    };

    const sliderRange = document.querySelector("[data-image-comparison-range]");
    if (sliderRange) {
      sliderRange.addEventListener("mousemove", handleMouseMove);
      sliderRange.addEventListener("input", handleSliderChange as any); // Type assertion due to event mismatch
      sliderRange.addEventListener("change", handleSliderChange as any);
      sliderRange.addEventListener("mouseup", () => {
        sliderRange.classList.remove("image-comparison__range--active");
      });
      sliderRange.addEventListener("mousedown", () => {
        sliderRange.classList.add("image-comparison__range--active");
      });
    }

    return () => {
      if (sliderRange) {
        sliderRange.removeEventListener("mousemove", handleMouseMove);
        sliderRange.removeEventListener("input", handleSliderChange as any);
        sliderRange.removeEventListener("change", handleSliderChange as any);
        sliderRange.removeEventListener("mouseup", () => {
          sliderRange.classList.remove("image-comparison__range--active");
        });
        sliderRange.removeEventListener("mousedown", () => {
          sliderRange.classList.add("image-comparison__range--active");
        });
      }
    };
  }, []);

  const shareOnWhatsApp = () => {
    const message = `Check out this awesome Image Optimizer:\n\nhttps://yourwebsite.com/image-optimizer`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="container mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Left Section - Calculator */}
      <div className="md:col-span-8 bg-white p-6 rounded-lg shadow-md">
        <div className="bg-white p-6 rounded-lg shadow-md w-full">
          <h1 className="text-3xl font-bold text-center mb-6">Image Optimizer</h1>

          <div className="mb-4 flex justify-center space-x-4">
            <Button
              variant={compressionType === "lossy" ? "default" : "outline"}
              onClick={() => setCompressionType("lossy")}
              title="Adjusts quality dynamically to reduce file size with some loss in quality."
            >
              Lossy
            </Button>
            <Button
              variant={compressionType === "lossless" ? "default" : "outline"}
              onClick={() => setCompressionType("lossless")}
              title="Reduces file size without losing quality using optimized coding."
            >
              Lossless
            </Button>
            <Button
              variant={compressionType === "custom" ? "default" : "outline"}
              onClick={() => setCompressionType("custom")}
              title="Resizes image to a percentage of original width (e.g., 70% for 30% reduction) with fixed quality 70."
            >
              Custom
            </Button>
          </div>

          <div className="mb-4 flex justify-center space-x-2">
            <Button
              variant={reductionPercent === 20 ? "default" : "outline"}
              onClick={() => setReductionPercent(20)}
            >
              20%
            </Button>
            <Button
              variant={reductionPercent === 30 ? "default" : "outline"}
              onClick={() => setReductionPercent(30)}
            >
              30%
            </Button>
            <Button
              variant={reductionPercent === 50 ? "default" : "outline"}
              onClick={() => setReductionPercent(50)}
            >
              50%
            </Button>
            <Button
              variant={reductionPercent === 60 ? "default" : "outline"}
              onClick={() => setReductionPercent(60)}
            >
              60%
            </Button>
            <Button
              variant={reductionPercent === 80 ? "default" : "outline"}
              onClick={() => setReductionPercent(80)}
            >
              80%
            </Button>
          </div>

          <div
            className="border-2 border-dashed border-red-500 p-6 text-center mb-4"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/jpeg,image/png,image/gif,image/webp"
            />
            {file ? (
              <p className="text-gray-700">Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)</p>
            ) : (
              <p className="text-gray-700">
                Drop your image here or click to Browse<br />
                compress .jpg, .png, .gif, .webp. Max 10 MB
              </p>
            )}
          </div>

          <div className="flex justify-center mb-4">
            <Button
              onClick={optimizeImage}
              disabled={loading || !file}
              className="bg-blue-600 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Optimizing...
                </>
              ) : (
                "Optimize Image"
              )}
            </Button>
          </div>

          {result && (
            <Alert
              variant={result.type === "error" ? "destructive" : "default"}
              className={`mb-4 ${result.type === "success" ? "border-green-500" : ""}`}
            >
              <AlertTitle>{result.type === "error" ? "Error" : "Optimization Result"}</AlertTitle>
              <AlertDescription>
                {result.type === "error" ? (
                  result.message
                ) : (
                  <>
                    <p>
                      <strong>Name:</strong> {result.originalName}
                    </p>
                    <p>
                      <strong>Before:</strong> {(result.originalSize / 1024).toFixed(2)} KB
                    </p>
                    <p>
                      <strong>After:</strong> {(result.compressedSize / 1024).toFixed(2)} KB
                    </p>
                    <p>
                      <strong>Saved:</strong> {result.savings}% (
                      {((result.originalSize - result.compressedSize) / 1024).toFixed(2)} KB)
                    </p>
                    <a
                      href={result.downloadUrl}
                      download={result.originalName}
                      className="text-blue-600 underline mt-2 inline-block"
                    >
                      Download Optimized Image
                    </a>
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={clearResult} className="text-red-500">
                Clear Result
              </Button>
            </div>
          )}

          <div className="mt-6 mb-6">
            <h2 className="text-lg font-semibold mb-2">Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Active Users (last 5 min)</p>
                <p className="text-xl font-bold">{stats.users}</p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Images Converted</p>
                <p className="text-xl font-bold">{stats.imagesConverted}</p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Size Reduced</p>
                <p className="text-xl font-bold">{formatSize(stats.totalSizeReduced)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Image Comparison Slider */}
        <section
          className="image-comparison max-w-[48.063em] mx-auto mt-6"
          data-component="image-comparison-slider"
        >
          <div className="image-comparison__slider-wrapper relative">
            <label
              htmlFor="image-comparison-range"
              className="image-comparison__label text-gray-700 text-lg text-center font-semibold mb-2 block z-20"
            >
              Move image comparison slider
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={sliderValue}
              className="image-comparison__range absolute top-0 left-0 w-full h-full m-0 p-0 bg-transparent border-none appearance-none outline-none cursor-ew-resize z-20"
              id="image-comparison-range"
              data-image-comparison-range=""
              onChange={handleSliderChange}
            />

            <div
              className="image-comparison__image-wrapper image-comparison__image-wrapper--overlay absolute top-0 left-0 w-[calc(50%+1px)] h-full overflow-hidden"
              data-image-comparison-overlay=""
              style={{ width: `${sliderValue}%` }}
            >
              <figure className="image-comparison__figure image-comparison__figure--overlay relative">
                <picture className="image-comparison__picture">
                  <img
                    src="https://res.cloudinary.com/djiki7tvo/image/upload/v1743832922/before_ar5jzz.jpg"
                    alt="Before Image"
                    className="image-comparison__image absolute top-0 left-0 w-full h-full object-cover object-center z-10"
                  />
                </picture>
              </figure>
            </div>

            <div
              className="image-comparison__slider absolute top-0 left-1/2 w-0.5 h-full bg-white transition-colors duration-300 z-10"
              data-image-comparison-slider=""
              style={{ left: `${sliderValue}%` }}
            >
              <span
                className="image-comparison__thumb absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full shadow-lg transition-transform duration-300"
                data-image-comparison-thumb=""
              >
                <svg
                  className="image-comparison__thumb-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="10"
                  viewBox="0 0 18 10"
                  fill="currentColor"
                >
                  <path
                    className="image-comparison__thumb-icon--left"
                    d="M12.121 4.703V.488c0-.302.384-.454.609-.24l4.42 4.214a.33.33 0 0 1 0 .481l-4.42 4.214c-.225.215-.609.063-.609-.24V4.703z"
                  ></path>
                  <path
                    className="image-comparison__thumb-icon--right"
                    d="M5.879 4.703V.488c0-.302-.384-.454-.609-.24L.85 4.462a.33.33 0 0 0 0 .481l4.42 4.214c.225.215.609.063.609-.24V4.703z"
                  ></path>
                </svg>
              </span>
            </div>

            <div className="image-comparison__image-wrapper relative pt-[66.666666667%]">
              <figure className="image-comparison__figure absolute top-0 left-0 w-full h-full">
                <picture className="image-comparison__picture">
                  <img
                    src="https://res.cloudinary.com/djiki7tvo/image/upload/v1743832922/before_ar5jzz.jpg"
                    alt="After Image"
                    className="image-comparison__image absolute top-0 left-0 w-full h-full object-cover object-center"
                    style={{ filter: "grayscale(10%)" }} // Simulate compressed effect
                  />
                </picture>
                <figcaption className="image-comparison__caption image-comparison__caption--before absolute bottom-3 left-3 text-left min-w-max flex flex-col text-white font-bold uppercase text-sm md:text-base z-20">
                  <span className="image-comparison__caption-body px-3 py-1.5 bg-black/55">Before</span>
                </figcaption>
                <figcaption className="image-comparison__caption image-comparison__caption--after absolute bottom-3 right-3 text-right min-w-max flex flex-col text-white font-bold uppercase text-sm md:text-base z-20">
                  <span className="image-comparison__caption-body px-3 py-1.5 bg-black/55">After</span>
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

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
          <h2 className="text-2xl font-semibold mb-4">About Image Optimizer</h2>
          <div className="space-y-4">
            <p>
              Our Image Optimizer is a powerful tool designed to reduce the file size of your images without compromising quality (or with controlled loss). Whether you’re optimizing for web performance, saving storage space, or preparing images for faster loading, this tool offers flexible compression options.
            </p>
            <h3 className="text-xl font-medium">Features:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Compression Types:</strong> Choose between Lossy, Lossless, or Custom compression.
              </li>
              <li>
                <strong>Reduction Control:</strong> Select predefined reduction percentages (20% to 80%).
              </li>
              <li>
                <strong>Drag & Drop:</strong> Easily upload images via drag-and-drop or file selection.
              </li>
              <li>
                <strong>Stats Tracking:</strong> Monitor total images converted and size reduced.
              </li>
            </ul>
            <h3 className="text-xl font-medium">Common Uses:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Website performance optimization</li>
              <li>Email attachment size reduction</li>
              <li>Social media image preparation</li>
              <li>E-commerce product image compression</li>
              <li>Personal photo storage management</li>
            </ul>
            <h3 className="text-xl font-medium">How to Use:</h3>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Select a compression type (Lossy, Lossless, or Custom).</li>
              <li>Choose a reduction percentage if applicable.</li>
              <li>Drop or browse an image file (up to 10 MB).</li>
              <li>Click "Optimize Image" to process.</li>
              <li>Download the optimized image and clear results as needed.</li>
            </ol>
            <p>
              This tool provides real-time feedback on file size savings and supports popular image formats like JPG, PNG, GIF, and WebP, making it ideal for developers, designers, and everyday users alike.
            </p>
          </div>
        </section>
      </div>

      {/* Right Section - Quick Tips */}
      <div className="md:col-span-4 bg-white p-6 rounded-lg shadow-md space-y-6">
        <div className="bg-blue-100 rounded-lg p-4">
          <h3 className="font-medium text-lg mb-2">Quick Tips</h3>
          <ul className="text-sm space-y-2">
            <li>• Drag and drop images for quick uploads</li>
            <li>• Use Lossless for quality, Lossy for max reduction</li>
            <li>• Check stats for your optimization impact</li>
          </ul>
        </div>
        <div className="bg-muted rounded-lg p-4">
          <h4 className="font-semibold mb-2">Optimizer Stats</h4>
          <p className="text-sm">Trusted by developers and designers</p>
          <p className="text-xs mt-1 text-muted-foreground">Over 10,000 images optimized daily</p>
        </div>

        <div className="bg-muted rounded-lg p-4">
          <Image
            src="https://res.cloudinary.com/djiki7tvo/image/upload/v1743084283/website-redesign_kex22a.webp"
            alt="Best Web Development Company in Bangalore"
            width={500}
            height={300}
            className="w-full rounded-lg mb-3"
          />
          <h3 className="font-medium text-xl mb-2">Best Web Development Company in Bangalore</h3>

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
          </div>

          <p className="text-sm mb-4">
            🎯 We build your business into a Brand. 🌐 Helping Businesses Increase Leads, Traffic &
            Sales!. 🚀 Google, Bing Rank Your Web Page in Just 4 Hours!. 🚀 Web Design | Digital
            Marketing | SEO, SEM, SMM | Google, Meta Ads | Branding
          </p>
          <Link href="https://www.organicads.in/" target="_blank" rel="noopener noreferrer">
            <button className="w-full bg-primary text-white font-medium py-2 rounded-md hover:bg-primary/90 transition">
              Check details
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}