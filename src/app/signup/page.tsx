import SignUpForm from '@/components/forms/signup-form';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Join Speaker's Circle and start your journey
          </p>
        </div>
        <SignUpForm />
      </div>
    </div>
  );
}
