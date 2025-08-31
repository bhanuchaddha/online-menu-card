import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { OpenRouterService } from '@/lib/openrouter'
import { cloudinaryService } from '@/lib/cloudinary'
import { menuService } from '@/lib/menu-service'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { imageData, extractedData, isManual } = body

    let extractionResult
    let imageUrl = '/icons/menucard-icon.svg' // Default placeholder for manual menus
    let uploadResult = null

    if (isManual) {
      // Manual menu creation
      if (!extractedData) {
        return NextResponse.json({ error: 'Menu data is required for manual creation' }, { status: 400 })
      }
      extractionResult = extractedData
    } else {
      // AI-based extraction from image
      if (!imageData) {
        return NextResponse.json({ error: 'Image data is required' }, { status: 400 })
      }

      // Upload image to Cloudinary
      uploadResult = await cloudinaryService.uploadImage(imageData, 'menu-extractions')
      imageUrl = uploadResult.secure_url
      
      // Extract menu using OpenRouter
      const openRouterService = new OpenRouterService()
      extractionResult = await openRouterService.extractMenuFromImage(uploadResult.secure_url)
    }

    // Get user's restaurant
    const userRestaurant = await menuService.getUserRestaurant(session.user.id);
    if (!userRestaurant) {
      return NextResponse.json({ error: 'User has no restaurant. Please create a restaurant first.' }, { status: 400 });
    }

    // Use upsert to create or update the menu
    const savedMenu = await menuService.upsertMenu(
      userRestaurant.id,
      session.user.id,
      {
        imageUrl: imageUrl,
        extractedData: extractionResult
      }
    );

    if (!savedMenu) {
      return NextResponse.json({ error: 'Failed to save extracted menu' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      extractedData: extractionResult,
      menu: savedMenu,
      imageUrl: imageUrl
    })
  } catch (error) {
    console.error('Menu extraction error:', error)
    return NextResponse.json(
      { error: 'Failed to extract menu from image' },
      { status: 500 }
    )
  }
}
