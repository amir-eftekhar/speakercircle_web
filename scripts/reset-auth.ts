const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting authentication reset...');
    
    // 1. Delete the database file to start fresh
    const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
    if (fs.existsSync(dbPath)) {
      console.log('Removing existing database file...');
      fs.unlinkSync(dbPath);
      console.log('Database file removed.');
    }
    
    // 2. Push the schema to create a new database
    console.log('Creating new database...');
    await prisma.$executeRawUnsafe('CREATE TABLE IF NOT EXISTS "User" ("id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "email" TEXT NOT NULL, "password" TEXT NOT NULL, "role" TEXT NOT NULL DEFAULT \'GUEST\', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL)');
    console.log('Basic User table created.');
    
    // 3. Create a simple admin user with a known password
    console.log('Creating admin user...');
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const admin = await prisma.user.create({
      data: {
        id: 'admin-user-id',
        email: 'admin@example.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'T1_ADMIN',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    console.log('Admin user created successfully:');
    console.log({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      passwordHash: admin.password.substring(0, 10) + '...'
    });
    
    console.log('\nYou can now log in with:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error during reset:', error);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  }); 