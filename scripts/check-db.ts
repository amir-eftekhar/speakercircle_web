const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  try {
    // Test database connection
    console.log('Testing database connection...');
    const userCount = await prisma.user.count();
    console.log(`Database connection successful. Found ${userCount} users.`);
    
    // Check for test admin user
    const testAdmin = await prisma.user.findUnique({
      where: { email: 'test@admin.com' }
    });
    
    if (testAdmin) {
      console.log('Found test admin user:', {
        id: testAdmin.id,
        email: testAdmin.email,
        name: testAdmin.name,
        role: testAdmin.role
      });
      
      // Test password verification
      const testPassword = 'password123';
      const passwordValid = await bcrypt.compare(testPassword, testAdmin.password);
      console.log('Password verification result:', passwordValid);
      
      if (!passwordValid) {
        console.log('Password verification failed. Creating new password hash...');
        const newHash = await bcrypt.hash(testPassword, 10);
        
        // Update the user with the new password hash
        await prisma.user.update({
          where: { id: testAdmin.id },
          data: { password: newHash }
        });
        
        console.log('Updated user password hash.');
      }
    } else {
      console.log('Test admin user not found. Creating one...');
      
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const newAdmin = await prisma.user.create({
        data: {
          email: 'test@admin.com',
          name: 'Test Admin',
          password: hashedPassword,
          role: 'T1_ADMIN'
        }
      });
      
      console.log('Created new test admin user:', {
        id: newAdmin.id,
        email: newAdmin.email,
        name: newAdmin.name,
        role: newAdmin.role
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  }); 