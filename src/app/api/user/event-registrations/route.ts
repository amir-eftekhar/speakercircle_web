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

    // Get user's event registrations with event details and payment status
    const registrations = await prisma.eventRegistration.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            date: true,
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

    type RegistrationWithPayment = typeof registrations[0] & {
      payment?: { status: string } | null;
    };

    // Map registrations to include payment status
    const formattedRegistrations = registrations.map((registration: RegistrationWithPayment) => ({
      ...registration,
      status: registration.payment?.status || 'PENDING',
    }));

    return NextResponse.json({ registrations: formattedRegistrations });
  } catch (error) {
    console.error('Error fetching event registrations:', error);
    return NextResponse.json(
      { message: 'Failed to fetch event registrations' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  // Logic for handling POST request
}