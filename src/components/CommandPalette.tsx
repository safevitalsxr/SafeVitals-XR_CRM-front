"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Building2,
  Calendar,
  LayoutDashboard,
  LifeBuoy,
  Settings,
  User,
  Users,
  Clock,
  Shield,
  Sun,
  Moon,
  CheckSquare,
  FileText
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/Command"
import { useTheme } from "next-themes"
import { useAppStore } from "@/stores/appStore"

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const { setTheme } = useTheme()
  const { employees } = useAppStore()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command, page name, or search employee..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => router.push("/app/dashboard"))}>
            <LayoutDashboard className="mr-2 h-4 w-4 text-blue-500" />
            <span>Dashboard Command Center</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/app/employees"))}>
            <Users className="mr-2 h-4 w-4 text-blue-500" />
            <span>Employees Directory</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/app/attendance"))}>
            <Clock className="mr-2 h-4 w-4 text-blue-500" />
            <span>Time & Attendance Clock</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/app/tasks"))}>
            <CheckSquare className="mr-2 h-4 w-4 text-blue-500" />
            <span>Tasks Kanban Board</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/app/leave"))}>
            <Calendar className="mr-2 h-4 w-4 text-blue-500" />
            <span>Leave Management</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/app/reports"))}>
            <FileText className="mr-2 h-4 w-4 text-blue-500" />
            <span>Weekly Reports</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/app/tickets"))}>
            <LifeBuoy className="mr-2 h-4 w-4 text-blue-500" />
            <span>Support & Helpdesk</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/app/departments"))}>
            <Building2 className="mr-2 h-4 w-4 text-blue-500" />
            <span>Departments & Teams</span>
          </CommandItem>
        </CommandGroup>

        {employees.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Employees Quick Jump">
              {employees.slice(0, 5).map(emp => (
                <CommandItem key={emp.id} onSelect={() => runCommand(() => router.push(`/app/employees/${emp.id}`))}>
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{emp.firstName} {emp.lastName}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{emp.position || emp.employeeId}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />

        <CommandGroup heading="Preferences & Theme">
          <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
            <Sun className="mr-2 h-4 w-4 text-amber-500" />
            <span>Set Light Theme</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
            <Moon className="mr-2 h-4 w-4 text-blue-400" />
            <span>Set Dark Theme</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/app/settings"))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>System Settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
