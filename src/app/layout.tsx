import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/session-provider'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MenuCard - AI-Powered Digital Menus',
  description: 'Transform your restaurant menu into a beautiful digital experience with AI',
  keywords: 'restaurant, menu, digital menu, AI, food, dining',
  authors: [{ name: 'MenuCard Team' }],
  openGraph: {
    title: 'MenuCard - AI-Powered Digital Menus',
    description: 'Transform your restaurant menu into a beautiful digital experience with AI',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  )
}