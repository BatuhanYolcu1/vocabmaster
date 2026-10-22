import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  // Microphone is needed for the speaking mode.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=()' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
  // Keep links from v2 working.
  async redirects() {
    return [
      { source: '/study/select', destination: '/study', permanent: true },
      { source: '/study/complete', destination: '/study', permanent: true },
      { source: '/wordlists', destination: '/lists', permanent: true },
      { source: '/wordlists/new', destination: '/lists/new', permanent: true },
      { source: '/wordlists/import', destination: '/lists/import', permanent: true },
      { source: '/wordlists/:id/add', destination: '/lists/:id', permanent: true },
      { source: '/wordlists/:id', destination: '/lists/:id', permanent: true },
      { source: '/categories', destination: '/library', permanent: true },
      { source: '/explore', destination: '/library', permanent: true },
      { source: '/statistics', destination: '/stats', permanent: true },
      { source: '/profile', destination: '/settings', permanent: true },
      { source: '/checkout', destination: '/pricing', permanent: true },
    ];
  },
};

export default nextConfig;
