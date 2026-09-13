/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    formats: ["image/avif", "image/webp"],
    // domains: ["example.com"],
  },

  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },

  // Proxy example: map /backend/* to your LAN backend (adjust as needed)
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8082';
    return [
      {
        source: "/backend/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
