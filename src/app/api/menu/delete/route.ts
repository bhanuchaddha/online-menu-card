import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { menuService } from '@/lib/menu-service'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { menuId } = body

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
