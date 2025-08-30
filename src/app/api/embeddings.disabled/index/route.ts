import { NextRequest, NextResponse } from 'next/server'
import { embeddingService } from '@/lib/embedding-service'

export async function POST(request: NextRequest) {
  try {
    const { restaurant_id, index_all } = await request.json()

    if (index_all) {
      // Index all restaurants
      await embeddingService.indexAllRestaurants()
      return NextResponse.json({ 
        success: true, 
        message: 'All restaurants indexed successfully' 
      })
    } else if (restaurant_id) {
      // Index specific restaurant
      await embeddingService.indexRestaurant(restaurant_id)
      return NextResponse.json({ 
        success: true, 
        message: `Restaurant ${restaurant_id} indexed successfully` 
      })
    } else {
      return NextResponse.json(
        { error: 'Either restaurant_id or index_all must be provided' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error indexing restaurants:', error)
    return NextResponse.json(
      { error: 'Failed to index restaurants' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Embedding indexing endpoint',
    usage: {
      'POST /api/embeddings/index': {
        description: 'Index restaurants for vector search',
        body: {
          restaurant_id: 'string (optional) - Index specific restaurant',
          index_all: 'boolean (optional) - Index all restaurants'
        }
      }
    }
  })
}
