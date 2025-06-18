/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static generation for problematic routes
  experimental: {
    // Disable client reference manifests
    clientReferenceManifest: false,
  },
  // Ensure proper handling of dynamic routes
  trailingSlash: false,
};

export default nextConfig;
