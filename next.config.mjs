/** @type {import('next').NextConfig} */
const nextConfig = {
  // Minimal configuration to avoid build issues
  webpack: (config, { isServer }) => {
    // Handle client reference manifest issue
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('@prisma/client');
    }
    return config;
  },
};

export default nextConfig;
