'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { BookOpen, Plus, Pencil, Trash2, Eye, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface CurriculumItem {
  id: string;
  title: string;
  description: string;
  content: string;
  type: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  mentorId: string;
}

export default function CurriculumPage() {
  const { data: session } = useSession();
  const [curriculumItems, setCurriculumItems] = useState<CurriculumItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    type: 'LESSON',
    order: '0',
    isPublished: false,
  });
  
  useEffect(() => {
    fetchCurriculumItems();
  }, []);
  
  const fetchCurriculumItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/curriculum');
      const data = await response.json();
      setCurriculumItems(data);
    } catch (error) {
      console.error('Error fetching curriculum items:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      // Get mentor profile ID
      const mentorProfileResponse = await fetch('/api/mentors/profile');
      const mentorProfileData = await mentorProfileResponse.json();
      
      if (!mentorProfileData.id) {
        alert('Error: Mentor profile not found');
        return;
      }
      
      const response = await fetch('/api/curriculum', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          order: parseInt(formData.order),
          mentorId: mentorProfileData.id
        }),
      });
      
      if (response.ok) {
        setIsDialogOpen(false);
        setFormData({
          title: '',
          description: '',
          content: '',
          type: 'LESSON',
          order: '0',
          isPublished: false,
        });
        fetchCurriculumItems();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error creating curriculum item:', error);
      alert('Failed to create curriculum item');
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'LESSON':
        return <BookOpen className="h-4 w-4" />;
      case 'QUIZ':
        return <FileText className="h-4 w-4" />;
      case 'ASSIGNMENT':
        return <FileText className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Curriculum Management</h1>
          <p className="text-muted-foreground">Create and manage your educational content</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Content
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Create New Curriculum Item</DialogTitle>
              <DialogDescription>
                Add a new lesson, quiz, or assignment to your curriculum.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => handleSelectChange('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LESSON">Lesson</SelectItem>
                        <SelectItem value="QUIZ">Quiz</SelectItem>
                        <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="order">Order</Label>
                    <Input
                      id="order"
                      name="order"
                      type="number"
                      value={formData.order}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="isPublished"
                      checked={formData.isPublished}
                      onCheckedChange={(checked) => handleSwitchChange('isPublished', checked)}
                    />
                    <Label htmlFor="isPublished">Publish immediately</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    className="min-h-[200px]"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    You can use Markdown formatting for rich content.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Item</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Curriculum Content</CardTitle>
          <CardDescription>
            Manage your lessons, quizzes, and assignments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading curriculum items...</div>
          ) : curriculumItems.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No curriculum items found</h3>
              <p className="text-muted-foreground">Create your first curriculum item to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {curriculumItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getTypeIcon(item.type)}
                        <span>{item.type.charAt(0) + item.type.slice(1).toLowerCase()}</span>
                      </div>
                    </TableCell>
                    <TableCell>{item.order}</TableCell>
                    <TableCell>
                      {item.isPublished ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="h-3 w-3" /> Published
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 flex items-center gap-1 w-fit">
                          <XCircle className="h-3 w-3" /> Draft
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
