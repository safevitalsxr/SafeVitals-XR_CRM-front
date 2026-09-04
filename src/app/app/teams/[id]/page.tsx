"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Users2, Building2, Shield, Search, MoreHorizontal, User } from "lucide-react"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { Input } from "@/components/ui/Input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/DropdownMenu"
import { useAuthStore } from "@/stores/authStore"
import { useAppStore } from "@/stores/appStore"

export default function TeamDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const { teams, departments, employees, isLoadingData } = useAppStore()
  
  const [searchQuery, setSearchQuery] = React.useState("")
  const [mounted, setMounted] = React.useState(false)

  const teamId = params.id as string

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const userRole = user?.role || user?.roleId || "Employee"
  const isSuperAdmin = userRole === "Super Admin" || userRole === "role_1" || (user as any)?.isSuperAdmin

  const team = teams.find(t => t.id === teamId || (t as any)._id === teamId)
  const department = departments.find(d => d.id === team?.departmentId)
  const teamMembers = employees.filter(e => e.teamId === teamId || (e.teamId as any)?._id === teamId)
  
  const filteredMembers = teamMembers.filter(emp => {
    const searchLow = searchQuery.toLowerCase()
    return (emp.firstName?.toLowerCase() || "").includes(searchLow) ||
           (emp.lastName?.toLowerCase() || "").includes(searchLow) ||
           (emp.email?.toLowerCase() || "").includes(searchLow)
  })

  const teamLead = teamMembers.find(m => m.id === team?.leadId)

  if (!mounted || isLoadingData) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold">Team Not Found</h2>
        <p className="text-sm text-muted-foreground">The requested team does not exist.</p>
        <Button variant="outline" onClick={() => router.push("/app/teams")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Teams
        </Button>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push("/app/teams")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Teams
        </Button>
      </div>

      {/* Team Info Header */}
      <Card className="bg-zinc-950 border-zinc-800 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-blue-500 border-blue-500/20 bg-blue-500/10">
                  <Building2 className="w-3 h-3 mr-1" />
                  {department?.name || "Unassigned Department"}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">{team.name}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Users2 className="w-4 h-4" />
                  <span>{teamMembers.length} Members</span>
                </div>
                {teamLead && (
                  <div className="flex items-center gap-1.5 text-foreground">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <span>Lead: {teamLead.firstName} {teamLead.lastName}</span>
                  </div>
                )}
              </div>
            </div>
            
            {isSuperAdmin && (
              <Button onClick={() => router.push(`/app/employees?team=${team.id}`)} variant="outline" className="shrink-0 bg-zinc-900">
                Manage Members
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Team Members</h2>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search members..." 
              className="pl-9 bg-zinc-900 border-zinc-800"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredMembers.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground border border-dashed border-zinc-800 rounded-lg">
            <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No members found in this team.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMembers.map(emp => {
              const initials = `${emp.firstName?.charAt(0) || ""}${emp.lastName?.charAt(0) || ""}`
              const isLead = team.leadId === emp.id

              return (
                <Card key={emp.id} className="bg-zinc-950 border-zinc-800 flex flex-col hover:border-blue-500/30 transition-colors cursor-pointer group" onClick={() => router.push(`/app/employees/${emp.id}`)}>
                  <CardHeader className="p-4 pb-0 flex flex-row items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-zinc-800">
                        <AvatarImage src={emp.avatarUrl} alt={emp.firstName} />
                        <AvatarFallback className="bg-zinc-800 text-xs font-medium">{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-sm font-semibold group-hover:text-blue-500 transition-colors">
                          {emp.firstName} {emp.lastName}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">{emp.position || "Member"}</p>
                      </div>
                    </div>
                    {isLead && (
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[10px] px-1.5 py-0">
                        Lead
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="p-4 pt-3 flex items-center justify-between mt-auto border-t border-zinc-800/50 mt-3">
                    <span className="text-xs text-muted-foreground font-mono">{emp.employeeId || emp.email}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/app/employees/${emp.id}`); }}>
                          View Profile
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
