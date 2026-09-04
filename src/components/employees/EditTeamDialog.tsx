"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/Dialog"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { useAppStore } from "@/stores/appStore"
import { toast } from "sonner"
import { Team } from "@/types"

interface EditTeamDialogProps {
  team: Team | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditTeamDialog({ team, open, onOpenChange }: EditTeamDialogProps) {
  const { updateTeam, employees } = useAppStore()
  
  const [name, setName] = React.useState("")
  const [leadId, setLeadId] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (team && open) {
      setName(team.name)
      setLeadId(team.leadId || "")
    }
  }, [team, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !team) return

    setIsSubmitting(true)
    try {
      const success = await updateTeam(team.id, { 
        name, 
        leadId: leadId || undefined 
      })
      if (success) {
        onOpenChange(false)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!team) return null

  // Filter employees that belong to this team's department
  const deptEmployees = employees.filter(emp => emp.departmentId === team.departmentId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>
              Modify team details and assignments.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-team-name">Team Name</Label>
              <Input
                id="edit-team-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Frontend Team"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-team-lead">Team Lead (Optional)</Label>
              <select
                id="edit-team-lead"
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">No Team Lead Assigned</option>
                {deptEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
