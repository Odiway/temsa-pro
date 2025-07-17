// Role management utilities
export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER', 
  DEPARTMENT: 'DEPARTMENT',
  FIELD: 'FIELD'
} as const

export type UserRole = typeof ROLES[keyof typeof ROLES]

// Legacy role mapping for backward compatibility
export const LEGACY_ROLE_MAP = {
  'DEPARTMENT_HEAD': 'DEPARTMENT',
  'FIELD_WORKER': 'FIELD'
} as const

// Function to normalize roles
export function normalizeRole(role: string): UserRole {
  // Handle legacy role names
  if (role in LEGACY_ROLE_MAP) {
    return LEGACY_ROLE_MAP[role as keyof typeof LEGACY_ROLE_MAP]
  }
  
  // Return as-is if it's a valid role
  const validRoles = [ROLES.ADMIN, ROLES.MANAGER, ROLES.DEPARTMENT, ROLES.FIELD]
  if (validRoles.indexOf(role as UserRole) !== -1) {
    return role as UserRole
  }
  
  // Default fallback
  return ROLES.FIELD
}

// Role checking functions
export const isAdmin = (role: string) => normalizeRole(role) === ROLES.ADMIN
export const isManager = (role: string) => {
  const normalizedRole = normalizeRole(role)
  return normalizedRole === ROLES.ADMIN || normalizedRole === ROLES.MANAGER
}
export const isDepartment = (role: string) => normalizeRole(role) === ROLES.DEPARTMENT
export const isField = (role: string) => normalizeRole(role) === ROLES.FIELD

// Get role display name (Turkish)
export const getRoleDisplayName = (role: string): string => {
  const normalizedRole = normalizeRole(role)
  
  const roleNames = {
    [ROLES.ADMIN]: 'Yönetici',
    [ROLES.MANAGER]: 'Müdür',
    [ROLES.DEPARTMENT]: 'Departman Sorumlusu',
    [ROLES.FIELD]: 'Saha Çalışanı'
  }
  
  return roleNames[normalizedRole] || role
}

// Get all available roles for forms
export const getAvailableRoles = () => [
  { value: ROLES.MANAGER, label: getRoleDisplayName(ROLES.MANAGER) },
  { value: ROLES.DEPARTMENT, label: getRoleDisplayName(ROLES.DEPARTMENT) },
  { value: ROLES.FIELD, label: getRoleDisplayName(ROLES.FIELD) }
]

// Check if user has permission to manage users
export const canManageUsers = (role: string) => isManager(role)

// Check if user has permission to manage projects  
export const canManageProjects = (role: string) => isManager(role) || isDepartment(role)

// Check if user has permission to manage tasks
export const canManageTasks = (role: string) => isManager(role) || isDepartment(role)

// Check if user has permission to view analytics
export const canViewAnalytics = (role: string) => isManager(role) || isDepartment(role)
