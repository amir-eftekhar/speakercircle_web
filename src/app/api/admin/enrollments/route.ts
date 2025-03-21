import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/admin/enrollments - Get all enrollments
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and has admin role
    if (!session || !['T1_ADMIN', 'T2_ADMIN', 'T3_MANAGER'].includes(session.user?.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const query = searchParams.get('query');
    const classId = searchParams.get('classId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    
    // Build where condition
    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (classId) {
      where.classId = classId;
    }
    if (query) {
      where.OR = [
        {
          user: {
            name: { contains: query, mode: 'insensitive' }
          }
        },
        {
          user: {
            email: { contains: query, mode: 'insensitive' }
          }
        },
        {
          class: {
            title: { contains: query, mode: 'insensitive' }
          }
        }
      ];
    }
    
    // Get enrollments with pagination
    const enrollments = await prisma.enrollment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        class: {
          select: {
            id: true,
            title: true,
            startDate: true,
            price: true
          }
        },
        payment: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });
    
    // Get total count for pagination
    const totalCount = await prisma.enrollment.count({ where });
    
    return NextResponse.json({
      enrollments,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}