/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'example.com'],
  },
  // env: {
  //   "/api": 'http://localhost:5000/api',
  // },
  // experimental: {
  //   appDir: true,
  // },
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'development'
          ? 'http://localhost:5000/api/:path*'
          : '/.netlify/functions/api/:path*',
      },
    ]
  }
}

export default nextConfig