"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent } from "@/components/ui/Dialog"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Switch } from "@/components/ui/Switch"
import { CheckCircle2, Eye, EyeOff, Plus, X, Shield, Sparkles, UserPlus, KeyRound, Mail } from "lucide-react"
import { useAppStore } from "@/stores/appStore"
import { employeeService } from "@/services/employeeService"
import { CreateDepartmentDialog } from "./CreateDepartmentDialog"
import { CreatePositionDialog } from "./CreatePositionDialog"
import { CreateTeamDialog } from "./CreateTeamDialog"
import { toast } from "sonner"

interface InviteEmployeeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InviteEmployeeModal({ open, onOpenChange }: InviteEmployeeModalProps) {
  const [onboardMode, setOnboardMode] = React.useState<"standard" | "firebase">("standard")
  const [step, setStep] = React.useState(1)
  const { departments, positions, teams, employees, roles } = useAppStore()

  // Standard Form State
  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [employeeId, setEmployeeId] = React.useState("")
  
  // Firebase UID State
  const [firebaseUid, setFirebaseUid] = React.useState("")

  // Org & Role Assignment
  const [roleId, setRoleId] = React.useState("")
  const [departmentId, setDepartmentId] = React.useState("")
  const [positionId, setPositionId] = React.useState("")
  const [teamId, setTeamId] = React.useState("")
  const [managerId, setManagerId] = React.useState("")

  // Security Credentials
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [sendInvite, setSendInvite] = React.useState(true)

  // Dialogs
  const [deptOpen, setDeptOpen] = React.useState(false)
  const [posOpen, setPosOpen] = React.useState(false)
  const [teamOpen, setTeamOpen] = React.useState(false)

  // Loading state
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Generate ID on open
  React.useEffect(() => {
    if (open && step === 1) {
      // Backend auto-generates sequential ID (EMP-000001)
      setEmployeeId("")
    }
  }, [open, step])

