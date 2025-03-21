import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/social-media
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and has admin role
    if (!session || !['ADMIN', 'T1_ADMIN', 'T2_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all social media accounts
    const socialMedia = await prisma.socialMedia.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ socialMedia });
  } catch (error) {
    console.error('Error fetching social media:', error);
    return NextResponse.json({ error: 'Failed to fetch social media' }, { status: 500 });
  }
}

// POST /api/admin/social-media
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and has admin role
    if (!session || !['ADMIN', 'T1_ADMIN', 'T2_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { platform, url, embedCode } = body;

    // Validate required fields
    if (!platform || !url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create new social media account
    const socialMedia = await prisma.socialMedia.create({
      data: {
        platform,
        url,
        embedCode,
        username: '', // Provide a default value for required fields in the schema
      },
    });

    return NextResponse.json({ socialMedia }, { status: 201 });
  } catch (error) {
    console.error('Error creating social media:', error);
    return NextResponse.json({ error: 'Failed to create social media' }, { status: 500 });
  }
}
