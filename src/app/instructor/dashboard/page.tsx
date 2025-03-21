'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, BookOpen, Clipboard, AlertCircle, FileText, CheckSquare } from 'lucide-react';

type Class = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  location?: string;
  enrollmentCount?: number;
  capacity: number;
  isActive?: boolean;
  instructor?: string;
  instructorId?: string;
};

type UpcomingSession = {
  id: string;
  title: string;
  date: string;
  time: string;
  classId: string;
  className: string;
};

export default function InstructorDashboardPage() {
  const { data: session } = useSession();
  const [classes, setClasses] = useState<Class[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstructorData = async () => {
      try {
        setLoading(true);
        // Fetch classes taught by this instructor
        const classesResponse = await fetch('/api/instructor/classes');
        
        if (!classesResponse.ok) {
          throw new Error('Failed to fetch classes');
        }
        
        const classesData = await classesResponse.json();
        console.log('Classes data:', classesData);
        setClasses(classesData.classes || []);
        
        // Fetch upcoming sessions
        const sessionsResponse = await fetch('/api/instructor/sessions');
        
        if (!sessionsResponse.ok) {
          throw new Error('Failed to fetch upcoming sessions');
        }
        
        const sessionsData = await sessionsResponse.json();
        console.log('Sessions data:', sessionsData);
        setUpcomingSessions(sessionsData.sessions || []);
      } catch (error) {
        console.error('Error fetching instructor data:', error);
        setError('Failed to load your instructor data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchInstructorData();
    }
  }, [session]);

  if (loading) {
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
          <h1 className="text-4xl font-bold mb-2">Instructor Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session?.user?.name}
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="classes">My Classes</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="submissions">Student Submissions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{classes.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {classes.reduce((total, cls) => total + (cls.enrollmentCount || 0), 0)}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{upcomingSessions.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
                <CardDescription>Your scheduled teaching sessions for the next 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                {error ? (
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    <span>{error}</span>
                  </div>
                ) : upcomingSessions.length === 0 ? (
                  <p className="text-muted-foreground">No upcoming sessions scheduled.</p>
                ) : (
                  <div className="space-y-4">
                    {upcomingSessions.slice(0, 5).map((session) => (
                      <div key={session.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                        <div className="space-y-1">
                          <div className="font-medium">{session.title}</div>
                          <div className="text-sm text-muted-foreground">{session.className}</div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{new Date(session.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{session.time}</span>
                            </div>
                          </div>
                        </div>
                        <Link href={`/instructor/sessions/${session.id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Link href="/instructor/schedule">
                  <Button variant="outline">View All Sessions</Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2">
              <Link href="/instructor/materials/create">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2 items-center justify-center">
                  <FileText className="h-6 w-6" />
                  <span>Create New Material</span>
                </Button>
              </Link>
              <Link href="/instructor/announcements/create">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2 items-center justify-center">
                  <Clipboard className="h-6 w-6" />
                  <span>Post Announcement</span>
                </Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="classes" className="space-y-6">
            {error ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    Error
                  </CardTitle>
                  <CardDescription>{error}</CardDescription>
                </CardHeader>
              </Card>
            ) : classes.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Classes Found</CardTitle>
                  <CardDescription>
                    You are not currently assigned to teach any classes. Please contact an administrator to be assigned to a class.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {classes.map((cls) => (
                  <Card key={cls.id} className="hover-card-shadow">
                    <CardHeader>
                      <CardTitle className="text-xl">{cls.title || 'Untitled Class'}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {cls.description || 'No description available'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {cls.startDate ? new Date(cls.startDate).toLocaleDateString() : 'Date not set'}
                            {cls.endDate && ` - ${new Date(cls.endDate).toLocaleDateString()}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {typeof cls.enrollmentCount === 'number' ? cls.enrollmentCount : 0}/
                            {typeof cls.capacity === 'number' ? cls.capacity : 'N/A'} students
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{cls.isActive !== false ? 'Active' : 'Inactive'}</Badge>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Link href={`/instructor/classes/${cls.id}`} className="flex-1">
                        <Button variant="default" className="w-full">View</Button>
                      </Link>
                      <Link href={`/instructor/classes/${cls.id}/materials`} className="flex-1">
                        <Button variant="outline" className="w-full">Materials</Button>
                      </Link>
                      <Link href={`/instructor/classes/${cls.id}/announcements`} className="flex-1">
                        <Button variant="outline" className="w-full">Announcements</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}

            {/* No create class button as instructors can't create classes */}
          </TabsContent>

          <TabsContent value="materials" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Materials</CardTitle>
                <CardDescription>Create and manage your educational content</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Create lessons, quizzes, and assignments for your classes. Organize your content and track student progress.
                </p>
                <div className="grid gap-4 md:grid-cols-3">
                  <Link href="/instructor/materials?type=lesson">
                    <Button variant="outline" className="w-full h-24 flex flex-col gap-2 items-center justify-center">
                      <BookOpen className="h-6 w-6" />
                      <span>Lessons</span>
                    </Button>
                  </Link>
                  <Link href="/instructor/materials?type=quiz">
                    <Button variant="outline" className="w-full h-24 flex flex-col gap-2 items-center justify-center">
                      <Clipboard className="h-6 w-6" />
                      <span>Quizzes</span>
                    </Button>
                  </Link>
                  <Link href="/instructor/materials?type=assignment">
                    <Button variant="outline" className="w-full h-24 flex flex-col gap-2 items-center justify-center">
                      <FileText className="h-6 w-6" />
                      <span>Assignments</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/instructor/materials/create">
                  <Button>Create New Material</Button>
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="submissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Submissions</CardTitle>
                <CardDescription>Review and grade student assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  View, review, and grade assignments submitted by your students. Provide feedback and track student progress.
                </p>
                {error ? (
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    <span>{error}</span>
                  </div>
                ) : (
                  <div className="divide-y rounded-md border">
                    <div className="p-4 text-center text-muted-foreground">
                      No pending submissions to review.
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Link href="/instructor/submissions">
                  <Button variant="outline">View All Submissions</Button>
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
