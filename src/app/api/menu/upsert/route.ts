import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { menuService } from '@/lib/menu-service'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    let { restaurantId, restaurant_name, categories, ...otherData } = body

    if (!restaurantId) {
        // If restaurantId is not provided, try to find the user's restaurant
        const userRestaurant = await prisma.restaurant.findFirst({
            where: { userId: session.user.id }
        });

        if (!userRestaurant) {
            return NextResponse.json({ error: 'User has no restaurant' }, { status: 400 });
        }
        
        restaurantId = userRestaurant.id;
    }

    // Format the menu data properly for the upsertMenu function
    const menuData = {
      extractedData: {
        restaurant_name,
        categories: categories || []
      },
      imageUrl: otherData.imageUrl || 'default-image-url.jpg'
    }

    const upsertedMenu = await menuService.upsertMenu(
      restaurantId,
      session.user.id,
      menuData
    )

    if (!upsertedMenu) {
      return NextResponse.json({ error: 'Failed to save menu' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      menu: upsertedMenu,
    })
  } catch (error) {
    console.error('Error upserting menu:', error)
    return NextResponse.json(
      { error: 'Failed to save menu' },
      { status: 500 }
    )
  }
}
