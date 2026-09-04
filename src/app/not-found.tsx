import Link from "next/link"
import { FileQuestion } from "lucide-react"

import { Button } from "@/components/ui/Button"

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4 text-center">
      <div className="flex max-w-md flex-col items-center gap-6 rounded-xl border bg-card p-8 shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <FileQuestion className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Page Not Found</h1>
          <p className="text-muted-foreground">
            This Safe Vitals resource doesn't exist or may have been removed.
          </p>
        </div>
        <div className="mt-4 flex w-full justify-center">
          <Button asChild>
            <Link href="/app/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
