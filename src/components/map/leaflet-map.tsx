'use client'
import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface Restaurant {
  id: string
  name: string
  description?: string
  address?: string
  slug: string
  latitude: number | null
  longitude: number | null
  menuCount: number
  distance?: number
}

interface LeafletMapProps {
  center: [number, number]
  restaurants: Restaurant[]
  userLocation?: [number, number] | null
  zoom?: number
}

export function LeafletMap({ center, restaurants, userLocation, zoom = 13 }: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    // Initialize map
    const map = L.map(mapContainerRef.current).setView(center, zoom)

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    mapRef.current = map

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return

    // Update map center and zoom
    mapRef.current.setView(center, zoom)
  }, [center, zoom])

  useEffect(() => {
    if (!mapRef.current) return

    // Clear existing markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapRef.current?.removeLayer(layer)
      }
    })

    // Add user location marker
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div style="
            width: 20px;
            height: 20px;
            background: #2563eb;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      })

      L.marker(userLocation, { icon: userIcon })
        .bindPopup('Your Location')
        .addTo(mapRef.current)
    }

    // Add restaurant markers
    restaurants.forEach((restaurant) => {
      if (!restaurant.latitude || !restaurant.longitude || !mapRef.current) return

      // Custom restaurant marker
      const restaurantIcon = L.divIcon({
        className: 'custom-restaurant-marker',
        html: `
          <div style="
            width: 30px;
            height: 30px;
            background: #dc2626;
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
          ">🍽️</div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      })

      const popup = L.popup({
        maxWidth: 250,
        className: 'custom-popup'
      }).setContent(`
        <div style="padding: 8px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 14px;">
            ${restaurant.name}
          </h3>
          ${restaurant.description ? `<p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">${restaurant.description}</p>` : ''}
          ${restaurant.address ? `<p style="margin: 0 0 8px 0; font-size: 11px; color: #888;"><strong>📍</strong> ${restaurant.address}</p>` : ''}
          <div style="margin: 8px 0; font-size: 11px;">
            <span style="background: #f3f4f6; padding: 2px 6px; border-radius: 10px; color: #374151;">
              ${restaurant.menuCount} menu${restaurant.menuCount !== 1 ? 's' : ''}
            </span>
            ${restaurant.distance ? `<span style="background: #ddd6fe; padding: 2px 6px; border-radius: 10px; color: #5b21b6; margin-left: 4px;">${restaurant.distance.toFixed(1)} km</span>` : ''}
          </div>
          <a 
            href="/menu/${restaurant.slug}"
            style="
              display: inline-block;
              background: #2563eb;
              color: white;
              text-decoration: none;
              padding: 6px 12px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 500;
              margin-top: 8px;
            "
          >
            View Menu →
          </a>
        </div>
      `)

      L.marker([restaurant.latitude, restaurant.longitude], { icon: restaurantIcon })
        .bindPopup(popup)
        .addTo(mapRef.current)
    })

    // Fit bounds to show all markers if there are restaurants
    if (restaurants.length > 0) {
      const group = new (L as any).featureGroup()
      
      restaurants.forEach((restaurant) => {
        if (restaurant.latitude && restaurant.longitude) {
          group.addLayer(L.marker([restaurant.latitude, restaurant.longitude]))
        }
      })
      
      if (userLocation) {
        group.addLayer(L.marker(userLocation))
      }

      if (group.getLayers().length > 0) {
        mapRef.current.fitBounds(group.getBounds(), {
          padding: [20, 20],
          maxZoom: 15
        })
      }
    }
  }, [restaurants, userLocation])

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full min-h-[400px] rounded-lg"
      style={{ zIndex: 0 }}
    />
  )
}
