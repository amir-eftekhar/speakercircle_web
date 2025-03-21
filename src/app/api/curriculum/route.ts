import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { permissions } from '@/lib/permissions';

const prisma = new PrismaClient();

// GET /api/curriculum - Get all curriculum items
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userRole = session.user.role;
    
    // Check if user has permission to read curriculum
    if (!permissions.curriculum.read.includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Get all published curriculum items
    // If user is a mentor or admin, also include unpublished items
    const curriculumItems = await prisma.curriculumItem.findMany({
      where: {
        ...((!permissions.curriculum.update.includes(userRole)) && { isPublished: true })
      },
      include: {
        mentor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    });
    
    return NextResponse.json(curriculumItems);
  } catch (error) {
    console.error('Error fetching curriculum items:', error);
    return NextResponse.json({ error: 'Failed to fetch curriculum items' }, { status: 500 });
  }
}

// POST /api/curriculum - Create a new curriculum item
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userRole = session.user.role;
    
    // Check if user has permission to create curriculum
    if (!permissions.curriculum.create.includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const data = await req.json();
    const { title, description, content, type, order, mentorId } = data;
    
    // Validate required fields
    if (!title || !description || !content || !type || !mentorId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // If user is a mentor, they can only create curriculum items for their own profile
    if (userRole === 'MENTOR') {
      const mentorProfile = await prisma.mentorProfile.findFirst({
        where: {
          userId: session.user.id
        }
      });
      
      if (!mentorProfile || mentorProfile.id !== mentorId) {
        return NextResponse.json({ error: 'You can only create curriculum items for your own profile' }, { status: 403 });
      }
    }
    
    // Create the curriculum item
    const newItem = await prisma.curriculumItem.create({
      data: {
        title,
        description,
        content,
        type,
        order: order || 0,
        mentorId
      }
    });
    
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Error creating curriculum item:', error);
    return NextResponse.json({ error: 'Failed to create curriculum item' }, { status: 500 });
  }
}
