"use client"

import * as React from "react"
import { Users2, Building2, Shield } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/Dialog"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { useAppStore } from "@/stores/appStore"
import { toast } from "sonner"
import { Team } from "@/types"

interface CreateTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  departmentId?: string
  onSuccess?: (team: Team) => void
}

export function CreateTeamDialog({ open, onOpenChange, departmentId: initialDeptId, onSuccess }: CreateTeamDialogProps) {
  const [name, setName] = React.useState("")
  const [selectedDeptId, setSelectedDeptId] = React.useState(initialDeptId || "")
  const [selectedLeadId, setSelectedLeadId] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const { departments, employees, addTeam } = useAppStore()

  React.useEffect(() => {
    if (initialDeptId) {
      setSelectedDeptId(initialDeptId)
    }
  }, [initialDeptId, open])

  // Reset state on close
  React.useEffect(() => {
    if (!open) {
      setName("")
      setSelectedDeptId(initialDeptId || "")
      setSelectedLeadId("")
    }
  }, [open, initialDeptId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !selectedDeptId) return

    setIsSubmitting(true)
    try {
      const success = await addTeam({
        name,
        departmentId: selectedDeptId,
        leadId: selectedLeadId || undefined
      })
      if (success) {
        // Find newly created team logic isn't strictly needed for the dialog unless we need the exact ID, 
        // but addTeam re-fetches everything. We'll just call onSuccess loosely.
        if (onSuccess) onSuccess({ id: "new", name, departmentId: selectedDeptId } as Team)
        onOpenChange(false)
      }
    } catch (error) {
      // Error handled in store
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] bg-zinc-950 border-zinc-800">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl flex items-center gap-2">
              <Users2 className="h-5 w-5 text-blue-500" />
              Setup New Team
            </DialogTitle>
            <DialogDescription>
              Create a cross-functional squad or dedicated team and assign a lead.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5 py-2">
            {!initialDeptId && (
              <div className="space-y-2">
                <Label htmlFor="team-dept" className="flex items-center gap-2 text-zinc-300">
                  <Building2 className="h-4 w-4 text-blue-500" />
                  Parent Department
                </Label>
                <select
                  id="team-dept"
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                >
                  <option value="" disabled>Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="team-name" className="text-zinc-300">Team Name</Label>
              <Input
                id="team-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Backend Platform"
                required
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-lead" className="flex items-center gap-2 text-zinc-300">
                <Shield className="h-4 w-4 text-blue-500" />
                Assign Team Lead <span className="text-zinc-500 font-normal text-xs">(Optional)</span>
              </Label>
              <select
                id="team-lead"
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
              >
                <option value="">No Lead Assigned</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter className="mt-6 border-t border-zinc-800 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="border-zinc-800 hover:bg-zinc-800">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim() || !selectedDeptId} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isSubmitting ? "Setting up..." : "Create Team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
