#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

// Restaurant types and their typical menu items
const RESTAURANT_TYPES = {
  italian: {
    cuisines: ['Italian', 'Mediterranean'],
    menuItems: [
      { name: 'Margherita Pizza', description: 'Fresh tomatoes, mozzarella, and basil', price: 18.99, category: 'Pizza' },
      { name: 'Pepperoni Pizza', description: 'Classic pepperoni with mozzarella cheese', price: 21.99, category: 'Pizza' },
      { name: 'Spaghetti Carbonara', description: 'Creamy pasta with pancetta and parmesan', price: 16.99, category: 'Pasta' },
      { name: 'Fettuccine Alfredo', description: 'Rich cream sauce with parmesan cheese', price: 15.99, category: 'Pasta' },
      { name: 'Caesar Salad', description: 'Crisp romaine with parmesan and croutons', price: 12.99, category: 'Salads' },
      { name: 'Tiramisu', description: 'Classic Italian dessert with coffee and mascarpone', price: 8.99, category: 'Desserts' },
      { name: 'Garlic Bread', description: 'Fresh baked bread with garlic butter', price: 6.99, category: 'Appetizers' }
    ]
  },
  mexican: {
    cuisines: ['Mexican', 'Tex-Mex'],
    menuItems: [
      { name: 'Chicken Tacos', description: 'Grilled chicken with fresh salsa and cilantro', price: 12.99, category: 'Tacos' },
      { name: 'Beef Burrito', description: 'Seasoned ground beef with rice, beans, and cheese', price: 14.99, category: 'Burritos' },
      { name: 'Chicken Quesadilla', description: 'Grilled chicken and cheese in a crispy tortilla', price: 13.99, category: 'Quesadillas' },
      { name: 'Guacamole & Chips', description: 'Fresh avocado dip with crispy tortilla chips', price: 8.99, category: 'Appetizers' },
      { name: 'Churros', description: 'Crispy fried pastry with cinnamon sugar', price: 6.99, category: 'Desserts' },
      { name: 'Fish Tacos', description: 'Grilled fish with cabbage slaw and lime', price: 15.99, category: 'Tacos' },
      { name: 'Nachos Supreme', description: 'Loaded nachos with cheese, jalapeños, and sour cream', price: 11.99, category: 'Appetizers' }
    ]
  },
  asian: {
    cuisines: ['Chinese', 'Thai', 'Japanese', 'Korean'],
    menuItems: [
      { name: 'Pad Thai', description: 'Stir-fried rice noodles with shrimp and peanuts', price: 16.99, category: 'Noodles' },
      { name: 'General Tso\'s Chicken', description: 'Crispy chicken in sweet and spicy sauce', price: 15.99, category: 'Chicken' },
      { name: 'Beef Fried Rice', description: 'Wok-fried rice with tender beef and vegetables', price: 14.99, category: 'Rice' },
      { name: 'California Roll', description: 'Crab, avocado, and cucumber sushi roll', price: 8.99, category: 'Sushi' },
      { name: 'Hot & Sour Soup', description: 'Traditional Chinese soup with tofu and mushrooms', price: 6.99, category: 'Soups' },
      { name: 'Mango Sticky Rice', description: 'Sweet Thai dessert with coconut milk', price: 7.99, category: 'Desserts' },
      { name: 'Spring Rolls', description: 'Fresh vegetables wrapped in rice paper', price: 7.99, category: 'Appetizers' }
    ]
  },
  american: {
    cuisines: ['American', 'Burger', 'BBQ'],
    menuItems: [
      { name: 'Classic Cheeseburger', description: 'Beef patty with cheese, lettuce, and tomato', price: 13.99, category: 'Burgers' },
      { name: 'BBQ Ribs', description: 'Slow-cooked ribs with tangy BBQ sauce', price: 22.99, category: 'BBQ' },
      { name: 'Buffalo Wings', description: 'Spicy chicken wings with blue cheese dip', price: 11.99, category: 'Wings' },
      { name: 'Mac & Cheese', description: 'Creamy macaroni and cheese', price: 9.99, category: 'Sides' },
      { name: 'Apple Pie', description: 'Classic American dessert with vanilla ice cream', price: 7.99, category: 'Desserts' },
      { name: 'Loaded Fries', description: 'Crispy fries with cheese, bacon, and sour cream', price: 8.99, category: 'Sides' },
      { name: 'Chicken Caesar Wrap', description: 'Grilled chicken with caesar dressing in a tortilla', price: 12.99, category: 'Wraps' }
    ]
  },
  indian: {
    cuisines: ['Indian', 'South Asian'],
    menuItems: [
      { name: 'Chicken Tikka Masala', description: 'Creamy tomato curry with tender chicken', price: 17.99, category: 'Curry' },
      { name: 'Butter Chicken', description: 'Rich and creamy chicken curry', price: 16.99, category: 'Curry' },
      { name: 'Biryani', description: 'Fragrant basmati rice with spiced meat', price: 18.99, category: 'Rice' },
      { name: 'Naan Bread', description: 'Fresh baked Indian flatbread', price: 4.99, category: 'Bread' },
      { name: 'Samosas', description: 'Crispy pastries filled with spiced potatoes', price: 6.99, category: 'Appetizers' },
      { name: 'Gulab Jamun', description: 'Sweet milk dumplings in rose syrup', price: 6.99, category: 'Desserts' },
      { name: 'Dal Tadka', description: 'Spiced lentil curry with aromatic tempering', price: 12.99, category: 'Vegetarian' }
    ]
  },
  mediterranean: {
    cuisines: ['Mediterranean', 'Greek', 'Middle Eastern'],
    menuItems: [
      { name: 'Chicken Gyro', description: 'Seasoned chicken with tzatziki and pita', price: 14.99, category: 'Gyros' },
      { name: 'Hummus Platter', description: 'Creamy chickpea dip with pita and vegetables', price: 9.99, category: 'Appetizers' },
      { name: 'Greek Salad', description: 'Fresh vegetables with feta and olives', price: 11.99, category: 'Salads' },
      { name: 'Lamb Kebab', description: 'Grilled lamb skewers with rice pilaf', price: 19.99, category: 'Kebabs' },
      { name: 'Baklava', description: 'Flaky pastry with honey and nuts', price: 6.99, category: 'Desserts' },
      { name: 'Falafel Wrap', description: 'Crispy chickpea fritters with tahini sauce', price: 12.99, category: 'Wraps' },
      { name: 'Spanakopita', description: 'Spinach and feta in phyllo pastry', price: 8.99, category: 'Appetizers' }
    ]
  }
}

