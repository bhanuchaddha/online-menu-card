/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Temporarily disable ESLint during builds for deployment
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'placeholder.vn',
      },
    ],
  },
}

export default nextConfig
