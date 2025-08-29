#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🤖 Automated Database Setup')
console.log('============================\n')

const supabase = createClient(supabaseUrl, supabaseKey)

// Define our schema as code
const SCHEMA_DEFINITION = {
  tables: {
    menus: {
      columns: {
        id: 'UUID DEFAULT gen_random_uuid() PRIMARY KEY',
        user_id: 'TEXT NOT NULL',
        restaurant_name: 'TEXT NOT NULL', 
        image_url: 'TEXT NOT NULL',
        extracted_data: 'JSONB NOT NULL',
        created_at: 'TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE(\'utc\'::text, NOW()) NOT NULL',
        updated_at: 'TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE(\'utc\'::text, NOW()) NOT NULL'
      },
      indexes: [
        'CREATE INDEX IF NOT EXISTS idx_menus_user_id ON menus(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_menus_created_at ON menus(created_at DESC)'
      ]
    },
    restaurants: {
      columns: {
        id: 'UUID DEFAULT gen_random_uuid() PRIMARY KEY',
        user_id: 'TEXT NOT NULL',
        name: 'TEXT NOT NULL',
        description: 'TEXT',
        address: 'TEXT', 
        phone: 'TEXT',
        website: 'TEXT',
        slug: 'TEXT UNIQUE NOT NULL',
        created_at: 'TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE(\'utc\'::text, NOW()) NOT NULL',
        updated_at: 'TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE(\'utc\'::text, NOW()) NOT NULL'
      },
      indexes: [
        'CREATE INDEX IF NOT EXISTS idx_restaurants_user_id ON restaurants(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants(slug)'
      ]
    }
  }
}

function generateCreateTableSQL(tableName, definition) {
  const columns = Object.entries(definition.columns)
    .map(([name, type]) => `  ${name} ${type}`)
    .join(',\n')
  
  return `CREATE TABLE IF NOT EXISTS ${tableName} (\n${columns}\n);`
}

async function createTablesFromCode() {
  console.log('📝 Generating SQL from schema definition...\n')
  
  const sqlStatements = []
  
  // Generate CREATE TABLE statements
  for (const [tableName, definition] of Object.entries(SCHEMA_DEFINITION.tables)) {
    const createSQL = generateCreateTableSQL(tableName, definition)
    sqlStatements.push(createSQL)
    
    // Add indexes
    if (definition.indexes) {
      sqlStatements.push(...definition.indexes)
    }
    
    console.log(`✅ Generated SQL for ${tableName} table`)
  }
  
  // Add RLS disable for development
  sqlStatements.push('ALTER TABLE menus DISABLE ROW LEVEL SECURITY;')
  sqlStatements.push('ALTER TABLE restaurants DISABLE ROW LEVEL SECURITY;')
  
  const fullSQL = sqlStatements.join('\n\n')
  
  console.log('\n📋 Complete Generated SQL:')
  console.log('=' .repeat(60))
  console.log(fullSQL)
  console.log('=' .repeat(60))
  
  return fullSQL
}

async function testTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('count', { count: 'exact', head: true })
    
    if (error && error.code === 'PGRST205') {
      return false // Table doesn't exist
    }
    
    return true // Table exists
  } catch (err) {
    return false
  }
}

async function main() {
  console.log('🔍 Checking current database state...')
  
  const menusExists = await testTableExists('menus')
  const restaurantsExists = await testTableExists('restaurants')
  
  console.log(`📊 Current Status:`)
  console.log(`   • menus table: ${menusExists ? '✅ EXISTS' : '❌ MISSING'}`)
  console.log(`   • restaurants table: ${restaurantsExists ? '✅ EXISTS' : '❌ MISSING'}`)
  
  if (!menusExists || !restaurantsExists) {
    console.log('\n🛠️  Generating creation SQL...')
    const sql = await createTablesFromCode()
    
    console.log('\n💡 To create tables programmatically, you would:')
    console.log('   1. Use Supabase Service Role Key (admin access)')
    console.log('   2. Execute the SQL via Supabase Management API')
    console.log('   3. Or use a database migration tool')
    
    console.log('\n🔧 For now, copy the SQL above and run it in Supabase Dashboard')
  } else {
    console.log('\n✅ All tables exist! Database is ready.')
  }
}

main().catch(console.error)
