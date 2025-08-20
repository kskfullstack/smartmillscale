"use client"

import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  }

  return (
    <div className={cn("relative", className)}>
      <div className={cn(
        "animate-spin rounded-full border-2 border-emerald-200 dark:border-emerald-800",
        sizeClasses[size]
      )}>
        <div className={cn(
          "absolute top-0 left-0 rounded-full border-2 border-transparent border-t-emerald-600 dark:border-t-emerald-400",
          sizeClasses[size]
        )}></div>
      </div>
    </div>
  )
}

export function PulsingDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex space-x-1", className)}>
      <div className="w-2 h-2 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-pulse"></div>
      <div className="w-2 h-2 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-pulse delay-75"></div>
      <div className="w-2 h-2 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-pulse delay-150"></div>
    </div>
  )
}