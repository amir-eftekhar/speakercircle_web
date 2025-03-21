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

    const { registrationId } = await req.json();

    if (!registrationId) {
      return NextResponse.json({ message: 'Registration ID is required' }, { status: 400 });
    }

    // Check if registration exists and belongs to the user
    const registration = await prisma.eventRegistration.findUnique({
      where: {
        id: registrationId,
        userId: session.user.id
      }
    });

    if (!registration) {
      return NextResponse.json({ message: 'Registration not found' }, { status: 404 });
    }

    // Check if there's a payment associated with this registration
    const payment = await prisma.payment.findFirst({
      where: {
        eventRegistrationId: registrationId
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

    // Delete the registration
    await prisma.eventRegistration.delete({
      where: {
        id: registrationId
      }
    });

    return NextResponse.json({ message: 'Successfully left the event' });
  } catch (error) {
    console.error('Error leaving event:', error);
    return NextResponse.json(
      { message: 'Failed to leave event' },
      { status: 500 }
    );
  }
}
