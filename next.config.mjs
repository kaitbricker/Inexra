/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Fix for client reference manifest issue in Next.js 15
    serverComponentsExternalPackages: ['@prisma/client'],
    // Disable client reference manifest for Vercel compatibility
    clientReferenceManifest: false,
  },
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
