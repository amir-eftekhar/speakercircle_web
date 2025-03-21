'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Plus, Pencil, Trash2, Eye, Users, BookOpen, Calendar, DollarSign } from 'lucide-react';

export default function MentorsPage() {
  interface MentorProfile {
    id: string;
    bio: string;
    specialization: string;
    experience: number;
    education?: string;
    certifications?: string;
    availability?: string;
    hourlyRate?: number;
    profileImage?: string;
  }

  interface Mentor {
    id: string;
    name: string;
    email: string;
    role: string;
    mentorProfile?: MentorProfile;
  }

  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bio: '',
    specialization: '',
    experience: '',
    education: '',
    certifications: '',
  });
  
  useEffect(() => {
    fetchMentors();
  }, []);
  
  const fetchMentors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/mentors');
      const data = await response.json();
      setMentors(data);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/mentors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          experience: parseInt(formData.experience)
        }),
      });
      
      if (response.ok) {
        setIsDialogOpen(false);
        setFormData({
          name: '',
          email: '',
          password: '',
          bio: '',
          specialization: '',
          experience: '',
          education: '',
          certifications: '',
        });
        fetchMentors();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error creating mentor:', error);
      alert('Failed to create mentor');
    }
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mentor Management</h1>
          <p className="text-muted-foreground">Manage mentors and their curriculum content</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Mentor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Mentor</DialogTitle>
              <DialogDescription>
                Create a new mentor account with profile information.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input
                      id="specialization"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      name="experience"
                      type="number"
                      value={formData.experience}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  <Input
                    id="education"
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certifications">Certifications</Label>
                  <Input
                    id="certifications"
                    name="certifications"
                    value={formData.certifications}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Mentor</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="mentors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="mentors" className="gap-2">
            <Users className="h-4 w-4" /> Mentors
          </TabsTrigger>
          <TabsTrigger value="curriculum" className="gap-2">
            <BookOpen className="h-4 w-4" /> Curriculum
          </TabsTrigger>
          <TabsTrigger value="schedule" className="gap-2">
            <Calendar className="h-4 w-4" /> Schedule
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <DollarSign className="h-4 w-4" /> Payments
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="mentors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mentor Profiles</CardTitle>
              <CardDescription>
                View and manage mentor profiles and their details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading mentors...</div>
              ) : mentors.length === 0 ? (
                <div className="text-center py-8">
                  <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No mentors found</h3>
                  <p className="text-muted-foreground">Add your first mentor to get started.</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {mentors.map((mentor: Mentor) => (
                    <Card key={mentor.id} className="overflow-hidden">
                      <div className="bg-primary h-24 relative">
                        <Avatar className="absolute bottom-0 left-4 transform translate-y-1/2 h-16 w-16 border-4 border-background">
                          <AvatarFallback className="text-xl">{mentor.name.charAt(0)}</AvatarFallback>
                          {mentor.mentorProfile?.profileImage && (
                            <AvatarImage src={mentor.mentorProfile.profileImage} alt={mentor.name} />
                          )}
                        </Avatar>
                      </div>
                      <CardContent className="pt-10 pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{mentor.name}</h3>
                            <p className="text-sm text-muted-foreground">{mentor.email}</p>
                          </div>
                          <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                            Mentor
                          </Badge>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <div>
                            <span className="text-sm font-medium">Specialization:</span>
                            <p className="text-sm">{mentor.mentorProfile?.specialization || 'Not specified'}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Experience:</span>
                            <p className="text-sm">{mentor.mentorProfile?.experience || 0} years</p>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <p className="text-sm line-clamp-2">
                            {mentor.mentorProfile?.bio || 'No bio available'}
                          </p>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t bg-muted/50 flex justify-between py-2">
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Eye className="h-4 w-4" /> View
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Pencil className="h-4 w-4" /> Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1 text-destructive">
                          <Trash2 className="h-4 w-4" /> Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="curriculum">
          <Card>
            <CardHeader>
              <CardTitle>Curriculum Management</CardTitle>
              <CardDescription>
                Manage curriculum content created by mentors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Mentor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Introduction to Public Speaking</TableCell>
                    <TableCell>Lesson</TableCell>
                    <TableCell>Jane Smith</TableCell>
                    <TableCell><Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Published</Badge></TableCell>
                    <TableCell className="text-muted-foreground">2 days ago</TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No curriculum items found. Add content to get started.
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto gap-2">
                <Plus className="h-4 w-4" /> Add Curriculum Item
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Mentor Schedule</CardTitle>
              <CardDescription>
                View and manage mentor availability and scheduling.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="mx-auto h-12 w-12" />
                <h3 className="mt-4 text-lg font-semibold">Schedule Management</h3>
                <p>This feature is coming soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Mentor Payments</CardTitle>
              <CardDescription>
                Manage payment rates and process payments for mentors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="mx-auto h-12 w-12" />
                <h3 className="mt-4 text-lg font-semibold">Payment Management</h3>
                <p>This feature is coming soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
