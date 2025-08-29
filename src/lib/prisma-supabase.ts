// Hybrid approach: Use Prisma types with Supabase client
import { createClient } from '@supabase/supabase-js'
import type { Menu, Restaurant } from '@prisma/client' // Get types from Prisma

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Use Prisma types but Supabase operations
export interface PrismaSupabaseService {
  // Menu operations using Prisma types
  createMenu(data: Omit<Menu, 'id' | 'createdAt' | 'updatedAt'>): Promise<Menu | null>
  getMenus(userId: string): Promise<Menu[]>
  updateMenu(id: string, data: Partial<Menu>): Promise<Menu | null>
  deleteMenu(id: string): Promise<boolean>

  // Restaurant operations using Prisma types  
  createRestaurant(data: Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Restaurant | null>
  getRestaurant(id: string): Promise<Restaurant | null>
}

export class PrismaSupabaseMenuService implements PrismaSupabaseService {
  
  async createMenu(data: Omit<Menu, 'id' | 'createdAt' | 'updatedAt'>): Promise<Menu | null> {
    try {
      const { data: result, error } = await supabase
        .from('menus')
        .insert({
          user_id: data.userId,
          restaurant_name: data.restaurantName,
          image_url: data.imageUrl,
          extracted_data: data.extractedData,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating menu:', error)
        return null
      }

      // Convert Supabase response to Prisma format
      return {
        id: result.id,
        userId: result.user_id,
        restaurantName: result.restaurant_name,
        imageUrl: result.image_url,
        extractedData: result.extracted_data,
        createdAt: new Date(result.created_at),
        updatedAt: new Date(result.updated_at),
      } as Menu

    } catch (error) {
      console.error('Menu creation error:', error)
      return null
    }
  }

  async getMenus(userId: string): Promise<Menu[]> {
    try {
      const { data, error } = await supabase
        .from('menus')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching menus:', error)
        return []
      }

      // Convert Supabase response to Prisma format
      return data.map(item => ({
        id: item.id,
        userId: item.user_id,
        restaurantName: item.restaurant_name,
        imageUrl: item.image_url,
        extractedData: item.extracted_data,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      })) as Menu[]

    } catch (error) {
      console.error('Error fetching menus:', error)
      return []
    }
  }

  async updateMenu(id: string, data: Partial<Menu>): Promise<Menu | null> {
    try {
      const updateData: Record<string, unknown> = {}
      
      if (data.restaurantName) updateData.restaurant_name = data.restaurantName
      if (data.imageUrl) updateData.image_url = data.imageUrl
      if (data.extractedData) updateData.extracted_data = data.extractedData
      
      const { data: result, error } = await supabase
        .from('menus')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating menu:', error)
        return null
      }

      return {
        id: result.id,
        userId: result.user_id,
        restaurantName: result.restaurant_name,
        imageUrl: result.image_url,
        extractedData: result.extracted_data,
        createdAt: new Date(result.created_at),
        updatedAt: new Date(result.updated_at),
      } as Menu

    } catch (error) {
      console.error('Error updating menu:', error)
      return null
    }
  }

  async deleteMenu(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('menus')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting menu:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error deleting menu:', error)
      return false
    }
  }

  async createRestaurant(data: Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Restaurant | null> {
    try {
      const { data: result, error } = await supabase
        .from('restaurants')
        .insert({
          user_id: data.userId,
          name: data.name,
          description: data.description,
          address: data.address,
          phone: data.phone,
          website: data.website,
          slug: data.slug,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating restaurant:', error)
        return null
      }

      return {
        id: result.id,
        userId: result.user_id,
        name: result.name,
        description: result.description,
        address: result.address,
        phone: result.phone,
        website: result.website,
        slug: result.slug,
        createdAt: new Date(result.created_at),
        updatedAt: new Date(result.updated_at),
      } as Restaurant

    } catch (error) {
      console.error('Restaurant creation error:', error)
      return null
    }
  }

  async getRestaurant(id: string): Promise<Restaurant | null> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching restaurant:', error)
        return null
      }

      return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        description: data.description,
        address: data.address,
        phone: data.phone,
        website: data.website,
        slug: data.slug,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      } as Restaurant

    } catch (error) {
      console.error('Error fetching restaurant:', error)
      return null
    }
  }
}

export const prismaSupabaseService = new PrismaSupabaseMenuService()
