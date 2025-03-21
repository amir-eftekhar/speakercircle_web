'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plus, MessageSquare, Edit, Trash, AlertCircle } from 'lucide-react';

type Announcement = {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId?: string;
  createdAt: string;
  updatedAt: string;
};

export default function ClassAnnouncementsPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [classDetails, setClassDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch class details
        const classResponse = await fetch(`/api/classes/${params.id}`);
        if (!classResponse.ok) {
          throw new Error('Failed to fetch class details');
        }
        const classData = await classResponse.json();
        setClassDetails(classData.class);
        
        // Fetch class announcements
        const announcementsResponse = await fetch(`/api/classes/${params.id}/announcements`);
        if (!announcementsResponse.ok) {
          throw new Error('Failed to fetch class announcements');
        }
        const announcementsData = await announcementsResponse.json();
        setAnnouncements(announcementsData.announcements || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load class announcements');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchClassDetails();
    }
  }, [session, params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-12">
        <div className="bg-destructive/10 p-4 rounded-md text-destructive">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">{classDetails?.title || 'Class'} Announcements</h1>
            <p className="text-muted-foreground">
              Post and manage announcements for your students
            </p>
          </div>
          <Button asChild>
            <Link href={`/instructor/classes/${params.id}/announcements/create`}>
              <Plus className="mr-2 h-4 w-4" /> Post Announcement
            </Link>
          </Button>
        </div>

        {announcements.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Announcements</CardTitle>
              <CardDescription>
                You haven't posted any announcements for this class yet.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild>
                <Link href={`/instructor/classes/${params.id}/announcements/create`}>
                  <Plus className="mr-2 h-4 w-4" /> Post Announcement
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="space-y-6">
            {announcements.map((announcement) => (
              <Card key={announcement.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{announcement.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/instructor/classes/${params.id}/announcements/${announcement.id}/edit`}>
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Link>
                      </Button>
                      <Button variant="destructive" size="sm">
                        <Trash className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    Posted by {announcement.author} on {new Date(announcement.createdAt).toLocaleDateString()} at {new Date(announcement.createdAt).toLocaleTimeString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p>{announcement.content}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
