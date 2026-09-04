import apiClient from "@/lib/apiClient"
import { useAppStore } from "@/stores/appStore"

export const invitationService = {
  sendInvitations: async (emails: string[], departmentId: string, positionId: string, teamId: string, roleId: string) => {
    try {
      const results = []
      for (const email of emails) {
        const payload = {
          email: email.trim(),
          firstName: email.split('@')[0],
          lastName: 'Member',
          departmentId,
          teamId,
          positionId,
          roleId,
          temporaryPassword: 'Password123!'
        }
        const res = await apiClient.post('/employees', payload)
        results.push(res.data.employee || res.data)
      }
      
      await useAppStore.getState().fetchAllData()
      return { success: true, count: emails.length }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send invitations')
    }
  },

  revokeInvitation: async (id: string) => {
    try {
      await apiClient.patch(`/employees/${id}/suspend`)
      await useAppStore.getState().fetchAllData()
      return { success: true }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to revoke invitation')
    }
  },

  resendInvitation: async (id: string) => {
    try {
      await apiClient.post(`/auth/resend-otp`, { userId: id })
      return { success: true }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to resend invitation')
    }
  }
}
