"use client"

import * as React from "react"
import { Icon } from "@iconify/react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { Bell, RefreshCw, CheckCircle2, Wifi, WifiOff } from "lucide-react"

import { Button } from "@/components/ui/Button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { Badge } from "@/components/ui/Badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu"
import { useAuthStore } from "@/stores/authStore"
import { useLayoutStore } from "@/stores/layoutStore"
import { useAppStore } from "@/stores/appStore"
import { toast } from "sonner"

export function Header() {
  const { setTheme } = useTheme()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { toggleMobileMenu } = useLayoutStore()
  const { isApiConnected, fetchAllData } = useAppStore()

  const [isOnline, setIsOnline] = React.useState(true)
  const [notifications, setNotifications] = React.useState<Array<{ id: string; title: string; time: string; unread: boolean }>>([])
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine)
      const on = () => setIsOnline(true)
      const off = () => setIsOnline(false)
      window.addEventListener("online", on)
      window.addEventListener("offline", off)
      return () => {
        window.removeEventListener("online", on)
        window.removeEventListener("offline", off)
      }
    }
  }, [])

  const handleLogout = () => {
    logout()
    useAppStore.getState().resetStore()
    window.location.href = "/login"
  }

  const firstName = user?.firstName || "User"
  const lastName = user?.lastName || ""
  const initials = `${firstName.charAt(0)}${lastName.charAt(0) || ""}`.toUpperCase() || "U"
  const fullName = `${firstName} ${lastName}`.trim()
  const roleName = user?.role || (user?.roleId === "role_1" ? "Super Admin" : user?.roleId === "role_2" ? "Manager" : "Staff Member")
  const unreadCount = notifications.filter(n => n.unread).length

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })))
    toast.success("Notifications marked as read")
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background/80 px-4 sm:px-6 backdrop-blur-md transition-all">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex flex-1 items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden h-9 w-9 text-muted-foreground"
          onClick={toggleMobileMenu}
        >
          <Icon icon="solar:hamburger-menu-linear" className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true })
            document.dispatchEvent(event)
          }}
          className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-72 bg-card/60 hover:bg-accent border-border/70 hover:border-blue-500/40 transition-all rounded-lg"
        >
          <Icon icon="solar:magnifer-linear" className="mr-2 h-4 w-4 text-blue-500" />
          <span>Search Safe Vitals...</span>
          <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted/80 px-2 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>

      {/* Right: Network Status, Notifications, Theme, User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Network & Live Sync Indicator */}
        <div className="hidden sm:flex items-center">
          <Badge 
            variant="outline" 
            className={`text-[11px] font-medium flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
              !isOnline 
                ? "bg-destructive/10 text-destructive border-destructive/30" 
                : isApiConnected 
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30" 
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${!isOnline ? "bg-destructive" : isApiConnected ? "bg-blue-500 animate-pulse" : "bg-amber-500"}`} />
            <span>{!isOnline ? "Offline" : isApiConnected ? "Live Connected" : "Connecting..."}</span>
          </Badge>
        </div>

        {/* Refresh Data Button */}
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={async () => {
            await fetchAllData()
            toast.success("Workspace data reloaded")
          }}
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          title="Reload Workspace Data"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>

        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 text-muted-foreground hover:text-foreground">
              <Icon icon="solar:bell-linear" className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-2">
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="font-semibold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-[11px] text-blue-500 hover:underline">
                  Mark all as read
                </button>
              )}
            </div>
            <DropdownMenuSeparator />
            <div className="space-y-1">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`flex items-start gap-3 p-2 rounded-lg text-sm transition-colors cursor-pointer ${n.unread ? "bg-blue-500/5 hover:bg-blue-500/10" : "hover:bg-accent"}`}
                  >
                    <div className={`mt-0.5 h-2 w-2 rounded-full ${n.unread ? "bg-blue-500" : "bg-muted"}`} />
                    <div className="flex-1">
                      <p className={`text-xs ${n.unread ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{n.title}</p>
                      <span className="text-[10px] text-muted-foreground">{n.time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No new notifications
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
              <Icon icon="solar:sun-linear" className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Icon icon="solar:moon-linear" className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer">
              <Icon icon="solar:sun-2-linear" className="mr-2 h-4 w-4 text-amber-500" /> Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer">
              <Icon icon="solar:moon-linear" className="mr-2 h-4 w-4 text-blue-400" /> Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer">
              <Icon icon="solar:laptop-minimalistic-linear" className="mr-2 h-4 w-4" /> System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Avatar Menu */}
        {mounted && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-blue-500/20 hover:ring-blue-500/50 transition-all p-0">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.avatarUrl || user?.avatar} alt={fullName} />
                  <AvatarFallback className="bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-60" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center gap-3 py-1">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatarUrl || user?.avatar} alt={fullName} />
                    <AvatarFallback className="bg-blue-500/10 text-blue-500 font-bold text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-semibold leading-none truncate max-w-[140px]">{fullName || "Employee"}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[140px]">{user?.email || ""}</p>
                    <Badge variant="outline" className="w-fit text-[10px] px-1.5 py-0 mt-1 border-blue-500/30 text-blue-500">
                      {roleName}
                    </Badge>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push(user?.employeeDocId || user?.id || user?._id ? `/app/employees/${user.employeeDocId || user.id || user._id}` : '/app/employees')} className="cursor-pointer">
                <Icon icon="solar:user-linear" className="mr-2 h-4 w-4 text-blue-500" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/app/attendance')} className="cursor-pointer">
                <Icon icon="solar:clock-circle-linear" className="mr-2 h-4 w-4 text-blue-500" />
                <span>Timesheets</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/app/settings')} className="cursor-pointer">
                <Icon icon="solar:settings-linear" className="mr-2 h-4 w-4 text-blue-500" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                <Icon icon="solar:logout-linear" className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}

