import { PrismaClient } from '@prisma/client'

// Pure Prisma approach (official Supabase recommendation)
// Using custom 'prisma' user as per Supabase docs
const prisma = new PrismaClient()

// Define extraction result interface first
export interface MenuExtractionResult {
  restaurant_name?: string
  categories: Array<{
    name: string
    items: Array<{
      name: string
      description?: string
      price: string
      dietary_info?: string[]
    }>
  }>
}

// Define types matching our Prisma schema
export interface MenuData {
  id: string
  userId: string
  restaurantName: string
  imageUrl: string
  extractedData: MenuExtractionResult
  createdAt: Date
  updatedAt: Date
}

export interface RestaurantData {
  id: string
  userId: string
  name: string
  slug: string
  description: string | null
  address: string | null
  phone: string | null
  website: string | null
  createdAt: Date
  updatedAt: Date
}

export class MenuService {
  // Save extracted menu data
  async saveMenu(menuData: Omit<MenuData, 'id' | 'createdAt' | 'updatedAt'>): Promise<MenuData | null> {
    try {
      const savedMenu = await prisma.menu.create({
        data: {
          userId: menuData.userId,
          restaurantName: menuData.restaurantName,
          imageUrl: menuData.imageUrl,
          extractedData: menuData.extractedData,
        }
      })

      return savedMenu
    } catch (error) {
      console.error('Menu save error:', error)
      return null
    }
  }

  // Get user's menus
  async getUserMenus(userId: string): Promise<MenuData[]> {
    try {
      const menus = await prisma.menu.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      })

      return menus
    } catch (error) {
      console.error('Error fetching user menus:', error)
      return []
    }
  }

  // Get specific menu
  async getMenu(menuId: string): Promise<MenuData | null> {
    try {
      const menu = await prisma.menu.findUnique({
        where: { id: menuId }
      })

      return menu
    } catch (error) {
      console.error('Error fetching menu:', error)
      return null
    }
  }

  // Update menu
  async updateMenu(menuId: string, updates: Partial<MenuData>): Promise<MenuData | null> {
    try {
      const updateData: Partial<MenuData> = {}
      
      if (updates.restaurantName !== undefined) updateData.restaurantName = updates.restaurantName
      if (updates.extractedData !== undefined) updateData.extractedData = updates.extractedData
      if (updates.imageUrl !== undefined) updateData.imageUrl = updates.imageUrl

      const updatedMenu = await prisma.menu.update({
        where: { id: menuId },
        data: updateData
      })

      return updatedMenu
    } catch (error) {
      console.error('Error updating menu:', error)
      return null
    }
  }

  // Delete menu
  async deleteMenu(menuId: string): Promise<boolean> {
    try {
      await prisma.menu.delete({
        where: { id: menuId }
      })

      return true
    } catch (error) {
      console.error('Error deleting menu:', error)
      return false
    }
  }

  // Restaurant management
  async saveRestaurant(restaurant: Omit<RestaurantData, 'id' | 'createdAt' | 'updatedAt'>): Promise<RestaurantData | null> {
    try {
      const slug = restaurant.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      
      const savedRestaurant = await prisma.restaurant.create({
        data: {
          userId: restaurant.userId,
          name: restaurant.name,
          description: restaurant.description,
          address: restaurant.address,
          phone: restaurant.phone,
          website: restaurant.website,
          slug: slug,
        }
      })

      return savedRestaurant
    } catch (error) {
      console.error('Restaurant save error:', error)
      return null
    }
  }

  // Get restaurant by slug (for public pages)
  async getRestaurantBySlug(slug: string): Promise<RestaurantData | null> {
    try {
      const restaurant = await prisma.restaurant.findUnique({
        where: { slug }
      })

      return restaurant
    } catch (error) {
      console.error('Error fetching restaurant by slug:', error)
      return null
    }
  }

  // Cleanup method for proper disconnection
  async disconnect(): Promise<void> {
    await prisma.$disconnect()
  }
}

export const menuService = new MenuService()
