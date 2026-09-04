"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/Dialog"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { positionService } from "@/services/orgService"
import { toast } from "sonner"
import { Position } from "@/types"

interface CreatePositionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  departmentId: string
  onSuccess: (pos: Position) => void
}

export function CreatePositionDialog({ open, onOpenChange, departmentId, onSuccess }: CreatePositionDialogProps) {
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [level, setLevel] = React.useState<Position["level"]>("Mid-Level")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !departmentId) return

    setIsSubmitting(true)
    try {
      const res = await positionService.createPosition(name, departmentId, level, description)
      toast.success("Position created successfully.")
      onSuccess(res.position)
      setName("")
      setDescription("")
      onOpenChange(false)
    } catch (error) {
      toast.error("Failed to create position.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const levels: Position["level"][] = ["Intern", "Junior", "Mid-Level", "Senior", "Lead", "Head", "Custom"]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Position</DialogTitle>
            <DialogDescription>
              Add a new position for the selected department.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="pos-name">Position Name</Label>
              <Input
                id="pos-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Full Stack Developer"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pos-level">Position Level</Label>
              <select 
                id="pos-level"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={level}
                onChange={e => setLevel(e.target.value as any)}
              >
                {levels.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pos-desc">Description</Label>
              <Input
                id="pos-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? "Creating..." : "Create Position"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
