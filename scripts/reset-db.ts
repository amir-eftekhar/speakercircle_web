import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('Resetting database...');
  
  try {
    // Delete all records from all tables
    // Order matters due to foreign key constraints
    console.log('Deleting records from all tables...');
    
    // Delete assignment submissions
    await prisma.assignmentSubmission.deleteMany();
    console.log('✓ Assignment submissions deleted');
    
    // Delete class announcements
    await prisma.classAnnouncement.deleteMany();
    console.log('✓ Class announcements deleted');
    
    // Delete class curriculum items
    await prisma.classCurriculumItem.deleteMany();
    console.log('✓ Class curriculum items deleted');
    
    // Delete class messages
    await prisma.classMessage.deleteMany();
    console.log('✓ Class messages deleted');
    
    // Delete notifications
    await prisma.notification.deleteMany();
    console.log('✓ Notifications deleted');
    
    // Delete parent-child relationships
    await prisma.parentChild.deleteMany();
    console.log('✓ Parent-child relationships deleted');
    
    // Delete payments
    await prisma.payment.deleteMany();
    console.log('✓ Payments deleted');
    
    // Delete event registrations
    await prisma.eventRegistration.deleteMany();
    console.log('✓ Event registrations deleted');
    
    // Delete events
    await prisma.event.deleteMany();
    console.log('✓ Events deleted');
    
    // Delete curriculum items
    await prisma.curriculumItem.deleteMany();
    console.log('✓ Curriculum items deleted');
    
    // Delete enrollments
    await prisma.enrollment.deleteMany();
    console.log('✓ Enrollments deleted');
    
    // Delete classes
    await prisma.class.deleteMany();
    console.log('✓ Classes deleted');
    
    // Delete mentor profiles
    await prisma.mentorProfile.deleteMany();
    console.log('✓ Mentor profiles deleted');
    
    // Delete social media
    await prisma.socialMedia.deleteMany();
    console.log('✓ Social media deleted');
    
    // Delete stripe products
    await prisma.stripeProduct.deleteMany();
    console.log('✓ Stripe products deleted');
    
    // Delete testimonials
    await prisma.testimonial.deleteMany();
    console.log('✓ Testimonials deleted');
    
    // Delete newsletters
    await prisma.newsletter.deleteMany();
    console.log('✓ Newsletters deleted');
    
    // Delete announcements
    await prisma.announcement.deleteMany();
    console.log('✓ Announcements deleted');
    
    // Delete all users except admin
    await prisma.user.deleteMany({
      where: {
        role: {
          not: 'T1_ADMIN'
        }
      }
    });
    console.log('✓ Non-admin users deleted');
    
    console.log('Database reset complete!');
    console.log('Run `npm run seed` to seed the database with initial data.');
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
