import { useSession } from 'next-auth/react';
import { hasPermission, canAccessDashboard, canAccessAdminPanel } from '@/lib/permissions';
import { Role } from '@prisma/client';

export function usePermissions() {
  const { data: session } = useSession();
  const userRole = session?.user?.role as Role || 'GUEST';

  return {
    can: (resource: string, action: 'create' | 'read' | 'update' | 'delete') => 
      hasPermission(userRole, resource, action),
    canAccessDashboard: () => canAccessDashboard(userRole),
    canAccessAdminPanel: () => canAccessAdminPanel(userRole),
    role: userRole
  };
}
