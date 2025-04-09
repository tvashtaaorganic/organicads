import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const NextConfig = {
  images: {
    domains: ['res.cloudinary.com'], // Allow images from Cloudinary
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = NextConfig;
