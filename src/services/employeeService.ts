import apiClient from "@/lib/apiClient"
import { useAppStore } from "@/stores/appStore"

export interface CreateEmployeePayload {
  firstName: string
  lastName: string
  email: string
  departmentId: string
  teamId: string
  positionId: string
  roleId: string
  managerId?: string
  workScheduleId?: string
  temporaryPassword?: string
  joiningDate?: string
}

export interface OnboardByUidPayload {
  firebaseUid: string
  departmentId: string
  teamId: string
  positionId: string
  roleId: string
  managerId?: string
  workScheduleId?: string
  joiningDate?: string
}

export const employeeService = {
  createEmployee: async (data: CreateEmployeePayload) => {
    try {
      const response = await apiClient.post('/employees', data)
      await useAppStore.getState().fetchAllData()
      return { success: true, employee: response.data.employee || response.data }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create employee')
    }
  },

  onboardByFirebaseUid: async (data: OnboardByUidPayload) => {
    try {
      const response = await apiClient.post('/employees/onboard-uid', data)
      await useAppStore.getState().fetchAllData()
      return { success: true, employee: response.data.employee || response.data }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to onboard employee by Firebase UID')
    }
  },

  getEmployees: async (query?: { search?: string; departmentId?: string; teamId?: string; page?: string; limit?: string }) => {
    try {
      const params = new URLSearchParams()
      if (query?.search) params.append('search', query.search)
      if (query?.departmentId) params.append('departmentId', query.departmentId)
      if (query?.teamId) params.append('teamId', query.teamId)
      if (query?.page) params.append('page', query.page)
      if (query?.limit) params.append('limit', query.limit)

      const response = await apiClient.get(`/employees?${params.toString()}`)
      return response.data
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch employees')
    }
  }
}
