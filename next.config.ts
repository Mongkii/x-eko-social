
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Should be false in production
  },
  eslint: {
    ignoreDuringBuilds: true, // Should be false in production
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      // Add other image CDNs if used
    ],
  },
};

export default nextConfig;
