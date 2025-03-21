import { PrismaClient } from '@prisma/client';
import * as bcryptjs from 'bcrypt';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Use a different variable name to avoid conflicts
const seedPrisma = new PrismaClient();

async function seedDatabase() {
  console.log('Seeding database...');
  
  // Get admin credentials from environment variables or use defaults
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminName = process.env.ADMIN_NAME || 'Admin User';
  const adminPassword = await bcryptjs.hash(process.env.ADMIN_PASSWORD || 'password123', 10);
  
  const admin = await seedPrisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: adminPassword,
      name: adminName,
    },
    create: {
      email: adminEmail,
      name: adminName,
      password: adminPassword,
      role: 'T1_ADMIN',
    },
  });
  
  console.log(`Admin user created/updated: ${admin.email}`);
}

seedDatabase()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await seedPrisma.$disconnect();
  }); 