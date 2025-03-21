import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/social-media/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and has admin role
    if (!session || !['ADMIN', 'T1_ADMIN', 'T2_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Get social media by ID
    const socialMedia = await prisma.socialMedia.findUnique({
      where: { id },
    });

    if (!socialMedia) {
      return NextResponse.json({ error: 'Social media not found' }, { status: 404 });
    }

    return NextResponse.json({ socialMedia });
  } catch (error) {
    console.error('Error fetching social media:', error);
    return NextResponse.json({ error: 'Failed to fetch social media' }, { status: 500 });
  }
}

// PUT /api/admin/social-media/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and has admin role
    if (!session || !['ADMIN', 'T1_ADMIN', 'T2_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { platform, url, embedCode, isActive } = body;

    // Validate required fields
    if (!platform || !url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update social media
    const socialMedia = await prisma.socialMedia.update({
      where: { id },
      data: {
        platform,
        url,
        embedCode,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ socialMedia });
  } catch (error) {
    console.error('Error updating social media:', error);
    return NextResponse.json({ error: 'Failed to update social media' }, { status: 500 });
  }
}

// DELETE /api/admin/social-media/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and has admin role
    if (!session || !['ADMIN', 'T1_ADMIN', 'T2_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Delete social media
    await prisma.socialMedia.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting social media:', error);
    return NextResponse.json({ error: 'Failed to delete social media' }, { status: 500 });
  }
}
