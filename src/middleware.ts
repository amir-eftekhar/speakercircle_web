import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { withAuth } from 'next-auth/middleware';

// Role-based access configuration
const roleAccess = {
  GUEST: ['/'],
  STUDENT: ['/dashboard', '/projects', '/events'],
  PARENT: ['/dashboard', '/payments', '/student-progress'],
  GAVELIER_PRESIDENT: ['/admin', '/events', '/announcements', '/members'],
  GAVELIER_TREASURER: ['/admin', '/finance', '/reports'],
  GAVELIER_SECRETARY: ['/admin', '/events', '/minutes'],
  GAVELIER_VP_EDUCATION: ['/admin', '/education', '/workshops'],
  GAVELIER_VP_MEMBERSHIP: ['/admin', '/members', '/recruitment'],
  GAVELIER_VP_PR: ['/admin', '/pr', '/media'],
  T1_ADMIN: ['/admin', '/system', '/users', '/config'],
  T2_ADMIN: ['/admin', '/users', '/content'],
  T3_MANAGER: ['/admin', '/programs']
};

export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req });
    const isAuth = !!token;
    const role = token?.role || 'GUEST';
    const path = req.nextUrl.pathname;

    // Public routes that don't require authentication
    const publicRoutes = ['/', '/about', '/events', '/contact', '/schedule', '/login', '/signup', '/register'];
    if (publicRoutes.includes(path)) {
      return NextResponse.next();
    }

    // Check if user is authenticated
    if (!isAuth) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Check if user has access to the requested path
    const allowedPaths = roleAccess[role as keyof typeof roleAccess] || [];
    const hasAccess = allowedPaths.some(allowedPath => path.startsWith(allowedPath));

    if (!hasAccess) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
);

// Configure which routes to protect
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/projects/:path*',
    '/payments/:path*',
    '/events/:path*',
    '/announcements/:path*',
    '/members/:path*',
    '/finance/:path*',
    '/education/:path*',
    '/pr/:path*',
    '/system/:path*',
    '/users/:path*',
    '/config/:path*',
    '/programs/:path*'
  ],
};
