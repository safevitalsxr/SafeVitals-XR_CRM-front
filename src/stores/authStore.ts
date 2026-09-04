import { create } from "zustand"
import { persist } from "zustand/middleware"
import { Employee, AuthStateStatus, AccountStatus } from "@/types"

export interface AuthUser extends Omit<Partial<Employee>, "status"> {
  id?: string
  _id?: string
  email: string
  firstName?: string
  lastName?: string
  fullName?: string
  firebaseUid?: string
  role?: string
  roleId?: string
  employeeDocId?: string
  departmentId?: string
  teamId?: string
  position?: string
  avatarUrl?: string
  avatar?: string
  status?: AccountStatus | string
  permissions?: string[]
  isSuperAdmin?: boolean
  mustChangePassword?: boolean
  passwordSetupComplete?: boolean
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  authStatus: AuthStateStatus
  pendingUserId: string | null
  pendingEmail: string | null
  setPendingAuth: (userId: string, email: string) => void
  clearPendingAuth: () => void
  setAuthStatus: (status: AuthStateStatus) => void
  setUser: (user: AuthUser | null) => void
  login: (user: AuthUser, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      authStatus: "LOGIN_REQUIRED",
      pendingUserId: null,
      pendingEmail: null,
      setPendingAuth: (userId: string, email: string) => set({ pendingUserId: userId, pendingEmail: email, authStatus: "OTP_REQUIRED" }),
      clearPendingAuth: () => set({ pendingUserId: null, pendingEmail: null }),
      setAuthStatus: (status: AuthStateStatus) => set({ authStatus: status }),
      setUser: (user: AuthUser | null) => set({ user }),
      login: (user: AuthUser, token: string) => set({
        user,
        token,
        isAuthenticated: true,
        authStatus: "AUTHENTICATED",
        pendingUserId: null,
        pendingEmail: null
      }),
      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
        authStatus: "LOGIN_REQUIRED",
        pendingUserId: null,
        pendingEmail: null
      }),
    }),
    {
      name: "safevitals-auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        authStatus: state.authStatus,
      }),
    }
  )
)

