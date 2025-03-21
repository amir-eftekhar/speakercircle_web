import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the user is an instructor
    if (session.user.role !== 'INSTRUCTOR') {
      return NextResponse.json(
        { error: 'Access denied. Instructor role required.' },
        { status: 403 }
      );
    }

    // Get the instructor ID from the session
    const instructorId = session.user.id;

    // Get current date
    const now = new Date();
    
    // Set end date to 7 days from now
    const endDate = new Date();
    endDate.setDate(now.getDate() + 7);

    // First, get the classes taught by this instructor
    const instructorClasses = await prisma.class.findMany({
      where: {
        instructor: instructorId, // Using instructor field instead of instructorId
      },
      select: {
        id: true,
        title: true,
        startDate: true,
        schedule: true,
      },
    });
    
    // Since we don't have a dedicated sessions model, we'll use class schedules
    // to create upcoming sessions based on class start dates and schedules
    const upcomingSessions = [];
    
    for (const cls of instructorClasses) {
      // Parse the schedule information (assuming it contains time information)
      const scheduleInfo = cls.schedule.split(',').map(s => s.trim());
      
      // Create a session for each class based on its start date
      // This is a simplified approach - in a real app, you'd generate actual session dates
      // based on the schedule pattern
      upcomingSessions.push({
        id: `${cls.id}-next`,
        title: `${cls.title} - Next Session`,
        date: cls.startDate,
        time: scheduleInfo[0] || 'Time TBD',
        classId: cls.id,
        className: cls.title,
      });
    }
    
    // Filter sessions to only include those in the next 7 days
    const filteredSessions = upcomingSessions.filter(s => {
      const sessionDate = new Date(s.date);
      return sessionDate >= now && sessionDate <= endDate;
    });
    
    // Transform the data for the response
    const transformedSessions = filteredSessions.map((sessionItem) => ({
      id: sessionItem.id,
      title: sessionItem.title,
      date: new Date(sessionItem.date).toISOString(),
      time: sessionItem.time,
      classId: sessionItem.classId,
      className: sessionItem.className,
    }));

    return NextResponse.json({ 
      sessions: transformedSessions,
      success: true 
    });
  } catch (error) {
    console.error('Error fetching instructor sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}
