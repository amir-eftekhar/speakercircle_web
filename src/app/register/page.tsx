'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, KeyRound, Mail, User, Eye, EyeOff, Users, UserPlus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
    childEmail: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate parent registration if applicable
    if (formData.role === 'PARENT' && !formData.childEmail) {
      setError('Please enter your child\'s email address');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Redirect to login page after successful registration
      router.push('/login?registered=true');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  return (
    <div className="container relative min-h-[calc(100vh-8rem)] grid lg:grid-cols-2 items-center gap-8 py-12">
      {/* Left side - Form */}
      <div className="lg:border-r lg:pr-8">
        <div className="mx-auto max-w-sm space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Create an Account
            </h1>
            <p className="text-muted-foreground">
              Enter your details to create your account
            </p>
          </div>
          
          <Tabs 
            defaultValue="student" 
            className="w-full" 
            onValueChange={(value) => setFormData(prev => ({ ...prev, role: value === 'parent' ? 'PARENT' : 'STUDENT' }))}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student">
                <User className="h-4 w-4 mr-2" />
                Student
              </TabsTrigger>
              <TabsTrigger value="parent">
                <Users className="h-4 w-4 mr-2" />
                Parent
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {error && (
            <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <div className="relative">
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10"
                  placeholder="Full Name"
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            <div className="grid gap-2">
              <div className="relative">
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10"
                  placeholder="Email"
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            <div className="grid gap-2">
              <div className="relative">
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10 pr-10"
                  placeholder="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {formData.role === 'PARENT' && (
              <div className="grid gap-2">
                <div className="relative">
                  <input
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10"
                    placeholder="Child's Email Address"
                    type="email"
                    id="childEmail"
                    value={formData.childEmail}
                    onChange={handleChange}
                  />
                  <UserPlus className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your child's email to connect with their account. They will need to approve your request.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="button-pop inline-flex w-full items-center justify-center rounded-md bg-primary px-8 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:block">
        <div className="space-y-8">
          <div className="relative overflow-hidden rounded-lg border p-8">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary to-primary/50" />
            <h3 className="text-2xl font-bold mb-4">Benefits of Joining</h3>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="h-2 w-2 mt-2 rounded-full bg-primary" />
                Register for exclusive workshops and events
              </li>
              <li className="flex items-start gap-2">
                <span className="h-2 w-2 mt-2 rounded-full bg-primary" />
                Track your speaking progress
              </li>
              <li className="flex items-start gap-2">
                <span className="h-2 w-2 mt-2 rounded-full bg-primary" />
                Connect with experienced mentors
              </li>
              <li className="flex items-start gap-2">
                <span className="h-2 w-2 mt-2 rounded-full bg-primary" />
                Access learning resources
              </li>
            </ul>
          </div>

          <blockquote className="border-l-4 border-primary pl-6 italic text-muted-foreground">
            "Speaker's Circle provides a supportive environment where you can develop your public speaking skills at your own pace."
            <footer className="mt-2 font-medium text-foreground">
              — Sarah Johnson, Public Speaking Coach
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
