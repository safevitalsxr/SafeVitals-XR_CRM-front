"use client"

import * as React from "react"
import { BarChart3, Clock, CheckCircle2, AlertCircle, FileText, Download, Filter, Plus, Upload, Check, X } from "lucide-react"

import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog"
import { Label } from "@/components/ui/Label"
import { Input } from "@/components/ui/Input"
import { useAuthStore } from "@/stores/authStore"
import { useAppStore } from "@/stores/appStore"
import apiClient from "@/lib/apiClient"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/Skeleton"

interface ReportItem {
  _id?: string
  id?: string
  employeeId?: any
  weekStartDate?: string
  weekEndDate?: string
  workedOn?: string
  completed?: string
  blockers?: string
  nextWeekPlan?: string
  status?: string
  reviewMessage?: string
  attachments?: Array<{ id: string; name: string; url: string; size?: number }>
  createdAt?: string
}

export default function ReportsPage() {
  const [reports, setReports] = React.useState<ReportItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)

  // Report Form State
  const [weekStartDate, setWeekStartDate] = React.useState("")
  const [weekEndDate, setWeekEndDate] = React.useState("")
  const [workedOn, setWorkedOn] = React.useState("")
  const [completed, setCompleted] = React.useState("")
  const [blockers, setBlockers] = React.useState("")
  const [nextWeekPlan, setNextWeekPlan] = React.useState("")
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const { user } = useAuthStore()
  const { employees } = useAppStore()
  const userRole = user?.role || user?.roleId || "Employee"
  const isManager = userRole === "Super Admin" || userRole === "Manager" || userRole === "role_1" || userRole === "role_2"

  const fetchReports = async () => {
    setIsLoading(true)
    try {
      const res = await apiClient.get('/reports?page=1')
      const data = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : [])
      setReports(data.map((r: any) => ({ ...r, id: r._id || r.id })))
    } catch (err) {
      console.error("Failed to load reports from API:", err)
      setReports([])
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    fetchReports()
  }, [])

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!weekStartDate || !weekEndDate || !workedOn.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("weekStartDate", weekStartDate)
      formData.append("weekEndDate", weekEndDate)
      formData.append("workedOn", workedOn)
      formData.append("completed", completed || "Completed milestones as scheduled")
      formData.append("blockers", blockers || "None")
      formData.append("nextWeekPlan", nextWeekPlan || "Continue next sprint iterations")

      if (selectedFile) {
        formData.append("files", selectedFile)
      }

      await apiClient.post('/reports', formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })

      toast.success("Weekly shift report submitted successfully!")
      setIsCreateOpen(false)
      setWeekStartDate("")
      setWeekEndDate("")
      setWorkedOn("")
      setCompleted("")
      setBlockers("")
      setNextWeekPlan("")
      setSelectedFile(null)
      await fetchReports()
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to submit report"
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReview = async (id: string, status: "Approved" | "Needs Revision") => {
    try {
      await apiClient.patch(`/reports/${id}/review`, { status, reviewMessage: `Status updated to ${status}` })
      toast.success(`Report ${status.toLowerCase()}`)
      await fetchReports()
    } catch (err: any) {
      toast.error("Failed to update report status")
    }
  }

  const pendingCount = reports.filter(r => r.status === "Pending" || r.status === "Under Review").length
  const approvedCount = reports.filter(r => r.status === "Approved").length

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Weekly Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Submit weekly summaries, incident attachments, and review team sprint logs.
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
              <Plus className="mr-2 h-4 w-4" /> Submit Weekly Report
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <form onSubmit={handleCreateReport}>
              <DialogHeader>
                <DialogTitle>Submit Weekly Report</DialogTitle>
                <DialogDescription>Document your weekly deliverables, blockers, and files.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 py-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1">
                    <Label className="text-xs">Week Start Date *</Label>
                    <Input type="date" value={weekStartDate} onChange={e => setWeekStartDate(e.target.value)} required />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs">Week End Date *</Label>
                    <Input type="date" value={weekEndDate} onChange={e => setWeekEndDate(e.target.value)} required />
                  </div>
                </div>

                <div className="grid gap-1">
                  <Label className="text-xs">Key Deliverables Worked On *</Label>
                  <textarea 
                    value={workedOn} 
                    onChange={e => setWorkedOn(e.target.value)}
                    required
                    placeholder="Describe spatial modules or features worked on this week" 
                    className="flex min-h-[60px] w-full rounded-md border border-border bg-card px-3 py-2 text-xs"
                  />
                </div>

                <div className="grid gap-1">
                  <Label className="text-xs">Completed Items</Label>
                  <textarea 
                    value={completed} 
                    onChange={e => setCompleted(e.target.value)} 
                    placeholder="Milestones achieved and closed"
                    className="flex min-h-[50px] w-full rounded-md border border-border bg-card px-3 py-2 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1">
                    <Label className="text-xs">Blockers & Risks</Label>
                    <Input value={blockers} onChange={e => setBlockers(e.target.value)} placeholder="None / Hardware latency" />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs">Next Week Plan</Label>
                    <Input value={nextWeekPlan} onChange={e => setNextWeekPlan(e.target.value)} placeholder="Next sprint goals" />
                  </div>
                </div>

                <div className="grid gap-1">
                  <Label className="text-xs">Attachment (Supabase Upload)</Label>
                  <Input 
                    type="file" 
                    onChange={e => setSelectedFile(e.target.files?.[0] || null)} 
                    className="text-xs"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isSubmitting ? "Uploading..." : "Submit Report"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card/70 border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Submitted on server</p>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting manager approval</p>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Reviewed and confirmed</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card className="bg-card/70 border-border/80 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Reports Archive</CardTitle>
          <CardDescription>Server-persisted weekly reports and attached documents</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="text-xs">Author</TableHead>
                  <TableHead className="text-xs">Period</TableHead>
                  <TableHead className="text-xs">Summary</TableHead>
                  <TableHead className="text-xs">Attachments</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  {isManager && <TableHead className="text-xs text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((rep) => {
                  const empId = typeof rep.employeeId === 'object' ? rep.employeeId?._id : rep.employeeId
                  const emp = employees.find(e => e.id === empId || (e as any)._id === empId)
                  const authorName = emp ? `${emp.firstName} ${emp.lastName}` : (typeof rep.employeeId === 'object' && rep.employeeId?.userId?.firstName ? `${rep.employeeId.userId.firstName} ${rep.employeeId.userId.lastName}` : "Employee")
                  
                  return (
                    <TableRow key={rep.id || rep._id} className="border-border/60">
                      <TableCell className="text-xs font-semibold">{authorName}</TableCell>
                      <TableCell className="text-xs font-mono">
                        {rep.weekStartDate && rep.weekEndDate ? `${rep.weekStartDate} → ${rep.weekEndDate}` : "Weekly"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {rep.workedOn || "Weekly summary"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {rep.attachments && rep.attachments.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {rep.attachments.map((att, idx) => {
                              const isMock = att.url?.startsWith("https://mock-storage.local");
                              return (
                                <a 
                                  key={idx} 
                                  href={isMock ? "#" : att.url} 
                                  target={isMock ? undefined : "_blank"} 
                                  rel={isMock ? undefined : "noreferrer"}
                                  download={isMock ? undefined : (att.name || "attachment")}
                                  onClick={(e) => {
                                    if (isMock) {
                                      e.preventDefault();
                                      toast.error("This attachment is unavailable because the storage server was blocked during upload.");
                                    }
                                  }}
                                  className={`flex items-center gap-1 truncate max-w-[120px] ${isMock ? "text-muted-foreground cursor-not-allowed" : "text-blue-500 hover:underline"}`}
                                >
                                  <Download className="h-3 w-3" /> {att.name || "File"}
                                </a>
                              )
                            })}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">None</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge 
                          variant="outline"
                          className={`text-[10px] ${
                            rep.status === "Approved" 
                              ? "text-blue-500 border-blue-500/30 bg-blue-500/10" 
                              : rep.status === "Needs Revision"
                              ? "text-red-500 border-red-500/30 bg-red-500/10"
                              : "text-amber-500 border-amber-500/30 bg-amber-500/10"
                          }`}
                        >
                          {rep.status || "Pending"}
                        </Badge>
                      </TableCell>
                      {isManager && (
                        <TableCell className="text-xs text-right space-x-1">
                          {rep.status !== "Approved" && (
                            <Button 
                              size="sm" 
                              onClick={() => handleReview(rep.id || rep._id || "", "Approved")}
                              className="h-7 px-2 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                            >
                              <Check className="h-3 w-3 mr-1" /> Approve
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
                {reports.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={isManager ? 6 : 5} className="text-center py-8 text-xs text-muted-foreground">
                      No weekly reports submitted yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
