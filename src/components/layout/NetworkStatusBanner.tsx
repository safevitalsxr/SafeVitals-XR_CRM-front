"use client"

import * as React from "react"
import { WifiOff, CloudOff, RefreshCw, X, CheckCircle2, ServerCrash } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { toast } from "sonner"
import { useAppStore } from "@/stores/appStore"

export function NetworkStatusBanner() {
  const [isOnline, setIsOnline] = React.useState(true)
  const [userDismissed, setUserDismissed] = React.useState(false)
  const [isRetrying, setIsRetrying] = React.useState(false)
  const { fetchAllData, isApiConnected } = useAppStore()

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine)

      const handleOnline = () => {
        setIsOnline(true)
        toast.success("Connection restored! You are back online.", {
          icon: <CheckCircle2 className="h-4 w-4 text-blue-500" />,
          duration: 4000
        })
        fetchAllData()
      }

      const handleOffline = () => {
        setIsOnline(false)
        setUserDismissed(false) // Auto un-dismiss if status changes
        toast.warning("You are currently offline. Working in local standalone mode.", {
          icon: <WifiOff className="h-4 w-4 text-amber-500" />,
          duration: 5000
        })
      }

      window.addEventListener("online", handleOnline)
      window.addEventListener("offline", handleOffline)

      return () => {
        window.removeEventListener("online", handleOnline)
        window.removeEventListener("offline", handleOffline)
      }
    }
  }, [fetchAllData])

  // Un-dismiss if the API connection drops again
  React.useEffect(() => {
    if (!isApiConnected) {
      setUserDismissed(false)
    }
  }, [isApiConnected])

  const handleRetry = async () => {
    setIsRetrying(true)
    const tid = toast.loading("Checking server & network connectivity...")
    try {
      await fetchAllData()
      setIsRetrying(false)
      const currentApiConnected = useAppStore.getState().isApiConnected
      if (currentApiConnected) {
        toast.success("Connected to SafeVitals Servers!", { id: tid })
      } else {
        toast.error("Servers are still unreachable", { id: tid })
      }
    } catch (e) {
      setIsRetrying(false)
      toast.error("Operating in standalone client mode", { id: tid })
    }
  }

  // Determine which banner to show
  const showBanner = (!isOnline || !isApiConnected) && !userDismissed

  if (!showBanner) {
    return null
  }

  const isServerCrash = isOnline && !isApiConnected

  return (
    <div className={`w-full border-b text-xs transition-all animate-in slide-in-from-top duration-300 px-4 py-2 ${
      isServerCrash 
        ? "bg-red-500/15 border-red-500/30 text-red-950 dark:text-red-200" 
        : "bg-amber-500/15 border-amber-500/30 text-amber-950 dark:text-amber-200"
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full animate-ping ${isServerCrash ? "bg-red-500" : "bg-amber-500"}`} />
          {isServerCrash ? (
            <ServerCrash className="h-4 w-4 text-red-500 shrink-0" />
          ) : (
            <WifiOff className="h-4 w-4 text-amber-500 shrink-0" />
          )}
          <span className="font-semibold">
            {isServerCrash ? "Cannot connect to SafeVitals Servers." : "You are currently offline."}
          </span>
          <span className={`hidden sm:inline ${isServerCrash ? "text-red-900/80 dark:text-red-300/80" : "text-amber-900/80 dark:text-amber-300/80"}`}>
            {isServerCrash 
              ? "We're having trouble connecting to the servers. Operating in Standalone Mode." 
              : "Operating in Standalone Mode. All punches, tasks, and profile updates will save to your local workspace."}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRetry}
            disabled={isRetrying}
            className={`h-6 px-2 text-[11px] bg-background/80 cursor-pointer ${
              isServerCrash 
                ? "border-red-500/40 text-red-700 dark:text-red-300 hover:bg-red-500/10" 
                : "border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
            }`}
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isRetrying ? "animate-spin" : ""}`} />
            {isRetrying ? "Testing..." : "Retry"}
          </Button>

          <button 
            onClick={() => setUserDismissed(true)}
            className={`p-1 rounded ${
              isServerCrash 
                ? "text-red-700 dark:text-red-300 hover:bg-red-500/20" 
                : "text-amber-700 dark:text-amber-300 hover:bg-amber-500/20"
            }`}
            title="Dismiss notification"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