// Generate restaurant names
const RESTAURANT_NAMES = {
  italian: [
    'Bella Vista', 'Roma\'s Kitchen', 'Little Italy', 'Mama Mia\'s', 'Tuscany Bistro',
    'Villa Romano', 'Giuseppe\'s', 'La Dolce Vita', 'Amore Pizzeria', 'Nonna\'s Table'
  ],
  mexican: [
    'El Sombrero', 'Casa Miguel', 'Fiesta Cantina', 'Los Amigos', 'Azteca Grill',
    'Taco Libre', 'Hacienda Real', 'Chili\'s Corner', 'Mariachi\'s', 'Salsa Verde'
  ],
  asian: [
    'Golden Dragon', 'Sakura Sushi', 'Panda Garden', 'Lotus Blossom', 'Bamboo House',
    'Red Lantern', 'Jade Palace', 'Lucky Star', 'Oriental Express', 'Zen Garden'
  ],
  american: [
    'The Burger Joint', 'All-American Diner', 'Liberty Grill', 'Stars & Stripes', 'Main Street Cafe',
    'Route 66 BBQ', 'Hometown Heroes', 'Eagle\'s Nest', 'Freedom Fries', 'Patriot\'s Place'
  ],
  indian: [
    'Spice Palace', 'Curry House', 'Taj Mahal', 'Bombay Express', 'Saffron Kitchen',
    'Maharaja\'s', 'Delhi Darbar', 'Masala Magic', 'Royal India', 'Namaste Cafe'
  ],
  mediterranean: [
    'Olive Branch', 'Aegean Breeze', 'Santorini Grill', 'Mediterranean Oasis', 'Zeus Kitchen',
    'Mykonos Taverna', 'Cyprus Garden', 'Athens Corner', 'Poseidon\'s', 'Blue Sea Cafe'
  ]
}

// Generate addresses
const CITIES = [
  'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
  'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
  'Austin, TX', 'Jacksonville, FL', 'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC',
  'San Francisco, CA', 'Indianapolis, IN', 'Seattle, WA', 'Denver, CO', 'Washington, DC'
]

const STREET_NAMES = [
  'Main Street', 'Oak Avenue', 'Park Boulevard', 'First Street', 'Second Avenue',
  'Elm Street', 'Washington Street', 'Maple Avenue', 'Cedar Lane', 'Pine Street',
  'Broadway', 'Market Street', 'Church Street', 'Spring Street', 'High Street'
]

function generateSlug(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function generateAddress() {
  const streetNumber = Math.floor(Math.random() * 9999) + 1
  const streetName = STREET_NAMES[Math.floor(Math.random() * STREET_NAMES.length)]
  const city = CITIES[Math.floor(Math.random() * CITIES.length)]
  return `${streetNumber} ${streetName}, ${city}`
}

function generatePhone() {
  const areaCode = Math.floor(Math.random() * 900) + 100
  const exchange = Math.floor(Math.random() * 900) + 100
  const number = Math.floor(Math.random() * 9000) + 1000
  return `+1 (${areaCode}) ${exchange}-${number}`
}

function generateWebsite(name) {
  const domain = name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '')
  return `https://www.${domain}.com`
}

