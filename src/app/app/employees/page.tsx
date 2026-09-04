"use client"

import * as React from "react"
import { 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  ShieldAlert, 
  CheckCircle2, 
  LayoutGrid, 
  Table as TableIcon, 
  Download, 
  Mail, 
  Phone, 
  Building2, 
  UserPlus, 
  Sparkles,
  ArrowUpDown
} from "lucide-react"

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Badge } from "@/components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { Skeleton } from "@/components/ui/Skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/DropdownMenu"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/authStore"
import { useAppStore } from "@/stores/appStore"
import { toast } from "sonner"
import { InviteEmployeeModal } from "@/components/employees/InviteEmployeeModal"
import { EditEmployeeModal } from "@/components/employees/EditEmployeeModal"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"

export default function EmployeesPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { employees, departments, roles, suspendEmployee, promoteEmployee, deleteEmployee, isLoadingData } = useAppStore()
  
  const [mounted, setMounted] = React.useState(false)
  const [isInviteOpen, setIsInviteOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedDept, setSelectedDept] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState<"all" | "Active" | "Suspended">("all")
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid")

  const [empToEdit, setEmpToEdit] = React.useState<any>(null)
  const [editOpen, setEditOpen] = React.useState(false)

  const [empToDelete, setEmpToDelete] = React.useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const userRole = user?.role || user?.roleId || "Employee"
  const isSuperAdmin = userRole === "Super Admin" || userRole === "role_1" || (user as any)?.isSuperAdmin

  const getId = (val: any) => typeof val === 'object' && val !== null ? (val._id || val.id) : val;

  const filteredEmployees = employees.filter(emp => {
    const searchLow = searchQuery.toLowerCase()
    const matchesSearch = 
      (emp.firstName?.toLowerCase() || "").includes(searchLow) ||
      (emp.lastName?.toLowerCase() || "").includes(searchLow) ||
      (emp.employeeId?.toLowerCase() || "").includes(searchLow) ||
      (emp.email?.toLowerCase() || "").includes(searchLow) ||
      (emp.position?.toLowerCase() || "").includes(searchLow)

    const matchesDept = selectedDept === "all" || getId(emp.departmentId) === selectedDept
    const matchesStatus = statusFilter === "all" || emp.status === statusFilter

    return matchesSearch && matchesDept && matchesStatus
  })

  // Export to CSV Functionality
  const handleExportCSV = () => {
    const headers = ["Employee ID", "First Name", "Last Name", "Email", "Position", "Department", "Status", "Joining Date"]
    const rows = filteredEmployees.map(emp => {
      const deptName = departments.find(d => d.id === getId(emp.departmentId))?.name || "Unassigned"
      return [
        emp.employeeId,
        emp.firstName,
        emp.lastName,
        emp.email,
        emp.position || "N/A",
        deptName,
        emp.status,
        emp.joiningDate || "N/A"
      ]
    })

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(item => `"${item}"`).join(","))].join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `safevitals_employees_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Employee directory exported to CSV")
  }

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
        <Skeleton className="h-14 rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Employees Directory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your global workforce, department allocations, and permissions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="h-9">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          
          <Button onClick={() => setIsInviteOpen(true)} className="h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
            <UserPlus className="mr-2 h-4 w-4" /> Invite Employee
          </Button>
          
          <InviteEmployeeModal open={isInviteOpen} onOpenChange={setIsInviteOpen} />
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl border border-border/80 bg-card/60">
          <span className="text-xs text-muted-foreground font-medium">Total Directory</span>
          <p className="text-xl font-bold text-foreground mt-0.5">{employees.length}</p>
        </div>
        <div className="p-3 rounded-xl border border-border/80 bg-card/60">
          <span className="text-xs text-muted-foreground font-medium">Active Accounts</span>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">
            {employees.filter(e => e.status === "Active").length}
          </p>
        </div>
        <div className="p-3 rounded-xl border border-border/80 bg-card/60">
          <span className="text-xs text-muted-foreground font-medium">Departments</span>
          <p className="text-xl font-bold text-blue-500 mt-0.5">{departments.length}</p>
        </div>
        <div className="p-3 rounded-xl border border-border/80 bg-card/60">
          <span className="text-xs text-muted-foreground font-medium">Suspended</span>
          <p className="text-xl font-bold text-destructive mt-0.5">
            {employees.filter(e => e.status === "Suspended").length}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card/40 p-3 rounded-xl border border-border/70">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID, position, or email..."
              className="pl-9 bg-background/80 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="flex h-9 rounded-md border border-border bg-background/80 px-3 py-1 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${statusFilter === "all" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("Active")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${statusFilter === "Active" ? "bg-background text-blue-600 dark:text-blue-400 shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter("Suspended")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${statusFilter === "Suspended" ? "bg-background text-destructive shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
            >
              Suspended
            </button>
          </div>
        </div>

        {/* Grid vs Table View Switcher */}
        <div className="flex items-center gap-1 self-end md:self-auto bg-muted/60 p-1 rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("grid")}
            className={`h-7 px-2 text-xs ${viewMode === "grid" ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground"}`}
          >
            <LayoutGrid className="h-3.5 w-3.5 mr-1" /> Cards
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("table")}
            className={`h-7 px-2 text-xs ${viewMode === "table" ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground"}`}
          >
            <TableIcon className="h-3.5 w-3.5 mr-1" /> Table
          </Button>
        </div>
      </div>

      {/* Loading Skeleton during sync */}
      {isLoadingData && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-52 rounded-xl" />
          <Skeleton className="h-52 rounded-xl" />
          <Skeleton className="h-52 rounded-xl" />
        </div>
      )}

      {/* Grid Mode View */}
      {!isLoadingData && viewMode === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.map((emp) => {
            const dept = departments.find(d => d.id === getId(emp.departmentId))
            const fName = emp.firstName || "Unnamed"
            const lName = emp.lastName || (emp.firstName ? "" : "Employee")
            const initials = `${fName.charAt(0)}${lName.charAt(0)}`.toUpperCase()

            return (
              <Card key={emp.id} className="bg-card/70 border-border/80 hover:border-blue-500/40 transition-all shadow-xs flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-background shadow-xs">
                        <AvatarImage src={emp.avatarUrl} alt={emp.firstName} />
                        <AvatarFallback className="bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-sm">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base font-semibold leading-tight hover:text-blue-500 transition-colors cursor-pointer" onClick={() => router.push(`/app/employees/${emp.id}`)}>
                          {fName} {lName}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground font-medium mt-0.5">
                          {emp.position || "XR Specialist"}
                        </p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/app/employees/${emp.id}`)}>
                          View Full Profile
                        </DropdownMenuItem>
                        {isSuperAdmin && (
                          <DropdownMenuItem onClick={() => { setEmpToEdit(emp); setEditOpen(true); }}>
                            Edit Employee
                          </DropdownMenuItem>
                        )}
                        {isSuperAdmin && emp.roleId !== "role_1" && (
                          <DropdownMenuItem 
                            onClick={() => {
                              promoteEmployee(emp.id, "role_1")
                              toast.success("Promoted to Super Admin")
                            }}
                            className="text-blue-600 font-medium"
                          >
                            Promote to Admin
                          </DropdownMenuItem>
                        )}
                        {isSuperAdmin && (
                          <DropdownMenuItem 
                            onClick={() => {
                              suspendEmployee(emp.id)
                              toast.success("Account suspended")
                            }}
                            disabled={emp.status === "Suspended"}
                            className="text-amber-500 font-medium"
                          >
                            Suspend Access
                          </DropdownMenuItem>
                        )}
                        {isSuperAdmin && (
                          <DropdownMenuItem 
                            onClick={() => {
                              setEmpToDelete(emp.id)
                              setDeleteOpen(true)
                            }}
                            className="text-destructive font-medium"
                          >
                            Remove Employee
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-border/50">
                    <span className="text-muted-foreground font-mono">{emp.employeeId}</span>
                    <Badge 
                      variant="outline" 
                      className={
                        emp.status === "Active"
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 text-[10px]"
                          : "bg-destructive/10 text-destructive border-destructive/30 text-[10px]"
                      }
                    >
                      {emp.status === "Active" ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <ShieldAlert className="mr-1 h-3 w-3" />}
                      {emp.status}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                      <span className="truncate">{emp.email}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                      <span className="truncate">{dept?.name || "XR Division"}</span>
                    </div>
                  </div>
                </CardContent>

                <div className="p-3 pt-0 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => router.push(`/app/employees/${emp.id}`)}
                    className="w-full text-xs h-8 border-border/70 hover:border-blue-500/40 hover:bg-blue-500/5"
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Table Mode View */}
      {!isLoadingData && viewMode === "table" && (
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="font-semibold">Employee</TableHead>
                <TableHead className="font-semibold">Employee ID</TableHead>
                <TableHead className="font-semibold">Department</TableHead>
                <TableHead className="font-semibold">Position</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => {
                const dept = departments.find(d => d.id === getId(employee.departmentId))
                const fName = employee.firstName || "Unnamed"
                const lName = employee.lastName || (employee.firstName ? "" : "Employee")
                const initials = `${fName.charAt(0)}${lName.charAt(0)}`.toUpperCase()

                return (
                  <TableRow key={employee.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={employee.avatarUrl} alt={employee.firstName} />
                          <AvatarFallback className="text-xs bg-blue-500/10 text-blue-500 font-bold">{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm leading-tight hover:text-blue-500 cursor-pointer" onClick={() => router.push(`/app/employees/${employee.id}`)}>
                            {fName} {lName}
                          </p>
                          <p className="text-xs text-muted-foreground">{employee.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{employee.employeeId}</TableCell>
                    <TableCell className="text-sm">{dept?.name || "XR Division"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{employee.position || "Specialist"}</TableCell>
                    <TableCell>
                      {employee.status === "Active" ? (
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 text-xs">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/30 text-xs">
                          {employee.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isSuperAdmin && (
                        <Button variant="ghost" size="sm" onClick={() => { setEmpToEdit(employee); setEditOpen(true); }} className="text-xs h-8 mr-1">
                          Edit
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/app/employees/${employee.id}`)} className="text-xs h-8">
                        View
                      </Button>
                      {isSuperAdmin && (
                        <Button variant="ghost" size="sm" onClick={() => { setEmpToDelete(employee.id); setDeleteOpen(true); }} className="text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10 ml-1">
                          Delete
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {!isLoadingData && filteredEmployees.length === 0 && (
        <div className="text-center py-12 rounded-xl border border-dashed border-border p-6 space-y-2">
          <p className="text-muted-foreground font-medium text-sm">No employees match your search filter.</p>
          <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setSelectedDept("all"); setStatusFilter("all"); }}>
            Clear Filters
          </Button>
        </div>
      )}

      <EditEmployeeModal
        employee={empToEdit}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Remove Employee"
        description="Are you sure you want to permanently remove this employee? This action cannot be undone."
        onConfirm={async () => {
          if (empToDelete) {
            await deleteEmployee(empToDelete)
            toast.success("Employee removed from directory")
          }
        }}
      />
    </div>
  )
}
