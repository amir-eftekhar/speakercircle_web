'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, DollarSign, Users, MapPin, BookOpen, CheckCircle, FileText, Video, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface Class {
  id: string;
  title: string;
  description: string;
  price: number | null;
  capacity: number;
  startDate: string;
  endDate: string | null;
  schedule: string;
  location: string | null;
  instructor: string | null;
  level: string | null;
  isActive: boolean;
  imageData: string | null;
  currentCount: number;
  stripeProductId?: string;
  stripePriceId?: string;
  learningOutcomes?: string[];
  materials?: string[];
}

export default function ClassDetailPage({ params }: { params: { id: string } }) {
  // In Next.js 15, we need to use React.use to unwrap the params
  const unwrappedParams = use(params as any) as { id: string };
  const classId = unwrappedParams.id;
  
  const [classData, setClassData] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null);
  const [curriculumItems, setCurriculumItems] = useState<any>({lectures: [], readings: [], videos: [], assignments: []});
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch class data
        const classResponse = await fetch(`/api/classes/${classId}`);
        if (classResponse.ok) {
          const data = await classResponse.json();
          setClassData(data);
        } else {
          setError('Class not found');
          return;
        }

        // If user is logged in, check enrollment status
        if (session?.user?.id) {
          const enrollmentsResponse = await fetch('/api/user/enrollments');
          if (enrollmentsResponse.ok) {
            const { enrollments } = await enrollmentsResponse.json();
            const existingEnrollment = enrollments.find((enrollment: { class: { id: string } }) => enrollment.class.id === classId);
            if (existingEnrollment) {
              setEnrollmentStatus(existingEnrollment.status);
            }
          }
        }
        
        // Fetch curriculum items for this class
        try {
          const response = await fetch(`/api/classes/${classId}/curriculum`);
          if (response.ok) {
            const data = await response.json();
            // Organize items by type
            const lectures = data.items?.filter((item: any) => item.type === 'LECTURE') || [];
            const readings = data.items?.filter((item: any) => item.type === 'READING') || [];
            const videos = data.items?.filter((item: any) => item.type === 'VIDEO') || [];
            const assignments = data.items?.filter((item: any) => item.type === 'ASSIGNMENT') || [];
            
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
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load class details');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [classId, session?.user?.id]); // Use the unwrapped id and session

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function formatCurrency(amount: number | null) {
    if (amount === null) return 'Free';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  async function handleEnroll(isTestRegistration = false) {
    if (!session) {
      router.push(`/api/auth/signin?callbackUrl=/classes/${classId}`);
      return;
    }

    setEnrolling(true);
    setError(null);

    try {
      // For test registrations, bypass payment
      if (isTestRegistration) {
        const response = await fetch('/api/enrollments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            classId,
            isTestRegistration: true,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          // Handle specific error cases
          if (data.message === 'You are already registered for this class' || 
              data.message === 'You are already enrolled in this class') {
            setError('You are already enrolled in this class');
            setEnrollmentStatus('CONFIRMED');
            return;
          } else {
            setError(data.message || 'Failed to enroll');
            return;
          }
        }

        // Show success for test registration
        try {
          router.push('/dashboard?enrollment=success&test=true');
        } catch (routerError) {
          console.error('Router error:', routerError);
          // Fallback to direct navigation if router fails
          window.location.href = '/dashboard?enrollment=success&test=true';
        }
        return;
      }
      
      // For paid classes, create a Stripe checkout session
      if (classData?.price && classData.price > 0) {
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            classId,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Failed to create checkout session');
          return;
        }

        if (data.url) {
          // Redirect to Stripe checkout
          console.log('Redirecting to Stripe:', data.url);
          window.location.assign(data.url);
          return; // Important to stop execution here
        } else {
          setError('No checkout URL returned from server');
          return;
        }
      } else {
        // For free classes, directly create enrollment
        const response = await fetch('/api/enrollments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            classId,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          // Handle specific error cases
          if (data.message === 'You are already registered for this class' || 
              data.message === 'You are already enrolled in this class') {
            setError('You are already enrolled in this class');
            setEnrollmentStatus('CONFIRMED');
            return;
          } else {
            setError(data.message || 'Failed to enroll');
            return;
          }
        }

        // Show success for free class enrollment
        try {
          router.push('/dashboard?enrollment=success');
        } catch (routerError) {
          console.error('Router error:', routerError);
          // Fallback to direct navigation if router fails
          window.location.href = '/dashboard?enrollment=success';
        }
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      setError(error instanceof Error ? error.message : 'Failed to enroll in class');
    } finally {
      setEnrolling(false);
    }
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
          <Link href="/classes" className="mt-4 inline-block text-primary hover:underline">
            Back to Classes
          </Link>
        </div>
      </div>
    );
  }

  const isFull = classData.currentCount >= classData.capacity;

  return (
    <div className="container mx-auto py-12 px-4">
      <Link href="/classes" className="inline-flex items-center text-primary hover:underline mb-8">
        ← Back to Classes
      </Link>

      <div className="grid md:grid-cols-[2fr,1fr] gap-8">
        <div>
          {classData.imageData ? (
            <div className="relative h-[300px] w-full mb-6 rounded-lg overflow-hidden">
              <Image 
                src={classData.imageData}
                alt={classData.title}
                fill
                style={{ objectFit: 'cover' }}
                className="rounded-lg"
              />
            </div>
          ) : (
            <div className="bg-muted h-[300px] flex items-center justify-center mb-6 rounded-lg">
              <BookOpen className="h-16 w-16 text-muted-foreground" />
            </div>
          )}

          <h1 className="text-3xl font-bold mb-4">{classData.title}</h1>
          
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="materials">Materials</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="prose max-w-none mb-8">
                <p>{classData.description}</p>
              </div>

              {classData.learningOutcomes && classData.learningOutcomes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">What You'll Learn</h3>
                  <ul className="space-y-2">
                    {classData.learningOutcomes.map((outcome: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {classData.instructor && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">Instructor</h3>
                  <p>{classData.instructor}</p>
                </div>
              )}

              {classData.level && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">Level</h3>
                  <p>{classData.level}</p>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Schedule</h3>
                <p>{classData.schedule}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="materials">
              <div className="space-y-8">
                {curriculumItems.lectures.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Lecture Notes
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {curriculumItems.lectures.map((lecture: any) => (
                        <Card key={lecture.id}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">{lecture.title}</CardTitle>
                            <CardDescription>
                              {lecture.date ? new Date(lecture.date).toLocaleDateString() : 'Date not set'}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2">{lecture.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                
                {curriculumItems.readings.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <BookOpen className="h-5 w-5 mr-2" />
                      Readings
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {curriculumItems.readings.map((reading: any) => (
                        <Card key={reading.id}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">{reading.title}</CardTitle>
                            <CardDescription>
                              {reading.type}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2">{reading.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                
                {curriculumItems.videos.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <Video className="h-5 w-5 mr-2" />
                      Videos
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {curriculumItems.videos.map((video: any) => (
                        <Card key={video.id}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">{video.title}</CardTitle>
                            <CardDescription>
                              Duration: {video.duration || 'Not specified'}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                
                {curriculumItems.assignments.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center bg-amber-50 p-2 rounded">
                      <AlertCircle className="h-5 w-5 mr-2 text-amber-600" />
                      Assignments
                    </h3>
                    <div className="space-y-4">
                      {curriculumItems.assignments.map((assignment: any) => (
                        <Card key={assignment.id}>
                          <CardHeader className="bg-amber-50">
                            <CardTitle className="text-lg">{assignment.title}</CardTitle>
                            <CardDescription>
                              Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">
                              {assignment.description || 'Complete and submit this assignment before the due date.'}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                
                {curriculumItems.lectures.length === 0 && 
                 curriculumItems.readings.length === 0 && 
                 curriculumItems.videos.length === 0 && 
                 curriculumItems.assignments.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No materials available yet. Enroll in the class to access materials when they become available.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <div className="bg-card border rounded-lg p-6 sticky top-8">
            <h3 className="text-xl font-semibold mb-4">Class Details</h3>
            
            {enrollmentStatus && (
              <div className="mb-4">
                {enrollmentStatus === 'CONFIRMED' || enrollmentStatus === 'TEST' ? (
                  <div className="bg-green-50 text-green-700 p-3 rounded-md flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>
                      {enrollmentStatus === 'TEST' 
                        ? "You're enrolled in this class (Test Registration)" 
                        : "You're enrolled in this class!"}
                    </span>
                  </div>
                ) : enrollmentStatus === 'PENDING' && classData.price && classData.price > 0 ? (
                  <div className="bg-yellow-50 text-yellow-700 p-3 rounded-md">
                    <p className="font-medium">Payment Required</p>
                    <p className="text-sm mt-1">Complete your payment to confirm enrollment.</p>
                    <button 
                      className="mt-2 w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-md text-sm disabled:opacity-50"
                      onClick={async () => {
                        setEnrolling(true);
                        setError(null);
                        
                        try {
                          const response = await fetch('/api/create-checkout-session', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              classId,
                            }),
                          });
                          
                          const data = await response.json();
                          
                          if (!response.ok) {
                            // Handle the already registered error more gracefully
                            if (data.message === 'You are already registered for this class') {
                              setError('You are already enrolled in this class');
                              // Update enrollment status without refreshing the page
                              setEnrollmentStatus('CONFIRMED');
                              return;
                            } else {
                              setError(data.message || 'Failed to create checkout session');
                              return;
                            }
                          }
                          
                          if (data.url) {
                            // Redirect to Stripe checkout
                            console.log('Redirecting to Stripe:', data.url);
                            
                            // Make sure the URL is valid before redirecting
                            if (data.url && (data.url.startsWith('http://') || data.url.startsWith('https://') || data.url.startsWith('/'))) {
                              window.location.href = data.url;
                              return;
                            } else {
                              console.error('Invalid URL received:', data.url);
                              setError('Invalid checkout URL received');
                              return;
                            }
                          } else {
                            setError('No checkout URL returned from server');
                            return;
                          }
                        } catch (error) {
                          console.error('Enrollment error:', error);
                          setError(error instanceof Error ? error.message : 'Failed to create checkout session');
                        } finally {
                          setEnrolling(false);
                        }
                      }}
                      disabled={enrolling}
                    >
                      {enrolling ? 'Processing...' : 'Complete Payment'}
                    </button>
                  </div>
                ) : null}
              </div>
            )}
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                  <p className="font-medium">Start Date</p>
                  <p className="text-muted-foreground">{formatDate(classData.startDate)}</p>
                </div>
              </div>
              
              {classData.endDate && (
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="font-medium">End Date</p>
                    <p className="text-muted-foreground">{formatDate(classData.endDate)}</p>
                  </div>
                </div>
              )}
              
              {classData.location && (
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-muted-foreground">{classData.location}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                  <p className="font-medium">Capacity</p>
                  <p className="text-muted-foreground">
                    {classData.currentCount}/{classData.capacity} enrolled
                  </p>
                </div>
              </div>
              
              {session?.user?.role === 'PARENT' && (
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Price</p>
                    <p className="text-muted-foreground">{formatCurrency(classData.price)}</p>
                  </div>
                </div>
              )}
            </div>
            
            {session?.user?.role === 'PARENT' && (
              <div className="space-y-2">
                <button
                  onClick={() => handleEnroll()}
                  disabled={enrolling || isFull || !classData.isActive}
                  className="w-full inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-10 px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enrolling ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-foreground mr-2"></div>
                      Processing...
                    </>
                  ) : isFull ? (
                    'Class Full'
                  ) : !classData.isActive ? (
                    'Class Not Available'
                  ) : (
                    `Enroll Now ${classData.price && classData.price > 0 ? `- ${formatCurrency(classData.price)}` : '- Free'}`
                  )}
                </button>
                
                <button
                  onClick={() => handleEnroll(true)}
                  disabled={enrolling || isFull || !classData.isActive || enrollmentStatus === 'CONFIRMED' || enrollmentStatus === 'TEST'}
                  className="w-full inline-flex items-center justify-center rounded-md bg-secondary text-secondary-foreground h-10 px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
                >
                  {enrolling ? 'Processing...' : 'Test Registration (No Payment)'}
                </button>
              </div>
            )}
            
            {session?.user?.role === 'STUDENT' && !enrollmentStatus && (
              <div className="bg-blue-50 text-blue-700 p-3 rounded-md">
                <p className="font-medium">Interested in this class?</p>
                <p className="text-sm mt-1">Please ask a parent to enroll you in this class.</p>
              </div>
            )}
            
            {error && (
              <p className="mt-2 text-sm text-red-500">{error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
