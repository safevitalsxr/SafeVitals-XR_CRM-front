"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Icon } from "@iconify/react"
import { X } from "lucide-react"

import { useAuthStore } from "@/stores/authStore"
import { useLayoutStore } from "@/stores/layoutStore"

interface NavItem {
  title: string
  href: string
  icon: string
  roles?: string[]
}

interface NavGroup {
  title: string
  roles?: string[]
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", href: "/app/dashboard", icon: "solar:widget-5-linear" },
    ]
  },
  {
    title: "Workforce",
    items: [
      { title: "Attendance & Clock", href: "/app/attendance", icon: "solar:clock-circle-linear" },
      { title: "Leave Tracker", href: "/app/leave", icon: "solar:calendar-linear" },
      { title: "Tasks Board", href: "/app/tasks", icon: "solar:checklist-minimalistic-linear" },
      { title: "Weekly Reports", href: "/app/reports", icon: "solar:chart-square-linear" },
    ]
  },
  {
    title: "People & Teams",
    roles: ["Super Admin", "Admin", "HR Admin", "Manager", "role_1", "role_2"],
    items: [
      { title: "Employees Directory", href: "/app/employees", icon: "solar:users-group-rounded-linear" },
      { title: "Departments", href: "/app/departments", icon: "solar:buildings-2-linear" },
      { title: "Teams", href: "/app/teams", icon: "solar:user-hand-up-linear" },
      { title: "Work Schedules", href: "/app/schedules", icon: "solar:calendar-mark-linear" },
      { title: "Hierarchy View", href: "/app/organization", icon: "solar:structure-linear" },
    ]
  },
  {
    title: "Support & Helpdesk",
    items: [
      { title: "Support Tickets", href: "/app/tickets", icon: "solar:ticket-linear" },
    ]
  },
  {
    title: "Administration & Security",
    roles: ["Super Admin", "Admin", "role_1"],
    items: [
      { title: "Roles & Permissions", href: "/app/roles", icon: "solar:shield-user-linear" },
        { title: "Registration Requests", href: "/app/registration-requests", icon: "solar:user-plus-linear", roles: ["Super Admin"] },
      { title: "Access Requests", href: "/app/access-requests", icon: "solar:shield-keyhole-linear" },
      { title: "Security Policies", href: "/app/security", icon: "solar:lock-password-linear" },
      { title: "Audit Trail", href: "/app/audit", icon: "solar:history-linear" },
      { title: "System Settings", href: "/app/settings", icon: "solar:settings-linear" },
    ]
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const { isSidebarMinimized, toggleSidebar, isMobileMenuOpen, setMobileMenuOpen } = useLayoutStore()

  const userRole = user?.role || user?.roleId || "Employee"
  const isSuperAdmin = userRole === "Super Admin" || userRole === "role_1" || (user as any)?.isSuperAdmin

  const filteredNavGroups = navGroups.filter(group => {
    if (!group.roles || isSuperAdmin) return true
    return group.roles.some(r => r.toLowerCase() === userRole.toLowerCase())
  })

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card/95 backdrop-blur-md transition-all duration-300 shadow-sm",
        isSidebarMinimized ? "md:w-[72px]" : "md:w-64",
        isMobileMenuOpen ? "translate-x-0 w-72" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Brand Logo Header */}
        <div className={cn(
          "flex h-16 items-center border-b px-5 justify-between",
          isSidebarMinimized && "md:justify-center md:px-0"
        )}>
          {(!isSidebarMinimized || isMobileMenuOpen) ? (
            <div className="flex items-center gap-3">
              <img src="https://res.cloudinary.com/dkrvtfbor/image/upload/v1787831608/Horizontal_White_V2_xsxcfs.png" alt="SafeVitals XR" className="h-10 w-auto object-contain" />
            </div>
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500 text-zinc-950 font-bold shadow-sm shadow-blue-500/30">
              <span className="font-extrabold text-sm">SV</span>
            </div>
          )}

          {/* Mobile Close Button */}
          {isMobileMenuOpen && (
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        
        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-muted">
          <nav className={cn("grid gap-5", isSidebarMinimized && !isMobileMenuOpen ? "px-2" : "px-3")}>
            {filteredNavGroups.map((group, index) => (
              <div key={index} className="flex flex-col gap-1">
                {(!isSidebarMinimized || isMobileMenuOpen) ? (
                  <h4 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1">
                    {group.title}
                  </h4>
                ) : (
                  <div className="flex justify-center my-1">
                    <div className="h-[1px] w-6 bg-border/60" />
                  </div>
                )}
                {group.items.map((item, itemIndex) => {
                  const isActive = pathname === item.href || (item.href !== "/app/dashboard" && pathname?.startsWith(item.href))
                  return (
                    <Link
                      key={itemIndex}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      title={isSidebarMinimized && !isMobileMenuOpen ? item.title : undefined}
                      className={cn(
                        "group relative flex items-center rounded-lg text-sm font-medium transition-all",
                        isActive 
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold shadow-xs" 
                          : "text-muted-foreground hover:bg-accent hover:text-foreground",
                        isSidebarMinimized && !isMobileMenuOpen ? "justify-center p-2.5" : "gap-3 px-3 py-2"
                      )}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-blue-500" />
                      )}
                      <Icon 
                        icon={item.icon} 
                        className={cn(
                          "h-5 w-5 shrink-0 transition-transform group-hover:scale-110",
                          isActive ? "text-blue-500" : "text-muted-foreground group-hover:text-foreground"
                        )} 
                      />
                      {(!isSidebarMinimized || isMobileMenuOpen) && (
                        <span className="truncate">{item.title}</span>
                      )}
                    </Link>
                  )
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer / Toggle */}
        <div className="border-t p-3 hidden md:block">
          <button
            onClick={toggleSidebar}
            className={cn(
              "flex w-full items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
              isSidebarMinimized ? "justify-center p-2.5" : "gap-3 px-3 py-2"
            )}
            title={isSidebarMinimized ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <Icon 
              icon={isSidebarMinimized ? "solar:double-alt-arrow-right-linear" : "solar:double-alt-arrow-left-linear"} 
              className="h-5 w-5 shrink-0 text-muted-foreground" 
            />
            {!isSidebarMinimized && <span className="text-sm font-medium">Collapse Sidebar</span>}
          </button>
        </div>
      </aside>
    </>
  )
}


