import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canAccessAdminPanel } from '@/lib/permissions';

const prisma = new PrismaClient();

// GET /api/mentors - Get all mentors
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get mentors with their profiles
    const mentors = await prisma.user.findMany({
      where: {
        role: 'MENTOR'
      },
      include: {
        mentorProfile: true
      }
    });
    
    return NextResponse.json(mentors);
  } catch (error) {
    console.error('Error fetching mentors:', error);
    return NextResponse.json({ error: 'Failed to fetch mentors' }, { status: 500 });
  }
}

// POST /api/mentors - Create a new mentor
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !canAccessAdminPanel(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await req.json();
    const { name, email, password, bio, specialization, experience, education, certifications } = data;
    
    // Validate required fields
    if (!name || !email || !password || !bio || !specialization || !experience) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }
    
    // Create user with MENTOR role and mentor profile
    const newMentor = await prisma.user.create({
      data: {
        name,
        email,
        password, // Note: In production, this should be hashed
        role: 'MENTOR',
        mentorProfile: {
          create: {
            bio,
            specialization,
            experience,
            education,
            certifications
          }
        }
      },
      include: {
        mentorProfile: true
      }
    });
    
    return NextResponse.json(newMentor, { status: 201 });
  } catch (error) {
    console.error('Error creating mentor:', error);
    return NextResponse.json({ error: 'Failed to create mentor' }, { status: 500 });
  }
}
