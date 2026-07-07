/** @type {import('next').NextConfig} */

const backendUrl = (process.env.BACKEND_URL ?? '').replace(/\/$/, '')
const isDev = process.env.NODE_ENV === 'development'

function devHostname() {
  try {
    return new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').hostname
  } catch {
    return 'localhost'
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  skipTrailingSlashRedirect: true,

  // LAN access in dev (e.g. http://192.168.1.40:3000) — set NEXT_PUBLIC_APP_URL in .env
  ...(isDev ? { allowedDevOrigins: [devHostname(), 'localhost'] } : {}),

  async rewrites() {
    if (!backendUrl) return []
    return [{ source: '/api/:path*', destination: `${backendUrl}/:path*/` }]
  },
}

export default nextConfig
