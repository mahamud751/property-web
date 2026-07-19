/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // Silence multi-lockfile root inference (parent ~/package-lock.json)
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
