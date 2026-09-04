
"use client"

import * as React from "react"
import Link from "next/link"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { authService } from "@/services/authService"
import { MailCheck } from "lucide-react"
import { motion } from "framer-motion"

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSubmitted, setIsSubmitted] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await authService.requestPasswordReset(email)
      setIsSubmitted(true)
    } catch (err) {
      console.error(err)
      // Even on error, we pretend it succeeded to prevent email enumeration
      setIsSubmitted(true)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <AuthLayout>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto flex w-full flex-col items-center justify-center space-y-6 sm:w-[350px] text-center"
        >
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 mb-2">
            <MailCheck className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
            <p className="text-sm text-muted-foreground pt-2">
              If an account exists for this address, we've sent password reset instructions.
            </p>
          </div>

          <div className="flex flex-col gap-2 w-full mt-4">
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11">
              <Link href="/reset-password">Enter Reset Code</Link>
            </Button>
            <Button asChild variant="outline" className="w-full h-11 border-zinc-800 hover:bg-zinc-900">
              <Link href="/login">Return to Login</Link>
            </Button>
          </div>
        </motion.div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Forgot your password?</h1>
          <p className="text-sm text-muted-foreground pt-1">
            Enter your Safe Vitals email address to request a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="name@safevitals.in"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-zinc-900 border-zinc-800"
              />
            </div>

            <Button disabled={isLoading || !email} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11">
              {isLoading ? "Sending..." : "Send Reset Code"}
            </Button>
          </div>
        </form>

        <div className="text-center flex flex-col items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-blue-500">
            Back to Login
          </Link>
          <Link href="/reset-password" className="text-sm font-medium text-blue-500 hover:text-blue-400">
            Already have a reset code?
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
