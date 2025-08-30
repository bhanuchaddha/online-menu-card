import OpenAI from 'openai'
import { supabaseAdmin } from './supabase'

// Try OpenAI first, fallback to OpenRouter if needed
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

// OpenRouter configuration for embeddings
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

export interface EmbeddingData {
  id?: string
  restaurant_id: string
  content: string
  content_type: 'restaurant_info' | 'menu_item' | 'category'
  metadata?: Record<string, any>
  embedding?: number[]
}

export interface SearchResult {
  id: string
  restaurant_id: string
  content: string
  content_type: string
  metadata: Record<string, any>
  similarity: number
}

export interface RestaurantContext {
  id: string
  name: string
  description: string | null
  address: string | null
  phone: string | null
  website: string | null
  slug: string
  latitude: number | null
  longitude: number | null
}

export class EmbeddingService {
  private static instance: EmbeddingService
  
  static getInstance(): EmbeddingService {
    if (!EmbeddingService.instance) {
      EmbeddingService.instance = new EmbeddingService()
    }
    return EmbeddingService.instance
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Try OpenAI first if available
      if (openai) {
        const response = await openai.embeddings.create({
          model: 'text-embedding-ada-002',
          input: text,
        })
        return response.data[0].embedding
      }
      
      // Fallback to OpenRouter with a text embedding model
      if (OPENROUTER_API_KEY) {
        const response = await fetch(`${OPENROUTER_BASE_URL}/embeddings`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'text-embedding-ada-002', // OpenRouter also supports OpenAI models
            input: text,
          })
        })

        if (!response.ok) {
          throw new Error(`OpenRouter embeddings API error: ${response.statusText}`)
        }

        const data = await response.json()
        return data.data[0].embedding
      }
      
      throw new Error('No embedding service available. Please configure OPENAI_API_KEY or OPENROUTER_API_KEY')
    } catch (error) {
      console.error('Error generating embedding:', error)
      throw new Error('Failed to generate embedding')
    }
  }

  async storeEmbedding(data: EmbeddingData): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available')
    }

    try {
      const embedding = data.embedding || await this.generateEmbedding(data.content)
      
      const { error } = await supabaseAdmin
        .from('restaurant_embeddings')
        .insert({
          restaurant_id: data.restaurant_id,
          content: data.content,
          content_type: data.content_type,
          metadata: data.metadata || {},
          embedding: embedding,
        })

      if (error) {
        console.error('Error storing embedding:', error)
        throw new Error('Failed to store embedding')
      }
    } catch (error) {
      console.error('Error in storeEmbedding:', error)
      throw error
    }
  }

  async searchSimilar(query: string, matchThreshold = 0.78, matchCount = 10): Promise<SearchResult[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available')
    }

    try {
      const queryEmbedding = await this.generateEmbedding(query)
      
      const { data, error } = await supabaseAdmin.rpc('search_restaurants', {
        query_embedding: queryEmbedding,
        match_threshold: matchThreshold,
        match_count: matchCount,
      })

      if (error) {
        console.error('Error searching embeddings:', error)
        throw new Error('Failed to search embeddings')
      }

      return data || []
    } catch (error) {
      console.error('Error in searchSimilar:', error)
      throw error
    }
  }

  async getRestaurantContext(restaurantIds: string[]): Promise<RestaurantContext[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available')
    }

    try {
      const { data, error } = await supabaseAdmin.rpc('get_restaurant_with_context', {
        restaurant_ids: restaurantIds,
      })

      if (error) {
        console.error('Error getting restaurant context:', error)
        throw new Error('Failed to get restaurant context')
      }

      return data || []
    } catch (error) {
      console.error('Error in getRestaurantContext:', error)
      throw error
    }
  }

  async indexRestaurant(restaurantId: string): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available')
    }

    try {
      // Get restaurant data
      const { data: restaurant, error: restaurantError } = await supabaseAdmin
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single()

      if (restaurantError || !restaurant) {
        throw new Error('Restaurant not found')
      }

      // Get menu data
      const { data: menus, error: menuError } = await supabaseAdmin
        .from('menus')
        .select('*')
        .eq('user_id', restaurant.user_id)

      if (menuError) {
        console.error('Error fetching menus:', menuError)
      }

      // Clear existing embeddings for this restaurant
      await supabaseAdmin
        .from('restaurant_embeddings')
        .delete()
        .eq('restaurant_id', restaurantId)

      // Create restaurant info embedding
      const restaurantInfo = `${restaurant.name}. ${restaurant.description || ''}. Located at ${restaurant.address || 'address not specified'}. ${restaurant.phone ? `Phone: ${restaurant.phone}.` : ''} ${restaurant.website ? `Website: ${restaurant.website}.` : ''}`
      
      await this.storeEmbedding({
        restaurant_id: restaurantId,
        content: restaurantInfo,
        content_type: 'restaurant_info',
        metadata: {
          name: restaurant.name,
          address: restaurant.address,
          phone: restaurant.phone,
          website: restaurant.website,
          slug: restaurant.slug,
        },
      })

      // Index menu items if available
      if (menus && menus.length > 0) {
        for (const menu of menus) {
          if (menu.extracted_data && typeof menu.extracted_data === 'object') {
            const menuData = menu.extracted_data as any
            
            // Index categories and items
            if (menuData.categories && Array.isArray(menuData.categories)) {
              for (const category of menuData.categories) {
                // Index category
                if (category.name) {
                  await this.storeEmbedding({
                    restaurant_id: restaurantId,
                    content: `${category.name} category at ${restaurant.name}`,
                    content_type: 'category',
                    metadata: {
                      category_name: category.name,
                      restaurant_name: restaurant.name,
                    },
                  })
                }

                // Index items in category
                if (category.items && Array.isArray(category.items)) {
                  for (const item of category.items) {
                    const itemContent = `${item.name || 'Unnamed item'} - ${item.description || 'No description'} - Price: ${item.price || 'Price not specified'} at ${restaurant.name}`
                    
                    await this.storeEmbedding({
                      restaurant_id: restaurantId,
                      content: itemContent,
                      content_type: 'menu_item',
                      metadata: {
                        item_name: item.name,
                        item_description: item.description,
                        item_price: item.price,
                        category_name: category.name,
                        restaurant_name: restaurant.name,
                      },
                    })
                  }
                }
              }
            }
          }
        }
      }

      console.log(`Successfully indexed restaurant: ${restaurant.name}`)
    } catch (error) {
      console.error('Error indexing restaurant:', error)
      throw error
    }
  }

  async indexAllRestaurants(): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available')
    }

    try {
      const { data: restaurants, error } = await supabaseAdmin
        .from('restaurants')
        .select('id, name')

      if (error) {
        throw new Error('Failed to fetch restaurants')
      }

      console.log(`Indexing ${restaurants?.length || 0} restaurants...`)

      for (const restaurant of restaurants || []) {
        try {
          await this.indexRestaurant(restaurant.id)
          console.log(`✅ Indexed: ${restaurant.name}`)
        } catch (error) {
          console.error(`❌ Failed to index ${restaurant.name}:`, error)
        }
      }

      console.log('Finished indexing all restaurants')
    } catch (error) {
      console.error('Error indexing all restaurants:', error)
      throw error
    }
  }
}

export const embeddingService = EmbeddingService.getInstance()
