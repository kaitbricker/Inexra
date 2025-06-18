/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use the new serverExternalPackages instead of deprecated experimental option
  serverExternalPackages: ['@prisma/client'],
  // Ensure proper output configuration for Vercel
  output: 'standalone',
  // Add webpack configuration to handle Prisma
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client');
    }
    return config;
  },
};

export default nextConfig;
