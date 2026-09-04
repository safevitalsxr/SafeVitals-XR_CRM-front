"use client"

import * as React from "react"
import { Shield, Plus, Lock, Users, Clock, Calendar, Settings, AlertCircle, Copy, Trash2, Edit2, MoreHorizontal, CheckCircle2, ShieldAlert, FileText, Search } from "lucide-react"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Switch } from "@/components/ui/Switch"
import { Label } from "@/components/ui/Label"
import { Input } from "@/components/ui/Input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/DropdownMenu"
import { Role, PermissionModule } from "@/types"
import { toast } from "sonner"
import { useAuthStore } from "@/stores/authStore"
import { useAppStore } from "@/stores/appStore"
import apiClient from "@/lib/apiClient"

const SYSTEM_PERMISSION_MODULES: PermissionModule[] = [
  {
    id: "mod_1",
    title: "Employees & Directory",
    iconName: "users",
    description: "Manage workforce records and invitations",
    permissions: [
      { id: "employees.view", label: "View employees directory", desc: "Access employee listings and public profiles" },
      { id: "employees.create", label: "Create / Invite employees", desc: "Send onboarding invites and setup accounts" },
      { id: "employees.edit", label: "Edit employee records", desc: "Modify department, team, contact and profile fields" },
      { id: "employees.suspend", label: "Suspend / Deactivate accounts", desc: "Block account access and revoke sessions" },
      { id: "employees.export", label: "Export directory CSV", desc: "Download directory data" }
    ]
  },
  {
    id: "mod_2",
    title: "Time & Attendance",
    iconName: "clock",
    description: "Biometric attendance, punches, and timesheets",
    permissions: [
      { id: "attendance.view.own", label: "View own attendance", desc: "Access personal daily punch history" },
      { id: "attendance.view.team", label: "View team timesheets", desc: "View attendance logs across direct reports" },
      { id: "attendance.view.department", label: "View department attendance", desc: "Full departmental punctuality reporting" },
      { id: "attendance.edit", label: "Manual attendance override", desc: "Adjust punch times for staff" }
    ]
  },
  {
    id: "mod_3",
    title: "Leave Management",
    iconName: "calendar",
    description: "Time off applications and approvals",
    permissions: [
      { id: "leave.apply", label: "Apply for leave", desc: "Submit time-off requests" },
      { id: "leave.review", label: "Review & approve leave", desc: "Approve or reject team leave applications" },
      { id: "leave.manage", label: "Manage allowances", desc: "Configure organizational leave policies" }
    ]
  },
  {
    id: "mod_4",
    title: "Tasks & Sprints",
    iconName: "check-square",
    description: "Kanban board and sprint operations",
    permissions: [
      { id: "tasks.view.own", label: "View assigned tasks", desc: "See personal tasks on the board" },
      { id: "tasks.manage", label: "Create & assign tasks", desc: "Create new sprint items for employees and teams" },
      { id: "tasks.status", label: "Update task status", desc: "Transition tasks across Kanban columns" }
    ]
  },
  {
    id: "mod_5",
    title: "Security & Audit",
    iconName: "shield",
    description: "System security and tamper-evident audit trail",
    permissions: [
      { id: "security.manage", label: "Manage security policies", desc: "Configure password and 2FA rules" },
      { id: "audit.view", label: "View immutable audit logs", desc: "Inspect detailed logs of all security events" }
    ]
  }
]

