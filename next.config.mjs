/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Use the correct experimental option for Next.js 14
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  // Add webpack configuration to handle Prisma
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client');
    }
    return config;
  },
};

export default nextConfig;
