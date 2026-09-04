"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  Users, 
  Building2, 
  Briefcase, 
  Activity, 
  Clock, 
  LifeBuoy, 
  CheckCircle2, 
  Coffee, 
  LogOut, 
  Zap, 
  Calendar,
  Glasses
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Skeleton } from "@/components/ui/Skeleton"
import { useAuthStore } from "@/stores/authStore"
import { useAppStore } from "@/stores/appStore"
import { toast } from "sonner"
import apiClient from "@/lib/apiClient"

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [mounted, setMounted] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(new Date())
  const [secondsWorked, setSecondsWorked] = React.useState(0)

  const { 
    workStatus, 
    punchIn, 
    punchOut, 
    takeBreak, 
    endBreak, 
    employees, 
    tasks, 
    tickets, 
    leaveRequests,
    departments,
    attendanceLogs,
    isLoadingData,
    fetchTodayAttendance
  } = useAppStore()

  const currentEmployeeId = user?.id || user?._id || ""

  React.useEffect(() => {
    setMounted(true)
    if (currentEmployeeId) {
      fetchTodayAttendance(currentEmployeeId)
    }

    const timer = setInterval(() => {
      setCurrentTime(new Date())
      if (workStatus === "in") {
        setSecondsWorked(prev => prev + 1)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [currentEmployeeId, workStatus, fetchTodayAttendance])

  const formatElapsedTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const userRole = user?.role || user?.roleId || "Employee"
  const isSuperAdmin = userRole === "Super Admin" || userRole === "role_1" || (user as any)?.isSuperAdmin
  const isManager = userRole === "Manager" || userRole === "Operations Manager" || userRole === "role_2"
  const isStandardEmployee = !isSuperAdmin && !isManager

  const totalEmployeesCount = employees.length
  const activeEmployeesCount = employees.filter(e => e.status === "Active").length
  const workingNowCount = attendanceLogs.filter(a => a.status === "Working" || a.status === "On Time").length
  const openTicketsCount = tickets.filter(t => t.status === "Open" || t.status === "In Progress").length
  const myPendingTasks = tasks.filter(t => (t.assignedTo === currentEmployeeId || t.assignedTo === user?.id) && t.status !== "Done")

  const handlePunchIn = async () => {
    if (!currentEmployeeId) {
      toast.error("User identity not loaded. Please re-login.")
      return
    }
    await punchIn(currentEmployeeId)
  }

  const handlePunchOut = async () => {
    if (!currentEmployeeId) return
    await punchOut(currentEmployeeId)
  }

  const handleBreak = async () => {
    if (!currentEmployeeId) return
    if (workStatus === "break") {
      await endBreak(currentEmployeeId)
    } else {
      await takeBreak(currentEmployeeId)
    }
  }

  if (!mounted) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-56 rounded-xl" />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <Skeleton className="h-44 rounded-xl" />
            <Skeleton className="h-44 rounded-xl" />
            <Skeleton className="h-44 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner with Greeting & Time */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-500/10 via-card to-card p-6 rounded-2xl border border-border/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
              SafeVitals Spatial Command Center
            </span>
            <span className="text-xs text-muted-foreground">
              {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {user?.fullName || (user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : (isSuperAdmin ? "Super Admin" : "Team Member"))}!
          </h1>
          <p className="text-sm text-muted-foreground">
            {isSuperAdmin 
              ? "Organization-wide command center and enterprise workforce operations."
              : isManager
              ? "Team performance, timesheet reviews, and sprint tasks."
              : "Here is your daily task schedule and time tracking terminal."}
          </p>
        </div>

        {/* Live Clock */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="flex flex-col items-end bg-background/80 px-4 py-2 rounded-xl border border-border/60 backdrop-blur-xs">
            <span className="text-xs text-muted-foreground font-medium">Server Time</span>
            <span className="text-lg font-mono font-bold tracking-tight text-foreground">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/70 border-border/80 hover:border-blue-500/40 transition-all shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Workforce
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingData ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{totalEmployeesCount}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              {activeEmployeesCount} active employees
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/80 hover:border-blue-500/40 transition-all shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Clocked In Now
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingData ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{workingNowCount}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {totalEmployeesCount > 0 
                ? `${Math.round((workingNowCount / totalEmployeesCount) * 100)}% attendance rate`
                : "No attendance logs"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/80 hover:border-blue-500/40 transition-all shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Pending Tasks
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Briefcase className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingData ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {isStandardEmployee ? myPendingTasks.length : tasks.filter(t => t.status !== "Done").length}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {isStandardEmployee ? "Assigned to you" : "Across active sprints"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/80 hover:border-blue-500/40 transition-all shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Open Tickets
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <LifeBuoy className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingData ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{openTicketsCount}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {openTicketsCount > 0 ? "Requires resolution" : "All tickets resolved"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Col (8 cols): Punch Clock & Workforce Distribution */}
        <div className="lg:col-span-8 space-y-6">
          {/* Live Punch Clock Card */}
          <Card className="border-blue-500/30 bg-gradient-to-b from-card to-card/60 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    Time & Attendance Terminal
                  </CardTitle>
                  <CardDescription>Server-synchronized shift tracking and status</CardDescription>
                </div>
                <Badge 
                  variant="outline" 
                  className={
                    workStatus === "in" 
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 animate-pulse" 
                      : workStatus === "break"
                      ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                      : workStatus === "completed"
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                      : "bg-muted text-muted-foreground"
                  }
                >
                  <span className={`h-2 w-2 rounded-full mr-1.5 ${workStatus === "in" ? "bg-blue-500" : workStatus === "break" ? "bg-amber-500" : workStatus === "completed" ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                  {workStatus === "in" ? "Clocked In (Active)" : workStatus === "break" ? "On Break" : workStatus === "completed" ? "Shift Completed" : "Clocked Out"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-muted/40 p-4 rounded-xl border border-border/50">
                <div>
                  <span className="text-xs text-muted-foreground font-medium">Standard Shift</span>
                  <p className="text-sm font-semibold mt-0.5">09:00 AM – 05:00 PM</p>
                  <span className="text-[11px] text-muted-foreground">Mon – Fri</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground font-medium">Active Time Today</span>
                  <p className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                    {formatElapsedTime(secondsWorked)}
                  </p>
                  <span className="text-[11px] text-muted-foreground">Standard Shift: 8h</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground font-medium">Terminal Status</span>
                  <p className="text-sm font-semibold mt-0.5 truncate">
                    {workStatus === "in" ? "Active Work Session" : workStatus === "break" ? "Break Period" : workStatus === "completed" ? "Shift Completed" : "Shift Inactive"}
                  </p>
                  <span className="text-[11px] text-blue-500 font-medium">Server Synchronized</span>
                </div>
              </div>

              {/* Punch Actions */}
              <div className="flex flex-wrap items-center gap-3">
                {workStatus === "completed" ? (
                  <Button disabled className="bg-emerald-600 text-white font-medium px-6 opacity-80">
                    <Clock className="mr-2 h-4 w-4" /> Shift Completed Today
                  </Button>
                ) : workStatus === "out" ? (
                  <Button 
                    onClick={handlePunchIn}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 shadow-sm shadow-blue-600/30"
                  >
                    <Clock className="mr-2 h-4 w-4" /> Clock In Now
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={handleBreak}
                      variant="outline"
                      className={workStatus === "break" ? "bg-amber-500 text-white hover:bg-amber-600 border-amber-500" : "border-border hover:bg-accent"}
                    >
                      <Coffee className="mr-2 h-4 w-4" />
                      {workStatus === "break" ? "End Break & Resume" : "Take a Break"}
                    </Button>

                    <Button 
                      onClick={handlePunchOut}
                      variant="outline"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Clock Out for Day
                    </Button>
                  </>
                )}

                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => router.push("/app/attendance")}
                  className="ml-auto text-xs text-muted-foreground hover:text-foreground"
                >
                  View Full Timesheet →
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Workforce Distribution & Status Breakdown */}
          <Card className="bg-card/70 border-border/80 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Workforce Live Allocation</CardTitle>
                  <CardDescription>Real-time presence across global teams</CardDescription>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {totalEmployeesCount} Members
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs p-3 rounded-lg border border-border/50 bg-muted/20">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  <span className="font-medium text-foreground">Working</span>
                  <span className="text-muted-foreground ml-auto font-bold">{workingNowCount}</span>
                </div>
                <div className="flex items-center gap-2 text-xs p-3 rounded-lg border border-border/50 bg-muted/20">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span className="font-medium text-foreground">On Break</span>
                  <span className="text-muted-foreground ml-auto font-bold">
                    {attendanceLogs.filter(a => a.status === "On Break").length}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs p-3 rounded-lg border border-border/50 bg-muted/20">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  <span className="font-medium text-foreground">On Leave</span>
                  <span className="text-muted-foreground ml-auto font-bold">
                    {leaveRequests.filter(l => l.status === "Approved").length}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs p-3 rounded-lg border border-border/50 bg-muted/20">
                  <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
                  <span className="font-medium text-foreground">Suspended</span>
                  <span className="text-muted-foreground ml-auto font-bold">
                    {employees.filter(e => e.status === "Suspended" || e.status === "Deactivated").length}
                  </span>
                </div>
              </div>

              {/* Department Overview Cards */}
              {departments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {departments.slice(0, 3).map(dept => {
                    const deptEmps = employees.filter(e => e.departmentId === dept.id).length
                    return (
                      <div key={dept.id} className="p-3 rounded-lg border border-border/60 bg-muted/20 flex flex-col justify-between">
                        <div className="flex items-center gap-2 font-medium text-xs">
                          <Building2 className="h-3.5 w-3.5 text-blue-500" />
                          <span className="truncate">{dept.name}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                          <span>{deptEmps} Members</span>
                          <span className="text-blue-500 font-semibold">Active</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-muted-foreground border border-dashed rounded-lg">
                  No departments configured yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col (4 cols): Quick Actions, Bulletins, Priority Tasks */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Actions Card */}
          <Card className="bg-card/70 border-border/80 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" /> Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push("/app/leave")}
                className="h-12 flex flex-col items-center justify-center text-xs gap-1 border-border/70 hover:border-blue-500/40 hover:bg-blue-500/5"
              >
                <Calendar className="h-4 w-4 text-blue-500" /> Apply Leave
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push("/app/tickets")}
                className="h-12 flex flex-col items-center justify-center text-xs gap-1 border-border/70 hover:border-blue-500/40 hover:bg-blue-500/5"
              >
                <LifeBuoy className="h-4 w-4 text-blue-500" /> Raise Ticket
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push("/app/tasks")}
                className="h-12 flex flex-col items-center justify-center text-xs gap-1 border-border/70 hover:border-blue-500/40 hover:bg-blue-500/5"
              >
                <CheckCircle2 className="h-4 w-4 text-purple-500" /> Tasks Board
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push("/app/employees")}
                className="h-12 flex flex-col items-center justify-center text-xs gap-1 border-border/70 hover:border-blue-500/40 hover:bg-blue-500/5"
              >
                <Users className="h-4 w-4 text-amber-500" /> Directory
              </Button>
            </CardContent>
          </Card>

          {/* Pending Tasks Quick Widget */}
          <Card className="bg-card/70 border-border/80 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Priority Tasks</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => router.push("/app/tasks")} className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {tasks.slice(0, 3).map(task => (
                <div key={task.id} className="p-2.5 rounded-lg border border-border/60 bg-muted/20 space-y-1 hover:border-blue-500/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-foreground truncate max-w-[180px]">{task.title}</p>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${task.priority === "Urgent" ? "text-red-500 border-red-500/30" : "text-amber-500 border-amber-500/30"}`}>
                      {task.priority || "Medium"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{task.dueDate ? `Due: ${task.dueDate}` : "No due date"}</span>
                    <span className="font-medium text-blue-500">{task.status}</span>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="text-center py-4 text-xs text-muted-foreground">No tasks assigned.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

