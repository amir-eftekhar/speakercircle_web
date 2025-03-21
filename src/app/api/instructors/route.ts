import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/instructors - Get all instructors
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get users with INSTRUCTOR or MENTOR role
    const instructors = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'INSTRUCTOR' },
          { role: 'MENTOR' }
        ]
      },
      include: {
        mentorProfile: true
      } as any, // Type cast to avoid TypeScript error
      orderBy: {
        name: 'asc'
      }
    });
    
    return NextResponse.json(instructors);
  } catch (error) {
    console.error('Error fetching instructors:', error);
    return NextResponse.json({ error: 'Failed to fetch instructors' }, { status: 500 });
  }
}
