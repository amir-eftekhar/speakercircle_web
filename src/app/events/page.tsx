'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, ChevronDown, ChevronUp, Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  imageData?: string;
  isActive: boolean;
  _count?: {
    registrations: number;
  };
}

export default function EventsPage() {
  const [expandedEvents, setExpandedEvents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch('/api/events');
        if (response.ok) {
          const data = await response.json();
          setEvents(data.events || []);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  const toggleExpand = (eventId: string) => {
    setExpandedEvents(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const filteredEvents = events.filter(event => {
    return event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="container py-12">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Upcoming Events</h1>
            <p className="text-muted-foreground">
              Join our events and enhance your public speaking skills
            </p>
          </div>

          {/* Search */}
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search events..."
                className="pl-10 h-10 w-full md:w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium">No events found</h3>
            <p className="mt-2 text-muted-foreground">Try adjusting your search or check back later for upcoming events.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredEvents.filter(event => event.isActive).map((event) => (
              <div
                key={event.id}
                className="group rounded-lg border bg-card hover-card-shadow overflow-hidden"
              >
                <div className="grid md:grid-cols-[300px,1fr] gap-6">
                  {/* Event Image */}
                  <div className="relative h-[200px] md:h-full">
                    {event.imageData ? (
                      <Image
                        src={event.imageData}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="bg-muted h-full w-full flex items-center justify-center">
                        <Calendar className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Event Details */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                    <div className="grid sm:grid-cols-3 gap-4 mb-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(event.date).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-muted-foreground">
                        {expandedEvents.includes(event.id)
                          ? event.description
                          : event.description.substring(0, 150) + '...'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{event.capacity} spots available</span>
                      </div>
                      <div className="flex gap-4">
                        <button
                          onClick={() => toggleExpand(event.id)}
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          {expandedEvents.includes(event.id) ? (
                            <>
                              Read less
                              <ChevronUp className="h-4 w-4" />
                            </>
                          ) : (
                            <>
                              Read more
                              <ChevronDown className="h-4 w-4" />
                            </>
                          )}
                        </button>
                        <Link
                          href={`/events/register?id=${event.id}`}
                          className="button-pop px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
                        >
                          Register Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
