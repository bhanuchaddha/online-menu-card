# Restaurant Finder Chatbot Setup

This guide will help you set up the AI-powered restaurant finder chatbot that uses Supabase vector store to help users find restaurants based on their preferences.

## Features

- 🤖 **AI-Powered Search**: Uses OpenAI embeddings and GPT-3.5-turbo for intelligent restaurant recommendations
- 🔍 **Vector Search**: Semantic search through restaurant information and menu items
- 💬 **Interactive Chat**: Real-time conversation interface with chat history
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎯 **Context-Aware**: Provides relevant restaurant details, addresses, and menu links

## Prerequisites

1. **OpenAI API Key**: Required for generating embeddings and chat responses
2. **Supabase Project**: With pgvector extension enabled
3. **Environment Variables**: Properly configured

## Setup Instructions

### 1. Install Dependencies

The required dependencies are already added to `package.json`:
- `openai`: For AI embeddings and chat completions
- `@supabase/supabase-js`: For vector database operations

```bash
npm install
```

### 2. Environment Variables

Add these to your `.env.local` file:

```env
# OpenAI API Key (required)
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration (required)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup

#### Step 1: Enable pgvector Extension

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
```

#### Step 2: Create Vector Tables

Run the SQL script provided in `setup-vector-store.sql`:

```bash
# Copy the contents of setup-vector-store.sql and run in Supabase SQL Editor
```

This will create:
- `restaurant_embeddings` table for storing vector data
- Search functions for similarity matching
- Proper indexes for performance
- Row Level Security policies

### 4. Index Your Restaurants

After setting up the database and adding restaurants, you need to create embeddings:

#### Option 1: Using the Script (Recommended)

```bash
npm run index:restaurants
```

#### Option 2: Using the API Endpoint

```bash
# Index all restaurants
curl -X POST http://localhost:3000/api/embeddings/index \
  -H "Content-Type: application/json" \
  -d '{"index_all": true}'

# Index specific restaurant
curl -X POST http://localhost:3000/api/embeddings/index \
  -H "Content-Type: application/json" \
  -d '{"restaurant_id": "your-restaurant-id"}'
```

### 5. Test the Chatbot

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit your website - you'll see a floating chat button in the bottom-right corner

3. Click the button and try asking questions like:
   - "I'm looking for Italian restaurants"
   - "Show me places with pizza"
   - "Find restaurants near downtown"
   - "I want vegetarian options"

## How It Works

### 1. Data Indexing

When you run the indexing script, it:
- Fetches all restaurants from your database
- Creates embeddings for restaurant information (name, description, address)
- Creates embeddings for menu categories and items
- Stores everything in the `restaurant_embeddings` table

### 2. Search Process

When a user asks a question:
1. The query is converted to an embedding using OpenAI
2. Vector similarity search finds relevant restaurants/menu items
3. Context is built from the search results
4. OpenAI GPT-3.5-turbo generates a helpful response
5. The response includes restaurant details and menu links

### 3. UI Components

- **Floating Button**: Always accessible chat trigger
- **Chat Interface**: Modal dialog with conversation history
- **Message Bubbles**: User and assistant messages with timestamps
- **Loading States**: Visual feedback during AI processing

## Customization

### Modify Search Parameters

In `src/lib/embedding-service.ts`, you can adjust:

```typescript
// Similarity threshold (0.0 to 1.0, higher = more strict)
const matchThreshold = 0.78

// Number of results to return
const matchCount = 10
```

### Customize AI Responses

In `src/app/api/chatbot/route.ts`, modify the system prompt:

```typescript
const context = "You are a helpful restaurant finder assistant..."
```

### Style the Chatbot

The chatbot uses Tailwind CSS classes and can be customized in:
- `src/components/chatbot/restaurant-chatbot.tsx`

## API Endpoints

### POST /api/chatbot
Chat with the restaurant finder bot.

**Request:**
```json
{
  "message": "I'm looking for pizza places",
  "conversation_history": [
    {"role": "user", "content": "Previous message"},
    {"role": "assistant", "content": "Previous response"}
  ]
}
```

**Response:**
```json
{
  "success": true,
  "response": "I found several great pizza places for you...",
  "restaurants_found": 3,
  "search_results_count": 8
}
```

### POST /api/embeddings/index
Index restaurants for vector search.

**Request:**
```json
{
  "index_all": true
}
```
or
```json
{
  "restaurant_id": "uuid-here"
}
```

## Troubleshooting

### Common Issues

1. **"Failed to generate embedding"**
   - Check your OpenAI API key
   - Ensure you have sufficient API credits

2. **"Supabase admin client not available"**
   - Verify `SUPABASE_SERVICE_ROLE_KEY` is set
   - Check Supabase project configuration

3. **"No restaurants found"**
   - Run the indexing script: `npm run index:restaurants`
   - Check that restaurants exist in your database

4. **Vector search not working**
   - Ensure pgvector extension is enabled
   - Verify the vector tables were created correctly

### Performance Tips

1. **Indexing**: Re-run indexing when you add new restaurants or update menus
2. **Caching**: Consider implementing response caching for common queries
3. **Rate Limiting**: Add rate limiting to prevent API abuse

## Security Considerations

1. **API Keys**: Never expose OpenAI API keys in client-side code
2. **Rate Limiting**: Implement rate limiting on chat endpoints
3. **Input Validation**: Sanitize user inputs before processing
4. **RLS Policies**: Ensure proper Row Level Security on Supabase tables

## Cost Optimization

1. **Embedding Model**: Using `text-embedding-ada-002` (cost-effective)
2. **Chat Model**: Using `gpt-3.5-turbo` (faster and cheaper than GPT-4)
3. **Token Limits**: Limited to 500 tokens per response
4. **Context Management**: Only sends last 6 messages for context

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Test API endpoints directly
4. Check Supabase logs for database errors

The chatbot is now ready to help your users find restaurants based on their preferences!
