'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, User, BookOpen, AlertCircle } from 'lucide-react';

type ClassEnrollment = {
  id: string;
  status: string;
  createdAt: string;
  class: {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate?: string;
    location: string;
    instructor: {
      name: string;
    };
  };
};

export default function StudentClassesPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    },
  });

  const [enrollments, setEnrollments] = useState<ClassEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/user/enrollments');
        const data = await response.json();

        if (response.ok) {
          setEnrollments(data.enrollments || []);
        } else {
          throw new Error(data.error || 'Failed to fetch enrollments');
        }
      } catch (error) {
        console.error('Error fetching enrollments:', error);
        setError('Failed to load your class enrollments');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchEnrollments();
    }
  }, [session]);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">My Classes</h1>
          <p className="text-muted-foreground">
            View and manage your enrolled classes
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Error
              </CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
          </Card>
        ) : enrollments.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Not registered for any classes</CardTitle>
              <CardDescription>
                You are not currently enrolled in any classes. Browse our available classes to get started.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href="/classes">
                <Button>Browse Classes</Button>
              </Link>
            </CardFooter>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((enrollment) => (
              <Card key={enrollment.id} className="hover-card-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{enrollment.class.title}</CardTitle>
                    <Badge variant={enrollment.status === 'ACTIVE' ? 'default' : 'outline'}>
                      {enrollment.status === 'ACTIVE' ? 'Active' : 'Pending'}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {enrollment.class.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(enrollment.class.startDate).toLocaleDateString()}
                        {enrollment.class.endDate && ` - ${new Date(enrollment.class.endDate).toLocaleDateString()}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{enrollment.class.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{enrollment.class.instructor?.name || 'TBA'}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/student/classes/${enrollment.class.id}`} className="w-full">
                    <Button variant="outline" className="w-full gap-2">
                      <BookOpen className="h-4 w-4" />
                      View Class
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
