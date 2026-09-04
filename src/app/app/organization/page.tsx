"use client"

import * as React from "react"
import { Building2, Users, Plus, LayoutGrid, Sparkles, ChevronRight, UserCheck, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { Skeleton } from "@/components/ui/Skeleton"
import { useAppStore } from "@/stores/appStore"
import { useRouter } from "next/navigation"

export default function OrganizationPage() {
  const router = useRouter()
  const { departments, teams, employees, isLoadingData } = useAppStore()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Company Hierarchy & Structure</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visual breakdown of SafeVitals XR leadership, departments, and cross-functional teams.
          </p>
        </div>
        <Button onClick={() => router.push("/app/departments")} className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
          <Plus className="mr-2 h-4 w-4" /> Manage Departments
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card/70 border-border/80 shadow-xs p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Departments</span>
            <Building2 className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{departments.length}</p>
          <span className="text-[11px] text-muted-foreground">Core business units</span>
        </Card>

        <Card className="bg-card/70 border-border/80 shadow-xs p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Active Teams</span>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{teams.length}</p>
          <span className="text-[11px] text-muted-foreground">Cross-functional squads</span>
        </Card>

        <Card className="bg-card/70 border-border/80 shadow-xs p-4 space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Total Headcount</span>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{employees.length}</p>
          <span className="text-[11px] text-blue-500 font-medium">100% active operational</span>
        </Card>
      </div>

      {/* Departments & Hierarchy Tree */}
      <div className="grid gap-6 md:grid-cols-2">
        {departments.map((dept) => {
          const deptTeams = teams.filter(t => t.departmentId === dept.id)
          const deptEmployees = employees.filter(e => e.departmentId === dept.id)

          return (
            <Card key={dept.id} className="bg-card/70 border-border/80 hover:border-blue-500/40 transition-all shadow-xs flex flex-col justify-between">
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">{dept.name}</CardTitle>
                      <span className="text-xs text-muted-foreground font-mono">{dept.id}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-blue-500 border-blue-500/30 text-xs">
                    {deptEmployees.length} Members
                  </Badge>
                </div>
                <CardDescription className="text-xs mt-2">{dept.description || "Core organizational department."}</CardDescription>
              </CardHeader>

              <CardContent className="pt-4 space-y-3 flex-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Associated Teams ({deptTeams.length})
                </span>

                {deptTeams.length > 0 ? (
                  <div className="grid gap-2">
                    {deptTeams.map(team => {
                      const teamMembers = employees.filter(e => e.teamId === team.id)
                      return (
                        <div key={team.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-blue-500" />
                            <span className="text-xs font-medium">{team.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-muted-foreground">{teamMembers.length} staff</span>
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic py-2">No teams configured yet.</p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
