/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  images: {
    // ✅ ADDED: Modern compression formats for the speed boost
    formats: ['image/avif', 'image/webp'],
    
    // Kept your existing Cloudinary config
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

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