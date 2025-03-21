'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Filter,
  Search,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { EventDialog } from '@/components/events/event-dialog';
import { toast } from 'sonner';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const fetchEvents = async () => {
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'all') {
        params.append('status', activeTab);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/events?${params}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [activeTab, searchTerm]);

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete event');
      
      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Events Management</h1>
        <Button className="gap-2" onClick={() => setShowEventDialog(true)}>
          <Plus className="h-4 w-4" /> Add Event
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              <Calendar className="h-4 w-4" />
              All Events
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="past" className="gap-2">
              <XCircle className="h-4 w-4" />
              Past
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search events..."
                className="pl-8 h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

          </div>
        </div>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="rounded-lg border bg-card">
            <div className="flex items-center p-4 font-medium">
              <div className="flex-1">Title</div>
              <div className="flex-1">Date</div>
              <div className="flex-1">Location</div>
              <div className="flex-1">Capacity</div>
              <div className="w-24">Actions</div>
            </div>
            <div className="divide-y">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">Loading events...</div>
              ) : events.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">No events found</div>
              ) : (
                events.map((event) => (
                  <div key={event.id} className="flex items-center p-4">
                    <div className="flex-1">
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {event.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div>
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="flex-1">{event.location}</div>
                    <div className="flex-1">
                      {event._count?.registrations || 0}/{event.capacity}
                    </div>
                    <div className="w-24 flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(event.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {showEventDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Event</h2>
            <p>Use the dedicated event creation page for a better experience.</p>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowEventDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                setShowEventDialog(false);
                window.location.href = '/admin/events/new';
              }}>Go to Event Form</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
