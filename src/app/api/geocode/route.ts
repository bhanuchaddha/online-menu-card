import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      )
    }

    // Using Nominatim (OpenStreetMap) geocoding service
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5`
    
    const response = await fetch(geocodeUrl, {
      headers: {
        'User-Agent': 'MenuCard-App/1.0'
      }
    })

    if (!response.ok) {
      throw new Error('Geocoding service unavailable')
    }

    const data = await response.json()
    
    const results = data.map((item: any) => ({
      display_name: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      importance: item.importance,
      type: item.type,
      class: item.class
    }))

    return NextResponse.json({
      success: true,
      results
    })
  } catch (error) {
    console.error('Geocoding error:', error)
    return NextResponse.json(
      { error: 'Failed to geocode address' },
      { status: 500 }
    )
  }
}

// Reverse geocoding - get address from coordinates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lat, lng } = body

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    // Using Nominatim reverse geocoding
    const reverseUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    
    const response = await fetch(reverseUrl, {
      headers: {
        'User-Agent': 'MenuCard-App/1.0'
      }
    })

    if (!response.ok) {
      throw new Error('Reverse geocoding service unavailable')
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      address: data.display_name,
      details: {
        house_number: data.address?.house_number,
        road: data.address?.road,
        city: data.address?.city || data.address?.town || data.address?.village,
        state: data.address?.state,
        postcode: data.address?.postcode,
        country: data.address?.country
      }
    })
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return NextResponse.json(
      { error: 'Failed to reverse geocode coordinates' },
      { status: 500 }
    )
  }
}
