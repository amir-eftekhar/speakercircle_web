'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

export default function AddChildForm() {
  const [childEmail, setChildEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/parent-child', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ childEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Connection request sent',
          description: 'Your child will receive a notification to approve this connection.',
        });
        setChildEmail('');
        router.refresh();
      } else {
        throw new Error(data.error || 'Failed to send connection request');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader className="bg-primary/5">
          <CardTitle className="text-2xl flex items-center">
            <UserPlus className="h-6 w-6 mr-2 text-primary" />
            Connect with Your Child
          </CardTitle>
          <CardDescription className="text-base">
            Send a connection request to your child's account to manage their classes and enrollments.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="childEmail" className="text-base">Child's Email Address</Label>
              <Input 
                id="childEmail" 
                type="email" 
                placeholder="Enter your child's email address" 
                value={childEmail}
                onChange={(e) => setChildEmail(e.target.value)}
                required 
                className="h-12 text-base"
              />
            </div>
            <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>How it works:</strong> Your child will receive a notification to approve this connection. 
                Once approved, you'll be able to view and manage their class enrollments.
              </p>
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-base" 
              disabled={isSubmitting}
              size="lg"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-2">⟳</span> Sending Request...
                </span>
              ) : (
                <>
                  <UserPlus className="h-5 w-5 mr-2" />
                  Send Connection Request
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="bg-muted/30 flex flex-col items-start">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Your child must have an existing account with the email address you provide.
            If they don't have an account yet, please ask them to register first.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
