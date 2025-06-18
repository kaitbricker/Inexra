/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use the new serverExternalPackages option for Prisma
  serverExternalPackages: ['@prisma/client'],
};

export default nextConfig;
