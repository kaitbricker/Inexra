/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use experimental option for Next.js 14.2.3
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
};

export default nextConfig;