export default function RolesPage() {
  const { user } = useAuthStore()
  const userRole = user?.role || user?.roleId || "Employee"
  const isSuperAdmin = userRole === "Super Admin" || userRole === "role_1" || (user as any)?.isSuperAdmin
  
  const [roles, setRoles] = React.useState<Role[]>([])
  const [modules, setModules] = React.useState<PermissionModule[]>(SYSTEM_PERMISSION_MODULES)
  const [isLoading, setIsLoading] = React.useState(true)
  const [selectedRoleId, setSelectedRoleId] = React.useState<string | null>(null)

  // Modals & Forms
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [isEditMode, setIsEditMode] = React.useState(false)
  
  // Form State
  const [formData, setFormData] = React.useState({ name: "", description: "", status: "Active" as "Active" | "Inactive" })
  const [activePermissions, setActivePermissions] = React.useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Filters & Search
  const [searchQuery, setSearchQuery] = React.useState("")
  const [permSearchQuery, setPermSearchQuery] = React.useState("")

  const appRoles = useAppStore(state => state.roles)
  const employees = useAppStore(state => state.employees)
  const updateEmployee = useAppStore(state => state.updateEmployee)
  const fetchAllData = useAppStore(state => state.fetchAllData)

  const [assignUserId, setAssignUserId] = React.useState("")

  const fetchRolesData = async () => {
    setIsLoading(true)
    try {
      const res = await apiClient.get('/roles')
      const data = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : [])
      const mapped = data.map((r: any) => ({ ...r, id: r._id || r.id }))
      setRoles(mapped)
      if (mapped.length > 0 && !selectedRoleId) {
        setSelectedRoleId(mapped[0].id)
      }
    } catch (err) {
      console.error("Failed to load roles from API:", err)
      setRoles(appRoles)
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    fetchRolesData()
  }, [])

  const selectedRole = roles.find(r => r.id === selectedRoleId)
  const isSystemRole = selectedRole?.isSystem || false

  // Derived Statistics
  const totalRoles = roles.length
  const activeRoles = roles.filter(r => r.status === "Active").length
  const systemRoles = roles.filter(r => r.isSystem).length
  const totalUsersAssigned = employees.filter(e => roles.some(r => r.id === e.roleId)).length

  const assignedEmployees = employees.filter(e => e.roleId === selectedRoleId)
  const unassignedEmployees = employees.filter(e => e.roleId !== selectedRoleId)

  // Initialize form when a role is selected (if not in edit mode)
  React.useEffect(() => {
    if (selectedRole && !isEditMode && !isCreateOpen) {
      setFormData({ name: selectedRole.name, description: selectedRole.description || "", status: (selectedRole.status as any) || "Active" })
      setActivePermissions(selectedRole.permissions || [])
    }
  }, [selectedRoleId, roles, isEditMode, isCreateOpen])

  const handleTogglePermission = (permissionId: string, checked: boolean) => {
    if (!isEditMode && !isCreateOpen) return
    setActivePermissions(prev => checked ? [...prev, permissionId] : prev.filter(p => p !== permissionId))
  }

  const handleToggleModule = (moduleId: string, checked: boolean) => {
    if (!isEditMode && !isCreateOpen) return
    const mod = modules.find(m => m.id === moduleId)
    if (!mod) return
    const permIds = mod.permissions.map(p => p.id)
    setActivePermissions(prev => {
      const withoutModule = prev.filter(p => !permIds.includes(p))
      return checked ? [...withoutModule, ...permIds] : withoutModule
    })
  }

  const handleSave = async () => {
    if (!formData.name.trim()) return toast.error("Role name is required")
    setIsSubmitting(true)
    
    try {
      if (isCreateOpen) {
        await apiClient.post('/roles', {
          name: formData.name.trim(),
          description: formData.description,
          permissions: activePermissions
        })
        toast.success("Role created successfully on server.")
        setIsCreateOpen(false)
      } else if (selectedRoleId) {
        await apiClient.put(`/roles/${selectedRoleId}`, {
          name: formData.name.trim(),
          description: formData.description,
          permissions: activePermissions
        })
        toast.success("Role updated successfully.")
        setIsEditMode(false)
      }
      await fetchRolesData()
      await fetchAllData()
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to save role"
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this role? This action cannot be undone.")) return
    try {
      await apiClient.delete(`/roles/${id}`)
      toast.success("Role deleted.")
      await fetchRolesData()
      await fetchAllData()
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to delete role"
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
    }
  }

  const filteredRoles = roles.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
  
  const filteredModules = modules.map(m => ({
    ...m,
    permissions: m.permissions.filter(p => p.label.toLowerCase().includes(permSearchQuery.toLowerCase()))
  })).filter(m => m.permissions.length > 0 || m.title.toLowerCase().includes(permSearchQuery.toLowerCase()))

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" /></div>
  }

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2 mb-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Role Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Configure fine-grained permissions and assign organizational access.</p>
        </div>
        {isSuperAdmin && (
          <Button onClick={() => {
            setFormData({ name: "", description: "", status: "Active" })
            setActivePermissions([])
            setIsCreateOpen(true)
            setIsEditMode(false)
            setSelectedRoleId(null)
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Create Role
          </Button>
        )}
      </div>

      {/* Dynamic Statistics */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRoles}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Roles</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRoles}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Roles</CardTitle>
            <Lock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemRoles}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users Assigned</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsersAssigned}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Col: Role List */}
        <div className="md:col-span-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search roles..." 
              className="pl-9"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            {filteredRoles.map(role => {
              const isSelected = role.id === selectedRoleId && !isCreateOpen
              return (
                <Card 
                  key={role.id} 
                  className={`cursor-pointer transition-all border ${isSelected ? "border-blue-500 bg-blue-500/5 shadow-xs" : "border-border hover:border-blue-500/40"}`}
                  onClick={() => {
                    setSelectedRoleId(role.id)
                    setIsCreateOpen(false)
                    setIsEditMode(false)
                  }}
                >
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <CardTitle className="text-base font-semibold">{role.name}</CardTitle>
                      {role.isSystem && (
                        <Badge variant="secondary" className="text-[10px] gap-1">
                          <Lock className="h-2.5 w-2.5" /> System
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{role.description || "No description provided."}</p>
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                      <span>{role.permissions?.length || 0} permissions</span>
                      <span>•</span>
                      <span>{employees.filter(e => e.roleId === role.id).length} users</span>
                    </div>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Right Col: Role Details & Permissions */}
        <div className="md:col-span-8 space-y-6">
          {(selectedRole || isCreateOpen) ? (
            <Card>
              <CardHeader className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold">
                      {isCreateOpen ? "Create New Security Role" : selectedRole?.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isCreateOpen ? "Define role details and granular permissions" : selectedRole?.description}
                    </p>
                  </div>
                  {isSuperAdmin && !isCreateOpen && (
                    <div className="flex items-center gap-2">
                      {!isEditMode ? (
                        <Button size="sm" onClick={() => setIsEditMode(true)}>
                          <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit Role
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setIsEditMode(false)}>Cancel</Button>
                          <Button size="sm" onClick={handleSave} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {isSubmitting ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      )}
                      {!isSystemRole && (
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(selectedRoleId!)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  )}
                  {isCreateOpen && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                      <Button size="sm" onClick={handleSave} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                        {isSubmitting ? "Creating..." : "Create Role"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                {(isEditMode || isCreateOpen) && (
                  <div className="space-y-4 p-4 border rounded-xl bg-muted/20">
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Role Name *</Label>
                      <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Lead QA Engineer" />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Description</Label>
                      <Input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Responsibilities and scope" />
                    </div>
                  </div>
                )}

                {/* Permissions Matrix */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Permissions Matrix</h4>
                    <div className="relative w-56">
                      <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input 
                        placeholder="Filter permissions..." 
                        className="pl-7 h-8 text-xs"
                        value={permSearchQuery}
                        onChange={e => setPermSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {filteredModules.map(mod => {
                      const allModuleSelected = mod.permissions.every(p => activePermissions.includes(p.id))
                      return (
                        <div key={mod.id} className="p-4 border rounded-xl space-y-3 bg-card/50">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-sm">{mod.title}</p>
                              <p className="text-xs text-muted-foreground">{mod.description}</p>
                            </div>
                            {(isEditMode || isCreateOpen) && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleToggleModule(mod.id, !allModuleSelected)}
                                className="text-xs text-blue-500 h-7"
                              >
                                {allModuleSelected ? "Deselect All" : "Select All"}
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            {mod.permissions.map(perm => {
                              const isChecked = activePermissions.includes(perm.id) || activePermissions.includes("*.*.*")
                              return (
                                <div key={perm.id} className="flex items-start gap-2.5 p-2 rounded-lg border border-border/60 bg-background/50">
                                  <Switch 
                                    checked={isChecked}
                                    disabled={!isEditMode && !isCreateOpen}
                                    onCheckedChange={(c) => handleTogglePermission(perm.id, c)}
                                    className="mt-0.5"
                                  />
                                  <div className="space-y-0.5">
                                    <Label className="text-xs font-medium cursor-pointer">{perm.label}</Label>
                                    <p className="text-[11px] text-muted-foreground">{perm.desc}</p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="p-12 text-center border rounded-xl text-muted-foreground">
              Select a role from the list to view permissions.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
