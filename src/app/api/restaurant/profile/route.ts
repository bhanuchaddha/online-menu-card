import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { menuService } from '@/lib/menu-service'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's restaurant profile
    const restaurants = await menuService.getUserRestaurants(session.user.id)
    const restaurant = restaurants.length > 0 ? restaurants[0] : null

    return NextResponse.json({
      success: true,
      restaurant
    })
  } catch (error) {
    console.error('Get restaurant profile error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch restaurant profile' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, address, phone, website, slug } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Restaurant name is required' },
        { status: 400 }
      )
    }

    // Check if user already has a restaurant
    const existingRestaurants = await menuService.getUserRestaurants(session.user.id)
    
    let restaurant
    if (existingRestaurants.length > 0) {
      // Update existing restaurant
      restaurant = await menuService.updateRestaurant(existingRestaurants[0].id, {
        name: name.trim(),
        description: description?.trim() || null,
        address: address?.trim() || null,
        phone: phone?.trim() || null,
        website: website?.trim() || null,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      })
    } else {
      // Create new restaurant
      restaurant = await menuService.saveRestaurant({
        userId: session.user.id,
        name: name.trim(),
        description: description?.trim() || null,
        address: address?.trim() || null,
        phone: phone?.trim() || null,
        website: website?.trim() || null,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      })
    }

    if (!restaurant) {
      throw new Error('Failed to save restaurant')
    }

    return NextResponse.json({
      success: true,
      restaurant
    })
  } catch (error) {
    console.error('Save restaurant profile error:', error)
    return NextResponse.json(
      { error: 'Failed to save restaurant profile' },
      { status: 500 }
    )
  }
}
