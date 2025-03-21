'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, DollarSign, CheckCircle, BookOpen, Bell, User, Bookmark, Award, FileText, BarChart2, Layers, Briefcase, Zap, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import ParentRequests from './parent-requests';

type Enrollment = {
  id: string;
  status: string;
  createdAt: string;
  class: {
    id: string;
    title: string;
    description: string;
    price: number;
    startDate: string;
    location: string;
    instructor: string;
  };
};

type ParentRequest = {
  id: string;
  parentId: string;
  status: string;
  createdAt: string;
  parent: {
    id: string;
    name: string;
    email: string;
  };
};

type Notification = {
  id: string;
  type: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  senderId: string | null;
  sender?: {
    id: string;
    name: string;
    email: string;
  };
};

export default function StudentDashboardPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    },
  });

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('classes');

  const fetchUserData = () => {
    if (session?.user?.id) {
      setLoading(true);
      
      // Fetch user's enrollments
      fetch('/api/user/enrollments')
        .then(res => res.json())
        .then(data => {
          if (data.enrollments) {
            setEnrollments(data.enrollments);
          }
        })
        .catch(err => {
          console.error('Error fetching enrollments:', err);
          setError('Failed to load your class enrollments');
        });
      

      
      // Fetch notifications
      fetch('/api/notifications')
        .then(res => res.json())
        .then(data => {
          if (data.notifications) {
            setNotifications(data.notifications);
          }
        })
        .catch(err => {
          console.error('Error fetching notifications:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };



  useEffect(() => {
    fetchUserData();
  }, [session?.user?.id]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Student Hub</h1>
          <p className="text-muted-foreground">Welcome back, {session?.user?.name}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/student/materials">
              <FileText className="h-4 w-4 mr-2" />
              My Materials
            </Link>
          </Button>
          <Button asChild>
            <Link href="/student/enroll">
              <Zap className="h-4 w-4 mr-2" />
              Discover Classes
            </Link>
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-blue-700">
              <Layers className="h-5 w-5 mr-2" />
              Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{enrollments.length}</div>
            <p className="text-sm text-muted-foreground">Active enrollments</p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full" onClick={() => setActiveTab('classes')}>
              <BookOpen className="h-4 w-4 mr-2" />
              View Classes
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-amber-700">
              <Award className="h-5 w-5 mr-2" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Math.floor(Math.random() * 10) + 1}</div>
            <p className="text-sm text-muted-foreground">Earned badges</p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link href="/student/achievements">
                <Star className="h-4 w-4 mr-2" />
                View Achievements
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-green-700">
              <BarChart2 className="h-5 w-5 mr-2" />
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Math.floor(Math.random() * 30) + 70}%</div>
            <p className="text-sm text-muted-foreground">Course completion</p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full" onClick={() => setActiveTab('materials')}>
              <FileText className="h-4 w-4 mr-2" />
              View Materials
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-purple-700">
              <User className="h-5 w-5 mr-2" />
              Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Math.floor(Math.random() * 3)}</div>
            <p className="text-sm text-muted-foreground">Pending requests</p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full" onClick={() => setActiveTab('requests')}>
              <Bell className="h-4 w-4 mr-2" />
              View Requests
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Tabs defaultValue="classes" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="classes">My Classes</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="requests">
            Requests
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="classes">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {enrollments.length === 0 ? (
              <div className="col-span-full p-6 text-center bg-white rounded-lg shadow">
                <p className="text-muted-foreground">You haven't enrolled in any classes yet.</p>
                <Link href="/classes">
                  <Button variant="outline" className="mt-4">Browse Classes</Button>
                </Link>
              </div>
            ) : (
              enrollments.map(enrollment => (
                <Card key={enrollment.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{enrollment.class.title}</CardTitle>
                      <div>
                        {enrollment.status === 'CONFIRMED' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" /> Active
                          </span>
                        )}
                        {enrollment.status === 'PENDING' && enrollment.class.price > 0 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Payment Required
                          </span>
                        )}
                        {enrollment.status === 'PENDING' && (!enrollment.class.price || enrollment.class.price === 0) && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Pending
                          </span>
                        )}
                        {enrollment.status === 'TEST' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <CheckCircle className="w-3 h-3 mr-1" /> Test
                          </span>
                        )}
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {enrollment.class.instructor && `Instructor: ${enrollment.class.instructor}`}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pb-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{new Date(enrollment.class.startDate).toLocaleDateString()}</span>
                      </div>
                      {enrollment.class.location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{enrollment.class.location}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Link href={`/student/classes/${enrollment.class.id}`} className="w-full">
                      <Button variant="default" className="w-full">
                        View Class Materials
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="materials">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Learning Materials & Assignments</h2>
            
            {enrollments.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">You haven't enrolled in any classes yet.</p>
                <Link href="/classes">
                  <Button variant="outline" className="mt-4">Browse Classes</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {enrollments.map(enrollment => (
                  <div key={enrollment.id} className="border rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">{enrollment.class.title}</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <Card className="bg-gray-50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Lecture Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">Access class lecture notes and slides</p>
                        </CardContent>
                        <CardFooter>
                          <Link href={`/student/classes/${enrollment.class.id}/materials`}>
                            <Button variant="outline" size="sm">View</Button>
                          </Link>
                        </CardFooter>
                      </Card>
                      
                      <Card className="bg-gray-50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Readings</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">Required and supplemental readings</p>
                        </CardContent>
                        <CardFooter>
                          <Link href={`/student/classes/${enrollment.class.id}/readings`}>
                            <Button variant="outline" size="sm">View</Button>
                          </Link>
                        </CardFooter>
                      </Card>
                      
                      <Card className="bg-gray-50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Videos</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">Recorded lectures and demonstrations</p>
                        </CardContent>
                        <CardFooter>
                          <Link href={`/student/classes/${enrollment.class.id}/videos`}>
                            <Button variant="outline" size="sm">View</Button>
                          </Link>
                        </CardFooter>
                      </Card>
                      
                      <Card className="bg-amber-50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Assignments</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">View and submit your assignments</p>
                        </CardContent>
                        <CardFooter>
                          <Link href={`/student/classes/${enrollment.class.id}/assignments`}>
                            <Button variant="outline" size="sm">View</Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="requests">
          <Card className="border-0 shadow-none">
            <CardHeader className="bg-gray-50 rounded-t-lg border">
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-indigo-600" />
                Parent Requests
              </CardTitle>
              <CardDescription>Manage connection requests from parents</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 bg-white rounded-b-lg border border-t-0">
              <ParentRequests userId={session?.user?.id || ''} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Registered Events Section */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Your Registered Events</h2>
        </div>
        
        <div className="p-6 text-center text-muted-foreground">
          <p>You haven't registered for any events yet.</p>
          <Link href="/events">
            <Button variant="outline" className="mt-4">Browse Events</Button>
          </Link>
        </div>
      </div>
      
      {/* Upcoming Classes Section */}
      <Card className="mb-8">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
            Upcoming Classes
          </CardTitle>
          <CardDescription>Your next scheduled classes</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {enrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrollments.slice(0, 3).map((enrollment) => (
                <Card key={enrollment.id} className="border shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{enrollment.class.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{new Date(enrollment.class.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{new Date(enrollment.class.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{enrollment.class.location}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                      <Link href={`/student/classes/${enrollment.class.id}`}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        View Materials
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No upcoming classes.</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/student/enroll">
                  <Zap className="h-4 w-4 mr-2" />
                  Browse Available Classes
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-gray-50 border-t">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/student/classes">View All Classes</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
