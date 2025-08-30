import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Explicitly load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Attempting to connect to the database...');
    await prisma.$connect();
    console.log('✅ Database connection successful!');

    // Optional: run a simple query to ensure the connection is working
    console.log('Running a simple query...');
    const restaurantCount = await prisma.restaurant.count();
    console.log(`Found ${restaurantCount} restaurants in the database.`);

  } catch (error) {
    console.error('❌ Failed to connect to the database.');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('Database connection closed.');
  }
}

main();
