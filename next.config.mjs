/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'www.tate.org.uk' },
      { protocol: 'https', hostname: 'www.nationalgallery.org.uk' },
      { protocol: 'https', hostname: 'www.vam.ac.uk' },
      { protocol: 'https', hostname: 'www.royalacademy.org.uk' },
      { protocol: 'https', hostname: 'www.serpentinegalleries.org' },
      { protocol: 'https', hostname: 'www.southbankcentre.co.uk' },
      { protocol: 'https', hostname: 'www.whitechapelgallery.org' },
      { protocol: 'https', hostname: 'courtauld.ac.uk' },
      { protocol: 'https', hostname: 'saatchigallery.com' },
    ],
  },
};

export default nextConfig;
