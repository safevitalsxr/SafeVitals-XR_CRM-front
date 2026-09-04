"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/Dialog"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { useAppStore } from "@/stores/appStore"
import { toast } from "sonner"
import { Position } from "@/types"

interface EditPositionDialogProps {
  position: Position | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditPositionDialog({ position, open, onOpenChange }: EditPositionDialogProps) {
  // Using updateTeam as placeholder or we should add updatePosition
  // Since updatePosition is not in appStore, let's mock it for now.
  const [name, setName] = React.useState("")
  const [level, setLevel] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (position && open) {
      setName(position.name)
      setLevel(position.level || "Mid-Level")
      setDescription(position.description || "")
    }
  }, [position, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !position) return

    setIsSubmitting(true)
    try {
      // Mocking update position as it's not in Phase 1 strict requirement but good to have
      toast.info("Update position API call goes here.")
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!position) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Position</DialogTitle>
            <DialogDescription>
              Modify position title and level.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-pos-name">Position Name</Label>
              <Input
                id="edit-pos-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-pos-level">Level</Label>
              <select
                id="edit-pos-level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Entry-Level">Entry-Level</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
                <option value="Manager">Manager</option>
                <option value="Director">Director</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-pos-desc">Description</Label>
              <Input
                id="edit-pos-desc"
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
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
