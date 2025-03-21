import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe, isStripeConfigured } from '@/lib/stripe-server';

import { EventRegistration, Enrollment } from '@prisma/client';

type EventWithRegistrations = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  registrations: EventRegistration[];
};

type ClassWithEnrollments = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  enrollments: Enrollment[];
};

type Registration = EventRegistration | Enrollment;

type Item = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  type: 'event' | 'class';
};

export async function POST(req: Request) {
  try {
    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      console.log('Stripe is not configured. Using mock checkout flow.');
      return NextResponse.json({
        url: '/dashboard?demo=true',
        message: 'Demo mode: Stripe is not configured. Redirecting to dashboard.'
      });
    }
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to create a checkout session' },
        { status: 401 }
      );
    }

    const { eventId, classId } = await req.json();

    if (!eventId && !classId) {
      return NextResponse.json(
        { message: 'Event ID or Class ID is required' },
        { status: 400 }
      );
    }

    let itemType: 'event' | 'class';
    let item: Item | null = null;
    let existingRegistration: Registration | null = null;

    if (eventId) {
      itemType = 'event';
      // Find the event
      const event = await prisma.event.findUnique({
        where: { id: String(eventId) },
        include: {
          registrations: {
            where: { userId: session.user.id }
          }
        }
      }) as EventWithRegistrations | null;
      
      if (event) {
        item = {
          id: event.id,
          title: event.title,
          description: event.description,
          price: event.price || 99,
          type: 'event'
        };
        existingRegistration = event.registrations[0] || null;
      }
    } else if (classId) {
      itemType = 'class';
      // Find the class
      const classItem = await prisma.class.findUnique({
        where: { id: String(classId) },
        include: {
          enrollments: {
            where: { userId: session.user.id }
          }
        }
      }) as ClassWithEnrollments | null;
      
      if (classItem) {
        item = {
          id: classItem.id,
          title: classItem.title,
          description: classItem.description,
          price: classItem.price || 99,
          type: 'class'
        };
        existingRegistration = classItem.enrollments[0] || null;
      }
    } else {
      return NextResponse.json(
        { message: 'Either eventId or classId must be provided' },
        { status: 400 }
      );
    }

    if (!item) {
      return NextResponse.json(
        { message: `${itemType} not found` },
        { status: 404 }
      );
    }

    // Check if user is already registered
    if (existingRegistration && existingRegistration.status === 'CONFIRMED') {
      return NextResponse.json(
        { message: `You are already registered for this ${itemType}` },
        { status: 400 }
      );
    }
    
    // Check if user is already registered/enrolled
    if (existingRegistration) {
      if (existingRegistration.status === 'CONFIRMED') {
        return NextResponse.json(
          { message: `You are already ${itemType === 'event' ? 'registered for this event' : 'enrolled in this class'}` },
          { status: 400 }
        );
      }

      // If there's a pending registration/enrollment, use that instead of creating a new one
      if (existingRegistration && existingRegistration.status === 'PENDING') {
        const existingPayment = await prisma.payment.findFirst({
          where: {
            OR: [
              { eventRegistrationId: itemType === 'event' ? existingRegistration.id : undefined },
              { enrollmentId: itemType === 'class' ? existingRegistration.id : undefined }
            ]
          }
        });

        if (existingPayment) {
          if (!item) {
            throw new Error(`${itemType} not found`);
          }

          // Create checkout session for existing registration/enrollment
          const checkoutSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
              price_data: {
                currency: 'usd',
                product_data: {
                  name: item.title || `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} Registration`,
                  description: item.description || `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} Registration`,
                },
                unit_amount: Math.round(item.price * 100),
              },
              quantity: 1,
            }],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?${itemType}=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${itemType}s/${item.id}`,
            customer_email: session.user.email || undefined,
            metadata: {
              userId: session.user.id,
              ...(itemType === 'event' 
                ? { eventId: item.id, eventRegistrationId: existingRegistration.id }
                : { classId: item.id, enrollmentId: existingRegistration.id }),
              paymentId: existingPayment.id,
            },
          });

          // Update existing payment with new session ID
          await prisma.payment.update({
            where: { id: existingPayment.id },
            data: { stripeSessionId: checkoutSession.id }
          });

          // Return the Stripe checkout URL for redirection
          if (checkoutSession.url) {
            return NextResponse.json({ url: checkoutSession.url });
          } else {
            throw new Error('Failed to create Stripe checkout URL');
          }
        }
      }
    }

    let registration;
    let payment;

    try {
      if (!item) {
        throw new Error(`${itemType} not found`);
      }

      // Create new registration/enrollment
      if (itemType === 'event') {
        registration = await prisma.eventRegistration.create({
          data: {
            userId: session.user.id,
            eventId: item.id,
            status: 'PENDING'
          }
        });
      } else {
        registration = await prisma.enrollment.create({
          data: {
            userId: session.user.id,
            classId: item.id,
            status: 'PENDING'
          }
        });
      }

      // Create payment record
      payment = await prisma.payment.create({
        data: {
          userId: session.user.id,
          amount: item.price,
          status: 'PENDING',
          type: itemType.toUpperCase(),
          ...(itemType === 'event' ? {
            eventRegistrationId: registration.id,
            enrollmentId: null
          } : {
            eventRegistrationId: null,
            enrollmentId: registration.id
          })
        }
      });

      // Construct proper URLs for Stripe
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const successUrl = `${baseUrl}/dashboard?${itemType}=success`;
      const cancelUrl = `${baseUrl}/${itemType}s/${item.id}`;
      
      console.log('Using URLs for Stripe - success:', successUrl, 'cancel:', cancelUrl);
      
      // Create checkout session with guaranteed valid URLs
      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.title || `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} Registration`,
              description: item.description || `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} Registration`,
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: session.user.email || undefined,
        metadata: {
          userId: session.user.id,
          [`${itemType}Id`]: item.id,
          [`${itemType}RegistrationId`]: registration.id,
          paymentId: payment.id,
        },
      });

      // Update payment with Stripe session ID
      await prisma.payment.update({
        where: { id: payment.id },
        data: { stripeSessionId: checkoutSession.id }
      });

      // Return the Stripe checkout URL for redirection
      console.log('Stripe checkout URL:', checkoutSession.url);
      
      // Return the Stripe checkout URL as JSON for client-side redirect
      if (checkoutSession.url) {
        return NextResponse.json({ url: checkoutSession.url }, { status: 200 });
      } else {
        throw new Error('Failed to create Stripe checkout URL');
      }
    } catch (error: any) {
      console.error('Error:', error);
      
      // Clean up any created records if there's an error
      try {
        if (payment?.id) {
          await prisma.payment.delete({ where: { id: payment.id } });
        }
        if (registration?.id) {
          if (itemType === 'event') {
            await prisma.eventRegistration.delete({ where: { id: registration.id } });
          } else {
            await prisma.enrollment.delete({ where: { id: registration.id } });
          }
        }
      } catch (cleanupError) {
        console.error('Error cleaning up records:', cleanupError);
      }

      return NextResponse.json(
        { message: error.message || 'Failed to create checkout session' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
