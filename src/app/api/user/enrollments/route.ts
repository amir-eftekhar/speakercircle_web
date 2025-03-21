import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's enrollments with class details and payment status
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        class: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            startDate: true,
            location: true,
          },
        },
        payment: {
          select: {
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    type EnrollmentWithPayment = typeof enrollments[0] & {
      payment?: { status: string } | null;
    };

    // Map enrollments to include payment status
    const formattedEnrollments = enrollments.map((enrollment: EnrollmentWithPayment) => ({
      ...enrollment,
      status: enrollment.payment?.status || 'PENDING',
    }));

    return NextResponse.json({ enrollments: formattedEnrollments });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json(
      { message: 'Failed to fetch enrollments' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  // Logic for handling POST request
}