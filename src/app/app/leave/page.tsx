"use client"

import * as React from "react"
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Plus, 
  Palmtree, 
  HeartPulse, 
  SunMedium,
  Check,
  X
} from "lucide-react"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog"
import { Label } from "@/components/ui/Label"
import { Input } from "@/components/ui/Input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { Skeleton } from "@/components/ui/Skeleton"
import { useAuthStore } from "@/stores/authStore"
import { useAppStore } from "@/stores/appStore"
import { toast } from "sonner"

export default function LeavePage() {
  const { user } = useAuthStore()
  const { employees, leaveRequests, addLeaveRequest, updateLeaveStatus, isLoadingData } = useAppStore()
  const currentEmployeeId = user?.employeeDocId || user?.id || user?._id || ""
  const currentUserId = user?.id || user?._id || ""
  const userRole = user?.role || user?.roleId || "Employee"
  const isManager = userRole === "Super Admin" || userRole === "Manager" || userRole === "role_1" || userRole === "role_2"

  const [mounted, setMounted] = React.useState(false)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [leaveType, setLeaveType] = React.useState<"Sick" | "Casual" | "Annual" | "Earned" | "Unpaid">("Casual")
  const [startDate, setStartDate] = React.useState("")
  const [endDate, setEndDate] = React.useState("")
  const [reason, setReason] = React.useState("")
  const [filterTab, setFilterTab] = React.useState<"all" | "Pending" | "Approved" | "Rejected">("all")

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate duration in days
  const calculatedDays = React.useMemo(() => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diff = end.getTime() - start.getTime()
    if (diff < 0) return 0
    return Math.round(diff / (1000 * 3600 * 24)) + 1
  }, [startDate, endDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!startDate || !endDate || !reason.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    const success = await addLeaveRequest({
      employeeId: currentEmployeeId,
      leaveType,
      startDate,
      endDate,
      reason
    })
    
    if (success) {
      setIsDialogOpen(false)
      setStartDate("")
      setEndDate("")
      setReason("")
    }
  }

  const handleReview = async (id: string, status: "Approved" | "Rejected") => {
    await updateLeaveStatus(id, status)
  }

  const myLeaves = leaveRequests.filter(lr => lr.employeeId === currentEmployeeId || lr.employeeId === currentUserId || lr.employeeId === user?.employeeDocId)
  const pendingTeamRequests = leaveRequests.filter(lr => lr.status === "Pending")
  const filteredMyLeaves = myLeaves.filter(l => filterTab === "all" || l.status === filterTab)

  // Derived dynamic statistics
  const approvedCasual = myLeaves.filter(l => l.type === "Casual" && l.status === "Approved").length
  const approvedSick = myLeaves.filter(l => l.type === "Sick" && l.status === "Approved").length
  const approvedAnnual = myLeaves.filter(l => (l.type === "Annual" || l.type === "Earned") && l.status === "Approved").length

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Time Off & Leave</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Request time off, monitor approved absences, and review team schedules.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
              <Plus className="mr-2 h-4 w-4" /> Request Time Off
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Request Leave</DialogTitle>
                <DialogDescription>Submit a new time-off application for manager approval.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-1.5">
                  <Label className="text-xs">Leave Category</Label>
                  <select
                    value={leaveType}
                    onChange={e => setLeaveType(e.target.value as any)}
                    className="flex h-9 w-full rounded-md border border-border bg-card px-3 py-1 text-xs"
                  >
                    <option value="Casual">Casual Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Annual">Annual / Vacation Leave</option>
                    <option value="Unpaid">Unpaid Leave</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label className="text-xs">Start Date *</Label>
                    <Input 
                      type="date" 
                      value={startDate} 
                      onChange={e => setStartDate(e.target.value)} 
                      required 
                      className="bg-card" 
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs">End Date *</Label>
                    <Input 
                      type="date" 
                      value={endDate} 
                      onChange={e => setEndDate(e.target.value)} 
                      required 
                      className="bg-card" 
                    />
                  </div>
                </div>

                {calculatedDays > 0 && (
                  <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center justify-between">
                    <span>Requested Duration:</span>
                    <span><strong>{calculatedDays} working day(s)</strong></span>
                  </div>
                )}

                <div className="grid gap-1.5">
                  <Label className="text-xs">Reason for Absence *</Label>
                  <Input 
                    value={reason} 
                    onChange={e => setReason(e.target.value)} 
                    required 
                    placeholder="Brief explanation for time off" 
                    className="bg-card" 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Submit Request</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card/70 border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Casual Approved
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <SunMedium className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCasual} <span className="text-xs font-normal text-muted-foreground">requests</span></div>
            <p className="text-xs text-muted-foreground mt-1">Confirmed casual leaves</p>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Sick Approved
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
              <HeartPulse className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedSick} <span className="text-xs font-normal text-muted-foreground">requests</span></div>
            <p className="text-xs text-muted-foreground mt-1">Confirmed medical leaves</p>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Annual Vacation Approved
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Palmtree className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedAnnual} <span className="text-xs font-normal text-muted-foreground">requests</span></div>
            <p className="text-xs text-muted-foreground mt-1">Confirmed vacation leaves</p>
          </CardContent>
        </Card>
      </div>

      {/* Manager Review Queue */}
      {isManager && pendingTeamRequests.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5 shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  Manager Review Queue
                </CardTitle>
                <CardDescription>Pending leave applications requiring review</CardDescription>
              </div>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">
                {pendingTeamRequests.length} Pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="text-xs">Employee</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Duration</TableHead>
                  <TableHead className="text-xs">Reason</TableHead>
                  <TableHead className="text-xs text-right">Review</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingTeamRequests.map(req => {
                  const emp = employees.find(e => e.id === req.employeeId || (e as any)._id === req.employeeId)
                  return (
                    <TableRow key={req.id} className="border-border/60">
                      <TableCell className="text-xs font-medium">
                        {emp ? `${emp.firstName} ${emp.lastName}` : (req.employeeId || "Staff Member")}
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="outline" className="text-[10px]">{req.type}</Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono">{req.startDate} → {req.endDate}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{req.reason}</TableCell>
                      <TableCell className="text-xs text-right space-x-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleReview(req.id, "Approved")}
                          className="h-7 px-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                        >
                          <Check className="h-3 w-3 mr-1" /> Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleReview(req.id, "Rejected")}
                          className="h-7 px-2.5 text-destructive border-destructive/30 hover:bg-destructive/10 text-xs"
                        >
                          <X className="h-3 w-3 mr-1" /> Reject
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* My Leave Requests Table */}
      <Card className="bg-card/70 border-border/80 shadow-xs">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">My Leave History</CardTitle>
            <CardDescription>Records of your past and active time-off applications</CardDescription>
          </div>
          <div className="flex gap-1.5">
            {(["all", "Pending", "Approved", "Rejected"] as const).map(tab => (
              <Button 
                key={tab} 
                size="sm" 
                variant={filterTab === tab ? "default" : "outline"} 
                onClick={() => setFilterTab(tab)}
                className={`h-7 text-xs ${filterTab === tab ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="text-xs">Category</TableHead>
                <TableHead className="text-xs">Dates</TableHead>
                <TableHead className="text-xs">Reason</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs text-right">Applied On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMyLeaves.map(leave => (
                <TableRow key={leave.id} className="border-border/60">
                  <TableCell className="text-xs font-semibold">
                    <Badge variant="outline" className="text-[10px]">{leave.type}</Badge>
                  </TableCell>
                  <TableCell className="text-xs font-mono">{leave.startDate} → {leave.endDate}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[240px] truncate">{leave.reason}</TableCell>
                  <TableCell className="text-xs">
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] ${
                        leave.status === "Approved" 
                          ? "text-blue-500 border-blue-500/30 bg-blue-500/10" 
                          : leave.status === "Pending" 
                          ? "text-amber-500 border-amber-500/30 bg-amber-500/10" 
                          : "text-destructive border-destructive/30 bg-destructive/10"
                      }`}
                    >
                      {leave.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-right text-muted-foreground">
                    {leave.appliedAt ? new Date(leave.appliedAt).toLocaleDateString() : "N/A"}
                  </TableCell>
                </TableRow>
              ))}
              {filteredMyLeaves.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-xs text-muted-foreground">
                    No leave requests found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
