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
    const { imageData } = body

    if (!imageData) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 })
    }

    // Upload image to Cloudinary
    const uploadResult = await cloudinaryService.uploadImage(imageData, 'menu-extractions')
    
    // Extract menu using OpenRouter
    const openRouterService = new OpenRouterService()
    const extractionResult = await openRouterService.extractMenuFromImage(uploadResult.secure_url)

    // Save to database using Supabase
    const savedMenu = await menuService.saveMenu({
      userId: session.user.id,
      restaurantName: extractionResult.restaurant_name || 'Untitled Restaurant',
      imageUrl: uploadResult.secure_url,
      extractedData: extractionResult
    })

    return NextResponse.json({
      success: true,
      data: {
        image: uploadResult,
        extraction: extractionResult,
        savedMenu: savedMenu
      }
    })
  } catch (error) {
    console.error('Menu extraction error:', error)
    return NextResponse.json(
      { error: 'Failed to extract menu from image' },
      { status: 500 }
    )
  }
}
