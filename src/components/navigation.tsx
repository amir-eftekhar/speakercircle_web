'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { useTheme } from 'next-themes';
import { Menu, X, Sun, Moon, Home, Info, Calendar, Mail, BookOpen, LogIn, UserPlus, LogOut, User, Image as ImageIcon, Share2, UserCircle } from 'lucide-react';
import { NotificationBell } from './notifications/notification-bell';
import { useSession, signOut } from 'next-auth/react';
// Define the Role type based on the Prisma schema
type Role = 'STUDENT' | 'PARENT' | 'MENTOR' | 'INSTRUCTOR' | 'ADMIN' | 'T1_ADMIN' | 'T2_ADMIN' | 'T3_MANAGER' | 'GAVELIER_PRESIDENT' | 'GAVELIER_TREASURER' | 'GAVELIER_SECRETARY' | 'GAVELIER_VP_EDUCATION' | 'GAVELIER_VP_MEMBERSHIP' | 'GAVELIER_VP_PR' | 'GUEST';

// Helper function to get dashboard link based on user role
const getDashboardLink = (role: Role | undefined) => {
  if (!role) return '/dashboard';
  
  switch (role) {
    case 'ADMIN':
    case 'T1_ADMIN':
    case 'T2_ADMIN':
      return '/admin';
    case 'PARENT':
      return '/parent/dashboard';
    case 'STUDENT':
      return '/student/dashboard';
    case 'INSTRUCTOR':
      return '/instructor/dashboard';
    case 'MENTOR':
      return '/mentor/dashboard';
    default:
      return '/dashboard';
  }
};

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'About', href: '/about', icon: Info },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Gallery', href: '/gallery', icon: ImageIcon },
  { name: 'Social Media', href: '/social-media', icon: Share2 },
  { name: 'Contact', href: '/contact', icon: Mail },
  { name: 'Class Schedule', href: '/classes', icon: BookOpen },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  // Fix hydration mismatch by only rendering after component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // If not mounted yet, return null to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="w-full mx-auto">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-3">
                <div className="flex items-center">
                  <Image
                    src="/logo.png"
                    alt="Speaker's Circle Logo"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div className="ml-3 flex flex-col">
                    <span className="font-bold text-base leading-none">Speaker's</span>
                    <span className="font-bold text-base leading-none mt-0.5">Circle</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center justify-center flex-1 px-4 lg:px-8">
              <div className="flex items-center justify-between w-full">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'inline-flex items-center space-x-2 text-sm font-medium transition-colors hover:text-foreground/80',
                        pathname === item.href ? 'text-foreground' : 'text-foreground/60'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Right side buttons */}
            <div className="flex items-center space-x-2">
              {/* Notification Bell (only for logged in users) */}
              {session && <NotificationBell />}

              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              {/* Desktop auth buttons */}
              <div className="hidden md:flex items-center space-x-2">
                {session ? (
                  <>
                    <Link href={getDashboardLink(session.user.role)}>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <User className="h-4 w-4" />
                        {session.user.role === 'ADMIN' || session.user.role === 'T1_ADMIN' || session.user.role === 'T2_ADMIN' ? "Admin" : "Dashboard"}
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2" 
                      onClick={() => signOut({ callbackUrl: '/' })}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <LogIn className="h-4 w-4" />
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button size="sm" className="gap-2">
                        <UserPlus className="h-4 w-4" />
                        Join Now
                      </Button>
                    </Link>
                    <Link href="/contact">
                      <Button variant="outline" size="sm" className="gap-2">
                        <UserCircle className="h-4 w-4" />
                        Become a Mentor
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="flex md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Menu className="h-4 w-4" />
                  )}
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-6">
              <nav className="space-y-3">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center space-x-2 px-6 py-3 text-sm font-medium rounded-md transition-colors hover:bg-accent',
                        pathname === item.href ? 'bg-accent' : 'transparent'
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                {session ? (
                  <>
                    <Link
                      href={getDashboardLink(session.user.role)}
                      className="flex items-center space-x-2 px-6 py-3 text-sm font-medium rounded-md transition-colors hover:bg-accent"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>{session.user.role === 'ADMIN' || session.user.role === 'T1_ADMIN' || session.user.role === 'T2_ADMIN' ? "Admin" : "Dashboard"}</span>
                    </Link>
                    <button
                      className="flex items-center space-x-2 px-6 py-3 text-sm font-medium rounded-md transition-colors hover:bg-accent w-full text-left"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="flex items-center space-x-2 px-6 py-3 text-sm font-medium rounded-md transition-colors hover:bg-accent"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Sign In</span>
                    </Link>
                    <Link
                      href="/signup"
                      className="flex items-center space-x-2 px-6 py-3 text-sm font-medium rounded-md transition-colors hover:bg-accent"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Join Now</span>
                    </Link>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
