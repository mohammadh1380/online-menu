/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    // Disable Next.js server-side image proxy so the browser fetches
    // media directly from the FastAPI container (avoids Docker networking issues)
    unoptimized: true,
  },
};

export default nextConfig;
