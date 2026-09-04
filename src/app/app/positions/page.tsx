"use client"

import * as React from "react"
import { Briefcase, Plus, Building2, Search, Edit2, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Input } from "@/components/ui/Input"
import { useAuthStore } from "@/stores/authStore"
import { useAppStore } from "@/stores/appStore"
import { toast } from "sonner"
import { CreatePositionDialog } from "@/components/employees/CreatePositionDialog"
import { EditPositionDialog } from "@/components/employees/EditPositionDialog"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { useRouter } from "next/navigation"

export default function PositionsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const userRole = user?.role || user?.roleId || "Employee"
  const isSuperAdmin = userRole === "Super Admin" || userRole === "role_1" || (user as any)?.isSuperAdmin
  
  const { positions, departments, employees, deletePosition } = useAppStore()
  
  const [searchQuery, setSearchQuery] = React.useState("")
  const [createOpen, setCreateOpen] = React.useState(false)

  const [posToEdit, setPosToEdit] = React.useState<any>(null)
  const [editOpen, setEditOpen] = React.useState(false)

  const [posToDelete, setPosToDelete] = React.useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  // Enrich positions with department info and employee counts
  const enrichedPositions = positions.map(pos => {
    const department = departments.find(d => d.id === pos.departmentId)
    const activeEmployees = employees.filter(e => e.positionId === pos.id)
    return {
      ...pos,
      departmentName: department?.name || "Unknown Department",
      employeeCount: activeEmployees.length
    }
  })

  const filteredPositions = enrichedPositions.filter(pos => 
    pos.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    pos.departmentName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDeletePosition = (id: string) => {
    setPosToDelete(id)
    setDeleteOpen(true)
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between space-y-2 mb-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Positions</h2>
          <p className="text-muted-foreground text-sm mt-1">Manage job titles and roles across the organization.</p>
        </div>
        {isSuperAdmin && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Position
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search positions or departments..." 
            className="pl-9 bg-zinc-900 border-zinc-800"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPositions.map(pos => (
          <Card 
            key={pos.id} 
            className="bg-zinc-950 border-zinc-800 flex flex-col hover:border-blue-500/40 transition-colors group"
          >
            <CardHeader className="pb-4 border-b border-zinc-800 group-hover:border-blue-500/20 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl mb-1 group-hover:text-blue-500 transition-colors">{pos.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1.5 font-medium text-primary/80">
                    <Building2 className="w-3.5 h-3.5" />
                    {pos.departmentName}
                  </CardDescription>
                </div>
                {isSuperAdmin && (
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-zinc-800 text-muted-foreground hover:text-zinc-100" onClick={() => { setPosToEdit(pos); setEditOpen(true); }}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/20 text-muted-foreground hover:text-destructive" onClick={() => handleDeletePosition(pos.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" />
                  {pos.employeeCount} Employees
                </span>
                <Badge variant="outline" className="text-xs">{pos.level || "Standard"}</Badge>
              </div>
              
              <div className="mt-2 text-sm text-muted-foreground">
                {pos.description ? (
                  <span className="line-clamp-2">{pos.description}</span>
                ) : (
                  <span className="italic opacity-50">No description provided.</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredPositions.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground border border-dashed border-zinc-800 rounded-lg">
            <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No positions found matching your search.</p>
          </div>
        )}
      </div>

      <CreatePositionDialog 
        open={createOpen} 
        onOpenChange={setCreateOpen} 
        departmentId=""
        onSuccess={() => toast.success("Position created successfully.")} 
      />

      {posToEdit && (
        <EditPositionDialog 
          position={posToEdit} 
          open={editOpen} 
          onOpenChange={setEditOpen} 
        />
      )}

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Position"
        description="Are you sure you want to permanently delete this position?"
        onConfirm={async () => {
          if (posToDelete && deletePosition) {
            await deletePosition(posToDelete)
            setDeleteOpen(false)
          } else {
            toast.error("deletePosition is not implemented in appStore yet!")
          }
        }}
      />
    </div>
  )
}
