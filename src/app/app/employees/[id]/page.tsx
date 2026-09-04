"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Mail, Phone, MapPin, Building, Ban, Trash2, CheckCircle2, Shield } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/Dialog"
import { Label } from "@/components/ui/Label"
import { Input } from "@/components/ui/Input"
import { Employee } from "@/types"
import { useAuthStore } from "@/stores/authStore"
import { useAppStore } from "@/stores/appStore"
import apiClient from "@/lib/apiClient"
import { CreateDepartmentDialog } from "@/components/employees/CreateDepartmentDialog"
import { CreateTeamDialog } from "@/components/employees/CreateTeamDialog"

export default function EmployeeProfilePage() {
  const params = useParams()
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [employee, setEmployee] = React.useState<Employee | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  const getId = (val: any) => typeof val === 'object' && val !== null ? (val._id || val.id) : val;

  // Edit states
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editEmail, setEditEmail] = React.useState("")
  const [editPhone, setEditPhone] = React.useState("")
  const [editAddress, setEditAddress] = React.useState("")

  const [isAssignDialogOpen, setIsAssignDialogOpen] = React.useState(false)
  const [editDept, setEditDept] = React.useState("")
  const [editTeam, setEditTeam] = React.useState("")
  const [editRole, setEditRole] = React.useState("")

  const [deptOpen, setDeptOpen] = React.useState(false)
  const [teamOpen, setTeamOpen] = React.useState(false)

  const { 
    employees, 
    departments, 
    teams, 
    roles, 
    suspendEmployee, 
    reactivateEmployee, 
    updateEmployee, 
    deleteEmployee,
    isLoadingData
  } = useAppStore()

  const employeeId = params.id as string

  React.useEffect(() => {
    const fetchEmployee = async () => {
      // If the app is globally fetching data, wait for it to finish first
      // because we might find the employee locally once it populates
      if (isLoadingData) return;
      
      setIsLoading(true)
      try {
        // 1. Check local store (match by employee ID or user ID)
        const found = employees.find(e => {
          const rawE = e as any;
          const uId = typeof rawE.userId === 'object' ? (rawE.userId?._id || rawE.userId?.id) : rawE.userId;
          return e.id === employeeId || rawE._id === employeeId || uId === employeeId;
        });

        if (found) {
          setEmployee(found)
          setEditEmail(found.secondaryEmail || found.email || "")
          setEditPhone(found.phone || "")
          setEditAddress(found.address || "")
          setEditDept(getId(found.departmentId) || "")
          setEditTeam(getId(found.teamId) || "")
          setEditRole(getId(found.roleId) || "")
          setIsLoading(false)
          return
        }

        // 2. Fetch directly from backend
        const res = await apiClient.get(`/employees/${employeeId}`)
        if (res.data) {
          const emp = res.data.data || res.data
          const formatted: Employee = {
            ...emp,
            id: emp._id ? emp._id.toString() : emp.id,
            firstName: emp.firstName || emp.userId?.firstName || "",
            lastName: emp.lastName || emp.userId?.lastName || "",
            email: emp.email || emp.userId?.email || "",
            avatarUrl: emp.avatarUrl || emp.userId?.avatar || "",
            status: emp.status || "Active",
          }
          setEmployee(formatted)
          setEditEmail(formatted.secondaryEmail || formatted.email || "")
          setEditPhone(formatted.phone || "")
          setEditAddress(formatted.address || "")
          setEditDept(getId(formatted.departmentId) || "")
          setEditTeam(getId(formatted.teamId) || "")
          setEditRole(getId(formatted.roleId) || "")
        } else {
          setEmployee(null)
        }
      } catch (error) {
        console.error("Failed to load employee from API:", error)
        setEmployee(null)
      } finally {
        setIsLoading(false)
      }
    }
    fetchEmployee()
  }, [employeeId, employees, isLoadingData])

  const userRole = user?.role || user?.roleId || "Employee"
  const isSuperAdmin = userRole === "Super Admin" || userRole === "role_1" || (user as any)?.isSuperAdmin

  const handleSaveContact = async () => {
    if (!employee) return
    const success = await updateEmployee(employee.id, {
      secondaryEmail: editEmail?.trim() || undefined,
      phone: editPhone?.trim() || undefined,
      address: editAddress?.trim() || undefined
    })
    if (success) {
      setIsDialogOpen(false)
    }
  }

  const handleSaveAssignment = async () => {
    if (!employee) return
    
    // Convert empty strings to undefined so they don't fail MongoId validation
    const payload: any = {}
    if (editDept) payload.departmentId = editDept
    if (editTeam) payload.teamId = editTeam
    if (editRole) payload.roleId = editRole

    // If they explicitly unassign, we send undefined (wait, actually backend IsOptional means we can omit or send undefined)
    // But since they are optional, omitting the key is fine.
    
    // Oh wait, if they select "Unassigned", the value is "". 
    // If we just do `if (editDept)`, it won't send anything when they unassign.
    // If we want to unassign, we SHOULD send undefined or null so backend clears it.
    // Wait, Mongoose `IsOptional()` might not clear it if the key is missing. It only clears if we pass null or undefined.
    // Actually, sending undefined to axios drops the key! We might need to send null.
    // Let's just send undefined if empty, or the value if set.
    payload.departmentId = editDept || null
    payload.teamId = editTeam || null
    payload.roleId = editRole || null

    const success = await updateEmployee(employee.id, payload)
    if (success) {
      setIsAssignDialogOpen(false)
    }
  }

  const handleToggleSuspend = async () => {
    if (!employee) return
    if (employee.status === "Suspended") {
      await reactivateEmployee(employee.id)
    } else {
      await suspendEmployee(employee.id)
    }
  }

  const handleDelete = async () => {
    if (!employee) return
    if (!confirm(`Are you sure you want to deactivate employee record for ${employee.firstName} ${employee.lastName}?`)) return
    const success = await deleteEmployee(employee.id)
    if (success) {
      router.push("/app/employees")
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold">Employee Record Not Found</h2>
        <p className="text-sm text-muted-foreground">The requested employee ID does not exist on the server.</p>
        <Button variant="outline" onClick={() => router.push("/app/employees")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Directory
        </Button>
      </div>
    )
  }

  const deptName = departments.find(d => d.id === getId(employee.departmentId))?.name || "Unassigned"
  const teamName = teams.find(t => t.id === getId(employee.teamId))?.name || "Unassigned"
  const roleName = roles.find(r => r.id === getId(employee.roleId))?.name || "Standard Employee"
  const initials = `${employee.firstName?.charAt(0) || ""}${employee.lastName?.charAt(0) || ""}`.toUpperCase() || "E"

  return (
    <div className="flex-1 space-y-6 max-w-5xl mx-auto w-full">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push("/app/employees")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Directory
        </Button>

        {isSuperAdmin && (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleToggleSuspend}
              className={employee.status === "Suspended" ? "text-blue-500 border-blue-500/30" : "text-amber-500 border-amber-500/30"}
            >
              <Ban className="mr-2 h-4 w-4" /> 
              {employee.status === "Suspended" ? "Reactivate Account" : "Suspend Account"}
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Deactivate
            </Button>
          </div>
        )}
      </div>

      {/* Main Profile Card */}
      <Card className="bg-card/70 border-border/80 shadow-xs">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar className="h-24 w-24 border-2 border-blue-500/30">
              <AvatarImage src={employee.avatarUrl} alt={`${employee.firstName} ${employee.lastName}`} />
              <AvatarFallback className="bg-blue-500/10 text-blue-500 font-bold text-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">
                  {employee.firstName} {employee.lastName}
                </h1>
                <Badge 
                  variant="outline" 
                  className={
                    employee.status === "Active" 
                      ? "text-blue-500 border-blue-500/30 bg-blue-500/10" 
                      : "text-amber-500 border-amber-500/30 bg-amber-500/10"
                  }
                >
                  {employee.status}
                </Badge>
                <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {employee.employeeId || "ID Pending"}
                </span>
              </div>
              <p className="text-sm font-medium text-foreground">{employee.position || "Employee"}</p>
              <p className="text-xs text-muted-foreground">{deptName} • {teamName}</p>
            </div>

            {isSuperAdmin && (
              <Button onClick={() => setIsAssignDialogOpen(true)} variant="outline" size="sm">
                Edit Assignment
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Information Columns */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Information */}
        <Card className="bg-card/70 border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Contact & Personal</CardTitle>
            {isSuperAdmin && (
              <Button variant="ghost" size="sm" onClick={() => setIsDialogOpen(true)} className="text-xs">
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-blue-500 shrink-0" />
              <span className="text-muted-foreground">Primary:</span>
              <span className="font-medium text-foreground">{employee.email}</span>
            </div>
            {employee.secondaryEmail && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Secondary:</span>
                <span className="font-medium text-foreground">{employee.secondaryEmail}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-blue-500 shrink-0" />
              <span className="text-muted-foreground">Phone:</span>
              <span className="font-medium text-foreground">{employee.phone || "Not specified"}</span>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <span className="text-muted-foreground">Address:</span>
              <span className="font-medium text-foreground">{employee.address || "Not specified"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Organization & Role */}
        <Card className="bg-card/70 border-border/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Organization Role</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Building className="h-4 w-4 text-blue-500 shrink-0" />
              <span className="text-muted-foreground">Department:</span>
              <span className="font-medium text-foreground">{deptName}</span>
            </div>
            <div className="flex items-center gap-3">
              <Building className="h-4 w-4 text-blue-500 shrink-0" />
              <span className="text-muted-foreground">Team:</span>
              <span className="font-medium text-foreground">{teamName}</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-purple-500 shrink-0" />
              <span className="text-muted-foreground">Security Role:</span>
              <span className="font-medium text-foreground">{roleName}</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
              <span className="text-muted-foreground">Joined:</span>
              <span className="font-medium text-foreground">
                {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Contact Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contact Information</DialogTitle>
            <DialogDescription>Update contact details for {employee.firstName}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="grid gap-1.5">
              <Label>Secondary Email</Label>
              <Input value={editEmail} onChange={e => setEditEmail(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Phone Number</Label>
              <Input value={editPhone} onChange={e => setEditPhone(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Address</Label>
              <Input value={editAddress} onChange={e => setEditAddress(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveContact} className="bg-blue-600 hover:bg-blue-700 text-white">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Assignment Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Organization Assignment</DialogTitle>
            <DialogDescription>Reassign department, team, or security role.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <Label>Department</Label>
                <Button variant="ghost" size="sm" className="h-5 px-2 text-xs" onClick={() => setDeptOpen(true)}>+ Create</Button>
              </div>
              <select 
                value={editDept} 
                onChange={e => setEditDept(e.target.value)}
                className="flex h-9 w-full rounded-md border border-border bg-card px-3 py-1 text-xs"
              >
                <option value="">Unassigned</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <Label>Team</Label>
                <Button variant="ghost" size="sm" className="h-5 px-2 text-xs" onClick={() => setTeamOpen(true)}>+ Create</Button>
              </div>
              <select 
                value={editTeam} 
                onChange={e => setEditTeam(e.target.value)}
                className="flex h-9 w-full rounded-md border border-border bg-card px-3 py-1 text-xs"
              >
                <option value="">Unassigned</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label>Security Role</Label>
              <select 
                value={editRole} 
                onChange={e => setEditRole(e.target.value)}
                className="flex h-9 w-full rounded-md border border-border bg-card px-3 py-1 text-xs"
              >
                <option value="">Standard</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveAssignment} className="bg-blue-600 hover:bg-blue-700 text-white">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <CreateDepartmentDialog open={deptOpen} onOpenChange={setDeptOpen} onSuccess={() => {}} />
      <CreateTeamDialog open={teamOpen} onOpenChange={setTeamOpen} departmentId={editDept || ""} onSuccess={() => {}} />
    </div>
  )
}
