'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, DollarSign, Users, CheckCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Class {
  id: string;
  title: string;
  description: string;
  price: number | null;
  capacity: number;
  startDate: string;
  endDate: string | null;
  schedule: string;
  location: string | null;
  instructor: string | null;
  level: string | null;
  isActive: boolean;
  imageData: string | null;
  currentCount: number;
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClasses() {
      try {
        const response = await fetch('/api/classes');
        if (response.ok) {
          const data = await response.json();
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

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function formatCurrency(amount: number | null) {
    if (amount === null) return 'Free';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Our Classes</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover our range of public speaking and communication classes designed to help you become a confident and effective speaker.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : classes.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium">No classes available at the moment</h3>
          <p className="mt-2 text-muted-foreground">Please check back later for upcoming classes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {classes.filter(cls => cls.isActive).map((cls) => (
            <div key={cls.id} className="border rounded-lg overflow-hidden bg-card shadow-sm hover:shadow-md transition-shadow">
              {cls.imageData ? (
                <div className="relative h-48 w-full">
                  <Image 
                    src={cls.imageData}
                    alt={cls.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ) : (
                <div className="bg-muted h-48 flex items-center justify-center">
                  <Calendar className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{cls.title}</h3>
                <p className="text-muted-foreground mb-4 line-clamp-2">{cls.description}</p>
                
                <div className="space-y-2 mb-4">
                  {cls.instructor && (
                    <div className="flex items-center text-sm">
                      <span className="font-medium mr-2">Instructor:</span> {cls.instructor}
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Starts {formatDate(cls.startDate)}</span>
                  </div>
                  
                  {cls.location && (
                    <div className="flex items-center text-sm">
                      <span className="font-medium mr-2">Location:</span> {cls.location}
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{cls.currentCount}/{cls.capacity} enrolled</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{formatCurrency(cls.price)}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Link 
                    href={`/classes/${cls.id}`}
                    className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-10 px-4 py-2 w-full text-sm font-medium"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
