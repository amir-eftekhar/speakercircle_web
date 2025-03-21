'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, Calendar } from 'lucide-react';
import Link from 'next/link';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<any>(null);

  useEffect(() => {
    if (sessionId) {
      // In a real app, you would verify the session with your backend
      // For now, we'll just simulate a successful confirmation
      setLoading(false);
      setConfirmation({
        eventTitle: 'Event Registration',
        date: new Date().toLocaleDateString(),
        confirmationNumber: `CONF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      });
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="container py-12">
        <div className="max-w-lg mx-auto text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
            <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-12">
        <div className="max-w-lg mx-auto text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <Link
            href="/events"
            className="inline-block px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Return to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-lg mx-auto text-center space-y-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Registration Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for registering for {confirmation?.eventTitle}
          </p>
        </div>
        <div className="p-6 rounded-lg bg-muted/50 space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Calendar className="w-4 h-4" />
            <span>{confirmation?.date}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Confirmation Number: {confirmation?.confirmationNumber}
          </div>
        </div>
        <div className="pt-4">
          <Link
            href="/events"
            className="inline-block px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            View More Events
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-12">
          <div className="max-w-lg mx-auto text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
              <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
            </div>
          </div>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
