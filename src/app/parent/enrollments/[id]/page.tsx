'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, DollarSign, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type EnrollmentData = {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  classId: string;
  class: {
    id: string;
    name?: string;
    title?: string;
    description?: string;
    startDate: string;
    endDate: string;
    instructor?: string;
    location?: string;
    price?: number;
    instructorProfile?: {
      user: {
        name: string;
      }
    };
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export default function EnrollmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [enrollment, setEnrollment] = useState<EnrollmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'PARENT') {
      router.push('/dashboard');
      return;
    }

    const fetchEnrollment = async () => {
      try {
        const response = await fetch(`/api/enrollments/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch enrollment');
        }
        const data = await response.json();
        setEnrollment(data.enrollment);
      } catch (err) {
        setError('Failed to load enrollment details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' && params.id) {
      fetchEnrollment();
    }
  }, [params.id, router, session, status]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCancelEnrollment = async () => {
    if (!confirm('Are you sure you want to cancel this enrollment?')) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/enrollments/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel enrollment');
      }

      // Update local state
      setEnrollment(prev => prev ? { ...prev, status: 'CANCELLED' } : null);
    } catch (err) {
      setError('Failed to cancel enrollment');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !enrollment) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || 'Enrollment not found'}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild>
            <Link href="/parent/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'CONFIRMED':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'CANCELLED':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelled</Badge>;
      case 'TEST':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Test</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="outline" asChild className="mb-4">
          <Link href="/parent/dashboard">
            ← Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Enrollment Details</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{enrollment.class.title || enrollment.class.name}</CardTitle>
              <CardDescription>
                Instructor: {enrollment.class.instructor || enrollment.class.instructorProfile?.user.name || 'TBA'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="font-medium">Dates</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(enrollment.class.startDate)} - {formatDate(enrollment.class.endDate)}
                  </p>
                </div>
              </div>

              {enrollment.class.location && (
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{enrollment.class.location}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="font-medium">Enrollment Status</p>
                  <div className="text-sm text-muted-foreground flex items-center mt-1">
                    {getStatusBadge(enrollment.status)}
                  </div>
                </div>
              </div>

              {enrollment.class.price !== undefined && (
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Price</p>
                    <p className="text-sm text-muted-foreground">
                      {typeof enrollment.class.price === 'number'
                        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(enrollment.class.price)
                        : 'Free'}
                    </p>
                  </div>
                </div>
              )}

              {enrollment.class.description && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-medium mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground">{enrollment.class.description}</p>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex flex-col items-stretch space-y-2">
              {enrollment.status !== 'CANCELLED' && (
                <Button 
                  variant="destructive" 
                  disabled={actionLoading}
                  onClick={handleCancelEnrollment}
                  className="w-full"
                >
                  {actionLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                      Processing...
                    </>
                  ) : (
                    <>Cancel Enrollment</>
                  )}
                </Button>
              )}
              <Button variant="outline" asChild className="w-full">
                <Link href={`/classes/${enrollment.classId}`}>
                  View Class Details
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Name</p>
                  <p className="text-sm text-muted-foreground">{enrollment.user.name}</p>
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{enrollment.user.email}</p>
                </div>
                <div>
                  <p className="font-medium">Enrolled On</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(enrollment.createdAt)} at {formatTime(enrollment.createdAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {enrollment.status === 'CANCELLED' && (
            <Alert className="mt-4 bg-red-50">
              <XCircle className="h-4 w-4 text-red-500" />
              <AlertTitle>Enrollment Cancelled</AlertTitle>
              <AlertDescription>
                This enrollment has been cancelled. The student will no longer be able to access this class.
              </AlertDescription>
            </Alert>
          )}

          {enrollment.status === 'CONFIRMED' && (
            <Alert className="mt-4 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle>Enrollment Confirmed</AlertTitle>
              <AlertDescription>
                This enrollment is confirmed. The student can access all class materials.
              </AlertDescription>
            </Alert>
          )}

          {enrollment.status === 'PENDING' && (
            <Alert className="mt-4 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <AlertTitle>Enrollment Pending</AlertTitle>
              <AlertDescription>
                This enrollment is pending confirmation. The student will be notified once it's confirmed.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
