import * as React from "react"
import { useAppStore } from "@/stores/appStore"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog"
import { Button } from "@/components/ui/Button"

interface ApproveRegistrationModalProps {
  user: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ApproveRegistrationModal({ user, open, onOpenChange }: ApproveRegistrationModalProps) {
  const { departments, teams, roles, positions, approveRegistration } = useAppStore()

  const [departmentId, setDepartmentId] = React.useState("")
  const [teamId, setTeamId] = React.useState("")
  const [positionId, setPositionId] = React.useState("")
  const [roleId, setRoleId] = React.useState("")
  
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Reset state when modal opens
  React.useEffect(() => {
    if (open) {
      setDepartmentId("")
      setTeamId("")
      setPositionId("")
      setRoleId("")
    }
  }, [open, user])

  const getId = (val: any) => typeof val === 'object' && val !== null ? (val._id || val.id) : val;

  const filteredTeams = teams.filter(t => !departmentId || getId(t.departmentId) === departmentId)
  const filteredPositions = positions.filter(p => !departmentId || getId(p.departmentId) === departmentId)

  const handleApprove = async () => {
    setIsSubmitting(true)
    const success = await approveRegistration(getId(user), {
      departmentId: departmentId || undefined,
      teamId: teamId || undefined,
      positionId: positionId || undefined,
      roleId: roleId || undefined,
    })
    setIsSubmitting(false)
    if (success) {
      onOpenChange(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="text-xl text-blue-400">Approve Candidate</DialogTitle>
          <p className="text-xs text-zinc-400">Assign role and department for {user.firstName} {user.lastName}.</p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300">Email Address</label>
            <input type="text" value={user.email} disabled className="w-full h-9 rounded-md bg-zinc-900 border border-zinc-800 px-3 text-xs text-zinc-400 cursor-not-allowed" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-300">Department</label>
              <select 
                value={departmentId} 
                onChange={e => { setDepartmentId(e.target.value); setTeamId(""); setPositionId(""); }}
                className="w-full h-9 rounded-md bg-zinc-900 border border-zinc-800 px-3 text-xs focus:ring-blue-500"
              >
                <option value="">Select Department</option>
                {departments.map(d => <option key={getId(d)} value={getId(d)}>{d.name}</option>)}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-300">Security Role</label>
              <select 
                value={roleId} 
                onChange={e => setRoleId(e.target.value)}
                className="w-full h-9 rounded-md bg-zinc-900 border border-zinc-800 px-3 text-xs focus:ring-blue-500"
              >
                <option value="">Select Role</option>
                {roles.map(r => <option key={getId(r)} value={getId(r)}>{r.name}</option>)}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-300">Team</label>
              <select 
                value={teamId} 
                onChange={e => setTeamId(e.target.value)}
                disabled={!departmentId}
                className="w-full h-9 rounded-md bg-zinc-900 border border-zinc-800 px-3 text-xs focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="">Select Team</option>
                {filteredTeams.map(t => <option key={getId(t)} value={getId(t)}>{t.name}</option>)}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-300">Position</label>
              <select 
                value={positionId} 
                onChange={e => setPositionId(e.target.value)}
                disabled={!departmentId}
                className="w-full h-9 rounded-md bg-zinc-900 border border-zinc-800 px-3 text-xs focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="">Select Position</option>
                {filteredPositions.map(p => <option key={getId(p)} value={getId(p)}>{p.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs h-9">
            Cancel
          </Button>
          <Button onClick={handleApprove} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-500 text-white text-xs h-9 px-6 font-medium">
            {isSubmitting ? "Approving..." : "Approve & Activate"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

