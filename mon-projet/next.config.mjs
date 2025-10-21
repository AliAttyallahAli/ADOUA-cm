/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',      // ⚠️ ESSENTIEL pour Netlify
    trailingSlash: true,
  reactStrictMode: true,
  images: {
        unoptimized: true   // ⚠️ Nécessaire pour l'export static
  },
    env: {
      "/api": 'http://localhost:5000',
    },
  // experimental: {
  //   appDir: true,
  // },
}

export default nextConfig