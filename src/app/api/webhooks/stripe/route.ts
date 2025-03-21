import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const body = await req.text();
  // Extract the stripe signature directly from the request headers
  const signature = req.headers.get('stripe-signature') || '';

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (error: any) {
    console.error(`Webhook signature verification failed: ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      // Extract metadata
      const { userId, enrollmentId, eventRegistrationId } = session.metadata || {};
      
      if (!userId) {
        console.error('Missing userId in Stripe session metadata');
        return new NextResponse('Missing userId in metadata', { status: 400 });
      }
      
      // Either enrollmentId or eventRegistrationId should be present
      if (!enrollmentId && !eventRegistrationId) {
        console.error('Missing enrollmentId or eventRegistrationId in Stripe session metadata');
        return new NextResponse('Missing enrollment or event registration data', { status: 400 });
      }
      
      try {
        // Update payment status
        const payment = await prisma.payment.updateMany({
          where: {
            stripeSessionId: session.id,
            status: 'PENDING',
          },
          data: {
            status: 'COMPLETED',
            amount: session.amount_total ? session.amount_total / 100 : 0, // Convert from cents
          },
        });
        
        // Handle class enrollment payment
        if (enrollmentId) {
          // Update enrollment status
          const enrollment = await prisma.enrollment.update({
            where: {
              id: enrollmentId,
            },
            data: {
              status: 'CONFIRMED',
            },
            include: {
              class: true,
            },
          });
          
          // Increment class current count
          await prisma.class.update({
            where: {
              id: enrollment.classId,
            },
            data: {
              currentCount: {
                increment: 1,
              },
            },
          });
          
          console.log(`Payment completed for class enrollment ${enrollmentId}`);
        }
        
        // Handle event registration payment
        if (eventRegistrationId) {
          // Update event registration status
          const registration = await prisma.eventRegistration.update({
            where: {
              id: eventRegistrationId,
            },
            data: {
              status: 'CONFIRMED',
            },
            include: {
              event: true,
            },
          });
          
          // Increment event current count
          await prisma.event.update({
            where: {
              id: registration.eventId,
            },
            data: {
              currentCount: {
                increment: 1,
              },
            },
          });
          
          console.log(`Payment completed for event registration ${eventRegistrationId}`);
        }
      } catch (error) {
        console.error('Error processing payment completion:', error);
        return new NextResponse('Error processing payment', { status: 500 });
      }
      break;
      
    case 'checkout.session.expired':
      const expiredSession = event.data.object;
      const expiredMetadata = expiredSession.metadata || {};
      
      try {
        // Update payment status to expired
        await prisma.payment.updateMany({
          where: {
            stripeSessionId: expiredSession.id,
            status: 'PENDING',
          },
          data: {
            status: 'EXPIRED',
          },
        });
        
        // Update enrollment status to cancelled
        if (expiredMetadata.enrollmentId) {
          await prisma.enrollment.update({
            where: {
              id: expiredMetadata.enrollmentId,
            },
            data: {
              status: 'CANCELLED',
            },
          });
        }
        
        // Update event registration status to cancelled
        if (expiredMetadata.eventRegistrationId) {
          await prisma.eventRegistration.update({
            where: {
              id: expiredMetadata.eventRegistrationId,
            },
            data: {
              status: 'CANCELLED',
            },
          });
        }
        
        console.log(`Payment expired for session ${expiredSession.id}`);
      } catch (error) {
        console.error('Error processing payment expiration:', error);
        return new NextResponse('Error processing payment expiration', { status: 500 });
      }
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return new NextResponse('Webhook received', { status: 200 });
}

// Disable body parsing, we need the raw body for Stripe signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};
