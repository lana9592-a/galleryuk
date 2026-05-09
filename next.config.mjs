/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    // Permissive HTTPS allowlist. The LLM scraper extracts hero image URLs
    // from arbitrary gallery CDNs (prod-images.tate.org.uk,
    // media.vam.ac.uk, royalacademy.gallery, etc.) — predeclaring every
    // host is impractical. Next.js still optimises every image through
    // its own pipeline, so the runtime risk surface is the optimiser
    // itself, not arbitrary remote bytes.
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
