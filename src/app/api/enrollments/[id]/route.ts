import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/enrollments/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const enrollmentId = params.id;
    
    // Fetch the enrollment with related data
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            title: true,
            description: true,
            startDate: true,
            endDate: true,
            location: true,
            price: true,
            instructor: true,
            instructorProfile: {
              select: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // If user is a parent, verify they are connected to the student
    if (session.user.role === 'PARENT') {
      const parentChildRelationship = await (prisma as any).parentChild.findFirst({
        where: {
          parentId: session.user.id,
          childId: enrollment.userId,
          status: 'CONFIRMED',
        },
      });

      if (!parentChildRelationship) {
        return NextResponse.json(
          { error: 'You do not have permission to view this enrollment' },
          { status: 403 }
        );
      }
    } 
    // If user is a student, verify they own the enrollment
    else if (session.user.role === 'STUDENT' && session.user.id !== enrollment.userId) {
      return NextResponse.json(
        { error: 'You do not have permission to view this enrollment' },
        { status: 403 }
      );
    }
    // If user is not an admin, parent of the student, or the student themselves
    else if (
      session.user.role !== 'ADMIN' && 
      session.user.role !== 'T1_ADMIN' && 
      session.user.role !== 'T2_ADMIN' && 
      session.user.role !== 'PARENT' && 
      session.user.id !== enrollment.userId
    ) {
      return NextResponse.json(
        { error: 'You do not have permission to view this enrollment' },
        { status: 403 }
      );
    }

    return NextResponse.json({ enrollment });
  } catch (error) {
    console.error('Error fetching enrollment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrollment' },
      { status: 500 }
    );
  }
}

// PATCH /api/enrollments/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const enrollmentId = params.id;
    const { status } = await request.json();
    
    // Fetch the enrollment to check permissions
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      select: {
        id: true,
        userId: true,
        classId: true,
        status: true,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Check permissions based on role
    if (session.user.role === 'PARENT') {
      // Verify parent is connected to the student
      const parentChildRelationship = await (prisma as any).parentChild.findFirst({
        where: {
          parentId: session.user.id,
          childId: enrollment.userId,
          status: 'CONFIRMED',
        },
      });

      if (!parentChildRelationship) {
        return NextResponse.json(
          { error: 'You do not have permission to update this enrollment' },
          { status: 403 }
        );
      }
    } 
    // If user is a student, verify they own the enrollment
    else if (session.user.role === 'STUDENT' && session.user.id !== enrollment.userId) {
      return NextResponse.json(
        { error: 'You do not have permission to update this enrollment' },
        { status: 403 }
      );
    }
    // If user is not an admin, parent of the student, or the student themselves
    else if (
      session.user.role !== 'ADMIN' && 
      session.user.role !== 'T1_ADMIN' && 
      session.user.role !== 'T2_ADMIN' && 
      session.user.role !== 'PARENT' && 
      session.user.id !== enrollment.userId
    ) {
      return NextResponse.json(
        { error: 'You do not have permission to update this enrollment' },
        { status: 403 }
      );
    }

    // Update the enrollment status
    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status },
    });

    // Create a notification for the student if a parent cancelled the enrollment
    if (status === 'CANCELLED' && session.user.role === 'PARENT') {
      await (prisma as any).notification.create({
        data: {
          userId: enrollment.userId,
          type: 'ENROLLMENT_CANCELLED',
          content: `Your enrollment in a class has been cancelled by your parent.`,
          read: false,
          senderId: session.user.id,
        },
      });
    }

    return NextResponse.json({ enrollment: updatedEnrollment });
  } catch (error) {
    console.error('Error updating enrollment:', error);
    return NextResponse.json(
      { error: 'Failed to update enrollment' },
      { status: 500 }
    );
  }
}
