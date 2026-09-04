"use client"

import * as React from "react"
import { 
  LifeBuoy, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Glasses, 
  Wrench, 
  Building, 
  User,
  AlertCircle,
  MessageSquare
} from "lucide-react"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog"
import { Label } from "@/components/ui/Label"
import { Input } from "@/components/ui/Input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { Skeleton } from "@/components/ui/Skeleton"
import { useAuthStore } from "@/stores/authStore"
import { useAppStore } from "@/stores/appStore"
import { toast } from "sonner"

export default function TicketsPage() {
  const { user } = useAuthStore()
  const { tickets, addTicket, resolveTicket, employees, isLoadingData } = useAppStore()
  const userRole = user?.role || user?.roleId || "Employee"
  const isManager = userRole === "Super Admin" || userRole === "Manager" || userRole === "role_1" || userRole === "role_2"
  const currentEmployeeId = user?.id || user?._id || ""

  const [mounted, setMounted] = React.useState(false)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [category, setCategory] = React.useState<"IT Support" | "HR" | "Facilities" | "XR Hardware">("XR Hardware")
  const [priority, setPriority] = React.useState<"Low" | "Medium" | "High" | "Urgent">("High")
  const [filterStatus, setFilterStatus] = React.useState<"all" | "Open" | "Resolved">("all")
  const [searchQuery, setSearchQuery] = React.useState("")

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    const success = await addTicket({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      createdBy: currentEmployeeId
    })
    
    if (success) {
      setIsDialogOpen(false)
      setTitle("")
      setDescription("")
    }
  }

  const handleResolve = async (id: string) => {
    await resolveTicket(id)
  }

  const filteredTickets = tickets.filter(t => {
    const matchesStatus = filterStatus === "all" || t.status === filterStatus
    const matchesSearch = 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesStatus && matchesSearch
  })

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "XR Hardware":
        return <Glasses className="h-3.5 w-3.5 text-blue-500" />
      case "IT Support":
        return <Wrench className="h-3.5 w-3.5 text-blue-500" />
      case "Facilities":
        return <Building className="h-3.5 w-3.5 text-amber-500" />
      default:
        return <User className="h-3.5 w-3.5 text-purple-500" />
    }
  }

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-52" />
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
        <Skeleton className="h-14 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Support & Helpdesk</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Raise requests for XR hardware calibration, IT permissions, or facilities assistance.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
              <Plus className="mr-2 h-4 w-4" /> Raise Support Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Raise Support Ticket</DialogTitle>
                <DialogDescription>Describe the issue and assign priority.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label className="text-xs">Category</Label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value as any)}
                      className="flex h-9 w-full rounded-md border border-border bg-card px-3 py-1 text-xs"
                    >
                      <option value="XR Hardware">XR Hardware</option>
                      <option value="IT Support">IT Support</option>
                      <option value="Facilities">Facilities</option>
                      <option value="HR">HR & Personnel</option>
                    </select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs">Priority</Label>
                    <select
                      value={priority}
                      onChange={e => setPriority(e.target.value as any)}
                      className="flex h-9 w-full rounded-md border border-border bg-card px-3 py-1 text-xs"
                    >
                      <option value="Urgent">Urgent (Blocker)</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label className="text-xs">Issue Summary *</Label>
                  <Input 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    required 
                    placeholder="Brief description of the problem" 
                    className="bg-card"
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label className="text-xs">Detailed Description *</Label>
                  <Input 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    required 
                    placeholder="Steps to reproduce, hardware serial number, or room #..." 
                    className="bg-card"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Submit Ticket</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-card/70 border-border/80 shadow-xs p-4 space-y-1">
          <span className="text-xs text-muted-foreground font-medium">Total Tickets</span>
          <p className="text-xl font-bold text-foreground">{tickets.length}</p>
        </Card>
        <Card className="bg-card/70 border-border/80 shadow-xs p-4 space-y-1">
          <span className="text-xs text-muted-foreground font-medium">Open & Active</span>
          <p className="text-xl font-bold text-amber-500">{tickets.filter(t => t.status === "Open").length}</p>
        </Card>
        <Card className="bg-card/70 border-border/80 shadow-xs p-4 space-y-1">
          <span className="text-xs text-muted-foreground font-medium">Resolved</span>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{tickets.filter(t => t.status === "Resolved").length}</p>
        </Card>
        <Card className="bg-card/70 border-border/80 shadow-xs p-4 space-y-1">
          <span className="text-xs text-muted-foreground font-medium">Avg Resolution</span>
          <p className="text-xl font-bold text-blue-500">2.4 hrs</p>
        </Card>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card/40 p-3 rounded-xl border border-border/70">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets by ID, issue, or department..."
            className="pl-9 bg-background/80 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${filterStatus === "all" ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground"}`}
          >
            All ({tickets.length})
          </button>
          <button
            onClick={() => setFilterStatus("Open")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${filterStatus === "Open" ? "bg-background text-amber-500 shadow-xs font-semibold" : "text-muted-foreground"}`}
          >
            Open ({tickets.filter(t => t.status === "Open").length})
          </button>
          <button
            onClick={() => setFilterStatus("Resolved")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${filterStatus === "Resolved" ? "bg-background text-blue-500 shadow-xs font-semibold" : "text-muted-foreground"}`}
          >
            Resolved ({tickets.filter(t => t.status === "Resolved").length})
          </button>
        </div>
      </div>

      {/* Tickets Table */}
      <Card className="bg-card shadow-xs">
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="font-semibold text-xs">Ticket ID</TableHead>
                  <TableHead className="font-semibold text-xs">Category</TableHead>
                  <TableHead className="font-semibold text-xs">Issue Description</TableHead>
                  <TableHead className="font-semibold text-xs">Reported By</TableHead>
                  <TableHead className="font-semibold text-xs">Priority</TableHead>
                  <TableHead className="font-semibold text-xs">Status</TableHead>
                  <TableHead className="text-right font-semibold text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map(ticket => {
                  const creator = employees.find(e => e.id === ticket.createdBy)
                  return (
                    <TableRow key={ticket.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-xs font-semibold text-muted-foreground">
                        {ticket.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          {getCategoryIcon(ticket.category)}
                          <span>{ticket.category}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-sm leading-tight text-foreground">{ticket.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1 max-w-[280px] mt-0.5">{ticket.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={creator?.avatarUrl} />
                            <AvatarFallback className="text-[9px] bg-blue-500/10 text-blue-500">
                              {creator?.firstName?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs">{creator ? `${creator.firstName} ${creator.lastName}` : "Employee"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] ${ticket.priority === "Urgent" ? "text-red-500 border-red-500/30" : ticket.priority === "High" ? "text-amber-500 border-amber-500/30" : "text-muted-foreground"}`}
                        >
                          {ticket.priority || "Normal"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {ticket.status === "Open" ? (
                          <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10 text-xs">
                            <Clock className="w-3 h-3 mr-1" /> Open
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-blue-500 border-blue-500/30 bg-blue-500/10 text-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Resolved
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {ticket.status === "Open" ? (
                          <Button 
                            size="sm" 
                            onClick={() => handleResolve(ticket.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-7 px-2.5"
                          >
                            Mark Resolved
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground font-mono">Closed</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredTickets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground text-xs">
                      No support tickets found matching your filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
