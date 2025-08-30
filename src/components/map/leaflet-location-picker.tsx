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

interface LeafletLocationPickerProps {
  center: [number, number]
  selectedLocation?: [number, number] | null
  onLocationSelect: (location: [number, number]) => void
  zoom?: number
}

export function LeafletLocationPicker({ 
  center, 
  selectedLocation, 
  onLocationSelect, 
  zoom = 13 
}: LeafletLocationPickerProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    // Initialize map
    const map = L.map(mapContainerRef.current).setView(center, zoom)

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    // Add click handler
    map.on('click', (e) => {
      const { lat, lng } = e.latlng
      onLocationSelect([lat, lng])
    })

    // Add crosshair cursor
    map.getContainer().style.cursor = 'crosshair'

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

    // Remove existing marker
    if (markerRef.current) {
      mapRef.current.removeLayer(markerRef.current)
      markerRef.current = null
    }

    // Add new marker if location is selected
    if (selectedLocation) {
      const restaurantIcon = L.divIcon({
        className: 'custom-restaurant-picker',
        html: `
          <div style="
            width: 40px;
            height: 40px;
            background: #dc2626;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 18px;
            position: relative;
          ">
            🍽️
            <div style="
              position: absolute;
              bottom: -6px;
              left: 50%;
              transform: translateX(-50%);
              width: 0;
              height: 0;
              border-left: 8px solid transparent;
              border-right: 8px solid transparent;
              border-top: 10px solid #dc2626;
            "></div>
          </div>
        `,
        iconSize: [40, 50],
        iconAnchor: [20, 50],
      })

      markerRef.current = L.marker(selectedLocation, { 
        icon: restaurantIcon,
        draggable: true 
      })
        .bindPopup(`
          <div style="text-align: center; padding: 8px;">
            <strong>🏪 Your Restaurant</strong><br>
            <small>Drag to adjust position</small><br>
            <small style="color: #666;">
              ${selectedLocation[0].toFixed(6)}, ${selectedLocation[1].toFixed(6)}
            </small>
          </div>
        `)
        .addTo(mapRef.current)

      // Handle marker drag
      markerRef.current.on('dragend', (e) => {
        const marker = e.target
        const position = marker.getLatLng()
        onLocationSelect([position.lat, position.lng])
      })
    }
  }, [selectedLocation, onLocationSelect])

  return (
    <div className="relative">
      <div 
        ref={mapContainerRef} 
        className="w-full h-64 rounded-lg"
        style={{ zIndex: 0 }}
      />
      
      {/* Instructions overlay */}
      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-xs text-gray-700 shadow-sm">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
          Click on the map to set location
        </div>
      </div>

      {/* Coordinates overlay */}
      {selectedLocation && (
        <div className="absolute bottom-2 left-2 bg-black/75 text-white rounded px-2 py-1 text-xs font-mono">
          {selectedLocation[0].toFixed(4)}, {selectedLocation[1].toFixed(4)}
        </div>
      )}
    </div>
  )
}
