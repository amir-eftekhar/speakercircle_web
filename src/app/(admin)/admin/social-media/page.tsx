'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Custom Components
import SocialPost from '@/components/social-media/social-post';
import SocialMediaForm from '@/components/social-media/social-media-form';

// Define SocialMedia interface since it's not exported from @prisma/client
interface SocialMedia {
  id: string;
  platform: string;
  url: string;
  embedCode?: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export default function AdminSocialMediaPage() {
  const router = useRouter();
  const [socialMediaPosts, setSocialMediaPosts] = useState<SocialMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState<SocialMedia | undefined>(undefined);
  
  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<SocialMedia | null>(null);

  // Fetch social media posts
  const fetchSocialMedia = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/social-media');
      
      if (!response.ok) {
        throw new Error('Failed to fetch social media posts');
      }
      
      const data = await response.json();
      setSocialMediaPosts(data.socialMedia || []);
    } catch (err) {
      console.error('Error fetching social media:', err);
      setError('Failed to load social media posts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchSocialMedia();
  }, []);

  // Handle form submission
  const handleFormSubmit = async (formData: Partial<SocialMedia>) => {
    try {
      if (currentPost) {
        // Update existing post
        const response = await fetch(`/api/admin/social-media/${currentPost.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
          throw new Error('Failed to update social media post');
        }
      } else {
        // Create new post
        const response = await fetch('/api/admin/social-media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
          throw new Error('Failed to create social media post');
        }
      }
      
      // Refresh data and close form
      fetchSocialMedia();
      setIsFormOpen(false);
      setCurrentPost(undefined);
    } catch (err) {
      console.error('Error saving social media post:', err);
      setError('Failed to save social media post. Please try again.');
    }
  };

  // Handle post deletion
  const handleDeletePost = async (post: SocialMedia) => {
    try {
      const response = await fetch(`/api/admin/social-media/${post.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete social media post');
      }
      
      // Refresh data
      fetchSocialMedia();
    } catch (err) {
      console.error('Error deleting social media post:', err);
      setError('Failed to delete social media post. Please try again.');
    }
  };

  // Open edit form for a post
  const handleEditPost = (post: SocialMedia) => {
    setCurrentPost(post);
    setIsFormOpen(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Media Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your organization's social media presence
          </p>
        </div>
        
        <Button onClick={() => {
          setCurrentPost(undefined);
          setIsFormOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add New
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search social media..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-[400px] animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-6 bg-muted rounded w-1/3"></div>
              </CardHeader>
              <CardContent className="h-full">
                <div className="h-full bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : socialMediaPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {socialMediaPosts
            .filter(post => 
              post.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
              post.url.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((post) => (
              <SocialPost
                key={post.id}
                post={post}
                showControls={true}
                onEdit={handleEditPost}
                onDelete={handleDeletePost}
              />
            ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No social media posts found</CardTitle>
            <CardDescription>
              Get started by adding your first social media post
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => {
              setCurrentPost(undefined);
              setIsFormOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Social Media Post
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Social Media Form Dialog */}
      <SocialMediaForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setCurrentPost(undefined);
        }}
        onSubmit={handleFormSubmit}
        initialData={currentPost}
      />
    </div>
  );
}
