'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, BookOpen, FileText, Video, Download, ExternalLink, Bell, MessageCircle, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  status?: string;
  duration?: string;
  url?: string;
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

interface Message {
  id: string;
  content: string;
  createdAt: string;
  user: {
    name: string;
    role: string;
  };
}

export default function StudentClassPage({ params }: { params: { id: string } }) {
  const unwrappedParams = use(params as any) as { id: string };
  const classId = unwrappedParams.id;
  
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    },
  });

  const [classData, setClassData] = useState<ClassDetails | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Define these useState hooks before conditional returns to maintain hook order
  const [curriculumItems, setCurriculumItems] = useState<CurriculumItems>({
    lectures: [],
    readings: [],
    videos: [],
    assignments: []
  });
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Move this useEffect before conditional returns to maintain hook order
  useEffect(() => {
    // Fetch curriculum items for this class
    async function fetchCurriculumItems() {
      try {
        const response = await fetch(`/api/classes/${classId}/curriculum`);
        if (response.ok) {
          const data = await response.json();
          // Organize items by type
          const lectures = data.items.filter((item: any) => item.type === 'LECTURE');
          const readings = data.items.filter((item: any) => item.type === 'READING');
          const videos = data.items.filter((item: any) => item.type === 'VIDEO');
          const assignments = data.items.filter((item: any) => item.type === 'ASSIGNMENT');
          
          setCurriculumItems({
            lectures,
            readings,
            videos,
            assignments
          });
        }
      } catch (error) {
        console.error('Error fetching curriculum items:', error);
      }
    }
    
    // Fetch class announcements
    async function fetchAnnouncements() {
      try {
        const response = await fetch(`/api/classes/${classId}/announcements`);
        if (response.ok) {
          const data = await response.json();
          setAnnouncements(data.announcements);
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    }
    
    // Fetch class messages
    async function fetchMessages() {
      try {
        const response = await fetch(`/api/classes/${classId}/messages`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    }
    
    fetchCurriculumItems();
    fetchAnnouncements();
    fetchMessages();
  }, [classId]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch class data
        const classResponse = await fetch(`/api/classes/${classId}`);
        if (!classResponse.ok) {
          setError('Class not found');
          setLoading(false);
          return;
        }
        
        const classData = await classResponse.json();
        setClassData(classData);

        // Check enrollment status
        if (session?.user?.id) {
          const enrollmentsResponse = await fetch('/api/user/enrollments');
          if (enrollmentsResponse.ok) {
            const { enrollments } = await enrollmentsResponse.json();
            const existingEnrollment = enrollments.find(
              (e: any) => e.class.id === classId
            );
            
            if (existingEnrollment) {
              setEnrollment(existingEnrollment);
            } else {
              // If not enrolled, redirect to class page
              redirect(`/classes/${classId}`);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load class details');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [classId, session?.user?.id]);

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center py-12">
          <h3 className="text-xl font-medium">Error</h3>
          <p className="mt-2 text-muted-foreground">{error || 'Class not found'}</p>
          <Link href="/student/dashboard" className="mt-4 inline-block text-primary hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  // Second useEffect moved before conditional returns
  
  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      const response = await fetch(`/api/classes/${classId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          classId: classId,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages([...messages, data.message]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  // Use the actual data from the API
  const lectures = curriculumItems.lectures;
  const readings = curriculumItems.readings;
  const videos = curriculumItems.videos;
  const assignments = curriculumItems.assignments;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div>
          <Link href="/student/dashboard" className="inline-flex items-center text-primary hover:underline mb-2">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">{classData.title}</h1>
          {classData.instructor && (
            <p className="text-lg text-muted-foreground mt-1">Instructor: {classData.instructor}</p>
          )}
        </div>
        
        {enrollment && (
          <div className="mt-4 md:mt-0 flex flex-col items-end gap-2">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              {enrollment.status === 'TEST' ? 'Test Registration' : 'Enrolled'}
            </div>
            {classData.instructorProfile && (
              <div className="flex items-center gap-2 text-sm">
                <Avatar className="h-8 w-8">
                  {classData.instructorProfile.profileImage ? (
                    <AvatarImage src={classData.instructorProfile.profileImage} alt="Instructor" />
                  ) : (
                    <AvatarFallback>{classData.instructorProfile.user.name.charAt(0)}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="font-medium">Instructor: {classData.instructorProfile.user.name}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="grid md:grid-cols-[1fr,300px] gap-8">
        <div>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="announcements">Announcements</TabsTrigger>
              <TabsTrigger value="materials">Materials</TabsTrigger>
              <TabsTrigger value="discussions">Discussions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Course Overview</CardTitle>
                  <CardDescription>
                    {classData.level && `Level: ${classData.level}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p>{classData.description}</p>
                    
                    <h3 className="text-lg font-medium mt-6 mb-3">Schedule</h3>
                    <div className="flex items-center mb-2">
                      <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                      <span>Start Date: {formatDate(classData.startDate)}</span>
                    </div>
                    {classData.endDate && (
                      <div className="flex items-center mb-2">
                        <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span>End Date: {formatDate(classData.endDate)}</span>
                      </div>
                    )}
                    <div className="flex items-center mb-2">
                      <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                      <span>{classData.schedule}</span>
                    </div>
                    {classData.location && (
                      <div className="flex items-center mb-2">
                        <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span>{classData.location}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Upcoming Sessions</h3>
                <div className="space-y-4">
                  {lectures.map(lecture => (
                    <Card key={lecture.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{lecture.title}</CardTitle>
                        <CardDescription>
                          {lecture.date ? formatDate(lecture.date) : 'Date not set'}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter>
                        <Button variant="outline" size="sm">View Details</Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="materials">
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Lecture Notes
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {lectures.map(lecture => (
                      <Card key={lecture.id}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{lecture.title}</CardTitle>
                          <CardDescription>
                            {lecture.date ? formatDate(lecture.date) : 'Date not set'}
                          </CardDescription>
                        </CardHeader>
                        <CardFooter>
                          <Button variant="outline" size="sm" className="mr-2">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Readings
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {readings.map(reading => (
                      <Card key={reading.id}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{reading.title}</CardTitle>
                          <CardDescription>
                            {reading.type}
                          </CardDescription>
                        </CardHeader>
                        <CardFooter>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Open
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Video className="h-5 w-5 mr-2" />
                    Videos
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {videos.map(video => (
                      <Card key={video.id}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{video.title}</CardTitle>
                          <CardDescription>
                            Duration: {video.duration}
                          </CardDescription>
                        </CardHeader>
                        <CardFooter>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Watch
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center bg-amber-50 p-2 rounded">
                    <AlertCircle className="h-5 w-5 mr-2 text-amber-600" />
                    Assignments
                  </h3>
                  <div className="space-y-4">
                    {assignments.map(assignment => (
                      <Card key={assignment.id}>
                        <CardHeader className="bg-amber-50">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{assignment.title}</CardTitle>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-200 text-amber-900">
                              {assignment.status}
                            </span>
                          </div>
                          <CardDescription>
                            Due: {assignment.dueDate ? formatDate(assignment.dueDate) : 'No due date'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Complete and submit this assignment before the due date.
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" size="sm" className="mr-2">
                            View Details
                          </Button>
                          <Button variant="default" size="sm">
                            Submit Assignment
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="announcements">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Class Announcements
                  </CardTitle>
                  <CardDescription>
                    Important updates from your instructor
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {announcements.length > 0 ? (
                    <div className="space-y-6">
                      {announcements.map((announcement: Announcement) => (
                        <div key={announcement.id} className="border-b pb-4 last:border-0">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-lg font-semibold">{announcement.title}</h4>
                            <span className="text-xs text-muted-foreground">
                              {announcement.createdAt ? new Date(announcement.createdAt).toLocaleDateString() : 'Unknown date'}
                            </span>
                          </div>
                          <p className="text-sm mb-2">{announcement.content}</p>
                          <p className="text-xs text-muted-foreground">Posted by: {announcement.author}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No announcements yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="discussions">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Class Discussions
                  </CardTitle>
                  <CardDescription>
                    Engage with your instructor and classmates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto mb-4 p-2">
                    {messages.map((message: Message) => (
                      <div key={message.id} className={`flex ${message.user.role === 'MENTOR' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[80%] rounded-lg p-3 ${message.user?.role === 'MENTOR' ? 'bg-secondary' : 'bg-primary text-primary-foreground'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback>{message.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium">{message.user.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unknown time'}
                            </span>
                          </div>
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Textarea 
                      placeholder="Type your message here..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="resize-none"
                    />
                    <Button onClick={handleSendMessage}>Send</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Class Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Course Completion</span>
                    <span>0%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Assignments Completed</span>
                    <span>0/2</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Materials Viewed</span>
                    <span>0/9</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                If you have any questions about the course materials or assignments, don't hesitate to reach out.
              </p>
              <Button variant="outline" className="w-full">Contact Instructor</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
