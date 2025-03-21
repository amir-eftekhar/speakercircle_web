import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET /api/classes/[id]/assignments - Get assignments for a class
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
    const userId = session.user.id;
    
    let isAuthorized = false;
    
    if (userRole === 'ADMIN') {
      isAuthorized = true;
    } else if (userRole === 'MENTOR') {
      // Check if this user is the instructor for this class
      const classRecord = await prisma.class.findFirst({
        where: {
          id: classId,
          instructorId: userId
        } as Prisma.ClassWhereInput
      });
      
      isAuthorized = !!classRecord;
    } else if (userRole === 'STUDENT') {
      // Check if the student is enrolled in this class
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          classId: classId,
          userId: userId,
          status: 'ACTIVE'
        }
      });
      
      isAuthorized = !!enrollment;
    }
    
    if (!isAuthorized) {
      return NextResponse.json({ error: "Not authorized to access this class" }, { status: 403 });
    }
    
    // Get all assignments for this class
    const assignments = await (prisma as any).classCurriculumItem.findMany({
      where: {
        classId: classId,
        type: 'ASSIGNMENT'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // If student, get their submission status for each assignment
    if (userRole === 'STUDENT') {
      const submissions = await (prisma as any).assignmentSubmission.findMany({
        where: {
          userId: userId,
          curriculumItemId: {
            in: assignments.map((a: any) => a.id)
          }
        }
      });
      
      const assignmentsWithStatus = assignments.map((assignment: any) => {
        const submission = submissions.find((s: any) => s.curriculumItemId === assignment.id);
        return {
          ...assignment,
          submissionStatus: submission ? submission.status : 'NOT_SUBMITTED',
          submissionId: submission?.id || null,
          submissionUrl: submission?.fileUrl || null,
          submissionDate: submission?.createdAt || null,
          grade: submission?.grade || null,
          feedback: submission?.feedback || null
        };
      });
      
      return NextResponse.json(assignmentsWithStatus);
    }
    
    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
  }
}

// POST /api/classes/[id]/assignments/submit - For students to submit assignments
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
    const { assignmentId, fileUrl, notes } = await request.json();
    
    if (!assignmentId || !fileUrl) {
      return NextResponse.json({ error: "Assignment ID and file URL are required" }, { status: 400 });
    }
    
    // Verify the user is a student enrolled in this class
    const userId = session.user.id;
    const userRole = session.user.role;
    
    if (userRole !== 'STUDENT') {
      return NextResponse.json({ error: "Only students can submit assignments" }, { status: 403 });
    }
    
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        classId: classId,
        userId: userId,
        status: 'ACTIVE'
      }
    });
    
    if (!enrollment) {
      return NextResponse.json({ error: "You are not enrolled in this class" }, { status: 403 });
    }
    
    // Verify the assignment belongs to this class
    const assignment = await (prisma as any).classCurriculumItem.findFirst({
      where: {
        id: assignmentId,
        classId: classId,
        type: 'ASSIGNMENT'
      }
    });
    
    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found in this class" }, { status: 404 });
    }
    
    // Check if student already submitted this assignment
    const existingSubmission = await (prisma as any).assignmentSubmission.findFirst({
      where: {
        userId: userId,
        curriculumItemId: assignmentId
      }
    });
    
    if (existingSubmission) {
      // Update existing submission
      const updatedSubmission = await (prisma as any).assignmentSubmission.update({
        where: {
          id: existingSubmission.id
        },
        data: {
          fileUrl: fileUrl,
          notes: notes || null,
          status: 'SUBMITTED',
          updatedAt: new Date()
        }
      });
      
      return NextResponse.json(updatedSubmission, { status: 200 });
    } else {
      // Create new submission
      const submission = await (prisma as any).assignmentSubmission.create({
        data: {
          userId: userId,
          curriculumItemId: assignmentId,
          classId: classId,
          fileUrl: fileUrl,
          notes: notes || null,
          status: 'SUBMITTED'
        }
      });
      
      return NextResponse.json(submission, { status: 201 });
    }
  } catch (error) {
    console.error("Error submitting assignment:", error);
    return NextResponse.json({ error: "Failed to submit assignment" }, { status: 500 });
  }
}
