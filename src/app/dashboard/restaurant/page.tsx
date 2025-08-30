'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LocationPicker } from '@/components/map/location-picker'
import { ArrowLeft, Save, Globe, Phone, MapPin, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface RestaurantData {
  id?: string
  name: string
  description?: string
  address?: string
  phone?: string
  website?: string
  latitude?: number | null
  longitude?: number | null
  slug?: string
}

export default function RestaurantProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [restaurant, setRestaurant] = useState<RestaurantData>({
    name: '',
    description: '',
    address: '',
    phone: '',
    website: '',
    latitude: null,
    longitude: null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    } else if (status === 'authenticated') {
      loadRestaurantProfile()
    }
  }, [status, router])

  const loadRestaurantProfile = async () => {
    try {
      const response = await fetch('/api/restaurant/profile')
      if (response.ok) {
        const data = await response.json()
        if (data.restaurant) {
          setRestaurant(data.restaurant)
        }
      }
    } catch (error) {
      console.error('Error loading restaurant profile:', error)
    } finally {
      setIsInitialLoading(false)
    }
  }

  const handleInputChange = (field: keyof RestaurantData, value: string) => {
    setRestaurant(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleLocationChange = (location: [number, number] | null) => {
    setRestaurant(prev => ({
      ...prev,
      latitude: location ? location[0] : null,
      longitude: location ? location[1] : null,
    }))
  }

  const handleAddressChange = (address: string) => {
    handleInputChange('address', address)
  }

  const handleSave = async () => {
    if (!restaurant.name.trim()) {
      toast.error('Restaurant name is required')
      return
    }

    setIsLoading(true)
    try {
      const restaurantData = {
        ...restaurant,
        slug: generateSlug(restaurant.name)
      }

      const response = await fetch('/api/restaurant/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(restaurantData),
      })

      if (response.ok) {
        const data = await response.json()
        setRestaurant(data.restaurant)
        toast.success('Restaurant profile saved successfully!')
      } else {
        throw new Error('Failed to save restaurant profile')
      }
    } catch (error) {
      console.error('Error saving restaurant profile:', error)
      toast.error('Failed to save restaurant profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const publicMenuUrl = restaurant.slug 
    ? `${window.location.origin}/menu/${restaurant.slug}`
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Restaurant Profile</h1>
              <p className="text-sm text-gray-600">Manage your restaurant information</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Form */}
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Information</CardTitle>
              <CardDescription>
                This information will be displayed on your public menu page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="name">Restaurant Name *</Label>
                <Input
                  id="name"
                  value={restaurant.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your restaurant name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={restaurant.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Tell customers about your restaurant..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="address"
                    value={restaurant.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="123 Main St, City, State 12345"
                    className="pl-10 mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={restaurant.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                    className="pl-10 mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="website"
                    value={restaurant.website || ''}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://yourrestaurant.com"
                    className="pl-10 mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Picker */}
          <LocationPicker
            initialLocation={
              restaurant.latitude && restaurant.longitude 
                ? [restaurant.latitude, restaurant.longitude] 
                : null
            }
            onLocationChange={handleLocationChange}
            address={restaurant.address || ''}
            onAddressChange={handleAddressChange}
          />

          <Card>
            <CardContent className="pt-6">
              <Button 
                onClick={handleSave} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Preview & Public Link */}
          <div className="space-y-6">
            {/* Public Menu Link */}
            {publicMenuUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Public Menu Link
                  </CardTitle>
                  <CardDescription>
                    Share this link with customers to view your menu
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <code className="text-sm break-all">{publicMenuUrl}</code>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        navigator.clipboard.writeText(publicMenuUrl)
                        toast.success('Link copied to clipboard!')
                      }}
                      className="flex-1"
                    >
                      Copy Link
                    </Button>
                    <Button 
                      onClick={() => window.open(publicMenuUrl, '_blank')}
                      className="flex-1"
                    >
                      View Public Menu
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Profile Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Preview</CardTitle>
                <CardDescription>
                  How customers will see your restaurant information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-white">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {restaurant.name || 'Restaurant Name'}
                  </h3>
                  
                  {restaurant.description && (
                    <p className="text-gray-600 mb-4">{restaurant.description}</p>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    {restaurant.address && (
                      <div className="flex items-center text-gray-500">
                        <MapPin className="w-4 h-4 mr-2" />
                        {restaurant.address}
                      </div>
                    )}
                    
                    {restaurant.phone && (
                      <div className="flex items-center text-gray-500">
                        <Phone className="w-4 h-4 mr-2" />
                        {restaurant.phone}
                      </div>
                    )}
                    
                    {restaurant.website && (
                      <div className="flex items-center text-gray-500">
                        <Globe className="w-4 h-4 mr-2" />
                        <a 
                          href={restaurant.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
