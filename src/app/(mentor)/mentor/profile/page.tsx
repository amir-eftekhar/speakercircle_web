'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useSession } from 'next-auth/react';
import { User, GraduationCap, BookOpen, Clock, DollarSign, Save } from 'lucide-react';

interface MentorProfile {
  id: string;
  bio: string;
  specialization: string;
  experience: number;
  education?: string;
  certifications?: string;
  availability?: string;
  hourlyRate?: number;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export default function MentorProfilePage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [formData, setFormData] = useState({
    bio: '',
    specialization: '',
    experience: '',
    education: '',
    certifications: '',
    hourlyRate: '',
  });
  
  useEffect(() => {
    fetchProfile();
  }, []);
  
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/mentors/profile');
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData({
          bio: data.bio || '',
          specialization: data.specialization || '',
          experience: data.experience?.toString() || '',
          education: data.education || '',
          certifications: data.certifications || '',
          hourlyRate: data.hourlyRate?.toString() || '',
        });
      } else {
        // If profile doesn't exist yet, that's okay
        if (response.status === 404) {
          setProfile(null);
        } else {
          const errorData = await response.json();
          toast({
            title: 'Error',
            description: errorData.error || 'Failed to fetch profile',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const response = await fetch('/api/mentors/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        toast({
          title: 'Success',
          description: 'Profile updated successfully',
        });
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to update profile',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="p-6 text-center">
        <p>Loading profile...</p>
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Mentor Profile</CardTitle>
              <CardDescription>
                Your public profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center pt-4">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback className="text-2xl">
                  {session?.user?.name?.charAt(0) || 'M'}
                </AvatarFallback>
                {profile?.profileImage && (
                  <AvatarImage src={profile.profileImage} alt={session?.user?.name || 'Mentor'} />
                )}
              </Avatar>
              <h2 className="text-xl font-semibold">{session?.user?.name}</h2>
              <p className="text-muted-foreground">{session?.user?.email}</p>
              
              <Separator className="my-4" />
              
              <div className="w-full space-y-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Specialization</p>
                    <p className="text-sm text-muted-foreground">{profile?.specialization || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Experience</p>
                    <p className="text-sm text-muted-foreground">{profile?.experience || 0} years</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Member Since</p>
                    <p className="text-sm text-muted-foreground">
                      {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'New member'}
                    </p>
                  </div>
                </div>
                
                {profile?.hourlyRate && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Hourly Rate</p>
                      <p className="text-sm text-muted-foreground">${profile.hourlyRate}/hour</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:w-2/3">
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>
                Update your mentor profile information
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell students about yourself"
                    className="min-h-[100px]"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input
                      id="specialization"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      placeholder="e.g. Public Speaking, Debate"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      name="experience"
                      type="number"
                      value={formData.experience}
                      onChange={handleInputChange}
                      placeholder="e.g. 5"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  <Input
                    id="education"
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    placeholder="e.g. Master's in Education, Stanford University"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="certifications">Certifications</Label>
                  <Input
                    id="certifications"
                    name="certifications"
                    value={formData.certifications}
                    onChange={handleInputChange}
                    placeholder="e.g. Certified Public Speaker, Toastmasters Advanced"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                  <Input
                    id="hourlyRate"
                    name="hourlyRate"
                    type="number"
                    value={formData.hourlyRate}
                    onChange={handleInputChange}
                    placeholder="e.g. 50"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="ml-auto gap-2" disabled={saving}>
                  {saving ? 'Saving...' : (
                    <>
                      <Save className="h-4 w-4" /> Save Profile
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
