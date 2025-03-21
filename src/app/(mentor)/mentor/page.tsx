'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { BookOpen, Users, Calendar, MessageSquare, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Stats {
  curriculumItems: number;
  students: number;
  upcomingSessions: number;
  unreadMessages: number;
}

export default function MentorDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats>({
    curriculumItems: 0,
    students: 0,
    upcomingSessions: 0,
    unreadMessages: 0,
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // In a real app, you would fetch these stats from your API
    // For now, we'll simulate loading and then set some example stats
    const timer = setTimeout(() => {
      setStats({
        curriculumItems: 12,
        students: 24,
        upcomingSessions: 3,
        unreadMessages: 5,
      });
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {session?.user?.name}</h1>
        <p className="text-muted-foreground">Here's an overview of your mentor dashboard</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Curriculum Items
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.curriculumItems}</div>
            <p className="text-xs text-muted-foreground">
              Total lessons, quizzes, and assignments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.students}</div>
            <p className="text-xs text-muted-foreground">
              Enrolled in your courses
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Sessions
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.upcomingSessions}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled for the next 7 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unread Messages
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.unreadMessages}</div>
            <p className="text-xs text-muted-foreground">
              From students and administrators
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks for mentors
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Button asChild variant="outline" className="h-auto flex-col items-start gap-1 p-4">
                <Link href="/mentor/curriculum">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <h3 className="font-semibold">Add Content</h3>
                    <p className="text-xs text-muted-foreground">Create new curriculum items</p>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 self-end text-muted-foreground" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto flex-col items-start gap-1 p-4">
                <Link href="/mentor/schedule">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <h3 className="font-semibold">Set Availability</h3>
                    <p className="text-xs text-muted-foreground">Update your teaching schedule</p>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 self-end text-muted-foreground" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto flex-col items-start gap-1 p-4">
                <Link href="/mentor/profile">
                  <Users className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <h3 className="font-semibold">Update Profile</h3>
                    <p className="text-xs text-muted-foreground">Edit your mentor information</p>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 self-end text-muted-foreground" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto flex-col items-start gap-1 p-4">
                <Link href="/mentor/messages">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <h3 className="font-semibold">Check Messages</h3>
                    <p className="text-xs text-muted-foreground">View and respond to communications</p>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 self-end text-muted-foreground" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest interactions and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <p className="text-muted-foreground">Loading activity...</p>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        <p className="text-sm">New student enrolled in your course</p>
                        <span className="ml-auto text-xs text-muted-foreground">2h ago</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <p className="text-sm">You published a new lesson</p>
                        <span className="ml-auto text-xs text-muted-foreground">Yesterday</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                        <p className="text-sm">Upcoming session reminder</p>
                        <span className="ml-auto text-xs text-muted-foreground">2 days ago</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Schedule</CardTitle>
                <CardDescription>
                  Your next teaching sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <p className="text-muted-foreground">Loading schedule...</p>
                  ) : stats.upcomingSessions > 0 ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Public Speaking Basics</p>
                          <p className="text-xs text-muted-foreground">Tomorrow, 10:00 AM - 11:30 AM</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Debate Techniques</p>
                          <p className="text-xs text-muted-foreground">Mar 22, 2:00 PM - 3:30 PM</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Voice Projection Workshop</p>
                          <p className="text-xs text-muted-foreground">Mar 24, 11:00 AM - 12:30 PM</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted-foreground">No upcoming sessions scheduled</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="curriculum" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Curriculum</CardTitle>
              <CardDescription>
                Overview of your educational content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-muted-foreground">Loading curriculum data...</p>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg border p-3">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Lessons</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold">8</p>
                      </div>
                      <div className="rounded-lg border p-3">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Quizzes</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold">3</p>
                      </div>
                    </div>
                    
                    <div className="rounded-lg border p-3">
                      <h3 className="text-sm font-medium mb-2">Recent Content</h3>
                      <ul className="space-y-2">
                        <li className="text-sm">Introduction to Public Speaking</li>
                        <li className="text-sm">Voice Projection Techniques</li>
                        <li className="text-sm">Body Language Basics</li>
                      </ul>
                      <Button asChild variant="link" className="mt-2 h-8 p-0">
                        <Link href="/mentor/curriculum">View all curriculum</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Schedule</CardTitle>
              <CardDescription>
                Upcoming sessions and availability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-muted-foreground">Loading schedule data...</p>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-lg border p-3">
                      <h3 className="text-sm font-medium mb-2">This Week</h3>
                      <ul className="space-y-2">
                        <li className="text-sm flex justify-between">
                          <span>Public Speaking Basics</span>
                          <span className="text-muted-foreground">Tomorrow, 10:00 AM</span>
                        </li>
                        <li className="text-sm flex justify-between">
                          <span>Debate Techniques</span>
                          <span className="text-muted-foreground">Mar 22, 2:00 PM</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="rounded-lg border p-3">
                      <h3 className="text-sm font-medium mb-2">Next Week</h3>
                      <ul className="space-y-2">
                        <li className="text-sm flex justify-between">
                          <span>Voice Projection Workshop</span>
                          <span className="text-muted-foreground">Mar 24, 11:00 AM</span>
                        </li>
                      </ul>
                    </div>
                    
                    <Button asChild variant="link" className="h-8 p-0">
                      <Link href="/mentor/schedule">Manage schedule</Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
