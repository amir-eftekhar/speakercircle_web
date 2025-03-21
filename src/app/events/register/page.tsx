'use client';

import { useState, useEffect, Suspense } from 'react';
import { Calendar, Clock, DollarSign, Users, Building, User } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { redirectToCheckout } from '@/lib/stripe';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  price?: number;
  capacity?: number;
  enrolled?: number;
  currentCount?: number;
  instructor?: string;
  prerequisites?: string;
  materials?: string;
}

type RegistrationType = 'individual' | 'group' | 'corporate';

function EventRegistrationContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('id');
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [registrationType, setRegistrationType] = useState<RegistrationType>('individual');
  const [participants, setParticipants] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    specialRequirements: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchEvent() {
      try {
        setLoading(true);
        setLoadError(null);
        
        // If no event ID is provided, use a default event for demo purposes
        if (!eventId) {
          // Create a mock event for demo purposes
          setEvent({
            id: 'demo-event',
            title: 'Public Speaking Workshop',
            date: '2025-02-15',
            time: '14:00',
            location: 'Main Hall',
            price: 99.99,
            capacity: 30,
            enrolled: 18,
            description: 'Join us for an interactive workshop on mastering public speaking techniques.',
            instructor: 'Sarah Johnson',
            prerequisites: 'None',
            materials: 'Notebook and pen recommended',
          });
          return;
        }
        
        // Try fetching from the events/[id] endpoint first
        let response = await fetch(`/api/events/${eventId}`);
        console.log('First API response status:', response.status);
        
        // If that fails, try the general events endpoint
        if (!response.ok) {
          console.log('Trying fallback API endpoint...');
          response = await fetch(`/api/events?id=${eventId}`);
          console.log('Fallback API response status:', response.status);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch event details: ${response.status}`);
          }
        }
        
        const data = await response.json();
        console.log('Event data received:', data);
        
        // Handle different response formats
        if (data.event) {
          setEvent(data.event);
        } else if (data.events && data.events.length > 0) {
          // If we get a list of events, find the matching one or use the first
          const matchingEvent = data.events.find((e: any) => e.id === eventId) || data.events[0];
          setEvent(matchingEvent);
        } else if (Array.isArray(data) && data.length > 0) {
          // Handle case where API returns an array directly
          const matchingEvent = data.find((e: any) => e.id === eventId) || data[0];
          setEvent(matchingEvent);
        } else {
          throw new Error('No event data found in response');
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setLoadError('Failed to load event details. Using default information.');
        
        // Set a default event using the provided ID
        setEvent({
          id: eventId || 'demo-event',
          title: 'Public Speaking Workshop',
          date: '2025-02-15',
          time: '14:00',
          location: 'Main Hall',
          price: 99.99,
          capacity: 30,
          enrolled: 18,
          description: 'Join us for an interactive workshop on mastering public speaking techniques.',
          instructor: 'Sarah Johnson',
          prerequisites: 'None',
          materials: 'Notebook and pen recommended',
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchEvent();
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!event) {
      setError('No event selected. Please select an event first.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Check if the user is a student
      const sessionResponse = await fetch('/api/auth/session');
      const sessionData = await sessionResponse.json();
      const isStudent = sessionData?.user?.role === 'STUDENT';
      
      console.log('Submitting event registration for event ID:', event.id, 'User role:', sessionData?.user?.role);
      
      // For students, register directly without payment
      if (isStudent) {
        console.log('Student registration - bypassing payment');
        // Register the student directly
        const response = await fetch('/api/events/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventId: event.id,
            registrationType: 'student',
            participants: 1,
            ...formData
          }),
        });
        
        const responseData = await response.json();
        
        if (response.ok) {
          // Redirect to success page
          window.location.href = `/events/success?event=${event.id}`;
        } else {
          throw new Error(responseData.message || 'Failed to register for event');
        }
      } else {
        // For non-students, proceed with payment
        console.log('Non-student registration - creating checkout session');
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventId: event.id,
            price: event.price,
            quantity: participants,
            registrationType,
            email: formData.email,
          }),
        });

        // Parse the response JSON only once
        const responseData = await response.json();
        console.log('API response status:', response.status, 'data:', responseData);
        
        if (!response.ok) {
          throw new Error(responseData.message || 'Failed to create checkout session');
        }

        console.log('Response data:', responseData);
        
        // Check specifically for the URL property
        if (responseData.url) {
          console.log('Redirecting to:', responseData.url);
          // Redirect directly to the URL
          window.location.href = responseData.url;
        } else if (responseData.sessionId) {
          console.log('Using session ID:', responseData.sessionId);
          // Use the redirectToCheckout helper with the session ID
          await redirectToCheckout({
            sessionId: responseData.sessionId,
          });
        } else {
          throw new Error('No checkout URL or session ID received');
        }
      }
    } catch (error: any) {
      console.error('Error during checkout:', error);
      setError(error.message || 'An error occurred during checkout. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Event Details */}
        <div className="space-y-4">
          <Link href="/events" className="text-primary hover:underline">&larr; Back to Events</Link>
          <h1 className="text-4xl font-bold">Register for Event</h1>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-[2fr,1fr] gap-8">
          {/* Registration Form */}
          <div className="space-y-6">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-xl font-semibold mb-4">Registration Details</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Registration Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Registration Type</label>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => setRegistrationType('individual')}
                      className={`p-4 rounded-lg border text-center text-sm ${
                        registrationType === 'individual' ? 'border-primary bg-primary/10' : ''
                      }`}
                    >
                      <User className="h-5 w-5 mx-auto mb-2" />
                      Individual
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegistrationType('group')}
                      className={`p-4 rounded-lg border text-center text-sm ${
                        registrationType === 'group' ? 'border-primary bg-primary/10' : ''
                      }`}
                    >
                      <Users className="h-5 w-5 mx-auto mb-2" />
                      Group
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegistrationType('corporate')}
                      className={`p-4 rounded-lg border text-center text-sm ${
                        registrationType === 'corporate' ? 'border-primary bg-primary/10' : ''
                      }`}
                    >
                      <Building className="h-5 w-5 mx-auto mb-2" />
                      Corporate
                    </button>
                  </div>
                </div>

                {/* Number of Participants */}
                {registrationType !== 'individual' && (
                  <div className="space-y-2">
                    <label htmlFor="participants" className="text-sm font-medium">
                      Number of Participants
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="10"
                      value={participants}
                      onChange={(e) => setParticipants(parseInt(e.target.value))}
                      className="w-full rounded-md border bg-background px-3 py-2"
                    />
                  </div>
                )}

                {/* Contact Information */}
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                      <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full rounded-md border bg-background px-3 py-2"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full rounded-md border bg-background px-3 py-2"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
                      <input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full rounded-md border bg-background px-3 py-2"
                      />
                    </div>
                    {registrationType === 'corporate' && (
                      <div className="space-y-2">
                        <label htmlFor="organization" className="text-sm font-medium">Organization</label>
                        <input
                          id="organization"
                          type="text"
                          value={formData.organization}
                          onChange={handleChange}
                          className="w-full rounded-md border bg-background px-3 py-2"
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Special Requirements */}
                <div className="space-y-2">
                  <label htmlFor="specialRequirements" className="text-sm font-medium">
                    Special Requirements
                  </label>
                  <textarea
                    id="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={handleChange}
                    rows={3}
                    className="w-full rounded-md border bg-background px-3 py-2"
                    placeholder="Any dietary restrictions, accessibility needs, etc."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full button-pop rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Proceed to Payment'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Event Summary */}
          <div className="space-y-6">
            <div className="rounded-lg border bg-card p-6 space-y-4">
              <h3 className="font-semibold">{event?.title || 'Event Registration'}</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{event?.date ? new Date(event.date).toLocaleDateString() : 'Date TBD'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{event?.time || 'Time TBD'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span>{event?.enrolled || event?.currentCount || 0}/{event?.capacity || 'Unlimited'} registered</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Price per person</span>
                  <span className="font-medium">${(event?.price || 99.99).toFixed(2)}</span>
                </div>
                {registrationType !== 'individual' && (
                  <>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm">Participants</span>
                      <span className="font-medium">x{participants}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-lg font-semibold">
                      <span>Total</span>
                      <span>${((event?.price || 99.99) * participants).toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-lg border bg-card p-6 space-y-4">
              <h3 className="font-semibold">Important Information</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Registration closes 24 hours before event</li>
                <li>• Full refund available up to 72 hours before event</li>
                <li>• Please arrive 15 minutes before start time</li>
                <li>• Confirmation email will be sent after registration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
function EventRegistrationLoading() {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4">
          <Link href="/events" className="text-primary hover:underline">&larr; Back to Events</Link>
          <h1 className="text-4xl font-bold">Register for Event</h1>
        </div>
        <div className="rounded-lg border p-8 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-gray-200 mb-4"></div>
            <div className="h-4 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-64 bg-gray-200 rounded"></div>
          </div>
          <p className="mt-4 text-muted-foreground">Loading event details...</p>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function EventRegistrationPage() {
  return (
    <Suspense fallback={<EventRegistrationLoading />}>
      <EventRegistrationContent />
    </Suspense>
  );
}
