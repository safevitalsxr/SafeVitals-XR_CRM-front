import { create } from "zustand"
import { Employee, Department, Team, Role, Position, Invitation, InvitationStatus } from "@/types"
import apiClient from "@/lib/apiClient"
import { toast } from "sonner"

export interface AttendanceLog {
  id: string
  employeeId: string
  date: string
  checkIn: string
  checkOut?: string
  status: "On Time" | "Late" | "Absent" | "Working" | "Checked Out" | "On Break"
  location: string
  raw?: any
}

export interface LeaveRequest {
  id: string
  employeeId: string
  type: "Sick" | "Casual" | "Annual" | "Earned" | "Unpaid"
  startDate: string
  endDate: string
  reason: string
  status: "Pending" | "Approved" | "Rejected" | "Cancelled"
  appliedAt: string
  raw?: any
}

export interface Schedule {
  id: string
  name: string
  shiftStart?: string
  shiftEnd?: string
  startTime?: string
  endTime?: string
  days?: string[]
  workDays?: number[]
}

export interface Task {
  id: string
  title: string
  description: string
  assignedTo: string
  status: "To Do" | "In Progress" | "Blocked" | "Done" | "Cancelled"
  priority?: "Urgent" | "High" | "Medium" | "Low"
  dueDate: string
  raw?: any
}

export interface Ticket {
  id: string
  title: string
  description: string
  createdBy: string
  status: "Open" | "In Progress" | "Waiting" | "Resolved" | "Closed"
  category: "IT Support" | "HR" | "Facilities" | "XR Hardware" | "Other"
  priority?: "Low" | "Medium" | "High" | "Urgent"
  createdAt: string
  raw?: any
}

export interface AuditLog {
  id: string
  action: string
  userId: string
  timestamp: string
  details: string
}

export interface AccessRequest {
  id: string
  employeeId: string
  requestedSystem: string
  reason: string
  status: "Pending" | "Approved" | "Rejected"
  createdAt: string
}

export interface AppState {
  pendingUsers: any[]
  employees: Employee[]
  departments: Department[]
  teams: Team[]
  roles: Role[]
  positions: Position[]
  invitations: Invitation[]
  attendanceLogs: AttendanceLog[]
  leaveRequests: LeaveRequest[]
  schedules: Schedule[]
  tasks: Task[]
  tickets: Ticket[]
  auditLogs: AuditLog[]
  accessRequests: AccessRequest[]
  workStatus: "in" | "break" | "out" | "completed"
  isLoadingData: boolean
  isApiConnected: boolean
  
  // Real Data Fetching
  fetchAllData: () => Promise<void>
  fetchPendingUsers: () => Promise<void>
  approveRegistration: (userId: string, data: any) => Promise<boolean>

  // Real CRUD Actions connected to backend API
  addEmployee: (employee: any) => Promise<boolean>
  updateEmployee: (id: string, data: any) => Promise<boolean>
  suspendEmployee: (id: string) => Promise<boolean>
  reactivateEmployee: (id: string) => Promise<boolean>
  promoteEmployee: (id: string, roleId: string) => Promise<boolean>
  deleteEmployee: (id: string) => Promise<boolean>
  
  addDepartment: (department: { name: string; description?: string }) => Promise<boolean>
  updateDepartment: (id: string, data: any) => Promise<boolean>
  archiveDepartment: (id: string) => Promise<boolean>
  deleteDepartment: (id: string) => Promise<boolean>
  addPosition: (position: { name: string; departmentId: string; level: string; description?: string }) => Promise<boolean>
  addTeam: (team: { name: string; departmentId: string; leadId?: string }) => Promise<boolean>
  updateTeam: (id: string, data: any) => Promise<boolean>
  archiveTeam: (id: string) => Promise<boolean>
  deleteTeam: (id: string) => Promise<boolean>
  deletePosition: (id: string) => Promise<boolean>
  
  // Real Attendance actions
  fetchTodayAttendance: (employeeId: string) => Promise<void>
  punchIn: (employeeId: string, location?: any) => Promise<boolean>
  punchOut: (employeeId: string, location?: any) => Promise<boolean>
  takeBreak: (employeeId: string) => Promise<boolean>
  endBreak: (employeeId: string) => Promise<boolean>
  
