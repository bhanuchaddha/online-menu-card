import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '../styles/leaflet-custom.css'
import { AuthProvider } from '@/components/providers/session-provider'
import { Toaster } from '@/components/ui/sonner'
import { PWAInstallPrompt } from '@/components/pwa/install-prompt'
import { RestaurantChatbot } from '@/components/chatbot/restaurant-chatbot'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563eb' },
    { media: '(prefers-color-scheme: dark)', color: '#1d4ed8' }
  ],
}

export const metadata: Metadata = {
  title: {
    default: 'MenuCard - AI-Powered Digital Menus',
    template: '%s | MenuCard'
  },
  description: 'Transform your restaurant menu into a beautiful digital experience with AI. Upload photos, get instant digital menus, and share with customers.',
  keywords: 'restaurant menu, digital menu, AI menu extraction, QR code menu, online menu, menu digitization',
  authors: [{ name: 'MenuCard Team' }],
  creator: 'MenuCard',
  publisher: 'MenuCard',
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'MenuCard - AI-Powered Digital Menus',
    description: 'Transform your restaurant menu into a beautiful digital experience with AI',
    siteName: 'MenuCard',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MenuCard - AI-Powered Digital Menus',
    description: 'Transform your restaurant menu into a beautiful digital experience with AI',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/icons/icon-512x512.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icons/icon-180x180.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-180x180.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MenuCard" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <PWAInstallPrompt />
          <RestaurantChatbot />
          <Toaster richColors position="top-right" />
        </AuthProvider>
        
        {/* Service Worker Registration */}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    console.log('SW registered: ', registration);
                  })
                  .catch(function(registrationError) {
                    console.log('SW registration failed: ', registrationError);
                  });
              });
            }
          `}
        </Script>
      </body>
    </html>
  )
}