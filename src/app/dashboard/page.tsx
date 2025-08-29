'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MenuCamera } from '@/components/camera/menu-camera'
import { MenuList } from '@/components/menu/menu-list'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Camera, Plus, Settings, LogOut, Store, Menu } from 'lucide-react'
import { toast } from 'sonner'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showCamera, setShowCamera] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [refreshMenus, setRefreshMenus] = useState(0)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  const handleImageCapture = async (imageSrc: string) => {
    setIsExtracting(true)
    setShowCamera(false)
    
    try {
      const response = await fetch('/api/menu/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData: imageSrc }),
      })

      if (!response.ok) {
        throw new Error('Failed to extract menu')
      }

      const result = await response.json()
      console.log('Extraction result:', result)
      
      toast.success('Menu extracted and saved successfully!')
      // Refresh the menu list
      setRefreshMenus(prev => prev + 1)
      
    } catch (error) {
      console.error('Menu extraction error:', error)
      toast.error('Failed to extract menu. Please try again.')
    } finally {
      setIsExtracting(false)
    }
  }

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
            <Menu className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {session.user?.name}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Camera className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle>Extract Menu from Photo</CardTitle>
              <CardDescription>
                Take a photo of your menu and let AI extract all items automatically
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={showCamera} onOpenChange={setShowCamera}>
                <DialogTrigger asChild>
                  <Button className="w-full" disabled={isExtracting}>
                    {isExtracting ? 'Extracting...' : 'Start Camera'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Capture Menu Photo</DialogTitle>
                  </DialogHeader>
                  <MenuCamera 
                    onCapture={handleImageCapture}
                    onCancel={() => setShowCamera(false)}
                  />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Create Menu Manually</CardTitle>
              <CardDescription>
                Build your menu from scratch with our easy-to-use editor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Create New Menu
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Store className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle>Restaurant Profile</CardTitle>
              <CardDescription>
                Set up your restaurant information and branding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Setup Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Menu Management */}
        <MenuList key={refreshMenus} />
      </div>

      {/* Loading overlay for menu extraction */}
      {isExtracting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-8 max-w-sm">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Extracting Menu...</h3>
              <p className="text-gray-600">Our AI is reading your menu. This may take a few moments.</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
