
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
  experimental: {
    allowedDevOrigins: [
      'https://6000-firebase-studio-1747392932640.cluster-c3a7z3wnwzapkx3rfr5kz62dac.cloudworkstations.dev',
    ],
  },
};

export default nextConfig;
