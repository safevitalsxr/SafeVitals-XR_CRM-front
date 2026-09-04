"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { OTPInput } from "@/components/auth/OTPInput"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { authService } from "@/services/authService"
import { ArrowRight, MailCheck, AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

export default function RegistrationVerifyOtpPage() {
  const router = useRouter()
  const [otp, setOtp] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState(false)
  const [countdown, setCountdown] = React.useState(300) // 5-minute OTP window
  const [regToken, setRegToken] = React.useState<string | null>(null)
  const [regEmail, setRegEmail] = React.useState<string | null>(null)
  const [regName, setRegName] = React.useState<string | null>(null)

  React.useEffect(() => {
    const token = sessionStorage.getItem("reg_token")
    const email = sessionStorage.getItem("reg_email")
    const name = sessionStorage.getItem("reg_name")

    if (!token || !email) {
      router.replace("/register")
      return
    }

    setRegToken(token)
    setRegEmail(email)
    setRegName(name)
  }, [router])

  // Countdown timer
  React.useEffect(() => {
    if (countdown > 0 && !success) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown, success])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6 || !regToken || !password || !confirmPassword) return

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/
    if (!passwordRegex.test(password)) {
      setError("Password must be at least 8 characters, with 1 uppercase, 1 number, and 1 special character.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const res = await authService.verifyRegistrationOtp(regToken, otp, password)
      if (res.success) {
        setSuccess(true)
        sessionStorage.removeItem("reg_token")
        sessionStorage.removeItem("reg_email")
        sessionStorage.removeItem("reg_name")
        toast.success("Email verified! Registration complete.")
        setTimeout(() => router.push("/login"), 3000)
      } else {
        setError("Verification failed. Please try again.")
      }
    } catch (err: any) {
      setError(err.message || "Invalid or expired code.")
      setOtp("")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!regEmail || !regName) return
    setCountdown(300)
    setError("")
    try {
      const res = await authService.register(regName, regEmail, sessionStorage.getItem("reg_phone") || "")
      if (res.registrationToken) {
        sessionStorage.setItem("reg_token", res.registrationToken)
        setRegToken(res.registrationToken)
        toast.success("New verification code sent to your email.")
      }
    } catch (err: any) {
      setError(err.message || "Failed to resend verification code.")
    }
  }

  const formatCountdown = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
  }

  const maskedEmail = regEmail
    ? `${regEmail.charAt(0)}***@${regEmail.split("@")[1] || ""}`
    : "your email"

  if (success) {
    return (
      <AuthLayout>
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px] px-4 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Registration Complete!</h1>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Your email has been verified. Your account is now <strong className="text-foreground">pending admin approval</strong>.
                You will receive an email once your account is activated.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">Redirecting you to login...</p>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px] px-4">
        {/* Header */}
        <div className="flex flex-col space-y-2 text-center">
          <div className="inline-flex items-center justify-center mx-auto h-12 w-12 rounded-xl bg-violet-500/10 text-violet-400 mb-2 border border-violet-500/20">
            <MailCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Verify your email</h1>
          <p className="text-sm text-muted-foreground pt-1 leading-relaxed">
            Enter the 6-digit code sent to<br />
            <span className="font-semibold text-foreground">{maskedEmail}</span>
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

            {/* Password */}
            <div className="grid gap-1.5 mt-4">
              <Label htmlFor="password" className="text-xs font-medium">Create Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Strong password"
                  autoComplete="new-password"
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* Confirm Password */}
            <div className="grid gap-1.5 mt-4">
              <Label htmlFor="confirmPassword" className="text-xs font-medium">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  autoComplete="new-password"
                  disabled={isLoading}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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

            {/* Countdown */}
            <div className="text-center pt-2">
              {countdown > 0 ? (
                <p className="text-xs text-muted-foreground">
                  Code expires in{" "}
                  <span className="font-mono font-semibold text-violet-400">{formatCountdown(countdown)}</span>
                </p>
              ) : (
                <p className="text-xs text-destructive">Code expired. Please request a new one.</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || otp.length !== 6 || countdown === 0 || !password || !confirmPassword}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white h-11 font-medium transition-all shadow-sm shadow-violet-600/30"
          >
            {isLoading ? "Verifying..." : "Verify & Complete Registration"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3 w-3" /> Back
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={countdown > 0}
            className={`font-semibold transition-colors cursor-pointer ${
              countdown > 0
                ? "text-muted-foreground cursor-not-allowed"
                : "text-violet-400 hover:text-violet-300 hover:underline"
            }`}
          >
            {countdown > 0 ? `Resend in ${formatCountdown(countdown)}` : "Resend Code"}
          </button>
        </div>
      </div>
    </AuthLayout>
  )
}
