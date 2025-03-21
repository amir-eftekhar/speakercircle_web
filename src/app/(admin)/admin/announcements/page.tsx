'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Bell,
  Plus,
  Edit,
  Trash2,
  Filter,
  Search,
  ArrowUpDown,
  MessageSquare,
  Send,
  BellRing,
  History,
  Users,
  UserCheck,
  Mail,
} from 'lucide-react';

// Mock data
const announcements = [
  {
    id: 1,
    title: 'New Workshop Series',
    content: 'Join us for our new workshop series on advanced public speaking techniques.',
    date: '2025-02-02',
    status: 'published',
    audience: 'all',
  },
  {
    id: 2,
    title: 'Schedule Change Notice',
    content: 'Important changes to the upcoming week\'s schedule.',
    date: '2025-02-01',
    status: 'published',
    audience: 'students',
  },
];

export default function AnnouncementsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [targetAudience, setTargetAudience] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Mock events and classes for targeting
  const events = [
    { id: 'e1', title: 'Public Speaking Workshop' },
    { id: 'e2', title: 'Leadership Conference 2025' },
  ];
  
  const classes = [
    { id: 'c1', title: 'Advanced Presentation Skills' },
    { id: 'c2', title: 'Voice Projection Masterclass' },
  ];

  const handleSendAnnouncement = async () => {
    if (!announcementTitle || !announcementContent) {
      return; // Validate form
    }
    
    setIsSending(true);
    
    try {
      // Here you would implement the API call to send the announcement
      // For now, we'll simulate a successful send with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Announcement sent:', {
        title: announcementTitle,
        content: announcementContent,
        audience: targetAudience,
        eventId: targetAudience === 'event' ? selectedEvent : null,
        classId: targetAudience === 'class' ? selectedClass : null,
      });
      
      // Reset form and show success message
      setAnnouncementTitle('');
      setAnnouncementContent('');
      setTargetAudience('all');
      setSelectedEvent('');
      setSelectedClass('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error sending announcement:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Announcements</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Announcement</DialogTitle>
              <DialogDescription>
                Create an announcement to notify your users. You can target specific groups or send to everyone.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  placeholder="Enter announcement title" 
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Message Content</Label>
                <Textarea 
                  id="content" 
                  placeholder="Write your announcement message here" 
                  className="min-h-[120px]" 
                  value={announcementContent}
                  onChange={(e) => setAnnouncementContent(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="audience">Target Audience</Label>
                <Select 
                  value={targetAudience} 
                  onValueChange={setTargetAudience}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="event">Specific Event</SelectItem>
                    <SelectItem value="class">Specific Class</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {targetAudience === 'event' && (
                <div className="space-y-2">
                  <Label htmlFor="event">Select Event</Label>
                  <Select 
                    value={selectedEvent} 
                    onValueChange={setSelectedEvent}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map(event => (
                        <SelectItem key={event.id} value={event.id}>{event.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {targetAudience === 'class' && (
                <div className="space-y-2">
                  <Label htmlFor="class">Select Class</Label>
                  <Select 
                    value={selectedClass} 
                    onValueChange={setSelectedClass}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(cls => (
                        <SelectItem key={cls.id} value={cls.id}>{cls.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="send-email" className="rounded" />
                <Label htmlFor="send-email">Also send as email</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSendAnnouncement} disabled={isSending} className="gap-2">
                {isSending ? 'Sending...' : (
                  <>
                    <Send className="h-4 w-4" /> Send Announcement
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {showSuccess && (
        <div className="bg-green-100 text-green-800 p-4 rounded-md mb-4 flex items-center gap-2">
          <BellRing className="h-5 w-5" />
          Announcement sent successfully!
        </div>
      )}

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <TabsList className="grid w-full sm:w-[400px] grid-cols-3">
            <TabsTrigger value="all" className="gap-2">
              <Bell className="h-4 w-4" />
              All
            </TabsTrigger>
            <TabsTrigger value="drafts" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Drafts
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="gap-2">
              <History className="h-4 w-4" />
              Scheduled
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search announcements..."
                className="pl-8 h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="group rounded-lg border bg-card p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <BellRing className="h-5 w-5 text-blue-500" />
                    <div>
                      <h3 className="font-semibold">{announcement.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(announcement.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{announcement.content}</p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700">
                    {announcement.status}
                  </span>
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700">
                    {announcement.audience}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="drafts">
          {/* Content for draft announcements */}
          <div className="rounded-lg border bg-card p-6">
            <p className="text-center text-muted-foreground">No draft announcements</p>
          </div>
        </TabsContent>

        <TabsContent value="scheduled">
          {/* Content for scheduled announcements */}
          <div className="rounded-lg border bg-card p-6">
            <p className="text-center text-muted-foreground">No scheduled announcements</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
