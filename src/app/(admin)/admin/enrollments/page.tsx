'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';
import { formatDate, formatCurrency } from '@/lib/utils';
import {
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  Loader2,
  Users,
} from 'lucide-react';

// Define Enrollment type
interface Enrollment {
  id: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  class: {
    id: string;
    title: string;
    startDate: string;
  };
  payment?: {
    id: string;
    amount: number;
    status: string;
  };
}

export default function EnrollmentsPage() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentEnrollment, setCurrentEnrollment] = useState<Enrollment | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchEnrollments();
  }, [statusFilter]);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      // Build query parameters
      let queryParams = '';
      if (statusFilter !== 'all') {
        queryParams = `?status=${statusFilter}`;
      }
      if (searchTerm) {
        queryParams = queryParams ? `${queryParams}&query=${searchTerm}` : `?query=${searchTerm}`;
      }

      const response = await fetch(`/api/admin/enrollments${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setEnrollments(data.enrollments || []);
      } else {
        toast({
          title: 'Error fetching enrollments',
          description: 'Failed to load enrollments. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchEnrollments();
  };

  const openStatusDialog = (enrollment: Enrollment) => {
    setCurrentEnrollment(enrollment);
    setNewStatus(enrollment.status);
    setIsStatusDialogOpen(true);
  };

  const updateEnrollmentStatus = async () => {
    if (!currentEnrollment || !newStatus) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/enrollments/${currentEnrollment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Enrollment status updated successfully.',
        });
        setIsStatusDialogOpen(false);
        fetchEnrollments();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to update enrollment status.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating enrollment status:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return <Badge variant="success" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Approved</Badge>;
      case 'PENDING':
        return <Badge variant="outline" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'WAITLISTED':
        return <Badge variant="warning" className="flex items-center gap-1"><UserCheck className="h-3 w-3" /> Waitlisted</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Enrollments</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              className="pl-8 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="WAITLISTED">Waitlisted</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleSearch}>
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : enrollments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No enrollments found</p>
            <p className="text-sm text-muted-foreground">
              {searchTerm || statusFilter !== 'all' ? 'Try different search criteria' : 'No students have enrolled yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Enrollment Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.map((enrollment) => (
                <TableRow key={enrollment.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{enrollment.user.name}</p>
                      <p className="text-sm text-muted-foreground">{enrollment.user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{enrollment.class.title}</TableCell>
                  <TableCell>{formatDate(enrollment.createdAt)}</TableCell>
                  <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                  <TableCell>
                    {enrollment.payment ? (
                      <div>
                        <p className="font-medium">{formatCurrency(enrollment.payment.amount)}</p>
                        <Badge variant={enrollment.payment.status === 'COMPLETED' ? 'success' : 'outline'}>
                          {enrollment.payment.status}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No payment</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openStatusDialog(enrollment)}>
                          Change Status
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/admin/users/${enrollment.user.id}`)}>
                          View Student
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/admin/classes/${enrollment.class.id}`)}>
                          View Class
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Update Status Dialog */}
      <AlertDialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Enrollment Status</AlertDialogTitle>
            <AlertDialogDescription>
              Change the status for {currentEnrollment?.user?.name}'s enrollment in {currentEnrollment?.class?.title}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="status">Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="w-full mt-2">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="WAITLISTED">Waitlisted</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={updateEnrollmentStatus} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}