import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the user is an instructor or admin
    if (!['INSTRUCTOR', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Access denied. Instructor or admin role required.' },
        { status: 403 }
      );
    }

    const classId = params.id;

    // For instructors, verify they are teaching this class
    if (session.user.role === 'INSTRUCTOR') {
      const classRecord = await prisma.class.findUnique({
        where: {
          id: classId,
        },
        select: {
          instructor: true,
        },
      });

      if (!classRecord || classRecord.instructor !== session.user.id) {
        return NextResponse.json(
          { error: 'Access denied. You are not the instructor for this class.' },
          { status: 403 }
        );
      }
    }

    // Fetch enrolled students
    const enrollments = await prisma.enrollment.findMany({
      where: {
        classId: classId,
        status: 'ACTIVE', // Only get active enrollments
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Transform the data to include only necessary student information
    const students = enrollments.map(enrollment => ({
      id: enrollment.user.id,
      name: enrollment.user.name,
      email: enrollment.user.email,
    }));

    return NextResponse.json({ 
      students,
      success: true 
    });
  } catch (error) {
    console.error('Error fetching enrolled students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrolled students' },
      { status: 500 }
    );
  }
}
