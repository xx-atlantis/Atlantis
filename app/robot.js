export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/', // ⚠️ Blocks Google from indexing your admin panel
    },
    sitemap: 'https://atlantis.sa/sitemap.xml', 
  }
}