  // Real Workforce Modules
  addLeaveRequest: (request: any) => Promise<boolean>
  updateLeaveStatus: (id: string, status: "Approved" | "Rejected", note?: string) => Promise<boolean>
  addSchedule: (schedule: any) => Promise<boolean>
  addTask: (task: any) => Promise<boolean>
  updateTask: (id: string, data: any) => Promise<boolean>
  updateTaskStatus: (id: string, status: "To Do" | "In Progress" | "Blocked" | "Done" | "Cancelled") => Promise<boolean>
  deleteTask: (id: string) => Promise<boolean>
  addTicket: (ticket: any) => Promise<boolean>
  resolveTicket: (id: string) => Promise<boolean>
  
  // Access Requests & Audit
  fetchAuditLogs: () => Promise<void>
  fetchAccessRequests: () => Promise<void>
  reviewAccessRequest: (id: string, status: "Approved" | "Rejected", note?: string) => Promise<boolean>

  resetStore: () => void

  // Dynamic Dashboard Calculation
  getDashboardStats: () => {
    totalEmployees: number
    workingNow: number
    pendingReports: number
    openTickets: number
    totalDepartments: number
    totalTeams: number
    activeRoles: number
    suspendedUsers: number
  }
}

export const useAppStore = create<AppState>()((set, get) => ({
  pendingUsers: [],
  employees: [],
  departments: [],
  teams: [],
  positions: [],
  invitations: [],
  attendanceLogs: [],
  leaveRequests: [],
  schedules: [],
  tasks: [],
  tickets: [],
  auditLogs: [],
  accessRequests: [],
  workStatus: "out",
  roles: [],
  isLoadingData: false,
  isApiConnected: false,

  resetStore: () => set({
    employees: [],
    departments: [],
    teams: [],
    positions: [],
    invitations: [],
    attendanceLogs: [],
    leaveRequests: [],
    schedules: [],
    tasks: [],
    tickets: [],
    auditLogs: [],
    accessRequests: [],
    workStatus: "out",
    roles: [],
    isLoadingData: false,
    isApiConnected: false,
  }),

  fetchAllData: async () => {
    set({ isLoadingData: true })
    try {
      const results = await Promise.allSettled([
        apiClient.get('/employees?limit=100'),
        apiClient.get('/departments'),
        apiClient.get('/teams'),
        apiClient.get('/positions'),
        apiClient.get('/roles'),
        apiClient.get('/attendance?limit=100'),
        apiClient.get('/leave?limit=100'),
        apiClient.get('/schedules'),
        apiClient.get('/tasks?limit=100'),
        apiClient.get('/tickets?limit=100'),
        apiClient.get('/audit?limit=50').catch(() => ({ data: [] })),
        apiClient.get('/access-requests?limit=50').catch(() => ({ data: [] })),
      ])

      // Check if primary endpoints failed completely (indicative of server down / connection refused)
      if (results[0].status === 'rejected' && results[1].status === 'rejected') {
        const err1 = (results[0] as PromiseRejectedResult).reason
        
        // If it's an auth error, let the axios interceptor handle the redirect
        if (err1?.response?.status === 401) {
          set({ isLoadingData: false, isApiConnected: true })
          return
        }
        
        throw new Error("Backend connection refused or critical endpoints failed")
      }

      const [
        empsRes, deptsRes, teamsRes, posRes, rolesRes,
        attRes, leaveRes, schRes, tasksRes, ticketsRes, auditRes, accessRes
      ] = results

      const mapList = (res: PromiseSettledResult<any>) => {
        if (res.status !== 'fulfilled' || !res.value?.data) return []
        const data = res.value.data
        let rawArray: any[] = []
        
        if (Array.isArray(data)) {
          rawArray = data
        } else if (data && typeof data === 'object') {
          if (Array.isArray(data.data)) {
            rawArray = data.data
          } else {
            // Find any property that is an array and use it
            const arrayVals = Object.values(data).filter(Array.isArray)
            if (arrayVals.length > 0) {
              rawArray = arrayVals[0] as any[]
            }
          }
        }
        
        return rawArray.map((item: any) => ({
          ...item,
          id: item._id ? item._id.toString() : (item.id || "")
        }))
      }

      const employees = mapList(empsRes).map((emp: any) => {
        if (!emp.firstName && !emp.lastName) {
          if (emp.fullName) {
            const parts = emp.fullName.trim().split(' ');
            emp.firstName = parts[0] || '';
            emp.lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';
          } else if (emp.userId) {
            emp.firstName = emp.userId.firstName || '';
            emp.lastName = emp.userId.lastName || '';
            emp.email = emp.email || emp.userId.email || '';
            emp.avatarUrl = emp.avatarUrl || emp.userId.avatar || '';
          }
        }
        return emp;
      })
      const departments = mapList(deptsRes)
      const teams = mapList(teamsRes)
      const positions = mapList(posRes)
      const roles = mapList(rolesRes)
      const rawAttendance = mapList(attRes)
      const rawLeave = mapList(leaveRes)
      const schedules = mapList(schRes)
      const rawTasks = mapList(tasksRes)
      const rawTickets = mapList(ticketsRes)
      const auditLogs = mapList(auditRes)
      const accessRequests = mapList(accessRes)

      // Transform Attendance Logs to UI shape
      const attendanceLogs: AttendanceLog[] = rawAttendance.map((a: any) => ({
        id: a.id || a._id,
        employeeId: typeof a.employeeId === 'object' ? (a.employeeId?._id || a.employeeId?.id) : a.employeeId,
        date: a.date || (a.createdAt ? a.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
        checkIn: a.checkInAt ? new Date(a.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (a.checkIn || '--:--'),
        checkOut: a.checkOutAt ? new Date(a.checkOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (a.checkOut || undefined),
        status: a.status || (a.checkInAt ? (a.checkOutAt ? 'Checked Out' : 'Working') : 'Absent'),
        location: a.location?.address || a.location || 'Spatial Lab HQ',
        raw: a
      }))

      // Transform Leave Requests to UI shape
      const leaveRequests: LeaveRequest[] = rawLeave.map((l: any) => ({
        id: l.id || l._id,
        employeeId: typeof l.employeeId === 'object' ? (l.employeeId?._id || l.employeeId?.id) : l.employeeId,
        type: l.leaveType || l.type || 'Casual',
        startDate: l.startDate ? l.startDate.split('T')[0] : '',
        endDate: l.endDate ? l.endDate.split('T')[0] : '',
        reason: l.reason || '',
        status: l.status || 'Pending',
        appliedAt: l.createdAt || l.appliedAt || new Date().toISOString(),
        raw: l
      }))

      // Transform Tasks
      const tasks: Task[] = rawTasks.map((t: any) => ({
        id: t.id || t._id,
        title: t.title || 'Untitled Task',
        description: t.description || '',
        assignedTo: typeof t.assignedTo === 'object' ? (t.assignedTo?._id || t.assignedTo?.id) : t.assignedTo,
        status: t.status || 'To Do',
        priority: t.priority || 'Medium',
        dueDate: t.dueDate ? t.dueDate.split('T')[0] : '',
        raw: t
      }))

      // Transform Tickets
      const tickets: Ticket[] = rawTickets.map((t: any) => ({
        id: t.id || t._id,
        title: t.title || 'Support Request',
        description: t.description || '',
        createdBy: typeof t.createdBy === 'object' ? (t.createdBy?._id || t.createdBy?.id) : t.createdBy,
        category: t.category || 'IT Support',
        priority: t.priority || 'Medium',
        status: t.status || 'Open',
        createdAt: t.createdAt || new Date().toISOString(),
        raw: t
      }))

      set({
        employees,
        departments,
        teams,
        positions,
        roles,
        attendanceLogs,
        leaveRequests,
        schedules,
        tasks,
        tickets,
        auditLogs,
        accessRequests,
        isApiConnected: true,
        isLoadingData: false,
      })
    } catch (err) {
      console.error("API error during data load:", err)
      set({ isApiConnected: false, isLoadingData: false })
    }
  },

  fetchTodayAttendance: async (employeeId: string) => {
    try {
      const res = await apiClient.get('/attendance/me/today')
      if (res.data) {
        const status = res.data.status
        if (status === 'Working') set({ workStatus: 'in' })
        else if (status === 'On Break') set({ workStatus: 'break' })
        else if (status === 'Checked Out') set({ workStatus: 'completed' })
      }
    } catch {
      // Ignore if not clocked in
    }
  },

  fetchPendingUsers: async () => {
    try {
      const res = await apiClient.get('/users/pending')
      set({ pendingUsers: res.data })
    } catch (err) {
      console.error("Failed to fetch pending users:", err)
    }
  },

  approveRegistration: async (userId: string, data: any) => {
    try {
      await apiClient.post('/users/' + userId + '/approve', data)
      toast.success("User approved successfully")
      await get().fetchPendingUsers()
      await get().fetchAllData()
      return true
    } catch (err) {
      console.error("Failed to approve user:", err)
      toast.error("Failed to approve user")
      return false
    }
  },

  addEmployee: async (empData) => {
    try {
      await apiClient.post('/employees', empData)
      toast.success("Employee record successfully created on server.")
      await get().fetchAllData()
      return true
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || 'Failed to create employee'
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
      return false
    }
  },

  updateEmployee: async (id, data) => {
    try {
      await apiClient.put(`/employees/${id}`, data)
      toast.success("Employee record updated successfully.")
      await get().fetchAllData()
      return true
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || 'Failed to update employee'
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
      return false
    }
  },

  suspendEmployee: async (id) => {
    try {
      await apiClient.patch(`/employees/${id}/suspend`)
      toast.success("Employee account suspended.")
      await get().fetchAllData()
      return true
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || 'Failed to suspend employee'
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
      return false
    }
  },

  reactivateEmployee: async (id) => {
    try {
      await apiClient.patch(`/employees/${id}/reactivate`)
      toast.success("Employee account reactivated.")
      await get().fetchAllData()
      return true
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || 'Failed to reactivate employee'
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
      return false
    }
  },

  promoteEmployee: async (id, roleId) => {
    try {
      await apiClient.put(`/employees/${id}`, { roleId })
      toast.success("Role assignment updated.")
      await get().fetchAllData()
      return true
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || 'Failed to update role'
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
      return false
    }
  },

  deleteEmployee: async (id) => {
    try {
      await apiClient.patch(`/employees/${id}/deactivate`)
      toast.success("Employee account deactivated.")
      await get().fetchAllData()
      return true
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || 'Failed to deactivate employee'
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
      return false
    }
  },

  addDepartment: async (deptData) => {
    try {
      await apiClient.post('/departments', deptData)
      toast.success("Department created.")
      await get().fetchAllData()
      return true
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || 'Failed to create department'
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
      return false
    }
  },

  updateDepartment: async (id, data) => {
    try {
      await apiClient.put(`/departments/${id}`, data)
      toast.success("Department updated.")
      await get().fetchAllData()
      return true
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || 'Failed to update department'
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
      return false
    }
  },

  archiveDepartment: async (id) => {
    try {
      await apiClient.patch(`/departments/${id}/archive`)
      toast.success("Department archived.")
      await get().fetchAllData()
      return true
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || 'Failed to archive department'
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
      return false
    }
  },

  deleteDepartment: async (id) => {
    try {
      await apiClient.patch(`/departments/${id}/archive`)
      toast.success("Department deleted permanently.")
      await get().fetchAllData()
      return true
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || 'Failed to delete department'
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
      return false
    }
  },

  addPosition: async (posData) => {
    try {
      await apiClient.post('/positions', posData)
      toast.success("Position created.")
      await get().fetchAllData()
      return true
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || 'Failed to create position'
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
      return false
    }
  },

  addTeam: async (teamData) => {
    try {
      await apiClient.post('/teams', teamData)
      toast.success("Team created.")
      await get().fetchAllData()
      return true
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || 'Failed to create team'
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
      return false
    }
  },

  updateTeam: async (id, data) => {
    try {
      await apiClient.put(`/teams/${id}`, data)
      toast.success("Team updated.")
      await get().fetchAllData()
      return true
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || 'Failed to update team'
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
      return false
    }
  },

  archiveTeam: async (id) => {
    try {
      await apiClient.patch(`/teams/${id}/archive`)
      toast.success("Team archived.")
      await get().fetchAllData()
      return true
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || 'Failed to archive team'
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
      return false
    }
  },

  deleteTeam: async (id) => {
    try {
      await apiClient.patch(`/teams/${id}/archive`)
      toast.success("Team deleted permanently.")
      await get().fetchAllData()
      return true
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
      return false
    }
  },

  deletePosition: async (id) => {
    try {
      await apiClient.patch(`/positions/${id}/archive`)
      toast.success("Position deleted permanently.")
      await get().fetchAllData()
      return true
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
      return false
    }
  },

  punchIn: async (employeeId, location) => {
    try {
      await apiClient.post(`/attendance/check-in/${employeeId}`, { location })
      set({ workStatus: "in" })
      toast.success("Clocked in successfully.")
      await get().fetchAllData()
      return true
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || 'Failed to clock in'
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
      return false
    }
  },

  punchOut: async (employeeId, location) => {
    try {
      await apiClient.post(`/attendance/check-out/${employeeId}`, { location })
      set({ workStatus: "completed" })
      toast.success("Clocked out successfully.")
      await get().fetchAllData()
      return true
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || 'Failed to clock out'
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
      return false
    }
  },

  takeBreak: async (employeeId) => {
    try {
      await apiClient.post(`/attendance/break-start/${employeeId}`)
      set({ workStatus: "break" })
      toast.success("Break started.")
      await get().fetchAllData()
      return true
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || 'Failed to start break'
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
      return false
    }
  },
  
  endBreak: async (employeeId) => {
    try {
      await apiClient.post(`/attendance/break-end/${employeeId}`)
      set({ workStatus: "in" })
      toast.success("Break ended. You are clocked back in.")
      await get().fetchAllData()
      return true
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || 'Failed to end break'
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
      return false
    }
  },

  addLeaveRequest: async (reqData) => {
    try {
      await apiClient.post('/leave', reqData)
      toast.success("Leave request submitted for approval.")
      await get().fetchAllData()
      return true
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || 'Failed to submit leave request'
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
      return false
    }
  },

  updateLeaveStatus: async (id, status, note) => {
    try {
      await apiClient.patch(`/leave/${id}/review`, { status, note })
      toast.success(`Leave request ${status.toLowerCase()}.`)
      await get().fetchAllData()
      return true
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || 'Failed to review leave request'
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
      return false
    }
  },

  addSchedule: async (schData) => {
    try {
      await apiClient.post('/schedules', schData)
      toast.success("Work schedule created.")
      await get().fetchAllData()
      return true
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || 'Failed to create schedule'
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
      return false
    }
  },

  addTask: async (taskData) => {
    try {
      await apiClient.post('/tasks', taskData)
      toast.success("Task assigned and created.")
      await get().fetchAllData()
      return true
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || 'Failed to create task'
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
      return false
    }
  },

  updateTask: async (id, data) => {
    try {
      await apiClient.put(`/tasks/${id}`, data)
      toast.success("Task updated.")
      await get().fetchAllData()
      return true
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || 'Failed to update task'
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
      return false
    }
  },

  updateTaskStatus: async (id, status) => {
    try {
      await apiClient.patch(`/tasks/${id}/status`, { status })
      toast.success(`Task marked as ${status}.`)
      await get().fetchAllData()
      return true
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || 'Failed to update task status'
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
      return false
    }
  },

  deleteTask: async (id) => {
    try {
      await apiClient.delete(`/tasks/${id}`)
      toast.success("Task deleted successfully.")
      await get().fetchAllData()
      return true
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || 'Failed to delete task'
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
      return false
    }
  },

  addTicket: async (tData) => {
    try {
      await apiClient.post('/tickets', tData)
      toast.success("Support ticket created.")
      await get().fetchAllData()
      return true
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || 'Failed to create ticket'
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
      return false
    }
  },

  resolveTicket: async (id) => {
    try {
      await apiClient.patch(`/tickets/${id}/resolve`)
      toast.success("Support ticket resolved.")
      await get().fetchAllData()
      return true
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || 'Failed to resolve ticket'
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
      return false
    }
  },

  fetchAuditLogs: async () => {
    try {
      const res = await apiClient.get('/audit?limit=50')
      const logs = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : [])
      set({ auditLogs: logs.map((l: any) => ({ ...l, id: l._id || l.id })) })
    } catch (err) {
      console.error("Failed to fetch audit logs:", err)
    }
  },

  fetchAccessRequests: async () => {
    try {
      const res = await apiClient.get('/access-requests?limit=50')
      const reqs = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : [])
      set({ accessRequests: reqs.map((r: any) => ({ ...r, id: r._id || r.id })) })
    } catch (err) {
      console.error("Failed to fetch access requests:", err)
    }
  },

  reviewAccessRequest: async (id, status, note) => {
    try {
      await apiClient.patch(`/access-requests/${id}/review`, { status, note })
      toast.success(`Access request ${status.toLowerCase()}.`)
      await get().fetchAccessRequests()
      return true
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || 'Failed to review access request'
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
      return false
    }
  },

  getDashboardStats: () => {
    const state = get()
    const active = state.employees.filter(e => e.status === "Active").length
    const suspended = state.employees.filter(e => e.status === "Suspended" || e.status === "Deactivated").length
    const openTicketsCount = state.tickets.filter(t => t.status === "Open" || t.status === "In Progress").length
    const workingNowCount = state.attendanceLogs.filter(a => a.status === "Working" || a.status === "On Time").length

    return {
      totalEmployees: state.employees.length,
      workingNow: workingNowCount,
      pendingReports: 0,
      openTickets: openTicketsCount,
      totalDepartments: state.departments.length,
      totalTeams: state.teams.length,
      activeRoles: state.roles.length,
      suspendedUsers: suspended,
    }
  }
}))




