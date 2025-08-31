// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { embeddingService } from '@/lib/embedding-service'

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

export async function POST(request: NextRequest) {
  try {
    const { message, conversation_history = [] } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Search for relevant restaurants and menu items
    const searchResults = await embeddingService.searchSimilar(message, 0.75, 8)
    
    // Get unique restaurant IDs from search results
    const restaurantIds = [...new Set(searchResults.map(result => result.restaurant_id))]
    
    // Get restaurant context
    const restaurants = await embeddingService.getRestaurantContext(restaurantIds)
    
    // Build context for the AI
    let context = "You are a helpful restaurant finder assistant. Based on the user's query, help them find restaurants and menu items that match their preferences.\n\n"
    
    if (searchResults.length > 0) {
      context += "Here are the most relevant restaurants and menu items I found:\n\n"
      
      // Group results by restaurant
      const resultsByRestaurant = new Map()
      
      for (const result of searchResults) {
        const restaurant = restaurants.find(r => r.id === result.restaurant_id)
        if (!restaurant) continue
        
        if (!resultsByRestaurant.has(result.restaurant_id)) {
          resultsByRestaurant.set(result.restaurant_id, {
            restaurant,
            items: []
          })
        }
        
        resultsByRestaurant.get(result.restaurant_id).items.push(result)
      }
      
      // Format context for each restaurant
      for (const [restaurantId, data] of resultsByRestaurant) {
        const { restaurant, items } = data
        
        context += `**${restaurant.name}**\n`
        if (restaurant.description) context += `Description: ${restaurant.description}\n`
        if (restaurant.address) context += `Address: ${restaurant.address}\n`
        if (restaurant.phone) context += `Phone: ${restaurant.phone}\n`
        if (restaurant.website) context += `Website: ${restaurant.website}\n`
        context += `Menu Link: /menu/${restaurant.slug}\n`
        
        // Add relevant menu items/categories
        const menuItems = items.filter(item => item.content_type === 'menu_item')
        const categories = items.filter(item => item.content_type === 'category')
        
        if (categories.length > 0) {
          context += `Categories: ${categories.map(c => c.metadata.category_name).join(', ')}\n`
        }
        
        if (menuItems.length > 0) {
          context += "Menu Items:\n"
          for (const item of menuItems.slice(0, 3)) { // Limit to top 3 items per restaurant
            context += `- ${item.metadata.item_name}`
            if (item.metadata.item_price) context += ` (${item.metadata.item_price})`
            if (item.metadata.item_description) context += `: ${item.metadata.item_description}`
            context += `\n`
          }
        }
        
        context += `\n`
      }
    } else {
      context += "I couldn't find any restaurants that closely match your query. I'll provide general assistance.\n\n"
    }
    
    context += `User's question: ${message}\n\n`
    context += "Please provide a helpful response that:\n"
    context += "1. Answers the user's question about restaurants or food\n"
    context += "2. Recommends specific restaurants from the search results when relevant\n"
    context += "3. Includes practical information like addresses, phone numbers, and menu links\n"
    context += "4. Is conversational and friendly\n"
    context += "5. If no good matches were found, suggest they try a different search or browse all restaurants\n"

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

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    })

    const aiResponse = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.'

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
