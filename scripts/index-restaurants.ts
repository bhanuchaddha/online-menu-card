#!/usr/bin/env tsx

/**
 * Script to index all restaurants for vector search
 * Run this after setting up the vector store and adding restaurants
 * 
 * Usage: npx tsx scripts/index-restaurants.ts
 */

import { config } from 'dotenv'
import { embeddingService } from '../src/lib/embedding-service'

// Load environment variables
config()

async function main() {
  console.log('🚀 Starting restaurant indexing...')
  
  try {
    await embeddingService.indexAllRestaurants()
    console.log('✅ Successfully indexed all restaurants!')
  } catch (error) {
    console.error('❌ Error indexing restaurants:', error)
    process.exit(1)
  }
}

// Check if required environment variables are set
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY environment variable is required')
  console.error('Please add OPENAI_API_KEY to your .env.local file')
  process.exit(1)
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  console.error('Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file')
  process.exit(1)
}

main().catch(console.error)
