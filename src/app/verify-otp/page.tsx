"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { OTPInput } from "@/components/auth/OTPInput"
import { Button } from "@/components/ui/Button"
import { useAuthStore } from "@/stores/authStore"
import { authService } from "@/services/authService"
import { ArrowRight, ShieldCheck, AlertCircle, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function VerifyOTPPage() {
  const router = useRouter()
  const { pendingUserId, pendingEmail, login, isAuthenticated } = useAuthStore()
  const [otp, setOtp] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [countdown, setCountdown] = React.useState(60)

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace("/app/dashboard")
      return
    }

    if (!pendingUserId || !pendingEmail) {
      router.replace("/login")
    }
  }, [pendingUserId, pendingEmail, isAuthenticated, router])

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6 || !pendingUserId) return

    setIsLoading(true)
    setError("")

    try {
      const res = await authService.verifyOtp(pendingUserId, otp)
      if (res.success && res.token) {
        login(res.user, res.token)
        
        // Check if user must change password before accessing dashboard
        if (res.mustChangePassword || res.user?.mustChangePassword) {
          toast.success("Authentication successful! Please set your new password.")
          router.push("/change-password")
        } else {
          toast.success(`Authentication successful! Welcome back.`)
          router.push("/app/dashboard")
        }
      } else {
        setError("Verification failed. Please try again.")
      }
    } catch (err: any) {
      setError(err.message || "Invalid or expired verification code.")
      setOtp("")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!pendingUserId) return
    setCountdown(60)
    setError("")
    try {
      await authService.resendOtp(pendingUserId)
      toast.success("A new verification code has been dispatched to your email.")
    } catch (err: any) {
      setError(err.message || "Failed to resend verification code.")
    }
  }

  const displayEmail = pendingEmail 
    ? `${pendingEmail.charAt(0)}•••@${pendingEmail.split("@")[1] || ""}` 
    : "your email"

  return (
    <AuthLayout>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px] px-4">
        <div className="flex flex-col space-y-2 text-center">
          <div className="inline-flex items-center justify-center mx-auto h-12 w-12 rounded-xl bg-blue-500/10 text-blue-500 mb-2 border border-blue-500/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Two-Factor Authentication
          </h1>
          <p className="text-sm text-muted-foreground pt-1 leading-relaxed">
            Enter the 6-digit verification code sent to<br />
            <span className="font-semibold text-foreground">{displayEmail}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive text-center flex items-center justify-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <OTPInput 
              length={6} 
              value={otp} 
              onChange={setOtp} 
              disabled={isLoading}
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading || otp.length !== 6} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 font-medium transition-all shadow-sm shadow-blue-600/30"
          >
            {isLoading ? "Verifying code..." : "Verify & Launch Workspace"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3 w-3" /> Back to login
          </button>

          <div>
            {countdown > 0 ? (
              <span className="text-muted-foreground font-mono">Resend in 00:{countdown.toString().padStart(2, "0")}</span>
            ) : (
              <button 
                type="button" 
                onClick={handleResend}
                className="text-blue-500 hover:text-blue-400 font-semibold hover:underline cursor-pointer"
              >
                Resend Code Now
              </button>
            )}
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}
