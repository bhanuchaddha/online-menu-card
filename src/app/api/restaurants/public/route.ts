import { NextRequest, NextResponse } from 'next/server'
import { menuService } from '@/lib/menu-service'

export async function GET(request: NextRequest) {
  try {
    // Get all public restaurants and their menus
    const restaurants = await menuService.getAllPublicRestaurants()
    
    return NextResponse.json({
      success: true,
      restaurants
    })
  } catch (error) {
    console.error('Error fetching public restaurants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch restaurants' },
      { status: 500 }
    )
  }
}
