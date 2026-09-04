"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { NetworkStatusBanner } from "./NetworkStatusBanner"
import { CommandPalette } from "../CommandPalette"
import { useAuthStore } from "@/stores/authStore"
import { PageTransition } from "@/components/PageTransition"
import { useLayoutStore } from "@/stores/layoutStore"
import { useAppStore } from "@/stores/appStore"
import { Skeleton } from "@/components/ui/Skeleton"
import { cn } from "@/lib/utils"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, user, token } = useAuthStore()
  const { isSidebarMinimized } = useLayoutStore()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (mounted) {
      if (!isAuthenticated || !token) {
        router.replace("/login")
      } else {
        useAppStore.getState().fetchAllData()
      }
    }
  }, [isAuthenticated, token, mounted, router])

  if (!mounted || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 max-w-sm w-full px-6 text-center">
          <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
          <div className="space-y-2 w-full">
            <Skeleton className="h-4 w-3/4 mx-auto" />
            <Skeleton className="h-3 w-1/2 mx-auto" />
          </div>
          <p className="text-xs text-muted-foreground font-mono">Authenticating SafeVitals XR Session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/20 text-foreground antialiased">
      <NetworkStatusBanner />
      <Sidebar />
      <div className={cn(
        "flex flex-col flex-1 min-h-screen transition-all duration-300",
        isSidebarMinimized ? "md:pl-[72px]" : "md:pl-64"
      )}>
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
      <CommandPalette />
    </div>
  )
}
