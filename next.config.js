/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // ✅ FIXED

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

experimental: {
    serverActions: {
      bodySizeLimit: "100mb", // Keeps your large file upload support
      // ✅ ADDED: Allow PayTabs to talk to your server
      allowedOrigins: ["secure.paytabs.sa", "atlantis.sa"],
    },
  },
};

module.exports = nextConfig;

