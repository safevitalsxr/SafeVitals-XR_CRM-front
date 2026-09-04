"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/Dialog"
import { Button } from "@/components/ui/Button"
import { Label } from "@/components/ui/Label"
import { Input } from "@/components/ui/Input"
import { useAppStore } from "@/stores/appStore"
import { toast } from "sonner"
import { Task } from "@/stores/appStore"

interface EditTaskModalProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditTaskModal({ task, open, onOpenChange }: EditTaskModalProps) {
  const { employees, updateTask } = useAppStore()

  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [assignedTo, setAssignedTo] = React.useState("")
  const [priority, setPriority] = React.useState<"Urgent" | "High" | "Medium" | "Low">("Medium")
  const [dueDate, setDueDate] = React.useState("")
  const [isPending, setIsPending] = React.useState(false)

  React.useEffect(() => {
    if (task && open) {
      setTitle(task.title)
      setDescription(task.description)
      setAssignedTo(task.assignedTo)
      setPriority(task.priority || "Medium")
      setDueDate(task.dueDate)
    }
  }, [task, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!task) return
    if (!title.trim()) {
      toast.error("Please provide a task title")
      return
    }

    try {
      setIsPending(true)
      const success = await updateTask(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        assignedTo: assignedTo || undefined,
        priority: priority || undefined,
        dueDate: dueDate || undefined
      })
      
      if (success) {
        onOpenChange(false)
      }
    } finally {
      setIsPending(false)
    }
  }

  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Modify the details of this task.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-1.5">
              <Label htmlFor="edit-task-title" className="text-xs">Task Title *</Label>
              <Input 
                id="edit-task-title"
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                required 
                placeholder="e.g. Calibrate optical sensor latency" 
                className="bg-card"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-task-desc" className="text-xs">Description</Label>
              <Input 
                id="edit-task-desc"
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="Requirements, acceptance criteria, or links..." 
                className="bg-card"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">Assignee</Label>
                <select
                  value={assignedTo}
                  onChange={e => setAssignedTo(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-border bg-card px-3 py-1 text-xs"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Priority</Label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as any)}
                  className="flex h-9 w-full rounded-md border border-border bg-card px-3 py-1 text-xs"
                >
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-task-due" className="text-xs">Due Date</Label>
              <Input 
                id="edit-task-due"
                type="date" 
                value={dueDate} 
                onChange={e => setDueDate(e.target.value)} 
                required 
                className="bg-card"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
