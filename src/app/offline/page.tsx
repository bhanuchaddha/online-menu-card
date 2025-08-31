'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WifiOff, RefreshCw, Home, Menu } from 'lucide-react'
import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <WifiOff className="h-8 w-8 text-gray-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            You're Offline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-gray-600">
            <p className="mb-4">
              It looks like you're not connected to the internet. Don't worry - MenuCard works offline too!
            </p>
            <p>
              You can still browse cached menus and restaurant profiles. Once you're back online, everything will sync up.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => window.location.reload()}
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>

            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>

            <Link href="/dashboard" className="block">
              <Button variant="outline" className="w-full">
                <Menu className="w-4 h-4 mr-2" />
                View Dashboard
              </Button>
            </Link>
          </div>

          <div className="text-sm text-gray-500 pt-4 border-t">
            <p className="mb-2 font-medium">What works offline:</p>
            <ul className="text-left space-y-1">
              <li>• Browse cached menus</li>
              <li>• View restaurant profiles</li>
              <li>• Access your dashboard</li>
              <li>• Queue menu uploads</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
