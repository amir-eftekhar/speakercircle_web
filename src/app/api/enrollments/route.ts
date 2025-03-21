import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createCheckoutSession } from '@/lib/stripe';
import { Class } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to enroll in a class' },
        { status: 401 }
      );
    }
    
    const { classId, childId, isTestRegistration = false } = await req.json();
    
    if (!classId) {
      return NextResponse.json(
        { message: 'Class ID is required' },
        { status: 400 }
      );
    }
    
    // Check if class exists and is active
    const classData = await prisma.class.findUnique({
      where: { id: classId },
    });
    
    if (!classData) {
      return NextResponse.json(
        { message: 'Class not found' },
        { status: 404 }
      );
    }
    
    if (!classData.isActive) {
      return NextResponse.json(
        { message: 'This class is not currently available for enrollment' },
        { status: 400 }
      );
    }
    
    // Check if class is full
    if (classData.currentCount >= classData.capacity) {
      return NextResponse.json(
        { message: 'This class is full' },
        { status: 400 }
      );
    }
    
    // Determine which user is being enrolled (current user or their child)
    let enrolleeId = session.user.id;
    
    // If childId is provided and user is a parent, check parent-child relationship
    if (childId && session.user.role === 'PARENT') {
      // Verify parent-child relationship
      const relationship = await (prisma as any).parentChild.findFirst({
        where: {
          parentId: session.user.id,
          childId: childId,
          status: 'APPROVED', // Only approved relationships
        },
      });
      
      if (!relationship) {
        return NextResponse.json(
          { message: 'You are not authorized to enroll this child in classes' },
          { status: 403 }
        );
      }
      
      enrolleeId = childId;
    }
    
    // Check if user is already enrolled
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId: enrolleeId,
        classId,
      },
    });
    
    if (existingEnrollment) {
      return NextResponse.json(
        { message: 'You are already enrolled in this class' },
        { status: 400 }
      );
    }
    
    // Create enrollment record
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: enrolleeId,
        classId,
        status: isTestRegistration ? 'TEST' : 'PENDING',
      },
    });
    
    // If enrolled by parent, create notification for child
    if (childId && enrolleeId !== session.user.id) {
      await (prisma as any).notification.create({
        data: {
          type: 'CLASS_ENROLLMENT',
          content: `Your parent (${session.user.name}) has enrolled you in a class.`,
          senderId: session.user.id,
          receiverId: childId,
          relatedId: classId,
        },
      });
    }
    
    // If class is free or this is a test registration, update enrollment status and class count
    if (!classData.price || classData.price <= 0 || isTestRegistration) {
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { status: 'CONFIRMED' },
      });
      
      await prisma.class.update({
        where: { id: classId },
        data: { currentCount: { increment: 1 } },
      });
      
      return NextResponse.json({ 
        message: 'Successfully enrolled in class',
        enrollment
      }, { status: 201 });
    }
    
    // If class has a price, create a payment record and Stripe checkout session
    // Type assertion to include Stripe fields
    const classWithStripe = classData as (Class & { stripePriceId?: string | null });
    
    if (!classWithStripe.stripePriceId) {
      console.error(`Class ${classId} has a price but no Stripe price ID`);
      
      // Update the enrollment to be confirmed anyway
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { status: 'CONFIRMED' },
      });
      
      await prisma.class.update({
        where: { id: classId },
        data: { currentCount: { increment: 1 } },
      });
      
      return NextResponse.json({ 
        message: 'Enrolled in class (payment configuration issue - enrollment granted)',
        enrollment
      }, { status: 201 });
    }
    
    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        enrollmentId: enrollment.id,
        amount: classData.price,
        status: 'PENDING',
      },
    });
    
    // Create Stripe checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${process.env.PORT || 3000}`;
    
    try {
      const checkoutSession = await createCheckoutSession({
      priceId: classWithStripe.stripePriceId as string,
      userId: session.user.id,
      enrollmentId: enrollment.id,
      successUrl: `${baseUrl}/dashboard?enrollment=success`,
      cancelUrl: `${baseUrl}/classes/${classId}?enrollment=cancelled`,
      customerEmail: session.user.email || undefined,
    });
    
      // Update payment with Stripe session ID
      await prisma.payment.update({
        where: { id: payment.id },
        data: { stripeSessionId: checkoutSession.id },
      });
      
      return NextResponse.json({ 
        url: checkoutSession.url,
        enrollment
      }, { status: 201 });
    } catch (stripeError) {
      console.error('Stripe checkout error:', stripeError);
      
      // If Stripe checkout fails, still confirm the enrollment
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { status: 'CONFIRMED' },
      });
      
      await prisma.class.update({
        where: { id: classId },
        data: { currentCount: { increment: 1 } },
      });
      
      return NextResponse.json({ 
        message: 'Enrolled in class (payment processing issue - enrollment granted)',
        enrollment
      }, { status: 201 });
    }
    
  } catch (error) {
    console.error('Enrollment error:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to view enrollments' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const classId = searchParams.get('classId');
    const status = searchParams.get('status');
    
    // Check if user is admin or querying their own enrollments
    const isAdmin = session.user.role === 'ADMIN';
    const isOwnEnrollments = userId === session.user.id;
    
    if (!isAdmin && !isOwnEnrollments && userId) {
      return NextResponse.json(
        { message: 'You are not authorized to view these enrollments' },
        { status: 403 }
      );
    }
    
    const where: any = {};
    
    if (userId) {
      where.userId = userId;
    } else if (!isAdmin) {
      // If not admin and not specifying a userId, default to own enrollments
      where.userId = session.user.id;
    }
    
    if (classId) {
      where.classId = classId;
    }
    
    if (status) {
      where.status = status;
    }
    
    const enrollments = await prisma.enrollment.findMany({
      where,
      include: {
        class: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            location: true,
            instructor: true,
            price: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json({ enrollments });
    
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}
