import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the user is an instructor
    if (session.user.role !== 'INSTRUCTOR') {
      return NextResponse.json(
        { error: 'Access denied. Instructor role required.' },
        { status: 403 }
      );
    }

    // Get the instructor ID from the session
    const instructorId = session.user.id;

    // Fetch classes taught by this instructor
    const classes = await prisma.class.findMany({
      where: {
        // Using the instructor field from the Class model
        instructor: instructorId,
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    // For each class, count enrollments separately
    const classesWithEnrollments = await Promise.all(classes.map(async (cls) => {
      const enrollmentCount = await prisma.enrollment.count({
        where: {
          classId: cls.id,
        },
      });
      
      return {
        ...cls,
        enrollmentCount,
      };
    }));

    // Transform the data to include enrollment count
    const transformedClasses = classesWithEnrollments.map(cls => ({
      id: cls.id,
      title: cls.title,
      description: cls.description || '',
      startDate: cls.startDate,
      endDate: cls.endDate,
      location: cls.location || 'TBD',
      capacity: cls.capacity || 0,
      enrollmentCount: cls.enrollmentCount || 0,
    }));

    return NextResponse.json({ 
      classes: transformedClasses,
      success: true 
    });
  } catch (error) {
    console.error('Error fetching instructor classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}
