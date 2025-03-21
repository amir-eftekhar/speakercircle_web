'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  MessageSquare, 
  Users, 
  BookOpen, 
  Upload, 
  Calendar, 
  CheckCircle2, 
  Clock,
  PlusCircle,
  Send,
  Download,
  MoreVertical,
  Link as LinkIcon,
  Paperclip 
} from 'lucide-react';
import Link from 'next/link';

type ClassroomPageProps = {
  params: {
    id: string;
  };
};

export default function ClassroomPage({ params }: ClassroomPageProps) {
  const { id } = params;
  const [activeTab, setActiveTab] = useState('stream');
  const [announcement, setAnnouncement] = useState('');
  const [showAnnouncementInput, setShowAnnouncementInput] = useState(false);

  // Mock data
  const classData = {
    id,
    title: 'Public Speaking 101',
    instructor: 'John Smith',
    schedule: 'Tuesdays and Thursdays, 6:00 PM - 8:00 PM',
    startDate: 'March 15, 2025',
    endDate: 'May 30, 2025',
    students: [
      { id: '1', name: 'Alice Johnson', email: 'alice@example.com', avatar: '' },
      { id: '2', name: 'Bob Williams', email: 'bob@example.com', avatar: '' },
      { id: '3', name: 'Charlie Davis', email: 'charlie@example.com', avatar: '' },
      { id: '4', name: 'Diana Milford', email: 'diana@example.com', avatar: '' },
      { id: '5', name: 'Evan Parker', email: 'evan@example.com', avatar: '' },
    ],
    announcements: [
      {
        id: '1',
        author: 'John Smith',
        date: 'March 10, 2025',
        content: 'Welcome to Public Speaking 101! Please review the syllabus before our first class this Tuesday.',
        files: [
          { name: 'Syllabus.pdf', size: '420 KB' }
        ]
      },
      {
        id: '2',
        author: 'John Smith',
        date: 'March 16, 2025',
        content: 'Great first class everyone! Remember to prepare your 2-minute introduction speech for Thursday.',
        files: []
      }
    ],
    assignments: [
      {
        id: '1',
        title: 'Introduction Speech',
        dueDate: 'March 18, 2025',
        points: 20,
        status: 'active',
        description: 'Prepare a 2-minute speech introducing yourself to the class. Focus on clear articulation and body language.'
      },
      {
        id: '2',
        title: 'Persuasive Speech Outline',
        dueDate: 'March 25, 2025',
        points: 15,
        status: 'active',
        description: 'Submit an outline for your persuasive speech. Include your thesis, main points, and supporting evidence.'
      },
      {
        id: '3',
        title: 'Informative Speech',
        dueDate: 'April 8, 2025',
        points: 50,
        status: 'upcoming',
        description: 'Deliver a 5-minute informative speech on a topic of your choice. Visual aids are recommended but not required.'
      }
    ],
    materials: [
      {
        id: '1',
        title: 'Public Speaking Basics',
        type: 'PDF',
        uploadDate: 'March 12, 2025',
        size: '1.2 MB'
      },
      {
        id: '2',
        title: 'Overcoming Stage Fright',
        type: 'Video',
        uploadDate: 'March 14, 2025',
        size: '45 MB'
      },
      {
        id: '3',
        title: 'Week 1 Slides',
        type: 'PowerPoint',
        uploadDate: 'March 15, 2025',
        size: '5.8 MB'
      }
    ]
  };

  const handleAnnouncementSubmit = () => {
    if (!announcement.trim()) return;
    
    // Here you would integrate with your API to post the announcement
    console.log('New announcement:', announcement);
    
    // Reset the input and hide it
    setAnnouncement('');
    setShowAnnouncementInput(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{classData.title}</h1>
          <p className="text-muted-foreground">{classData.schedule}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/classes/${id}`}>
              <BookOpen className="mr-2 h-4 w-4" /> Class Details
            </Link>
          </Button>
          <Button>
            <MessageSquare className="mr-2 h-4 w-4" /> Message Students
          </Button>
        </div>
      </div>

      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex flex-col gap-1">
            <div className="flex gap-2 items-center">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {classData.startDate} to {classData.endDate}
              </span>
            </div>
            <div className="flex gap-2 items-center">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {classData.students.length} students enrolled
              </span>
            </div>
            <div className="flex gap-2 items-center">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Instructor: {classData.instructor}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="stream" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Stream
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Assignments
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Students
          </TabsTrigger>
          <TabsTrigger value="materials" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> Materials
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stream" className="space-y-4">
          {!showAnnouncementInput ? (
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 h-16 text-muted-foreground" 
              onClick={() => setShowAnnouncementInput(true)}
            >
              <PlusCircle className="h-4 w-4" /> 
              Announce something to your class
            </Button>
          ) : (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <Textarea
                  placeholder="Announce something to your class"
                  className="min-h-[100px]"
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                />
                <div className="flex justify-between">
                  <Button variant="outline" className="gap-2">
                    <Paperclip className="h-4 w-4" /> Attach
                  </Button>
                  <div className="space-x-2">
                    <Button variant="outline" onClick={() => setShowAnnouncementInput(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAnnouncementSubmit} disabled={!announcement.trim()}>
                      <Send className="mr-2 h-4 w-4" /> Post
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4 mt-6">
            {classData.announcements.map((announcement) => (
              <Card key={announcement.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>{announcement.author.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{announcement.author}</h3>
                        <p className="text-sm text-muted-foreground">{announcement.date}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{announcement.content}</p>
                  {announcement.files.length > 0 && (
                    <div className="mt-4">
                      {announcement.files.map((file, index) => (
                        <div key={index} className="flex items-center mt-2 p-2 border rounded-md">
                          <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{file.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">({file.size})</span>
                          <Button variant="ghost" size="icon" className="ml-auto">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">Assignments</h2>
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" /> Create Assignment
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-lg">Active</h3>
            {classData.assignments
              .filter(a => a.status === 'active')
              .map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle className="text-lg">{assignment.title}</CardTitle>
                        <CardDescription>Due: {assignment.dueDate} • {assignment.points} points</CardDescription>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{assignment.description}</p>
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-end">
                    <Button variant="outline" size="sm">View Submissions</Button>
                  </CardFooter>
                </Card>
              ))}

            <h3 className="font-medium text-lg mt-6">Upcoming</h3>
            {classData.assignments
              .filter(a => a.status === 'upcoming')
              .map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle className="text-lg">{assignment.title}</CardTitle>
                        <CardDescription>Due: {assignment.dueDate} • {assignment.points} points</CardDescription>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{assignment.description}</p>
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-end">
                    <Button variant="outline" size="sm">Edit</Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">Students ({classData.students.length})</h2>
            <div className="flex gap-2">
              <Input className="w-64" placeholder="Search students..." />
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" /> Add Student
              </Button>
            </div>
          </div>
          
          <Card>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Name</th>
                  <th className="text-left py-3 px-4 font-medium">Email</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {classData.students.map((student) => (
                  <tr key={student.id} className="border-b hover:bg-muted/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{student.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{student.email}</td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm">Message</Button>
                      <Button variant="ghost" size="sm">Profile</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="space-y-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">Class Materials</h2>
            <Button className="gap-2">
              <Upload className="h-4 w-4" /> Upload Material
            </Button>
          </div>

          <Card>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Title</th>
                  <th className="text-left py-3 px-4 font-medium">Type</th>
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">Size</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {classData.materials.map((material) => (
                  <tr key={material.id} className="border-b hover:bg-muted/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{material.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{material.type}</td>
                    <td className="py-3 px-4 text-muted-foreground">{material.uploadDate}</td>
                    <td className="py-3 px-4 text-muted-foreground">{material.size}</td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
