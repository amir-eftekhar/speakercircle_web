'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, DollarSign, CheckCircle, BookOpen } from 'lucide-react';

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
  };
};

type EventRegistration = {
  id: string;
  status: string;
  createdAt: string;
  event: {
    id: string;
    title: string;
    description: string;
    price: number;
    date: string;
    location: string;
  };
};

export default function DashboardPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    },
  });

  useEffect(() => {
    // Redirect users based on their role
    if (session?.user?.role === 'PARENT') {
      redirect('/parent/dashboard');
    } else if (session?.user?.role === 'STUDENT') {
      redirect('/student/dashboard');
    } else if (session?.user?.role === 'INSTRUCTOR') {
      redirect('/instructor/dashboard');
    } else if (session?.user?.role === 'MENTOR') {
      redirect('/mentor/dashboard');
    } else if (session?.user?.role === 'ADMIN') {
      redirect('/admin/dashboard');
    } else {
      // Default to student dashboard if role is not specified
      redirect('/student/dashboard');
    }
  }, [session]);

  // The code below won't execute due to the redirect, but we'll keep it for reference
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leavingClass, setLeavingClass] = useState<string | null>(null);
  const [leavingEvent, setLeavingEvent] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{message: string, type: 'success' | 'error'} | null>(null);

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

      // Fetch user's event registrations
      fetch('/api/user/event-registrations')
        .then(res => res.json())
        .then(data => {
          if (data.registrations) {
            setEventRegistrations(data.registrations);
          }
        })
        .catch(err => {
          console.error('Error fetching event registrations:', err);
          setError('Failed to load your event registrations');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [session?.user?.id]);
  
  // Handle leaving a class
  const handleLeaveClass = async (enrollmentId: string) => {
    try {
      setLeavingClass(enrollmentId);
      const response = await fetch('/api/user/enrollments/leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enrollmentId }),
      });

      const data = await response.json();

      if (response.ok) {
        // Remove the enrollment from the list
        setEnrollments(enrollments.filter(e => e.id !== enrollmentId));
        setActionMessage({ message: 'Successfully left the class', type: 'success' });
      } else {
        setActionMessage({ message: data.message || 'Failed to leave class', type: 'error' });
      }
    } catch (error) {
      console.error('Error leaving class:', error);
      setActionMessage({ message: 'An error occurred while trying to leave the class', type: 'error' });
    } finally {
      setLeavingClass(null);
      // Clear the message after 3 seconds
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  // Handle leaving an event
  const handleLeaveEvent = async (registrationId: string) => {
    try {
      setLeavingEvent(registrationId);
      const response = await fetch('/api/user/event-registrations/leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ registrationId }),
      });

      const data = await response.json();

      if (response.ok) {
        // Remove the registration from the list
        setEventRegistrations(eventRegistrations.filter(r => r.id !== registrationId));
        setActionMessage({ message: 'Successfully left the event', type: 'success' });
      } else {
        setActionMessage({ message: data.message || 'Failed to leave event', type: 'error' });
      }
    } catch (error) {
      console.error('Error leaving event:', error);
      setActionMessage({ message: 'An error occurred while trying to leave the event', type: 'error' });
    } finally {
      setLeavingEvent(null);
      // Clear the message after 3 seconds
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const getStatusBadge = (status: string, price: number = 0) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Confirmed</span>;
      case 'PENDING':
        return price > 0 ? 
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Payment Required</span> :
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Pending</span>;
      case 'TEST':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3 mr-1" /> Test Registration</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Welcome, {session?.user?.name}!</h1>
        {enrollments.length > 0 && (
          <Link href="/student/dashboard">
            <Button variant="outline" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Student Dashboard
            </Button>
          </Link>
        )}
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {actionMessage && (
        <div className={`mb-6 p-4 rounded-md ${actionMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {actionMessage.message}
        </div>
      )}
      
      <div className="grid gap-8 md:grid-cols-1">
        {/* Enrolled Classes Section */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Your Enrolled Classes</h2>
          </div>
          
          <div className="divide-y">
            {enrollments.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <p>You haven't enrolled in any classes yet.</p>
                <Link href="/classes">
                  <Button variant="outline" className="mt-4">Browse Classes</Button>
                </Link>
              </div>
            ) : (
              enrollments.map(enrollment => (
                <div key={enrollment.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium">{enrollment.class.title}</h3>
                    {getStatusBadge(enrollment.status, enrollment.class.price)}
                  </div>
                  
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {enrollment.class.description}
                  </p>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{new Date(enrollment.class.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{enrollment.class.location}</span>
                    </div>
                    {session?.user?.role === 'PARENT' && (
                      <div className="flex items-center text-sm">
                        <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>${enrollment.class.price}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    {enrollment.status === 'PENDING' && session?.user?.role === 'PARENT' ? (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={async () => {
                            try {
                              const response = await fetch('/api/create-checkout-session', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  classId: enrollment.class.id,
                                }),
                              });
                              
                              const data = await response.json();
                              
                              if (response.ok && data.url) {
                                console.log('Redirecting to Stripe:', data.url);
                                window.location.href = data.url;
                              } else {
                                setActionMessage({
                                  message: data.message || 'Failed to create checkout session',
                                  type: 'error'
                                });
                              }
                            } catch (error) {
                              console.error('Error creating checkout session:', error);
                              setActionMessage({
                                message: 'Error processing payment',
                                type: 'error'
                              });
                            }
                          }}
                        >
                          Complete Payment
                        </Button>
                        <Link href={`/classes/${enrollment.class.id}`}>
                          <Button variant="outline" size="sm">View Class</Button>
                        </Link>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleLeaveClass(enrollment.id)}
                          disabled={leavingClass === enrollment.id}
                        >
                          {leavingClass === enrollment.id ? 'Leaving...' : 'Leave Class'}
                        </Button>
                      </>
                    ) : enrollment.status === 'PENDING' && session?.user?.role === 'STUDENT' ? (
                      <>
                        <div className="text-sm text-amber-600 mb-2">Please ask a parent to complete payment</div>
                        <Link href={`/classes/${enrollment.class.id}`}>
                          <Button variant="outline" size="sm">View Class</Button>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link href={`/classes/${enrollment.class.id}`}>
                          <Button variant="outline" size="sm">View Class</Button>
                        </Link>
                        {session?.user?.role === 'PARENT' && (
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleLeaveClass(enrollment.id)}
                            disabled={leavingClass === enrollment.id}
                          >
                            {leavingClass === enrollment.id ? 'Leaving...' : 'Leave Class'}
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Registered Events Section */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden mt-4">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Your Registered Events</h2>
          </div>
          
          <div className="divide-y">
            {eventRegistrations.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <p>You haven't registered for any events yet.</p>
                <Link href="/events">
                  <Button variant="outline" className="mt-4">Browse Events</Button>
                </Link>
              </div>
            ) : (
              eventRegistrations.map(registration => (
                <div key={registration.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium">{registration.event.title}</h3>
                    {getStatusBadge(registration.status, registration.event.price)}
                  </div>
                  
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {registration.event.description}
                  </p>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{new Date(registration.event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{registration.event.location}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>${registration.event.price}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    {registration.status === 'PENDING' ? (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={async () => {
                            try {
                              const response = await fetch('/api/create-checkout-session', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  eventId: registration.event.id,
                                }),
                              });
                              
                              const data = await response.json();
                              
                              if (response.ok && data.url) {
                                console.log('Redirecting to Stripe:', data.url);
                                window.location.href = data.url;
                              } else {
                                setActionMessage({
                                  message: data.message || 'Failed to create checkout session',
                                  type: 'error'
                                });
                              }
                            } catch (error) {
                              console.error('Error creating checkout session:', error);
                              setActionMessage({
                                message: 'Error processing payment',
                                type: 'error'
                              });
                            }
                          }}
                        >
                          Complete Payment
                        </Button>
                        <Link href={`/events/${registration.event.id}`}>
                          <Button variant="outline" size="sm">View Event</Button>
                        </Link>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleLeaveEvent(registration.id)}
                          disabled={leavingEvent === registration.id}
                        >
                          {leavingEvent === registration.id ? 'Leaving...' : 'Leave Event'}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link href={`/events/${registration.event.id}`}>
                          <Button variant="outline" size="sm">View Event</Button>
                        </Link>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleLeaveEvent(registration.id)}
                          disabled={leavingEvent === registration.id}
                        >
                          {leavingEvent === registration.id ? 'Leaving...' : 'Leave Event'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
