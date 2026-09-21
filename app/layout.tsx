import type {Metadata} from 'next';
import './globals.css';
import './blog.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'Dat Truong — Backend AI Engineer',
  description: 'Portfolio of Dat Truong, an Information Technology student and Backend AI Engineering Intern.',
  icons: {
    icon: [
      {url: '/pictures/favicon-32x32.png', sizes: '32x32', type: 'image/png'},
      {url: '/pictures/favicon-16x16.png', sizes: '16x16', type: 'image/png'}
    ],
    apple: '/pictures/apple-touch-icon.png'
  },
  manifest: '/pictures/site.webmanifest',
  openGraph: {
    title: 'Dat Truong — Backend AI Engineer',
    description: 'Interactive portfolio, experience, education and projects of Dat Truong.',
    type: 'website',
    images: [{url: '/pictures/img-main.png', alt: 'Dat Truong portrait'}]
  },
  twitter: {card: 'summary_large_image'}
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,300;0,400;0,500;0,600;0,700&family=IBM+Plex+Sans:ital,wght@0,400;0,600;0,700&family=Mali:wght@400;500;600;700&family=Pacifico&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
