"use client"

import * as React from "react"
import { Users2, Plus, Building2, User, Search, Edit2, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Input } from "@/components/ui/Input"
import { useAuthStore } from "@/stores/authStore"
import { useAppStore } from "@/stores/appStore"
import { toast } from "sonner"
import { CreateTeamDialog } from "@/components/employees/CreateTeamDialog"
import { EditTeamDialog } from "@/components/employees/EditTeamDialog"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { useRouter } from "next/navigation"

export default function TeamsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const userRole = user?.role || user?.roleId || "Employee"
  const isSuperAdmin = userRole === "Super Admin" || userRole === "role_1" || (user as any)?.isSuperAdmin
  
  const { teams, departments, employees, deleteTeam } = useAppStore()
  
  const getId = (val: any) => typeof val === 'object' && val !== null ? (val._id || val.id) : val;

  const [searchQuery, setSearchQuery] = React.useState("")
  const [createOpen, setCreateOpen] = React.useState(false)

  const [teamToEdit, setTeamToEdit] = React.useState<any>(null)
  const [editOpen, setEditOpen] = React.useState(false)

  const [teamToDelete, setTeamToDelete] = React.useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  // Enrich teams with department info and member counts
  const enrichedTeams = teams.map(team => {
    const department = departments.find(d => d.id === getId(team.departmentId))
    const members = employees.filter(e => e.teamId === team.id || (e.teamId as any)?._id === team.id || (e.teamId as any)?.id === team.id || String(e.teamId) === String(team.id) || String((e.teamId as any)?._id) === String(team.id))
    return {
      ...team,
      departmentName: department?.name || "Unknown Department",
      memberCount: members.length,
      members: members
    }
  })

  const filteredTeams = enrichedTeams.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    team.departmentName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDeleteTeam = (id: string) => {
    setTeamToDelete(id)
    setDeleteOpen(true)
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between space-y-2 mb-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Teams</h2>
          <p className="text-muted-foreground text-sm mt-1">Manage cross-functional and departmental teams.</p>
        </div>
        {isSuperAdmin && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Team
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search teams or departments..." 
            className="pl-9 bg-zinc-900 border-zinc-800"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTeams.map(team => (
          <Card 
            key={team.id} 
            className="bg-zinc-950 border-zinc-800 flex flex-col cursor-pointer hover:border-blue-500/40 transition-colors group"
            onClick={() => router.push(`/app/teams/${team.id}`)}
          >
            <CardHeader className="pb-4 border-b border-zinc-800 group-hover:border-blue-500/20 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl mb-1 group-hover:text-blue-500 transition-colors">{team.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1.5 font-medium text-primary/80">
                    <Building2 className="w-3.5 h-3.5" />
                    {team.departmentName}
                  </CardDescription>
                </div>
                {isSuperAdmin && (
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-zinc-800 text-muted-foreground hover:text-zinc-100" onClick={() => { setTeamToEdit(team); setEditOpen(true); }}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/20 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteTeam(team.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <Users2 className="w-4 h-4" />
                  {team.memberCount} Members
                </span>
                {team.leadId ? (
                   <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Lead Assigned</Badge>
                ) : (
                   <Badge variant="secondary" className="bg-zinc-800 text-zinc-400">No Lead</Badge>
                )}
              </div>
              
              {/* Member preview avatars */}
              <div className="flex -space-x-2 mt-auto">
                {team.members.slice(0, 5).map((member, i) => (
                  <div key={member.id} className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-950 flex items-center justify-center text-[10px] font-bold text-zinc-300" title={`${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Unknown'}>
                    {member.firstName?.charAt(0) || ''}{member.lastName?.charAt(0) || ''}
                  </div>
                ))}
                {team.memberCount > 5 && (
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-950 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                    +{team.memberCount - 5}
                  </div>
                )}
                {team.memberCount === 0 && (
                  <p className="text-xs text-muted-foreground italic">No members assigned yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredTeams.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground border border-dashed border-zinc-800 rounded-lg">
            <Users2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No teams found matching your search.</p>
          </div>
        )}
      </div>

      <CreateTeamDialog 
        open={createOpen} 
        onOpenChange={setCreateOpen} 
        onSuccess={() => toast.success("Team created successfully.")} 
      />

      <EditTeamDialog 
        team={teamToEdit} 
        open={editOpen} 
        onOpenChange={setEditOpen} 
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Team"
        description="Are you sure you want to permanently delete this team?"
        onConfirm={async () => {
          if (teamToDelete) {
            await deleteTeam(teamToDelete)
          }
        }}
      />
    </div>
  )
}
