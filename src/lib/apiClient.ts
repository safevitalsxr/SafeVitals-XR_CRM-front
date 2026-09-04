/**
 * Safe Vitals XR - Production API Client
 * Centralised axios instance connected to the real NestJS backend API.
 */
import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

// Public paths where a 401 should NOT trigger a logout redirect
const PUBLIC_PATHS = new Set([
  '/login',
  '/verify-otp',
  '/forgot-password',
  '/reset-password',
  '/activate-account',
  '/register',
  '/register/verify-otp',
  '/auth-error',
  '/change-password',
])

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Attach JWT token from safevitals-auth-storage on every outgoing request
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      const authRaw = localStorage.getItem('safevitals-auth-storage')
      if (authRaw) {
        const parsed = JSON.parse(authRaw)
        const token = parsed?.state?.token
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }
    } catch {
      // Ignore parse errors
    }
  }
  return config
})

// Handle 401 Unauthorized and global error formatting
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Handle Network Errors / Server Crash (ERR_CONNECTION_REFUSED)
    if (!error.response && error.code === 'ERR_NETWORK') {
      error.message = "Backend server is unreachable. Please check your connection."
    }
    // 2. Extract NestJS JSON Validation Messages (e.g. 400 Bad Request)
    else if (error.response?.data) {
      console.error("[API Error from Backend]:\n", JSON.stringify(error.response.data, null, 2))
      const data = error.response.data
      let msg = data.message || data.error?.message || data.error
      
      // If msg is still an object (e.g. validation errors), stringify it
      if (typeof msg === 'object' && !Array.isArray(msg)) {
        msg = JSON.stringify(msg)
      }
      
      if (msg) {
        error.message = Array.isArray(msg) ? msg.join(', ') : (typeof msg === 'string' ? msg : error.message)
      }
    }

    // 3. Handle 401 Unauthorized globally: clear local auth session and transition safely
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const isPublicPath = PUBLIC_PATHS.has(window.location.pathname)

      if (!isPublicPath) {
        localStorage.removeItem('safevitals-auth-storage')
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

export default apiClient
