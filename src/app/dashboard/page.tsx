'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut, Store, Menu as MenuIcon } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])


  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <MenuIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {session.user?.name}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
             <Link href="/dashboard/restaurant">
                <Button variant="outline" size="sm">
                  <Store className="h-4 w-4 mr-2" />
                  Manage Restaurant
                </Button>
              </Link>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card>
            <CardHeader>
                <CardTitle>Manage Your Restaurant & Menu</CardTitle>
                <CardDescription>
                You're all set to manage your restaurant profile and menu from one place.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Link href="/dashboard/restaurant">
                    <Button>
                        <Store className="h-4 w-4 mr-2" />
                        Go to Restaurant Management
                    </Button>
                </Link>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
