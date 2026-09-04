import * as React from "react"
import { VRHeadsetCanvas } from "@/components/3d/VRHeadset"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-900 to-black p-10 text-white lg:flex overflow-hidden border-r border-white/5">
        <VRHeadsetCanvas />
        <div className="relative z-20 flex items-center text-lg font-medium gap-2">
          <img src="https://res.cloudinary.com/dkrvtfbor/image/upload/v1787831608/Horizontal_White_V2_xsxcfs.png" alt="SafeVitals XR" className="h-8 w-auto object-contain" />
        </div>
        <div className="relative z-20 mt-auto bg-black/40 p-4 rounded-lg backdrop-blur-sm border border-white/10 w-fit">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;The modern command center for managing our entire workforce, keeping everyone safe, aligned, and productive.&rdquo;
            </p>
            <footer className="text-sm text-blue-400">Safe Vitals Inc.</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8 flex w-full flex-col justify-center min-h-[100dvh]">
        {children}
      </div>
    </div>
  )
}
