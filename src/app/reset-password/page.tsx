"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, KeyRound, AlertCircle, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { authService } from "@/services/authService"

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tokenFromUrl = searchParams.get("token") || searchParams.get("oobCode") || ""
  const emailFromUrl = searchParams.get("email") || ""

  const [token, setToken] = React.useState(tokenFromUrl)
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSubmitted, setIsSubmitted] = React.useState(false)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    if (tokenFromUrl) {
      setToken(tokenFromUrl)
    }
  }, [tokenFromUrl])

  const isValid = password.length >= 8 && password === confirmPassword && token.trim().length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setIsLoading(true)
    setError("")
    
    try {
      await authService.resetPassword(token.trim(), password)
      
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
      
      setIsSubmitted(true)
    } catch (err: any) {
      setError(err.message || "Failed to reset password. The reset token may be invalid or expired.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <AuthLayout>
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] text-center">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 mx-auto mb-2">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Password Reset Complete</h1>
            <p className="text-sm text-muted-foreground pt-1">
              Your password has been successfully updated.
            </p>
          </div>
          <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4 h-11">
            <Link href="/login">Return to Login</Link>
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] px-4">
        <div className="flex flex-col space-y-2 text-center">
          <div className="inline-flex items-center justify-center mx-auto h-12 w-12 rounded-xl bg-blue-500/10 text-blue-500 mb-2 border border-blue-500/20">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Create New Password
          </h1>
          {emailFromUrl ? (
            <p className="text-sm font-medium text-blue-500 pt-1">
              {emailFromUrl}
            </p>
          ) : null}
          <p className="text-sm text-muted-foreground mt-2">
            Enter your new permanent account password.
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
              <Label className="text-xs">Reset Token *</Label>
              <Input
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="Enter reset token from email"
                required
                className="bg-card/50 font-mono text-xs"
              />
            </div>
          )}

          <div className="grid gap-1.5">
            <Label className="text-xs">New Password *</Label>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
              className="bg-card/50"
            />
          </div>

          <div className="grid gap-1.5">
            <Label className="text-xs">Confirm New Password *</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              required
              className="bg-card/50"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || !isValid}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 font-medium shadow-sm shadow-blue-600/30"
          >
            {isLoading ? "Updating Password..." : "Update Password"}
          </Button>
        </form>

        <div className="text-center">
          <Link href="/login" className="text-xs text-muted-foreground hover:text-blue-500 inline-flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Back to Login
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <ResetPasswordContent />
    </React.Suspense>
  )
}
