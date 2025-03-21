import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { enrollmentId } = await req.json();

    if (!enrollmentId) {
      return NextResponse.json({ message: 'Enrollment ID is required' }, { status: 400 });
    }

    // Check if enrollment exists and belongs to the user
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        id: enrollmentId,
        userId: session.user.id
      }
    });

    if (!enrollment) {
      return NextResponse.json({ message: 'Enrollment not found' }, { status: 404 });
    }

    // Check if there's a payment associated with this enrollment
    const payment = await prisma.payment.findFirst({
      where: {
        enrollmentId: enrollmentId
      }
    });

    // Delete payment if it exists
    if (payment) {
      await prisma.payment.delete({
        where: {
          id: payment.id
        }
      });
    }

    // Delete the enrollment
    await prisma.enrollment.delete({
      where: {
        id: enrollmentId
      }
    });

    return NextResponse.json({ message: 'Successfully left the class' });
  } catch (error) {
    console.error('Error leaving class:', error);
    return NextResponse.json(
      { message: 'Failed to leave class' },
      { status: 500 }
    );
  }
}
