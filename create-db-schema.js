#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Need service key for admin operations

console.log('🛠️  Creating Database Schema Programmatically...')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials!')
  console.log('You need SUPABASE_SERVICE_ROLE_KEY for admin operations')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTables() {
  try {
    console.log('📝 Creating menus table...')
    
    // Create menus table using SQL
    const createMenusTable = `
      CREATE TABLE IF NOT EXISTS menus (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id TEXT NOT NULL,
        restaurant_name TEXT NOT NULL,
        image_url TEXT NOT NULL,
        extracted_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );
    `
    
    const { error: menusError } = await supabase.rpc('exec_sql', { 
      query: createMenusTable 
    })
    
    if (menusError) {
      console.log('Using direct SQL execution...')
      // Try alternative approach with raw SQL
      const { error: directError } = await supabase
        .from('_sql')
        .insert({ query: createMenusTable })
      
      if (directError) {
        console.log('⚠️  Cannot create tables via API. Using manual SQL approach.')
        console.log('This is because Supabase restricts DDL operations via client.')
        return false
      }
    }

    console.log('✅ Tables creation initiated')
    return true
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message)
    return false
  }
}

async function createSchemaViaDDL() {
  console.log('🔧 Alternative: Creating schema via DDL operations...')
  
  try {
    // This approach uses Supabase's schema builder (if available)
    const tables = [
      {
        name: 'menus',
        columns: [
          { name: 'id', type: 'uuid', default: 'gen_random_uuid()', primary: true },
          { name: 'user_id', type: 'text', nullable: false },
          { name: 'restaurant_name', type: 'text', nullable: false },
          { name: 'image_url', type: 'text', nullable: false },
          { name: 'extracted_data', type: 'jsonb', nullable: false },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' }
        ]
      }
    ]

    // Note: This is pseudo-code - Supabase doesn't expose direct DDL via client
    console.log('📋 Schema definition:', JSON.stringify(tables, null, 2))
    console.log('⚠️  Supabase client doesn\'t support direct DDL operations')
    
  } catch (error) {
    console.error('DDL approach failed:', error.message)
  }
}

async function main() {
  console.log('🚀 Database Schema Creation Options:\n')
  
  console.log('1️⃣  **Programmatic Approach (Limited)**')
  await createTables()
  
  console.log('\n2️⃣  **DDL Approach (Not Available)**')
  await createSchemaViaDDL()
  
  console.log('\n3️⃣  **Why We Use Manual SQL Scripts:**')
  console.log('   • Supabase restricts DDL operations via client for security')
  console.log('   • Admin operations require service role key')
  console.log('   • Manual SQL gives full control over schema')
  console.log('   • Better for RLS policies and complex constraints')
  
  console.log('\n4️⃣  **Best Practices:**')
  console.log('   • Use Migrations for production')
  console.log('   • Version control your schema changes')
  console.log('   • Test schema changes in staging first')
}

main().catch(console.error)
