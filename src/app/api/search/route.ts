import { NextRequest, NextResponse } from 'next/server'
import { menuService } from '@/lib/menu-service'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query) {
      // If no query, return all public restaurants
      const restaurants = await menuService.getAllPublicRestaurants()
      return NextResponse.json({ restaurants })
    }

    // If there is a query, perform a text search
    const restaurants = await menuService.searchRestaurantsByText(query)
    
    // We need to enrich the search results with menu counts for the homepage cards
    const enrichedRestaurants = await Promise.all(
      restaurants.map(async (restaurant) => {
        const menuCount = (await menuService.getPublicRestaurantWithMenus(restaurant.slug)).menus.length
        return {
          ...restaurant,
          menuCount,
        }
      })
    )

    return NextResponse.json({ restaurants: enrichedRestaurants })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Failed to search for restaurants' },
      { status: 500 }
    )
  }
}
