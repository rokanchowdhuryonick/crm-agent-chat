import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // This allows production builds to successfully complete even with ESLint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // This allows production builds to successfully complete even with TypeScript errors
    ignoreBuildErrors: true,
  },
  images: {
    // domains: ['127.0.0.1', 'localhost'],
    // Optional: If your API might change in production
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/public-files/**',
      },
      // Add production domain here when deployed
      {
        protocol: 'https',
        hostname: 'ai-agent-crm-backend.aisapiens.online',
        port: '',
        pathname: '/public-files/**',
      },
      {
        protocol: 'https',
        hostname: 'chat-cdn.aisapiens.online',
        port: '',
        pathname: '/chat_attachments/**',
      },
    ],
  },
};

export default nextConfig;
