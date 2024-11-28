/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Enable standalone output for Docker
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000']
    },
  },
  // Configure image optimization
  images: {
    unoptimized: true,
  },
  // Ensure we can access the app in Docker and process styles correctly
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    }
    return config
  },
  // Ensure CSS modules work in standalone mode
  transpilePackages: ['@/app'],
  poweredByHeader: false,
};

module.exports = nextConfig;
