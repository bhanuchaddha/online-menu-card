'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Navigation, List, Map } from 'lucide-react'
import Link from 'next/link'

// Dynamically import the map to avoid SSR issues
const DynamicMap = dynamic(
  () => import('./leaflet-map').then((mod) => mod.LeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-96 bg-gray-100 flex items-center justify-center rounded-lg">
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }
)

interface Restaurant {
  id: string
  name: string
  description?: string
  address?: string
  phone?: string
  website?: string
  slug: string
  latitude: number | null
  longitude: number | null
  menuCount: number
  distance?: number
}

interface RestaurantMapProps {
  restaurants: Restaurant[]
  onViewChange?: (view: 'list' | 'map') => void
  currentView?: 'list' | 'map'
  center?: [number, number]
}

export function RestaurantMap({ restaurants, onViewChange, currentView = 'map', center }: RestaurantMapProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [locationPermission, setLocationPermission] = useState<'pending' | 'granted' | 'denied'>('pending')

  // Filter restaurants that have coordinates
  const restaurantsWithLocation = restaurants.filter(r => r.latitude && r.longitude)

  // Default to San Francisco if no center provided and no user location
  const defaultCenter: [number, number] = [37.7749, -122.4194]
  const mapCenter = center || userLocation || defaultCenter

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation([latitude, longitude])
          setLocationPermission('granted')
        },
        (error) => {
          console.log('Location permission denied:', error)
          setLocationPermission('denied')
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000 // 10 minutes
        }
      )
    }
  }, [])

  const requestLocation = () => {
    if (navigator.geolocation) {
      setLocationPermission('pending')
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation([latitude, longitude])
          setLocationPermission('granted')
        },
        (error) => {
          console.log('Location permission denied:', error)
          setLocationPermission('denied')
        }
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* View Toggle and Location */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={currentView === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange?.('list')}
              className="h-8"
            >
              <List className="w-4 h-4 mr-2" />
              List
            </Button>
            <Button
              variant={currentView === 'map' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange?.('map')}
              className="h-8"
            >
              <Map className="w-4 h-4 mr-2" />
              Map
            </Button>
          </div>
          
          <Badge variant="secondary">
            {restaurantsWithLocation.length} restaurant{restaurantsWithLocation.length !== 1 ? 's' : ''} with location
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          {locationPermission === 'denied' && (
            <Button variant="outline" size="sm" onClick={requestLocation}>
              <Navigation className="w-4 h-4 mr-2" />
              Enable Location
            </Button>
          )}
          {locationPermission === 'granted' && userLocation && (
            <Badge variant="outline" className="text-green-600 border-green-600">
              <Navigation className="w-4 h-4 mr-1" />
              Location enabled
            </Badge>
          )}
        </div>
      </div>

      {currentView === 'map' ? (
        <div className="space-y-4">
          {/* Map */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="h-96 w-full">
                <DynamicMap
                  center={mapCenter}
                  restaurants={restaurantsWithLocation}
                  userLocation={userLocation}
                  zoom={userLocation ? 13 : 10}
                />
              </div>
            </CardContent>
          </Card>

          {restaurantsWithLocation.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No restaurants with location data</h3>
                <p className="text-gray-500">Restaurants need to add their location to appear on the map.</p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        /* List View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <Card key={restaurant.id} className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="hover:text-blue-600 transition-colors">
                      {restaurant.name}
                    </CardTitle>
                    {restaurant.description && (
                      <CardDescription className="mt-2">
                        {restaurant.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <Badge variant="secondary">
                      {restaurant.menuCount} menu{restaurant.menuCount !== 1 ? 's' : ''}
                    </Badge>
                    {restaurant.distance && (
                      <Badge variant="outline" className="text-xs">
                        {restaurant.distance.toFixed(1)} km
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {restaurant.address && (
                    <div className="flex items-start text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      {restaurant.address}
                    </div>
                  )}

                  <Link href={`/menu/${restaurant.slug}`}>
                    <Button className="w-full">
                      View Menu
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
