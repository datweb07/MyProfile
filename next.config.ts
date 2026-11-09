import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' }
];

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.web3forms.com",
  "form-action 'self' https://api.web3forms.com",
  'upgrade-insecure-requests'
].join('; ');

const nextConfig: NextConfig = {
  experimental: {
    cpus: 1
  },
  images: {
    formats: ['image/avif', 'image/webp']
  },
  poweredByHeader: false,
  async rewrites() {
    return [
      {
        source: '/quiz',
        destination: '/quiz/quiz.html'
      },
      {
        source: '/quiz-2',
        destination: '/quiz/quiz-2.html'
      },
      {
        source: '/quiz-3',
        destination: '/quiz/quiz-3.html'
      },
      {
        source: '/quiz-4',
        destination: '/quiz/quiz-4.html'
      },
      {
        source: '/quiz-5',
        destination: '/quiz/quiz-5.html'
      }
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          ...securityHeaders,
          ...(process.env.NODE_ENV === 'production' ? [{ key: 'Content-Security-Policy', value: contentSecurityPolicy }] : [])
        ]
      },
      {
        source: '/admin/:path*',
        headers: [{ key: 'Cache-Control', value: 'private, no-store, max-age=0' }]
      }
    ];
  }
};

export default nextConfig;
