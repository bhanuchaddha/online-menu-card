// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { OpenRouterService } from '@/lib/openrouter'
import { menuService, RestaurantData, MenuData } from '@/lib/menu-service'

const openRouterService = new OpenRouterService()

// New text search function that calls the menu service
async function searchRestaurants(query: string) {
  try {
    const restaurants = await menuService.searchRestaurantsByText(query)

    // To provide more context to the LLM, we can fetch menu details for the found restaurants.
    const searchResults = []
    for (const restaurant of restaurants) {
      const menus = await menuService.getPublicRestaurantWithMenus(restaurant.slug)
      searchResults.push({
        ...restaurant,
        menus: menus.menus.map(m => m.extractedData) // Add menu data to the context
      })
    }
    
    return { searchResults, restaurants }
  } catch (error) {
    console.error('Text search error:', error)
    return { searchResults: [], restaurants: [] }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversation_history = [] } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Use the new database text search
    const { searchResults, restaurants } = await searchRestaurants(message)
    
    // Build context for the AI
    let context = "You are a helpful restaurant finder assistant. Based on the user's query, help them find restaurants and menu items that match their preferences.\n\n"
    
    if (searchResults.length > 0) {
      context += "Here are the most relevant restaurants and menu items I found:\n\n"
      
      // Group results by restaurant
      const resultsByRestaurant = new Map()
      
      for (const result of searchResults) {
        const restaurantName = result.name || result.restaurant_name
        if (!restaurantName) continue
        
        if (!resultsByRestaurant.has(restaurantName)) {
          resultsByRestaurant.set(restaurantName, {
            restaurant: result,
            items: []
          })
        }
        
        resultsByRestaurant.get(restaurantName).items.push(result)
      }
      
      // Format context for each restaurant
      for (const [restaurantName, data] of resultsByRestaurant) {
        const { restaurant, items } = data
        
        context += `**${restaurantName}**\n`
        if (restaurant.description) context += `Description: ${restaurant.description}\n`
        if (restaurant.address) context += `Address: ${restaurant.address}\n`
        if (restaurant.phone) context += `Phone: ${restaurant.phone}\n`
        if (restaurant.website) context += `Website: ${restaurant.website}\n`
        if (restaurant.slug) context += `Menu Link: /menu/${restaurant.slug}\n`
        
        // Add relevant menu items/categories
        const menuItems = items.filter(item => item.type === 'menu_item')
        const categories = items.filter(item => item.type === 'category')
        
        if (categories.length > 0) {
          context += `Categories: ${categories.map(c => c.category_name).join(', ')}\n`
        }
        
        if (menuItems.length > 0) {
          context += "Menu Items:\n"
          for (const item of menuItems.slice(0, 3)) { // Limit to top 3 items per restaurant
            context += `- ${item.item_name}`
            if (item.item_price) context += ` (${item.item_price})`
            if (item.item_description) context += `: ${item.item_description}`
            context += `\n`
          }
        }
        
        context += `\n`
      }
    } else {
      context += "I couldn't find any restaurants that closely match your query. Let me help you with general restaurant information or try a different search.\n\n"
    }
    
    context += `User's question: ${message}\n\n`
    context += "Please provide a helpful response that:\n"
    context += "1. Answers the user's question about restaurants or food\n"
    context += "2. Recommends specific restaurants from the search results when relevant\n"
    context += "3. Includes practical information like addresses, phone numbers, and menu links\n"
    context += "4. Is conversational and friendly\n"
    context += "5. If no good matches were found, suggest they try a different search or browse all restaurants\n"
    context += "6. Formats the response using Markdown (e.g., use **bold** for names, lists for items, and links for menus)\n"

    // Build conversation messages
    const messages = [
      {
        role: 'system' as const,
        content: context
      },
      ...conversation_history.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user' as const,
        content: message
      }
    ]

    // Get AI response using OpenRouter
    const aiResponse = await openRouterService.generateChatResponse(messages, {
      maxTokens: 500,
      temperature: 0.7
    })

    return NextResponse.json({
      success: true,
      response: aiResponse,
      restaurants_found: restaurants.length,
      search_results_count: searchResults.length
    })

  } catch (error) {
    console.error('Chatbot error:', error)
    return NextResponse.json(
      { error: 'Failed to process chatbot request' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Restaurant Finder Chatbot API',
    usage: {
      'POST /api/chatbot': {
        description: 'Chat with the restaurant finder bot',
        body: {
          message: 'string - User message/query',
          conversation_history: 'array (optional) - Previous conversation messages'
        }
      }
    }
  })
}
