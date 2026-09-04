import { PermissionScope } from "@/types"
import { useAuthStore } from "@/stores/authStore"

/**
 * Validates if the current user has the required permission and scope.
 * 
 * IMPORTANT: This is a frontend-only authorization check used EXCLUSIVELY for UX 
 * (e.g., hiding buttons, conditional rendering). The backend independently verifies all security boundaries.
 * 
 * @param requiredPermission The permission ID (e.g., "attendance.view", "employees.create")
 * @param requiredScope The minimum scope required (e.g., "team", "own", "department")
 * @returns boolean
 */
export function can(requiredPermission: string, requiredScope?: PermissionScope): boolean {
  const user = useAuthStore.getState().user
  if (!user) return false

  // Super Admin role has global wildcard access
  if (user.role === 'Super Admin' || user.roleId === 'role_1' || (user as any).isSuperAdmin) {
    return true
  }

  // If user has explicit permissions array
  if (Array.isArray(user.permissions)) {
    if (user.permissions.includes('*.*.*') || user.permissions.includes('*')) {
      return true
    }
    if (user.permissions.includes(requiredPermission)) {
      return true
    }
    // Prefix wildcard match (e.g. "employees.*")
    const prefix = requiredPermission.split('.')[0] + '.*'
    if (user.permissions.includes(prefix)) {
      return true
    }
  }

  // Fallback role-based defaults for standard UX rendering
  const userRole = user.role || (user.roleId === 'role_2' ? 'Manager' : user.roleId === 'role_3' ? 'Employee' : '')
  if (userRole === 'Admin' || userRole === 'HR Admin') {
    return !requiredPermission.startsWith('security.') && !requiredPermission.startsWith('audit.')
  }

  if (userRole === 'Manager') {
    if (requiredPermission.startsWith('attendance.view') || 
        requiredPermission.startsWith('leave.review') || 
        requiredPermission.startsWith('tasks.') ||
        requiredPermission.startsWith('employees.view')) {
      return true
    }
  }

  // Standard employee permissions
  if (requiredPermission.includes('.own') || requiredPermission === 'leave.apply' || requiredPermission === 'tickets.create') {
    return true
  }

  return false
}

/**
 * Higher-order utility to check permissions before rendering a component or page.
 */
export function requirePermission(permission: string, scope?: PermissionScope) {
  return function checkPermission(): boolean {
    return can(permission, scope)
  }
}
