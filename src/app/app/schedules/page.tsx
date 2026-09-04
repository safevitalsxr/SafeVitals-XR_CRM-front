"use client"

import * as React from "react"
import { Calendar, Plus, Clock, Users } from "lucide-react"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog"
import { Label } from "@/components/ui/Label"
import { Input } from "@/components/ui/Input"
import { useAuthStore } from "@/stores/authStore"
import { useAppStore } from "@/stores/appStore"
import { toast } from "sonner"

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export default function SchedulesPage() {
  const { user } = useAuthStore()
  const userRole = user?.role || user?.roleId || "Employee"
  const isManager = userRole === "Super Admin" || userRole === "role_1" || userRole === "role_2" || (user as any)?.isSuperAdmin
  
  const { schedules, addSchedule, employees } = useAppStore()

  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [shiftStart, setShiftStart] = React.useState("09:00")
  const [shiftEnd, setShiftEnd] = React.useState("17:00")
  const [selectedDays, setSelectedDays] = React.useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri"])

  const handleToggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || selectedDays.length === 0) {
      toast.error("Please provide a name and select at least one day")
      return
    }

    const dayMap: Record<string, string> = {
      "Mon": "Monday", "Tue": "Tuesday", "Wed": "Wednesday", "Thu": "Thursday", "Fri": "Friday", "Sat": "Saturday", "Sun": "Sunday"
    }

    const success = await addSchedule({
      name: name.trim(),
      startTime: shiftStart,
      endTime: shiftEnd,
      workDays: selectedDays.map(d => dayMap[d] || d)
    })
    
    if (success) {
      setIsDialogOpen(false)
      setName("")
      setShiftStart("09:00")
      setShiftEnd("17:00")
      setSelectedDays(["Mon", "Tue", "Wed", "Thu", "Fri"])
    }
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between space-y-2 mb-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Work Schedules</h2>
          <p className="text-muted-foreground mt-1">Manage shift timings and employee assignments.</p>
        </div>
        {isManager && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create Schedule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Create Work Schedule</DialogTitle>
                  <DialogDescription>Define standard shift timings for employees.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Schedule Name</Label>
                    <Input 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      placeholder="e.g. Night Shift" 
                      required 
                      className="bg-zinc-900 border-zinc-800" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Shift Start</Label>
                      <Input 
                        type="time" 
                        value={shiftStart} 
                        onChange={e => setShiftStart(e.target.value)} 
                        required 
                        className="bg-zinc-900 border-zinc-800" 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Shift End</Label>
                      <Input 
                        type="time" 
                        value={shiftEnd} 
                        onChange={e => setShiftEnd(e.target.value)} 
                        required 
                        className="bg-zinc-900 border-zinc-800" 
                      />
                    </div>
                  </div>
                  <div className="grid gap-2 mt-2">
                    <Label className="mb-2">Working Days</Label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS_OF_WEEK.map(day => (
                        <div key={day} className="flex items-center space-x-2 border border-zinc-800 bg-zinc-900/50 rounded-md px-3 py-2">
                          <input 
                            type="checkbox"
                            id={`day-${day}`} 
                            checked={selectedDays.includes(day)}
                            onChange={() => handleToggleDay(day)}
                            className="w-4 h-4 rounded border-zinc-800 bg-zinc-900 text-blue-500 focus:ring-blue-500"
                          />
                          <label
                            htmlFor={`day-${day}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {day}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Create Schedule</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {schedules.map(sch => {
          const assignedCount = employees.filter(e => e.workScheduleId === sch.id).length
          
          return (
            <Card key={sch.id} className="bg-zinc-950 border-zinc-800">
              <CardHeader className="pb-4 border-b border-zinc-800">
                <CardTitle className="text-xl flex items-center justify-between">
                  {sch.name}
                  <Badge variant="secondary" className="font-mono text-xs">{sch.id}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center justify-center w-8 h-8 rounded bg-primary/10 text-primary">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium">{sch.shiftStart} - {sch.shiftEnd}</p>
                    <p className="text-muted-foreground text-xs">Standard Shift Timing</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center justify-center w-8 h-8 rounded bg-blue-500/10 text-blue-500">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex gap-1 flex-wrap">
                      {DAYS_OF_WEEK.map(d => {
                        const isIncluded = (sch.days && sch.days.includes(d)) || 
                                           (sch.workDays && (sch.workDays as any[]).some(wd => typeof wd === 'string' && wd.startsWith(d)))
                        return (
                          <span key={d} className={`text-xs ${isIncluded ? 'font-bold text-foreground' : 'text-muted-foreground/30 line-through'}`}>
                            {d}
                          </span>
                        )
                      })}
                    </div>
                    <p className="text-muted-foreground text-xs">Active Days</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    {assignedCount} Employees assigned
                  </div>
                  {isManager && <Button variant="outline" size="sm">Manage</Button>}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
