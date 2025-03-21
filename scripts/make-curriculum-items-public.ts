import { PrismaClient } from '@prisma/client';

type CurriculumItem = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  type: string;
  fileUrl: string | null;
  fileType: string | null;
  order: number;
  dueDate: Date | null;
  isPublished: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  classId: string;
};

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to update curriculum items...');
  
  // Get all curriculum items
  // Using 'as any' to work around TypeScript errors with the Prisma client
  const curriculumItems = await (prisma as any).classCurriculumItem.findMany();
  console.log(`Found ${curriculumItems.length} curriculum items`);
  
  // Make all published items also public (for demo purposes)
  // In a real application, you would want more granular control
  const updates = await Promise.all(
    curriculumItems.map(async (item: CurriculumItem) => {
      if (item.isPublished) {
        return (prisma as any).classCurriculumItem.update({
          where: { id: item.id },
          data: { isPublic: true },
        });
      }
      return null;
    })
  );
  
  const updatedCount = updates.filter(Boolean).length;
  console.log(`Updated ${updatedCount} curriculum items to be public`);
  
  console.log('Done!');
}

main()
  .catch((e) => {
    console.error('Error updating curriculum items:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
