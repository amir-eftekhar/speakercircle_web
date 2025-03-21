import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createStripeProduct, updateStripeProductMetadata } from '@/lib/stripe';

const prisma = new PrismaClient();

// GET /api/classes - Get all classes
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    const isActive = searchParams.get('isActive');
    
    // Build where condition
    const where: any = {};
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }
    
    // Get classes with pagination
    const classes = await prisma.class.findMany({
      where,
      orderBy: { startDate: 'desc' },
      skip,
      take: limit,
      include: {
        _count: {
          select: {
            enrollments: true
          }
        }
      }
    });
    
    // Get total count for pagination
    const totalCount = await prisma.class.count({ where });
    
    return NextResponse.json({
      classes,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/classes - Create a new class
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and has admin role
    if (!session || !['T1_ADMIN', 'T2_ADMIN', 'T3_MANAGER'].includes(session.user?.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { 
      title, 
      description, 
      price, 
      capacity, 
      startDate, 
      endDate, 
      schedule, 
      location, 
      instructor, 
      instructorId,
      level, 
      isActive,
      requiresInterview,
      imageData
    } = body;
    
    // Validate required fields
    if (!title || !description || !capacity || !startDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Create new class first without Stripe IDs
    const newClass = await prisma.class.create({
      data: {
        title,
        description,
        price,
        capacity: parseInt(capacity),
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        schedule: schedule || '',
        location,
        instructor,
        instructorId,
        level,
        isActive: isActive !== undefined ? isActive : true,
        requiresInterview: requiresInterview || false,
        // Use type assertion to add imageData
        ...(imageData ? { imageData } as any : {})
      }
    });
    
    // Create Stripe product if class has a price
    let stripeProductId = null;
    let stripePriceId = null;
    
    if (price && price > 0) {
      try {
        const stripeProduct = await createStripeProduct({
          name: title,
          description,
          price,
          type: 'class',
          id: newClass.id, // Use the actual class ID
        });
        
        stripeProductId = stripeProduct.productId;
        stripePriceId = stripeProduct.priceId;
      } catch (error) {
        console.error('Error creating Stripe product:', error);
        // Continue with class update even if Stripe product creation fails
      }
    }
    
    // Update the class with Stripe IDs if they were created
    if (stripeProductId && stripePriceId) {
      await prisma.class.update({
        where: { id: newClass.id },
        data: {
          stripeProductId,
          stripePriceId
        }
      });
      
      // Update the class object for the response
      newClass.stripeProductId = stripeProductId;
      newClass.stripePriceId = stripePriceId;
    }
    
    // Update Stripe product with class ID if it was created
    if (stripeProductId && stripePriceId) {
      try {
        // Update the Stripe product metadata with the class ID
        await updateStripeProductMetadata({
          productId: stripeProductId,
          metadata: {
            classId: newClass.id,
            type: 'class'
          }
        });
      } catch (error) {
        console.error('Error updating Stripe product metadata:', error);
      }
    }
    
    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}