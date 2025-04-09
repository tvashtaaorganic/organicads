import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const NextConfig = {
  images: {
    domains: ["res.cloudinary.com", "instagram.com", "cdninstagram.com", "scontent.cdninstagram.com"], // Allow images from Cloudinary
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, // Skips type checking during build
  },
};

module.exports = NextConfig;
