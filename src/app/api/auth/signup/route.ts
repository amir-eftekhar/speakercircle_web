import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import * as z from 'zod';

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['STUDENT', 'PARENT']),
  gradeLevel: z.number().optional(),
  school: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = signupSchema.parse(json);

    const exists = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (exists) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(body.password, 10);

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        role: body.role,
      },
    });

    // Note: The Prisma schema doesn't actually have Student or Parent models
    // If you need to track additional user information, you should add fields to the User model
    // or create proper Student/Parent models in your schema

    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid request data', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}
