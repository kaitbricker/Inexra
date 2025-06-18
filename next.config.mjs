/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Use the correct experimental option for Next.js 14
    serverComponentsExternalPackages: ['@prisma/client'],
    // Disable client reference manifests to prevent the error
    clientReferenceManifest: false,
  },
  // Disable static generation for API routes to prevent client reference manifest issues
  trailingSlash: false,
};

export default nextConfig;
