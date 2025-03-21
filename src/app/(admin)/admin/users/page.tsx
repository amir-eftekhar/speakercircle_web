'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Shield,
  UserCircle,
  GraduationCap,
  Users2,
  Pencil,
  Trash2,
  X,
  Check,
  AlertCircle,
  Loader2,
  BookOpen,
  User as UserIcon
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';
import { formatDate } from '@/lib/utils';

// Define User interface
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  parents?: UserBasic[];
  children?: UserBasic[];
  enrollments?: EnrollmentBasic[];
  childCount?: number;
  parentCount?: number;
  enrollmentCount?: number;
  _count?: {
    enrollments: number;
    payments: number;
    eventRegistrations: number;
  };
}

interface UserBasic {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface EnrollmentBasic {
  id: string;
  status: string;
  class: {
    id: string;
    title: string;
    instructor?: string;
  };
}

// Define role options with display names and colors
const roleOptions = [
  { value: 'STUDENT', label: 'Student', color: 'blue' },
  { value: 'PARENT', label: 'Parent', color: 'purple' },
  { value: 'MENTOR', label: 'Mentor', color: 'teal' },
  { value: 'INSTRUCTOR', label: 'Instructor', color: 'indigo' },
  { value: 'ADMIN', label: 'Admin', color: 'red' },
  { value: 'T1_ADMIN', label: 'Admin (Level 1)', color: 'red' },
  { value: 'T2_ADMIN', label: 'Admin (Level 2)', color: 'red' },
  { value: 'T3_MANAGER', label: 'Manager', color: 'amber' },
  { value: 'GAVELIER_PRESIDENT', label: 'Gavelier President', color: 'green' },
  { value: 'GAVELIER_TREASURER', label: 'Gavelier Treasurer', color: 'green' },
  { value: 'GAVELIER_SECRETARY', label: 'Gavelier Secretary', color: 'green' },
  { value: 'GAVELIER_VP_EDUCATION', label: 'Gavelier VP Education', color: 'green' },
  { value: 'GAVELIER_VP_MEMBERSHIP', label: 'Gavelier VP Membership', color: 'green' },
  { value: 'GAVELIER_VP_PR', label: 'Gavelier VP PR', color: 'green' },
  { value: 'GUEST', label: 'Guest', color: 'gray' },
];

// Map role values to icons
const roleIcons: Record<string, any> = {
  STUDENT: GraduationCap,
  PARENT: Users2,
  MENTOR: GraduationCap,
  INSTRUCTOR: GraduationCap,
  ADMIN: Shield,
  T1_ADMIN: Shield,
  T2_ADMIN: Shield,
  T3_MANAGER: Shield,
  GAVELIER_PRESIDENT: Shield,
  GAVELIER_TREASURER: Shield,
  GAVELIER_SECRETARY: Shield,
  GAVELIER_VP_EDUCATION: Shield,
  GAVELIER_VP_MEMBERSHIP: Shield,
  GAVELIER_VP_PR: Shield,
  GUEST: UserCircle,
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFilter, setCurrentFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch users on component mount and when filter changes
  useEffect(() => {
    fetchUsers();
  }, [currentFilter]);

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Build query parameters
      let queryParams = '';
      if (currentFilter !== 'all') {
        queryParams = `?role=${currentFilter.toUpperCase()}`;
      }
      if (searchTerm) {
        queryParams = queryParams ? `${queryParams}&query=${searchTerm}` : `?query=${searchTerm}`;
      }

      const response = await fetch(`/api/admin/users${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        toast({
          title: 'Error fetching users',
          description: 'Failed to load users. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    fetchUsers();
  };

  // Handle input change for forms
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle role change
  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  // Reset form data
  const resetFormData = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'STUDENT',
    });
  };

  // Open edit dialog
  const openEditDialog = (user: User) => {
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't set password when editing
      role: user.role,
    });
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (user: User) => {
    setCurrentUser(user);
    setIsDeleteDialogOpen(true);
  };

  // Create new user
  const createUser = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'User created successfully.',
        });
        setIsCreateDialogOpen(false);
        resetFormData();
        fetchUsers();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to create user.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update user
  const updateUser = async () => {
    if (!currentUser || !formData.name || !formData.email || !formData.role) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };

      // Only include password if it was provided
      if (formData.password) {
        Object.assign(updateData, { password: formData.password });
      }

      const response = await fetch(`/api/admin/users/${currentUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'User updated successfully.',
        });
        setIsEditDialogOpen(false);
        resetFormData();
        fetchUsers();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to update user.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete user
  const deleteUser = async () => {
    if (!currentUser) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/users/${currentUser.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'User deleted successfully.',
        });
        setIsDeleteDialogOpen(false);
        fetchUsers();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to delete user.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get role display info
  const getRoleInfo = (roleValue: string) => {
    const role = roleOptions.find(r => r.value === roleValue) || { label: roleValue, color: 'gray' };
    return role;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users Management</h1>
        <Button onClick={() => {
          resetFormData();
          setIsCreateDialogOpen(true);
        }} className="gap-2">
          <UserPlus className="h-4 w-4" /> Add User
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4" onValueChange={setCurrentFilter}>
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              <Users className="h-4 w-4" />
              All Users
            </TabsTrigger>
            <TabsTrigger value="STUDENT" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="PARENT" className="gap-2">
              <Users2 className="h-4 w-4" />
              Parents
            </TabsTrigger>
            <TabsTrigger value="T1_ADMIN" className="gap-2">
              <Shield className="h-4 w-4" />
              Admins
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users..."
                className="pl-8 h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button variant="outline" size="icon" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* User List Content */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No users found</p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? 'Try a different search term' : 'Create your first user to get started'}
                </p>
                <Button onClick={() => {
                  resetFormData();
                  setIsCreateDialogOpen(true);
                }} className="mt-4 gap-2">
                  <UserPlus className="h-4 w-4" /> Add User
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {users.map((user) => {
                const RoleIcon = roleIcons[user.role] || UserCircle;
                const roleInfo = getRoleInfo(user.role);
                return (
                  <div
                    key={user.id}
                    className="group rounded-lg border bg-card p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <RoleIcon className="h-10 w-10 text-muted-foreground" />
                          <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{user.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </span>
                            {(user.childCount ?? 0) > 0 && (
                              <span className="flex items-center gap-1">
                                <Users2 className="h-3 w-3" />
                                {user.childCount} {user.childCount === 1 ? 'Child' : 'Children'}
                              </span>
                            )}
                            {(user.parentCount ?? 0) > 0 && (
                              <span className="flex items-center gap-1">
                                <UserIcon className="h-3 w-3" />
                                {user.parentCount} {user.parentCount === 1 ? 'Parent' : 'Parents'}
                              </span>
                            )}
                            {(user.enrollmentCount ?? 0) > 0 && (
                              <span className="flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                {user.enrollmentCount} {user.enrollmentCount === 1 ? 'Class' : 'Classes'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-${roleInfo.color}-100 text-${roleInfo.color}-700`}>
                            {roleInfo.label}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            Joined {formatDate(user.createdAt)}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}`)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(user)}>
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => openDeleteDialog(user)}>
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Tabs>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system. Fill in all required fields.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createUser} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create User'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information. Leave password blank to keep current password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">Password (leave blank to keep current)</Label>
              <Input
                id="edit-password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateUser} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update User'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteUser} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}