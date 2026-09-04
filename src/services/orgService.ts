import apiClient from "@/lib/apiClient"
import { useAppStore } from "@/stores/appStore"

export const departmentService = {
  getDepartments: async () => {
    const res = await apiClient.get('/departments');
    return res.data;
  },
  
  createDepartment: async (name: string, description?: string) => {
    try {
      const res = await apiClient.post('/departments', { 
        name, 
        description: description?.trim() || undefined 
      });
      await useAppStore.getState().fetchAllData();
      return { success: true, department: res.data };
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to create department');
    }
  }
}

export const positionService = {
  getPositions: async () => {
    const res = await apiClient.get('/positions');
    return res.data;
  },
  
  createPosition: async (name: string, departmentId: string, level: string, description?: string) => {
    try {
      const res = await apiClient.post('/positions', { 
        name, 
        departmentId, 
        level, 
        description: description?.trim() || undefined 
      });
      await useAppStore.getState().fetchAllData();
      return { success: true, position: res.data };
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to create position');
    }
  }
}

export const teamService = {
  getTeams: async () => {
    const res = await apiClient.get('/teams');
    return res.data;
  },
  
  createTeam: async (name: string, departmentId: string, leadId?: string) => {
    try {
      const payload: any = { name, departmentId };
      if (leadId) payload.leadId = leadId;
      const res = await apiClient.post('/teams', payload);
      await useAppStore.getState().fetchAllData();
      return { success: true, team: res.data };
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to create team');
    }
  }
}
