/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Use the correct experimental option for Next.js 14
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  // Disable static generation for API routes to prevent client reference manifest issues
  trailingSlash: false,
  // Ensure proper output for Vercel
  output: 'standalone',
};

export default nextConfig;
