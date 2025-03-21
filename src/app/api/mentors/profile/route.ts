import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Initialize Prisma Client
const prisma = new PrismaClient();

// GET /api/mentors/profile - Get the current user's mentor profile
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is a mentor
    if (session.user.role !== 'MENTOR') {
      return NextResponse.json({ error: 'Only mentors can access this endpoint' }, { status: 403 });
    }
    
    // Get mentor profile
    const mentorProfile = await prisma.mentorProfile.findFirst({
      where: {
        userId: session.user.id
      }
    });
    
    if (!mentorProfile) {
      return NextResponse.json({ error: 'Mentor profile not found' }, { status: 404 });
    }
    
    return NextResponse.json(mentorProfile);
  } catch (error) {
    console.error('Error fetching mentor profile:', error);
    return NextResponse.json({ error: 'Failed to fetch mentor profile' }, { status: 500 });
  }
}

// PUT /api/mentors/profile - Update the current user's mentor profile
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is a mentor
    if (session.user.role !== 'MENTOR') {
      return NextResponse.json({ error: 'Only mentors can access this endpoint' }, { status: 403 });
    }
    
    const data = await req.json();
    const { bio, specialization, experience, education, certifications, availability, hourlyRate } = data;
    
    // Validate required fields
    if (!bio || !specialization || !experience) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Get mentor profile
    const existingProfile = await prisma.mentorProfile.findFirst({
      where: {
        userId: session.user.id
      }
    });
    
    if (!existingProfile) {
      // Create new profile if it doesn't exist
      const newProfile = await prisma.mentorProfile.create({
        data: {
          bio,
          specialization,
          experience: typeof experience === 'string' ? parseInt(experience) : experience,
          education,
          certifications,
          availability,
          hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
          userId: session.user.id
        }
      });
      
      return NextResponse.json(newProfile);
    } else {
      // Update existing profile
      const updatedProfile = await prisma.mentorProfile.update({
        where: {
          id: existingProfile.id
        },
        data: {
          bio,
          specialization,
          experience: typeof experience === 'string' ? parseInt(experience) : experience,
          education,
          certifications,
          availability,
          hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null
        }
      });
      
      return NextResponse.json(updatedProfile);
    }
  } catch (error) {
    console.error('Error updating mentor profile:', error);
    return NextResponse.json({ error: 'Failed to update mentor profile' }, { status: 500 });
  }
}
