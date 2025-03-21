import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Mock data for parent requests
const mockParentRequests = [
  {
    id: 'req1',
    parentId: 'parent1',
    childId: 'student1',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    updatedAt: new Date(Date.now() - 86400000),
    parent: {
      id: 'parent1',
      name: 'John Doe',
      email: 'john.doe@example.com',
    }
  },
  {
    id: 'req2',
    parentId: 'parent2',
    childId: 'student2',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 172800000), // 2 days ago
    updatedAt: new Date(Date.now() - 172800000),
    parent: {
      id: 'parent2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
    }
  },
];

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

    // Get the student ID from the session
    const studentId = session.user.id;

    // Filter requests to match the current student (in a real app, this would be a database query)
    // For the mock, we'll just return all requests
    
    return NextResponse.json({ 
      requests: mockParentRequests,
      success: true 
    });
  } catch (error) {
    console.error('Error fetching parent requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch parent requests' },
      { status: 500 }
    );
  }
}

// Handle updating parent request status
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const studentId = session.user.id;
    const data = await req.json();
    const { relationshipId, status } = data;

    if (!relationshipId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find the mock relationship
    const relationshipIndex = mockParentRequests.findIndex(req => req.id === relationshipId);

    if (relationshipIndex === -1) {
      return NextResponse.json(
        { error: 'Relationship not found or not authorized' },
        { status: 404 }
      );
    }

    // Update the relationship status (in a real app, this would update the database)
    mockParentRequests[relationshipIndex].status = status;
    mockParentRequests[relationshipIndex].updatedAt = new Date();

    return NextResponse.json({
      success: true,
      relationship: mockParentRequests[relationshipIndex],
    });
  } catch (error) {
    console.error('Error updating parent request:', error);
    return NextResponse.json(
      { error: 'Failed to update parent request' },
      { status: 500 }
    );
  }
}
