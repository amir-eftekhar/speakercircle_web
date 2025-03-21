import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

// GET /api/admin/users/[id] - Get a specific user
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Await the params properly
    const { id } = await Promise.resolve(context.params);
    
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and has admin role
    if (!session || !['T1_ADMIN', 'T2_ADMIN', 'T3_MANAGER'].includes(session.user?.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user with related data
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        enrollments: {
          include: {
            class: true,
            payment: true
          }
        },
        eventRegistrations: {
          include: {
            event: true
          }
        },
        payments: true
      }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH /api/admin/users/[id] - Update a user
export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Await the params properly
    const { id } = await Promise.resolve(context.params);
    
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and has admin role
    if (!session || !['T1_ADMIN', 'T2_ADMIN'].includes(session.user?.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { name, email, password, role } = body;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Prepare update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (password) {
      updateData.password = await hash(password, 10);
    }
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
    });
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser;
    
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] - Delete a user
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Await the params properly
    const { id } = await Promise.resolve(context.params);
    
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and has admin role
    if (!session || !['T1_ADMIN', 'T2_ADMIN'].includes(session.user?.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Prevent deleting yourself
    if (session.user?.id === id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }
    
    // Delete user
    await prisma.user.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
