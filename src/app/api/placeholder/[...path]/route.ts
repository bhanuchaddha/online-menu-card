import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params
    const [dimensions, query] = resolvedParams.path
    const imageUrl = `https://placeholder.vn/placeholder/${dimensions}?${query}`

    const response = await fetch(imageUrl)
    
    if (!response.ok) {
      return new NextResponse('Failed to fetch placeholder image', { status: response.status })
    }

    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/png'

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Placeholder proxy error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
