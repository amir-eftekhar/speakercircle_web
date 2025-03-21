import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredRole?: string;
  resource?: string;
  action?: 'create' | 'read' | 'update' | 'delete';
};

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  resource, 
  action = 'read' 
}: ProtectedRouteProps) {
  const router = useRouter();
  const { can, role } = usePermissions();

  useEffect(() => {
    if (requiredRole && role !== requiredRole) {
      router.push('/');
      return;
    }

    if (resource && !can(resource, action)) {
      router.push('/');
      return;
    }
  }, [requiredRole, resource, action, can, role, router]);

  return <>{children}</>;
}
