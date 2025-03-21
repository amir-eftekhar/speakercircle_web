'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCheck, UserX, User } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

type ParentRequest = {
  id: string;
  parentId: string;
  status: string;
  createdAt: string;
  parent: {
    id: string;
    name: string;
    email: string;
  };
};

interface ParentRequestsProps {
  userId?: string;
}

export default function ParentRequests({ userId }: ParentRequestsProps) {
  const [parentRequests, setParentRequests] = useState<ParentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

  const fetchParentRequests = async () => {
    try {
      // Use the specific endpoint for student's parent requests
      const response = await fetch('/api/student/parent-requests');
      const data = await response.json();
      
      if (data.requests) {
        setParentRequests(data.requests);
      } else if (data.relationships) {
        // Fallback to the old endpoint format if needed
        setParentRequests(data.relationships);
      }
    } catch (error) {
      console.error('Error fetching parent requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load parent connection requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParentRequests();
  }, []);

  // Handle parent request response
  const handleParentRequest = async (requestId: string, accept: boolean) => {
    setProcessingRequestId(requestId);
    try {
      const response = await fetch('/api/parent-child', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          relationshipId: requestId,
          status: accept ? 'APPROVED' : 'REJECTED',
        }),
      });
      
      if (response.ok) {
        // Update local state
        setParentRequests(prev => 
          prev.map(req => 
            req.id === requestId 
              ? { ...req, status: accept ? 'APPROVED' : 'REJECTED' } 
              : req
          )
        );
        
        toast({
          title: accept ? 'Parent request accepted' : 'Parent request rejected',
          description: accept 
            ? 'Your parent can now manage your enrollments' 
            : 'The parent request has been rejected',
          variant: accept ? 'default' : 'destructive',
        });
      } else {
        throw new Error('Failed to process request');
      }
    } catch (err) {
      console.error('Error handling parent request:', err);
      toast({
        title: 'Error',
        description: 'Failed to process the parent request',
        variant: 'destructive',
      });
    } finally {
      setProcessingRequestId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const pendingRequests = parentRequests.filter(req => req.status === 'PENDING');
  const approvedRequests = parentRequests.filter(req => req.status === 'APPROVED');
  const rejectedRequests = parentRequests.filter(req => req.status === 'REJECTED');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Parent Connection Requests</h2>
      
      {pendingRequests.length === 0 && approvedRequests.length === 0 && rejectedRequests.length === 0 ? (
        <div className="text-center p-8 bg-muted rounded-lg">
          <p className="text-muted-foreground">No parent connection requests</p>
        </div>
      ) : (
        <>
          {pendingRequests.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Pending Requests</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingRequests.map(request => (
                  <Card key={request.id} className="border-yellow-200">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">Connection Request</CardTitle>
                        <Badge variant="outline" className="bg-yellow-100">Pending</Badge>
                      </div>
                      <CardDescription>
                        From: {request.parent.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm">{request.parent.email}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between gap-2">
                      <Button 
                        variant="default" 
                        className="w-full"
                        onClick={() => handleParentRequest(request.id, true)}
                        disabled={processingRequestId === request.id}
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={() => handleParentRequest(request.id, false)}
                        disabled={processingRequestId === request.id}
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {approvedRequests.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Connected Parents</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {approvedRequests.map(request => (
                  <Card key={request.id} className="border-green-200">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{request.parent.name}</CardTitle>
                        <Badge variant="outline" className="bg-green-100">Connected</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm">{request.parent.email}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {rejectedRequests.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Rejected Requests</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {rejectedRequests.map(request => (
                  <Card key={request.id} className="border-red-200">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{request.parent.name}</CardTitle>
                        <Badge variant="outline" className="bg-red-100">Rejected</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm">{request.parent.email}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
