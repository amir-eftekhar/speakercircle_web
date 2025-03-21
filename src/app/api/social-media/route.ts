import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/social-media
export async function GET(req: NextRequest) {
  try {
    // Get all active social media accounts
    const socialMedia = await prisma.socialMedia.findMany({
      where: {
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ socialMedia });
  } catch (error) {
    console.error('Error fetching social media:', error);
    return NextResponse.json({ error: 'Failed to fetch social media' }, { status: 500 });
  }
}
