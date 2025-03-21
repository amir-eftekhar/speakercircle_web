import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the user is an admin
    if (!['ADMIN', 'T1_ADMIN', 'T2_ADMIN', 'T3_MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Access denied. Admin role required.' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const includeInstructors = searchParams.get('include') === 'instructors';
    const includeEnrollments = searchParams.get('include') === 'enrollments' || searchParams.get('include') === 'all';
    const includeStudents = searchParams.get('include') === 'students' || searchParams.get('include') === 'all';
    
    // Build the query with dynamic includes
    const query: any = {
      orderBy: {
        startDate: 'desc',
      },
      include: {
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    };

    // Include instructor information if requested
    if (includeInstructors) {
      query.include.instructorProfile = {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      };
    }

    // Include enrollment information if requested
    if (includeEnrollments || includeStudents) {
      query.include.enrollments = {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          payment: true,
        },
      };
    }

    // Fetch classes with the constructed query
    const classes = await prisma.class.findMany(query);

    // Transform the data if needed
    const transformedClasses = classes.map((cls: any) => {
      const result: any = {
        ...cls,
        enrollmentCount: cls._count?.enrollments || 0,
      };

      // If we included students, organize them by role
      if (includeStudents && cls.enrollments) {
        const students = cls.enrollments
          .filter((enrollment: any) => enrollment.user.role === 'STUDENT')
          .map((enrollment: any) => ({
            id: enrollment.user.id,
            name: enrollment.user.name,
            email: enrollment.user.email,
            enrollmentId: enrollment.id,
            status: enrollment.status,
            paymentStatus: enrollment.payment?.status || 'NONE',
          }));

        result.students = students;
      }

      return result;
    });

    return NextResponse.json({ 
      classes: transformedClasses,
      success: true 
    });
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}
