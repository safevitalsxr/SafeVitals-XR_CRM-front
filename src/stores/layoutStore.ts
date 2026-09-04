import { create } from "zustand"
import { persist } from "zustand/middleware"

interface LayoutState {
  isSidebarMinimized: boolean
  isMobileMenuOpen: boolean
  toggleSidebar: () => void
  setSidebarMinimized: (minimized: boolean) => void
  toggleMobileMenu: () => void
  setMobileMenuOpen: (open: boolean) => void
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      isSidebarMinimized: false,
      isMobileMenuOpen: false,
      toggleSidebar: () => set((state) => ({ isSidebarMinimized: !state.isSidebarMinimized })),
      setSidebarMinimized: (minimized) => set({ isSidebarMinimized: minimized }),
      toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
    }),
    {
      name: "safevitals-layout-storage",
    }
  )
)
