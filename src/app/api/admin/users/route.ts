import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hash } from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Using the prisma instance from lib/prisma

// GET /api/admin/users - Get all users
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and has admin role
    if (!session || !['T1_ADMIN', 'T2_ADMIN', 'T3_MANAGER'].includes(session.user?.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role');
    const query = searchParams.get('query');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    
    // Build where condition
    const where: any = {};
    if (role) {
      where.role = role;
    }
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } }
      ];
    }
    
    // Get users with pagination and relationships
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Include parent-child relationships

        // Include enrollments with class information
        enrollments: {
          select: {
            id: true,
            status: true,
            class: {
              select: {
                id: true,
                title: true,
                instructor: true
              }
            }
          },
          take: 5 // Limit to 5 most recent enrollments per user
        },
        _count: {
          select: {
            enrollments: true,
            payments: true,
            eventRegistrations: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });
    
    // Get parent-child relationships separately
    const userIds = users.map((user: any) => user.id);
    
    // Get parent relationships (where user is a child)
    const parentRelationships = await prisma.$queryRaw`
      SELECT 
        pc.id, pc.parentId, pc.childId, pc.status,
        u.id as parent_id, u.name as parent_name, u.email as parent_email, u.role as parent_role
      FROM "ParentChild" pc
      JOIN "User" u ON pc."parentId" = u.id
      WHERE pc."childId" IN (${Prisma.join(userIds)})
    `;
    
    // Get child relationships (where user is a parent)
    const childRelationships = await prisma.$queryRaw`
      SELECT 
        pc.id, pc.parentId, pc.childId, pc.status,
        u.id as child_id, u.name as child_name, u.email as child_email, u.role as child_role
      FROM "ParentChild" pc
      JOIN "User" u ON pc."childId" = u.id
      WHERE pc."parentId" IN (${Prisma.join(userIds)})
    `;
    
    // Group parents by child ID
    const parentsByChildId: Record<string, any[]> = {};
    (parentRelationships as any[]).forEach((rel: any) => {
      if (!parentsByChildId[rel.childid]) {
        parentsByChildId[rel.childid] = [];
      }
      parentsByChildId[rel.childid].push({
        id: rel.parent_id,
        name: rel.parent_name,
        email: rel.parent_email,
        role: rel.parent_role
      });
    });
    
    // Group children by parent ID
    const childrenByParentId: Record<string, any[]> = {};
    (childRelationships as any[]).forEach((rel: any) => {
      if (!childrenByParentId[rel.parentid]) {
        childrenByParentId[rel.parentid] = [];
      }
      childrenByParentId[rel.parentid].push({
        id: rel.child_id,
        name: rel.child_name,
        email: rel.child_email,
        role: rel.child_role
      });
    });
    
    // Transform the data to make it more usable
    const transformedUsers = users.map((user: any) => {
      const parents = parentsByChildId[user.id] || [];
      const children = childrenByParentId[user.id] || [];
      
      // Format the response
      return {
        ...user,
        parents,
        children,
        childCount: children.length,
        parentCount: parents.length,
        enrollmentCount: user._count?.enrollments || 0
      };
    });
    
    // Get total count for pagination
    const totalCount = await prisma.user.count({ where });
    
    return NextResponse.json({
      users: transformedUsers,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/admin/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and has admin role
    if (!session || !['T1_ADMIN', 'T2_ADMIN'].includes(session.user?.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { name, email, password, role } = body;
    
    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }
    
    // Hash password
    const hashedPassword = await hash(password, 10);
    
    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      }
    });
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;
    
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
