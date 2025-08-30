#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({ path: join(__dirname, '.env.local') })

const prisma = new PrismaClient()

async function debugMenuService() {
  try {
    console.log('🔍 Debugging Menu Service...\n')
    
    // 1. Check total counts
    const restaurantCount = await prisma.restaurant.count()
    const menuCount = await prisma.menu.count()
    console.log(`📊 Database totals:`)
    console.log(`   • Restaurants: ${restaurantCount}`)
    console.log(`   • Menus: ${menuCount}\n`)
    
    // 2. Get a sample restaurant
    const sampleRestaurant = await prisma.restaurant.findFirst({
      where: { name: 'Bella Vista' }
    })
    
    if (sampleRestaurant) {
      console.log(`🏪 Sample restaurant (Bella Vista):`)
      console.log(`   • ID: ${sampleRestaurant.id}`)
      console.log(`   • Name: ${sampleRestaurant.name}`)
      console.log(`   • User ID: ${sampleRestaurant.userId}`)
      console.log(`   • Slug: ${sampleRestaurant.slug}\n`)
      
      // 3. Check for matching menus using the exact same logic as the service
      const menuCount = await prisma.menu.count({
        where: { 
          AND: [
            { userId: sampleRestaurant.userId },
            { restaurantName: sampleRestaurant.name }
          ]
        }
      })
      
      console.log(`🍽️  Matching menus for Bella Vista: ${menuCount}`)
      
      if (menuCount === 0) {
        // Debug: Check what menus exist for this user
        const userMenus = await prisma.menu.findMany({
          where: { userId: sampleRestaurant.userId },
          select: { restaurantName: true, userId: true }
        })
        
        console.log(`\n🔍 All menus for user ${sampleRestaurant.userId}:`)
        userMenus.forEach((menu, index) => {
          console.log(`   ${index + 1}. "${menu.restaurantName}" (user: ${menu.userId})`)
        })
        
        // Check if there's a name mismatch
        const exactMatch = userMenus.find(menu => menu.restaurantName === sampleRestaurant.name)
        console.log(`\n❓ Exact name match found: ${!!exactMatch}`)
      }
    } else {
      console.log('❌ Bella Vista restaurant not found')
    }
    
    // 4. Test the actual getAllPublicRestaurants logic
    console.log('\n🧪 Testing getAllPublicRestaurants logic...')
    
    const restaurants = await prisma.restaurant.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    })
    
    console.log(`📋 Found ${restaurants.length} restaurants to process`)
    
    let restaurantsWithMenus = 0
    for (const restaurant of restaurants) {
      const menuCount = await prisma.menu.count({
        where: { 
          AND: [
            { userId: restaurant.userId },
            { restaurantName: restaurant.name }
          ]
        }
      })
      
      if (menuCount > 0) {
        restaurantsWithMenus++
        console.log(`   ✅ ${restaurant.name}: ${menuCount} menu(s)`)
      } else {
        console.log(`   ❌ ${restaurant.name}: 0 menus`)
      }
    }
    
    console.log(`\n📈 Summary: ${restaurantsWithMenus} out of ${restaurants.length} restaurants have menus`)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

debugMenuService()
