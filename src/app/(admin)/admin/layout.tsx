'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  Settings,
  Bell,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  LogOut,
  BookOpen,
  FileText,
  Image,
  Globe,
  Share2,
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';

const sidebarLinks = [
  // Main section
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    category: 'main',
  },
  
  // Content section
  {
    title: 'Classes',
    href: '/admin/classes',
    icon: BookOpen,
    category: 'content',
  },
  {
    title: 'Events',
    href: '/admin/events',
    icon: Calendar,
    category: 'content',
  },
  {
    title: 'Gallery',
    href: '/admin/gallery',
    icon: Image,
    category: 'content',
  },
  
  // Users section
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
    category: 'users',
  },
  {
    title: 'Enrollments',
    href: '/admin/enrollments',
    icon: FileText,
    category: 'users',
  },
  
  // Communication section
  {
    title: 'Social Media',
    href: '/admin/social-media',
    icon: Share2,
    category: 'top', // Special category to make it appear at the top
  },
  {
    title: 'Announcements',
    href: '/admin/announcements',
    icon: Bell,
    category: 'communication',
  },
  {
    title: 'Newsletter',
    href: '/admin/newsletter',
    icon: MessageSquare,
    category: 'communication',
  },
  
  // System section
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    category: 'system',
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { theme } = useTheme();
  
  // Protect admin routes
  useEffect(() => {
    // Check if the user has any admin role (T1_ADMIN, T2_ADMIN, or T3_MANAGER)
    const isAdmin = session?.user?.role === 'T1_ADMIN' || 
                    session?.user?.role === 'T2_ADMIN' || 
                    session?.user?.role === 'T3_MANAGER';
                    
    if (status === 'authenticated' && !isAdmin) {
      redirect('/');
    }
    if (status === 'unauthenticated') {
      redirect('/login?callbackUrl=/admin');
    }
  }, [session, status]);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);
  
  // Close mobile menu when screen size increases
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-full p-2 bg-background shadow-md hover:bg-accent transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-6 w-6 text-foreground" />
          ) : (
            <Menu className="h-6 w-6 text-foreground" />
          )}
        </button>
      </div>
      
      {/* Sidebar - Desktop */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen border-r border-border bg-background shadow-sm',
          collapsed ? 'w-20' : 'w-72',
          'transition-all duration-300 ease-in-out hidden lg:block'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-4 py-4 border-b border-border">
            {!collapsed && (
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold mr-2">
                  SC
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Admin Portal
                </span>
              </div>
            )}
            {collapsed && (
              <div className="h-8 w-8 mx-auto rounded-md bg-primary flex items-center justify-center text-white font-bold">
                SC
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="rounded-lg p-1.5 hover:bg-accent transition-colors"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </div>
          
          <nav className="flex-1 space-y-10 px-3 py-6 overflow-y-auto">
            {/* Social Media - Special Top Item */}
            <div>
              <div className="space-y-4">
                {sidebarLinks
                  .filter(link => link.category === 'top')
                  .map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          'flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-all',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:bg-accent',
                          collapsed ? 'justify-center' : '',
                          'group'
                        )}
                      >
                        <div className={cn(
                          'flex items-center justify-center',
                          isActive 
                            ? 'text-primary-foreground' 
                            : 'text-muted-foreground group-hover:text-foreground',
                          collapsed ? 'w-10 h-10' : 'w-10 h-10 mr-3'
                        )}>
                          <Icon className={cn(
                            'h-5 w-5',
                            isActive && 'stroke-[2.5px]'
                          )} />
                        </div>
                        {!collapsed && <span className="font-semibold">{link.title}</span>}
                        {!collapsed && isActive && (
                          <div className="ml-auto h-2 w-2 rounded-full bg-primary-foreground"></div>
                        )}
                      </Link>
                    );
                  })}
              </div>
            </div>
            
            {/* Main Navigation */}
            <div>
              {!collapsed && <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">Main</div>}
              <div className="space-y-4">
                {sidebarLinks
                  .filter(link => link.category === 'main')
                  .map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          'flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-foreground hover:bg-accent',
                          collapsed ? 'justify-center' : '',
                          'group'
                        )}
                      >
                        <div className={cn(
                          'flex items-center justify-center',
                          isActive 
                            ? 'text-primary' 
                            : 'text-muted-foreground group-hover:text-foreground',
                          collapsed ? 'w-10 h-10' : 'w-10 h-10 mr-3'
                        )}>
                          <Icon className={cn(
                            'h-5 w-5',
                            isActive && 'stroke-[2.5px]'
                          )} />
                        </div>
                        {!collapsed && <span>{link.title}</span>}
                        {!collapsed && isActive && (
                          <div className="ml-auto h-2 w-2 rounded-full bg-primary"></div>
                        )}
                      </Link>
                    );
                  })}
              </div>
            </div>

            {/* Content Management */}
            <div>
              {!collapsed && <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">Content</div>}
              <div className="space-y-4">
                {sidebarLinks
                  .filter(link => link.category === 'content')
                  .map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          'flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-foreground hover:bg-accent',
                          collapsed ? 'justify-center' : '',
                          'group'
                        )}
                      >
                        <div className={cn(
                          'flex items-center justify-center',
                          isActive 
                            ? 'text-primary' 
                            : 'text-muted-foreground group-hover:text-foreground',
                          collapsed ? 'w-10 h-10' : 'w-10 h-10 mr-3'
                        )}>
                          <Icon className={cn(
                            'h-5 w-5',
                            isActive && 'stroke-[2.5px]'
                          )} />
                        </div>
                        {!collapsed && <span>{link.title}</span>}
                        {!collapsed && isActive && (
                          <div className="ml-auto h-2 w-2 rounded-full bg-primary"></div>
                        )}
                      </Link>
                    );
                  })}
              </div>
            </div>

            {/* User Management */}
            <div>
              {!collapsed && <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">Users</div>}
              <div className="space-y-4">
                {sidebarLinks
                  .filter(link => link.category === 'users')
                  .map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          'flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-foreground hover:bg-accent',
                          collapsed ? 'justify-center' : '',
                          'group'
                        )}
                      >
                        <div className={cn(
                          'flex items-center justify-center',
                          isActive 
                            ? 'text-primary' 
                            : 'text-muted-foreground group-hover:text-foreground',
                          collapsed ? 'w-10 h-10' : 'w-10 h-10 mr-3'
                        )}>
                          <Icon className={cn(
                            'h-5 w-5',
                            isActive && 'stroke-[2.5px]'
                          )} />
                        </div>
                        {!collapsed && <span>{link.title}</span>}
                        {!collapsed && isActive && (
                          <div className="ml-auto h-2 w-2 rounded-full bg-primary"></div>
                        )}
                      </Link>
                    );
                  })}
              </div>
            </div>

            {/* Communication */}
            <div>
              {!collapsed && <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">Communication</div>}
              <div className="space-y-4">
                {sidebarLinks
                  .filter(link => link.category === 'communication')
                  .map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          'flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-foreground hover:bg-accent',
                          collapsed ? 'justify-center' : '',
                          'group'
                        )}
                      >
                        <div className={cn(
                          'flex items-center justify-center',
                          isActive 
                            ? 'text-primary' 
                            : 'text-muted-foreground group-hover:text-foreground',
                          collapsed ? 'w-10 h-10' : 'w-10 h-10 mr-3'
                        )}>
                          <Icon className={cn(
                            'h-5 w-5',
                            isActive && 'stroke-[2.5px]'
                          )} />
                        </div>
                        {!collapsed && <span>{link.title}</span>}
                        {!collapsed && isActive && (
                          <div className="ml-auto h-2 w-2 rounded-full bg-primary"></div>
                        )}
                      </Link>
                    );
                  })}
              </div>
            </div>

            {/* System */}
            <div>
              {!collapsed && <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">System</div>}
              <div className="space-y-4">
                {sidebarLinks
                  .filter(link => link.category === 'system')
                  .map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          'flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-foreground hover:bg-accent',
                          collapsed ? 'justify-center' : '',
                          'group'
                        )}
                      >
                        <div className={cn(
                          'flex items-center justify-center',
                          isActive 
                            ? 'text-primary' 
                            : 'text-muted-foreground group-hover:text-foreground',
                          collapsed ? 'w-10 h-10' : 'w-10 h-10 mr-3'
                        )}>
                          <Icon className={cn(
                            'h-5 w-5',
                            isActive && 'stroke-[2.5px]'
                          )} />
                        </div>
                        {!collapsed && <span>{link.title}</span>}
                        {!collapsed && isActive && (
                          <div className="ml-auto h-2 w-2 rounded-full bg-primary"></div>
                        )}
                      </Link>
                    );
                  })}
              </div>
            </div>
          </nav>
          
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className={cn(
              'flex items-center',
              collapsed ? 'justify-center' : 'justify-between'
            )}>
              {!collapsed && session?.user?.name && (
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                    <span className="text-sm font-medium text-foreground">
                      {session.user.name.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-foreground">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground">Admin</p>
                  </div>
                </div>
              )}
              <Link href="/api/auth/signout" className="p-2 rounded-lg hover:bg-accent text-muted-foreground">
                <LogOut className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Sidebar - Mobile */}
      <div className={cn(
        "fixed inset-0 bg-foreground/30 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-200",
        mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <aside className={cn(
          "fixed left-0 top-0 z-40 h-screen w-72 bg-background shadow-xl transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center justify-between px-4 py-4 border-b border-border">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold mr-2">
                  SC
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Admin Portal
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 hover:bg-accent"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            
            <nav className="flex-1 space-y-1 px-3 py-6 overflow-y-auto">
              <div className="space-y-2">
                {sidebarLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground hover:bg-accent',
                        'group'
                      )}
                    >
                      <div className={cn(
                        'flex items-center justify-center w-10 h-10 mr-3',
                        isActive 
                          ? 'text-primary' 
                          : 'text-muted-foreground group-hover:text-foreground'
                      )}>
                        <Icon className={cn(
                          'h-5 w-5',
                          isActive && 'stroke-[2.5px]'
                        )} />
                      </div>
                      <span>{link.title}</span>
                      {isActive && (
                        <div className="ml-auto h-2 w-2 rounded-full bg-primary"></div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </nav>
            
            <div className="border-t border-border p-4">
              <div className="flex items-center justify-between">
                {session?.user?.name && (
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                      <span className="text-sm font-medium text-foreground">
                        {session.user.name.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-foreground">{session.user.name}</p>
                      <p className="text-xs text-muted-foreground">Admin</p>
                    </div>
                  </div>
                )}
                <Link href="/api/auth/signout" className="p-2 rounded-lg hover:bg-accent text-muted-foreground">
                  <LogOut className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Main content */}
      <main
        className={cn(
          'min-h-screen transition-all duration-300',
          collapsed ? 'lg:pl-20' : 'lg:pl-72',
          'pt-16 lg:pt-0'
        )}
      >
        {/* Top navigation bar */}
        <div className="sticky top-0 z-30 flex h-16 items-center border-b border-border bg-background/95 backdrop-blur px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex w-full items-center justify-between">
            <h2 className="text-lg font-semibold">
              {sidebarLinks.find(link => pathname.startsWith(link.href))?.title || 'Admin'}
            </h2>
            <nav className="flex items-center space-x-4">
              <Link 
                href="/"
                className="rounded-full h-8 w-8 flex items-center justify-center hover:bg-accent transition-colors"
                title="Visit website"
              >
                <Globe className="h-4 w-4" />
                <span className="sr-only">Visit website</span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="rounded-full h-8 w-8 flex items-center justify-center hover:bg-accent transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Sign out</span>
              </button>
            </nav>
          </div>
        </div>
        
        <div className="w-full p-6">
          <div className="bg-card rounded-xl shadow-sm border border-border p-6 text-card-foreground">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
