/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', // allow resume PDF uploads
    },
  },
};

module.exports = nextConfig;