  // Reset form when closed
  React.useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep(1)
        setOnboardMode("standard")
        setFirstName("")
        setLastName("")
        setEmail("")
        setFirebaseUid("")
        setRoleId("")
        setDepartmentId("")
        setPositionId("")
        setTeamId("")
        setManagerId("")
        setPassword("")
        setSendInvite(true)
      }, 300)
    }
  }, [open])

  const handleGeneratePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let pass = ""
    for (let i = 0; i < 12; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length))
    setPassword(pass)
  }

  const getId = (val: any) => typeof val === 'object' && val !== null ? (val._id || val.id) : val;

  const filteredPositions = positions.filter(p => !departmentId || getId(p.departmentId) === departmentId)
  const filteredTeams = teams.filter(t => !departmentId || getId(t.departmentId) === departmentId)
  const defaultEmployeeRole = roles?.find(r => r.name.toLowerCase().includes('employee'))?.id || (roles && roles.length > 0 ? roles[0].id : "")
  const activeRoleId = roleId || defaultEmployeeRole

  const handleSubmitStandard = async () => {
    setIsSubmitting(true)
    try {
      await employeeService.createEmployee({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        departmentId,
        teamId,
        positionId,
        roleId: activeRoleId,
        managerId: managerId || undefined,
        joiningDate: new Date().toISOString().split("T")[0]
      })
      toast.success("Employee created successfully!")
      setStep(4)
    } catch (err: any) {
      toast.error(err.message || "Failed to create employee")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitFirebase = async () => {
    if (!firebaseUid.trim()) {
      toast.error("Please enter a valid Firebase UID")
      return
    }
    if (!departmentId || !positionId || !teamId) {
      toast.error("Please assign Department, Position, and Team")
      return
    }

    setIsSubmitting(true)
    try {
      await employeeService.onboardByFirebaseUid({
        firebaseUid: firebaseUid.trim(),
        departmentId,
        teamId,
        positionId,
        roleId: activeRoleId,
        managerId: managerId || undefined,
        joiningDate: new Date().toISOString().split("T")[0]
      })
      toast.success("Employee onboarded & linked with Firebase UID successfully!")
      setStep(4)
    } catch (err: any) {
      toast.error(err.message || "Failed to onboard with Firebase UID")
    } finally {
      setIsSubmitting(false)
    }
  }

  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 40 : -40, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 40 : -40, opacity: 0 })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[540px] p-0 overflow-hidden bg-zinc-950 border border-zinc-800 text-zinc-100 shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-zinc-800/80 bg-zinc-900/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Onboard Employee</h2>
                  <p className="text-xs text-zinc-400">Provision identity, assign enterprise role & departments</p>
                </div>
              </div>
              <button 
                onClick={() => onOpenChange(false)} 
                className="text-zinc-400 hover:text-zinc-100 rounded-md p-1 hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher */}
            {step === 1 && (
              <div className="grid grid-cols-2 gap-2 mt-4 p-1 bg-zinc-900 rounded-lg border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setOnboardMode("standard")}
                  className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    onboardMode === "standard"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" /> Standard Invite
                </button>
                <button
                  type="button"
                  onClick={() => setOnboardMode("firebase")}
                  className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    onboardMode === "firebase"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" /> Via Firebase UID
                </button>
              </div>
            )}
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait" custom={1}>
              {/* STEP 1: Basic Identity or Firebase UID */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  custom={1}
                  className="space-y-4"
                >
                  {onboardMode === "standard" ? (
                    <>
                      <div className="text-xs font-semibold uppercase tracking-wider text-blue-500 mb-2">
                        1. Personal & Account Details
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label className="text-xs">Employee ID</Label>
                        <Input 
                          disabled
                          placeholder="Auto-generated (e.g. EMP-000001)" 
                          className="bg-zinc-900 border-zinc-800 text-sm h-9 opacity-70 cursor-not-allowed" 
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">First Name *</Label>
                          <Input 
                            value={firstName} 
                            onChange={e => setFirstName(e.target.value)} 
                            placeholder="John" 
                            className="bg-zinc-900 border-zinc-800 text-sm h-9" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Last Name *</Label>
                          <Input 
                            value={lastName} 
                            onChange={e => setLastName(e.target.value)} 
                            placeholder="Doe" 
                            className="bg-zinc-900 border-zinc-800 text-sm h-9" 
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Company Email *</Label>
                        <Input 
                          type="email" 
                          value={email} 
                          onChange={e => setEmail(e.target.value)} 
                          placeholder="john.doe@safevitals.com" 
                          className="bg-zinc-900 border-zinc-800 text-sm h-9" 
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-xs font-semibold uppercase tracking-wider text-blue-500 mb-2">
                        1. Firebase Identity Resolution
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-semibold text-zinc-200">Firebase User UID *</Label>
                          <span className="text-[10px] text-blue-400 font-mono bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">28-Char UID</span>
                        </div>
                        <Input 
                          value={firebaseUid} 
                          onChange={e => setFirebaseUid(e.target.value)} 
                          placeholder="e.g. Xk92LaPq01ZmN8vR4tYw3bC7dEf9" 
                          className="bg-zinc-900 border-zinc-800 text-xs font-mono h-10 tracking-wide focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/50" 
                        />
                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/20 text-[11px] text-zinc-300">
                          <Sparkles className="h-4 w-4 text-blue-400 shrink-0" />
                          <span>Backend auto-resolves appointee email, full name, and avatar directly from Firebase Auth.</span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Role Assignment */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-zinc-200">Enterprise Role Assignment *</Label>
                      <a href="/app/roles" target="_blank" rel="noreferrer" className="text-[11px] text-blue-400 hover:underline flex items-center gap-0.5">
                        <Plus className="w-3 h-3" /> Custom Roles & Permissions
                      </a>
                    </div>
                    <select
                      value={roleId}
                      onChange={e => setRoleId(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Role (Default: Standard Employee)</option>
                      {roles.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button 
                      onClick={() => setStep(2)} 
                      disabled={onboardMode === "standard" ? (!firstName.trim() || !lastName.trim() || !email.trim()) : !firebaseUid.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 px-4"
                    >
                      Next: Department & Team &rarr;
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Org Assignment */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  custom={1}
                  className="space-y-4"
                >
                  <div className="text-xs font-semibold uppercase tracking-wider text-blue-500 mb-2">
                    2. Organization & Department Placement
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Department *</Label>
                      <button type="button" onClick={() => setDeptOpen(true)} className="text-[11px] text-blue-500 hover:underline flex items-center">
                        <Plus className="w-3 h-3 mr-0.5"/> New Department
                      </button>
                    </div>
                    <select 
                      value={departmentId} 
                      onChange={e => {
                        setDepartmentId(e.target.value)
                        setPositionId("")
                        setTeamId("")
                      }}
                      className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Department</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Position *</Label>
                        <button type="button" onClick={() => departmentId && setPosOpen(true)} disabled={!departmentId} className="text-[11px] text-blue-500 hover:underline disabled:opacity-40 flex items-center">
                          <Plus className="w-3 h-3 mr-0.5"/> New
                        </button>
                      </div>
                      <select 
                        value={positionId} 
                        onChange={e => setPositionId(e.target.value)}
                        disabled={!departmentId}
                        className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        <option value="">Select Position</option>
                        {filteredPositions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Team *</Label>
                        <button type="button" onClick={() => departmentId && setTeamOpen(true)} disabled={!departmentId} className="text-[11px] text-blue-500 hover:underline disabled:opacity-40 flex items-center">
                          <Plus className="w-3 h-3 mr-0.5"/> New
                        </button>
                      </div>
                      <select 
                        value={teamId} 
                        onChange={e => setTeamId(e.target.value)}
                        disabled={!departmentId}
                        className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        <option value="">Select Team</option>
                        {filteredTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Direct Reporting Manager (Optional)</Label>
                    <select 
                      value={managerId} 
                      onChange={e => setManagerId(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Manager</option>
                      {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                    </select>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="ghost" onClick={() => setStep(1)} className="text-zinc-400 hover:text-zinc-100 text-xs h-9">
                      &larr; Back
                    </Button>
                    {onboardMode === "firebase" ? (
                      <Button 
                        onClick={handleSubmitFirebase} 
                        disabled={!departmentId || !positionId || !teamId || isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 px-4"
                      >
                        {isSubmitting ? "Onboarding..." : "Complete Firebase Onboarding"}
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => setStep(3)} 
                        disabled={!departmentId || !positionId || !teamId}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 px-4"
                      >
                        Next: Security Credentials &rarr;
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Password & Security (Standard Mode only) */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  custom={1}
                  className="space-y-4"
                >
                  <div className="text-xs font-semibold uppercase tracking-wider text-blue-500 mb-2">
                    3. Invitation Delivery
                  </div>
                  
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-blue-100">Send Setup Link</h4>
                      <p className="text-xs text-blue-400/80 mt-1">
                        An invitation email will be sent to <strong>{email}</strong> containing a secure link. The employee will use this link to verify their account and set their own password.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                    <div>
                      <p className="text-xs font-medium text-zinc-200">Send Email Invitation Now</p>
                      <p className="text-[11px] text-zinc-400">Delivers activation link with 7-day validity</p>
                    </div>
                    <Switch id="send-invite" checked={sendInvite} onCheckedChange={(c) => setSendInvite(!!c)} />
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="ghost" onClick={() => setStep(2)} className="text-zinc-400 hover:text-zinc-100 text-xs h-9">
                      &larr; Back
                    </Button>
                    <Button 
                      onClick={handleSubmitStandard} 
                      disabled={isSubmitting} 
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 px-4"
                    >
                      {isSubmitting ? "Sending..." : "Send Invitation Link"}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Success Completion */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center space-y-3 py-6"
                >
                  <div className="w-14 h-14 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-500 mb-1 border border-blue-500/30">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-zinc-100">Employee Onboarded</h3>
                  <p className="text-xs text-zinc-400 max-w-xs">
                    {onboardMode === "firebase"
                      ? `Linked to Firebase UID "${firebaseUid}" and granted active CRM role.`
                      : `Account created for ${firstName} ${lastName}. Invitation dispatched.`}
                  </p>

                  <Button onClick={() => onOpenChange(false)} className="mt-4 w-full max-w-xs bg-blue-600 hover:bg-blue-700 text-white text-xs h-9">
                    Done
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>

      <CreateDepartmentDialog 
        open={deptOpen} 
        onOpenChange={setDeptOpen} 
        onSuccess={(d) => setDepartmentId(d.id)} 
      />
      
      <CreatePositionDialog 
        open={posOpen} 
        onOpenChange={setPosOpen} 
        departmentId={departmentId}
        onSuccess={(p) => setPositionId(p.id)} 
      />
      
      <CreateTeamDialog 
        open={teamOpen} 
        onOpenChange={setTeamOpen} 
        departmentId={departmentId}
        onSuccess={(t) => setTeamId(t.id)} 
      />
    </>
  )
}
