"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Check, CheckCircle2, Eye, EyeOff, KeyRound, AlertCircle } from "lucide-react"
import { authService } from "@/services/authService"
import { useRouter } from "next/navigation"

function ActivateAccountContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tokenFromUrl = searchParams.get("token") || searchParams.get("oobCode") || ""
  const emailFromUrl = searchParams.get("email") || ""

  const [invitationToken, setInvitationToken] = React.useState(tokenFromUrl)
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    if (tokenFromUrl) {
      setInvitationToken(tokenFromUrl)
    }
  }, [tokenFromUrl])

  // Validation
  const hasLength = password.length >= 8
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  const isMatch = password === confirmPassword && password.length > 0

  const isValid = hasLength && hasUpper && hasLower && hasNumber && hasSpecial && isMatch && invitationToken.trim().length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setIsLoading(true)
    setError("")

    try {
      await authService.activateAccount(invitationToken.trim(), password)
      
      // Auto-login if email is provided
      if (emailFromUrl) {
        try {
          const res = await authService.login(emailFromUrl, password)
          if (res.token && res.user) {
            const { useAuthStore } = await import("@/stores/authStore")
            useAuthStore.getState().login(res.user, res.token)
            router.push("/app/dashboard")
            return
          }
        } catch (loginErr) {
          console.error("Auto-login failed:", loginErr)
        }
      }
      
      setIsSuccess(true)
    } catch (err: any) {
      setError(err.message || "Failed to activate account. The invitation token may be invalid or expired.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <AuthLayout>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto flex w-full flex-col items-center justify-center space-y-6 sm:w-[350px] text-center"
        >
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            transition={{ type: "spring", delay: 0.1 }}
            className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-500 mb-2"
          >
            <CheckCircle2 className="w-8 h-8" />
          </motion.div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Account Activated!</h1>
            <p className="text-sm text-muted-foreground pt-2">
              Your SafeVitals XR enterprise workspace account is now active.
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            You can now sign in with your email and permanent password.
          </p>

          <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4 h-11">
            <Link href="/login">Continue to Login</Link>
          </Button>
        </motion.div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px] px-4">
        <div className="flex flex-col space-y-2 text-center">
          <div className="inline-flex items-center justify-center mx-auto h-12 w-12 rounded-xl bg-blue-500/10 text-blue-500 mb-2 border border-blue-500/20">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Activate Your Account</h1>
          {emailFromUrl ? (
            <p className="text-sm font-medium text-blue-500 pt-1">
              {emailFromUrl}
            </p>
          ) : null}
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
            Create your permanent password to complete your enterprise onboarding.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!tokenFromUrl && (
            <div className="grid gap-1.5">
              <Label className="text-xs">Invitation Token *</Label>
              <Input
                value={invitationToken}
                onChange={(e) => setInvitationToken(e.target.value)}
                placeholder="Paste your invitation token"
                required
                className="bg-card/50 font-mono text-xs"
              />
            </div>
          )}

          <div className="grid gap-1.5">
            <Label className="text-xs">Permanent Password *</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter strong password"
                required
                className="bg-card/50 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label className="text-xs">Confirm Password *</Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                className="bg-card/50 pr-10"
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

          {/* Password Requirements */}
          <div className="rounded-lg border p-3 space-y-1.5 text-xs text-muted-foreground bg-muted/20">
            <p className="font-semibold text-foreground">Password requirements:</p>
            <div className="grid grid-cols-2 gap-1 text-[11px]">
              <span className={hasLength ? "text-blue-500 font-medium" : ""}>✓ At least 8 chars</span>
              <span className={hasUpper ? "text-blue-500 font-medium" : ""}>✓ Uppercase letter</span>
              <span className={hasLower ? "text-blue-500 font-medium" : ""}>✓ Lowercase letter</span>
              <span className={hasNumber ? "text-blue-500 font-medium" : ""}>✓ Number (0-9)</span>
              <span className={hasSpecial ? "text-blue-500 font-medium" : ""}>✓ Special symbol</span>
              <span className={isMatch ? "text-blue-500 font-medium" : ""}>✓ Passwords match</span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !isValid}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 font-medium shadow-sm shadow-blue-600/30"
          >
            {isLoading ? "Activating Account..." : "Set Password & Activate"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Already have an active account?{" "}
          <Link href="/login" className="underline hover:text-blue-500 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

export default function ActivateAccountPage() {
  return (
    <React.Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <ActivateAccountContent />
    </React.Suspense>
  )
}
