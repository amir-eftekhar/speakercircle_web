import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
  children: ReactNode;
}

export function Sidebar({ className, children }: SidebarProps) {
  return (
    <div className={cn('pb-12 w-64 border-r bg-background', className)}>
      <div className="space-y-4 py-4">
        {children}
      </div>
    </div>
  );
}
