import { NextRequest, NextResponse } from 'next/server'
import { menuService } from '@/lib/menu-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = parseFloat(searchParams.get('lat') || '0')
    const lng = parseFloat(searchParams.get('lng') || '0')
    const radius = parseFloat(searchParams.get('radius') || '10')

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    // Get restaurants within the specified radius
    const restaurants = await menuService.getRestaurantsByLocation(lat, lng, radius)
    
    return NextResponse.json({
      success: true,
      restaurants,
      center: { lat, lng },
      radius
    })
  } catch (error) {
    console.error('Error fetching nearby restaurants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch nearby restaurants' },
      { status: 500 }
    )
  }
}
