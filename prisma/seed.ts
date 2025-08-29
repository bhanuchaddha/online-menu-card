import { PrismaClient, UserRole, ItemStatus } from '@prisma/client'

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
      email: 'info@demopizza.com',
      website: 'https://demopizza.com',
      hours: {
        monday: { open: '11:00', close: '22:00' },
        tuesday: { open: '11:00', close: '22:00' },
        wednesday: { open: '11:00', close: '22:00' },
        thursday: { open: '11:00', close: '22:00' },
        friday: { open: '11:00', close: '23:00' },
        saturday: { open: '11:00', close: '23:00' },
        sunday: { open: '12:00', close: '21:00' }
      },
      socialMedia: {
        instagram: '@demopizza',
        facebook: 'demopizza',
        twitter: '@demopizza'
      },
      theme: 'modern',
      isActive: true,
      isPublic: true,
      ownerId: sampleUser.id,
    },
  })

  console.log('✅ Created sample restaurant')

  // Create sample menu
  const sampleMenu = await prisma.menu.upsert({
    where: { id: 'demo-main-menu' },
    update: {},
    create: {
      id: 'demo-main-menu',
      name: 'Main Menu',
      description: 'Our delicious selection of pizzas, appetizers, and more',
      restaurantId: sampleRestaurant.id,
      isActive: true,
      displayOrder: 1,
    },
  })

  console.log('✅ Created sample menu')

  // Create sample categories
  const appetizers = await prisma.menuCategory.upsert({
    where: { id: 'demo-appetizers' },
    update: {},
    create: {
      id: 'demo-appetizers',
      name: 'Appetizers',
      description: 'Start your meal with our delicious appetizers',
      menuId: sampleMenu.id,
      displayOrder: 1,
      isActive: true,
    },
  })

  const pizzas = await prisma.menuCategory.upsert({
    where: { id: 'demo-pizzas' },
    update: {},
    create: {
      id: 'demo-pizzas',
      name: 'Pizzas',
      description: 'Our signature hand-tossed pizzas',
      menuId: sampleMenu.id,
      displayOrder: 2,
      isActive: true,
    },
  })

  const desserts = await prisma.menuCategory.upsert({
    where: { id: 'demo-desserts' },
    update: {},
    create: {
      id: 'demo-desserts',
      name: 'Desserts',
      description: 'Sweet treats to end your meal',
      menuId: sampleMenu.id,
      displayOrder: 3,
      isActive: true,
    },
  })

  console.log('✅ Created sample categories')

  // Create sample menu items
  const sampleItems = [
    // Appetizers
    {
      id: 'demo-garlic-bread',
      name: 'Garlic Bread',
      description: 'Fresh baked bread with garlic butter and herbs',
      price: 8.99,
      categoryId: appetizers.id,
      isVegetarian: true,
      displayOrder: 1,
      status: ItemStatus.AVAILABLE,
    },
    {
      id: 'demo-caesar-salad',
      name: 'Caesar Salad',
      description: 'Crisp romaine lettuce with parmesan and croutons',
      price: 12.99,
      categoryId: appetizers.id,
      isVegetarian: true,
      displayOrder: 2,
      status: ItemStatus.AVAILABLE,
    },
    // Pizzas
    {
      id: 'demo-margherita',
      name: 'Margherita Pizza',
      description: 'Fresh tomatoes, mozzarella, and basil on our signature crust',
      price: 18.99,
      categoryId: pizzas.id,
      isVegetarian: true,
      displayOrder: 1,
      status: ItemStatus.AVAILABLE,
    },
    {
      id: 'demo-pepperoni',
      name: 'Pepperoni Pizza',
      description: 'Classic pepperoni with mozzarella cheese',
      price: 21.99,
      categoryId: pizzas.id,
      displayOrder: 2,
      status: ItemStatus.AVAILABLE,
    },
    {
      id: 'demo-supreme',
      name: 'Supreme Pizza',
      description: 'Pepperoni, sausage, peppers, onions, and mushrooms',
      price: 25.99,
      categoryId: pizzas.id,
      displayOrder: 3,
      status: ItemStatus.AVAILABLE,
    },
    // Desserts
    {
      id: 'demo-tiramisu',
      name: 'Tiramisu',
      description: 'Classic Italian dessert with coffee and mascarpone',
      price: 9.99,
      categoryId: desserts.id,
      isVegetarian: true,
      displayOrder: 1,
      status: ItemStatus.AVAILABLE,
    },
    {
      id: 'demo-gelato',
      name: 'Gelato',
      description: 'Italian ice cream - vanilla, chocolate, or strawberry',
      price: 6.99,
      categoryId: desserts.id,
      isVegetarian: true,
      displayOrder: 2,
      status: ItemStatus.AVAILABLE,
    },
  ]

  for (const item of sampleItems) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    })
  }

  console.log('✅ Created sample menu items')

  console.log('🎉 Database seed completed successfully!')
  console.log('\n📋 Sample data created:')
  console.log(`- Restaurant: ${sampleRestaurant.name} (${sampleRestaurant.slug})`)
  console.log(`- Menu: ${sampleMenu.name}`)
  console.log(`- Categories: ${[appetizers.name, pizzas.name, desserts.name].join(', ')}`)
  console.log(`- Menu Items: ${sampleItems.length} items`)
  console.log('\n🌐 You can view the demo restaurant at:')
  console.log(`http://localhost:3000/r/${sampleRestaurant.slug}`)
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
