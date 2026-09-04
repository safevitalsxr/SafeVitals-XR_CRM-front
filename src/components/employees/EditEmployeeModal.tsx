"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/Dialog"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { useAppStore } from "@/stores/appStore"
import { toast } from "sonner"
import { Employee } from "@/types"

interface EditEmployeeModalProps {
  employee: Employee | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditEmployeeModal({ employee, open, onOpenChange }: EditEmployeeModalProps) {
  const { updateEmployee, departments, roles, positions } = useAppStore()

  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [position, setPosition] = React.useState("")
  const [departmentId, setDepartmentId] = React.useState("")
  const [roleId, setRoleId] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (employee && open) {
      setFirstName(employee.firstName || "")
      setLastName(employee.lastName || "")
      setPosition(employee.position || "")
      setDepartmentId(employee.departmentId || "")
      setRoleId(employee.roleId || "")
    }
  }, [employee, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!employee || !firstName.trim() || !lastName.trim()) {
      toast.error("First name and last name are required.")
      return
    }

    setIsSubmitting(true)
    try {
      const success = await updateEmployee(employee.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        position: position.trim(),
        departmentId,
        roleId,
      })
      if (success) {
        onOpenChange(false)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!employee) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update information and directory placement.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-emp-first">First Name</Label>
                <Input
                  id="edit-emp-first"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-emp-last">Last Name</Label>
                <Input
                  id="edit-emp-last"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-emp-dept">Department</Label>
              <select
                id="edit-emp-dept"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Unassigned</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-emp-pos">Position</Label>
              <Input
                id="edit-emp-pos"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g. Senior XR Engineer"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-emp-role">Access Role</Label>
              <select
                id="edit-emp-role"
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Standard Access</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
