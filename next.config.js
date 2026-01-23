/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  // 1. Optimize Images (Crucial for Speed Score)
  images: {
    formats: ['image/avif', 'image/webp'], // The secret sauce for small files
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

  // 2. Allow large uploads (Your existing requirement)
  api: {
    bodyParser: {
      sizeLimit: "100mb",
    },
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
      allowedOrigins: ["secure.paytabs.sa", "atlantis.sa"],
    },
  },
};

module.exports = nextConfig;