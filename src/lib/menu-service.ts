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

  // Get user's restaurants
  async getUserRestaurants(userId: string): Promise<RestaurantData[]> {
    try {
      const restaurants = await prisma.restaurant.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      })

      return restaurants
    } catch (error) {
      console.error('Error fetching user restaurants:', error)
      return []
    }
  }

  // Update restaurant
  async updateRestaurant(restaurantId: string, updates: Partial<RestaurantData>): Promise<RestaurantData | null> {
    try {
      const updateData: Partial<RestaurantData> = {}
      
      if (updates.name !== undefined) updateData.name = updates.name
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.address !== undefined) updateData.address = updates.address
      if (updates.phone !== undefined) updateData.phone = updates.phone
      if (updates.website !== undefined) updateData.website = updates.website
      if (updates.slug !== undefined) updateData.slug = updates.slug

      const updatedRestaurant = await prisma.restaurant.update({
        where: { id: restaurantId },
        data: updateData
      })

      return updatedRestaurant
    } catch (error) {
      console.error('Error updating restaurant:', error)
      return null
    }
  }

  // Get all public restaurants with their menus for homepage
  async getAllPublicRestaurants(): Promise<Array<RestaurantData & { menuCount: number; latestMenu?: MenuData }>> {
    try {
      // Add connection timeout and retry logic
      const restaurants = await Promise.race([
        prisma.restaurant.findMany({
          orderBy: { createdAt: 'desc' },
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Database query timeout')), 8000)
        )
      ])

      // Get menu counts and latest menu for each restaurant with timeout
      const restaurantsWithMenus = await Promise.allSettled(
        restaurants.map(async (restaurant) => {
          try {
            // Match menus by restaurant name AND user ID for accuracy
            const menuCount = await Promise.race([
              prisma.menu.count({
                where: { 
                  AND: [
                    { userId: restaurant.userId },
                    { restaurantName: restaurant.name }
                  ]
                }
              }),
              new Promise<number>((_, reject) => 
                setTimeout(() => reject(new Error('Menu count timeout')), 5000)
              )
            ])

            const latestMenu = await Promise.race([
              prisma.menu.findFirst({
                where: { 
                  AND: [
                    { userId: restaurant.userId },
                    { restaurantName: restaurant.name }
                  ]
                },
                orderBy: { createdAt: 'desc' }
              }),
              new Promise<MenuData | null>((_, reject) => 
                setTimeout(() => reject(new Error('Latest menu timeout')), 5000)
              )
            ])

            return {
              ...restaurant,
              menuCount,
              latestMenu: latestMenu || undefined
            }
          } catch (error) {
            console.warn('Error fetching menu data for restaurant:', restaurant.name, error)
            // Return restaurant with zero menus if menu queries fail
            return {
              ...restaurant,
              menuCount: 0,
              latestMenu: undefined
            }
          }
        })
      )

      // Extract successful results and filter restaurants with menus
      const validResults = restaurantsWithMenus
        .filter((result): result is PromiseFulfilledResult<RestaurantData & { menuCount: number; latestMenu?: MenuData }> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value)
        .filter(restaurant => restaurant.menuCount > 0)

      console.log(`✅ Successfully fetched ${validResults.length} restaurants with menus`)
      return validResults

    } catch (error) {
      console.error('Error fetching public restaurants:', error)
      
      // Return mock data for development/demo purposes when database is unavailable
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Returning demo data due to database connectivity issues')
        return [
          {
            id: 'demo-restaurant-1',
            userId: 'demo-user',
            name: 'Demo Restaurant',
            slug: 'demo-restaurant',
            description: 'A sample restaurant for demonstration purposes',
            address: '123 Demo Street, Demo City, DC 12345',
            phone: '(555) 123-4567',
            website: 'https://demo-restaurant.com',
            createdAt: new Date(),
            updatedAt: new Date(),
            menuCount: 1,
            latestMenu: {
              id: 'demo-menu',
              userId: 'demo-user',
              restaurantName: 'Demo Restaurant',
              imageUrl: '/icons/menucard-icon.svg',
              extractedData: {
                restaurant_name: 'Demo Restaurant',
                categories: [
                  {
                    name: 'Main Dishes',
                    items: [
                      {
                        name: 'Grilled Chicken',
                        description: 'Delicious grilled chicken breast',
                        price: '15.99',
                        dietary_info: ['gluten-free']
                      }
                    ]
                  }
                ]
              },
              createdAt: new Date(),
              updatedAt: new Date()
            }
          }
        ]
      }
      
      return []
    }
  }

  // Get restaurant with all its menus for public display
  async getPublicRestaurantWithMenus(slug: string): Promise<{
    restaurant: RestaurantData | null
    menus: MenuData[]
  }> {
    try {
      const restaurant = await Promise.race([
        prisma.restaurant.findUnique({
          where: { slug }
        }),
        new Promise<RestaurantData | null>((_, reject) => 
          setTimeout(() => reject(new Error('Restaurant query timeout')), 8000)
        )
      ])

      if (!restaurant) {
        // Check if this is the demo restaurant slug
        if (slug === 'demo-restaurant' && process.env.NODE_ENV === 'development') {
          const demoRestaurant: RestaurantData = {
            id: 'demo-restaurant-1',
            userId: 'demo-user',
            name: 'Demo Restaurant',
            slug: 'demo-restaurant',
            description: 'A sample restaurant for demonstration purposes',
            address: '123 Demo Street, Demo City, DC 12345',
            phone: '(555) 123-4567',
            website: 'https://demo-restaurant.com',
            createdAt: new Date(),
            updatedAt: new Date()
          }
          
          const demoMenu: MenuData = {
            id: 'demo-menu',
            userId: 'demo-user',
            restaurantName: 'Demo Restaurant',
            imageUrl: '/icons/menucard-icon.svg',
            extractedData: {
              restaurant_name: 'Demo Restaurant',
              categories: [
                {
                  name: 'Main Dishes',
                  items: [
                    {
                      name: 'Grilled Chicken Breast',
                      description: 'Juicy grilled chicken breast with herbs and spices',
                      price: '15.99',
                      dietary_info: ['gluten-free']
                    },
                    {
                      name: 'Pasta Carbonara',
                      description: 'Classic Italian pasta with cream sauce and bacon',
                      price: '12.99'
                    }
                  ]
                },
                {
                  name: 'Beverages',
                  items: [
                    {
                      name: 'Fresh Coffee',
                      description: 'Our signature blend coffee',
                      price: '3.99'
                    }
                  ]
                }
              ]
            },
            createdAt: new Date(),
            updatedAt: new Date()
          }
          
          return { restaurant: demoRestaurant, menus: [demoMenu] }
        }
        return { restaurant: null, menus: [] }
      }

      const menus = await Promise.race([
        prisma.menu.findMany({
          where: { 
            AND: [
              { userId: restaurant.userId },
              { restaurantName: restaurant.name }
            ]
          },
          orderBy: { createdAt: 'desc' }
        }),
        new Promise<MenuData[]>((_, reject) => 
          setTimeout(() => reject(new Error('Menu query timeout')), 8000)
        )
      ])

      return { restaurant, menus }
    } catch (error) {
      console.error('Error fetching public restaurant with menus:', error)
      
      // Return demo data for the demo restaurant slug in development
      if (slug === 'demo-restaurant' && process.env.NODE_ENV === 'development') {
        console.log('🔄 Returning demo restaurant data due to database connectivity issues')
        const demoRestaurant: RestaurantData = {
          id: 'demo-restaurant-1',
          userId: 'demo-user',
          name: 'Demo Restaurant',
          slug: 'demo-restaurant',
          description: 'A sample restaurant for demonstration purposes',
          address: '123 Demo Street, Demo City, DC 12345',
          phone: '(555) 123-4567',
          website: 'https://demo-restaurant.com',
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        const demoMenu: MenuData = {
          id: 'demo-menu',
          userId: 'demo-user',
          restaurantName: 'Demo Restaurant',
          imageUrl: '/icons/menucard-icon.svg',
          extractedData: {
            restaurant_name: 'Demo Restaurant',
            categories: [
              {
                name: 'Main Dishes',
                items: [
                  {
                    name: 'Grilled Chicken Breast',
                    description: 'Juicy grilled chicken breast with herbs and spices',
                    price: '15.99',
                    dietary_info: ['gluten-free']
                  },
                  {
                    name: 'Pasta Carbonara',
                    description: 'Classic Italian pasta with cream sauce and bacon',
                    price: '12.99'
                  }
                ]
              },
              {
                name: 'Beverages',
                items: [
                  {
                    name: 'Fresh Coffee',
                    description: 'Our signature blend coffee',
                    price: '3.99'
                  }
                ]
              }
            ]
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        return { restaurant: demoRestaurant, menus: [demoMenu] }
      }
      
      return { restaurant: null, menus: [] }
    }
  }

  // Get restaurants by location within radius (in kilometers)
  // Note: This method is disabled until latitude/longitude columns are added to the database
  async getRestaurantsByLocation(
    centerLat: number, 
    centerLng: number, 
    radiusKm: number = 10
  ): Promise<Array<RestaurantData & { menuCount: number; distance?: number }>> {
    try {
      // For now, return all restaurants since we don't have location data
      console.warn('Location-based search not available - latitude/longitude columns not in database')
      const allRestaurants = await this.getAllPublicRestaurants()
      return allRestaurants.map(r => ({ ...r, distance: undefined }))
    } catch (error) {
      console.error('Error fetching restaurants by location:', error)
      return []
    }
  }

  // Cleanup method for proper disconnection
  async disconnect(): Promise<void> {
    await prisma.$disconnect()
  }
}

export const menuService = new MenuService()
