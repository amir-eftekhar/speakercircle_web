import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Sidebar } from '@/components/sidebar';
import { SidebarNav } from '@/components/sidebar-nav';
import { BookOpen, User, Calendar, MessageSquare, Users, Settings } from 'lucide-react';

interface MentorLayoutProps {
  children: ReactNode;
}

export default async function MentorLayout({ children }: MentorLayoutProps) {
  const session = await getServerSession(authOptions);
  
  // Redirect if not logged in or not a mentor
  if (!session || session.user.role !== 'MENTOR') {
    redirect('/login?callbackUrl=/mentor');
  }
  
  const sidebarNavItems = [
    {
      title: 'Dashboard',
      href: '/mentor',
      icon: <BookOpen className="mr-2 h-4 w-4" />,
    },
    {
      title: 'Profile',
      href: '/mentor/profile',
      icon: <User className="mr-2 h-4 w-4" />,
    },
    {
      title: 'Curriculum',
      href: '/mentor/curriculum',
      icon: <BookOpen className="mr-2 h-4 w-4" />,
    },
    {
      title: 'Schedule',
      href: '/mentor/schedule',
      icon: <Calendar className="mr-2 h-4 w-4" />,
    },
    {
      title: 'Messages',
      href: '/mentor/messages',
      icon: <MessageSquare className="mr-2 h-4 w-4" />,
    },
    {
      title: 'Students',
      href: '/mentor/students',
      icon: <Users className="mr-2 h-4 w-4" />,
    },
    {
      title: 'Settings',
      href: '/mentor/settings',
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
  ];
  
  return (
    <div className="flex min-h-screen">
      <Sidebar>
        <div className="py-4 px-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Mentor Portal
          </h2>
          <SidebarNav items={sidebarNavItems} />
        </div>
      </Sidebar>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
