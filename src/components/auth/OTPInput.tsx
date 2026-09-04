"use client"

import * as React from "react"
import { Input } from "@/components/ui/Input"

interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function OTPInput({ length = 6, value, onChange, disabled }: OTPInputProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value
    if (!/^\d*$/.test(val)) return // Only allow digits

    // If typing a single character
    if (val.length <= 1) {
      const newValue = value.split("")
      newValue[index] = val
      onChange(newValue.join("").slice(0, length))

      // Auto-advance
      if (val !== "" && index < length - 1) {
        inputRefs.current[index + 1]?.focus()
      }
    } else {
      // Handle paste
      const pasted = val.slice(0, length).replace(/[^\d]/g, "")
      onChange(pasted)
      if (pasted.length > 0) {
        const nextIndex = Math.min(index + pasted.length, length - 1)
        inputRefs.current[nextIndex]?.focus()
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        // Move focus back if empty
        inputRefs.current[index - 1]?.focus()
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/[^\d]/g, "").slice(0, length)
    onChange(pasted)
    if (pasted.length > 0) {
      const nextIndex = Math.min(pasted.length, length - 1)
      inputRefs.current[nextIndex]?.focus()
    }
  }

  return (
    <div className="flex gap-2 justify-between max-w-[350px] mx-auto">
      {Array.from({ length }).map((_, index) => (
        <Input
          key={index}
          ref={(el) => { inputRefs.current[index] = el }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={length} // Allow pasting long strings into a single input
          className="w-12 h-14 text-center text-lg font-semibold"
          value={value[index] || ""}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          disabled={disabled}
        />
      ))}
    </div>
  )
}
