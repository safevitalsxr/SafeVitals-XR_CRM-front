"use client"

import * as React from "react"
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Clock, 
  Key, 
  Shield, 
  Lock, 
  Search, 
  Filter, 
  UserCheck, 
  Layers,
  Sparkles,
  Server
} from "lucide-react"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog"
import { Label } from "@/components/ui/Label"
import { Input } from "@/components/ui/Input"
import { useAuthStore } from "@/stores/authStore"
import { useAppStore } from "@/stores/appStore"
import apiClient from "@/lib/apiClient"
import { toast } from "sonner"

export default function AccessRequestsPage() {
  const { user } = useAuthStore()
  const { accessRequests, fetchAccessRequests, reviewAccessRequest, employees } = useAppStore()
  const userRole = user?.role || user?.roleId || "Employee"
  const isSuperAdmin = userRole === "Super Admin" || userRole === "Admin" || userRole === "role_1" || (user as any)?.isSuperAdmin

  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [requestedSystem, setRequestedSystem] = React.useState("")
  const [reason, setReason] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [filterStatus, setFilterStatus] = React.useState<"all" | "Pending" | "Approved" | "Rejected">("all")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    fetchAccessRequests()
  }, [fetchAccessRequests])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!requestedSystem.trim() || !reason.trim()) {
      toast.error("Please fill in all fields")
      return
    }

    setIsSubmitting(true)
    try {
      await apiClient.post('/access-requests', {
        requestedSystem: requestedSystem.trim(),
        reason: reason.trim()
      })
      toast.success("Access request submitted to security administrators.")
      setIsCreateOpen(false)
      setRequestedSystem("")
      setReason("")
      await fetchAccessRequests()
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to submit access request"
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApprove = async (id: string) => {
    await reviewAccessRequest(id, "Approved")
    toast.success("Access request granted and role permissions elevated.")
  }

  const handleReject = async (id: string) => {
    await reviewAccessRequest(id, "Rejected")
    toast.info("Access request rejected.")
  }

  const totalRequests = accessRequests.length
  const pendingRequests = accessRequests.filter(r => r.status === "Pending").length
  const approvedRequests = accessRequests.filter(r => r.status === "Approved").length
  const rejectedRequests = accessRequests.filter(r => r.status === "Rejected").length

  const filteredRequests = accessRequests.filter(r => {
    const matchesStatus = filterStatus === "all" || r.status === filterStatus
    const emp = employees.find(e => e.id === r.employeeId || (e as any)._id === r.employeeId)
    const empName = emp ? `${emp.firstName} ${emp.lastName}`.toLowerCase() : ""
    const matchesSearch = !search.trim() || 
      empName.includes(search.toLowerCase()) || 
      r.requestedSystem.toLowerCase().includes(search.toLowerCase()) ||
      r.reason.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="flex-1 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
              Zero-Trust Security
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
            Elevated Access Control
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Review and grant elevated software, hardware, cloud clusters, and administrative system permissions.
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs text-xs font-medium">
              <Plus className="mr-1.5 h-4 w-4" /> Request System Access
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
                    <Key className="h-4 w-4" />
                  </div>
                  <div>
                    <DialogTitle className="text-base font-bold">Request Elevated System Access</DialogTitle>
                    <DialogDescription className="text-xs">
                      Submit for Administrator verification and cryptographic permission grant.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4 py-4 text-xs">
                <div className="grid gap-1.5">
                  <Label className="text-xs">Requested System / Resource *</Label>
                  <Input 
                    value={requestedSystem} 
                    onChange={e => setRequestedSystem(e.target.value)} 
                    placeholder="e.g. AWS Cloud Rendering Cluster / Lab 3 Biometrics / GitHub Admin" 
                    required 
                    className="text-xs"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Business Justification *</Label>
                  <textarea 
                    value={reason} 
                    onChange={e => setReason(e.target.value)} 
                    placeholder="Describe specific project requirements, sprint ticket ID, and expected access duration..."
                    required
                    className="flex min-h-[90px] w-full rounded-md border border-border bg-card px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                  {isSubmitting ? "Submitting..." : "Submit Access Request"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-card/70 border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Total Requests</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
            <p className="text-[11px] text-muted-foreground">All logged permissions</p>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/80 shadow-xs border-amber-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-amber-500 uppercase">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{pendingRequests}</div>
            <p className="text-[11px] text-muted-foreground">Awaiting Administrator decision</p>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/80 shadow-xs border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-blue-500 uppercase">Granted Access</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{approvedRequests}</div>
            <p className="text-[11px] text-muted-foreground">Active elevated sessions</p>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/80 shadow-xs border-destructive/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-destructive uppercase">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{rejectedRequests}</div>
            <p className="text-[11px] text-muted-foreground">Denied access attempts</p>
          </CardContent>
        </Card>
      </div>

      {/* Access Requests Table Card */}
      <Card className="bg-card/70 border-border/80 shadow-xs">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" /> Access Permission Queue
              </CardTitle>
              <CardDescription className="text-xs">
                Immutable audit-logged authorization requests
              </CardDescription>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search requester / system..."
                  className="pl-8 text-xs h-8 w-48 sm:w-56 bg-background/50"
                />
              </div>

              <div className="flex rounded-lg bg-muted/40 p-0.5 border border-border/60 text-xs">
                {(["all", "Pending", "Approved", "Rejected"] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                      filterStatus === st 
                        ? "bg-card text-foreground shadow-xs font-semibold" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {st === "all" ? "All" : st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="text-xs font-semibold">Requester</TableHead>
                <TableHead className="text-xs font-semibold">System / Resource</TableHead>
                <TableHead className="text-xs font-semibold">Business Justification</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-xs font-semibold text-right">Access Management</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map(req => {
                const emp = employees.find(e => e.id === req.employeeId || (e as any)._id === req.employeeId)
                const name = emp ? `${emp.firstName} ${emp.lastName}` : "Staff Member"
                const empRole = (emp as any)?.role || (emp as any)?.positionTitle || "Employee"

                return (
                  <TableRow key={req.id} className="border-border/60 hover:bg-muted/10 transition-colors">
                    <TableCell className="text-xs">
                      <div className="font-semibold text-foreground">{name}</div>
                      <span className="text-[11px] text-muted-foreground">{empRole}</span>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="inline-flex items-center gap-1.5 font-medium px-2 py-0.5 rounded-md bg-muted/50 border border-border/60">
                        <Server className="h-3 w-3 text-blue-500" />
                        <span>{req.requestedSystem}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[260px] truncate" title={req.reason}>
                      {req.reason}
                    </TableCell>
                    <TableCell className="text-xs">
                      {req.status === "Pending" && (
                        <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10 text-[10px] font-semibold">
                          <Clock className="w-3 h-3 mr-1"/> Pending Review
                        </Badge>
                      )}
                      {req.status === "Approved" && (
                        <Badge variant="outline" className="text-blue-500 border-blue-500/30 bg-blue-500/10 text-[10px] font-semibold">
                          <CheckCircle2 className="w-3 h-3 mr-1"/> Access Granted
                        </Badge>
                      )}
                      {req.status === "Rejected" && (
                        <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10 text-[10px] font-semibold">
                          <XCircle className="w-3 h-3 mr-1"/> Denied
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isSuperAdmin && req.status === "Pending" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button 
                            size="sm" 
                            onClick={() => handleApprove(req.id)} 
                            className="h-7 px-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-medium shadow-xs"
                          >
                            <UserCheck className="w-3 h-3 mr-1" /> Grant Access
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleReject(req.id)} 
                            className="h-7 px-2.5 text-destructive border-destructive/30 hover:bg-destructive/10 text-[11px] font-medium"
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic">
                          {req.status === "Approved" ? "Permission Active" : req.status === "Rejected" ? "Decision Finalized" : "Awaiting Admin"}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}

              {filteredRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-xs text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <ShieldAlert className="h-8 w-8 text-muted-foreground/40" />
                      <p className="font-medium">No access requests matching current filters.</p>
                    </div>
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
