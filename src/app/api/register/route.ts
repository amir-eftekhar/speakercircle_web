import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailTemplates } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { name, email, password, role, childEmail } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with specified role if provided
    const userRole = role === 'PARENT' ? 'PARENT' : 'STUDENT';
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole,
      },
    });

    // If registering as a parent and child email is provided, create parent-child relationship
    if (userRole === 'PARENT' && childEmail) {
      // Find child by email
      const child = await prisma.user.findUnique({
        where: { email: childEmail },
      });

      if (child) {
        // Create parent-child relationship
        await (prisma as any).parentChild.create({
          data: {
            parentId: user.id,
            childId: child.id,
            status: 'PENDING', // Requires child's approval
          },
        });

        // Create notification for child
        await (prisma as any).notification.create({
          data: {
            type: 'PARENT_REQUEST',
            content: `${user.name} wants to connect as your parent.`,
            senderId: user.id,
            receiverId: child.id,
          },
        });
      }
    }

    // Send welcome email
    const welcomeTemplate = emailTemplates.welcome(name);
    await sendEmail({
      to: email,
      toName: name,
      ...welcomeTemplate,
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Error creating user" },
      { status: 500 }
    );
  }
}
