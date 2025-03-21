import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check if user is authenticated and has admin role
    const session = await getServerSession(authOptions);
    
    // Check if the user has any admin role (T1_ADMIN, T2_ADMIN, or T3_MANAGER)
    const isAdmin = session?.user?.role === 'T1_ADMIN' || 
                   session?.user?.role === 'T2_ADMIN' || 
                   session?.user?.role === 'T3_MANAGER';
                   
    if (!session || !isAdmin) {
      console.log('Unauthorized access attempt to stats API. User role:', session?.user?.role);
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get total users count (excluding GUEST users)
    const totalUsers = await prisma.user.count({
      where: {
        role: {
          not: 'GUEST'
        }
      }
    });
    
    // Get upcoming events count (events with date in the future)
    const upcomingEvents = await prisma.event.count({
      where: {
        date: {
          gte: new Date(),
        },
        isActive: true,
      },
    });
    
    // Get total events count
    const totalEvents = await prisma.event.count();
    
    // Get active classes count (classes that are currently active and not ended)
    const activeClasses = await prisma.class.count({
      where: {
        isActive: true,
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } }
        ]
      },
    });
    
    // Get total classes count
    const totalClasses = await prisma.class.count();
    
    // Get total revenue from payments
    const paymentsResult = await prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: 'COMPLETED',
      },
    });
    
    const totalRevenue = paymentsResult._sum.amount || 0;
    
    // Get total enrollments count
    const totalEnrollments = await prisma.enrollment.count();
    
    // Get active enrollments count
    const activeEnrollments = await prisma.enrollment.count({
      where: {
        status: 'ACTIVE'
      }
    });
    
    return NextResponse.json({
      totalUsers,
      upcomingEvents,
      totalEvents,
      activeClasses,
      totalClasses,
      totalEnrollments,
      activeEnrollments,
      totalRevenue,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
