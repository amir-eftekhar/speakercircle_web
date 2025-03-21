'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function AddChildForm() {
  const [childEmail, setChildEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/parent-child', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ childEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send connection request');
        toast({
          title: 'Error',
          description: data.error || 'Failed to send connection request',
          variant: 'destructive',
        });
      } else {
        setSuccess('Connection request sent successfully!');
        setChildEmail('');
        toast({
          title: 'Success',
          description: 'Connection request sent successfully!',
          variant: 'default',
        });
        
        // Refresh the page after a short delay
        setTimeout(() => {
          router.refresh();
        }, 1500);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a Child</CardTitle>
        <CardDescription>
          Connect with your child's account to manage their classes and enrollments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="childEmail">Child's Email Address</Label>
            <Input 
              id="childEmail" 
              type="email" 
              placeholder="Enter your child's email address" 
              value={childEmail}
              onChange={(e) => setChildEmail(e.target.value)}
              required 
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Your child will receive a notification to approve this connection.
          </p>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Sending...' : 'Send Connection Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
