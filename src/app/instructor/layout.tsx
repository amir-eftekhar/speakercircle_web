'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { Navigation } from '@/components/navigation';

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    },
  });

  // Check if user is an instructor
  if (status === 'authenticated' && session?.user?.role !== 'INSTRUCTOR') {
    redirect('/');
  }

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        }
      >
        <main>{children}</main>
      </Suspense>
    </div>
  );
}
