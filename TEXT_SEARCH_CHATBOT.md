# Restaurant Finder Chatbot - Text Search Version

This version of the chatbot uses **Supabase's built-in PostgreSQL text search** instead of embeddings, making it completely free and requiring no external AI APIs for search functionality.

## How It Works

### 1. **Text Search Process**

When a user asks: *"Find pizza places"*

```
User Query → Text Search Function → PostgreSQL ILIKE Queries → Results → LLM Context → AI Response
```

### 2. **Search Strategy**

The system searches across multiple data sources:

#### **Restaurant Table Search**
```sql
SELECT * FROM restaurants 
WHERE name ILIKE '%pizza%' 
   OR description ILIKE '%pizza%' 
   OR address ILIKE '%pizza%'
```

#### **Menu Data Search**
```sql
SELECT * FROM menus 
WHERE restaurant_name ILIKE '%pizza%'
```

#### **JSON Menu Content Search**
- Searches within `extracted_data` JSON field
- Looks through categories and menu items
- Matches item names, descriptions, and prices

### 3. **What Gets Searched**

✅ **Restaurant Information:**
- Restaurant names
- Descriptions  
- Addresses
- Phone numbers

✅ **Menu Data:**
- Restaurant names in menus
- Category names (e.g., "Pizza", "Appetizers")
- Menu item names (e.g., "Margherita Pizza")
- Item descriptions
- Prices

### 4. **Search Examples**

| User Query | What It Finds |
|------------|---------------|
| "pizza" | Restaurants with "pizza" in name/description, pizza menu items |
| "Italian food" | Italian restaurants, Italian dishes |
| "vegetarian" | Restaurants mentioning vegetarian, vegetarian menu items |
| "downtown" | Restaurants with "downtown" in address |
| "under $15" | Menu items with prices under $15 |

## Setup Instructions

### 1. **No Additional Dependencies**
The text search uses only:
- Supabase (already configured)
- OpenRouter (for LLM responses)
- No embedding models needed!

### 2. **Environment Variables**
Only need:
```env
OPENROUTER_API_KEY=your_openrouter_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key
```

### 3. **Test the Search**
```bash
# Test if search is working
curl "http://localhost:3000/api/search/test?q=pizza"

# Test the chatbot
curl -X POST http://localhost:3000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "Find pizza places"}'
```

## Advantages of Text Search

### ✅ **Pros:**
- **Free**: No embedding API costs
- **Fast**: Direct PostgreSQL queries
- **Simple**: No complex vector operations
- **Reliable**: Works with existing data immediately
- **Flexible**: Easy to modify search logic

### ⚠️ **Limitations:**
- **Exact matching**: Less semantic understanding
- **Keyword dependent**: Needs exact words in data
- **No similarity ranking**: Results not ranked by relevance

## Search Quality Tips

### 1. **Improve Restaurant Data**
Add descriptive information to restaurants:
```sql
UPDATE restaurants 
SET description = 'Authentic Italian pizza with wood-fired oven, vegetarian options available'
WHERE name = 'Mario Pizza';
```

### 2. **Rich Menu Descriptions**
Ensure menu items have good descriptions:
```json
{
  "name": "Margherita Pizza",
  "description": "Fresh mozzarella, tomato sauce, basil, vegetarian",
  "price": "$14.99"
}
```

### 3. **Use Keywords**
Include common search terms in your data:
- Cuisine types: "Italian", "Chinese", "Mexican"
- Dietary: "vegetarian", "vegan", "gluten-free"
- Price ranges: "budget-friendly", "affordable"
- Location: "downtown", "near park"

## Advanced Text Search Features

### 1. **Multiple Keywords**
The system can handle multiple search terms:
- "Italian vegetarian" → Finds Italian restaurants with vegetarian options

### 2. **Partial Matching**
Uses `ILIKE` with wildcards:
- "pizz" matches "pizza", "pizzeria", "pizzas"

### 3. **Case Insensitive**
All searches are case-insensitive automatically.

## Upgrading to Vector Search Later

When you're ready to use embeddings:

1. **Keep the text search as fallback**
2. **Add vector search for better semantic matching**
3. **Combine both approaches for best results**

```typescript
// Hybrid approach
const textResults = await textSearch(query)
const vectorResults = await vectorSearch(query)
const combinedResults = [...textResults, ...vectorResults]
```

## Performance Optimization

### 1. **Database Indexes**
Add indexes for better performance:
```sql
CREATE INDEX idx_restaurants_name_gin ON restaurants USING gin(to_tsvector('english', name));
CREATE INDEX idx_restaurants_description_gin ON restaurants USING gin(to_tsvector('english', description));
```

### 2. **Limit Results**
The system limits results to prevent slow responses:
- 5 restaurants max
- 10 menus max
- 8 total search results

### 3. **Caching**
Consider adding caching for common queries:
```typescript
const cacheKey = `search:${query}`
const cached = await redis.get(cacheKey)
if (cached) return JSON.parse(cached)
```

## Testing Your Setup

### 1. **Add Test Data**
Make sure you have restaurants with good descriptions:
```sql
INSERT INTO restaurants (name, description, address) VALUES 
('Pizza Palace', 'Authentic Italian pizza with vegetarian and vegan options', '123 Main St Downtown'),
('Burger Barn', 'Gourmet burgers with gluten-free buns available', '456 Oak Ave');
```

### 2. **Test Queries**
Try these in your chatbot:
- "I want pizza"
- "Show me vegetarian restaurants"
- "Find places downtown"
- "What has gluten-free options?"

### 3. **Check Results**
The chatbot should return:
- Restaurant names and descriptions
- Relevant menu items
- Addresses and contact info
- Direct links to menu pages

## Troubleshooting

### **No Results Found**
1. Check if restaurants exist in database
2. Verify search terms match your data
3. Test with `/api/search/test?q=yourquery`

### **Poor Quality Results**
1. Add more descriptive restaurant information
2. Include keywords in menu item descriptions
3. Use common search terms in your data

### **Slow Performance**
1. Add database indexes
2. Limit result counts
3. Consider caching frequent queries

The text search chatbot is now ready to help users find restaurants without any embedding costs! 🚀
