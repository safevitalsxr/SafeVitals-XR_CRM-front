"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, KeyRound, Check, X } from "lucide-react"

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { authService } from "@/services/authService"
import { useAuthStore } from "@/stores/authStore"
import { toast } from "sonner"

export default function ChangePasswordPage() {
  const router = useRouter()
  const { user, token, isAuthenticated, setUser } = useAuthStore()

  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false)
  const [showNewPassword, setShowNewPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  // Password strength checks
  const hasLength = newPassword.length >= 8
  const hasUpper = /[A-Z]/.test(newPassword)
  const hasLower = /[a-z]/.test(newPassword)
  const hasNumber = /[0-9]/.test(newPassword)
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)
  const isMatch = newPassword === confirmPassword && confirmPassword.length > 0
  const isDifferent = currentPassword !== newPassword || newPassword.length === 0
  const isValid = hasLength && hasUpper && hasLower && hasNumber && hasSpecial && isMatch && isDifferent && currentPassword.length > 0

  React.useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated || !token) {
      router.replace("/login")
      return
    }
    // If user doesn't need to change password, send to dashboard
    if (user && !user.mustChangePassword) {
      router.replace("/app/dashboard")
    }
  }, [isAuthenticated, token, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setIsLoading(true)
    setError("")

    try {
      await authService.changePassword(currentPassword, newPassword)
      
      // Update the user in the store to clear mustChangePassword
      if (user) {
        setUser({ ...user, mustChangePassword: false })
      }
      
      toast.success("Password updated successfully! Welcome to SafeVitals XR.")
      router.push("/app/dashboard")
    } catch (err: any) {
      setError(err.message || "Failed to change password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const StrengthCheck = ({ passed, label }: { passed: boolean; label: string }) => (
    <div className={`flex items-center gap-2 text-xs transition-colors ${passed ? "text-blue-500" : "text-muted-foreground"}`}>
      {passed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3 opacity-40" />}
      <span>{label}</span>
    </div>
  )

  return (
    <AuthLayout>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[420px] px-4">
        {/* Header */}
        <div className="flex flex-col space-y-2 text-center">
          <div className="inline-flex items-center justify-center mx-auto h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 mb-2 border border-amber-500/20">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Set Your New Password
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            For security, please confirm your current password and create a new one before accessing your workspace.
          </p>
        </div>

        {/* Form */}
        <div className="grid gap-4">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Current Password */}
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Current Password</Label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    required
                    className="bg-card/50 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="relative my-1">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">new password</span>
                </div>
              </div>

              {/* New Password */}
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">New Password</Label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    className="bg-card/50 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    className="bg-card/50 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Password Strength */}
              {newPassword.length > 0 && (
                <div className="rounded-lg bg-card/50 border border-border/50 p-3 grid grid-cols-2 gap-2">
                  <StrengthCheck passed={hasLength} label="At least 8 characters" />
                  <StrengthCheck passed={hasUpper} label="Uppercase letter" />
                  <StrengthCheck passed={hasLower} label="Lowercase letter" />
                  <StrengthCheck passed={hasNumber} label="Number" />
                  <StrengthCheck passed={hasSpecial} label="Special character" />
                  <StrengthCheck passed={isMatch} label="Passwords match" />
                </div>
              )}

              {!isDifferent && newPassword.length > 0 && (
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-sm text-amber-500 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>New password must be different from your current password.</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || !isValid}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full h-10 font-medium transition-all shadow-sm shadow-blue-600/30 mt-1"
              >
                {isLoading ? "Updating password..." : "Update Password & Continue"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          This is a one-time security requirement. You won&apos;t be asked again.
        </p>
      </div>
    </AuthLayout>
  )
}
