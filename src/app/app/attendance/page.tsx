"use client"

import * as React from "react"
import { 
  Clock, 
  Coffee, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Download,
  TrendingUp,
  MapPin,
  Sparkles
} from "lucide-react"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { Skeleton } from "@/components/ui/Skeleton"
import { useAuthStore } from "@/stores/authStore"
import { useAppStore } from "@/stores/appStore"
import { toast } from "sonner"

export default function AttendancePage() {
  const { user } = useAuthStore()
  const userRole = user?.role || user?.roleId || "Employee"
  const isManager = userRole === "Super Admin" || userRole === "Manager" || userRole === "role_1" || userRole === "role_2"
  const currentEmployeeId = user?.id || user?._id || ""
  
  const { employees, attendanceLogs, workStatus, punchIn, punchOut, takeBreak, endBreak, isLoadingData, fetchTodayAttendance } = useAppStore()
  const [mounted, setMounted] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(new Date())

  React.useEffect(() => {
    setMounted(true)
    if (currentEmployeeId) {
      fetchTodayAttendance(currentEmployeeId)
    }
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [currentEmployeeId, fetchTodayAttendance])

  const handlePunchIn = () => {
    punchIn(currentEmployeeId)
    toast.success("Clocked in successfully! Have a great shift.")
  }

  const handlePunchOut = () => {
    punchOut(currentEmployeeId)
    toast.success("Clocked out successfully for today.")
  }

  const handleBreak = () => {
    if (workStatus === "break") {
      endBreak(currentEmployeeId)
      toast.success("Break ended. Welcome back!")
    } else {
      takeBreak(currentEmployeeId)
      toast.success("Break started.")
    }
  }

  const myLogs = attendanceLogs.filter(l => l.employeeId === currentEmployeeId)

  // Export Timesheet CSV
  const handleExportTimesheet = () => {
    const headers = ["Date", "Employee ID", "Check In", "Check Out", "Status", "Location"]
    const rows = attendanceLogs.map(log => [
      log.date,
      log.employeeId,
      log.checkIn,
      log.checkOut || "Active",
      log.status,
      log.location
    ])

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.map(item => `"${item}"`).join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `safevitals_timesheet_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Timesheet exported to CSV")
  }

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-52" />
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-7">
            <Skeleton className="h-64 rounded-xl" />
          </div>
          <div className="md:col-span-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
            <Skeleton className="h-32 rounded-xl" />
          </div>
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Time & Attendance</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Clock in/out, view daily timesheets, and monitor organizational punctuality.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportTimesheet} className="self-start sm:self-auto">
          <Download className="mr-2 h-4 w-4" /> Export Timesheet
        </Button>
      </div>

      {/* Terminal & Summary Grid */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Terminal Clock Card (7 cols) */}
        <Card className="md:col-span-7 border-blue-500/30 bg-gradient-to-br from-card to-card/60 shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Attendance Terminal</CardTitle>
              <Badge 
                variant="outline"
                className={
                  workStatus === "in" 
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 font-medium" 
                    : workStatus === "break"
                    ? "bg-amber-500/10 text-amber-500 border-amber-500/30 font-medium"
                    : workStatus === "completed"
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 font-medium"
                    : "bg-muted text-muted-foreground font-medium"
                }
              >
                <span className={`h-2 w-2 rounded-full mr-1.5 ${workStatus === "in" ? "bg-blue-500" : workStatus === "break" ? "bg-amber-500" : workStatus === "completed" ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                {workStatus === "in" ? "Active Session" : workStatus === "break" ? "On Break" : workStatus === "completed" ? "Shift Completed" : "Clocked Out"}
              </Badge>
            </div>
            <CardDescription>
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col items-center justify-center py-6 space-y-6">
            <div className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-foreground bg-muted/30 px-6 py-3 rounded-2xl border border-border/50">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>

            <div className="flex flex-wrap gap-3 w-full max-w-md justify-center">
              <Button 
                size="lg" 
                disabled={workStatus === "in" || workStatus === "break" || workStatus === "completed"}
                onClick={handlePunchIn}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm shadow-blue-600/30"
              >
                <Clock className="mr-2 h-4 w-4" /> Clock In
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                disabled={workStatus === "out" || workStatus === "completed"}
                onClick={handleBreak}
                className={`flex-1 ${workStatus === "break" ? "bg-amber-500 text-white hover:bg-amber-600 border-amber-500" : "border-border hover:bg-accent"}`}
              >
                <Coffee className="mr-2 h-4 w-4" /> 
                {workStatus === "break" ? "End Break" : "Break"}
              </Button>
              <Button 
                variant="destructive" 
                size="lg"
                disabled={workStatus === "out" || workStatus === "completed"}
                onClick={handlePunchOut}
                className="flex-1 font-medium"
              >
                <LogOut className="mr-2 h-4 w-4" /> Clock Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Stats & Summary (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-card/70 border-border/80 shadow-xs p-4 space-y-1">
              <span className="text-xs text-muted-foreground font-medium">Logged This Week</span>
              <p className="text-xl font-bold text-foreground">38.5 hrs</p>
              <span className="text-[11px] text-blue-500 font-medium">Target: 40 hrs</span>
            </Card>
            <Card className="bg-card/70 border-border/80 shadow-xs p-4 space-y-1">
              <span className="text-xs text-muted-foreground font-medium">Punctuality Score</span>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">96.8%</p>
              <span className="text-[11px] text-muted-foreground">On Time</span>
            </Card>
          </div>

          <Card className="bg-card/70 border-border/80 shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Location & Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-blue-500" />
                <span>Default Office: <strong>Spatial Computing Lab #3</strong></span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                <span>Biometric Hardware Check: <strong>Passed</strong></span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Attendance History Table */}
      <Card className="bg-card shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            {isManager ? "Team Attendance Log" : "My Attendance Records"}
          </CardTitle>
          <CardDescription>
            {isManager ? "Showing all workforce check-in and checkout timestamps" : "Your recent check-in times and status"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/80 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  {isManager && <TableHead className="font-semibold text-xs">Employee</TableHead>}
                  <TableHead className="font-semibold text-xs">Date</TableHead>
                  <TableHead className="font-semibold text-xs">Check In</TableHead>
                  <TableHead className="font-semibold text-xs">Check Out</TableHead>
                  <TableHead className="font-semibold text-xs">Hours</TableHead>
                  <TableHead className="font-semibold text-xs">Location</TableHead>
                  <TableHead className="text-right font-semibold text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(isManager ? attendanceLogs : myLogs).map((log) => {
                  const emp = employees.find(e => e.id === log.employeeId)
                  const rawEmp = log.raw?.employeeId
                  const firstName = emp?.firstName || rawEmp?.firstName || rawEmp?.userId?.firstName || "Team"
                  const lastName = emp?.lastName || rawEmp?.lastName || rawEmp?.userId?.lastName || "Member"
                  const fullName = emp ? `${emp.firstName} ${emp.lastName}` : (firstName !== "Team" ? `${firstName} ${lastName}` : "Team Member")
                  const avatar = emp?.avatarUrl || rawEmp?.avatarUrl || rawEmp?.userId?.avatar || ""
                  const initial = firstName.charAt(0) || "U"
                  const displayEmpId = emp?.employeeId || rawEmp?.employeeId || log.employeeId

                  // Calculate hours worked
                  let hoursWorked = "-";
                  if (log.raw?.checkInAt && log.raw?.checkOutAt) {
                    const diffMs = new Date(log.raw.checkOutAt).getTime() - new Date(log.raw.checkInAt).getTime();
                    const diffHrs = diffMs / (1000 * 60 * 60);
                    hoursWorked = diffHrs.toFixed(2) + " hrs";
                  } else if (log.checkIn && log.checkIn !== '--:--' && (!log.checkOut || log.checkOut === "Active Session")) {
                    hoursWorked = "In Progress";
                  }

                  return (
                    <TableRow key={log.id}>
                      {isManager && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarImage src={avatar} />
                              <AvatarFallback className="text-[10px] bg-blue-500/10 text-blue-500">{initial}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-xs">{fullName}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">{displayEmpId}</p>
                            </div>
                          </div>
                        </TableCell>
                      )}
                      <TableCell className="text-xs">{log.date}</TableCell>
                      <TableCell className="text-xs font-mono font-medium">{log.checkIn}</TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">{log.checkOut || "Active Session"}</TableCell>
                      <TableCell className="text-xs font-mono font-medium">{hoursWorked}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{log.location}</TableCell>
                      <TableCell className="text-right">
                        <Badge 
                          variant="outline" 
                          className={
                            log.status === "On Time"
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 text-xs"
                              : "bg-amber-500/10 text-amber-500 border-amber-500/30 text-xs"
                          }
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
