"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { authService } from "@/services/authService"
import { useAuthStore } from "@/stores/authStore"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const router = useRouter()
  const { login, isAuthenticated, setPendingAuth } = useAuthStore()

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace("/app/dashboard")
    }
  }, [isAuthenticated, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError("Please enter both email and password.")
      return
    }

    setIsLoading(true)
    setError("")
    
    try {
      let res: any;
      let usedFirebase = false;

      // 1. Try Firebase first (Superadmins & Firebase-managed users)
      try {
        const { signInWithEmailAndPassword } = await import("firebase/auth");
        const { auth } = await import("@/lib/firebase");
        
        if (auth) {
          const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
          const idToken = await userCredential.user.getIdToken();
          res = await authService.firebaseLogin(idToken);
          usedFirebase = true;
        }
      } catch (fbErr: any) {
        // If wrong password in Firebase, do not fallback to backend
        if (fbErr.code === "auth/wrong-password" || fbErr.code === "auth/invalid-credential") {
          throw new Error("Invalid email or password.");
        }
        // If user-not-found or other error, proceed to backend fallback
      }

      // 2. Fallback to normal backend login
      if (!usedFirebase) {
        res = await authService.login(email.trim(), password);
      }
      
      // 3. Handle response
      if (res.token && res.user) {
        login(res.user, res.token)
        
        // Check if user must change password before accessing dashboard
        if (res.mustChangePassword || res.user?.mustChangePassword) {
          toast.success("Login successful! Please set your new password.")
          router.push("/change-password")
        } else {
          toast.success("Login successful!")
          router.push("/app/dashboard")
        }
      } else if (res.userId || res.success) {
        setPendingAuth(res.userId || "", email.trim())
        toast.success(res.message || "OTP sent to your email!")
        router.push("/verify-otp")
      } else {
        setError(res.message || "Failed to initiate login.")
      }
    } catch (err: any) {
      let msg = "Invalid email or password. Please verify your credentials."
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        msg = "Invalid email or password."
      } else if (err.message) {
        msg = err.message
      }
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px] px-4">
        {/* Header */}
        <div className="flex flex-col space-y-2 text-center">
          <div className="inline-flex items-center justify-center mx-auto h-12 w-12 rounded-xl bg-blue-500/10 text-blue-500 mb-2 border border-blue-500/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome to SafeVitals XR
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to access your enterprise spatial command workspace
          </p>
        </div>

        {/* Login Form */}
        <div className="grid gap-4">
          <form onSubmit={handleLogin}>
            <div className="grid gap-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              <div className="grid gap-1.5">
                <Label htmlFor="email" className="text-xs font-medium">Work Email</Label>
                <Input
                  id="email"
                  placeholder="name@safevitals.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="off"
                  autoCorrect="off"
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-card/50"
                />
              </div>

              <div className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-muted-foreground hover:text-blue-500 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your account password"
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

              <Button 
                disabled={isLoading || !email || !password} 
                className="bg-blue-600 hover:bg-blue-700 text-white w-full h-10 font-medium transition-all shadow-sm shadow-blue-600/30"
              >
                {isLoading ? "Signing in..." : "Sign In"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        {/* Register CTA */}
        <Link href="/register">
          <Button
            variant="outline"
            className="w-full h-10 font-medium border-violet-500/30 text-violet-400 hover:bg-violet-500/10 hover:text-violet-300 hover:border-violet-500/50 transition-all"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            New here? Create an account
          </Button>
        </Link>

        {/* Footer links */}
        <div className="flex flex-col gap-1.5 text-center text-xs text-muted-foreground">
          <p>
            Have an invitation?{" "}
            <Link
              href="/activate-account"
              className="underline underline-offset-4 hover:text-blue-500 font-medium"
            >
              Activate Invited Account
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
