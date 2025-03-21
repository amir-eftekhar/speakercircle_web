'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PlusCircle, 
  Edit, 
  Trash2, 
  Users, 
  Calendar, 
  DollarSign 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/utils';

// Define the Class type
interface Class {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  currentCount: number;
  capacity: number;
  price: number;
  isActive: boolean;
  location?: string;
  instructor?: string;
  instructorId?: string;
  instructorProfile?: {
    id: string;
    bio: string;
    specialization: string;
    user?: {
      id: string;
      name: string;
      email: string;
    }
  };
  level?: string;
  schedule?: string;
  _count?: {
    enrollments: number;
  };
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchClasses() {
      try {
        const response = await fetch('/api/admin/classes?include=instructors');
        if (response.ok) {
          const data = await response.json();
          console.log('Classes with instructors:', data.classes);
          // Handle the new API response format which includes classes in a nested property
          setClasses(data.classes || []);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchClasses();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this class?')) {
      try {
        const response = await fetch(`/api/classes/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setClasses(classes.filter(c => c.id !== id));
        }
      } catch (error) {
        console.error('Error deleting class:', error);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Classes</h1>
        <Button onClick={() => router.push('/admin/classes/new')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Class
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">Loading...</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No classes found. Create your first class to get started.
                  </TableCell>
                </TableRow>
              ) : (
                classes.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell className="font-medium">{cls.title}</TableCell>
                    <TableCell>
                      {cls.instructorProfile?.user?.name || cls.instructor || 'No instructor assigned'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(cls.startDate)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{cls.currentCount}/{cls.capacity}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {cls.price ? (
                        <div className="flex items-center">
                          <DollarSign className="mr-1 h-4 w-4 text-muted-foreground" />
                          <span>{formatCurrency(cls.price)}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Free</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={cls.isActive ? "success" : "secondary"}>
                        {cls.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => router.push(`/admin/classes/${cls.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(cls.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
} 