// Define Role type since it's not exported from Prisma
type Role = 'STUDENT' | 'PARENT' | 'ADMIN' | 'T1_ADMIN' | 'T2_ADMIN' | 'T3_MANAGER' | 'GAVELIER_PRESIDENT' | 'GAVELIER_TREASURER' | 'GAVELIER_SECRETARY' | 'GAVELIER_VP_EDUCATION' | 'GAVELIER_VP_MEMBERSHIP' | 'GAVELIER_VP_PR' | 'MENTOR' | 'GUEST';

type Permission = {
  create: Role[];
  read: Role[];
  update: Role[];
  delete: Role[];
};

type PermissionConfig = {
  [key: string]: Permission;
};

export const permissions: PermissionConfig = {
  events: {
    create: ['GAVELIER_PRESIDENT', 'GAVELIER_SECRETARY', 'T1_ADMIN', 'T2_ADMIN'],
    read: ['STUDENT', 'PARENT', 'MENTOR', 'GAVELIER_PRESIDENT', 'GAVELIER_SECRETARY', 'GAVELIER_TREASURER', 'GAVELIER_VP_EDUCATION', 'GAVELIER_VP_MEMBERSHIP', 'GAVELIER_VP_PR', 'T1_ADMIN', 'T2_ADMIN', 'T3_MANAGER'],
    update: ['GAVELIER_PRESIDENT', 'GAVELIER_SECRETARY', 'T1_ADMIN', 'T2_ADMIN'],
    delete: ['GAVELIER_PRESIDENT', 'T1_ADMIN']
  },
  announcements: {
    create: ['GAVELIER_PRESIDENT', 'GAVELIER_VP_PR', 'T1_ADMIN', 'T2_ADMIN', 'MENTOR'],
    read: ['STUDENT', 'PARENT', 'MENTOR', 'GAVELIER_PRESIDENT', 'GAVELIER_SECRETARY', 'GAVELIER_TREASURER', 'GAVELIER_VP_EDUCATION', 'GAVELIER_VP_MEMBERSHIP', 'GAVELIER_VP_PR', 'T1_ADMIN', 'T2_ADMIN', 'T3_MANAGER'],
    update: ['GAVELIER_PRESIDENT', 'GAVELIER_VP_PR', 'T1_ADMIN', 'T2_ADMIN', 'MENTOR'],
    delete: ['GAVELIER_PRESIDENT', 'T1_ADMIN']
  },
  payments: {
    create: ['PARENT', 'GAVELIER_TREASURER', 'T1_ADMIN'],
    read: ['PARENT', 'GAVELIER_TREASURER', 'T1_ADMIN', 'MENTOR'],
    update: ['GAVELIER_TREASURER', 'T1_ADMIN'],
    delete: ['T1_ADMIN']
  },
  students: {
    create: ['GAVELIER_VP_MEMBERSHIP', 'T1_ADMIN', 'T2_ADMIN', 'MENTOR'],
    read: ['STUDENT', 'PARENT', 'MENTOR', 'GAVELIER_PRESIDENT', 'GAVELIER_VP_EDUCATION', 'GAVELIER_VP_MEMBERSHIP', 'T1_ADMIN', 'T2_ADMIN'],
    update: ['GAVELIER_VP_EDUCATION', 'GAVELIER_VP_MEMBERSHIP', 'T1_ADMIN', 'T2_ADMIN', 'MENTOR'],
    delete: ['T1_ADMIN']
  },
  projects: {
    create: ['STUDENT', 'MENTOR', 'GAVELIER_VP_EDUCATION', 'T1_ADMIN', 'T2_ADMIN'],
    read: ['STUDENT', 'PARENT', 'MENTOR', 'GAVELIER_PRESIDENT', 'GAVELIER_VP_EDUCATION', 'T1_ADMIN', 'T2_ADMIN'],
    update: ['STUDENT', 'MENTOR', 'GAVELIER_VP_EDUCATION', 'T1_ADMIN', 'T2_ADMIN'],
    delete: ['GAVELIER_VP_EDUCATION', 'T1_ADMIN']
  },
  curriculum: {
    create: ['MENTOR', 'T1_ADMIN', 'T2_ADMIN', 'GAVELIER_VP_EDUCATION'],
    read: ['STUDENT', 'PARENT', 'MENTOR', 'GAVELIER_PRESIDENT', 'GAVELIER_VP_EDUCATION', 'T1_ADMIN', 'T2_ADMIN'],
    update: ['MENTOR', 'GAVELIER_VP_EDUCATION', 'T1_ADMIN', 'T2_ADMIN'],
    delete: ['GAVELIER_VP_EDUCATION', 'T1_ADMIN']
  }
};

export function hasPermission(userRole: Role, resource: string, action: keyof Permission): boolean {
  const resourcePermissions = permissions[resource];
  if (!resourcePermissions) return false;
  
  const allowedRoles = resourcePermissions[action];
  return allowedRoles.includes(userRole as any);
}

export function canAccessDashboard(role: Role): boolean {
  return role !== 'GUEST';
}

export function canAccessAdminPanel(role: Role): boolean {
  return [
    'GAVELIER_PRESIDENT',
    'GAVELIER_TREASURER',
    'GAVELIER_SECRETARY',
    'GAVELIER_VP_EDUCATION',
    'GAVELIER_VP_MEMBERSHIP',
    'GAVELIER_VP_PR',
    'T1_ADMIN',
    'T2_ADMIN',
    'T3_MANAGER',
    'MENTOR'
  ].includes(role as any);
}
