import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Above the 5MB CV limit in src/lib/uploads.ts to leave room for
      // multipart/form-data overhead from the rest of the form fields.
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
