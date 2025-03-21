import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

/*
 * Stripe initialization is commented out for development
 * Uncomment and add STRIPE_SECRET_KEY to environment variables when ready for production
 */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key', {
  apiVersion: '2025-02-24.acacia', // Updated to latest version
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be logged in to checkout' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { 
      classId,
      eventId,
      priceId, // Use the Stripe price ID directly if available
      successUrl,
      cancelUrl
    } = body;
    
    // Determine if this is a class or event checkout
    let stripePriceId = priceId;
    let enrollmentId;
    let eventRegistrationId;
    
    // For class enrollment
    if (classId) {
      // Get class details
      const classItem = await prisma.class.findUnique({
        where: { id: classId }
      });
      
      if (!classItem) {
        return NextResponse.json(
          { error: 'Class not found' },
          { status: 404 }
        );
      }
      
      // Use the class's Stripe price ID
      stripePriceId = classItem.stripePriceId;
      
      // Create an enrollment record
      const enrollment = await prisma.enrollment.create({
        data: {
          userId: session.user.id,
          classId: classId,
          status: 'PENDING'
        }
      });
      
      enrollmentId = enrollment.id;
    }
    
    // For event registration
    if (eventId) {
      // Get event details
      const event = await prisma.event.findUnique({
        where: { id: eventId }
      });
      
      if (!event) {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        );
      }
      
      // Use the event's Stripe price ID
      stripePriceId = event.stripePriceId;
      
      // Create an event registration record
      const registration = await prisma.eventRegistration.create({
        data: {
          userId: session.user.id,
          eventId: eventId,
          status: 'PENDING'
        }
      });
      
      eventRegistrationId = registration.id;
    }
    
    if (!stripePriceId) {
      return NextResponse.json(
        { error: 'No valid price ID found for checkout' },
        { status: 400 }
      );
    }
    
    // Get user email for the checkout
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true }
    });
    
    // Create a Stripe checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const formattedSuccessUrl = successUrl || `${baseUrl}/dashboard`;
    const formattedCancelUrl = cancelUrl || `${baseUrl}/`;
    
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: formattedSuccessUrl,
      cancel_url: formattedCancelUrl,
      customer_email: user?.email,
      metadata: {
        userId: session.user.id,
        ...(enrollmentId ? { enrollmentId } : {}),
        ...(eventRegistrationId ? { eventRegistrationId } : {}),
      },
    });
    
    // Create a payment record
    await prisma.payment.create({
      data: {
        userId: session.user.id,
        enrollmentId,
        eventRegistrationId,
        amount: 0, // Will be updated after payment is completed
        status: 'PENDING',
        type: classId ? 'CLASS' : 'EVENT',
        stripeSessionId: checkoutSession.id
      }
    });
    
    return NextResponse.json({ 
      url: checkoutSession.url,
      sessionId: checkoutSession.id
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
