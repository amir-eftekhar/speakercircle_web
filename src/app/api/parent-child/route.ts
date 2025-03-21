import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/parent-child - Get all parent-child relationships for the current user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    const userRole = session.user.role;
    
    // If user is a parent, get their children
    if (userRole === 'PARENT') {
      const children = await (prisma as any).parentChild.findMany({
        where: {
          parentId: userId,
        },
        include: {
          child: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      
      const formattedChildren = children.map((relationship: any) => ({
        id: relationship.id,
        childId: relationship.childId,
        status: relationship.status,
        createdAt: relationship.createdAt.toISOString(),
        child: {
          id: relationship.child.id,
          name: relationship.child.name,
          email: relationship.child.email,
        },
      }));
      
      return NextResponse.json({ relationships: formattedChildren });
    } 
    // If user is a student, get their parents
    else {
      const parents = await (prisma as any).parentChild.findMany({
        where: {
          childId: userId,
        },
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      
      const formattedParents = parents.map((relationship: any) => ({
        id: relationship.id,
        parentId: relationship.parentId,
        status: relationship.status,
        createdAt: relationship.createdAt.toISOString(),
        parent: {
          id: relationship.parent.id,
          name: relationship.parent.name,
          email: relationship.parent.email,
        },
      }));
      
      return NextResponse.json({ relationships: formattedParents });
    }
  } catch (error) {
    console.error("Error fetching parent-child relationships:", error);
    return NextResponse.json(
      { error: "Failed to fetch relationships" },
      { status: 500 }
    );
  }
}

// POST /api/parent-child - Create a new parent-child relationship
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { childEmail } = await request.json();
    
    if (!childEmail) {
      return NextResponse.json(
        { error: "Child email is required" },
        { status: 400 }
      );
    }
    
    const userId = session.user.id;
    const userRole = session.user.role;
    
    // Only parents can create relationships
    if (userRole !== 'PARENT') {
      return NextResponse.json(
        { error: "Only parents can create parent-child relationships" },
        { status: 403 }
      );
    }
    
    // Find the child by email
    const child = await prisma.user.findUnique({
      where: {
        email: childEmail,
      },
    });
    
    if (!child) {
      return NextResponse.json(
        { error: "Child not found with the provided email" },
        { status: 404 }
      );
    }
    
    // Check if relationship already exists
    const existingRelationship = await (prisma as any).parentChild.findFirst({
      where: {
        parentId: userId,
        childId: child.id,
      },
    });
    
    if (existingRelationship) {
      return NextResponse.json(
        { error: "Relationship already exists", relationship: existingRelationship },
        { status: 400 }
      );
    }
    
    // Create the relationship
    const relationship = await (prisma as any).parentChild.create({
      data: {
        parentId: userId,
        childId: child.id,
        status: 'PENDING', // Requires child approval
      },
    });
    
    // Create a notification for the child
    await (prisma as any).notification.create({
      data: {
        type: 'PARENT_REQUEST',
        content: `${session.user.name} wants to connect as your parent`,
        senderId: userId,
        receiverId: child.id,
        read: false,
        relatedId: relationship.id,
      },
    });
    
    return NextResponse.json({ relationship }, { status: 201 });
  } catch (error) {
    console.error("Error creating parent-child relationship:", error);
    return NextResponse.json(
      { error: "Failed to create relationship" },
      { status: 500 }
    );
  }
}

// PATCH /api/parent-child - Update a parent-child relationship status
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { relationshipId, status } = await request.json();
    
    if (!relationshipId || !status) {
      return NextResponse.json(
        { error: "Relationship ID and status are required" },
        { status: 400 }
      );
    }
    
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: "Status must be APPROVED or REJECTED" },
        { status: 400 }
      );
    }
    
    const userId = session.user.id;
    
    // Find the relationship
    const relationship = await (prisma as any).parentChild.findUnique({
      where: {
        id: relationshipId,
      },
    });
    
    if (!relationship) {
      return NextResponse.json(
        { error: "Relationship not found" },
        { status: 404 }
      );
    }
    
    // Only the child can approve/reject a relationship
    if (relationship.childId !== userId) {
      return NextResponse.json(
        { error: "Only the child can approve or reject a relationship" },
        { status: 403 }
      );
    }
    
    // Update the relationship
    const updatedRelationship = await (prisma as any).parentChild.update({
      where: {
        id: relationshipId,
      },
      data: {
        status,
      },
    });
    
    // Create a notification for the parent
    await (prisma as any).notification.create({
      data: {
        type: 'PARENT_REQUEST_RESPONSE',
        content: `Your parent request was ${status.toLowerCase()}`,
        senderId: userId,
        receiverId: relationship.parentId,
        read: false,
        relatedId: relationship.id,
      },
    });
    
    return NextResponse.json({ relationship: updatedRelationship });
  } catch (error) {
    console.error("Error updating parent-child relationship:", error);
    return NextResponse.json(
      { error: "Failed to update relationship" },
      { status: 500 }
    );
  }
}

// DELETE /api/parent-child - Delete a parent-child relationship
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const url = new URL(request.url);
    const relationshipId = url.searchParams.get('id');
    
    if (!relationshipId) {
      return NextResponse.json(
        { error: "Relationship ID is required" },
        { status: 400 }
      );
    }
    
    const userId = session.user.id;
    
    // Find the relationship
    const relationship = await (prisma as any).parentChild.findUnique({
      where: {
        id: relationshipId,
      },
    });
    
    if (!relationship) {
      return NextResponse.json(
        { error: "Relationship not found" },
        { status: 404 }
      );
    }
    
    // Only the parent or child can delete a relationship
    if (relationship.parentId !== userId && relationship.childId !== userId) {
      return NextResponse.json(
        { error: "You do not have permission to delete this relationship" },
        { status: 403 }
      );
    }
    
    // Delete the relationship
    await (prisma as any).parentChild.delete({
      where: {
        id: relationshipId,
      },
    });
    
    // Create a notification for the other party
    const receiverId = userId === relationship.parentId ? relationship.childId : relationship.parentId;
    const senderName = session.user.name;
    
    await (prisma as any).notification.create({
      data: {
        type: 'PARENT_RELATIONSHIP_DELETED',
        content: `${senderName} has removed the parent-child connection`,
        senderId: userId,
        receiverId,
        read: false,
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting parent-child relationship:", error);
    return NextResponse.json(
      { error: "Failed to delete relationship" },
      { status: 500 }
    );
  }
}
