import Link from "next/link"
import { ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/Button"

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4 text-center">
      <div className="flex max-w-md flex-col items-center gap-6 rounded-xl border bg-card p-8 shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Access Restricted</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this Safe Vitals resource.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          If you believe you should have access, submit an access request through the standard channels.
        </p>
        <div className="mt-4 flex w-full flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/app/dashboard">Go Back</Link>
          </Button>
          <Button className="w-full" asChild>
            <Link href="/app/access-requests">Request Access</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