function createMenuData(restaurantType, restaurantName) {
  const typeData = RESTAURANT_TYPES[restaurantType]
  const categories = [...new Set(typeData.menuItems.map(item => item.category))]
  
  const menuData = {
    restaurant_name: restaurantName,
    categories: categories.map(categoryName => ({
      name: categoryName,
      items: typeData.menuItems
        .filter(item => item.category === categoryName)
        .map(item => ({
          name: item.name,
          description: item.description,
          price: item.price + (Math.random() * 4 - 2), // Add some price variation
          dietary_info: Math.random() > 0.7 ? ['vegetarian'] : [],
          spice_level: restaurantType === 'indian' || restaurantType === 'mexican' ? 
            Math.floor(Math.random() * 4) + 1 : null
        }))
    })),
    cuisine_type: typeData.cuisines[Math.floor(Math.random() * typeData.cuisines.length)],
    price_range: '$' + '$'.repeat(Math.floor(Math.random() * 3) + 1),
    contact: {
      phone: generatePhone(),
      website: generateWebsite(restaurantName)
    }
  }
  
  return menuData
}

async function createSampleUser() {
  const user = await prisma.user.upsert({
    where: { email: 'seed@menucard.com' },
    update: {},
    create: {
      email: 'seed@menucard.com',
      name: 'Seed Data User',
      role: 'RESTAURANT_OWNER',
    },
  })
  return user
}

async function seedRestaurants() {
  console.log('🌱 Starting restaurant seeding process...\n')
  
  // Create a user for all seeded restaurants
  const seedUser = await createSampleUser()
  console.log('✅ Created seed user')
  
  const restaurantTypes = Object.keys(RESTAURANT_TYPES)
  const restaurants = []
  const menus = []
  
  // Generate 60 restaurants (10 of each type)
  for (const type of restaurantTypes) {
    const names = RESTAURANT_NAMES[type]
    
    for (let i = 0; i < 10; i++) {
      const restaurantName = names[i] || `${names[i % names.length]} ${Math.floor(i / names.length) + 1}`
      const slug = generateSlug(restaurantName) + '-' + Math.random().toString(36).substr(2, 5)
      
      const restaurant = {
        userId: seedUser.id,
        name: restaurantName,
        slug: slug,
        description: `Authentic ${type} cuisine with fresh ingredients and traditional recipes. Come experience the flavors of ${restaurantName}!`,
        address: generateAddress(),
        phone: generatePhone(),
        website: generateWebsite(restaurantName)
      }
      
      restaurants.push(restaurant)
      
      // Create menu data for this restaurant
      const menuData = createMenuData(type, restaurantName)
      const menu = {
        userId: seedUser.id,
        restaurantName: restaurantName,
        imageUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=800&h=600&fit=crop&crop=food`,
        extractedData: menuData
      }
      
      menus.push(menu)
    }
  }
  
  console.log(`📊 Generated ${restaurants.length} restaurants and ${menus.length} menus`)
  console.log('💾 Inserting into database...\n')
  
  // Insert restaurants in batches
  const batchSize = 10
  for (let i = 0; i < restaurants.length; i += batchSize) {
    const batch = restaurants.slice(i, i + batchSize)
    
    for (const restaurant of batch) {
      try {
        await prisma.restaurant.create({
          data: restaurant
        })
        console.log(`✅ Created restaurant: ${restaurant.name}`)
      } catch (error) {
        console.log(`❌ Failed to create restaurant: ${restaurant.name} - ${error.message}`)
      }
    }
  }
  
  // Insert menus in batches
  for (let i = 0; i < menus.length; i += batchSize) {
    const batch = menus.slice(i, i + batchSize)
    
    for (const menu of batch) {
      try {
        await prisma.menu.create({
          data: menu
        })
        console.log(`✅ Created menu for: ${menu.restaurantName}`)
      } catch (error) {
        console.log(`❌ Failed to create menu for: ${menu.restaurantName} - ${error.message}`)
      }
    }
  }
  
  console.log('\n🎉 Seeding completed successfully!')
  console.log(`📈 Database now contains:`)
  
  const restaurantCount = await prisma.restaurant.count()
  const menuCount = await prisma.menu.count()
  
  console.log(`   • ${restaurantCount} restaurants`)
  console.log(`   • ${menuCount} menus`)
  
  console.log('\n🌐 Sample restaurant URLs:')
  const sampleRestaurants = await prisma.restaurant.findMany({
    take: 5,
    select: { name: true, slug: true }
  })
  
  sampleRestaurants.forEach(restaurant => {
    console.log(`   • ${restaurant.name}: http://localhost:3000/menu/${restaurant.slug}`)
  })
}

async function main() {
  try {
    await seedRestaurants()
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal error:', e)
    process.exit(1)
  })
