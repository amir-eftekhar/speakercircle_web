import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/classes/[id]/messages
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
    
    // Get messages for this class
    const messages = await (prisma as any).ClassMessage.findMany({
      where: {
        classId: classId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      take: 100, // Limit to last 100 messages
    });
    
    // Format the messages for the frontend
    const formattedMessages = messages.map((message: any) => ({
      id: message.id,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      user: {
        id: message.user.id,
        name: message.user.name,
        role: message.user.role,
      },
    }));
    
    return NextResponse.json({ messages: formattedMessages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST /api/classes/[id]/messages - For students and instructors to send messages
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
    const { content } = await request.json();
    
    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: "Message content cannot be empty" },
        { status: 400 }
      );
    }
    
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
    
    // Create the message
    const message = await (prisma as any).ClassMessage.create({
      data: {
        content,
        classId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });
    
    return NextResponse.json({
      message: {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
        user: {
          id: message.user.id,
          name: message.user.name,
          role: message.user.role,
        },
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}
