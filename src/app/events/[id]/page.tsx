'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, Users, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  price: number | null;
  imageData: string | null;
  isActive: boolean;
}

export default function EventDetailPage({ params }: { params: { id: string } }) {
  // In Next.js 15, we need to use React.use to unwrap the params
  const unwrappedParams = use(params as any) as { id: string };
  const eventId = unwrappedParams.id;
  
  const [eventData, setEventData] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrationStatus, setRegistrationStatus] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch event data
        const eventResponse = await fetch(`/api/events/${eventId}`);
        if (eventResponse.ok) {
          const data = await eventResponse.json();
          setEventData(data);
        } else {
          setError('Event not found');
          return;
        }

        // If user is logged in, check registration status
        if (session?.user?.id) {
          const registrationsResponse = await fetch('/api/user/event-registrations');
          if (registrationsResponse.ok) {
            const { registrations } = await registrationsResponse.json();
            const existingRegistration = registrations.find((reg: { event: { id: string } }) => reg.event.id === eventId);
            if (existingRegistration) {
              setRegistrationStatus(existingRegistration.status);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [eventId, session?.user?.id]);

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  async function handleRegister() {
    if (!session) {
      router.push(`/api/auth/signin?callbackUrl=/events/${eventId}`);
      return;
    }

    setRegistering(true);
    setError(null);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create checkout session');
      }

      if (data.url) {
        // Redirect to Stripe checkout
        console.log('Redirecting to Stripe:', data.url);
        window.location.assign(data.url);
        return; // Important to stop execution here
      } else {
        throw new Error('No checkout URL returned from server');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'Failed to register for the event');
    } finally {
      setRegistering(false);
    }
  }

  if (loading) {
    return <div className="container mx-auto p-4">Loading event details...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }

  if (!eventData) {
    return <div className="container mx-auto p-4">Event not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {eventData.imageData && (
          <div className="relative h-64 w-full">
            <Image
              src={eventData.imageData}
              alt={eventData.title}
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
        )}
        
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">{eventData.title}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="flex items-center mb-3">
                <Calendar className="mr-2 text-blue-600" />
                <span>{formatDate(eventData.date)}</span>
              </div>
              
              <div className="flex items-center mb-3">
                <Clock className="mr-2 text-blue-600" />
                <span>{formatTime(eventData.date)}</span>
              </div>
              
              <div className="flex items-center mb-3">
                <MapPin className="mr-2 text-blue-600" />
                <span>{eventData.location}</span>
              </div>
              
              <div className="flex items-center mb-3">
                <Users className="mr-2 text-blue-600" />
                <span>Capacity: {eventData.capacity}</span>
              </div>
              
              <div className="mt-6">
                <p className="font-semibold">Price: {eventData.price ? formatCurrency(eventData.price) : 'Free'}</p>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="whitespace-pre-line">{eventData.description}</p>
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            {!session ? (
              <Link href={`/api/auth/signin?callbackUrl=/events/${eventId}`}>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg">
                  Sign in to Register
                </button>
              </Link>
            ) : registrationStatus === 'CONFIRMED' ? (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="font-semibold">You're registered for this event!</span>
              </div>
            ) : registrationStatus === 'PENDING' ? (
              <button 
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50"
                onClick={async () => {
                  setRegistering(true);
                  try {
                    const response = await fetch('/api/create-checkout-session', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        eventId,
                      }),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                      // Handle the already registered error more gracefully
                      if (data.message === 'You are already registered for this event') {
                        setError('You are already registered for this event');
                        // Update registration status without refreshing the page
                        setRegistrationStatus('CONFIRMED');
                        return;
                      } else {
                        throw new Error(data.message || 'Failed to create checkout session');
                      }
                    }

                    if (data.url) {
                      // Redirect to Stripe checkout
                      console.log('Redirecting to Stripe:', data.url);
                      
                      // Direct approach - just set the location
                      window.location.href = data.url;
                      return; // Important to stop execution here
                    } else {
                      throw new Error('No checkout URL returned from server');
                    }
                  } catch (error) {
                    console.error('Registration error:', error);
                    setError(error instanceof Error ? error.message : 'Failed to create checkout session');
                  } finally {
                    setRegistering(false);
                  }
                }}
                disabled={registering}
              >
                {registering ? 'Processing...' : 'Complete Payment'}
              </button>
            ) : (
              <button
                onClick={handleRegister}
                disabled={registering}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50"
              >
                {registering ? 'Processing...' : 'Register Now - $99/month'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
