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
  },

  api: {
    bodyParser: {
      sizeLimit: "100mb", // support large videos + images
    },
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

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Enable the most advanced compression formats
    formats: ['image/avif', 'image/webp'],
    // If you load images from external URLs (like AWS S3 or a CMS), add domains here
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-external-domain.com',
      },
    ],
  },
}

module.exports = nextConfig