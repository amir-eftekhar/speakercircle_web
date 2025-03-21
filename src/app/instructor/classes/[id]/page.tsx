'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, BookOpen, MessageSquare, FileText } from 'lucide-react';

type ClassDetails = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  schedule: string;
  location?: string;
  capacity: number;
  enrollmentCount: number;
};

type Student = {
  id: string;
  name: string;
  email: string;
};

export default function ClassDetailsPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch class details
        const classResponse = await fetch(`/api/classes/${params.id}`);
        if (!classResponse.ok) {
          throw new Error('Failed to fetch class details');
        }
        const classData = await classResponse.json();
        setClassDetails(classData.class);
        
        // Fetch enrolled students
        const studentsResponse = await fetch(`/api/classes/${params.id}/students`);
        if (!studentsResponse.ok) {
          throw new Error('Failed to fetch enrolled students');
        }
        const studentsData = await studentsResponse.json();
        setStudents(studentsData.students || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load class details');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchClassDetails();
    }
  }, [session, params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !classDetails) {
    return (
      <div className="container py-12">
        <div className="bg-destructive/10 p-4 rounded-md text-destructive">
          <p>{error || 'Class not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="space-y-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold">{classDetails.title}</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href={`/instructor/classes/${params.id}/materials`}>
                  <FileText className="mr-2 h-4 w-4" /> Materials
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/instructor/classes/${params.id}/announcements`}>
                  <MessageSquare className="mr-2 h-4 w-4" /> Announcements
                </Link>
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground mb-4">{classDetails.description}</p>
          
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Dates</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(classDetails.startDate).toLocaleDateString()}
                  {classDetails.endDate && ` - ${new Date(classDetails.endDate).toLocaleDateString()}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Schedule</p>
                <p className="text-sm text-muted-foreground">{classDetails.schedule}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Enrollment</p>
                <p className="text-sm text-muted-foreground">
                  {classDetails.enrollmentCount}/{classDetails.capacity} students
                </p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="students" className="space-y-6">
          <TabsList>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enrolled Students</CardTitle>
                <CardDescription>
                  Students currently enrolled in this class
                </CardDescription>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <p className="text-muted-foreground">No students enrolled yet.</p>
                ) : (
                  <div className="divide-y">
                    {students.map((student) => (
                      <div key={student.id} className="py-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/instructor/students/${student.id}`}>
                            View Profile
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Class Materials</CardTitle>
                <CardDescription>
                  Manage your teaching materials for this class
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Create and manage lessons, assignments, quizzes, and other resources for your students.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link href={`/instructor/classes/${params.id}/materials`}>
                    <FileText className="mr-2 h-4 w-4" /> View All Materials
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="announcements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Class Announcements</CardTitle>
                <CardDescription>
                  Post and manage announcements for your students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Keep your students informed about important updates, schedule changes, and other class-related information.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link href={`/instructor/classes/${params.id}/announcements`}>
                    <MessageSquare className="mr-2 h-4 w-4" /> View All Announcements
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
