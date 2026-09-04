"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  UserPlus, ArrowRight, AlertCircle, Eye, EyeOff,
  Mail, Phone, User, ShieldCheck, ArrowLeft,
} from "lucide-react"

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { authService } from "@/services/authService"
import { toast } from "sonner"

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [countryCode, setCountryCode] = React.useState("+91")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setError("Please fill in all required fields.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const fullPhone = `${countryCode}${phone.trim()}`
      const res = await authService.register(fullName.trim(), email.trim(), fullPhone)
      
      if (res.registrationToken || res.success) {
        sessionStorage.setItem("reg_token", res.registrationToken || "dummy_token")
        sessionStorage.setItem("reg_email", email.trim())
        sessionStorage.setItem("reg_name", fullName.trim())
        sessionStorage.setItem("reg_phone", fullPhone)
        
        toast.success("Verification code sent to your email.")
        router.push("/register/verify-otp")
      } else {
        setError(res.message || "Registration succeeded but no verification token was received.")
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[420px] px-4">
        {/* Header */}
        <div className="flex flex-col space-y-2 text-center">
          <div className="inline-flex items-center justify-center mx-auto h-12 w-12 rounded-xl bg-violet-500/10 text-violet-400 mb-2 border border-violet-500/20">
            <UserPlus className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="text-sm text-muted-foreground">
            Register to join SafeVitals XR. An admin will activate your account after verification.
          </p>
        </div>

        {/* Form */}
        <div className="grid gap-4">
          <form onSubmit={handleRegister}>
            <div className="grid gap-4">

              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Full Name */}
              <div className="grid gap-1.5">
                <Label htmlFor="fullName" className="text-xs font-medium flex items-center gap-1.5">
                  <User className="h-3 w-3" /> Full Name
                </Label>
                <Input
                  id="fullName"
                  placeholder="e.g. Ravi Kumar"
                  type="text"
                  autoComplete="name"
                  disabled={isLoading}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="bg-card/50"
                />
              </div>

              {/* Email */}
              <div className="grid gap-1.5">
                <Label htmlFor="reg-email" className="text-xs font-medium flex items-center gap-1.5">
                  <Mail className="h-3 w-3" /> Email Address
                </Label>
                <Input
                  id="reg-email"
                  placeholder="you@gmail.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-card/50"
                />
              </div>

              {/* Phone */}
              <div className="grid gap-1.5">
                <Label htmlFor="phone" className="text-xs font-medium flex items-center gap-1.5">
                  <Phone className="h-3 w-3" /> Phone Number
                </Label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="flex h-10 w-[110px] items-center justify-between rounded-md border border-input bg-card/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="+1">+1 (US)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+91">+91 (IN)</option>
                    <option value="+61">+61 (AU)</option>
                    <option value="+971">+971 (UAE)</option>
                  </select>
                  <Input
                    id="phone"
                    placeholder="98765 43210"
                    type="tel"
                    autoComplete="tel"
                    disabled={isLoading}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="bg-card/50 flex-1"
                  />
                </div>
              </div>



              {/* Info banner */}
              <div className="rounded-lg bg-violet-500/8 border border-violet-500/20 p-3 flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-violet-400" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your account will be created securely. After registering, your account will be reviewed by an administrator before you can log in.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !fullName || !email || !phone}
                className="bg-violet-600 hover:bg-violet-700 text-white w-full h-10 font-medium transition-all shadow-sm shadow-violet-600/30"
              >
                {isLoading ? "Sending code..." : "Continue"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>

        {/* Footer links */}
        <div className="flex flex-col gap-2 text-center text-xs text-muted-foreground">
          <p>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-violet-400 hover:text-violet-300 transition-colors underline underline-offset-4">
              Sign in
            </Link>
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-1 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Back to login
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
