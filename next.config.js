/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: '"lh3.googleusercontent.com"',
        port: "",
        search: "",
      },
      {
        protocol: "https",
        hostname: '"avatars.githubusercontent.com"',
        port: "",
        search: "",
      },
    ],
  },
  // experimental: {
  //   serverActions: true,
  // },
};

module.exports = nextConfig;
