import * as React from "react"
import Link from "next/link"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { Button } from "@/components/ui/Button"
import { AlertCircle, Ban, Clock, UserX } from "lucide-react"

export default function AuthErrorPage({ searchParams }: { searchParams: { reason?: string } }) {
  const reason = searchParams.reason || "unknown"

  let title = "Authentication Error"
  let description = "An unknown error occurred during authentication."
  let icon = <AlertCircle className="w-8 h-8" />

  switch (reason) {
    case "expired":
      title = "Invitation Expired"
      description = "This Safe Vitals invitation is no longer valid. Please contact your administrator for a new invitation."
      icon = <Clock className="w-8 h-8" />
      break
    case "revoked":
      title = "Invitation Revoked"
      description = "This invitation is no longer active. Please contact Safe Vitals administration for assistance."
      icon = <Ban className="w-8 h-8" />
      break
    case "suspended":
      title = "Account Suspended"
      description = "Your Safe Vitals account has been temporarily suspended. Please contact your administrator if you believe this is incorrect."
      icon = <Ban className="w-8 h-8" />
      break
    case "deactivated":
      title = "Account Inactive"
      description = "Your Safe Vitals account is currently inactive. Please contact your administrator."
      icon = <UserX className="w-8 h-8" />
      break
  }

  return (
    <AuthLayout>
      <div className="mx-auto flex w-full flex-col items-center justify-center space-y-6 sm:w-[350px] text-center">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center text-destructive mb-2">
          {icon}
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground pt-2">
            {description}
          </p>
        </div>

        <div className="w-full space-y-3 mt-4">
          {reason === "suspended" && (
            <Button variant="outline" className="w-full border-zinc-800 hover:bg-zinc-900 h-11">
              Contact Support
            </Button>
          )}
          <Button asChild className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200 h-11">
            <Link href="/login">Return to Login</Link>
          </Button>
        </div>
      </div>
    </AuthLayout>
  )
}
