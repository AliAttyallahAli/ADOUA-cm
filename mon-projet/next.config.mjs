/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'example.com'],
  },
  env: {
    "/api": 'http://localhost:5000',
  },
  // experimental: {
  //   appDir: true,
  // },
}

export default nextConfig