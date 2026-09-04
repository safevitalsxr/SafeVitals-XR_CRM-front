import apiClient from "@/lib/apiClient"

export interface LoginResponse {
  success: boolean
  userId?: string
  message?: string
  token?: string
  user?: any
}

export interface VerifyOtpResponse {
  success: boolean
  token: string
  user: {
    id: string
    email: string
    firstName?: string
    lastName?: string
    fullName?: string
    status?: string
    role?: string
    roleId?: string
    permissions?: string[]
    departmentId?: string
    teamId?: string
  }
}

export interface FirebaseLoginResponse {
  success: boolean
  token?: string
  pendingOnboarding?: boolean
  firebaseUid?: string
  email?: string
  message?: string
  user?: {
    id: string
    email: string
    firstName?: string
    lastName?: string
    fullName?: string
    status?: string
    role?: string
  }
}

export interface RegisterResponse {
  success: boolean
  registrationToken: string
  message: string
}

export interface VerifyRegistrationOtpResponse {
  success: boolean
  pendingOnboarding: boolean
  message: string
}

export const authService = {
  login: async (email: string, password?: string): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post('/auth/login', { email, password })
      return response.data
    } catch (error: any) {
      if (error.response?.status === 401 && error.response?.data?.userId) {
        return error.response.data
      }
      const msg = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Login failed'
      throw new Error(Array.isArray(msg) ? msg.join(', ') : msg)
    }
  },

  firebaseLogin: async (idToken: string): Promise<FirebaseLoginResponse> => {
    try {
      const response = await apiClient.post('/auth/firebase-login', { idToken })
      return response.data
    } catch (error: any) {
      const msg = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Firebase login failed'
      throw new Error(Array.isArray(msg) ? msg.join(', ') : msg)
    }
  },

  verifyOtp: async (userId: string, otp: string): Promise<VerifyOtpResponse> => {
    try {
      const response = await apiClient.post('/auth/verify-otp', { userId, otp })
      return response.data
    } catch (error: any) {
      const msg = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Invalid OTP'
      throw new Error(Array.isArray(msg) ? msg.join(', ') : msg)
    }
  },

  resendOtp: async (userId: string) => {
    try {
      const response = await apiClient.post('/auth/resend-otp', { userId })
      return response.data
    } catch (error: any) {
      const msg = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Failed to resend OTP'
      throw new Error(Array.isArray(msg) ? msg.join(', ') : msg)
    }
  },

  register: async (fullName: string, email: string, phone: string): Promise<RegisterResponse> => {
    try {
      const response = await apiClient.post('/auth/register', { fullName, email, phone })
      return response.data
    } catch (error: any) {
      let msg = 'Registration failed';
      if (error.response?.data) {
        msg = error.response.data.message || error.response.data.error || (typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data));
      } else if (error.message) {
        msg = error.message;
      }
      throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  },

  verifyRegistrationOtp: async (registrationToken: string, otp: string, password: string): Promise<VerifyRegistrationOtpResponse> => {
    try {
      const response = await apiClient.post('/auth/register/verify-otp', { registrationToken, otp, password })
      return response.data
    } catch (error: any) {
      const msg = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'OTP verification failed'
      throw new Error(Array.isArray(msg) ? msg.join(', ') : msg)
    }
  },

  getMe: async () => {
    try {
      const response = await apiClient.get('/auth/me')
      return response.data
    } catch (error: any) {
      const msg = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Failed to fetch user'
      throw new Error(Array.isArray(msg) ? msg.join(', ') : msg)
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout')
      return { success: true }
    } catch {
      return { success: true }
    }
  },

  requestPasswordReset: async (email: string) => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email })
      return response.data
    } catch (error: any) {
      const msg = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Failed to request password reset'
      throw new Error(Array.isArray(msg) ? msg.join(', ') : msg)
    }
  },

  resetPassword: async (token: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/reset-password', { token, password })
      return response.data
    } catch (error: any) {
      const msg = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Failed to reset password'
      throw new Error(Array.isArray(msg) ? msg.join(', ') : msg)
    }
  },

  activateAccount: async (invitationToken: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/setup-password', { invitationToken, password })
      return response.data
    } catch (error: any) {
      const msg = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Failed to activate account'
      throw new Error(Array.isArray(msg) ? msg.join(', ') : msg)
    }
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const response = await apiClient.post('/auth/change-password', { currentPassword, newPassword })
      return response.data
    } catch (error: any) {
      const msg = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Failed to change password'
      throw new Error(Array.isArray(msg) ? msg.join(', ') : msg)
    }
  }
}
