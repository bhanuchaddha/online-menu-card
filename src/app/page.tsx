'use client'
import { useEffect, useState, useCallback } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Camera, Plus, Menu, ArrowRight, Users, Clock, Star, MapPin, Phone, Globe, ExternalLink, Search, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useDebounce } from 'use-debounce'

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

function RestaurantList({ restaurants }: { restaurants: Restaurant[] }) {
  if (restaurants.length === 0) {
    return (
      <div className="text-center py-16">
        <Menu className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No restaurants found</h3>
        <p className="text-gray-500">Try a different search term or check back later.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {restaurants.map(restaurant => (
        <Card key={restaurant.id} className="hover:shadow-lg transition-shadow duration-300 flex flex-col">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{restaurant.name}</CardTitle>
            <CardDescription>{restaurant.address}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-gray-600 mb-4">{restaurant.description}</p>
            {restaurant.latestMenu?.extractedData?.categories?.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Menu highlights:</h4>
                <div className="flex flex-wrap gap-2">
                  {restaurant.latestMenu.extractedData.categories.slice(0, 3).map((cat: any) => (
                    <Badge key={cat.name} variant="secondary">{cat.name}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <div className="p-6 pt-0">
            <Link href={`/menu/${restaurant.slug}`}>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                View Full Menu ({restaurant.menuCount}) <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </Card>
      ))}
    </div>
  )
}

export default function HomePage() {
  const { data: session } = useSession()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300)

  const loadRestaurants = useCallback(async () => {
    setIsLoading(true)
    try {
      const endpoint = debouncedSearchTerm 
        ? `/api/search?q=${encodeURIComponent(debouncedSearchTerm)}`
        : '/api/restaurants/public'
        
      const response = await fetch(endpoint)
      if (response.ok) {
        const data = await response.json()
        setRestaurants(data.restaurants)
      }
    } catch (error) {
      console.error('Error loading restaurants:', error)
    } finally {
      setIsLoading(false)
    }
  }, [debouncedSearchTerm])

  useEffect(() => {
    loadRestaurants()
  }, [loadRestaurants])


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Menu className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">MenuCard</span>
          </Link>
          
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
            Browse digital menus from restaurants around you. Find your next favorite dish with a quick search.
          </p>
        </div>

        {/* Restaurant Directory */}
        <div className="mb-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Restaurants</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input 
                type="text"
                placeholder="Search for restaurants, cuisines, or dishes..."
                className="w-full pl-10 pr-4 py-2 text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-16">
              <Loader2 className="h-12 w-12 text-blue-600 mx-auto animate-spin" />
              <p className="mt-4 text-gray-600">Searching for amazing food...</p>
            </div>
          ) : (
            <RestaurantList restaurants={restaurants} />
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