import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create sample user
  const sampleUser = await prisma.user.upsert({
    where: { email: 'demo@menucard.com' },
    update: {},
    create: {
      email: 'demo@menucard.com',
      name: 'Demo Restaurant Owner',
      role: UserRole.RESTAURANT_OWNER,
    },
  })

  console.log('✅ Created sample user')

  // Create sample restaurant
  const sampleRestaurant = await prisma.restaurant.upsert({
    where: { slug: 'demo-pizza-palace' },
    update: {},
    create: {
      name: 'Demo Pizza Palace',
      slug: 'demo-pizza-palace',
      description: 'Authentic Italian pizzas made with love and fresh ingredients',
      address: '123 Main Street, Food City, FC 12345',
      phone: '+1 (555) 123-4567',
      website: 'https://demopizza.com',
      userId: sampleUser.id,
    },
  })

  console.log('✅ Created sample restaurant')

  // Create sample menu
  const sampleMenu = await prisma.menu.upsert({
    where: { restaurantId: sampleRestaurant.id },
    update: {},
    create: {
      restaurantId: sampleRestaurant.id,
      userId: sampleUser.id,
      restaurantName: sampleRestaurant.name,
      imageUrl: 'https://placeholder.vn/placeholder/800x600?text=Demo+Menu',
      extractedData: {
        restaurant_name: 'Demo Pizza Palace',
        categories: [
          {
            name: 'Pizzas',
            items: [
              {
                name: 'Margherita Pizza',
                description: 'Fresh mozzarella, tomato sauce, basil',
                price: '$16.99',
                dietary_info: ['vegetarian']
              },
              {
                name: 'Pepperoni Pizza',
                description: 'Pepperoni, mozzarella, tomato sauce',
                price: '$18.99'
              }
            ]
          },
          {
            name: 'Appetizers',
            items: [
              {
                name: 'Garlic Bread',
                description: 'Fresh baked bread with garlic and herbs',
                price: '$6.99',
                dietary_info: ['vegetarian']
              }
            ]
          }
        ]
      },
    },
  })

  console.log('✅ Created sample menu')

  console.log('🎉 Database seeded successfully!')
  console.log('\n📋 Sample data created:')
  console.log(`- Restaurant: ${sampleRestaurant.name} (${sampleRestaurant.slug})`)
  console.log(`- Menu: Demo menu with pizzas and appetizers`)
  console.log('\n🌐 You can view the demo restaurant at:')
  console.log(`http://localhost:3000/menu/${sampleRestaurant.slug}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error during seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
