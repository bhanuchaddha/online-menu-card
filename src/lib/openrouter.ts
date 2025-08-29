interface OpenRouterMessage {
  role: 'user' | 'system' | 'assistant'
  content: string | Array<{
    type: 'text' | 'image_url'
    text?: string
    image_url?: {
      url: string
      detail?: 'low' | 'high' | 'auto'
    }
  }>
}

interface MenuExtractionResult {
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

export class OpenRouterService {
  private apiKey: string
  private baseUrl = 'https://openrouter.ai/api/v1'

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY!
    if (!this.apiKey) {
      throw new Error('OPENROUTER_API_KEY is not configured')
    }
  }

  async extractMenuFromImage(imageUrl: string): Promise<MenuExtractionResult> {
    const messages: OpenRouterMessage[] = [
      {
        role: 'system',
        content: `You are an expert at reading restaurant menus from images. Extract all menu items with their details in a structured JSON format.

Rules:
1. Extract restaurant name if visible
2. Organize items by categories (Appetizers, Main Courses, Desserts, Beverages, etc.)
3. For each item extract: name, description (if available), price
4. Identify dietary information (vegetarian, vegan, gluten-free, spicy, etc.)
5. Clean up text and fix any OCR errors
6. Return only valid JSON, no markdown or extra text

Response format:
{
  "restaurant_name": "Restaurant Name",
  "categories": [
    {
      "name": "Category Name",
      "items": [
        {
          "name": "Item Name",
          "description": "Item description",
          "price": "10.99",
          "dietary_info": ["vegetarian", "spicy"]
        }
      ]
    }
  ]
}`
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Please extract all menu items from this image and format them as JSON.'
          },
          {
            type: 'image_url',
            image_url: {
              url: imageUrl,
              detail: 'high'
            }
          }
        ]
      }
    ]

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': process.env.NEXT_PUBLIC_APP_NAME || 'MenuCard'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image-preview:free', // Using Google Gemini 2.5 Flash (free)
          messages,
          max_tokens: 2000,
          temperature: 0.1, // Low temperature for consistent extraction
        })
      })

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from OpenRouter API')
      }

      const content = data.choices[0].message.content
      
      // Parse the JSON response
      try {
        const result = JSON.parse(content)
        return result as MenuExtractionResult
      } catch {
        // If JSON parsing fails, try to extract JSON from the response (handle markdown code blocks)
        const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const jsonString = jsonMatch[1] || jsonMatch[0]
          try {
            return JSON.parse(jsonString) as MenuExtractionResult
          } catch {
            console.error('Failed to parse menu extraction result')
          }
        }
        
        throw new Error('Failed to parse menu extraction result')
      }
    } catch (error) {
      console.error('OpenRouter API Error:', error)
      throw error
    }
  }

  async getAvailableModels() {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching available models:', error)
      throw error
    }
  }
}
