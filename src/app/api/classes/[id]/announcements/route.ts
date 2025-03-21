import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/classes/[id]/announcements
export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: classId } = context.params;
    
    // Check if the user is enrolled in this class or is an instructor/admin
    const userRole = session.user.role;
    const isAdmin = ['ADMIN', 'T1_ADMIN', 'T2_ADMIN', 'T3_MANAGER'].includes(userRole);
    
    if (!isAdmin) {
      // Check if user is the instructor
      const classData = await (prisma.class.findUnique({
        where: { id: classId },
      }) as any);
      
      // Check if user is the instructor
      const isInstructor = classData?.instructorId === session.user.id;
      
      // Check if user is enrolled
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          classId: classId,
          userId: session.user.id,
          status: { in: ['CONFIRMED', 'TEST'] },
        },
      });
      
      if (!isInstructor && !enrollment) {
        return NextResponse.json(
          { error: "You are not enrolled in this class" },
          { status: 403 }
        );
      }
    }
    
    // Get announcements for this class
    const announcements = await (prisma as any).ClassAnnouncement.findMany({
      where: {
        classId: classId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Format the announcements for the frontend
    const formattedAnnouncements = announcements.map((announcement: any) => ({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      createdAt: announcement.createdAt.toISOString(),
      author: announcement.user.name,
    }));
    
    return NextResponse.json({ announcements: formattedAnnouncements });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

// POST /api/classes/[id]/announcements - For instructors to add announcements
export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id: classId } = context.params;
    const { title, content } = await request.json();
    
    // Check if the user is the instructor or an admin
    const userRole = session.user.role;
    const isAdmin = ['ADMIN', 'T1_ADMIN', 'T2_ADMIN', 'T3_MANAGER'].includes(userRole);
    
    if (!isAdmin) {
      // Check if user is the instructor
      const classData = await (prisma.class.findUnique({
        where: { id: classId },
      }) as any);
      
      // Check if user is the instructor
      const isInstructor = classData?.instructorId === session.user.id;
      
      if (!isInstructor) {
        return NextResponse.json(
          { error: "Only instructors can add announcements" },
          { status: 403 }
        );
      }
    }
    
    // Create the announcement
    const announcement = await (prisma as any).ClassAnnouncement.create({
      data: {
        title,
        content,
        classId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });
    
    // Create notifications for all enrolled students
    const enrollments = await prisma.enrollment.findMany({
      where: {
        classId: classId,
        status: { in: ['CONFIRMED', 'TEST'] },
      },
      select: {
        userId: true,
      },
    });
    
    // Create a notification for each enrolled student
    if (enrollments.length > 0) {
      await (prisma as any).Notification.createMany({
        data: enrollments.map(enrollment => ({
          type: 'ANNOUNCEMENT',
          content: `New announcement in class: ${title}`,
          senderId: session.user.id,
          receiverId: enrollment.userId,
          read: false,
          relatedId: announcement.id,
        })),
      });
    }
    
    return NextResponse.json({
      announcement: {
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        createdAt: announcement.createdAt.toISOString(),
        author: announcement.user.name,
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 }
    );
  }
}
