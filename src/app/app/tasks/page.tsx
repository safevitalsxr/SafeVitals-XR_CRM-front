"use client"

import * as React from "react"
import { 
  CheckSquare, 
  Plus, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter, 
  ArrowRight, 
  CheckCircle2, 
  RotateCcw,
  Sparkles,
  Calendar,
  MoreHorizontal,
  Edit2,
  Trash2
} from "lucide-react"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog"
import { Label } from "@/components/ui/Label"
import { Input } from "@/components/ui/Input"
import { Badge } from "@/components/ui/Badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { Skeleton } from "@/components/ui/Skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/DropdownMenu"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { EditTaskModal } from "@/components/tasks/EditTaskModal"
import { useAuthStore } from "@/stores/authStore"
import { useAppStore } from "@/stores/appStore"
import { toast } from "sonner"

export default function TasksPage() {
  const { user } = useAuthStore()
  const { tasks, addTask, updateTaskStatus, deleteTask, employees, isLoadingData } = useAppStore()
  const currentEmployeeId = user?.id || user?._id || ""
  
  const [mounted, setMounted] = React.useState(false)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [assignedTo, setAssignedTo] = React.useState(currentEmployeeId)
  const [priority, setPriority] = React.useState<"Urgent" | "High" | "Medium" | "Low">("Medium")
  const [dueDate, setDueDate] = React.useState(new Date().toISOString().split("T")[0])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filterAssignee, setFilterAssignee] = React.useState<"all" | "mine">("all")

  const [taskToEdit, setTaskToEdit] = React.useState<any>(null)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [taskToDelete, setTaskToDelete] = React.useState<string | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    if (currentEmployeeId && !assignedTo) {
      setAssignedTo(currentEmployeeId)
    }
  }, [currentEmployeeId, assignedTo])

  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error("Please provide a task title")
      return
    }

    setIsSubmitting(true)
    const success = await addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      assignedTo: assignedTo || currentEmployeeId,
      priority,
      dueDate
    })
    setIsSubmitting(false)
    
    if (success) {
      setIsDialogOpen(false)
      setTitle("")
      setDescription("")
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesAssignee = filterAssignee === "all" || task.assignedTo === currentEmployeeId
    return matchesSearch && matchesAssignee
  })

  const todoTasks = filteredTasks.filter(t => t.status === "To Do")
  const inProgressTasks = filteredTasks.filter(t => t.status === "In Progress")
  const doneTasks = filteredTasks.filter(t => t.status === "Done")

  const getPriorityBadge = (p?: string) => {
    switch (p) {
      case "Urgent":
        return <Badge variant="outline" className="text-red-500 border-red-500/30 bg-red-500/10 text-[10px]">Urgent</Badge>
      case "High":
        return <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10 text-[10px]">High</Badge>
      case "Low":
        return <Badge variant="outline" className="text-muted-foreground border-border text-[10px]">Low</Badge>
      default:
        return <Badge variant="outline" className="text-blue-500 border-blue-500/30 bg-blue-500/10 text-[10px]">Medium</Badge>
    }
  }

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-14 rounded-xl" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tasks & Sprints</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track spatial development milestones, haptic tests, and deliverables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
                <Plus className="mr-2 h-4 w-4" /> Create Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <DialogDescription>Add a deliverable to the team sprint board.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="task-title" className="text-xs">Task Title *</Label>
                    <Input 
                      id="task-title"
                      value={title} 
                      onChange={e => setTitle(e.target.value)} 
                      required 
                      placeholder="e.g. Calibrate optical sensor latency" 
                      className="bg-card"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="task-desc" className="text-xs">Description</Label>
                    <Input 
                      id="task-desc"
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
                    <Label htmlFor="task-due" className="text-xs">Due Date</Label>
                    <Input 
                      id="task-due"
                      type="date" 
                      value={dueDate} 
                      onChange={e => setDueDate(e.target.value)} 
                      required 
                      className="bg-card"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Task"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card/40 p-3 rounded-xl border border-border/70">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks by title or keyword..."
            className="pl-9 bg-background/80 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setFilterAssignee("all")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${filterAssignee === "all" ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground"}`}
          >
            All Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setFilterAssignee("mine")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${filterAssignee === "mine" ? "bg-background text-blue-600 dark:text-blue-400 shadow-xs font-semibold" : "text-muted-foreground"}`}
          >
            My Tasks ({tasks.filter(t => t.assignedTo === currentEmployeeId).length})
          </button>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Column 1: TO DO */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-card/60 border border-border/80">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
              <span>To Do</span>
            </div>
            <Badge variant="secondary" className="text-xs font-mono">{todoTasks.length}</Badge>
          </div>

          <div className="space-y-3">
            {todoTasks.map(task => {
              const assignee = employees.find(e => e.id === task.assignedTo)
              return (
                <Card key={task.id} className="bg-card/90 border-border/80 hover:border-blue-500/40 transition-all shadow-xs">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-semibold leading-tight">{task.title}</CardTitle>
                      <div className="flex items-center gap-1">
                        {getPriorityBadge(task.priority)}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-blue-500/10">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setTaskToEdit(task); setIsEditOpen(true); }}>
                              <Edit2 className="mr-2 h-3 w-3" /> Edit Task
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setTaskToDelete(task.id); setIsDeleteOpen(true); }} className="text-destructive focus:bg-destructive/10">
                              <Trash2 className="mr-2 h-3 w-3" /> Delete Task
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-1 text-xs text-muted-foreground space-y-3">
                    <p className="line-clamp-2">{task.description || "No description provided."}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px]">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Due: {task.dueDate}</span>
                      </div>
                      <div className="flex items-center gap-1 font-medium text-foreground">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={assignee?.avatarUrl} />
                          <AvatarFallback className="text-[9px] bg-blue-500/10 text-blue-500">
                            {assignee?.firstName?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span>{assignee?.firstName || "Unassigned"}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-3 pt-0 flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        updateTaskStatus(task.id, "In Progress")
                        toast.info("Task moved to In Progress")
                      }}
                      className="text-xs h-7 hover:border-amber-500 hover:text-amber-500"
                    >
                      Start Task <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
            {todoTasks.length === 0 && (
              <div className="p-8 text-center rounded-xl border border-dashed border-border/80 text-xs text-muted-foreground">
                No tasks to do.
              </div>
            )}
          </div>
        </div>

        {/* Column 2: IN PROGRESS */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-card/60 border border-amber-500/30">
            <div className="flex items-center gap-2 font-semibold text-sm text-amber-500">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span>In Progress</span>
            </div>
            <Badge variant="outline" className="text-xs font-mono text-amber-500 border-amber-500/30">{inProgressTasks.length}</Badge>
          </div>

          <div className="space-y-3">
            {inProgressTasks.map(task => {
              const assignee = employees.find(e => e.id === task.assignedTo)
              return (
                <Card key={task.id} className="bg-card/90 border-amber-500/30 hover:border-amber-500/60 transition-all shadow-xs">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-semibold leading-tight">{task.title}</CardTitle>
                      <div className="flex items-center gap-1">
                        {getPriorityBadge(task.priority)}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-amber-500/10">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setTaskToEdit(task); setIsEditOpen(true); }}>
                              <Edit2 className="mr-2 h-3 w-3" /> Edit Task
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setTaskToDelete(task.id); setIsDeleteOpen(true); }} className="text-destructive focus:bg-destructive/10">
                              <Trash2 className="mr-2 h-3 w-3" /> Delete Task
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-1 text-xs text-muted-foreground space-y-3">
                    <p className="line-clamp-2">{task.description || "No description provided."}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px]">
                      <div className="flex items-center gap-1.5 text-amber-500/80">
                        <Clock className="h-3 w-3" />
                        <span>Due: {task.dueDate}</span>
                      </div>
                      <div className="flex items-center gap-1 font-medium text-foreground">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={assignee?.avatarUrl} />
                          <AvatarFallback className="text-[9px] bg-amber-500/10 text-amber-500">
                            {assignee?.firstName?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span>{assignee?.firstName || "Unassigned"}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-3 pt-0 flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => updateTaskStatus(task.id, "To Do")}
                      className="text-xs h-7 text-muted-foreground"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" /> Revert
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => {
                        updateTaskStatus(task.id, "Done")
                        toast.success("Task marked as completed!")
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-7"
                    >
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Mark Done
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
            {inProgressTasks.length === 0 && (
              <div className="p-8 text-center rounded-xl border border-dashed border-border/80 text-xs text-muted-foreground">
                No active tasks in progress.
              </div>
            )}
          </div>
        </div>

        {/* Column 3: DONE */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-card/60 border border-blue-500/30">
            <div className="flex items-center gap-2 font-semibold text-sm text-blue-500">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              <span>Completed</span>
            </div>
            <Badge variant="outline" className="text-xs font-mono text-blue-500 border-blue-500/30">{doneTasks.length}</Badge>
          </div>

          <div className="space-y-3">
            {doneTasks.map(task => {
              const assignee = employees.find(e => e.id === task.assignedTo)
              return (
                <Card key={task.id} className="bg-card/70 border-blue-500/20 opacity-80 hover:opacity-100 transition-all shadow-xs">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-semibold leading-tight line-through text-muted-foreground">{task.title}</CardTitle>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-blue-500 border-blue-500/30 text-[10px]">Done</Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-blue-500/10">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setTaskToEdit(task); setIsEditOpen(true); }}>
                              <Edit2 className="mr-2 h-3 w-3" /> Edit Task
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setTaskToDelete(task.id); setIsDeleteOpen(true); }} className="text-destructive focus:bg-destructive/10">
                              <Trash2 className="mr-2 h-3 w-3" /> Delete Task
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-1 text-xs text-muted-foreground space-y-2">
                    <p className="line-clamp-1">{task.description || "Completed deliverable."}</p>
                    <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
                      <span className="text-blue-500 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="h-3 w-3" /> Completed
                      </span>
                      <span className="text-muted-foreground">{assignee?.firstName}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-3 pt-0 flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => updateTaskStatus(task.id, "In Progress")}
                      className="text-[11px] h-6 text-muted-foreground hover:text-foreground"
                    >
                      Reopen Task
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
            {doneTasks.length === 0 && (
              <div className="p-8 text-center rounded-xl border border-dashed border-border/80 text-xs text-muted-foreground">
                No completed tasks yet.
              </div>
            )}
          </div>
        </div>
      </div>

      <EditTaskModal 
        task={taskToEdit} 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={async () => {
          if (taskToDelete) {
            await deleteTask(taskToDelete)
          }
        }}
      />
    </div>
  )
}
