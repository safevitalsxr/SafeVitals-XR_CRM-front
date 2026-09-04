"use client"

import * as React from "react"
import { Building2, Plus, Users, Briefcase, Users2, LayoutTemplate, MoreHorizontal, Edit2, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Input } from "@/components/ui/Input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/DropdownMenu"
import { useAuthStore } from "@/stores/authStore"
import { useAppStore } from "@/stores/appStore"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { CreateDepartmentDialog } from "@/components/employees/CreateDepartmentDialog"
import { CreateTeamDialog } from "@/components/employees/CreateTeamDialog"
import { CreatePositionDialog } from "@/components/employees/CreatePositionDialog"
import { EditDepartmentDialog } from "@/components/employees/EditDepartmentDialog"
import { EditTeamDialog } from "@/components/employees/EditTeamDialog"
import { EditPositionDialog } from "@/components/employees/EditPositionDialog"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"

export default function DepartmentsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const userRole = user?.role || user?.roleId || "Employee"
  const isSuperAdmin = userRole === "Super Admin" || userRole === "role_1" || (user as any)?.isSuperAdmin

  const { departments, teams, positions, employees, deleteDepartment, deleteTeam } = useAppStore()
  
  const [selectedDeptId, setSelectedDeptId] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")

  // Modals
  const [deptOpen, setDeptOpen] = React.useState(false)
  const [teamOpen, setTeamOpen] = React.useState(false)
  const [posOpen, setPosOpen] = React.useState(false)

  // Edit Modals
  const [deptToEdit, setDeptToEdit] = React.useState<any>(null)
  const [editDeptOpen, setEditDeptOpen] = React.useState(false)
  
  const [teamToEdit, setTeamToEdit] = React.useState<any>(null)
  const [editTeamOpen, setEditTeamOpen] = React.useState(false)

  const [posToEdit, setPosToEdit] = React.useState<any>(null)
  const [editPosOpen, setEditPosOpen] = React.useState(false)

  // Delete Modals
  const [deptToDelete, setDeptToDelete] = React.useState<string | null>(null)
  const [deleteDeptOpen, setDeleteDeptOpen] = React.useState(false)

  const [teamToDelete, setTeamToDelete] = React.useState<string | null>(null)
  const [deleteTeamOpen, setDeleteTeamOpen] = React.useState(false)

  const [posToDelete, setPosToDelete] = React.useState<string | null>(null)
  const [deletePosOpen, setDeletePosOpen] = React.useState(false)

  const getId = (val: any) => typeof val === 'object' && val !== null ? (val._id || val.id) : val;

  React.useEffect(() => {
    if (departments.length > 0 && !selectedDeptId) {
      setSelectedDeptId(departments[0].id)
    }
  }, [departments, selectedDeptId])

  const selectedDept = departments.find(d => d.id === selectedDeptId)
  const deptTeams = teams.filter(t => getId(t.departmentId) === selectedDeptId)
  const deptPositions = positions.filter(p => getId(p.departmentId) === selectedDeptId)
  const deptEmployees = employees.filter(e => getId(e.departmentId) === selectedDeptId)

  // Derived Statistics
  const totalDepartments = departments.length
  const totalTeams = teams.length
  const totalPositions = positions.length
  const totalEmployees = employees.length

  const filteredDepartments = departments.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2 mb-2">
        <h2 className="text-3xl font-bold tracking-tight">Departments</h2>
        {isSuperAdmin && (
          <Button onClick={() => setDeptOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Department
          </Button>
        )}
      </div>

      {/* Dynamic Statistics */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDepartments}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-blue-500/50 transition-colors group" onClick={() => router.push("/app/teams")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 group-hover:text-blue-500 transition-colors">
            <CardTitle className="text-sm font-medium">Teams</CardTitle>
            <Users2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTeams}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-blue-500/50 transition-colors group" onClick={() => router.push("/app/positions")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 group-hover:text-blue-500 transition-colors">
            <CardTitle className="text-sm font-medium">Positions</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPositions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-280px)]">
        
        {/* LEFT PANE: Departments List */}
        <div className="w-full md:w-1/3 flex flex-col gap-4 border-r pr-6 overflow-y-auto">
          <Input 
            placeholder="Search departments..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-zinc-900 border-zinc-800"
          />
          
          <div className="space-y-2">
            {filteredDepartments.map((dept) => {
              const dTeamsCount = teams.filter(t => getId(t.departmentId) === dept.id).length
              const dEmployeesCount = employees.filter(e => getId(e.departmentId) === dept.id).length
              
              return (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDeptId(dept.id)}
                  className={`w-full flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-all hover:bg-accent hover:text-accent-foreground ${
                    selectedDeptId === dept.id ? "bg-accent/80 border-primary shadow-sm" : "bg-card"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-2 font-medium">
                      <LayoutTemplate className={`h-4 w-4 ${selectedDeptId === dept.id ? 'text-primary' : 'text-muted-foreground'}`} />
                      {dept.name}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-1 w-full">
                    {dept.description || "No description"}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Users2 className="h-3 w-3"/> {dTeamsCount} teams</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3"/> {dEmployeesCount} employees</span>
                  </div>
                </button>
              )
            })}
            {filteredDepartments.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No departments found.</p>}
          </div>
        </div>

        {/* RIGHT PANE: Department Details */}
        <div className="w-full md:w-2/3 flex flex-col gap-6 overflow-y-auto pb-12">
          {selectedDept ? (
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  {selectedDept.name}
                  <Badge variant="outline" className="font-normal border-primary/50 text-primary">Department</Badge>
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  ID: <code className="font-mono bg-muted/30 px-1 py-0.5 rounded">{selectedDept.id}</code>
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {isSuperAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon"><MoreHorizontal className="w-4 h-4"/></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setDeptToEdit(selectedDept); setEditDeptOpen(true); }}><Edit2 className="w-4 h-4 mr-2"/> Edit Department</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:bg-destructive/10" onClick={() => { setDeptToDelete(selectedDept.id); setDeleteDeptOpen(true); }}>
                        <Trash2 className="w-4 h-4 mr-2"/> Delete Department
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Building2 className="h-12 w-12 mb-4 opacity-20" />
              <p>Select a department to view details</p>
            </div>
          )}

          {selectedDept && (
            <Tabs defaultValue="general" className="w-full mt-2">
              <TabsList className="w-full justify-start border-b border-border/50 rounded-none h-auto p-0 bg-transparent space-x-6">
                <TabsTrigger 
                  value="general" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-base"
                >
                  General
                </TabsTrigger>
                <TabsTrigger 
                  value="teams" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-base"
                >
                  Teams <Badge variant="secondary" className="ml-2 bg-zinc-800">{deptTeams.length}</Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="positions" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-base"
                >
                  Positions <Badge variant="secondary" className="ml-2 bg-zinc-800">{deptPositions.length}</Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-base"
                >
                  Employees <Badge variant="secondary" className="ml-2 bg-zinc-800">{deptEmployees.length}</Badge>
                </TabsTrigger>
              </TabsList>
              
              {/* GENERAL TAB */}
              <TabsContent value="general" className="pt-6 space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                  <p className="text-base">{selectedDept.description || "No description provided for this department."}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Department Leadership</h4>
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                          {selectedDept.managerId ? "MG" : "?"}
                        </div>
                        <div>
                          <p className="font-medium">{selectedDept.managerId ? "Manager Assigned" : "No Head of Department"}</p>
                          <p className="text-sm text-muted-foreground">Manager ID: {selectedDept.managerId || "N/A"}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Assign Head</Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* TEAMS TAB */}
              <TabsContent value="teams" className="pt-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium">Department Teams</h4>
                  <Button variant="outline" size="sm" onClick={() => setTeamOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" /> Add Team
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {deptTeams.map(team => (
                    <Card key={team.id} className="bg-zinc-900/50 border-zinc-800 hover:border-primary/50 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center justify-between">
                          <span>{team.name}</span>
                          <div className="flex items-center gap-1">
                            <Users2 className="h-4 w-4 text-muted-foreground" />
                            {isSuperAdmin && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => { setTeamToEdit(team); setEditTeamOpen(true); }}>
                                    <Edit2 className="mr-2 h-3 w-3" /> Edit Team
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => { setTeamToDelete(team.id); setDeleteTeamOpen(true); }} className="text-destructive focus:bg-destructive/10">
                                    <Trash2 className="mr-2 h-3 w-3" /> Delete Team
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </CardTitle>
                        <CardDescription className="text-xs font-mono">{team.id}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="secondary" className="bg-zinc-800">
                            {employees.filter(e => getId(e.teamId) === team.id).length} Members
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {deptTeams.length === 0 && (
                    <div className="col-span-full text-center py-8 text-muted-foreground border border-dashed border-zinc-800 rounded-lg">
                      No teams defined for this department.
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* POSITIONS TAB */}
              <TabsContent value="positions" className="pt-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium">Department Positions</h4>
                  <Button variant="outline" size="sm" onClick={() => setPosOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" /> Add Position
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {deptPositions.map(pos => (
                    <Card key={pos.id} className="bg-zinc-900/50 border-zinc-800 hover:border-primary/50 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center justify-between">
                          <span>{pos.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{pos.level}</Badge>
                            {isSuperAdmin && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => { setPosToEdit(pos); setEditPosOpen(true); }}>
                                    <Edit2 className="mr-2 h-3 w-3" /> Edit Position
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => { setPosToDelete(pos.id); setDeletePosOpen(true); }} className="text-destructive focus:bg-destructive/10">
                                    <Trash2 className="mr-2 h-3 w-3" /> Delete Position
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {pos.description && <p className="text-sm text-muted-foreground line-clamp-2">{pos.description}</p>}
                        {!pos.description && <p className="text-sm text-muted-foreground italic">No description</p>}
                      </CardContent>
                    </Card>
                  ))}
                  {deptPositions.length === 0 && (
                    <div className="col-span-full text-center py-8 text-muted-foreground border border-dashed border-zinc-800 rounded-lg">
                      No positions defined for this department.
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* USERS TAB */}
              <TabsContent value="users" className="pt-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium">Department Employees</h4>
                </div>
                
                <div className="space-y-2">
                  {deptEmployees.map(emp => (
                    <div key={emp.id} className="flex items-center justify-between p-3 border border-zinc-800 bg-zinc-900/30 rounded-lg hover:bg-zinc-900 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                          {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{emp.firstName} {emp.lastName}</p>
                          <p className="text-xs text-muted-foreground">{emp.position}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-zinc-800">{emp.employeeId}</Badge>
                    </div>
                  ))}
                  {deptEmployees.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground border border-dashed border-zinc-800 rounded-lg">
                      No employees currently assigned to this department.
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
      
      <CreateDepartmentDialog open={deptOpen} onOpenChange={setDeptOpen} onSuccess={() => {}} />
      <CreateTeamDialog open={teamOpen} onOpenChange={setTeamOpen} departmentId={selectedDeptId || ""} onSuccess={() => {}} />
      <CreatePositionDialog open={posOpen} onOpenChange={setPosOpen} departmentId={selectedDeptId || ""} onSuccess={() => {}} />

      <EditDepartmentDialog department={deptToEdit} open={editDeptOpen} onOpenChange={setEditDeptOpen} />
      <EditTeamDialog team={teamToEdit} open={editTeamOpen} onOpenChange={setEditTeamOpen} />
      <EditPositionDialog position={posToEdit} open={editPosOpen} onOpenChange={setEditPosOpen} />

      <ConfirmDialog
        open={deleteDeptOpen}
        onOpenChange={setDeleteDeptOpen}
        title="Delete Department"
        description="Are you sure you want to permanently delete this department? This will affect all associated teams and positions."
        onConfirm={async () => {
          if (deptToDelete) {
            await deleteDepartment(deptToDelete)
            if (selectedDeptId === deptToDelete) setSelectedDeptId(null)
          }
        }}
      />
      
      <ConfirmDialog
        open={deleteTeamOpen}
        onOpenChange={setDeleteTeamOpen}
        title="Delete Team"
        description="Are you sure you want to permanently delete this team?"
        onConfirm={async () => {
          if (teamToDelete) {
            await deleteTeam(teamToDelete)
          }
        }}
      />
      
      <ConfirmDialog
        open={deletePosOpen}
        onOpenChange={setDeletePosOpen}
        title="Delete Position"
        description="Are you sure you want to delete this position?"
        onConfirm={() => {
          toast.info("Delete position API call goes here.")
        }}
      />
    </div>
  )
}
