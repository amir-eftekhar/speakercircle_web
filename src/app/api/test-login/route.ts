import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { compare } from 'bcrypt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    console.log("Test login attempt for:", email);
    
    const user = await db.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      console.log("User not found in test-login");
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    
    console.log("Found user in test-login:", user.email);
    
    // Test the password comparison directly
    const passwordValid = await compare(password, user.password);
    
    if (!passwordValid) {
      console.log("Invalid password in test-login");
      return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
    }
    
    console.log("Password valid in test-login");
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error("Error in test-login:", error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
} 