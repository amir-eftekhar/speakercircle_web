'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Activity,
  Users,
  Calendar,
  TrendingUp,
  Award,
  BarChart3,
  DollarSign,
  PlusCircle,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatCurrency } from '@/lib/utils';

// Define types for our data
type Event = {
  id: string;
  title: string;
  description: string;
  date: string | Date;
  location: string;
  capacity: number;
  imageData?: string;
  isActive: boolean;
  _count?: {
    registrations: number;
  };
};

type Enrollment = {
  id: string;
  status: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  class?: {
    id: string;
    title: string;
  };
  payment?: {
    id: string;
    amount: number;
    status: string;
    createdAt: string | Date;
  };
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    upcomingEvents: 0,
    totalEvents: 0,
    activeClasses: 0,
    totalClasses: 0,
    totalEnrollments: 0,
    activeEnrollments: 0,
    totalRevenue: 0
  });
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [recentEnrollments, setRecentEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        
        // Fetch dashboard stats directly from Prisma client via API
        const statsResponse = await fetch('/api/admin/stats', {
          cache: 'no-store',
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          console.log('Stats data received:', statsData);
          setStats(statsData);
        } else {
          console.error('Failed to fetch stats:', await statsResponse.text());
          // Don't set default values, keep the existing state
        }

        // Fetch recent events
        const eventsResponse = await fetch('/api/events?limit=5', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          console.log('Events data:', eventsData);
          setRecentEvents(eventsData.events || []);
        } else {
          console.error('Failed to fetch events:', await eventsResponse.text());
        }

        // Fetch recent enrollments
        const enrollmentsResponse = await fetch('/api/admin/enrollments?limit=5', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (enrollmentsResponse.ok) {
          const enrollmentsData = await enrollmentsResponse.json();
          console.log('Enrollments data:', enrollmentsData);
          setRecentEnrollments(enrollmentsData.enrollments || []);
        } else {
          console.error('Failed to fetch enrollments:', await enrollmentsResponse.text());
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">Loading dashboard data...</div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-4">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <h3 className="text-2xl font-bold">{stats.totalUsers || 0}</h3>
                </div>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-4">
                <Calendar className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Events</p>
                  <h3 className="text-2xl font-bold">
                    {stats.upcomingEvents || 0} <span className="text-sm text-muted-foreground">/ {stats.totalEvents || 0}</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">Upcoming / Total</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-4">
                <Activity className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Classes</p>
                  <h3 className="text-2xl font-bold">
                    {stats.activeClasses || 0} <span className="text-sm text-muted-foreground">/ {stats.totalClasses || 0}</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">Active / Total</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-4">
                <DollarSign className="h-8 w-8 text-amber-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                  <h3 className="text-2xl font-bold">{formatCurrency(stats.totalRevenue || 0)}</h3>
                </div>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow lg:col-span-2">
              <div className="flex items-center space-x-4">
                <Users className="h-8 w-8 text-indigo-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Enrollments</p>
                  <h3 className="text-2xl font-bold">
                    {stats.activeEnrollments || 0} <span className="text-sm text-muted-foreground">/ {stats.totalEnrollments || 0}</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">Active / Total</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
              <TabsTrigger value="overview" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="events" className="gap-2">
                <Calendar className="h-4 w-4" />
                Events
              </TabsTrigger>
              <TabsTrigger value="enrollments" className="gap-2">
                <Users className="h-4 w-4" />
                Enrollments
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border bg-card p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold">Recent Events</h4>
                    <Link href="/admin/events">
                      <Button variant="ghost" size="sm">View All</Button>
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {recentEvents.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No events found</p>
                    ) : (
                      recentEvents.map((event) => (
                        <div key={event.id} className="flex justify-between items-center border-b pb-2">
                          <div>
                            <p className="font-medium">{event.title}</p>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{formatDate(event.date)}</span>
                            </div>
                          </div>
                          <Link href={`/admin/events/${event.id}`}>
                            <Button variant="ghost" size="sm">View</Button>
                          </Link>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="rounded-lg border bg-card p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold">Quick Actions</h4>
                  </div>
                  <div className="space-y-3">
                    <Link href="/admin/events/new" className="block">
                      <Button className="w-full justify-start" variant="outline">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Event
                      </Button>
                    </Link>
                    <Link href="/admin/classes/new" className="block">
                      <Button className="w-full justify-start" variant="outline">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Class
                      </Button>
                    </Link>
                    <Link href="/admin/announcements/new" className="block">
                      <Button className="w-full justify-start" variant="outline">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Announcement
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="events" className="space-y-4">
              <div className="rounded-lg border bg-card p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold">Upcoming Events</h4>
                  <Link href="/admin/events/new">
                    <Button size="sm">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      New Event
                    </Button>
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentEvents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No upcoming events</p>
                  ) : (
                    recentEvents.map((event) => (
                      <div key={event.id} className="flex justify-between items-center border-b pb-3">
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {event._count?.registrations || 0} registrations
                          </p>
                        </div>
                        <Link href={`/admin/events/${event.id}`}>
                          <Button variant="ghost" size="sm">Manage</Button>
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="enrollments" className="space-y-4">
              <div className="rounded-lg border bg-card p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold">Recent Enrollments</h4>
                  <Link href="/admin/enrollments">
                    <Button variant="ghost" size="sm">View All</Button>
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentEnrollments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No recent enrollments</p>
                  ) : (
                    recentEnrollments.map((enrollment) => (
                      <div key={enrollment.id} className="flex justify-between items-center border-b pb-3">
                        <div>
                          <p className="font-medium">{enrollment.user?.name || 'Unknown User'}</p>
                          <p className="text-sm">{enrollment.class?.title || 'Unknown Class'}</p>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${enrollment.status === 'APPROVED' ? 'bg-green-100 text-green-800' : enrollment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                              {enrollment.status}
                            </span>
                            {enrollment.payment && (
                              <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                                {enrollment.payment.status}
                              </span>
                            )}
                          </div>
                        </div>
                        <Link href={`/admin/enrollments/${enrollment.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
