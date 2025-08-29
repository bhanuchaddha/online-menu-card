import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { menuService } from '@/lib/menu-service'

// GET - Get user's menus
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const menus = await menuService.getUserMenus(session.user.id)
    
    return NextResponse.json({
      success: true,
      data: menus
    })
  } catch (error) {
    console.error('Error fetching menus:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menus' },
      { status: 500 }
    )
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

// DELETE - Delete menu
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const menuId = url.searchParams.get('id')

    if (!menuId) {
      return NextResponse.json({ error: 'Menu ID is required' }, { status: 400 })
    }

    const success = await menuService.deleteMenu(menuId)
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete menu' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Menu deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting menu:', error)
    return NextResponse.json(
      { error: 'Failed to delete menu' },
      { status: 500 }
    )
  }
}
