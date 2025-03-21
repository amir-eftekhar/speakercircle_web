'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  price: z.string().optional(),
  capacity: z.string().min(1, {
    message: "Capacity is required.",
  }),
  startDate: z.date({
    required_error: "Start date is required.",
  }),
  endDate: z.date().optional(),
  schedule: z.string().min(3, {
    message: "Schedule details are required.",
  }),
  instructorId: z.string().optional(),
  isActive: z.boolean().default(true),
  requiresInterview: z.boolean().default(false),
});

type ClassFormProps = {
  params: {
    id: string;
  };
};

export default function ClassForm({ params }: ClassFormProps) {
  const { id } = params;
  const isEditing = id !== 'new';
  const router = useRouter();
  const [loading, setLoading] = useState(isEditing);
  const [instructors, setInstructors] = useState<Array<{ id: string; name: string; mentorProfile?: { id: string } }>>([]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      price: '',
      capacity: '',
      startDate: new Date(),
      endDate: undefined,
      schedule: '',
      instructorId: '',
      isActive: true,
      requiresInterview: false,
    },
  });

  useEffect(() => {
    // Fetch instructors
    const fetchInstructors = async () => {
      try {
        const response = await fetch('/api/instructors');
        if (response.ok) {
          const data = await response.json();
          setInstructors(data);
        }
      } catch (error) {
        console.error('Error fetching instructors:', error);
      }
    };
    
    fetchInstructors();
    
    // Fetch class data if editing
    if (isEditing) {
      const fetchClass = async () => {
        try {
          const response = await fetch(`/api/classes/${id}`);
          if (response.ok) {
            const data = await response.json();
            form.reset({
              title: data.title,
              description: data.description,
              price: data.price ? data.price.toString() : '',
              capacity: data.capacity.toString(),
              startDate: new Date(data.startDate),
              endDate: data.endDate ? new Date(data.endDate) : undefined as any,
              schedule: data.schedule,
              instructorId: data.instructorId || '',
              isActive: data.isActive,
              requiresInterview: data.requiresInterview,
            });
          }
        } catch (error) {
          console.error('Error fetching class:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchClass();
    }
  }, [id, isEditing, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const formData = {
      ...values,
      price: values.price ? parseFloat(values.price) : null,
      capacity: parseInt(values.capacity, 10),
    };

    try {
      const response = await fetch(
        isEditing ? `/api/classes/${id}` : '/api/classes',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        router.push('/admin/classes');
      }
    } catch (error) {
      console.error('Error saving class:', error);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? 'Edit Class' : 'Create New Class'}
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Public Speaking 101" {...field} />
                </FormControl>
                <FormDescription>
                  The name of the class as it will appear to students.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Detailed description of the class..." 
                    className="min-h-32" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Provide a detailed description of what students will learn.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (USD)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="99.99" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Leave blank for free or interest-based classes.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="20" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum number of students allowed.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="instructorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instructor</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an instructor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {instructors.map((instructor) => (
                      <SelectItem 
                        key={instructor.id} 
                        value={instructor.mentorProfile?.id || instructor.id}
                      >
                        {instructor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Select from registered instructors</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full pl-3 text-left font-normal"
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => field.onChange(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    When the class will begin.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full pl-3 text-left font-normal"
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value as Date | undefined}
                        onSelect={(date) => field.onChange(date || undefined)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    When the class will end (if applicable).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="schedule"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Schedule Details</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Every Monday and Wednesday, 4-5:30 PM" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Provide details about the class schedule.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      This class will be visible and open for enrollment.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requiresInterview"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Requires Interview</FormLabel>
                    <FormDescription>
                      Students must apply and be approved before enrolling.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/classes')}
            >
              Cancel
            </Button>
            {isEditing && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push(`/admin/classes/${id}/classroom`)}
              >
                View Classroom
              </Button>
            )}
            <Button type="submit">
              {isEditing ? 'Update Class' : 'Create Class'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 