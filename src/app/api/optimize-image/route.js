import { NextResponse } from "next/server";
import sharp from "sharp";

// In-memory stats (reset on server restart)
let stats = {
  users: new Set(), // Use Set to track unique users based on timestamp
  imagesConverted: 0,
  totalSizeReduced: 0,
};
let lastUpdate = new Date();

// Function to update unique users based on a 5-minute window
const updateUniqueUsers = () => {
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  stats.users = new Set(
    Array.from(stats.users).filter((timestamp) => new Date(timestamp) > fiveMinutesAgo)
  );
  if (now.getTime() - lastUpdate.getTime() > 5 * 60 * 1000) {
    stats.users.clear(); // Reset after 5 minutes of inactivity
    lastUpdate = now;
  }
};

export async function POST(req) {
  try {
    console.log("Received POST request for image optimization");
    console.log("Request headers:", req.headers);

    // Get the form data from the request
    const formData = await req.formData();
    console.log("FormData entries:", Array.from(formData.entries()));

    const file = formData.get("image");
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "No file uploaded! Ensure a file is sent with the key 'image'." },
        { status: 400 }
      );
    }

    // Update unique users based on timestamp only on optimization
    const now = new Date().getTime();
    updateUniqueUsers();
    stats.users.add(now); // Add current timestamp as a unique "user" on optimization
    stats.imagesConverted += 1;

    const compressionType = formData.get("compressionType") || "lossy";
    const reductionPercent = parseInt(formData.get("reductionPercent")) || 0; // e.g., 20, 30, 50
    console.log("Compression type:", compressionType, "Reduction percent:", reductionPercent);

    // Convert file to buffer (in-memory processing)
    const arrayBuffer = await file.arrayBuffer();
    const originalBuffer = Buffer.from(arrayBuffer);
    const originalSize = originalBuffer.length;

    // Compress the image based on reduction percentage
    let compressedBuffer;
    let targetSize = originalSize * (1 - reductionPercent / 100);
    let quality = 80; // Start with reasonable quality
    let attempt = 0;
    const maxAttempts = 3;

    do {
      if (compressionType === "lossy") {
        compressedBuffer = await sharp(originalBuffer)
          .jpeg({ quality: quality, chromaSubsampling: "4:4:4", optimiseScans: true })
          .toBuffer();
      } else if (compressionType === "lossless") {
        compressedBuffer = await sharp(originalBuffer)
          .toFormat(file.type.split("/")[1], { effort: 6, optimiseCoding: true })
          .toBuffer();
      } else if (compressionType === "custom") {
        compressedBuffer = await sharp(originalBuffer)
          .resize({ width: Math.round((await sharp(originalBuffer).metadata()).width * (1 - reductionPercent / 100)) })
          .jpeg({ quality: 70, optimiseScans: true })
          .toBuffer();
      }

      const compressedSize = compressedBuffer.length;
      console.log(`Attempt ${attempt + 1}: Quality ${quality}, Compressed Size: ${compressedSize} bytes`);

      if (compressedSize > targetSize && attempt < maxAttempts - 1) {
        quality = Math.max(10, quality - 20); // Reduce quality by 20, but not below 10
        attempt++;
      } else {
        break;
      }
    } while (attempt < maxAttempts);

    if (!compressedBuffer) {
      throw new Error("Failed to compress image after multiple attempts.");
    }

    const compressedSize = compressedBuffer.length;
    const sizeReduced = originalSize - compressedSize;
    const savings = ((sizeReduced) / originalSize) * 100;

    stats.totalSizeReduced += sizeReduced; // Accumulate total size reduced

    // Return the compressed buffer as a downloadable response
    const downloadUrl = `data:${file.type};base64,${compressedBuffer.toString("base64")}`;
    return NextResponse.json({
      originalName: file.name,
      originalSize: originalSize,
      compressedSize: compressedSize,
      savings: savings.toFixed(2),
      downloadUrl: downloadUrl,
      status: "success",
    });
  } catch (error) {
    console.error("Error in image optimization:", error.message, error.stack);
    return NextResponse.json(
      { error: error.message || "An error occurred while optimizing the image." },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    updateUniqueUsers();
    return NextResponse.json({
      stats: {
        users: stats.users.size,
        imagesConverted: stats.imagesConverted,
        totalSizeReduced: stats.totalSizeReduced,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error.message, error.stack);
    return NextResponse.json(
      { error: "Failed to fetch stats." },
      { status: 500 }
    );
  }
}