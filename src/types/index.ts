// ==========================================
// ORGANIZATION & USER MODELS
// ==========================================

export type AccountStatus = "Active" | "Suspended" | "Deactivated" | "Deleted"

export type AuthStateStatus = "INVITED" | "PASSWORD_SETUP_REQUIRED" | "LOGIN_REQUIRED" | "OTP_REQUIRED" | "AUTHENTICATED"

export type InvitationStatus = "Pending" | "Sent" | "Opened" | "Activated" | "Expired" | "Revoked"

export interface Invitation {
  id: string
  employeeId: string
  email: string
  status: InvitationStatus
  temporaryPassword?: string
  createdAt: string
  expiresAt: string
}

export interface Position {
  id: string
  name: string
  description?: string
  departmentId: string
  level: "Intern" | "Junior" | "Mid-Level" | "Senior" | "Lead" | "Head" | "Custom"
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatarUrl?: string
  status: AccountStatus
  roleId: string
  createdAt: string
  updatedAt: string
}

export interface Employee extends User {
  employeeId: string // e.g., EMP-00124
  departmentId: string
  teamId: string
  position: string
  positionId?: string
  managerId?: string
  workScheduleId: string
  joiningDate: string
  secondaryEmail?: string
  phone?: string
  address?: string
}

export interface Department {
  id: string
  name: string
  description?: string
  managerId?: string // Head of department
}

export interface Team {
  id: string
  departmentId: string
  name: string
  leadId?: string
}

// ==========================================
// RBAC & PERMISSIONS
// ==========================================

// Format: MODULE.ACTION.SCOPE
export type PermissionScope = "own" | "team" | "department" | "organization"

export interface Permission {
  id: string // e.g., "attendance.view.team"
  module: string
  action: string
  scope: PermissionScope
  description: string
}

export interface Role {
  id: string
  name: string
  description: string
  isSystem: boolean // System roles cannot be deleted
  permissions: string[] // Array of Permission IDs
  status: "Active" | "Inactive"
  userCount?: number
  createdAt: string
  updatedAt: string
}

export interface PermissionModule {
  id: string
  title: string
  iconName: string
  description: string
  permissions: {
    id: string
    label: string
    desc: string
  }[]
}

// ==========================================
// OPERATIONAL MODELS
// ==========================================

export interface WorkSchedule {
  id: string
  name: string
  workingDays: number[] // 0 = Sunday, 1 = Monday, etc.
  startTime: string // "09:00"
  endTime: string // "18:00"
  breakStartTime: string // "13:00"
  breakEndTime: string // "14:00"
  gracePeriodMinutes: number
  overtimeThresholdHours: number
  timezone: string
}

export type AttendanceStatus = "Working" | "On Break" | "Late" | "Checked Out" | "Absent" | "On Leave"

export interface AttendanceRecord {
  id: string
  employeeId: string
  date: string // YYYY-MM-DD
  checkInTime?: string
  checkOutTime?: string
  breaks: { start: string; end?: string }[]
  status: AttendanceStatus
  totalWorkHours?: number
  isLate: boolean
}

export type ReportStatus = "Draft" | "Submitted" | "Under Review" | "Needs Revision" | "Approved"

export interface WeeklyReport {
  id: string
  employeeId: string
  weekStartDate: string
  weekEndDate: string
  workedOn: string
  completed: string
  blockers: string
  nextWeekPlan: string
  status: ReportStatus
  submittedAt?: string
  reviewerId?: string
  reviewMessage?: string
  attachments: { id: string; name: string; url: string; size: number }[]
  revisions: any[] // History of previous submissions
}

export interface LeaveRequest {
  id: string
  employeeId: string
  leaveType: "Casual" | "Sick" | "Earned" | "Unpaid"
  startDate: string
  endDate: string
  reason: string
  status: "Pending" | "Approved" | "Rejected"
  reviewerId?: string
}

export interface Ticket {
  id: string
  employeeId: string // Raised by
  subject: string
  description: string
  category: "IT" | "HR" | "Facilities" | "Other"
  assignedTeamId?: string
  assignedToId?: string
  priority: "Low" | "Medium" | "High" | "Urgent"
  status: "Open" | "In Progress" | "Resolved" | "Closed"
  visibility: "Own" | "Assigned Team" | "Department" | "Organization"
  createdAt: string
  messages: { id: string; authorId: string; content: string; createdAt: string }[]
}

export interface AccessRequest {
  id: string
  employeeId: string
  requestedSystem: string
  reason: string
  status: "Pending" | "Approved" | "Rejected" | "Expired"
  reviewerId?: string
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  description: string
  link?: string
  isRead: boolean
  createdAt: string
}

export interface AuditLog {
  id: string
  userId: string // Who performed the action
  action: string // e.g., "Created Employee"
  module: string
  targetId?: string // e.g., the ID of the created employee
  ipAddress: string
  details: { before?: any; after?: any }
  createdAt: string
}

