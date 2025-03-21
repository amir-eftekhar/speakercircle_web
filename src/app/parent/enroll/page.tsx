'use client';

import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, DollarSign, User, UserPlus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

type Child = {
  id: string;
  name: string;
  email: string;
  status: string;
};

type Class = {
  id: string;
  title: string;
  description: string;
  price: number;
  startDate: string;
  endDate: string;
  location: string;
  instructor: string;
  capacity: number;
  currentCount: number;
};

export default function ParentEnrollPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    },
  });

  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      // Fetch parent's children
      fetch('/api/parent-child')
        .then(res => res.json())
        .then(data => {
          if (data.relationships) {
            // Only include approved relationships
            const approvedChildren = data.relationships
              .filter((rel: any) => rel.status === 'APPROVED')
              .map((rel: any) => ({
                id: rel.child.id,
                name: rel.child.name,
                email: rel.child.email,
                status: rel.status,
              }));
            setChildren(approvedChildren);
          }
        })
        .catch(err => {
          console.error('Error fetching children:', err);
          toast({
            title: 'Error',
            description: 'Failed to load your children',
            variant: 'destructive',
          });
        });

      // Fetch available classes
      fetch('/api/classes')
        .then(res => res.json())
        .then(data => {
          if (data.classes) {
            setClasses(data.classes);
          }
        })
        .catch(err => {
          console.error('Error fetching classes:', err);
          toast({
            title: 'Error',
            description: 'Failed to load available classes',
            variant: 'destructive',
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [session?.user?.id]);

  const handleEnroll = async (classId: string) => {
    if (!selectedChild) {
      toast({
        title: 'Selection Required',
        description: 'Please select a child to enroll',
        variant: 'destructive',
      });
      return;
    }

    setEnrolling(true);

    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId,
          childId: selectedChild,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Successfully enrolled your child in the class',
        });
        
        // Redirect to parent dashboard
        router.push('/parent/dashboard');
      } else {
        throw new Error(data.message || 'Failed to enroll');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to enroll in class',
        variant: 'destructive',
      });
    } finally {
      setEnrolling(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Enroll Your Child in a Class</h1>

      {children.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">No Connected Children</h2>
          <p className="text-muted-foreground mb-6">
            You need to connect with your children before you can enroll them in classes.
          </p>
          <Link href="/parent/dashboard?tab=add">
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Child
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <Label htmlFor="child-select" className="text-lg font-medium mb-2 block">
              Select Child
            </Label>
            <Select
              value={selectedChild}
              onValueChange={setSelectedChild}
            >
              <SelectTrigger id="child-select" className="w-full md:w-1/2">
                <SelectValue placeholder="Select a child" />
              </SelectTrigger>
              <SelectContent>
                {children.map(child => (
                  <SelectItem key={child.id} value={child.id}>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      {child.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <h2 className="text-2xl font-semibold mb-4">Available Classes</h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {classes.length > 0 ? (
              classes.map(classItem => (
                <Card key={classItem.id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>{classItem.title}</CardTitle>
                    <CardDescription>
                      {classItem.instructor && `Instructor: ${classItem.instructor}`}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{new Date(classItem.startDate).toLocaleDateString()}</span>
                      </div>
                      {classItem.location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{classItem.location}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{formatPrice(classItem.price)}</span>
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{classItem.currentCount} / {classItem.capacity} enrolled</span>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground line-clamp-3">
                      {classItem.description}
                    </p>
                  </CardContent>
                  
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => handleEnroll(classItem.id)}
                      disabled={!selectedChild || enrolling || classItem.currentCount >= classItem.capacity}
                    >
                      {classItem.currentCount >= classItem.capacity
                        ? 'Class Full'
                        : enrolling
                        ? 'Enrolling...'
                        : 'Enroll Child'}
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center p-8 bg-muted rounded-lg">
                <p className="text-muted-foreground">No classes available at this time.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
