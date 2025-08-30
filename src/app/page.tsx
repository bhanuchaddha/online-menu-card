'use client'
import { useEffect, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Camera, Plus, Menu, ArrowRight, Users, Clock, Star, MapPin, Phone, Globe, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface Restaurant {
  id: string
  name: string
  description?: string
  address?: string
  phone?: string
  website?: string
  slug: string
  menuCount: number
  latestMenu?: any
}

export default function HomePage() {
  const { data: session } = useSession()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadRestaurants()
  }, [])

  const loadRestaurants = async () => {
    try {
      const response = await fetch('/api/restaurants/public')
      if (response.ok) {
        const data = await response.json()
        setRestaurants(data.restaurants)
      }
    } catch (error) {
      console.error('Error loading restaurants:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getPreviewCategories = (restaurant: Restaurant) => {
    if (!restaurant.latestMenu?.extractedData?.categories) return []
    return restaurant.latestMenu.extractedData.categories.slice(0, 3)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Menu className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">MenuCard</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/how-it-works">
              <Button variant="outline">How it Works</Button>
            </Link>
            {session ? (
              <Link href="/dashboard">
                <Button>Manage My Restaurant</Button>
              </Link>
            ) : (
              <Button onClick={() => signIn('google')} className="bg-blue-600 hover:bg-blue-700">
                Add Your Restaurant
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Discover Amazing 
            <span className="text-blue-600"> Restaurant Menus</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Browse digital menus from restaurants around you. Restaurant owners can easily 
            create beautiful digital menus by taking a photo - our AI does the rest!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {session ? (
              <Link href="/dashboard">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Camera className="w-5 h-5 mr-2" />
                  Add Your Restaurant
                </Button>
              </Link>
            ) : (
              <Button size="lg" onClick={() => signIn('google')} className="bg-blue-600 hover:bg-blue-700">
                <Camera className="w-5 h-5 mr-2" />
                List Your Restaurant
              </Button>
            )}
            <Link href="/how-it-works">
              <Button size="lg" variant="outline">
                <Plus className="w-5 h-5 mr-2" />
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Restaurant Directory */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Restaurants</h2>
            <Badge variant="secondary" className="text-sm">
              {restaurants.length} Restaurant{restaurants.length !== 1 ? 's' : ''} Listed
            </Badge>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({length: 6}).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <div className="text-center py-16">
              <Menu className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No restaurants yet</h3>
              <p className="text-gray-500 mb-6">Be the first restaurant to join MenuCard!</p>
              {!session && (
                <Button onClick={() => signIn('google')} className="bg-blue-600 hover:bg-blue-700">
                  Add Your Restaurant
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <Card key={restaurant.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="group-hover:text-blue-600 transition-colors">
                          {restaurant.name}
                        </CardTitle>
                        {restaurant.description && (
                          <CardDescription className="mt-2">
                            {restaurant.description}
                          </CardDescription>
                        )}
                      </div>
                      <Badge variant="secondary">
                        {restaurant.menuCount} menu{restaurant.menuCount !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Restaurant Info */}
                    <div className="space-y-2 mb-4">
                      {restaurant.address && (
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="w-4 h-4 mr-2" />
                          {restaurant.address}
                        </div>
                      )}
                      {restaurant.phone && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="w-4 h-4 mr-2" />
                          {restaurant.phone}
                        </div>
                      )}
                      {restaurant.website && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Globe className="w-4 h-4 mr-2" />
                          <a 
                            href={restaurant.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-blue-600"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Menu Preview */}
                    {getPreviewCategories(restaurant).length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Menu Categories:</p>
                        <div className="flex flex-wrap gap-1">
                          {getPreviewCategories(restaurant).map((category: any, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {category.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <Link href={`/menu/${restaurant.slug}`}>
                      <Button className="w-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        View Menu
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Camera className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle>1. Take a Photo</CardTitle>
              <CardDescription>
                Simply snap a picture of your physical menu with your phone
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>2. AI Extraction</CardTitle>
              <CardDescription>
                Our AI automatically extracts items, prices, and descriptions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <ArrowRight className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle>3. Share Instantly</CardTitle>
              <CardDescription>
                Get a beautiful, shareable link for your digital menu
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Stats */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="flex items-center justify-center mb-2">
                <Users className="h-6 w-6 text-blue-600 mr-2" />
                <span className="text-3xl font-bold text-gray-900">{restaurants.length}+</span>
              </div>
              <p className="text-gray-600">Restaurants Listed</p>
            </div>
            
            <div>
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-6 w-6 text-green-600 mr-2" />
                <span className="text-3xl font-bold text-gray-900">2 min</span>
              </div>
              <p className="text-gray-600">Average Setup Time</p>
            </div>
            
            <div>
              <div className="flex items-center justify-center mb-2">
                <Star className="h-6 w-6 text-yellow-500 mr-2" />
                <span className="text-3xl font-bold text-gray-900">4.9/5</span>
              </div>
              <p className="text-gray-600">Customer Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Menu className="h-6 w-6" />
            <span className="text-xl font-bold">MenuCard</span>
          </div>
          <p className="text-gray-400">
            Making restaurant menus accessible, beautiful, and easy to share.
          </p>
        </div>
      </footer>
    </div>
  )
}