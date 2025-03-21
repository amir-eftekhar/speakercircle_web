import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/classes/[id]/curriculum
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
    let isParent = false;
    let childId = null;
    
    // Check if this is a parent request with a childId query parameter
    const url = new URL(request.url);
    const childIdParam = url.searchParams.get('childId');
    
    if (userRole === 'PARENT' && childIdParam) {
      // Check if parent has an approved relationship with this child
      const parentChildRelationship = await (prisma as any).parentChild.findFirst({
        where: {
          parentId: session.user.id,
          childId: childIdParam,
          status: 'APPROVED'
        }
      });
      
      if (parentChildRelationship) {
        isParent = true;
        childId = childIdParam;
      }
    }
    
    if (!isAdmin && !isParent) {
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
    } else if (isParent) {
      // For parents, check if their child is enrolled in this class
      const childEnrollment = await prisma.enrollment.findFirst({
        where: {
          classId: classId,
          userId: childId as string, // Type assertion to fix TypeScript error
          status: { in: ['CONFIRMED', 'TEST'] },
        },
      });
      
      if (!childEnrollment) {
        return NextResponse.json(
          { error: "Your child is not enrolled in this class" },
          { status: 403 }
        );
      }
    }
    
    // Get curriculum items for this class
    const curriculumItems = await (prisma as any).ClassCurriculumItem.findMany({
      where: {
        classId: classId,
        isPublished: true, // Only show published items to students
      },
      orderBy: {
        order: 'asc',
      },
    });
    
    return NextResponse.json({ items: curriculumItems });
  } catch (error) {
    console.error("Error fetching curriculum:", error);
    return NextResponse.json(
      { error: "Failed to fetch curriculum" },
      { status: 500 }
    );
  }
}

// POST /api/classes/[id]/curriculum - For instructors to add curriculum items
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
    const { title, description, content, type, fileUrl, fileType, order, dueDate, isPublished } = await request.json();
    
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
          { error: "Only instructors can add curriculum items" },
          { status: 403 }
        );
      }
    }
    
    // Create the curriculum item
    const curriculumItem = await (prisma as any).ClassCurriculumItem.create({
      data: {
        title,
        description,
        content,
        type,
        fileUrl,
        fileType,
        order: order || 0,
        dueDate: dueDate ? new Date(dueDate) : null,
        isPublished: isPublished || false,
        classId,
      },
    });
    
    return NextResponse.json({ item: curriculumItem }, { status: 201 });
  } catch (error) {
    console.error("Error creating curriculum item:", error);
    return NextResponse.json(
      { error: "Failed to create curriculum item" },
      { status: 500 }
    );
  }
}
