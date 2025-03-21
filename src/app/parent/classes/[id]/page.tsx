'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, BookOpen, FileText, Video, Download, ExternalLink, Bell, MessageCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ClassDetails {
  id: string;
  title: string;
  description: string;
  instructor: string | null;
  instructorId?: string | null;
  instructorProfile?: {
    id: string;
    bio: string;
    profileImage?: string | null;
    user: {
      name: string;
      email: string;
    };
  } | null;
  startDate: string;
  endDate: string | null;
  schedule: string;
  location: string | null;
  level: string | null;
}

interface Enrollment {
  id: string;
  status: string;
  createdAt: string;
  studentId: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
}

interface CurriculumItem {
  id: string;
  title: string;
  description?: string;
  content?: string;
  type: string;
  fileUrl?: string;
  fileType?: string;
  date?: string;
  dueDate?: string;
  isPublic: boolean;
}

interface CurriculumItems {
  lectures: CurriculumItem[];
  readings: CurriculumItem[];
  videos: CurriculumItem[];
  assignments: CurriculumItem[];
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: string;
}

export default function ParentClassPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    },
  });

  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [curriculumItems, setCurriculumItems] = useState<CurriculumItems>({
    lectures: [],
    readings: [],
    videos: [],
    assignments: [],
  });
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [childId, setChildId] = useState<string | null>(null);
  const [childName, setChildName] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const childIdParam = searchParams.get('childId');
    const childNameParam = searchParams.get('childName');
    
    if (childIdParam) {
      setChildId(childIdParam);
      setChildName(childNameParam || 'your child');
    }
  }, []);

  useEffect(() => {
    if (session?.user?.id && childId) {
      fetchClassData();
    }
  }, [session?.user?.id, params.id, childId]);

  const fetchClassData = async () => {
    setLoading(true);
    try {
      // Fetch class details
      const classResponse = await fetch(`/api/classes/${params.id}`);
      const classData = await classResponse.json();
      
      if (!classResponse.ok) {
        throw new Error(classData.error || 'Failed to fetch class details');
      }
      
      setClassDetails(classData.class);
      
      // Fetch enrollment for the child
      const enrollmentResponse = await fetch(`/api/enrollments?classId=${params.id}&studentId=${childId}`);
      const enrollmentData = await enrollmentResponse.json();
      
      if (enrollmentResponse.ok && enrollmentData.enrollments?.length > 0) {
        setEnrollment(enrollmentData.enrollments[0]);
      } else {
        // If no enrollment is found, redirect to parent dashboard
        redirect('/parent/dashboard');
      }
      
      // Fetch curriculum items
      const curriculumResponse = await fetch(`/api/classes/${params.id}/curriculum`);
      const curriculumData = await curriculumResponse.json();
      
      if (curriculumResponse.ok) {
        // Filter curriculum items to only show public ones
        const publicItems = {
          lectures: curriculumData.items.lectures.filter((item: CurriculumItem) => item.isPublic),
          readings: curriculumData.items.readings.filter((item: CurriculumItem) => item.isPublic),
          videos: curriculumData.items.videos.filter((item: CurriculumItem) => item.isPublic),
          assignments: curriculumData.items.assignments.filter((item: CurriculumItem) => item.isPublic),
        };
        setCurriculumItems(publicItems);
      }
      
      // Fetch announcements
      const announcementsResponse = await fetch(`/api/classes/${params.id}/announcements`);
      const announcementsData = await announcementsResponse.json();
      
      if (announcementsResponse.ok) {
        setAnnouncements(announcementsData.announcements || []);
      }
      
    } catch (error: any) {
      console.error('Error fetching class data:', error);
      setError(error.message || 'Failed to load class data');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start mb-6">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          <span>{error}</span>
        </div>
        <Button variant="outline" asChild>
          <Link href="/parent/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  if (!classDetails) {
    return (
      <div className="container py-8">
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-md flex items-start mb-6">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          <span>Class not found or you don't have access to view it.</span>
        </div>
        <Button variant="outline" asChild>
          <Link href="/parent/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center mb-2">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link href="/parent/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          Viewing as Parent
        </Badge>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{classDetails.title}</h1>
          {childName && (
            <p className="text-muted-foreground mt-1">
              Viewing {childName}'s class materials
            </p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Class Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>{classDetails.description}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Dates</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(classDetails.startDate).toLocaleDateString()} - 
                      {classDetails.endDate ? new Date(classDetails.endDate).toLocaleDateString() : 'Ongoing'}
                    </p>
                  </div>
                </div>
                
                {classDetails.schedule && (
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Schedule</p>
                      <p className="text-sm text-muted-foreground">{classDetails.schedule}</p>
                    </div>
                  </div>
                )}
                
                {classDetails.location && (
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{classDetails.location}</p>
                    </div>
                  </div>
                )}
                
                {classDetails.level && (
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Level</p>
                      <p className="text-sm text-muted-foreground">{classDetails.level}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Instructor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={classDetails.instructorProfile?.profileImage || ''} />
                <AvatarFallback>
                  {classDetails.instructorProfile?.user.name?.charAt(0) || 
                   classDetails.instructor?.charAt(0) || 'I'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {classDetails.instructorProfile?.user.name || classDetails.instructor || 'TBA'}
                </p>
                {classDetails.instructorProfile?.user.email && (
                  <p className="text-sm text-muted-foreground">
                    {classDetails.instructorProfile.user.email}
                  </p>
                )}
              </div>
            </div>
            {classDetails.instructorProfile?.bio && (
              <div className="mt-4">
                <p className="text-sm">{classDetails.instructorProfile.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="announcements" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="announcements">
            <Bell className="h-4 w-4 mr-2" />
            Announcements
          </TabsTrigger>
          <TabsTrigger value="materials">
            <BookOpen className="h-4 w-4 mr-2" />
            Materials
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="announcements">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Class Announcements</h2>
            
            {announcements.length === 0 ? (
              <div className="bg-muted rounded-lg p-6 text-center">
                <p className="text-muted-foreground">No announcements have been posted yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map(announcement => (
                  <Card key={announcement.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{announcement.title}</CardTitle>
                        <span className="text-xs text-muted-foreground">
                          {new Date(announcement.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <CardDescription>
                        Posted by {announcement.author}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap">{announcement.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="materials">
          <div className="space-y-8">
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md flex items-start mb-6">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
              <div>
                <p className="font-medium">Parent View Restrictions</p>
                <p className="text-sm">As a parent, you can only view public materials. Some content may be restricted to students only.</p>
              </div>
            </div>
            
            {/* Lectures Section */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Lectures</h2>
              {curriculumItems.lectures.length === 0 ? (
                <div className="bg-muted rounded-lg p-6 text-center">
                  <p className="text-muted-foreground">No lecture materials available.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {curriculumItems.lectures.map(item => (
                    <Card key={item.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        {item.date && (
                          <CardDescription>
                            Date: {new Date(item.date).toLocaleDateString()}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        {item.description && <p className="text-sm mb-4">{item.description}</p>}
                        {item.fileUrl && (
                          <Button variant="outline" size="sm" asChild className="w-full">
                            <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </a>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            
            {/* Readings Section */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Readings</h2>
              {curriculumItems.readings.length === 0 ? (
                <div className="bg-muted rounded-lg p-6 text-center">
                  <p className="text-muted-foreground">No reading materials available.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {curriculumItems.readings.map(item => (
                    <Card key={item.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {item.description && <p className="text-sm mb-4">{item.description}</p>}
                        {item.fileUrl && (
                          <Button variant="outline" size="sm" asChild className="w-full">
                            <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                              <FileText className="h-4 w-4 mr-2" />
                              View Document
                            </a>
                          </Button>
                        )}
                        {item.content && !item.fileUrl && (
                          <div className="bg-muted p-4 rounded-md">
                            <p className="text-sm whitespace-pre-wrap">{item.content}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            
            {/* Videos Section */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Videos</h2>
              {curriculumItems.videos.length === 0 ? (
                <div className="bg-muted rounded-lg p-6 text-center">
                  <p className="text-muted-foreground">No video materials available.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {curriculumItems.videos.map(item => (
                    <Card key={item.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {item.description && <p className="text-sm mb-4">{item.description}</p>}
                        {item.fileUrl && (
                          <Button variant="outline" size="sm" asChild className="w-full">
                            <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                              <Video className="h-4 w-4 mr-2" />
                              Watch Video
                            </a>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            
            {/* Assignments Section */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Assignments</h2>
              {curriculumItems.assignments.length === 0 ? (
                <div className="bg-muted rounded-lg p-6 text-center">
                  <p className="text-muted-foreground">No assignments available.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {curriculumItems.assignments.map(item => (
                    <Card key={item.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        {item.dueDate && (
                          <CardDescription className="text-amber-600">
                            Due: {new Date(item.dueDate).toLocaleDateString()}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        {item.description && <p className="text-sm mb-4">{item.description}</p>}
                        {item.fileUrl && (
                          <Button variant="outline" size="sm" asChild className="w-full">
                            <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4 mr-2" />
                              Download Assignment
                            </a>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
