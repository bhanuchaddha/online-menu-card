'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, Search, Navigation, Target } from 'lucide-react'

// Dynamically import the picker map
const DynamicPickerMap = dynamic(
  () => import('./leaflet-location-picker').then((mod) => mod.LeafletLocationPicker),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg">
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }
)

interface LocationPickerProps {
  initialLocation?: [number, number] | null
  onLocationChange: (location: [number, number] | null) => void
  address?: string
  onAddressChange?: (address: string) => void
}

export function LocationPicker({ 
  initialLocation, 
  onLocationChange, 
  address = '', 
  onAddressChange 
}: LocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(initialLocation || null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>(
    initialLocation || [37.7749, -122.4194] // Default to San Francisco
  )

  useEffect(() => {
    onLocationChange(selectedLocation)
  }, [selectedLocation, onLocationChange])

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const newLocation: [number, number] = [latitude, longitude]
          setSelectedLocation(newLocation)
          setMapCenter(newLocation)
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Unable to get your current location. Please select a location on the map.')
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000
        }
      )
    } else {
      alert('Geolocation is not supported by this browser.')
    }
  }

  const searchLocation = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      // Using Nominatim (OpenStreetMap) geocoding service
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      )
      const data = await response.json()
      
      if (data && data.length > 0) {
        const result = data[0]
        const lat = parseFloat(result.lat)
        const lon = parseFloat(result.lon)
        const newLocation: [number, number] = [lat, lon]
        
        setSelectedLocation(newLocation)
        setMapCenter(newLocation)
        
        // Update address if callback provided
        if (onAddressChange && result.display_name) {
          onAddressChange(result.display_name)
        }
      } else {
        alert('Location not found. Please try a different search term.')
      }
    } catch (error) {
      console.error('Search error:', error)
      alert('Error searching for location. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleMapClick = (location: [number, number]) => {
    setSelectedLocation(location)
    
    // Reverse geocoding to get address
    if (onAddressChange) {
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location[0]}&lon=${location[1]}`)
        .then(response => response.json())
        .then(data => {
          if (data && data.display_name) {
            onAddressChange(data.display_name)
          }
        })
        .catch(error => console.error('Reverse geocoding error:', error))
    }
  }

  const clearLocation = () => {
    setSelectedLocation(null)
    if (onAddressChange) {
      onAddressChange('')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          Restaurant Location
        </CardTitle>
        <CardDescription>
          Set your restaurant's location to help customers find you on the map
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location Search */}
        <div>
          <Label htmlFor="location-search">Search for Location</Label>
          <div className="flex space-x-2 mt-1">
            <Input
              id="location-search"
              placeholder="Enter city, address, or landmark..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
            />
            <Button 
              variant="outline" 
              onClick={searchLocation}
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={getCurrentLocation}>
            <Navigation className="w-4 h-4 mr-2" />
            Use My Location
          </Button>
          {selectedLocation && (
            <Button variant="outline" size="sm" onClick={clearLocation}>
              <Target className="w-4 h-4 mr-2" />
              Clear Location
            </Button>
          )}
        </div>

        {/* Map */}
        <div className="border rounded-lg overflow-hidden">
          <DynamicPickerMap
            center={mapCenter}
            selectedLocation={selectedLocation}
            onLocationSelect={handleMapClick}
            zoom={selectedLocation ? 15 : 10}
          />
        </div>

        {/* Selected Coordinates */}
        {selectedLocation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center text-blue-700">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="font-medium">Selected Location</span>
            </div>
            <div className="mt-1 text-sm text-blue-600">
              Latitude: {selectedLocation[0].toFixed(6)}, Longitude: {selectedLocation[1].toFixed(6)}
            </div>
            {address && (
              <div className="mt-2 text-sm text-gray-600">
                <strong>Address:</strong> {address}
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
          <strong>How to use:</strong>
          <ul className="mt-1 space-y-1 list-disc list-inside">
            <li>Search for your restaurant's address or name</li>
            <li>Click "Use My Location" if you're at your restaurant</li>
            <li>Click anywhere on the map to set the location</li>
            <li>The selected location will be used to help customers find you</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
