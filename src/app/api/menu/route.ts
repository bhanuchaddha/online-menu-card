import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { menuService } from '@/lib/menu-service'

// Get all menus for the logged-in user, including restaurant info
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const menu = await prisma.menu.findFirst({
      where: { userId: session.user.id },
      include: {
        restaurant: {
          select: {
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const menus = menu ? [menu] : []
    return NextResponse.json({ success: true, data: menus })
  } catch (error) {
    console.error('Failed to fetch menus:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch menus' }, { status: 500 })
  }
}

// PUT - Update menu
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { menuId, ...updates } = body

    if (!menuId) {
      return NextResponse.json({ error: 'Menu ID is required' }, { status: 400 })
    }

    const updatedMenu = await menuService.updateMenu(menuId, updates)
    
    if (!updatedMenu) {
      return NextResponse.json({ error: 'Failed to update menu' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: updatedMenu
    })
  } catch (error) {
    console.error('Error updating menu:', error)
    return NextResponse.json(
      { error: 'Failed to update menu' },
      { status: 500 }
    )
  }
}

// Delete a specific menu
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const menuId = searchParams.get('id')

  if (!menuId) {
    return NextResponse.json({ success: false, error: 'Menu ID is required' }, { status: 400 })
  }

  try {
    // Ensure the user owns this menu before deleting
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
    })

    if (!menu || menu.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Menu not found or not owned by user' }, { status: 404 })
    }

    await menuService.deleteMenu(menuId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete menu:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete menu' }, { status: 500 })
  }
}
